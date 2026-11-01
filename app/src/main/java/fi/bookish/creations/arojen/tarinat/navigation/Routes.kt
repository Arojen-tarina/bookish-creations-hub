package fi.bookish.creations.arojen.tarinat.navigation

import kotlinx.serialization.Serializable

@Serializable data object SplashRoute
@Serializable data object MenuRoute
@Serializable data object FactionSelectRoute

/**
 * A campaign screen. Starts a new game for [faction] / [difficulty] (engine
 * serial names, e.g. "mongol", "normal"), or resumes the save in [loadSlot]
 * (0 = autosave) when it is not [NEW_GAME]. A new game with [daily] is today's
 * daily challenge (its realm and difficulty come from the date, not the route).
 * With [room] it is that online room's shared campaign instead.
 */
@Serializable data class GameRoute(
    val faction: String,
    val difficulty: String,
    val loadSlot: Int = NEW_GAME,
    val daily: Boolean = false,
    val room: String? = null,
) {
    companion object {
        const val NEW_GAME = -1
    }
}

@Serializable data object LoadGameRoute
@Serializable data object AchievementsRoute
@Serializable data object CodexRoute
@Serializable data object RulebookRoute
@Serializable data object SettingsRoute
@Serializable data object MultiplayerRoute

/** The waiting room of an online game, until the host starts it. */
@Serializable data class LobbyRoute(val room: String)
