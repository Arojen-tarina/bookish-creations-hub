package fi.bookish.creations.arojen.tarinat.billing

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL

/** Asks the server about one subscription purchase; the app's Premium follows Google's answer when there is one. */
fun interface PremiumVerifier {
    /** True or false when Google answered through the server; null when the server cannot tell (not set up, offline). */
    suspend fun isActive(purchaseToken: String): Boolean?
}

/**
 * The verify-premium Edge Function (supabase/functions/verify-premium): it asks
 * Google Play about the token with the owner's service account, records the
 * subscription in premium_subscriptions and answers whether it is active.
 */
class SupabasePremiumVerifier(private val baseUrl: String, private val apiKey: String) : PremiumVerifier {
    override suspend fun isActive(purchaseToken: String): Boolean? = withContext(Dispatchers.IO) {
        val connection = URL("$baseUrl/functions/v1/verify-premium").openConnection() as HttpURLConnection
        try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 10_000
            connection.readTimeout = 20_000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("apikey", apiKey)
            connection.setRequestProperty("Authorization", "Bearer $apiKey")
            connection.outputStream.use { out ->
                out.write(buildJsonObject { put("purchaseToken", purchaseToken) }.toString().toByteArray())
            }
            if (connection.responseCode != 200) return@withContext null
            val body = Json.parseToJsonElement(connection.inputStream.bufferedReader().use { it.readText() }).jsonObject
            if (body["configured"]?.jsonPrimitive?.booleanOrNull != true) null else body["active"]?.jsonPrimitive?.booleanOrNull
        } catch (_: IOException) {
            null
        } catch (_: SerializationException) {
            null
        } catch (_: IllegalArgumentException) {
            null
        } finally {
            connection.disconnect()
        }
    }
}
