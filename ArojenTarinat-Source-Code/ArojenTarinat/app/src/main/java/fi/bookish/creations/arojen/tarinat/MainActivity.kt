package fi.bookish.creations.arojen.tarinat

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
        if (!storeScreenshots) container.ads.start(this)
        setContent {
            ArojenTarinatTheme {
                AppNavHost()
            }
        }
    }

    override fun onResume() {
        super.onResume()
        container.updates.check(updateLauncher)
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
    }
}
