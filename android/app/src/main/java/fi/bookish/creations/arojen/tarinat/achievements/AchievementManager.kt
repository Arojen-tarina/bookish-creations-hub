package fi.bookish.creations.arojen.tarinat.achievements

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONObject

/**
 * Persists unlocked achievement ids and their unlock timestamps in SharedPreferences,
 * so unlocks survive app restarts and reinstalled/updated builds.
 *
 * Achievement metadata (name/description) is owned by the web game code, which already
 * handles translations; this manager only tracks *which* ids are unlocked and *when*.
 */
class AchievementManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /** Unlocks [id] if it isn't already unlocked. Returns the (existing or new) unlock timestamp. */
    @Synchronized
    fun unlockAchievement(id: String): Long {
        val unlocked = readUnlocked()
        unlocked[id]?.let { return it }

        val unlockedAt = System.currentTimeMillis()
        unlocked[id] = unlockedAt
        writeUnlocked(unlocked)
        return unlockedAt
    }

    fun isUnlocked(id: String): Boolean = readUnlocked().containsKey(id)

    fun unlockedAt(id: String): Long? = readUnlocked()[id]

    /** Snapshot of every unlocked achievement id mapped to its unlock timestamp (ms). */
    fun getAllUnlocked(): Map<String, Long> = readUnlocked()

    private fun readUnlocked(): MutableMap<String, Long> {
        val raw = prefs.getString(KEY_UNLOCKED, null) ?: return mutableMapOf()
        val json = JSONObject(raw)
        val result = mutableMapOf<String, Long>()
        json.keys().forEach { id -> result[id] = json.getLong(id) }
        return result
    }

    private fun writeUnlocked(values: Map<String, Long>) {
        val json = JSONObject()
        values.forEach { (id, timestamp) -> json.put(id, timestamp) }
        prefs.edit().putString(KEY_UNLOCKED, json.toString()).apply()
    }

    private companion object {
        const val PREFS_NAME = "achievements_prefs"
        const val KEY_UNLOCKED = "unlocked_achievements"
    }
}
