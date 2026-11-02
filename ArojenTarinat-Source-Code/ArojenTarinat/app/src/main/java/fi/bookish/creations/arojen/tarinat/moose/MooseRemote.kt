package fi.bookish.creations.arojen.tarinat.moose

import fi.bookish.creations.arojen.tarinat.network.supabasePost
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.IOException

/**
 * The original game's "moose-chat" Supabase function, which answers with an LLM
 * in the player's language. Used when the local answers have nothing to say.
 */
class MooseRemote(private val baseUrl: String, private val apiKey: String) {

    @Serializable
    data class Turn(val role: String, val content: String)

    @Serializable
    private data class Request(val message: String, val lang: String, val history: List<Turn>)

    @Serializable
    private data class Response(val reply: String? = null)

    private val json = Json { ignoreUnknownKeys = true }

    // The app shows vector icons only; the model likes to add emoji to its replies.
    private val emoji = Regex("""[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}\x{200D}]""")

    private fun withoutEmoji(text: String) = emoji.replace(text, "").replace(Regex(" {2,}"), " ").trim()

    /** The reply, or null when the function cannot be reached or has nothing to say. */
    suspend fun reply(message: String, language: String, history: List<Turn>): String? = withContext(Dispatchers.IO) {
        val requestBody = json.encodeToString(Request(message, language, history)).toByteArray()
        try {
            supabasePost("$baseUrl/functions/v1/moose-chat", apiKey, requestBody, readTimeoutMs = 25_000) { connection ->
                if (connection.responseCode !in 200..299) return@supabasePost null
                val body = connection.inputStream.bufferedReader().use { it.readText() }
                json.decodeFromString<Response>(body).reply?.let(::withoutEmoji)?.takeIf { it.isNotEmpty() }
            }
        } catch (_: IOException) {
            null
        } catch (_: IllegalArgumentException) {
            // Malformed reply body.
            null
        }
    }
}
