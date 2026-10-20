package fi.bookish.creations.arojen.tarinat.data

import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.io.File

class SaveRepositoryTest {
    @get:Rule val tmp = TemporaryFolder()

    private var now = 1_000L
    private fun repo(dir: File = File(tmp.root, "saves")) = SaveRepository(dir, clock = { now }, io = Dispatchers.Unconfined)
    private val game = startGame(FactionId.SONG, Difficulty.HARD, Mulberry32(5))

    @Test
    fun `save and load round trip with metadata`() = runTest {
        val r = repo()
        assertTrue(r.save(2, game))
        assertEquals(game, r.load(2))
        val meta = r.slots.value.getValue(2)
        assertEquals(FactionId.SONG, meta.faction)
        assertEquals(Difficulty.HARD, meta.difficulty)
        assertEquals(1, meta.turn)
        assertEquals(game.provinces.count { it.ownerId == FactionId.SONG }, meta.provinces)
    }

    @Test
    fun `refresh rebuilds the slot list from disk`() = runTest {
        val dir = File(tmp.root, "saves")
        repo(dir).apply { save(1, game); autosave(game) }
        val fresh = repo(dir)
        fresh.refresh()
        assertEquals(setOf(0, 1), fresh.slots.value.keys)
    }

    @Test
    fun `continue prefers the autosave, else the newest slot`() = runTest {
        val r = repo()
        assertNull(r.continueSlot())
        r.save(3, game); now += 10
        r.save(1, game)
        assertEquals(1, r.continueSlot())
        r.autosave(game)
        assertEquals(SaveRepository.AUTOSAVE, r.continueSlot())
    }

    @Test
    fun `delete removes the slot`() = runTest {
        val r = repo()
        r.save(4, game)
        r.delete(4)
        assertFalse(4 in r.slots.value)
        assertNull(r.load(4))
    }

    @Test
    fun `corrupt files are skipped instead of crashing`() = runTest {
        val dir = File(tmp.root, "saves").apply { mkdirs() }
        File(dir, "slot_2.json").writeText("{ not json")
        File(dir, "slot_2.meta.json").writeText("garbage")
        val r = repo(dir)
        r.refresh()
        assertTrue(r.slots.value.isEmpty())
        assertNull(r.load(2))
    }

    @Test
    fun `saves from a newer version of the app are refused`() = runTest {
        val dir = File(tmp.root, "saves")
        repo(dir).save(2, game)
        // A future version writes its format number into both files.
        File(dir, "slot_2.json").apply { writeText(readText().replaceFirst("{\"meta\":{", "{\"meta\":{\"version\":99,")) }
        File(dir, "slot_2.meta.json").apply { writeText(readText().replaceFirst("{", "{\"version\":99,")) }
        val fresh = repo(dir)
        fresh.refresh()
        assertFalse(2 in fresh.slots.value)
        assertNull(fresh.load(2))
    }

    @Test
    fun `a save pointing at missing provinces or realms is refused and dropped`() = runTest {
        val r = repo()
        val lost = game.armies.first().copy(id = "lost", provinceId = "nowhere")
        r.save(3, game.copy(armies = game.armies + lost))
        assertTrue(3 in r.slots.value)
        assertNull(r.load(3))
        assertFalse(3 in r.slots.value)
        assertFalse(game.copy(playerFactionId = FactionId.JIN, factions = game.factions.filter { it.id != FactionId.JIN }).isPlayable())
    }

    @Test
    fun `a meta file without its game is not listed`() = runTest {
        val dir = File(tmp.root, "saves")
        repo(dir).save(5, game)
        File(dir, "slot_5.json").delete()
        val fresh = repo(dir)
        fresh.refresh()
        assertTrue(fresh.slots.value.isEmpty())
    }

    @Test
    fun `real games stay playable turn after turn`() {
        var state = game
        repeat(60) { turn ->
            assertTrue("turn ${turn + 1}", state.isPlayable())
            if (state.gameOver) return
            state = endTurn(state, Mulberry32(turn))
        }
    }

    @Test
    fun `handoff is used once, then the file is read`() = runTest {
        val r = repo()
        val later = endTurn(game, Mulberry32(9))
        r.save(1, game)
        r.handOff(1, later)
        assertEquals(later, r.takeOrLoad(1))
        assertEquals(game, r.takeOrLoad(1))
    }
}
