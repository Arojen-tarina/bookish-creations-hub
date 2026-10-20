package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.achievements.ACHIEVEMENTS
import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.game.achievements.Progression
import fi.bookish.creations.arojen.tarinat.game.achievements.StatsTracker
import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.buildStructure
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.playCard
import fi.bookish.creations.arojen.tarinat.game.engine.recruitArmy
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.BattleReport
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.model.UnitLosses
import fi.bookish.creations.arojen.tarinat.game.model.WinCondition
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class StatsTrackerTest {
    private val game = startGame(FactionId.MONGOL, Difficulty.HARD, Mulberry32(3))

    @Test
    fun `catalog has 84 unique achievements`() {
        assertEquals(84, ACHIEVEMENTS.size)
        assertEquals(84, ACHIEVEMENTS.map { it.id }.toSet().size)
    }

    @Test
    fun `playing, building and recruiting count towards the tutorial achievements`() {
        var s = PlayerStats()
        val played = playCard(game, game.hand.first().id)
        s = StatsTracker.onStateChanged(s, game, played)
        assertEquals(1, s.cardsPlayedTotal)
        assertEquals(setOf(game.hand.first().id), s.uniqueCardIdsPlayed)

        val built = buildStructure(played, played.player.capitalId, BuildingType.CAMP)
        s = StatsTracker.onStateChanged(s, played, built)
        assertEquals(1, s.buildingsBuilt)
        assertTrue("camp" in s.buildingTypesBuilt)

        val recruited = recruitArmy(built, built.player.capitalId, RecruitType.INFANTRY)
        s = StatsTracker.onStateChanged(s, built, recruited)
        assertEquals(1, s.unitsRecruited)

        // Nothing has been completed before the first End turn.
        assertEquals(0, s.totalTurnsPlayed)
        assertFalse("tut_first_turn" in StatsTracker.newlyMet(s, emptySet()).map { it.id })

        val next = endTurn(recruited, Mulberry32(1))
        s = StatsTracker.onStateChanged(s, recruited, next)
        assertEquals(1, s.totalTurnsPlayed)

        val earned = StatsTracker.newlyMet(s, emptySet()).map { it.id }
        assertTrue(earned.containsAll(listOf("tut_first_turn", "tut_first_card", "tut_first_building", "tut_first_recruit")))
    }

    @Test
    fun `a loaded save only updates peaks, not counters`() {
        val s = StatsTracker.onStateChanged(PlayerStats(), null, game)
        assertEquals(0, s.provincesCaptured)
        assertEquals(game.provinces.count { it.ownerId == FactionId.MONGOL }, s.maxProvincesOwnedInRun)
    }

    @Test
    fun `battles track wins, perfect wins and streaks`() {
        val army = game.armies.first()
        fun battle(won: Boolean, losses: Int) = BattleReport(
            army, army, FactionId.MONGOL, FactionId.SONG, "x", won,
            UnitLosses(0, losses), UnitLosses(0, 1), 10, 20, 3, 2, 10.0, 5.0,
        )
        var s = StatsTracker.onBattle(PlayerStats(), battle(true, 0), FactionId.MONGOL)
        s = StatsTracker.onBattle(s, battle(true, 2), FactionId.MONGOL)
        assertEquals(2, s.battlesWon)
        assertEquals(1, s.perfectBattlesWon)
        assertEquals(2, s.longestWinStreakBattles)
        s = StatsTracker.onBattle(s, battle(false, 3), FactionId.MONGOL)
        assertEquals(0, s.currentWinStreakBattles)
        assertEquals(2, s.longestWinStreakBattles)
    }

    @Test
    fun `a hard military win counts everywhere it should`() {
        val won = game.copy(gameOver = true, winnerId = FactionId.MONGOL, winCondition = WinCondition.MILITARY, turn = 9)
        val s = StatsTracker.onGameOver(PlayerStats(), won)
        assertEquals(1, s.gamesWon)
        assertEquals(1, s.militaryVictories)
        assertEquals(1, s.hardDifficultyWins)
        assertEquals(9, s.fastestVictoryTurn)
        assertEquals(1, s.victoriesByFaction[FactionId.MONGOL])
        val earned = StatsTracker.newlyMet(s, emptySet()).map { it.id }
        assertTrue("challenge_speedrun" in earned)
        assertTrue("campaign_mongol_win" in earned)
    }

    @Test
    fun `login streak counts consecutive days only`() {
        val day = LocalDate.of(2026, 10, 19)
        var s = StatsTracker.onAppOpened(PlayerStats(), day)
        s = StatsTracker.onAppOpened(s, day)
        assertEquals(1, s.distinctPlayDays)
        s = StatsTracker.onAppOpened(s, day.plusDays(1))
        assertEquals(2, s.loginStreak)
        s = StatsTracker.onAppOpened(s, day.plusDays(5))
        assertEquals(1, s.loginStreak)
        assertEquals(3, s.distinctPlayDays)
    }

    @Test
    fun `levels follow the original curve`() {
        assertEquals(1, Progression.level(0))
        assertEquals(2, Progression.level(100))
        assertEquals(3, Progression.level(300))
        assertEquals(5, Progression.rankLevel(7))
    }
}
