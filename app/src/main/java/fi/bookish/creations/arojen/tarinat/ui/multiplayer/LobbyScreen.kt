package fi.bookish.creations.arojen.tarinat.ui.multiplayer

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.multiplayer.Multiplayer
import fi.bookish.creations.arojen.tarinat.multiplayer.MultiplayerException
import fi.bookish.creations.arojen.tarinat.multiplayer.RoomSession
import fi.bookish.creations.arojen.tarinat.multiplayer.factionOfKey
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.KeepFullScreen
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.screens.faction.labelRes
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.launch

/**
 * The waiting room: the code to share, who is in, each player's realm and
 * readiness, and the host's Start. Opens the campaign once it has begun.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LobbyScreen(
    session: RoomSession,
    multiplayer: Multiplayer,
    music: GameMusic,
    onGameReady: () -> Unit,
    onLeft: () -> Unit,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snapshot by session.snapshot.collectAsStateWithLifecycle()
    val gone by session.gone.collectAsStateWithLifecycle()
    val online by session.online.collectAsStateWithLifecycle()
    var error by remember { mutableStateOf<Int?>(null) }
    var busy by remember { mutableStateOf(false) }
    var chatOpen by remember { mutableStateOf(false) }
    var confirmLeave by remember { mutableStateOf(false) }

    LaunchedEffect(gone) {
        if (gone) {
            multiplayer.forget(session.roomId)
            onLeft()
        }
    }
    val started = snapshot?.let { it.room.status != "lobby" && it.game != null } == true
    LaunchedEffect(started, session.myFaction) { if (started && session.myFaction != null) onGameReady() }

    fun act(block: suspend () -> Unit) {
        if (busy) return
        busy = true
        error = null
        scope.launch {
            try {
                block()
            } catch (e: MultiplayerException) {
                error = multiplayerErrorRes(e.reason)
                session.refresh()
            } finally {
                busy = false
            }
        }
    }

    BoardBackdrop {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 16.dp, vertical = 10.dp),
        ) {
            val snap = snapshot
            val room = snap?.room
            Row(verticalAlignment = Alignment.CenterVertically) {
                RoundIconButton(GameIcons.Back, stringResource(R.string.common_back), onBack, size = 40.dp)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(stringResource(R.string.mp_room_code), style = MaterialTheme.typography.labelMedium, color = TextMid)
                    Text(ltr(room?.code ?: "······"), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
                }
                if (room != null) {
                    val shareText = stringResource(R.string.mp_share_text, room.code) + "\n" + multiplayer.inviteLink(room.code)
                    val shareTitle = stringResource(R.string.mp_share)
                    GameButton(shareTitle, {
                        val send = Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_TEXT, shareText)
                        context.startActivity(Intent.createChooser(send, shareTitle))
                    }, style = GameButtonStyle.Secondary, compact = true)
                    Spacer(Modifier.width(8.dp))
                }
                RoundIconButton(GameIcons.Chat, stringResource(R.string.mp_chat), { chatOpen = true }, size = 40.dp)
            }
            if (!online) Text(stringResource(R.string.mp_offline), style = MaterialTheme.typography.labelMedium, color = Rust)
            Spacer(Modifier.height(10.dp))
            if (snap == null || room == null) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(stringResource(R.string.mp_connecting), style = MaterialTheme.typography.bodyLarge, color = TextMid)
                }
                return@Column
            }
            val present = snap.members.filter { it.present }
            val me = session.me
            val isHost = session.isHost
            val takenByOthers = present.filter { it.userId != session.userId }.mapNotNull { factionOfKey(it.faction) }.toSet()
            val canStart = present.size >= 2 && present.all { it.faction != null } && present.all { it.ready || it.userId == room.hostId }
            Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                GamePanel(Modifier.weight(1f).fillMaxHeight()) {
                    Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp)) {
                        SectionTitle(stringResource(R.string.mp_players_count, present.size, room.maxPlayers), icon = GameIcons.People)
                        for (member in present) {
                            val faction = factionOfKey(member.faction)
                            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(12.dp).clip(CircleShape).background(faction?.let { FactionStyle.color(it) } ?: TextLow))
                                Spacer(Modifier.width(10.dp))
                                Column(Modifier.weight(1f)) {
                                    val tags = buildList {
                                        if (member.userId == session.userId) add(stringResource(R.string.mp_you))
                                        if (member.userId == room.hostId) add(stringResource(R.string.mp_host))
                                    }
                                    Text(
                                        if (tags.isEmpty()) member.name else "${member.name} (${tags.joinToString(", ")})",
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = TextHigh,
                                    )
                                    Text(faction?.let { stringResource(it.nameRes) } ?: stringResource(R.string.mp_no_realm), style = MaterialTheme.typography.labelMedium, color = TextMid)
                                }
                                if (member.userId != room.hostId) {
                                    Icon(
                                        if (member.ready) GameIcons.Check else GameIcons.Close,
                                        stringResource(if (member.ready) R.string.mp_ready else R.string.mp_not_ready),
                                        tint = if (member.ready) Jade else TextLow,
                                        modifier = Modifier.size(18.dp),
                                    )
                                }
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                        val difficulty = Difficulty.entries.firstOrNull { it.name.equals(room.difficulty, ignoreCase = true) } ?: Difficulty.NORMAL
                        Text(stringResource(R.string.mp_ai_difficulty, stringResource(difficulty.labelRes)), style = MaterialTheme.typography.labelMedium, color = TextMid)
                    }
                }
                GamePanel(Modifier.weight(1f).fillMaxHeight()) {
                    Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp)) {
                        SectionTitle(stringResource(R.string.mp_choose_realm), icon = GameIcons.Flag)
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            for (faction in ACTIVE_FACTIONS) {
                                val mine = me?.faction == faction.key
                                PillChoice(stringResource(faction.nameRes), mine, enabled = faction !in takenByOthers && !busy) {
                                    if (!mine) act { session.chooseFaction(faction) }
                                }
                            }
                        }
                        Spacer(Modifier.height(14.dp))
                        if (isHost) {
                            GameButton(stringResource(R.string.mp_start), { act { session.startGame() } }, Modifier.fillMaxWidth(), enabled = canStart && !busy)
                            if (!canStart) Text(stringResource(R.string.mp_start_hint), style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 6.dp))
                        } else {
                            val ready = me?.ready == true
                            GameButton(
                                stringResource(if (ready) R.string.mp_not_ready else R.string.mp_ready),
                                { act { session.setReady(!ready) } },
                                Modifier.fillMaxWidth(),
                                style = if (ready) GameButtonStyle.Secondary else GameButtonStyle.Primary,
                                enabled = me?.faction != null && !busy,
                            )
                            Text(stringResource(R.string.mp_waiting_host), style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 6.dp))
                        }
                        error?.let { Text(stringResource(it), style = MaterialTheme.typography.labelMedium, color = Rust, modifier = Modifier.padding(top = 8.dp)) }
                        Spacer(Modifier.height(14.dp))
                        GameButton(stringResource(R.string.mp_leave), { confirmLeave = true }, Modifier.fillMaxWidth(), GameButtonStyle.Secondary, compact = true)
                    }
                }
            }
        }
    }

    if (chatOpen) ChatDialog(session, multiplayer, music) { chatOpen = false }
    if (confirmLeave) {
        LeaveRoomDialog(onConfirm = {
            confirmLeave = false
            scope.launch {
                multiplayer.leave(session.roomId)
                onLeft()
            }
        }, onDismiss = { confirmLeave = false })
    }
}

/** Asks before leaving a room for good. */
@Composable
fun LeaveRoomDialog(onConfirm: () -> Unit, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        KeepFullScreen()
        GamePanel(alpha = 0.98f) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(stringResource(R.string.mp_leave_confirm_title), style = MaterialTheme.typography.headlineSmall, color = GoldBright)
                Spacer(Modifier.height(8.dp))
                Text(stringResource(R.string.mp_leave_note), style = MaterialTheme.typography.bodyMedium, color = TextMid)
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GameButton(stringResource(R.string.save_cancel), onDismiss, style = GameButtonStyle.Secondary)
                    GameButton(stringResource(R.string.mp_leave), onConfirm)
                }
            }
        }
    }
}
