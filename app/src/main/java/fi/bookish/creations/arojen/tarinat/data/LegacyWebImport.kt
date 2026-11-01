package fi.bookish.creations.arojen.tarinat.data

import android.annotation.SuppressLint
import android.content.Context
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.ui.components.assetLanguage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.floatOrNull
import kotlinx.serialization.json.longOrNull
import java.io.ByteArrayInputStream
import java.io.File
import java.util.Locale
import kotlin.coroutines.resume

/**
 * What the old WebView version of the game kept in localStorage. Checksummed
 * values that failed their check are already dropped by the reading script.
 */
data class LegacyWebData(
    /** One of the game's language codes, e.g. "fi". */
    val language: String? = null,
    val musicVolume: Float? = null,
    val musicMuted: Boolean? = null,
    val stats: PlayerStats? = null,
    /** Achievement id -> unlock time (epoch millis), from the web fallback store. */
    val unlocks: Map<String, Long> = emptyMap(),
    val analyticsConsent: AnalyticsConsent? = null,
    val analyticsClientId: String? = null,
    /** yyyy-MM-dd */
    val firstOpenDate: String? = null,
    val activeDays: Set<String> = emptySet(),
) {
    companion object {
        private val json = Json { ignoreUnknownKeys = true }

        /** The old game's default master volume; music played at master * music volume. */
        private const val OLD_MASTER_DEFAULT = 0.7f

        /** Parses the JSON that assets/legacy/read-web-storage.js returns. */
        fun parse(text: String): LegacyWebData {
            val root = runCatching { json.parseToJsonElement(text) as? JsonObject }.getOrNull() ?: return LegacyWebData()
            fun string(key: String) = (root[key] as? JsonPrimitive)?.takeIf { it.isString }?.content?.takeIf { it.isNotBlank() }

            val audio = root["audio"] as? JsonObject
            fun audioNumber(key: String) = (audio?.get(key) as? JsonPrimitive)?.floatOrNull
            val master = audioNumber("masterVolume")
            val music = audioNumber("musicVolume")

            return LegacyWebData(
                language = string("language"),
                // Scaled so the old defaults (0.7 x 0.5) land on this app's default of 0.5.
                musicVolume = if (master != null && music != null) (master * music / OLD_MASTER_DEFAULT).coerceIn(0f, 1f) else null,
                musicMuted = (audio?.get("muted") as? JsonPrimitive)?.content?.toBooleanStrictOrNull(),
                stats = (root["stats"] as? JsonObject)?.let { runCatching { json.decodeFromJsonElement(PlayerStats.serializer(), it) }.getOrNull() },
                unlocks = (root["achievements"] as? JsonObject).orEmpty()
                    .mapNotNull { (id, at) -> (at as? JsonPrimitive)?.longOrNull?.let { id to it } }
                    .toMap(),
                analyticsConsent = when (string("consent")) {
                    "granted" -> AnalyticsConsent.GRANTED
                    "denied" -> AnalyticsConsent.DENIED
                    else -> null
                },
                analyticsClientId = string("clientId"),
                firstOpenDate = string("firstOpen"),
                activeDays = (root["days"] as? JsonArray).orEmpty()
                    .mapNotNull { (it as? JsonPrimitive)?.takeIf { day -> day.isString }?.content }
                    .toSet(),
            )
        }
    }
}

/** Runs scripts in a hidden WebView on the old app's origin, where its localStorage lives. */
internal object LegacyWebReader {
    /** Capacitor served the old game from https://localhost; localStorage is kept per origin. */
    private const val ORIGIN = "https://localhost/"
    private const val SCRIPT_ASSET = "legacy/read-web-storage.js"
    private const val TIMEOUT_MS = 10_000L
    private val PAGE = "<!doctype html><title>import</title>".toByteArray()

    /** Everything the old version stored, or null when no WebView can be created right now. */
    suspend fun read(context: Context): LegacyWebData? {
        val script = withContext(Dispatchers.IO) {
            context.assets.open(SCRIPT_ASSET).bufferedReader().use { it.readText() }
        }
        val result = evaluate(context, script) ?: return null
        // The script returns a string, which evaluateJavascript hands back JSON-encoded.
        val text = runCatching { Json.decodeFromString<String?>(result) }.getOrNull()
        return text?.let(LegacyWebData::parse) ?: LegacyWebData()
    }

    /**
     * The JSON-encoded value of [script], "null" if the page did not answer in
     * time, or null when the WebView is missing (e.g. being updated).
     */
    // The page is a local stub served by shouldInterceptRequest, and the only script is ours.
    @SuppressLint("SetJavaScriptEnabled")
    suspend fun evaluate(context: Context, script: String): String? = withContext(Dispatchers.Main) {
        val webView = try {
            WebView(context.applicationContext)
        } catch (_: RuntimeException) {
            return@withContext null
        }
        try {
            webView.settings.javaScriptEnabled = true
            webView.settings.domStorageEnabled = true
            withTimeoutOrNull(TIMEOUT_MS) {
                suspendCancellableCoroutine { continuation ->
                    webView.webViewClient = object : WebViewClient() {
                        override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest) =
                            WebResourceResponse("text/html", "utf-8", ByteArrayInputStream(PAGE))

                        override fun onPageFinished(view: WebView, url: String) {
                            view.evaluateJavascript(script) { value -> if (continuation.isActive) continuation.resume(value) }
                        }
                    }
                    webView.loadUrl(ORIGIN)
                }
            } ?: "null"
        } finally {
            webView.destroy()
        }
    }
}

/**
 * One-time import for players updating from the old WebView version: lifetime
 * stats (achievement progress), achievements unlocked through the web store,
 * language, music settings and the anonymous analytics identity. Achievements
 * kept by the old native plugin need no import (see [AchievementRepository]).
 *
 * Campaigns in progress are not carried over: the old saves describe the
 * original web game's model, not this engine's.
 */
class LegacyWebImport(
    context: Context,
    private val settings: SettingsRepository,
    private val achievements: AchievementRepository,
) {
    private val context = context.applicationContext

    /** Call after [AchievementRepository.load]. Does nothing after the first successful run. */
    suspend fun runOnce() {
        if (settings.legacyImportDone()) return
        // Fresh installs never had the old WebView data: skip starting a WebView at all.
        if (!File(context.dataDir, "app_webview").exists()) return settings.markLegacyImportDone()
        // No WebView right now (it may be updating): try again next launch.
        val data = LegacyWebReader.read(context) ?: return
        achievements.importLegacy(data.stats, data.unlocks)
        settings.importLegacy(data)
        // Last, because changing the language recreates the screen.
        data.language?.takeIf { assetLanguage(it) == it }?.let { applyLanguage(it) }
    }

    /** Keeps a language the player picked in the old game, unless they already chose one here. */
    private suspend fun applyLanguage(language: String) = withContext(Dispatchers.Main) {
        val phone = Locale.getDefault().language.let { if (it == "in") "id" else it }
        if (AppCompatDelegate.getApplicationLocales().isEmpty && language != phone) {
            AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(language))
        }
    }
}
