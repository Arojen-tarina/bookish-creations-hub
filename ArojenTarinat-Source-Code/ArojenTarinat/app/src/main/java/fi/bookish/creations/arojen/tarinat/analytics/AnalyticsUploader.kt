package fi.bookish.creations.arojen.tarinat.analytics

import fi.bookish.creations.arojen.tarinat.network.supabasePost
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import java.io.IOException

/**
 * One row of the analytics_events table (see the original's supabase/migrations).
 * There is no created_at: the database stamps each row with its own clock. The
 * original sent the phone's time, and phones with a wrong date wrote rows weeks
 * into the future, which skews the daily and retention views.
 */
@Serializable
data class AnalyticsRow(
    @SerialName("client_id") val clientId: String,
    @SerialName("session_id") val sessionId: String,
    @SerialName("event_name") val eventName: String,
    val payload: JsonObject,
    val platform: String,
    @SerialName("app_version") val appVersion: String,
)

/** Sends analytics rows somewhere; the app uses [SupabaseAnalyticsUploader]. */
fun interface AnalyticsUploader {
    enum class Result {
        SENT,

        /** The server will never take these rows (e.g. a constraint): drop them. */
        REFUSED,

        /** Network trouble or a server error: try again later. */
        FAILED,
    }

    suspend fun insert(rows: List<AnalyticsRow>): Result
}

/**
 * Inserts rows through Supabase's REST API with the project's public anon key.
 * The table's row-level security lets that key append rows and nothing else.
 */
class SupabaseAnalyticsUploader(private val baseUrl: String, private val apiKey: String) : AnalyticsUploader {
    private val json = Json { encodeDefaults = true }

    override suspend fun insert(rows: List<AnalyticsRow>): AnalyticsUploader.Result = withContext(Dispatchers.IO) {
        val requestBody = json.encodeToString(ListSerializer(AnalyticsRow.serializer()), rows).toByteArray()
        try {
            supabasePost(
                "$baseUrl/rest/v1/analytics_events",
                apiKey,
                requestBody,
                readTimeoutMs = 20_000,
                extraHeaders = mapOf("Prefer" to "return=minimal"),
            ) { connection ->
                when (connection.responseCode) {
                    in 200..299 -> AnalyticsUploader.Result.SENT
                    // Rate limits and timeouts may pass; anything else in 4xx is about the rows themselves.
                    408, 429 -> AnalyticsUploader.Result.FAILED
                    in 400..499 -> AnalyticsUploader.Result.REFUSED
                    else -> AnalyticsUploader.Result.FAILED
                }
            }
        } catch (_: IOException) {
            AnalyticsUploader.Result.FAILED
        }
    }
}
