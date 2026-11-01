package fi.bookish.creations.arojen.tarinat

import android.content.Intent
import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import fi.bookish.creations.arojen.tarinat.navigation.AppNavHost
import fi.bookish.creations.arojen.tarinat.ui.theme.ArojenTarinatTheme

class MainActivity : AppCompatActivity() {
    private val container get() = (application as ArojenApp).container

    /** Play's update dialog; declining it simply leaves the current version running. */
    private val updateLauncher = registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) {}

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        hideSystemBars()
        // Google's consent form (when the player's region needs one), then the ads SDK.
        // Debug builds started with "--ez storeScreenshots true" leave adverts out, for the store screenshots.
        val storeScreenshots = BuildConfig.DEBUG && intent.getBooleanExtra(EXTRA_STORE_SCREENSHOTS, false)
        // Debug builds started with "--ez premium true|false" act as if the subscription were on or off.
        if (BuildConfig.DEBUG && intent.hasExtra(EXTRA_PREMIUM)) container.premium.overrideForDebug(intent.getBooleanExtra(EXTRA_PREMIUM, false))
        if (!storeScreenshots) container.ads.start(this)
        // An invite link goes straight to the game it invites to, without the app-open advert first.
        if (savedInstanceState == null && container.multiplayer?.acceptInviteLink(intent?.dataString) == true) container.ads.skipAppOpen()
        setContent {
            ArojenTarinatTheme {
                AppNavHost()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        container.multiplayer?.acceptInviteLink(intent.dataString)
    }

    override fun onResume() {
        super.onResume()
        container.updates.check(updateLauncher)
        // A subscription bought, renewed or cancelled outside the app shows up here.
        container.premium.refresh()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        // System dialogs (consent forms, ads) can bring the bars back; hide them again.
        if (hasFocus) hideSystemBars()
    }

    /** Full-screen game: bars stay hidden and reappear temporarily on an edge swipe. */
    private fun hideSystemBars() {
        WindowCompat.getInsetsController(window, window.decorView).apply {
            systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            hide(WindowInsetsCompat.Type.systemBars())
        }
    }

    private companion object {
        const val EXTRA_STORE_SCREENSHOTS = "storeScreenshots"
        const val EXTRA_PREMIUM = "premium"
    }
}
