package fi.bookish.creations.arojen.tarinat.multiplayer

import android.app.Application
import android.content.Context
import androidx.core.content.edit
import fi.bookish.creations.arojen.tarinat.game.engine.GameRandom
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * App-wide online play: the service, the player's chosen name, the room this
 * phone is in (remembered across launches so a match can be resumed) and the
 * players this phone has muted in chat.
 */
class Multiplayer(app: Application, private val service: MultiplayerService, private val scope: CoroutineScope) {
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    var playerName: String
        get() = prefs.getString(KEY_NAME, "").orEmpty()
        set(value) = prefs.edit { putString(KEY_NAME, value.trim().take(MAX_NAME)) }

    private val _roomId = MutableStateFlow(prefs.getString(KEY_ROOM, null))

    /** The room this phone last joined and has not left. */
    val roomId: StateFlow<String?> = _roomId.asStateFlow()

    private val _muted = MutableStateFlow(prefs.getStringSet(KEY_MUTED, emptySet()).orEmpty())

    /** Players whose chat this phone hides. */
    val muted: StateFlow<Set<String>> = _muted.asStateFlow()

    private var current: RoomSession? = null

    private val _pendingInvite = MutableStateFlow<String?>(null)

    /** A room code from an invite link the app was opened with, until the Multiplayer screen takes it. */
    val pendingInvite: StateFlow<String?> = _pendingInvite.asStateFlow()

    /** Reads a room code from an invite link (https://…/join/ABC123); false when it is not one. */
    fun acceptInviteLink(link: String?): Boolean {
        val code = link?.let { INVITE_PATTERN.find(it)?.groupValues?.get(1)?.uppercase() } ?: return false
        _pendingInvite.value = code
        return true
    }

    fun consumeInvite(): String? = _pendingInvite.value.also { _pendingInvite.value = null }

    /** The link that opens this room in the game (or its download page). */
    fun inviteLink(code: String) = "$INVITE_BASE$code"

    /** The live session for [roomId], opening it when needed (only one room at a time). */
    fun session(roomId: String): RoomSession {
        current?.takeIf { it.roomId == roomId }?.let { return it }
        current?.close()
        rememberRoom(roomId)
        return RoomSession(service, roomId, scope, GameRandom.System).also {
            current = it
            it.start()
        }
    }

    suspend fun createRoom(difficulty: String, maxPlayers: Int, public: Boolean): RoomRow =
        service.createRoom(playerName, difficulty, maxPlayers, public).also { rememberRoom(it.id) }

    suspend fun quickMatch(): RoomRow = service.quickMatch(playerName).also { rememberRoom(it.id) }

    suspend fun publicRooms(): List<PublicRoom> = service.publicRooms()

    suspend fun joinRoom(code: String): RoomRow =
        service.joinRoom(code, playerName).also { rememberRoom(it.id) }

    /** Leaves the room for good (in a running game the realm turns AI). */
    suspend fun leave(roomId: String) {
        runCatching { service.leaveRoom(roomId) }
        forget(roomId)
    }

    /** Forgets the remembered room once the server no longer shows it to this player (deleted, or left); a network error keeps it. */
    suspend fun dropRoomIfGone() {
        val id = _roomId.value ?: return
        try {
            service.userId()
            if (service.room(id) == null) forget(id)
        } catch (_: MultiplayerException) {
            // Offline: keep it until the server can answer.
        }
    }

    /** Stops following [roomId] on this phone (it was deleted, or the match ended). */
    fun forget(roomId: String) {
        if (current?.roomId == roomId) {
            current?.close()
            current = null
        }
        if (_roomId.value == roomId) {
            _roomId.value = null
            prefs.edit { remove(KEY_ROOM) }
        }
    }

    fun setMuted(userId: String, muted: Boolean) {
        val next = if (muted) _muted.value + userId else _muted.value - userId
        _muted.value = next
        prefs.edit { putStringSet(KEY_MUTED, next) }
    }

    private fun rememberRoom(roomId: String) {
        _roomId.value = roomId
        prefs.edit { putString(KEY_ROOM, roomId) }
    }

    companion object {
        const val MAX_NAME = 20
        private const val INVITE_BASE = "https://dl.arojentarinat.com/join/"
        private val INVITE_PATTERN = Regex("/join/([A-Za-z0-9]{6})")
        private const val PREFS = "multiplayer"
        private const val KEY_NAME = "name"
        private const val KEY_ROOM = "room"
        private const val KEY_MUTED = "muted"
    }
}
