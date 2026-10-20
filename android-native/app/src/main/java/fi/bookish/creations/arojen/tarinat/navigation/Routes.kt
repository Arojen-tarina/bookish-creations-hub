package fi.bookish.creations.arojen.tarinat.navigation

import kotlinx.serialization.Serializable

@Serializable data object SplashRoute
@Serializable data object MenuRoute
@Serializable data object FactionSelectRoute

/**
 * A campaign screen. Starts a new game for [faction] / [difficulty] (engine
 * serial names, e.g. "mongol", "normal"), or resumes the save in [loadSlot]
 * (0 = autosave) when it is not [NEW_GAME].
 */
@Serializable data class GameRoute(val faction: String, val difficulty: String, val loadSlot: Int = NEW_GAME) {
    companion object {
        const val NEW_GAME = -1
    }
}

@Serializable data object LoadGameRoute
@Serializable data object AchievementsRoute
@Serializable data object CodexRoute
@Serializable data object RulebookRoute
@Serializable data object SettingsRoute
