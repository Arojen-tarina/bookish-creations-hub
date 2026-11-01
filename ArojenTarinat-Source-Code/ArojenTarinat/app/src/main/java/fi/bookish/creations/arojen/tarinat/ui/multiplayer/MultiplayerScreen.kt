package fi.bookish.creations.arojen.tarinat.ui.multiplayer

import android.text.format.DateUtils
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.multiplayer.Multiplayer
import fi.bookish.creations.arojen.tarinat.multiplayer.MultiplayerException
import fi.bookish.creations.arojen.tarinat.multiplayer.PublicRoom
import fi.bookish.creations.arojen.tarinat.multiplayer.serverTimeMillis
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.GameSheet
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.screens.faction.labelRes
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.launch

/**
 * Online play: the player's name, a room joined by its code, quick match, and
 * the match this phone is already in. The public games and the new-room options
 * open in bottom sheets, so the hub itself stays light.
 */
@Composable
fun MultiplayerScreen(multiplayer: Multiplayer?, onOpenRoom: (String) -> Unit, onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    var name by rememberSaveable { mutableStateOf(multiplayer?.playerName.orEmpty()) }
    var code by rememberSaveable { mutableStateOf("") }
    var difficulty by rememberSaveable { mutableStateOf(Difficulty.NORMAL) }
    var maxPlayers by rememberSaveable { mutableIntStateOf(2) }
    var public by rememberSaveable { mutableStateOf(false) }
    var openRooms by remember { mutableStateOf<List<PublicRoom>?>(null) }
    var sheet by rememberSaveable { mutableStateOf<HubSheet?>(null) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<Int?>(null) }
    // The multiplayer object never changes for the app's life, so this call is stable.
    val currentRoom = multiplayer?.roomId?.collectAsStateWithLifecycle()?.value
    val nameOk = name.isNotBlank()

    fun run(action: suspend () -> String) {
        if (busy) return
        busy = true
        error = null
        multiplayer?.playerName = name
        scope.launch {
            try {
                val room = action()
                sheet = null
                onOpenRoom(room)
            } catch (e: MultiplayerException) {
                error = multiplayerErrorRes(e.reason)
            } finally {
                busy = false
            }
        }
    }

    fun loadOpenRooms() {
        val m = multiplayer ?: return
        scope.launch { openRooms = runCatching { m.publicRooms() }.getOrNull() ?: emptyList() }
    }
    LaunchedEffect(Unit) {
        loadOpenRooms()
        multiplayer?.dropRoomIfGone()
    }
    // Opened from an invite link: the code is filled in, and the room joined when a name is set.
    LaunchedEffect(Unit) {
        val m = multiplayer ?: return@LaunchedEffect
        m.pendingInvite.collect { invite ->
            if (invite == null) return@collect
            m.consumeInvite()
            code = invite
            if (name.isNotBlank()) run { m.joinRoom(invite).id }
        }
    }

    BoardBackdrop {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 16.dp, vertical = 10.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                RoundIconButton(GameIcons.Back, stringResource(R.string.common_back), onBack, size = 40.dp)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(stringResource(R.string.mp_title), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
                    Text(stringResource(R.string.mp_intro), style = MaterialTheme.typography.bodySmall, color = TextMid)
                }
            }
            Spacer(Modifier.height(10.dp))
            if (multiplayer == null) {
                Text(stringResource(R.string.mp_err_unavailable), style = MaterialTheme.typography.bodyLarge, color = Rust)
                return@Column
            }
            Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                GamePanel(Modifier.weight(1f).fillMaxHeight()) {
                    Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp)) {
                        SectionTitle(stringResource(R.string.mp_name_label), icon = GameIcons.People)
                        GameTextField(name, { name = it.take(Multiplayer.MAX_NAME) }, stringResource(R.string.mp_name_hint))
                        if (!nameOk) Text(stringResource(R.string.mp_name_needed), style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 6.dp))
                        currentRoom?.let { roomId ->
                            Spacer(Modifier.height(14.dp))
                            SectionTitle(stringResource(R.string.mp_resume_title), icon = GameIcons.Swords)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                GameButton(stringResource(R.string.mp_resume), { onOpenRoom(roomId) }, Modifier.weight(1f), compact = true)
                                GameButton(stringResource(R.string.mp_leave), {
                                    scope.launch {
                                        multiplayer.leave(roomId)
                                        loadOpenRooms()
                                    }
                                }, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                            }
                            Text(stringResource(R.string.mp_leave_note), style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 4.dp))
                        }
                        Spacer(Modifier.height(14.dp))
                        SectionTitle(stringResource(R.string.mp_join), icon = GameIcons.Send)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            GameTextField(
                                code,
                                { code = it.uppercase().filter(Char::isLetterOrDigit).take(6) },
                                stringResource(R.string.mp_code_label),
                                Modifier.weight(1f),
                                capitals = true,
                            )
                            Spacer(Modifier.width(8.dp))
                            GameButton(stringResource(R.string.mp_join_button), { run { multiplayer.joinRoom(code).id } }, enabled = nameOk && code.length == 6 && !busy, compact = true)
                        }
                        if (sheet == null) ErrorLine(error)
                    }
                }
                GamePanel(Modifier.weight(1f).fillMaxHeight()) {
                    Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp)) {
                        SectionTitle(stringResource(R.string.mp_quick_match), icon = GameIcons.Swords)
                        Text(stringResource(R.string.mp_quick_match_hint), style = MaterialTheme.typography.labelMedium, color = TextMid)
                        GameButton(stringResource(R.string.mp_quick_match), { run { multiplayer.quickMatch().id } }, Modifier.fillMaxWidth().padding(top = 8.dp), enabled = nameOk && !busy)
                        Spacer(Modifier.height(16.dp))
                        val count = openRooms?.size
                        GameButton(
                            if (count == null) stringResource(R.string.mp_public_rooms) else stringResource(R.string.mp_public_rooms_count, count),
                            {
                                loadOpenRooms()
                                error = null
                                sheet = HubSheet.PUBLIC
                            },
                            Modifier.fillMaxWidth(),
                            GameButtonStyle.Secondary,
                            compact = true,
                        )
                        Spacer(Modifier.height(16.dp))
                        GameButton(stringResource(R.string.mp_create), {
                            error = null
                            sheet = HubSheet.CREATE
                        }, Modifier.fillMaxWidth(), GameButtonStyle.Secondary, compact = true)
                    }
                }
            }
        }
    }

    val online = multiplayer ?: return
    when (sheet) {
        HubSheet.PUBLIC -> GameSheet(onDismiss = { sheet = null }) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                SectionTitle(stringResource(R.string.mp_public_rooms), Modifier.weight(1f), icon = GameIcons.Compass)
                RoundIconButton(GameIcons.Rewind, stringResource(R.string.mp_refresh), ::loadOpenRooms, size = 34.dp)
            }
            if (!nameOk) Text(stringResource(R.string.mp_name_needed), style = MaterialTheme.typography.labelMedium, color = Rust)
            ErrorLine(error)
            val rooms = openRooms
            when {
                rooms == null -> Text(stringResource(R.string.mp_connecting), style = MaterialTheme.typography.labelMedium, color = TextLow)
                rooms.isEmpty() -> Text(stringResource(R.string.mp_no_public_rooms), style = MaterialTheme.typography.labelMedium, color = TextLow)
                else -> for (room in rooms) {
                    PublicRoomRow(room, enabled = nameOk && !busy) { run { online.joinRoom(room.code).id } }
                }
            }
        }
        HubSheet.CREATE -> GameSheet(onDismiss = { sheet = null }) {
            SectionTitle(stringResource(R.string.mp_create), icon = GameIcons.Flag)
            Text(stringResource(R.string.mp_difficulty_label), style = MaterialTheme.typography.labelLarge, color = TextMid)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(vertical = 6.dp)) {
                for (d in Difficulty.entries) PillChoice(stringResource(d.labelRes), d == difficulty) { difficulty = d }
            }
            Text(stringResource(R.string.mp_players_label), style = MaterialTheme.typography.labelLarge, color = TextMid)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(vertical = 6.dp)) {
                for (n in 2..4) PillChoice(n.toString(), n == maxPlayers) { maxPlayers = n }
            }
            Text(stringResource(R.string.mp_visibility), style = MaterialTheme.typography.labelLarge, color = TextMid)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(vertical = 6.dp)) {
                PillChoice(stringResource(R.string.mp_private), !public) { public = false }
                PillChoice(stringResource(R.string.mp_public), public) { public = true }
            }
            if (!nameOk) Text(stringResource(R.string.mp_name_needed), style = MaterialTheme.typography.labelMedium, color = Rust, modifier = Modifier.padding(top = 4.dp))
            ErrorLine(error)
            GameButton(
                stringResource(R.string.mp_create),
                { run { online.createRoom(difficulty.name.lowercase(), maxPlayers, public).id } },
                Modifier.fillMaxWidth().padding(top = 10.dp),
                enabled = nameOk && !busy,
            )
        }
        null -> Unit
    }
}

/** What the hub shows in its bottom sheet. */
private enum class HubSheet { PUBLIC, CREATE }

@Composable
private fun ErrorLine(error: Int?) {
    error?.let { Text(stringResource(it), style = MaterialTheme.typography.labelMedium, color = Rust, modifier = Modifier.padding(top = 8.dp)) }
}

/** One open public game: who opened it, how full it is, its AI difficulty and when it was made. */
@Composable
private fun PublicRoomRow(room: PublicRoom, enabled: Boolean, onJoin: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        val roomDifficulty = Difficulty.entries.firstOrNull { it.name.equals(room.difficulty, ignoreCase = true) } ?: Difficulty.NORMAL
        Column(Modifier.weight(1f)) {
            Text(
                stringResource(R.string.mp_room_line, room.hostName.orEmpty(), room.players, room.maxPlayers, stringResource(roomDifficulty.labelRes)),
                style = MaterialTheme.typography.bodyMedium,
                color = TextHigh,
            )
            // When the host opened it, in the phone's own language ("5 minutes ago").
            room.createdAt?.let(::serverTimeMillis)?.let { at ->
                // Under a minute it counts seconds, so a new room never reads "0 minutes ago".
                val now = System.currentTimeMillis()
                val ago = DateUtils.getRelativeTimeSpanString(minOf(at, now), now, if (now - at < DateUtils.MINUTE_IN_MILLIS) DateUtils.SECOND_IN_MILLIS else DateUtils.MINUTE_IN_MILLIS)
                Text(
                    stringResource(R.string.mp_room_created, ago.toString()),
                    style = MaterialTheme.typography.labelSmall,
                    color = TextLow,
                )
            }
        }
        GameButton(stringResource(R.string.mp_join_button), onJoin, enabled = enabled, compact = true)
    }
}

/** A text field in the game's colours. */
@Composable
fun GameTextField(value: String, onChange: (String) -> Unit, placeholder: String, modifier: Modifier = Modifier, capitals: Boolean = false) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        placeholder = { Text(placeholder, color = TextLow) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(capitalization = if (capitals) KeyboardCapitalization.Characters else KeyboardCapitalization.Words),
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = TextHigh,
            unfocusedTextColor = TextHigh,
            focusedBorderColor = Gold,
            unfocusedBorderColor = Gold.copy(alpha = 0.4f),
            cursorColor = GoldBright,
        ),
        modifier = modifier.fillMaxWidth(),
    )
}

/** One choice in a row of pills (difficulty, player count, realm). */
@Composable
fun PillChoice(label: String, selected: Boolean, enabled: Boolean = true, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Text(
        label,
        style = MaterialTheme.typography.labelLarge,
        color = when {
            selected -> Ink900
            enabled -> TextHigh
            else -> TextLow
        },
        modifier = Modifier
            .clip(shape)
            .background(if (selected) Gold else Ink700)
            .border(1.dp, if (selected) GoldBright else Gold.copy(alpha = if (enabled) 0.4f else 0.15f), shape)
            .clickable(enabled = enabled, role = Role.RadioButton, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
    )
}
