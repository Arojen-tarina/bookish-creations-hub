package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.canTakeSecondChance
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.engine.takeSecondChance
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** The opt-in second chance after a defeat, paid for by watching an advert. */
class SecondChanceTest {
    private val start = startGame(FactionId.MONGOL, Difficulty.NORMAL, Mulberry32(3))
    private val player = start.playerFactionId

    /** The player's last land and armies are gone: ending this turn is a defeat. */
    private val doomed = start.copy(
        provinces = start.provinces.map { if (it.ownerId == player) it.copy(ownerId = null) else it },
        armies = start.armies.filter { it.ownerId != player },
    )

    @Test
    fun `a defeat can be replayed once, from the start of the lost turn`() {
        val lost = endTurn(doomed, Mulberry32(4))
        assertTrue(lost.gameOver)
        assertNotEquals(player, lost.winnerId)
        assertTrue(canTakeSecondChance(lost))

        val replay = takeSecondChance(doomed)
        assertEquals(doomed.turn, replay.turn)
        assertFalse(replay.gameOver)
        assertTrue(replay.secondChanceUsed)
        // Lost again: there is no third chance.
        val lostAgain = endTurn(replay, Mulberry32(5))
        assertTrue(lostAgain.gameOver)
        assertFalse(canTakeSecondChance(lostAgain))
    }

    @Test
    fun `running campaigns and victories offer nothing`() {
        assertFalse(canTakeSecondChance(start))
        assertFalse(canTakeSecondChance(start.copy(gameOver = true, winnerId = player)))
    }
}
