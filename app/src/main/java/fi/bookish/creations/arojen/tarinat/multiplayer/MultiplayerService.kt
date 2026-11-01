package fi.bookish.creations.arojen.tarinat.multiplayer

import android.util.Base64
import fi.bookish.creations.arojen.tarinat.game.multiplayer.MpGame
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.query.Order
import io.github.jan.supabase.realtime.Realtime
import io.github.jan.supabase.storage.Storage
import io.github.jan.supabase.storage.storage
import io.ktor.http.ContentType
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.util.UUID
import java.util.zip.GZIPInputStream
import java.util.zip.GZIPOutputStream

@Serializable
data class RoomRow(
    val id: String,
    val code: String,
    @SerialName("host_id") val hostId: String,
    val status: String,
    val difficulty: String,
    @SerialName("max_players") val maxPlayers: Int,
    val seed: Int,
    val version: Int,
    @SerialName("active_faction") val activeFaction: String? = null,
    val turn: Int = 0,
    @SerialName("updated_at") val updatedAt: String? = null,
    @SerialName("is_public") val isPublic: Boolean = false,
) {
    val inLobby: Boolean get() = status == "lobby"
}

/** An open public game, as the room list shows it. */
@Serializable
data class PublicRoom(
    val code: String,
    @SerialName("host_name") val hostName: String? = null,
    val players: Int,
    @SerialName("max_players") val maxPlayers: Int,
    val difficulty: String,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
data class MemberRow(
    @SerialName("room_id") val roomId: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    val faction: String? = null,
    val ready: Boolean = false,
    @SerialName("left_at") val leftAt: String? = null,
    @SerialName("joined_at") val joinedAt: String? = null,
) {
    val present: Boolean get() = leftAt == null
}

@Serializable
data class MessageRow(
    val id: Long,
    @SerialName("room_id") val roomId: String,
    @SerialName("user_id") val userId: String,
    val kind: String,
    val body: String? = null,
    @SerialName("audio_path") val audioPath: String? = null,
    @SerialName("audio_ms") val audioMs: Int? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
private data class StateRow(val version: Int, val state: String)

@Serializable
private data class NewMessage(
    @SerialName("room_id") val roomId: String,
    val kind: String,
    val body: String? = null,
    @SerialName("audio_path") val audioPath: String? = null,
    @SerialName("audio_ms") val audioMs: Int? = null,
)

@Serializable
private data class NewReport(
    @SerialName("room_id") val roomId: String,
    @SerialName("message_id") val messageId: Long,
    @SerialName("reported_user") val reportedUser: String,
    @SerialName("message_kind") val kind: String,
    @SerialName("message_body") val body: String?,
    @SerialName("audio_path") val audioPath: String?,
)

/** A failed call, with the server's reason when it gave one (e.g. "room_full", "stale_version"). */
class MultiplayerException(val reason: String, cause: Throwable? = null) : Exception(reason, cause)

/**
 * Online play through the project's Supabase: anonymous accounts, rooms joined
 * by code, the shared game (compressed JSON), chat and audio messages. The
 * database side is supabase/sql/002_multiplayer.sql.
 */
class MultiplayerService(url: String, key: String) {
    val client: SupabaseClient = createSupabaseClient(url, key) {
        install(Auth)
        install(Postgrest)
        install(Realtime)
        install(Storage)
    }

    private val json = Json { ignoreUnknownKeys = true }

    /** This phone's anonymous player id, signing in on first use. */
    suspend fun userId(): String = call {
        client.auth.awaitInitialization()
        client.auth.currentUserOrNull()?.id ?: run {
            client.auth.signInAnonymously()
            client.auth.currentUserOrNull()?.id ?: throw MultiplayerException("sign_in_failed")
        }
    }

    suspend fun createRoom(name: String, difficulty: String, maxPlayers: Int, public: Boolean): RoomRow = call {
        userId()
        client.postgrest.rpc("mp_create_room", buildJsonObject {
            put("p_name", name)
            put("p_difficulty", difficulty)
            put("p_max_players", maxPlayers)
            put("p_public", public)
        }).decodeAs<RoomRow>()
    }

    /** Joins the oldest open public game, or opens a new public room for others to join. */
    suspend fun quickMatch(name: String): RoomRow = call {
        userId()
        client.postgrest.rpc("mp_quick_match", buildJsonObject { put("p_name", name) }).decodeAs<RoomRow>()
    }

    suspend fun publicRooms(): List<PublicRoom> = call {
        userId()
        client.postgrest.rpc("mp_list_public_rooms").decodeList<PublicRoom>()
    }

    suspend fun joinRoom(code: String, name: String): RoomRow = call {
        userId()
        client.postgrest.rpc("mp_join_room", buildJsonObject {
            put("p_code", code)
            put("p_name", name)
        }).decodeAs<RoomRow>()
    }

    suspend fun chooseFaction(roomId: String, faction: String) = call {
        client.postgrest.rpc("mp_choose_faction", buildJsonObject {
            put("p_room", roomId)
            put("p_faction", faction)
        })
        Unit
    }

    suspend fun setReady(roomId: String, ready: Boolean) = call {
        client.postgrest.rpc("mp_set_ready", buildJsonObject {
            put("p_room", roomId)
            put("p_ready", ready)
        })
        Unit
    }

    suspend fun leaveRoom(roomId: String) = call {
        client.postgrest.rpc("mp_leave_room", buildJsonObject { put("p_room", roomId) })
        Unit
    }

    suspend fun room(roomId: String): RoomRow? = call {
        client.from("mp_rooms").select { filter { eq("id", roomId) } }.decodeSingleOrNull<RoomRow>()
    }

    suspend fun members(roomId: String): List<MemberRow> = call {
        client.from("mp_members").select { filter { eq("room_id", roomId) } }.decodeList<MemberRow>()
            .sortedBy { it.joinedAt }
    }

    /** The shared game and its version, or null before the host started it. */
    suspend fun game(roomId: String): Pair<Int, MpGame>? = call {
        val row = client.from("mp_room_states").select { filter { eq("room_id", roomId) } }.decodeSingleOrNull<StateRow>()
            ?: return@call null
        row.version to decode(row.state)
    }

    suspend fun startGame(roomId: String, game: MpGame): Int = call {
        client.postgrest.rpc("mp_start_game", buildJsonObject {
            put("p_room", roomId)
            put("p_state", encode(game))
            put("p_active_faction", game.activeFaction.key)
            put("p_turn", game.world.turn)
        }).decodeAs<Int>()
    }

    /** Replaces the game, if it is still at [expectedVersion]; returns the new version. */
    suspend fun submitTurn(roomId: String, expectedVersion: Int, game: MpGame): Int = call {
        client.postgrest.rpc("mp_submit_turn", buildJsonObject {
            put("p_room", roomId)
            put("p_expected_version", expectedVersion)
            put("p_state", encode(game))
            put("p_active_faction", game.activeFaction.key)
            put("p_turn", game.world.turn)
            put("p_finished", game.finished)
        }).decodeAs<Int>()
    }

    suspend fun messages(roomId: String, limit: Long = 80): List<MessageRow> = call {
        client.from("mp_messages").select {
            filter { eq("room_id", roomId) }
            order("id", Order.DESCENDING)
            limit(limit)
        }.decodeList<MessageRow>().reversed()
    }

    suspend fun sendText(roomId: String, text: String) = call {
        client.from("mp_messages").insert(NewMessage(roomId, "text", body = text))
        Unit
    }

    /** Uploads an AAC (.m4a) recording, then posts it to the room's chat. */
    suspend fun sendAudio(roomId: String, bytes: ByteArray, durationMs: Int) = call {
        val path = "$roomId/${userId()}/${UUID.randomUUID()}.m4a"
        client.storage.from(AUDIO_BUCKET).upload(path, bytes) {
            upsert = false
            contentType = ContentType.parse("audio/mp4")
        }
        client.from("mp_messages").insert(NewMessage(roomId, "audio", audioPath = path, audioMs = durationMs))
        Unit
    }

    suspend fun downloadAudio(path: String): ByteArray = call {
        client.storage.from(AUDIO_BUCKET).downloadAuthenticated(path)
    }

    suspend fun report(message: MessageRow) = call {
        client.from("mp_reports").insert(NewReport(message.roomId, message.id, message.userId, message.kind, message.body, message.audioPath))
        Unit
    }

    fun decodeMessage(record: JsonObject): MessageRow? =
        runCatching { json.decodeFromJsonElement(MessageRow.serializer(), record) }.getOrNull()

    fun decodeRoom(record: JsonObject): RoomRow? =
        runCatching { json.decodeFromJsonElement(RoomRow.serializer(), record) }.getOrNull()

    private fun encode(game: MpGame): String {
        val raw = json.encodeToString(MpGame.serializer(), game).toByteArray()
        val out = ByteArrayOutputStream()
        GZIPOutputStream(out).use { it.write(raw) }
        return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }

    private fun decode(state: String): MpGame {
        val bytes = GZIPInputStream(ByteArrayInputStream(Base64.decode(state, Base64.NO_WRAP))).use { it.readBytes() }
        return json.decodeFromString(MpGame.serializer(), bytes.decodeToString())
    }

    /** Runs [block], turning library errors into [MultiplayerException] with the server's reason. */
    private suspend fun <T> call(block: suspend () -> T): T = try {
        block()
    } catch (e: MultiplayerException) {
        throw e
    } catch (e: Exception) {
        throw MultiplayerException(reasonOf(e), e)
    }

    private fun reasonOf(e: Exception): String {
        val text = e.message.orEmpty()
        return KNOWN_REASONS.firstOrNull { it in text } ?: if (e is IOException || "Unable to resolve host" in text || "timeout" in text.lowercase()) "network" else "server"
    }

    companion object {
        const val AUDIO_BUCKET = "mp-audio"

        private val KNOWN_REASONS = listOf(
            "room_not_found", "room_started", "room_full", "faction_taken", "not_member", "not_host",
            "need_two_players", "not_ready", "stale_version", "not_your_turn", "not_playing", "too_many_messages",
            "anonymous_provider_disabled", "Anonymous sign-ins are disabled",
        )
    }
}
