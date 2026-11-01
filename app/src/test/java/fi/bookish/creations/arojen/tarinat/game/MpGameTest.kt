package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.data.FACTION_DATA_1206
import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.recruitArmy
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.multiplayer.MpGame
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MpGameTest {
    private val players = listOf(FactionId.MONGOL, FactionId.SONG)
    private fun newGame() = MpGame.start(players, Difficulty.NORMAL, seed = 4242)

    @Test
    fun `every phone builds the same start, and each player starts like a single-player campaign`() {
        val game = newGame()
        assertEquals(game, newGame())
        assertEquals(0, game.active)
        assertEquals(FactionId.MONGOL, game.world.playerFactionId)
        for (seat in game.seats) {
            assertEquals(5, seat.hand.size)
            assertTrue(seat.resourcesCollected)
        }
        assertNotEquals(game.seats[0].hand, game.seats[1].hand)
        // Human realms are not scaled like AI realms (Normal scales AI funds by its multiplier; a player's start is the base plus income).
        val song = game.world.faction(FactionId.SONG)!!
        assertTrue(song.treasury >= FACTION_DATA_1206.getValue(FactionId.SONG).treasury)
    }

    @Test
    fun `turns pass seat to seat, and the round ends after the last one`() {
        val rng = Mulberry32(1)
        var game = newGame()
        val turn = game.world.turn
        game = game.endSeatTurn(game.world, rng)
        assertEquals(1, game.active)
        assertEquals(FactionId.SONG, game.world.playerFactionId)
        assertEquals(turn, game.world.turn)

        val songHandBefore = game.world.hand.size
        val mongolHandBefore = game.seats[0].hand.size
        val humanArmies = game.world.armies.filter { it.ownerId in players }.associate { it.id to it.provinceId }
        game = game.endSeatTurn(game.world, rng)
        assertEquals(0, game.active)
        assertEquals(turn + 1, game.world.turn)
        // The AI never moves a player's armies.
        for (army in game.world.armies.filter { it.ownerId in players }) {
            humanArmies[army.id]?.let { assertEquals(army.id, it, army.provinceId) }
        }
        // Both players drew a card and were paid for the new turn.
        assertEquals(mongolHandBefore + 1, game.world.hand.size)
        assertEquals(songHandBefore + 1, game.seats[1].hand.size)
        assertTrue(game.seats.all { it.resourcesCollected })
    }

    @Test
    fun `a player's actions stay theirs when the turn passes`() {
        val rng = Mulberry32(2)
        var game = newGame()
        val capital = game.world.player.capitalId
        val acted = recruitArmy(game.world, capital, RecruitType.INFANTRY)
        assertNotEquals(game.world.armies.size, acted.armies.size)
        game = game.endSeatTurn(acted, rng)
        assertEquals(acted.armies, game.world.armies)
        assertEquals(acted.food, game.seats[0].food)
        assertEquals(acted.food, game.viewFor(FactionId.MONGOL).food)
    }

    @Test
    fun `a player who leaves is skipped and their realm turns AI`() {
        val rng = Mulberry32(3)
        var game = MpGame.start(listOf(FactionId.MONGOL, FactionId.SONG, FactionId.RUS), Difficulty.NORMAL, 7)
        game = game.endSeatTurn(game.world, rng)
        assertEquals(FactionId.SONG, game.activeFaction)
        game = game.markLeft(FactionId.SONG, rng)
        assertEquals(FactionId.RUS, game.activeFaction)
        assertFalse(FactionId.SONG in game.humans)
        game = game.endSeatTurn(game.world, rng)
        assertEquals(FactionId.MONGOL, game.activeFaction)
        game = game.endSeatTurn(game.world, rng)
        assertEquals(FactionId.RUS, game.activeFaction)
    }

    @Test
    fun `a defeated player is out but the campaign goes on`() {
        val rng = Mulberry32(4)
        var game = newGame()
        // Song loses every province and army before the round ends.
        val ruined = game.world.copy(
            provinces = game.world.provinces.map { if (it.ownerId == FactionId.SONG) it.copy(ownerId = null) else it },
            armies = game.world.armies.filter { it.ownerId != FactionId.SONG },
        )
        game = game.endSeatTurn(ruined, rng)
        game = game.endSeatTurn(game.world, rng)
        assertTrue(game.seatOf(FactionId.SONG)!!.eliminated)
        assertFalse(game.finished)
        assertEquals(FactionId.MONGOL, game.activeFaction)
        game = game.endSeatTurn(game.world, rng)
        assertEquals(FactionId.MONGOL, game.activeFaction)
    }

    @Test
    fun `the campaign round-trips through JSON`() {
        val json = Json { ignoreUnknownKeys = true }
        val game = newGame().endSeatTurn(newGame().world, Mulberry32(5))
        assertEquals(game, json.decodeFromString(MpGame.serializer(), json.encodeToString(MpGame.serializer(), game)))
    }
}
