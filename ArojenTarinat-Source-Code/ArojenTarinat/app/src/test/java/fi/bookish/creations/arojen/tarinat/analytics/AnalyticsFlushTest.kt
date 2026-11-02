package fi.bookish.creations.arojen.tarinat.analytics

import fi.bookish.creations.arojen.tarinat.data.AnalyticsConsent
import fi.bookish.creations.arojen.tarinat.data.AnalyticsIdentity
import fi.bookish.creations.arojen.tarinat.data.AnalyticsSettings
import fi.bookish.creations.arojen.tarinat.data.Settings
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.runCurrent
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.yield
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class AnalyticsFlushTest {
    @get:Rule val tmp = TemporaryFolder()

    private val json = Json { ignoreUnknownKeys = true }

    private class FakeSettings(consent: AnalyticsConsent) : AnalyticsSettings {
        private val state = MutableStateFlow(Settings(analyticsConsent = consent))
        override val settings: StateFlow<Settings> get() = state
        override suspend fun recordAnalyticsOpen(today: String, newClientId: () -> String) =
            AnalyticsIdentity(clientId = "client", firstOpenDate = today, isNewPlayer = false)
        override suspend fun forgetAnalyticsDays() = Unit
    }

    /** The first insert suspends until [release] is completed, so a second flush can start while it is in flight. */
    private class GatedUploader : AnalyticsUploader {
        val entered = CompletableDeferred<Unit>()
        val release = CompletableDeferred<Unit>()
        val uploaded = mutableListOf<String>()
        private var calls = 0

        override suspend fun insert(rows: List<AnalyticsRow>): AnalyticsUploader.Result {
            if (calls++ == 0) {
                entered.complete(Unit)
                release.await()
            }
            uploaded += rows.map { it.eventName }
            return AnalyticsUploader.Result.SENT
        }
    }

    private fun stored(name: String) = StoredEvent(
        name = name,
        payload = JsonObject(emptyMap()),
        clientId = "client",
        sessionId = "session",
        appVersion = "test",
    )

    private fun writeBuffer(file: File, events: List<StoredEvent>) {
        file.writeText(json.encodeToString(ListSerializer(StoredEvent.serializer()), events))
    }

    @Test
    fun `concurrent flushes upload each buffered event exactly once`() = runTest {
        val buffer = File(tmp.root, "analytics-buffer.json")
        val names = listOf("a", "b", "c")
        writeBuffer(buffer, names.map(::stored))

        val uploader = GatedUploader()
        val analytics = Analytics(
            settings = FakeSettings(AnalyticsConsent.GRANTED),
            uploader = uploader,
            bufferFile = buffer,
            scope = backgroundScope,
            io = Dispatchers.Unconfined,
        )
        runCurrent()

        val first = backgroundScope.launch { analytics.flush() }
        uploader.entered.await()

        // Starts while the first batch is still in flight; it must not resend that batch.
        val second = backgroundScope.launch { analytics.flush() }
        repeat(5) { yield() }

        uploader.release.complete(Unit)
        advanceUntilIdle()
        first.join()
        second.join()

        assertEquals(names, uploader.uploaded)
        assertEquals(emptyList<StoredEvent>(), json.decodeFromString(
            ListSerializer(StoredEvent.serializer()),
            if (buffer.exists()) buffer.readText() else "[]",
        ))
    }
}
