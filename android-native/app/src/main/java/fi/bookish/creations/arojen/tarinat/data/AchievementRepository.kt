package fi.bookish.creations.arojen.tarinat.data

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import fi.bookish.creations.arojen.tarinat.game.achievements.ACHIEVEMENTS
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
) {
    private val prefs: SharedPreferences = context.applicationContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val statsFile = File(context.applicationContext.filesDir, "player_stats.json")
    private val json = Json { ignoreUnknownKeys = true }
    private val mutex = Mutex()
    private val known = ACHIEVEMENTS.map { it.id }.toSet()

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
        scope.launch { for (change in pending) update(change) }
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

    /** Applies [change] to the lifetime stats, saves them, and unlocks anything newly earned. */
    suspend fun update(change: (PlayerStats) -> PlayerStats) = withContext(io) {
        mutex.withLock {
            val next = change(_stats.value)
            if (next != _stats.value) {
                _stats.value = next
                writeStats(next)
            }
            val earned = StatsTracker.newlyMet(next, _unlocked.value.keys)
            if (earned.isNotEmpty()) {
                val now = System.currentTimeMillis()
                val all = _unlocked.value + earned.associate { it.id to now }
                writeUnlocked(all)
                _unlocked.value = all
                _unannounced.update { it + earned }
                earned.forEach { _newlyUnlocked.tryEmit(it to next) }
            }
        }
    }

    /**
     * Takes over the old WebView version's lifetime stats (when this app has
     * none yet) and the unlocks it kept in its web store. Imported unlocks were
     * earned long ago, so they get no banner.
     */
    suspend fun importLegacy(stats: PlayerStats?, unlocks: Map<String, Long>) = withContext(io) {
        mutex.withLock {
            if (stats != null && _stats.value == PlayerStats()) {
                _stats.value = stats
                writeStats(stats)
            }
            val merged = mergeUnlocks(_unlocked.value, unlocks, known, System.currentTimeMillis())
            if (merged != _unlocked.value) {
                writeUnlocked(merged)
                _unlocked.value = merged
            }
        }
    }

    private fun writeStats(stats: PlayerStats) {
        runCatching {
            val tmp = File(statsFile.parentFile, statsFile.name + ".tmp")
            tmp.writeText(json.encodeToString(PlayerStats.serializer(), stats))
            if (!tmp.renameTo(statsFile)) {
                statsFile.delete()
                tmp.renameTo(statsFile)
            }
        }
    }

    private fun readUnlocked(): Map<String, Long> {
        val raw = prefs.getString(KEY_UNLOCKED, null) ?: return emptyMap()
        return runCatching {
            val obj = JSONObject(raw)
            buildMap {
                for (id in obj.keys()) {
                    // Ignore ids this version does not know and impossible timestamps.
                    val at = obj.optLong(id, 0L)
                    if (id in known && at > 0L && at <= System.currentTimeMillis()) put(id, at)
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
