package fi.bookish.creations.arojen.tarinat.ads

/** The natural breaks where a full-screen ad may appear. */
enum class AdBreak {
    /** The player pressed End turn; the ad covers the rival realms' moves. */
    TURN_END,

    /** A lost campaign, after the game-over screen (a victory asks for a rating instead). */
    GAME_OVER,

    /** Leaving a campaign for the main menu. */
    EXIT_TO_MENU,
}

/**
 * When full-screen ads may interrupt, so they earn without spoiling the game:
 * never in a campaign's first turns or the first minute of a session, at most
 * every third turn, and never sooner than [minGapMs] after the previous
 * full-screen ad of any kind (a watched tribute ad counts too).
 */
class AdPacing(
    private val clock: () -> Long,
    private val minGapMs: Long = MIN_GAP_MS,
    private val sessionGraceMs: Long = SESSION_GRACE_MS,
) {
    private val sessionStart = clock()
    private var lastFullScreenAt: Long? = null

    /** [turn] is the turn being ended or played when the break happens. */
    fun interstitialDue(moment: AdBreak, turn: Int): Boolean {
        val now = clock()
        if (now - sessionStart < sessionGraceMs) return false
        lastFullScreenAt?.let { if (now - it < minGapMs) return false }
        return when (moment) {
            AdBreak.TURN_END -> turn >= FIRST_AD_TURN && turn % TURNS_BETWEEN_ADS == 0
            AdBreak.GAME_OVER -> true
            AdBreak.EXIT_TO_MENU -> turn >= FIRST_AD_TURN
        }
    }

    fun onFullScreenShown() {
        lastFullScreenAt = clock()
    }

    companion object {
        const val FIRST_AD_TURN = 3
        const val TURNS_BETWEEN_ADS = 3
        const val MIN_GAP_MS = 150_000L
        const val SESSION_GRACE_MS = 60_000L

        /** Launches before a player first sees the app-open ad. */
        const val APP_OPEN_FIRST_LAUNCH = 3
        const val APP_OPEN_GAP_MS = 4 * 60 * 60 * 1000L

        /** App-open ad on a cold start: returning players only, at most every four hours. */
        fun appOpenDue(launches: Int, lastShownAt: Long, now: Long): Boolean =
            launches >= APP_OPEN_FIRST_LAUNCH && now - lastShownAt >= APP_OPEN_GAP_MS
    }
}
