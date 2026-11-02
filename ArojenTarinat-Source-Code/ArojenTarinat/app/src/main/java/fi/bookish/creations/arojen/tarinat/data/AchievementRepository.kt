package fi.bookish.creations.arojen.tarinat.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.core.content.edit
import fi.bookish.creations.arojen.tarinat.game.achievements.ALL_ACHIEVEMENTS
import fi.bookish.creations.arojen.tarinat.game.achievements.AchievementDef
import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.game.achievements.StatsTracker
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.io.File
import java.io.IOException

/**
 * Unlocked achievements and lifetime stats.
 *
 * Unlocks live in the same SharedPreferences file and key the old Capacitor
 * app's native AchievementManager used ("achievements_prefs" /
 * "unlocked_achievements", JSON {id: unlockedAtMillis}), so players who update
 * from the WebView version keep every achievement they had.
 */
class AchievementRepository(
    context: Context,
    scope: CoroutineScope,
    private val io: CoroutineDispatcher = Dispatchers.IO,
    private val clock: () -> Long = System::currentTimeMillis,
) {
    private val prefs: SharedPreferences = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val statsFile = File(context.applicationContext.filesDir, "player_stats.json")
    private val json = Json { ignoreUnknownKeys = true }
    private val mutex = Mutex()
    private val known = ALL_ACHIEVEMENTS.map { it.id }.toSet()

    private val _unlocked = MutableStateFlow<Map<String, Long>>(emptyMap())
    /** Achievement id -> unlock time (epoch millis). */
    val unlocked: StateFlow<Map<String, Long>> = _unlocked.asStateFlow()

    private val _stats = MutableStateFlow(PlayerStats())
    val stats: StateFlow<PlayerStats> = _stats.asStateFlow()

    private val _unannounced = MutableStateFlow<List<AchievementDef>>(emptyList())
    /**
     * Unlocks the player has not seen a banner for yet, oldest first. Kept
     * until shown, so an unlock that happens before the banner is on screen
     * (e.g. while a save is still loading) is never lost.
     */
    val unannounced: StateFlow<List<AchievementDef>> = _unannounced.asStateFlow()

    fun markAnnounced(def: AchievementDef) = _unannounced.update { list -> list.filter { it.id != def.id } }

    private val _newlyUnlocked = MutableSharedFlow<Pair<AchievementDef, PlayerStats>>(extraBufferCapacity = 64)

    /** Each achievement as it is earned in play, with the stats that earned it (for analytics). */
    val newlyUnlocked: SharedFlow<Pair<AchievementDef, PlayerStats>> = _newlyUnlocked.asSharedFlow()

    /** Stat changes applied strictly in the order they were recorded. */
    private val pending = Channel<(PlayerStats) -> PlayerStats>(Channel.UNLIMITED)

    init {
        scope.launch {
            for (change in pending) {
                try {
                    update(change)
                } catch (e: IOException) {
                    // The change is kept in memory; the loop must go on for the next ones.
                    Log.e(TAG, "Could not save player stats", e)
                }
            }
        }
    }

    /** Queues a stat change; safe to call from the UI thread and outlives the calling screen. */
    fun record(change: (PlayerStats) -> PlayerStats) {
        pending.trySend(change)
    }

    suspend fun load() = withContext(io) {
        mutex.withLock {
            _unlocked.value = readUnlocked()
            _stats.value = runCatching { json.decodeFromString(PlayerStats.serializer(), statsFile.readText()) }.getOrDefault(PlayerStats())
        }
    }

    /**
     * Applies [change] to the lifetime stats, saves them, and unlocks anything newly earned.
     * Throws IOException when the stats could not be saved; the unlocks are saved and announced regardless.
     */
    suspend fun update(change: (PlayerStats) -> PlayerStats) = withContext(io) {
        mutex.withLock {
            val next = change(_stats.value)
            val statsChanged = next != _stats.value
            if (statsChanged) _stats.value = next
            val earned = StatsTracker.newlyMet(next, _unlocked.value.keys)
            if (earned.isNotEmpty()) {
                val now = clock()
                val all = _unlocked.value + earned.associate { it.id to now }
                writeUnlocked(all)
                _unlocked.value = all
                _unannounced.update { it + earned }
                earned.forEach { _newlyUnlocked.tryEmit(it to next) }
            }
            if (statsChanged) writeStats(next)
        }
    }

    /**
     * Takes over the old WebView version's lifetime stats (when this app has
     * none yet) and the unlocks it kept in its web store. Imported unlocks were
     * earned long ago, so they get no banner. Throws IOException when the stats could not be saved.
     */
    suspend fun importLegacy(stats: PlayerStats?, unlocks: Map<String, Long>) = withContext(io) {
        mutex.withLock {
            val merged = mergeUnlocks(_unlocked.value, unlocks, known, clock())
            if (merged != _unlocked.value) {
                writeUnlocked(merged)
                _unlocked.value = merged
            }
            if (stats != null && _stats.value == PlayerStats()) {
                _stats.value = stats
                writeStats(stats)
            }
        }
    }

    /** Takes the progress of the player's cloud copy as this phone's (signing in on a new phone). Throws IOException when the stats could not be saved. */
    suspend fun replaceAll(stats: PlayerStats, unlocks: Map<String, Long>) = withContext(io) {
        mutex.withLock {
            val now = clock()
            val clean = unlocks.filter { (id, at) -> id in known && at in 1..now }
            _stats.value = stats
            _unlocked.value = clean
            writeUnlocked(clean)
            writeStats(stats)
        }
    }

    private fun writeStats(stats: PlayerStats) {
        statsFile.writeTextAtomically(json.encodeToString(PlayerStats.serializer(), stats))
    }

    private fun readUnlocked(): Map<String, Long> {
        val raw = prefs.getString(KEY_UNLOCKED, null) ?: return emptyMap()
        return runCatching {
            val obj = JSONObject(raw)
            buildMap {
                for (id in obj.keys()) {
                    // Ignore ids this version does not know and impossible timestamps.
                    val at = obj.optLong(id, 0L)
                    if (id in known && at > 0L && at <= clock()) put(id, at)
                }
            }
        }.getOrDefault(emptyMap())
    }

    private fun writeUnlocked(all: Map<String, Long>) {
        val obj = JSONObject()
        all.forEach { (id, at) -> obj.put(id, at) }
        prefs.edit { putString(KEY_UNLOCKED, obj.toString()) }
    }

    private companion object {
        const val TAG = "AchievementRepository"
        const val PREFS_NAME = "achievements_prefs"
        const val KEY_UNLOCKED = "unlocked_achievements"
    }
}

/**
 * Both sets of unlocks; an achievement unlocked in both keeps the earlier time.
 * Unknown ids and impossible times in [imported] are ignored.
 */
internal fun mergeUnlocks(current: Map<String, Long>, imported: Map<String, Long>, known: Set<String>, now: Long): Map<String, Long> {
    val merged = current.toMutableMap()
    for ((id, at) in imported) {
        if (id in known && at in 1..now) merged[id] = minOf(merged[id] ?: at, at)
    }
    return merged
}
