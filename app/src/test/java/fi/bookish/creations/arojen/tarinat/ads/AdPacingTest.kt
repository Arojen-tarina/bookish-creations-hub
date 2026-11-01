package fi.bookish.creations.arojen.tarinat.ads

import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.play.ReviewPrompt
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** The rules that keep adverts from spoiling the game. */
class AdPacingTest {
    private var now = 0L
    private val minute = 60_000L

    @Test
    fun `no interstitial in the first minute of a session`() {
        val pacing = AdPacing({ now })
        assertFalse(pacing.interstitialDue(AdBreak.GAME_OVER, 10))
        now += minute
        assertTrue(pacing.interstitialDue(AdBreak.GAME_OVER, 10))
    }

    @Test
    fun `turn-end adverts come every third turn, never in the first turns`() {
        val pacing = AdPacing({ now })
        now += minute
        assertFalse(pacing.interstitialDue(AdBreak.TURN_END, 1))
        assertFalse(pacing.interstitialDue(AdBreak.TURN_END, 2))
        assertTrue(pacing.interstitialDue(AdBreak.TURN_END, 3))
        assertFalse(pacing.interstitialDue(AdBreak.TURN_END, 4))
        assertFalse(pacing.interstitialDue(AdBreak.TURN_END, 5))
        assertTrue(pacing.interstitialDue(AdBreak.TURN_END, 6))
        // Leaving in the first turns is not punished either.
        assertFalse(pacing.interstitialDue(AdBreak.EXIT_TO_MENU, 2))
        assertTrue(pacing.interstitialDue(AdBreak.EXIT_TO_MENU, 3))
    }

    @Test
    fun `any full-screen advert keeps the next one away for two and a half minutes`() {
        val pacing = AdPacing({ now })
        now += minute
        pacing.onFullScreenShown()
        now += 2 * minute
        assertFalse(pacing.interstitialDue(AdBreak.TURN_END, 9))
        assertFalse(pacing.interstitialDue(AdBreak.GAME_OVER, 9))
        now += minute / 2
        assertTrue(pacing.interstitialDue(AdBreak.TURN_END, 9))
    }

    @Test
    fun `the app-open advert waits for returning players and four hours`() {
        val hour = 60 * minute
        assertFalse(AdPacing.appOpenDue(launches = 1, lastShownAt = 0, now = 100 * hour))
        assertFalse(AdPacing.appOpenDue(launches = 2, lastShownAt = 0, now = 100 * hour))
        assertTrue(AdPacing.appOpenDue(launches = 3, lastShownAt = 0, now = 100 * hour))
        assertFalse(AdPacing.appOpenDue(launches = 9, lastShownAt = 100 * hour, now = 103 * hour))
        assertTrue(AdPacing.appOpenDue(launches = 9, lastShownAt = 100 * hour, now = 104 * hour))
    }

    @Test
    fun `the rating card is asked for at happy moments, rarely`() {
        val day = 24 * 60 * minute
        val newcomer = PlayerStats(distinctPlayDays = 1, totalTurnsPlayed = 5)
        val loyal = PlayerStats(distinctPlayDays = 3, totalTurnsPlayed = 20)
        assertTrue(ReviewPrompt.eligible(newcomer, afterVictory = true, lastAskedAt = 0, now = 200 * day))
        assertFalse(ReviewPrompt.eligible(newcomer, afterVictory = false, lastAskedAt = 0, now = 200 * day))
        assertTrue(ReviewPrompt.eligible(loyal, afterVictory = false, lastAskedAt = 0, now = 200 * day))
        // Asked recently: wait, even after a victory.
        assertFalse(ReviewPrompt.eligible(loyal, afterVictory = true, lastAskedAt = 150 * day, now = 200 * day))
        assertTrue(ReviewPrompt.eligible(loyal, afterVictory = true, lastAskedAt = 80 * day, now = 200 * day))
    }
}
