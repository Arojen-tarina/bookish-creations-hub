package fi.bookish.creations.arojen.tarinat.data

import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.File

/** What the save list shows without decoding the whole game. */
@Serializable
data class SaveMeta(
    /** 0 = autosave, 1..[SaveRepository.SLOTS] = manual slots. */
    val slot: Int,
    val savedAt: Long,
    val turn: Int,
    val year: Int,
    val faction: FactionId,
    val provinces: Int,
    val difficulty: Difficulty,
    /**
     * [SaveRepository.FORMAT_VERSION] of the app that wrote the save. The
     * default (left out of the file while it is 1) means the first format.
     */
    val version: Int = 1,
)

@Serializable
private data class SaveFile(val meta: SaveMeta, val state: GameState)

/**
 * Five manual slots plus an autosave, stored as JSON under [dir]. Each slot
 * keeps a small "meta" file next to the game so the save list loads quickly.
 * Writes go to a temp file first and are renamed into place, so a crash
 * mid-save never leaves a half-written game behind.
 */
class SaveRepository(
    private val dir: File,
    private val clock: () -> Long = System::currentTimeMillis,
    private val io: CoroutineDispatcher = Dispatchers.IO,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val mutex = Mutex()
    private val _slots = MutableStateFlow<Map<Int, SaveMeta>>(emptyMap())

    /** Slot number -> metadata for every readable save (0 = autosave). */
    val slots: StateFlow<Map<Int, SaveMeta>> = _slots.asStateFlow()

    /** A game decoded by the load screen, handed to the game screen without a second read. */
    @Volatile
    private var handoff: Pair<Int, GameState>? = null

    /** Rescans the save folder. */
    suspend fun refresh() = withContext(io) {
        mutex.withLock {
            dir.mkdirs()
            _slots.value = (0..SLOTS).mapNotNull { slot -> readMeta(slot)?.let { slot to it } }.toMap()
        }
    }

    /** Writes [state] to [slot]; returns false if the disk write failed. */
    suspend fun save(slot: Int, state: GameState): Boolean = withContext(io) {
        require(slot in 0..SLOTS) { "slot $slot out of range" }
        mutex.withLock {
            val meta = SaveMeta(
                slot = slot,
                savedAt = clock(),
                turn = state.turn,
                year = state.year,
                faction = state.playerFactionId,
                provinces = state.provinces.count { it.ownerId == state.playerFactionId },
                difficulty = state.difficulty,
                version = FORMAT_VERSION,
            )
            val ok = runCatching {
                dir.mkdirs()
                writeAtomically(gameFile(slot), json.encodeToString(SaveFile.serializer(), SaveFile(meta, state)))
                writeAtomically(metaFile(slot), json.encodeToString(SaveMeta.serializer(), meta))
            }.isSuccess
            if (ok) _slots.update { it + (slot to meta) }
            ok
        }
    }

    suspend fun autosave(state: GameState): Boolean = save(AUTOSAVE, state)

    /**
     * Decodes the game in [slot], or null if it is missing or unreadable. An
     * unreadable slot is dropped from [slots] so Continue and the save list stop
     * offering it (the file stays on disk and is replaced by the next save there).
     */
    suspend fun load(slot: Int): GameState? = withContext(io) {
        mutex.withLock {
            loadNow(slot).also { state -> if (state == null) _slots.update { it - slot } }
        }
    }

    /** Blocking read, for restoring a game after process death. */
    fun loadNow(slot: Int): GameState? = runCatching {
        json.decodeFromString(SaveFile.serializer(), gameFile(slot).readText())
    }.getOrNull()?.takeIf { it.meta.version <= FORMAT_VERSION && it.state.isPlayable() }?.state

    suspend fun delete(slot: Int) = withContext(io) {
        mutex.withLock {
            gameFile(slot).delete()
            metaFile(slot).delete()
            _slots.update { it - slot }
        }
    }

    /** The game "Continue" resumes: the autosave, else the most recent manual save. */
    fun continueSlot(): Int? {
        val all = _slots.value
        return if (AUTOSAVE in all) AUTOSAVE else all.values.maxByOrNull { it.savedAt }?.slot
    }

    fun handOff(slot: Int, state: GameState) {
        handoff = slot to state
    }

    /** The handed-off game for [slot] (consumed), or a fresh read from disk. */
    fun takeOrLoad(slot: Int): GameState? {
        val pending = handoff
        handoff = null
        return if (pending != null && pending.first == slot) pending.second else loadNow(slot)
    }

    /** Metadata for [slot]; null without a game file, or for a save written by a newer version of the app. */
    private fun readMeta(slot: Int): SaveMeta? {
        if (!gameFile(slot).exists()) return null
        val metaText = runCatching { metaFile(slot).readText() }.getOrNull()
        val meta = metaText?.let { text -> runCatching { json.decodeFromString(SaveMeta.serializer(), text) }.getOrNull() }
            // Interrupted saves without a meta file: fall back to the game file.
            ?: runCatching { json.decodeFromString(SaveFile.serializer(), gameFile(slot).readText()).meta }.getOrNull()
        return meta?.takeIf { it.version <= FORMAT_VERSION }
    }

    private fun gameFile(slot: Int) = File(dir, if (slot == AUTOSAVE) "autosave.json" else "slot_$slot.json")
    private fun metaFile(slot: Int) = File(dir, if (slot == AUTOSAVE) "autosave.meta.json" else "slot_$slot.meta.json")

    private fun writeAtomically(target: File, text: String) {
        val tmp = File(target.parentFile, target.name + ".tmp")
        tmp.writeText(text)
        if (!tmp.renameTo(target)) {
            target.delete()
            check(tmp.renameTo(target)) { "could not move save into place" }
        }
    }

    companion object {
        const val AUTOSAVE = 0
        const val SLOTS = 5

        /**
         * Bump when [GameState] changes in a way older saves cannot decode into,
         * and migrate them in [loadNow]. Saves from a newer version are refused.
         */
        const val FORMAT_VERSION = 1
    }
}

/**
 * A decoded game the engine and screens can run without tripping over a
 * dangling reference (a damaged or hand-edited file can decode fine and still
 * point at a realm or province that is not there).
 */
internal fun GameState.isPlayable(): Boolean {
    val realms = factions.map { it.id }.toSet()
    val places = provinces.map { it.id }.toSet()
    return turn >= 1 &&
        places.size == provinces.size &&
        playerFactionId in realms &&
        factions.all { it.capitalId in places } &&
        provinces.all { p -> (p.ownerId == null || p.ownerId in realms) && p.neighbors.all { it in places } } &&
        armies.all { it.ownerId in realms && it.provinceId in places } &&
        relations.all { it.factionA in realms && it.factionB in realms }
}
