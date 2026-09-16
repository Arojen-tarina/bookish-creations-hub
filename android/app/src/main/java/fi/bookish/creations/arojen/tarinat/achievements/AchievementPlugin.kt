package fi.bookish.creations.arojen.tarinat.achievements

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Exposes [AchievementManager] to the web game code over the Capacitor bridge, so
 * TypeScript gameplay code can unlock/query achievements with native persistence.
 */
@CapacitorPlugin(name = "AchievementManager")
class AchievementPlugin : Plugin() {

    private val manager by lazy { AchievementManager(context) }

    @PluginMethod
    fun unlock(call: PluginCall) {
        val id = call.getString("id")
        if (id.isNullOrBlank()) {
            call.reject("Missing required 'id' parameter")
            return
        }

        val alreadyUnlocked = manager.isUnlocked(id)
        val unlockedAt = manager.unlockAchievement(id)

        call.resolve(JSObject().apply {
            put("alreadyUnlocked", alreadyUnlocked)
            put("unlockedAt", unlockedAt)
        })
    }

    @PluginMethod
    fun isUnlocked(call: PluginCall) {
        val id = call.getString("id")
        if (id.isNullOrBlank()) {
            call.reject("Missing required 'id' parameter")
            return
        }

        call.resolve(JSObject().apply {
            put("unlocked", manager.isUnlocked(id))
            put("unlockedAt", manager.unlockedAt(id))
        })
    }

    @PluginMethod
    fun getAll(call: PluginCall) {
        val items = manager.getAllUnlocked().map { (id, unlockedAt) ->
            JSObject().apply {
                put("id", id)
                put("unlockedAt", unlockedAt)
            }
        }

        call.resolve(JSObject().apply { put("items", items) })
    }
}
