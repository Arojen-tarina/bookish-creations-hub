package fi.bookish.creations.arojen.tarinat.network

import java.net.HttpURLConnection
import java.net.URL

internal const val CONNECT_TIMEOUT_MS = 10_000

/**
 * POSTs [body] to [url] with the project's public anon key, then hands the open
 * connection to [block], which reads the response and decides what it means.
 * Each caller keeps its own error policy: IOException from here propagates to it.
 */
internal inline fun <T> supabasePost(
    url: String,
    apiKey: String,
    body: ByteArray,
    readTimeoutMs: Int,
    extraHeaders: Map<String, String> = emptyMap(),
    block: (HttpURLConnection) -> T,
): T {
    val connection = URL(url).openConnection() as HttpURLConnection
    try {
        connection.requestMethod = "POST"
        connection.connectTimeout = CONNECT_TIMEOUT_MS
        connection.readTimeout = readTimeoutMs
        connection.doOutput = true
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty("apikey", apiKey)
        connection.setRequestProperty("Authorization", "Bearer $apiKey")
        extraHeaders.forEach { (name, value) -> connection.setRequestProperty(name, value) }
        connection.outputStream.use { it.write(body) }
        return block(connection)
    } finally {
        connection.disconnect()
    }
}
