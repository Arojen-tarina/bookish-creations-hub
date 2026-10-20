package fi.bookish.creations.arojen.tarinat.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.floatPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

/** Whether the player agreed to anonymous usage analytics (GDPR opt-in; nothing is sent until GRANTED). */
enum class AnalyticsConsent { UNDECIDED, GRANTED, DENIED }

data class Settings(
    /** 0..1 */
    val musicVolume: Float = DEFAULT_MUSIC_VOLUME,
    val musicMuted: Boolean = false,
    val analyticsConsent: AnalyticsConsent = AnalyticsConsent.UNDECIDED,
) {
    companion object {
        const val DEFAULT_MUSIC_VOLUME = 0.5f
    }
}

private val Context.settingsStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

/** Player preferences. The language is not stored here: Android keeps the per-app locale itself. */
class SettingsRepository(context: Context, scope: CoroutineScope) {
    private val store = context.applicationContext.settingsStore

    val settings: StateFlow<Settings> = store.data
        .map { p ->
            Settings(
                musicVolume = p[MUSIC_VOLUME] ?: Settings.DEFAULT_MUSIC_VOLUME,
                musicMuted = p[MUSIC_MUTED] ?: false,
                analyticsConsent = p[ANALYTICS]?.let { runCatching { AnalyticsConsent.valueOf(it) }.getOrNull() } ?: AnalyticsConsent.UNDECIDED,
            )
        }
        .stateIn(scope, SharingStarted.Eagerly, Settings())

    suspend fun setMusicVolume(volume: Float) = store.edit { it[MUSIC_VOLUME] = volume.coerceIn(0f, 1f) }
    suspend fun setMusicMuted(muted: Boolean) = store.edit { it[MUSIC_MUTED] = muted }
    suspend fun setAnalyticsConsent(consent: AnalyticsConsent) = store.edit { it[ANALYTICS] = consent.name }

    /**
     * Records that the game was opened [today] (yyyy-MM-dd) under analytics: the
     * anonymous client id (created on first use), the first-open day and the set
     * of active days, as the original's retention.ts kept them.
     */
    suspend fun recordAnalyticsOpen(today: String, newClientId: () -> String): AnalyticsIdentity {
        var identity: AnalyticsIdentity? = null
        store.edit { p ->
            val clientId = p[ANALYTICS_CLIENT_ID] ?: newClientId().also { p[ANALYTICS_CLIENT_ID] = it }
            val firstOpen = p[ANALYTICS_FIRST_OPEN]
            if (firstOpen == null) p[ANALYTICS_FIRST_OPEN] = today
            val days = (p[ANALYTICS_ACTIVE_DAYS].orEmpty() + today).sorted().takeLast(MAX_ACTIVE_DAYS).toSet()
            p[ANALYTICS_ACTIVE_DAYS] = days
            identity = AnalyticsIdentity(clientId, firstOpen ?: today, isNewPlayer = firstOpen == null)
        }
        return identity!!
    }

    /** Withdrawn consent: the locally kept usage history goes too (the original did the same). */
    suspend fun forgetAnalyticsDays() {
        store.edit { it.remove(ANALYTICS_ACTIVE_DAYS) }
    }

    suspend fun legacyImportDone(): Boolean = store.data.first()[LEGACY_IMPORT_DONE] == true

    suspend fun markLegacyImportDone() {
        store.edit { it[LEGACY_IMPORT_DONE] = true }
    }

    /**
     * Takes over the old WebView version's settings and anonymous analytics
     * identity (client id, first open, active days: the analytics client keeps
     * reporting the same player), then marks the import done.
     */
    suspend fun importLegacy(data: LegacyWebData) {
        store.edit { p ->
            data.musicVolume?.let { p[MUSIC_VOLUME] = it }
            data.musicMuted?.let { p[MUSIC_MUTED] = it }
            data.analyticsConsent?.let { p[ANALYTICS] = it.name }
            data.analyticsClientId?.let { p[ANALYTICS_CLIENT_ID] = it }
            data.firstOpenDate?.let { p[ANALYTICS_FIRST_OPEN] = it }
            if (data.activeDays.isNotEmpty()) p[ANALYTICS_ACTIVE_DAYS] = data.activeDays
            p[LEGACY_IMPORT_DONE] = true
        }
    }

    private companion object {
        val MUSIC_VOLUME = floatPreferencesKey("music_volume")
        val MUSIC_MUTED = booleanPreferencesKey("music_muted")
        val ANALYTICS = stringPreferencesKey("analytics_consent")
        val ANALYTICS_CLIENT_ID = stringPreferencesKey("analytics_client_id")
        val ANALYTICS_FIRST_OPEN = stringPreferencesKey("analytics_first_open")
        val ANALYTICS_ACTIVE_DAYS = stringSetPreferencesKey("analytics_active_days")
        val LEGACY_IMPORT_DONE = booleanPreferencesKey("legacy_import_done")

        /** As the original's retention.ts (MAX_DAYS_STORED). */
        const val MAX_ACTIVE_DAYS = 400
    }
}

/** The anonymous analytics identity of this install. */
data class AnalyticsIdentity(val clientId: String, val firstOpenDate: String, val isNewPlayer: Boolean)
