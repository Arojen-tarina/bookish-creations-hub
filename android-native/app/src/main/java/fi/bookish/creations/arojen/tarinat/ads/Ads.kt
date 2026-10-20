package fi.bookish.creations.arojen.tarinat.ads

import android.app.Activity
import android.app.Application
import android.content.Context
import androidx.core.content.edit
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAd
import com.google.android.gms.ads.rewardedinterstitial.RewardedInterstitialAdLoadCallback
import com.google.android.ump.ConsentInformation
import com.google.android.ump.ConsentRequestParameters
import com.google.android.ump.UserMessagingPlatform
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull
import java.util.concurrent.atomic.AtomicBoolean

/**
 * AdMob for the whole app: Google's consent form (GDPR and US states) on every
 * launch, then the SDK, then one interstitial, one tribute (rewarded) ad and,
 * for returning players, one app-open ad kept loaded. [AdPacing] decides when
 * full-screen ads may appear; the game music pauses while one is on screen.
 * Everything runs on the main thread.
 */
class Ads(
    private val app: Application,
    private val music: GameMusic,
    scope: CoroutineScope,
    private val clock: () -> Long = System::currentTimeMillis,
) {
    private val main = CoroutineScope(scope.coroutineContext + Dispatchers.Main.immediate)
    private val consent = UserMessagingPlatform.getConsentInformation(app)
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private val pacing = AdPacing(clock)
    private val createdAt = clock()
    private val started = AtomicBoolean(false)

    private val _ready = MutableStateFlow(false)

    /** The SDK is running and the player's consent allows ads. */
    val ready: StateFlow<Boolean> = _ready.asStateFlow()

    private val _consentFlowDone = MutableStateFlow(false)

    /** Google's consent check of this launch is over (its form, if any, has closed); other prompts may follow. */
    val consentFlowDone: StateFlow<Boolean> = _consentFlowDone.asStateFlow()

    private val _privacyOptionsRequired = MutableStateFlow(false)

    /** The player's region requires a way back to the consent choices (shown in Settings). */
    val privacyOptionsRequired: StateFlow<Boolean> = _privacyOptionsRequired.asStateFlow()

    private val _rewardReady = MutableStateFlow(false)

    /** A tribute ad is loaded and can be offered. */
    val rewardReady: StateFlow<Boolean> = _rewardReady.asStateFlow()

    private val _fullScreen = MutableStateFlow(false)

    /** A full-screen ad covers the game right now. */
    val fullScreenShowing: StateFlow<Boolean> = _fullScreen.asStateFlow()

    private var interstitial: Loaded<InterstitialAd>? = null
    private var reward: Loaded<RewardedInterstitialAd>? = null
    private val appOpen = MutableStateFlow<Loaded<AppOpenAd>?>(null)
    private var loadingInterstitial = false
    private var loadingReward = false

    /** Counted per process start; the app-open ad waits for returning players. */
    private val appOpenDue: Boolean
    private var coldStartPending = true

    private class Loaded<T>(val ad: T, val at: Long)

    init {
        val launches = prefs.getInt(KEY_LAUNCHES, 0) + 1
        prefs.edit { putInt(KEY_LAUNCHES, launches) }
        appOpenDue = AdPacing.appOpenDue(launches, prefs.getLong(KEY_APP_OPEN_AT, 0L), clock())
    }

    /** Call from the activity on every launch: refreshes consent (the form appears when required), then starts the SDK. */
    fun start(activity: Activity) {
        consent.requestConsentInfoUpdate(
            activity,
            ConsentRequestParameters.Builder().build(),
            {
                UserMessagingPlatform.loadAndShowConsentFormIfRequired(activity) {
                    updatePrivacyOptions()
                    _consentFlowDone.value = true
                    initialize()
                }
            },
            {
                _consentFlowDone.value = true
                initialize()
            },
        )
        // Consent given in an earlier session already allows ads: no need to wait for the refresh.
        initialize()
    }

    /** Google's form for changing the consent choices (Settings, when [privacyOptionsRequired]). */
    fun showPrivacyOptions(activity: Activity) {
        UserMessagingPlatform.showPrivacyOptionsForm(activity) { updatePrivacyOptions() }
    }

    private fun updatePrivacyOptions() {
        _privacyOptionsRequired.value =
            consent.privacyOptionsRequirementStatus == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED
    }

    private fun initialize() {
        if (!consent.canRequestAds() || !started.compareAndSet(false, true)) return
        main.launch(Dispatchers.IO) {
            MobileAds.initialize(app) {
                main.launch {
                    _ready.value = true
                    loadInterstitial()
                    loadReward()
                    if (appOpenDue && coldStartPending) loadAppOpen()
                }
            }
        }
    }

    private fun request() = AdRequest.Builder().build()

    private fun retryLater(load: () -> Unit) {
        main.launch {
            delay(RETRY_MS)
            load()
        }
    }

    // ---------- interstitial ----------

    private fun loadInterstitial() {
        if (!_ready.value || interstitial != null || loadingInterstitial) return
        loadingInterstitial = true
        InterstitialAd.load(app, AdUnits.INTERSTITIAL, request(), object : InterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: InterstitialAd) {
                loadingInterstitial = false
                interstitial = Loaded(ad, clock())
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                loadingInterstitial = false
                retryLater(::loadInterstitial)
            }
        })
    }

    /**
     * A natural break: shows an interstitial when [AdPacing] allows one and it is
     * loaded, then runs [then]; otherwise runs [then] straight away.
     */
    fun interstitialBreak(activity: Activity, moment: AdBreak, turn: Int, then: () -> Unit = {}) {
        val loaded = interstitial?.takeIf { clock() - it.at < MAX_AGE_MS }
        if (loaded == null) interstitial = null
        if (loaded == null || _fullScreen.value || !pacing.interstitialDue(moment, turn)) {
            loadInterstitial()
            then()
            return
        }
        interstitial = null
        loaded.ad.fullScreenContentCallback = fullScreenCallback {
            then()
            loadInterstitial()
        }
        loaded.ad.show(activity)
    }

    // ---------- tribute (rewarded) ----------

    private fun loadReward() {
        if (!_ready.value || reward != null || loadingReward) return
        loadingReward = true
        RewardedInterstitialAd.load(app, AdUnits.REWARDED, request(), object : RewardedInterstitialAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedInterstitialAd) {
                loadingReward = false
                reward = Loaded(ad, clock())
                _rewardReady.value = true
            }

            override fun onAdFailedToLoad(error: LoadAdError) {
                loadingReward = false
                retryLater(::loadReward)
            }
        })
    }

    /**
     * Shows the tribute ad the player asked for. [onEarned] runs after the ad
     * closes, only if it was watched to the reward. False when none is loaded.
     */
    fun showReward(activity: Activity, onEarned: () -> Unit): Boolean {
        val loaded = reward?.takeIf { clock() - it.at < MAX_AGE_MS }
        reward = null
        _rewardReady.value = false
        if (loaded == null || _fullScreen.value) {
            loadReward()
            return false
        }
        var earned = false
        loaded.ad.fullScreenContentCallback = fullScreenCallback {
            if (earned) onEarned()
            loadReward()
        }
        loaded.ad.show(activity) { earned = true }
        return true
    }

    // ---------- app open ----------

    private fun loadAppOpen() {
        AppOpenAd.load(app, AdUnits.APP_OPEN, request(), object : AppOpenAd.AppOpenAdLoadCallback() {
            override fun onAdLoaded(ad: AppOpenAd) {
                if (coldStartPending) appOpen.value = Loaded(ad, clock())
            }

            override fun onAdFailedToLoad(error: LoadAdError) = Unit
        })
    }

    /**
     * For the loading screen of a cold start: waits (at most until [APP_OPEN_WAIT_MS]
     * after launch) for the app-open ad when one is due, so it can open the game.
     */
    suspend fun awaitAppOpen() {
        if (!appOpenDue) return
        val left = APP_OPEN_WAIT_MS - (clock() - createdAt)
        if (left > 0) withTimeoutOrNull(left) { appOpen.first { it != null } }
    }

    /** Shows the app-open ad if it arrived in time; never later in the session. */
    fun finishColdStart(activity: Activity) {
        if (!coldStartPending) return
        coldStartPending = false
        val loaded = appOpen.value ?: return
        appOpen.value = null
        if (_fullScreen.value) return
        prefs.edit { putLong(KEY_APP_OPEN_AT, clock()) }
        loaded.ad.fullScreenContentCallback = fullScreenCallback {}
        loaded.ad.show(activity)
    }

    // ---------- shared ----------

    private fun fullScreenCallback(onClosed: () -> Unit) = object : FullScreenContentCallback() {
        override fun onAdShowedFullScreenContent() {
            _fullScreen.value = true
            pacing.onFullScreenShown()
            music.setInterrupted(true)
        }

        override fun onAdDismissedFullScreenContent() = closed()

        override fun onAdFailedToShowFullScreenContent(error: AdError) = closed()

        private fun closed() {
            _fullScreen.value = false
            music.setInterrupted(false)
            onClosed()
        }
    }

    private companion object {
        const val PREFS = "ads"
        const val KEY_LAUNCHES = "launches"
        const val KEY_APP_OPEN_AT = "app_open_shown_at"

        const val RETRY_MS = 60_000L

        /** Google pays for interstitial and rewarded impressions only within an hour of loading. */
        const val MAX_AGE_MS = 55 * 60 * 1000L
        const val APP_OPEN_WAIT_MS = 3_500L
    }
}
