package fi.bookish.creations.arojen.tarinat.ads

import fi.bookish.creations.arojen.tarinat.BuildConfig

/**
 * AdMob ad units. Debug and preview builds use Google's sample units, which always
 * fill and never count as real traffic; release builds use the client's units. The
 * app ID lives in the manifest (both set per build type in build.gradle.kts).
 */
object AdUnits {
    private val testAds = BuildConfig.TEST_ADS

    /** "Banneri" #1: main menu and the books. */
    val BANNER_MENU = if (testAds) TEST_BANNER else "ca-app-pub-1848284154496261/3145662729"

    /** "Banneri" #2: the in-game side drawer. */
    val BANNER_GAME = if (testAds) TEST_BANNER else "ca-app-pub-1848284154496261/7765514723"

    val INTERSTITIAL = if (testAds) "ca-app-pub-3940256099942544/1033173712" else "ca-app-pub-1848284154496261/2851107119"

    /** The opt-in tribute (rewarded interstitial format, reward amount 1 in AdMob; the game decides the real reward). */
    val REWARDED = if (testAds) "ca-app-pub-3940256099942544/5354046379" else "ca-app-pub-1848284154496261/2111287813"

    val APP_OPEN = if (testAds) "ca-app-pub-3940256099942544/9257395921" else "ca-app-pub-1848284154496261/8145911802"

    private const val TEST_BANNER = "ca-app-pub-3940256099942544/9214589741"
}
