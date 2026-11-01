package fi.bookish.creations.arojen.tarinat.game.multiplayer

import fi.bookish.creations.arojen.tarinat.game.data.FACTION_DATA_1206
import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.engine.GameRandom
import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.applyResourceCollection
import fi.bookish.creations.arojen.tarinat.game.engine.calculateResourceCollection
import fi.bookish.creations.arojen.tarinat.game.engine.createPlayableDeck
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.seatRoundStart
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.ActiveCardEffect
import fi.bookish.creations.arojen.tarinat.game.model.Card
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.ResourceCollection
import kotlinx.serialization.Serializable

/**
 * One player's own part of a multiplayer campaign: everything the engine keeps
 * for "the player" in [GameState] (cards, card bonuses, food and the other
 * player-only resources). The world itself (land, armies, gold) is shared.
 */
@Serializable
data class Seat(
    val faction: FactionId,
    /** The player left: their realm plays as an AI realm from then on. */
    val left: Boolean = false,
    /** The realm lost all land and armies. */
    val eliminated: Boolean = false,
    val deck: List<Card> = emptyList(),
    val hand: List<Card> = emptyList(),
    val discard: List<Card> = emptyList(),
    val playedTechCards: List<Card> = emptyList(),
    val activeEffects: List<ActiveCardEffect> = emptyList(),
    val attackBonus: Int = 0,
    val defenseBonus: Int = 0,
    val movementBonus: Int = 0,
    val food: Int = 0,
    val artisans: Int = 0,
    val influence: Int = 0,
    val prestige: Int = 0,
    val treasuryStreak: Int = 0,
    val resourcesCollected: Boolean = false,
    val lastCollection: ResourceCollection? = null,
    val chiefLost: Boolean = false,
    val tributeTurn: Int = 0,
) {
    val playing: Boolean get() = !left && !eliminated
}

/** This state's player part, keeping [into]'s membership flags. */
fun GameState.toSeat(into: Seat? = null): Seat = Seat(
    faction = playerFactionId,
    left = into?.left ?: false,
    eliminated = into?.eliminated ?: false,
    deck = deck, hand = hand, discard = discard, playedTechCards = playedTechCards, activeEffects = activeEffects,
    attackBonus = attackBonus, defenseBonus = defenseBonus, movementBonus = movementBonus,
    food = food, artisans = artisans, influence = influence, prestige = prestige, treasuryStreak = treasuryStreak,
    resourcesCollected = resourcesCollected, lastCollection = lastCollection, chiefLost = chiefLost, tributeTurn = tributeTurn,
)

/** The shared world as [seat]'s player sees and plays it. */
fun GameState.withSeat(seat: Seat): GameState = copy(
    playerFactionId = seat.faction,
    deck = seat.deck, hand = seat.hand, discard = seat.discard, playedTechCards = seat.playedTechCards, activeEffects = seat.activeEffects,
    attackBonus = seat.attackBonus, defenseBonus = seat.defenseBonus, movementBonus = seat.movementBonus,
    food = seat.food, artisans = seat.artisans, influence = seat.influence, prestige = seat.prestige, treasuryStreak = seat.treasuryStreak,
    resourcesCollected = seat.resourcesCollected, lastCollection = seat.lastCollection, chiefLost = seat.chiefLost, tributeTurn = seat.tributeTurn,
)

/**
 * A multiplayer campaign: players take their turns one after another on one
 * shared world; after the last of them the AI realms move and a new turn
 * (round) begins for everyone. [world] has the active seat's part loaded.
 */
@Serializable
data class MpGame(
    val world: GameState,
    val seats: List<Seat>,
    val active: Int,
) {
    val activeFaction: FactionId get() = seats[active].faction
    val finished: Boolean get() = world.gameOver
    val humans: Set<FactionId> get() = seats.filter { it.playing }.map { it.faction }.toSet()

    fun seatOf(faction: FactionId): Seat? = seats.firstOrNull { it.faction == faction }

    /** What [faction]'s player sees: the shared world with their own cards and resources. */
    fun viewFor(faction: FactionId): GameState {
        if (faction == activeFaction) return world
        val seat = seatOf(faction) ?: return world
        return world.withSeat(seat)
    }

    /**
     * The active player ended their turn with [current] (their view after
     * their actions). The next playing seat takes over; after the last one
     * the round ends: AI realms act and every player's new turn begins.
     */
    fun endSeatTurn(current: GameState, rng: GameRandom): MpGame {
        require(current.playerFactionId == activeFaction) { "not ${current.playerFactionId}'s turn" }
        val seats = seats.toMutableList()
        seats[active] = current.toSeat(seats[active])
        val order = seats.indices.filter { seats[it].playing }
        val next = order.firstOrNull { it > active }
        if (next != null) return MpGame(current.withSeat(seats[next]), seats, next)
        return endRound(current, seats, order, rng)
    }

    /** The player of [faction] left: their realm turns AI; if it was their turn, play passes on. */
    fun markLeft(faction: FactionId, rng: GameRandom): MpGame {
        val i = seats.indexOfFirst { it.faction == faction }
        if (i == -1 || seats[i].left) return this
        val marked = copy(seats = seats.mapIndexed { k, s -> if (k == i) s.copy(left = true) else s })
        if (i != active || finished) return marked
        val order = marked.seats.indices.filter { marked.seats[it].playing }
        if (order.isEmpty()) return marked.copy(world = world.copy(gameOver = true, winnerId = null, winCondition = null))
        val next = order.firstOrNull { it > active }
        if (next != null) return MpGame(world.withSeat(marked.seats[next]), marked.seats, next)
        return endRound(world, marked.seats.toMutableList(), order, rng)
    }

    private fun endRound(current: GameState, seats: MutableList<Seat>, order: List<Int>, rng: GameRandom): MpGame {
        val humans = order.map { seats[it].faction }.toSet()
        val armiesBefore = current.armies
        // The engine's own player is the round's last seat when it is still playing; otherwise the first playing one.
        val lead = if (active in order) active else order.first()
        var world = endTurn(current.withSeat(seats[lead]), rng, otherHumans = humans - seats[lead].faction)
        seats[lead] = world.toSeat(seats[lead])
        world = settle(world, seats, lead)
        for (i in order) {
            if (i == lead || (world.gameOver && world.winnerId != null)) continue
            world = seatRoundStart(world.withSeat(seats[i]), armiesBefore, rng, humans - seats[i].faction)
            seats[i] = world.toSeat(seats[i])
            world = settle(world, seats, i)
        }
        val stillPlaying = seats.indices.filter { seats[it].playing }
        if (stillPlaying.isEmpty() && !world.gameOver) world = world.copy(gameOver = true, winnerId = null, winCondition = null)
        val first = stillPlaying.firstOrNull() ?: lead
        return MpGame(world.withSeat(seats[first]), seats, first)
    }

    /** A seat's defeat only knocks that player out; the campaign goes on while anyone still plays. */
    private fun settle(world: GameState, seats: MutableList<Seat>, i: Int): GameState {
        if (!world.gameOver || world.winnerId != null) return world
        seats[i] = seats[i].copy(eliminated = true)
        return world.copy(gameOver = false, winCondition = null)
    }

    companion object {
        /**
         * A new campaign for [factions] in turn order. The map and decks follow
         * [seed], so every phone can rebuild the start; each player starts as a
         * single-player campaign would (own deck, food, artisans, unscaled gold).
         */
        fun start(factions: List<FactionId>, difficulty: Difficulty, seed: Int): MpGame {
            require(factions.size >= 2 && factions.toSet().size == factions.size) { "need 2+ distinct realms" }
            val rng = Mulberry32(seed)
            var world = startGame(factions.first(), difficulty, rng)
            val seats = mutableListOf(world.toSeat())
            for (faction in factions.drop(1)) {
                val base = FACTION_DATA_1206.getValue(faction)
                val deck = createPlayableDeck(rng)
                val fresh = world.copy(
                    playerFactionId = faction,
                    factions = world.factions.map { if (it.id == faction) it.copy(treasury = base.treasury, manpower = base.manpower) else it },
                ).withSeat(
                    Seat(
                        faction = faction,
                        deck = deck.drop(Rules.STARTING_HAND),
                        hand = deck.take(Rules.STARTING_HAND),
                        food = Rules.STARTING_FOOD,
                        artisans = Rules.STARTING_ARTISANS,
                    ),
                )
                world = applyResourceCollection(fresh, faction, calculateResourceCollection(fresh, faction))
                seats += world.toSeat()
            }
            return MpGame(world.withSeat(seats.first()), seats, 0)
        }
    }
}
