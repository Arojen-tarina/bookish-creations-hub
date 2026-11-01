package fi.bookish.creations.arojen.tarinat

import android.app.Application
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import fi.bookish.creations.arojen.tarinat.account.Account
import fi.bookish.creations.arojen.tarinat.ads.Ads
import fi.bookish.creations.arojen.tarinat.analytics.Analytics
import fi.bookish.creations.arojen.tarinat.analytics.Events
import fi.bookish.creations.arojen.tarinat.analytics.SupabaseAnalyticsUploader
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import fi.bookish.creations.arojen.tarinat.billing.Premium
import fi.bookish.creations.arojen.tarinat.billing.SupabasePremiumVerifier
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.data.AnalyticsConsent
import fi.bookish.creations.arojen.tarinat.data.LegacyWebImport
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.data.SettingsRepository
import fi.bookish.creations.arojen.tarinat.firebase.AppFirebase
import fi.bookish.creations.arojen.tarinat.moose.MooseGuide
import fi.bookish.creations.arojen.tarinat.moose.MooseRemote
import fi.bookish.creations.arojen.tarinat.multiplayer.Multiplayer
import fi.bookish.creations.arojen.tarinat.multiplayer.MultiplayerService
import fi.bookish.creations.arojen.tarinat.play.AppUpdates
import fi.bookish.creations.arojen.tarinat.play.ReviewPrompt
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import java.io.File

/** App-wide singletons. Kept by hand: the graph is small enough not to need a DI framework. */
class AppContainer(app: Application) {
    /** Lives as long as the process; for work that must outlive a screen (saves, analytics). */
    val appScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val supabaseUrl = BuildConfig.SUPABASE_URL.takeIf { it.isNotEmpty() }
    val saves = SaveRepository(File(app.filesDir, "saves"))
    val settings = SettingsRepository(app, appScope)
    val achievements = AchievementRepository(app, appScope)
    val legacyImport = LegacyWebImport(app, settings, achievements)
    val music = GameMusic(app, settings.settings, appScope)
    val premium = Premium(app, appScope, supabaseUrl?.let { SupabasePremiumVerifier(it, BuildConfig.SUPABASE_KEY) })
    val ads = Ads(app, music, premium.active, appScope)
    val updates = AppUpdates(app)
    val review = ReviewPrompt(app)
    val firebase = AppFirebase(app)
    val analytics = Analytics(
        settings = settings,
        uploader = supabaseUrl?.let { SupabaseAnalyticsUploader(it, BuildConfig.SUPABASE_KEY) },
        bufferFile = File(app.filesDir, "analytics_buffer.json"),
        scope = appScope,
        forward = firebase::log,
    )
    private val online = supabaseUrl?.let { MultiplayerService(it, BuildConfig.SUPABASE_KEY) }

    /** Online play; null when the build has no Supabase project. */
    val multiplayer = online?.let { Multiplayer(app, it, appScope) }

    /** The player's account (guest, Google or email) and cloud copy of the progress; null without Supabase. */
    val account = online?.let { Account(it.client, achievements, saves, appScope) }
    val moose = MooseGuide(
        assets = app.assets,
        remote = supabaseUrl?.let { MooseRemote(it, BuildConfig.SUPABASE_KEY) },
        scope = appScope,
    )

    init {
        appScope.launch {
            achievements.newlyUnlocked.collect { (def, stats) -> analytics.track(Events.achievementUnlocked(def, stats.distinctPlayDays)) }
        }
        premium.onPurchased = { analytics.track(Events.premiumPurchased()) }
        firebase.start()
        // Google Analytics and in-app message targeting follow the same choice as the game's own analytics.
        appScope.launch {
            settings.settings.map { it.analyticsConsent }.distinctUntilChanged().collect { firebase.setAnalyticsConsent(it == AnalyticsConsent.GRANTED) }
        }
    }
}

class ArojenApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        // The whole app, not one screen: a language switch recreating the activity is not a new session.
        ProcessLifecycleOwner.get().lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onStart(owner: LifecycleOwner) {
                container.music.onForeground()
                container.analytics.onForeground()
            }

            override fun onStop(owner: LifecycleOwner) {
                container.music.onBackground()
                container.analytics.onBackground()
                container.account?.backupSoon()
            }
        })
    }
}
