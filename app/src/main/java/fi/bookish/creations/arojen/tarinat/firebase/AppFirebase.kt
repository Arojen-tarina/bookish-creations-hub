package fi.bookish.creations.arojen.tarinat.firebase

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import androidx.core.content.edit
import androidx.core.content.getSystemService
import com.google.firebase.FirebaseApp
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.inappmessaging.FirebaseInAppMessaging
import com.google.firebase.messaging.FirebaseMessaging
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.analytics.AnalyticsEvent
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.longOrNull

/**
 * Firebase for the Play build: Crashlytics (crash reports), Google Analytics,
 * Cloud Messaging (push notifications from the Firebase console) and In-App
 * Messaging. Analytics and in-app message targeting follow the player's usage
 * analytics choice. Debug and preview builds have no Firebase app (their ids are
 * not in google-services.json): everything here is then a no-op.
 */
class AppFirebase(private val app: Application) {
    val available: Boolean = FirebaseApp.getApps(app).isNotEmpty()

    private val analytics: FirebaseAnalytics? = if (available) FirebaseAnalytics.getInstance(app) else null

    /** Creates the notification channel and subscribes this phone to the "all" topic for console campaigns. */
    fun start() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            app.getSystemService<NotificationManager>()?.createNotificationChannel(
                NotificationChannel(CHANNEL_NEWS, app.getString(R.string.notif_channel_news), NotificationManager.IMPORTANCE_DEFAULT).apply {
                    description = app.getString(R.string.notif_channel_news_desc)
                },
            )
        }
        if (available) FirebaseMessaging.getInstance().subscribeToTopic(TOPIC_ALL)
    }

    /** Google Analytics and in-app message targeting only with the player's consent. */
    fun setAnalyticsConsent(granted: Boolean) {
        analytics?.setAnalyticsCollectionEnabled(granted)
        if (available) FirebaseInAppMessaging.getInstance().isAutomaticDataCollectionEnabled = granted
    }

    /** The game's own events, also in Google Analytics (flat values only, as Analytics takes them). */
    fun log(event: AnalyticsEvent) {
        val firebase = analytics ?: return
        // Google Analytics measures sessions itself and reserves these names.
        if (event.name in RESERVED) return
        val params = Bundle()
        for ((key, value) in event.payload.entries.take(MAX_PARAMS)) {
            val p = value as? JsonPrimitive ?: continue
            val name = key.take(MAX_KEY)
            when {
                p.isString -> params.putString(name, p.content.take(MAX_VALUE))
                p.booleanOrNull != null -> params.putLong(name, if (p.booleanOrNull == true) 1 else 0)
                p.longOrNull != null -> params.putLong(name, p.longOrNull ?: 0)
                p.doubleOrNull != null -> params.putDouble(name, p.doubleOrNull ?: 0.0)
            }
        }
        firebase.logEvent(event.name.take(MAX_KEY), params)
    }

    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    /** Android 13+ asks for the notification permission once; this remembers it was asked. */
    var notificationPromptShown: Boolean
        get() = prefs.getBoolean(KEY_PROMPTED, false)
        set(value) = prefs.edit { putBoolean(KEY_PROMPTED, value) }

    /** In-app messages wait while a campaign is on screen; they appear on the menus. */
    fun suppressInAppMessages(suppressed: Boolean) {
        if (available) FirebaseInAppMessaging.getInstance().setMessagesSuppressed(suppressed)
    }

    companion object {
        const val CHANNEL_NEWS = "news"
        private const val TOPIC_ALL = "all"
        private const val PREFS = "firebase"
        private const val KEY_PROMPTED = "notification_prompt_shown"
        private val RESERVED = setOf("session_start", "session_end")
        private const val MAX_PARAMS = 25
        private const val MAX_KEY = 40
        private const val MAX_VALUE = 100
    }
}
