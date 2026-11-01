package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.game.achievements.StatsTracker
import fi.bookish.creations.arojen.tarinat.game.challenge.ChallengeGoal
import fi.bookish.creations.arojen.tarinat.game.challenge.ChallengeStatus
import fi.bookish.creations.arojen.tarinat.game.challenge.DailyChallenges
import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class DailyChallengeTest {
    private val friday = LocalDate.of(2026, 10, 30)

    private fun dailyGame(date: LocalDate): GameState {
        val setup = DailyChallenges.forDate(date)
        return startGame(setup.faction, setup.difficulty, Mulberry32(setup.seed)).copy(challenge = setup.challenge)
    }

    @Test
    fun `the same date gives everyone the same realm, map and goal`() {
        assertEquals(DailyChallenges.forDate(friday), DailyChallenges.forDate(friday))
        assertEquals(dailyGame(friday), dailyGame(friday))
    }

    @Test
    fun `a month covers every realm and goal, and weekends are hard`() {
        val month = (0L until 30L).map { friday.plusDays(it) }
        val setups = month.map(DailyChallenges::forDate)
        assertEquals(ACTIVE_FACTIONS.toSet(), setups.map { it.faction }.toSet())
        assertEquals(ChallengeGoal.entries.toSet(), setups.map { it.challenge.goal }.toSet())
        for ((date, setup) in month.zip(setups)) {
            val weekend = date.dayOfWeek.value >= 6
            assertEquals(date.toString(), if (weekend) Difficulty.HARD else Difficulty.NORMAL, setup.difficulty)
        }
    }

    @Test
    fun `reaching the goal in time completes it for good, missing the limit fails it`() {
        val game = dailyGame(friday)
        val challenge = game.challenge!!.copy(goal = ChallengeGoal.PROVINCES, target = 3, turnLimit = 5)
        val owned = game.provinces.count { it.ownerId == game.playerFactionId }
        assertTrue(owned >= 3)
        assertTrue(challenge.reachedIn(game))
        assertEquals(ChallengeStatus.IN_PROGRESS, challenge.status(game))

        val done = challenge.copy(completedTurn = game.turn)
        assertFalse(done.reachedIn(game))
        assertEquals(ChallengeStatus.COMPLETED, done.status(game.copy(turn = 9)))

        val hard = challenge.copy(target = owned + 50)
        assertFalse(hard.reachedIn(game))
        assertEquals(ChallengeStatus.FAILED, hard.status(game.copy(turn = 6)))
        assertFalse(hard.copy(target = 1).reachedIn(game.copy(turn = 6)))
    }

    @Test
    fun `the challenge survives a save`() {
        val game = dailyGame(friday)
        val json = Json { ignoreUnknownKeys = true }
        assertEquals(game.challenge, json.decodeFromString(GameState.serializer(), json.encodeToString(GameState.serializer(), game)).challenge)
        // Saves from before the daily challenge have no such field.
        val plain = startGame(ACTIVE_FACTIONS[0], Difficulty.NORMAL, Mulberry32(1))
        assertNull(json.decodeFromString(GameState.serializer(), json.encodeToString(GameState.serializer(), plain)).challenge)
    }

    @Test
    fun `completions count once per day and days in a row build the streak`() {
        var s = StatsTracker.onDailyChallengeCompleted(PlayerStats(), friday)
        s = StatsTracker.onDailyChallengeCompleted(s, friday)
        assertEquals(1, s.dailyChallengesCompleted)
        assertEquals(1, s.dailyChallengeStreak)
        s = StatsTracker.onDailyChallengeCompleted(s, friday.plusDays(1))
        assertEquals(2, s.dailyChallengeStreak)
        s = StatsTracker.onDailyChallengeCompleted(s, friday.plusDays(3))
        assertEquals(1, s.dailyChallengeStreak)
        assertEquals(2, s.longestDailyChallengeStreak)
        assertEquals(3, s.dailyChallengesCompleted)
        assertTrue(StatsTracker.newlyMet(s, emptySet()).any { it.id == "daily_challenge_first" })
    }
}
