package fi.bookish.creations.arojen.tarinat.analytics

import android.util.Log
import fi.bookish.creations.arojen.tarinat.BuildConfig
import fi.bookish.creations.arojen.tarinat.data.AnalyticsConsent
import fi.bookish.creations.arojen.tarinat.data.SettingsRepository
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import java.io.File
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

/** An event waiting to be sent, with everything its database row needs. */
@Serializable
internal data class StoredEvent(
    val name: String,
    val payload: JsonObject,
    val clientId: String,
    val sessionId: String,
    val appVersion: String,
)

/**
 * Anonymous usage analytics for the client's Supabase project (the original
 * game's analytics_events table), now with platform "android".
 *
 * Consent is a hard gate, as in the original: before the player says yes,
 * nothing is recorded, not even locally. Events wait in a small file buffer
 * (they survive the app being closed) and go out in batches every
 * [FLUSH_INTERVAL_MS] while the game is open and whenever it goes to the
 * background. A batch the database refuses is dropped instead of retried
 * forever, so one bad row can never block everything after it; a batch that
 * fails on the network stays for the next try.
 */
class Analytics(
    private val settings: SettingsRepository,
    private val uploader: AnalyticsUploader?,
    private val bufferFile: File,
    private val scope: CoroutineScope,
    private val clock: () -> Long = System::currentTimeMillis,
    private val io: CoroutineDispatcher = Dispatchers.IO,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val mutex = Mutex()
    // "2.0.0", or "2.0.0-dev" / "2.0.0-preview" from test builds, so their rows are easy to leave out.
    private val appVersion = BuildConfig.VERSION_NAME.take(20)

    private var consented = false
    private var foreground = false
    private var session: Session? = null
    private var flushLoop: Job? = null
    private val firstsThisRun = mutableSetOf<Events.Onboarding>()

    private class Session(val id: String, val clientId: String, val startedAt: Long) {
        var turns = 0
    }

    init {
        scope.launch {
            settings.settings.map { it.analyticsConsent }.distinctUntilChanged().collect { consent ->
                mutex.withLock {
                    consented = consent == AnalyticsConsent.GRANTED
                    if (consented) {
                        if (foreground) startSessionLocked()
                    } else {
                        session = null
                        flushLoop?.cancel()
                        // Withdrawing consent removes what was kept locally, as the original did.
                        if (consent == AnalyticsConsent.DENIED) {
                            withIo { bufferFile.delete() }
                            settings.forgetAnalyticsDays()
                        }
                    }
                }
            }
        }
    }

    fun onForeground() {
        scope.launch {
            mutex.withLock {
                foreground = true
                if (consented) startSessionLocked()
            }
        }
    }

    fun onBackground() {
        scope.launch {
            mutex.withLock {
                foreground = false
                session?.let { s ->
                    appendLocked(listOf(Events.sessionEnd(s.id, clock() - s.startedAt, s.turns)))
                }
                session = null
                flushLoop?.cancel()
            }
            flush()
        }
    }

    /** Records [events] if the player agreed to analytics; otherwise nothing at all happens. */
    fun track(vararg events: AnalyticsEvent) = track(events.asList())

    fun track(events: List<AnalyticsEvent>) {
        if (events.isEmpty()) return
        scope.launch { mutex.withLock { if (consented && session != null) appendLocked(events) } }
    }

    /** Onboarding steps that count once per run of the app (first battle, first building). */
    fun trackFirst(step: Events.Onboarding) {
        scope.launch {
            mutex.withLock {
                if (!consented || session == null || !firstsThisRun.add(step)) return@withLock
                appendLocked(listOf(Events.onboarding(step)))
            }
        }
    }

    /** A turn ended; session_end reports how many. */
    fun noteTurnCompleted() {
        scope.launch { mutex.withLock { session?.let { it.turns++ } } }
    }

    val turnsThisSession: Int get() = session?.turns ?: 0

    private suspend fun startSessionLocked() {
        if (session != null) return
        val today = LocalDate.now()
        val identity = settings.recordAnalyticsOpen(today.toString()) { UUID.randomUUID().toString() }
        val days = ChronoUnit.DAYS.between(LocalDate.parse(identity.firstOpenDate), today).toInt().coerceAtLeast(0)
        val s = Session(UUID.randomUUID().toString(), identity.clientId, clock())
        session = s
        appendLocked(listOf(Events.sessionStart(identity.clientId, s.id, days, identity.isNewPlayer)))
        flushLoop?.cancel()
        flushLoop = scope.launch {
            while (isActive) {
                delay(FLUSH_INTERVAL_MS)
                flush()
            }
        }
    }

    private suspend fun appendLocked(events: List<AnalyticsEvent>) {
        val s = session ?: return
        val stored = events.filter { it.name in Events.ALLOWED }.map { StoredEvent(it.name, it.payload, s.clientId, s.id, appVersion) }
        withIo {
            val all = (readBuffer() + stored).takeLast(MAX_BUFFERED_EVENTS)
            writeBuffer(all)
        }
    }

    /** Sends what is waiting, batch by batch, until the buffer is empty or a batch cannot go out. */
    suspend fun flush() {
        val upload = uploader ?: return
        while (true) {
            val batch = mutex.withLock { if (consented) withIo { readBuffer().take(FLUSH_BATCH_SIZE) } else emptyList() }
            if (batch.isEmpty()) return
            val result = upload.insert(batch.map(::row))
            if (BuildConfig.DEBUG) Log.d(TAG, "${batch.size} events: $result (${batch.joinToString { it.name }})")
            when (result) {
                AnalyticsUploader.Result.SENT, AnalyticsUploader.Result.REFUSED ->
                    mutex.withLock { withIo { writeBuffer(readBuffer().drop(batch.size)) } }
                AnalyticsUploader.Result.FAILED -> return
            }
        }
    }

    private fun row(e: StoredEvent) = AnalyticsRow(
        clientId = e.clientId,
        sessionId = e.sessionId,
        eventName = e.name,
        payload = e.payload,
        platform = PLATFORM,
        appVersion = e.appVersion,
    )

    private fun readBuffer(): List<StoredEvent> =
        runCatching { json.decodeFromString(ListSerializer(StoredEvent.serializer()), bufferFile.readText()) }.getOrDefault(emptyList())

    private fun writeBuffer(events: List<StoredEvent>) {
        runCatching {
            if (events.isEmpty()) {
                bufferFile.delete()
                return
            }
            val tmp = File(bufferFile.parentFile, bufferFile.name + ".tmp")
            tmp.writeText(json.encodeToString(ListSerializer(StoredEvent.serializer()), events))
            if (!tmp.renameTo(bufferFile)) {
                bufferFile.delete()
                tmp.renameTo(bufferFile)
            }
        }
    }

    private suspend fun <T> withIo(block: () -> T): T = withContext(io) { block() }

    companion object {
        private const val TAG = "Analytics"
        const val PLATFORM = "android"
        const val MAX_BUFFERED_EVENTS = 300
        const val FLUSH_BATCH_SIZE = 25
        const val FLUSH_INTERVAL_MS = 20_000L
    }
}
