package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.model.GameState
import kotlin.math.max

/**
 * The Silk Road tribute: once per turn the player may watch an ad and receive
 * one of these. Not part of the original rules; it only adds to what the turn
 * already gave, so a player who never watches loses nothing.
 */
enum class TributeKind {
    /** Gold equal to this turn's tax income: the turn pays twice. */
    GOLD,

    /** One more card from the deck. */
    CARD,
}

const val TRIBUTE_MIN_GOLD = 40

/** Gold the tribute pays this turn. */
fun tributeGold(state: GameState): Int = max(TRIBUTE_MIN_GOLD, state.lastCollection?.taxIncome ?: 0)

fun canTakeTribute(state: GameState): Boolean = !state.gameOver && state.tributeTurn != state.turn

fun canDrawTributeCard(state: GameState): Boolean = state.deck.isNotEmpty() || state.discard.isNotEmpty()

/** Pays the tribute (once per turn; afterwards [state] comes back unchanged). */
fun takeTribute(state: GameState, kind: TributeKind, rng: GameRandom): GameState {
    if (!canTakeTribute(state)) return state
    val paid = state.copy(tributeTurn = state.turn)
    return when (kind) {
        TributeKind.GOLD -> paid.copy(
            factions = paid.factions.map {
                if (it.id == paid.playerFactionId) it.copy(treasury = it.treasury + tributeGold(state)) else it
            },
        )
        TributeKind.CARD -> {
            // Like the turn's draw: reshuffle the discard pile when the deck is empty.
            var deck = paid.deck
            var discard = paid.discard
            if (deck.isEmpty() && discard.isNotEmpty()) {
                deck = rng.shuffled(discard)
                discard = emptyList()
            }
            if (deck.isEmpty()) paid else paid.copy(deck = deck.drop(1), discard = discard, hand = paid.hand + deck.first())
        }
    }
}
