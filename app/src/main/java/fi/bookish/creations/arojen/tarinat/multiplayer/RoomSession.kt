package fi.bookish.creations.arojen.tarinat.multiplayer

import fi.bookish.creations.arojen.tarinat.game.engine.GameRandom
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.multiplayer.MpGame
import io.github.jan.supabase.postgrest.query.filter.FilterOperator
import io.github.jan.supabase.realtime.PostgresAction
import io.github.jan.supabase.realtime.RealtimeChannel
import io.github.jan.supabase.realtime.channel
import io.github.jan.supabase.realtime.postgresChangeFlow
import io.github.jan.supabase.realtime.realtime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.OffsetDateTime

/** The room as last read from the server. [game] is set once the host started it. */
data class RoomSnapshot(
    val room: RoomRow,
    val members: List<MemberRow>,
    val version: Int = 0,
    val game: MpGame? = null,
) {
    fun member(faction: FactionId): MemberRow? = members.firstOrNull { it.present && it.faction == faction.key }
    fun nameOf(faction: FactionId): String? = members.firstOrNull { it.faction == faction.key }?.name
}

fun factionOfKey(key: String?): FactionId? = FactionId.entries.firstOrNull { it.key == key }

/** A Postgres timestamp ("2026-10-31T15:40:41.049+00:00") in epoch millis; null if unreadable. */
fun serverTimeMillis(text: String): Long? = runCatching { OffsetDateTime.parse(text).toInstant().toEpochMilli() }.getOrNull()

/**
 * One room this phone is in: keeps [snapshot] and [messages] current through
 * realtime notifications, with a slow poll as a safety net for a dropped
 * connection, and carries out the lobby and turn actions.
 */
class RoomSession(
    private val service: MultiplayerService,
    val roomId: String,
    parent: CoroutineScope,
    private val rng: GameRandom,
) {
    private val job = SupervisorJob()
    private val scope = CoroutineScope(parent.coroutineContext + job + Dispatchers.Main.immediate)
    private val refreshLock = Mutex()

    private val _snapshot = MutableStateFlow<RoomSnapshot?>(null)
    val snapshot: StateFlow<RoomSnapshot?> = _snapshot.asStateFlow()

    private val _messages = MutableStateFlow<List<MessageRow>>(emptyList())
    val messages: StateFlow<List<MessageRow>> = _messages.asStateFlow()

    private val _online = MutableStateFlow(true)

    /** False while the server cannot be reached. */
    val online: StateFlow<Boolean> = _online.asStateFlow()

    private val _gone = MutableStateFlow(false)

    /** The room no longer exists (deleted, or this player was removed). */
    val gone: StateFlow<Boolean> = _gone.asStateFlow()

    var userId: String = ""
        private set

    private var channel: RealtimeChannel? = null

    val me: MemberRow? get() = _snapshot.value?.members?.firstOrNull { it.userId == userId }
    val myFaction: FactionId? get() = factionOfKey(me?.faction)
    val isHost: Boolean get() = _snapshot.value?.room?.hostId == userId

    fun start() {
        scope.launch {
            runCatching { userId = service.userId() }
            refresh()
            runCatching { _messages.value = service.messages(roomId) }
            subscribe()
            while (isActive) {
                delay(POLL_MS)
                refresh()
            }
        }
    }

    fun close() {
        val open = channel
        channel = null
        if (open != null) {
            CoroutineScope(Dispatchers.IO).launch { runCatching { service.client.realtime.removeChannel(open) } }
        }
        scope.cancel()
    }

    private suspend fun subscribe() {
        val ch = service.client.channel("room-$roomId")
        ch.postgresChangeFlow<PostgresAction>(schema = "public") {
            table = "mp_rooms"
            filter("id", FilterOperator.EQ, roomId)
        }.onEach { refresh() }.launchIn(scope)
        ch.postgresChangeFlow<PostgresAction>(schema = "public") {
            table = "mp_members"
            filter("room_id", FilterOperator.EQ, roomId)
        }.onEach { refresh() }.launchIn(scope)
        ch.postgresChangeFlow<PostgresAction.Insert>(schema = "public") {
            table = "mp_messages"
            filter("room_id", FilterOperator.EQ, roomId)
        }.onEach { insert -> service.decodeMessage(insert.record)?.let(::addMessage) }.launchIn(scope)
        runCatching { ch.subscribe() }
        channel = ch
    }

    private fun addMessage(message: MessageRow) {
        _messages.update { list -> if (list.any { it.id == message.id }) list else (list + message).takeLast(MAX_MESSAGES) }
    }

    /** Reads the room, its members and (when its version moved) the game. */
    suspend fun refresh() = refreshLock.withLock {
        try {
            val room = service.room(roomId)
            if (room == null) {
                _gone.value = true
                return@withLock
            }
            val members = service.members(roomId)
            val known = _snapshot.value
            var version = known?.version ?: 0
            var game = known?.game
            if (room.status != "lobby" && room.version != version) {
                service.game(roomId)?.let { (v, g) ->
                    version = v
                    game = g
                }
            }
            _snapshot.value = RoomSnapshot(room, members, version, game)
            _online.value = true
            if (userId.isNotEmpty() && members.none { it.userId == userId && it.present }) _gone.value = true
        } catch (_: MultiplayerException) {
            _online.value = false
        }
    }

    // ---------------------------------------------------------------- lobby

    suspend fun chooseFaction(faction: FactionId) {
        service.chooseFaction(roomId, faction.key)
        refresh()
    }

    suspend fun setReady(ready: Boolean) {
        service.setReady(roomId, ready)
        refresh()
    }

    suspend fun leave() {
        service.leaveRoom(roomId)
    }

    /** Host only: builds the opening game from the room's seed (players in joining order) and starts it. */
    suspend fun startGame() {
        val snap = _snapshot.value ?: return
        val factions = snap.members.filter { it.present }.mapNotNull { factionOfKey(it.faction) }
        val difficulty = Difficulty.entries.firstOrNull { it.name.equals(snap.room.difficulty, ignoreCase = true) } ?: Difficulty.NORMAL
        service.startGame(roomId, MpGame.start(factions, difficulty, snap.room.seed))
        refresh()
    }

    // ---------------------------------------------------------------- game

    /** Seats whose player has left the room but still play in the game. */
    private fun departed(snap: RoomSnapshot, game: MpGame): List<FactionId> =
        game.seats.filter { !it.left && snap.member(it.faction) == null }.map { it.faction }

    /** Ends this player's turn with [viewAfterActions] (their state after their actions) and uploads the game. */
    suspend fun submitMyTurn(viewAfterActions: GameState) {
        val snap = _snapshot.value ?: throw MultiplayerException("server")
        var game = snap.game ?: throw MultiplayerException("server")
        // Players who left meanwhile hand their realm to the AI from this round on.
        for (faction in departed(snap, game)) if (faction != game.activeFaction) game = game.markLeft(faction, rng)
        val next = withContext(Dispatchers.Default) { game.endSeatTurn(viewAfterActions, rng) }
        push(snap, next)
    }

    /**
     * Passes the turn of a player who left, or who has been idle on their turn
     * for [IDLE_SKIP_MS]: their realm turns AI.
     */
    suspend fun skipAbsentPlayer() {
        val snap = _snapshot.value ?: return
        val game = snap.game ?: return
        val next = withContext(Dispatchers.Default) { game.markLeft(game.activeFaction, rng) }
        push(snap, next)
    }

    /** True when the player on turn has left the room, or sat idle long enough to be skipped. */
    fun activePlayerAbsent(now: Instant = Instant.now()): Boolean {
        val snap = _snapshot.value ?: return false
        val game = snap.game ?: return false
        if (game.finished || game.activeFaction == myFaction) return false
        if (snap.member(game.activeFaction) == null) return true
        val since = snap.room.updatedAt?.let(::serverTimeMillis) ?: return false
        return now.toEpochMilli() - since > IDLE_SKIP_MS
    }

    private suspend fun push(snap: RoomSnapshot, next: MpGame) = withContext(NonCancellable) {
        val version = service.submitTurn(roomId, snap.version, next)
        _snapshot.value = snap.copy(
            version = version,
            game = next,
            room = snap.room.copy(version = version, activeFaction = next.activeFaction.key, turn = next.world.turn, updatedAt = Instant.now().toString()),
        )
    }

    // ---------------------------------------------------------------- chat

    suspend fun sendText(text: String) {
        service.sendText(roomId, text.trim().take(MAX_TEXT))
        runCatching { _messages.value = service.messages(roomId) }
    }

    suspend fun sendAudio(bytes: ByteArray, durationMs: Int) {
        service.sendAudio(roomId, bytes, durationMs)
        runCatching { _messages.value = service.messages(roomId) }
    }

    suspend fun downloadAudio(path: String): ByteArray = service.downloadAudio(path)

    suspend fun report(message: MessageRow) = service.report(message)

    companion object {
        const val POLL_MS = 15_000L
        const val IDLE_SKIP_MS = 15 * 60 * 1000L
        const val MAX_TEXT = 300
        private const val MAX_MESSAGES = 200
    }
}
