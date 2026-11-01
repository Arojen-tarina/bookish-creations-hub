package fi.bookish.creations.arojen.tarinat.ui.multiplayer

import androidx.annotation.StringRes
import fi.bookish.creations.arojen.tarinat.R

/** What to tell the player for a [fi.bookish.creations.arojen.tarinat.multiplayer.MultiplayerException] reason. */
@StringRes
fun multiplayerErrorRes(reason: String): Int = when (reason) {
    "room_not_found" -> R.string.mp_err_room_not_found
    "room_started" -> R.string.mp_err_room_started
    "room_full" -> R.string.mp_err_room_full
    "faction_taken" -> R.string.mp_err_faction_taken
    "not_ready" -> R.string.mp_err_not_ready
    "need_two_players" -> R.string.mp_err_need_two
    "stale_version" -> R.string.mp_err_stale
    "not_your_turn" -> R.string.mp_err_not_your_turn
    "too_many_messages" -> R.string.mp_err_too_many
    "network" -> R.string.mp_err_network
    "anonymous_provider_disabled", "Anonymous sign-ins are disabled", "sign_in_failed" -> R.string.mp_err_unavailable
    else -> R.string.mp_err_generic
}
