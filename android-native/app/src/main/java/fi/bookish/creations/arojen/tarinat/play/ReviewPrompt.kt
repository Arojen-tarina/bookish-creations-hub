package fi.bookish.creations.arojen.tarinat.play

import android.app.Activity
import android.app.Application
import android.content.Context
import androidx.core.content.edit
import com.google.android.play.core.review.ReviewManagerFactory
import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats

/**
 * Play in-app review: the rating card is asked for at happy moments only, after
 * a victory or for a player who keeps coming back, never after a defeat, and at
 * most every [ASK_GAP_MS]. Play decides whether the card really appears.
 */
class ReviewPrompt(app: Application, private val clock: () -> Long = System::currentTimeMillis) {
    private val manager = ReviewManagerFactory.create(app)
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private var askedThisSession = false

    fun maybeAsk(activity: Activity, stats: PlayerStats, afterVictory: Boolean) {
        val now = clock()
        if (askedThisSession || !eligible(stats, afterVictory, prefs.getLong(KEY_ASKED_AT, 0L), now)) return
        askedThisSession = true
        prefs.edit { putLong(KEY_ASKED_AT, now) }
        manager.requestReviewFlow().addOnSuccessListener { info -> manager.launchReviewFlow(activity, info) }
    }

    companion object {
        private const val PREFS = "play"
        private const val KEY_ASKED_AT = "review_asked_at"
        const val ASK_GAP_MS = 120L * 24 * 60 * 60 * 1000

        /** A loyal player: back on three different days with twenty turns behind them. */
        const val LOYAL_DAYS = 3
        const val LOYAL_TURNS = 20

        fun eligible(stats: PlayerStats, afterVictory: Boolean, lastAskedAt: Long, now: Long): Boolean =
            now - lastAskedAt >= ASK_GAP_MS &&
                (afterVictory || (stats.distinctPlayDays >= LOYAL_DAYS && stats.totalTurnsPlayed >= LOYAL_TURNS))
    }
}
