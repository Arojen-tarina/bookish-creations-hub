package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.TRIBUTE_MIN_GOLD
import fi.bookish.creations.arojen.tarinat.game.engine.TributeKind
import fi.bookish.creations.arojen.tarinat.game.engine.canDrawTributeCard
import fi.bookish.creations.arojen.tarinat.game.engine.canTakeTribute
import fi.bookish.creations.arojen.tarinat.game.engine.collectResources
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.engine.takeTribute
import fi.bookish.creations.arojen.tarinat.game.engine.tributeGold
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertSame
import org.junit.Assert.assertTrue
import org.junit.Test

/** The opt-in tribute paid for watching an advert. */
class TributeTest {
    private val start = startGame(FactionId.MONGOL, Difficulty.NORMAL, Mulberry32(3))
    private val turn2 = collectResources(endTurn(start, Mulberry32(4)))

    @Test
    fun `gold tribute pays the turn's tax income once per turn`() {
        val income = turn2.lastCollection!!.taxIncome
        assertEquals(maxOf(TRIBUTE_MIN_GOLD, income), tributeGold(turn2))
        val paid = takeTribute(turn2, TributeKind.GOLD, Mulberry32(1))
        assertEquals(turn2.player.treasury + tributeGold(turn2), paid.player.treasury)
        assertFalse(canTakeTribute(paid))
        assertSame(paid, takeTribute(paid, TributeKind.GOLD, Mulberry32(1)))
        // The next turn offers it again.
        assertTrue(canTakeTribute(endTurn(paid, Mulberry32(5))))
    }

    @Test
    fun `card tribute draws from the deck, reshuffling the discard pile when needed`() {
        val paid = takeTribute(turn2, TributeKind.CARD, Mulberry32(1))
        assertEquals(turn2.hand.size + 1, paid.hand.size)
        assertEquals(turn2.deck.size - 1, paid.deck.size)
        assertEquals(turn2.deck.first(), paid.hand.last())

        val emptyDeck = turn2.copy(deck = emptyList(), discard = turn2.deck)
        assertTrue(canDrawTributeCard(emptyDeck))
        val reshuffled = takeTribute(emptyDeck, TributeKind.CARD, Mulberry32(1))
        assertEquals(emptyDeck.hand.size + 1, reshuffled.hand.size)
        assertTrue(reshuffled.discard.isEmpty())
        assertEquals(turn2.deck.size - 1, reshuffled.deck.size)

        assertFalse(canDrawTributeCard(turn2.copy(deck = emptyList(), discard = emptyList())))
    }

    @Test
    fun `no tribute once the campaign is over`() {
        val over = turn2.copy(gameOver = true)
        assertFalse(canTakeTribute(over))
        assertSame(over, takeTribute(over, TributeKind.GOLD, Mulberry32(1)))
    }
}
