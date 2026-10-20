package fi.bookish.creations.arojen.tarinat

import android.app.Application
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import fi.bookish.creations.arojen.tarinat.ads.Ads
import fi.bookish.creations.arojen.tarinat.analytics.Analytics
import fi.bookish.creations.arojen.tarinat.analytics.Events
import fi.bookish.creations.arojen.tarinat.analytics.SupabaseAnalyticsUploader
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.data.LegacyWebImport
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.data.SettingsRepository
import fi.bookish.creations.arojen.tarinat.moose.MooseGuide
import fi.bookish.creations.arojen.tarinat.moose.MooseRemote
import fi.bookish.creations.arojen.tarinat.play.AppUpdates
import fi.bookish.creations.arojen.tarinat.play.ReviewPrompt
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
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
    val ads = Ads(app, music, appScope)
    val updates = AppUpdates(app)
    val review = ReviewPrompt(app)
    val analytics = Analytics(
        settings = settings,
        uploader = supabaseUrl?.let { SupabaseAnalyticsUploader(it, BuildConfig.SUPABASE_KEY) },
        bufferFile = File(app.filesDir, "analytics_buffer.json"),
        scope = appScope,
    )
    val moose = MooseGuide(
        assets = app.assets,
        remote = supabaseUrl?.let { MooseRemote(it, BuildConfig.SUPABASE_KEY) },
        scope = appScope,
    )

    init {
        appScope.launch {
            achievements.newlyUnlocked.collect { (def, stats) -> analytics.track(Events.achievementUnlocked(def, stats.distinctPlayDays)) }
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
            }
        })
    }
}
