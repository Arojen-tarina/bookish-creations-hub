package fi.bookish.creations.arojen.tarinat.ui.multiplayer

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import fi.bookish.creations.arojen.tarinat.multiplayer.MessageRow
import fi.bookish.creations.arojen.tarinat.multiplayer.Multiplayer
import fi.bookish.creations.arojen.tarinat.multiplayer.MultiplayerException
import fi.bookish.creations.arojen.tarinat.multiplayer.RoomSession
import fi.bookish.creations.arojen.tarinat.multiplayer.VoiceRecorder
import fi.bookish.creations.arojen.tarinat.multiplayer.VoicePlayer
import fi.bookish.creations.arojen.tarinat.multiplayer.factionOfKey
import fi.bookish.creations.arojen.tarinat.ui.components.KeepFullScreen
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * The room's chat: text and voice messages (up to 30 seconds), with Report and
 * Mute on other players' messages (Play's rules for user content).
 */
@Composable
fun ChatDialog(session: RoomSession, multiplayer: Multiplayer, music: GameMusic, onDismiss: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snapshot by session.snapshot.collectAsStateWithLifecycle()
    val messages by session.messages.collectAsStateWithLifecycle()
    val muted by multiplayer.muted.collectAsStateWithLifecycle()
    val members = snapshot?.members.orEmpty()
    val shown = messages.filter { it.userId !in muted }

    var draft by remember { mutableStateOf("") }
    var notice by remember { mutableStateOf<Int?>(null) }
    var sending by remember { mutableStateOf(false) }

    val recorder = remember { VoiceRecorder(context) }
    val player = remember { VoicePlayer(context) }
    val playingId by player.playingId.collectAsStateWithLifecycle()
    var recording by remember { mutableStateOf(false) }
    var recordedMs by remember { mutableLongStateOf(0L) }
    val audioCache = remember { mutableStateMapOf<String, ByteArray>() }

    DisposableEffect(Unit) {
        onDispose {
            recorder.cancel()
            player.stop()
            music.setInterrupted(false)
        }
    }

    fun fail(e: MultiplayerException) {
        notice = multiplayerErrorRes(e.reason)
    }

    fun finishRecording() {
        if (!recording) return
        recording = false
        val clip = recorder.stop()
        music.setInterrupted(false)
        if (clip == null) return
        sending = true
        scope.launch {
            try {
                session.sendAudio(clip.bytes, clip.durationMs)
            } catch (e: MultiplayerException) {
                fail(e)
            } finally {
                sending = false
            }
        }
    }

    fun startRecording() {
        player.stop()
        if (recorder.start(onLimit = { finishRecording() })) {
            recording = true
            music.setInterrupted(true)
        } else {
            notice = R.string.mp_err_generic
        }
    }

    val micPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startRecording() else notice = R.string.mp_mic_denied
    }

    LaunchedEffect(recording) {
        while (recording) {
            recordedMs = recorder.elapsedMs
            delay(200)
        }
    }

    fun play(message: MessageRow) {
        val path = message.audioPath ?: return
        if (playingId == message.id) {
            player.stop()
            music.setInterrupted(false)
            return
        }
        scope.launch {
            try {
                val bytes = audioCache[path] ?: session.downloadAudio(path).also { audioCache[path] = it }
                music.setInterrupted(true)
                player.play(message.id, bytes) { music.setInterrupted(false) }
            } catch (e: MultiplayerException) {
                fail(e)
            }
        }
    }

    fun sendText() {
        val text = draft.trim()
        if (text.isEmpty() || sending) return
        sending = true
        scope.launch {
            try {
                session.sendText(text)
                draft = ""
            } catch (e: MultiplayerException) {
                fail(e)
            } finally {
                sending = false
            }
        }
    }

    // The window takes the keyboard insets itself, so the panel shrinks into the space above the
    // keyboard and the message field stays in sight, also on short screens.
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)) {
        KeepFullScreen()
        Box(Modifier.fillMaxSize().imePadding(), contentAlignment = Alignment.Center) {
            GamePanel(Modifier.widthIn(max = 560.dp).fillMaxWidth(0.92f).fillMaxHeight(0.92f), alpha = 0.98f) {
                Column(Modifier.padding(14.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(GameIcons.Chat, null, tint = GoldBright, modifier = Modifier.size(20.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(R.string.mp_chat), style = MaterialTheme.typography.titleLarge, color = GoldBright, modifier = Modifier.weight(1f))
                        RoundIconButton(GameIcons.Close, stringResource(R.string.common_close), onDismiss, size = 36.dp)
                    }
                    if (muted.isNotEmpty()) {
                        Text(stringResource(R.string.mp_muted_note), style = MaterialTheme.typography.labelSmall, color = TextLow)
                    }
                    val listState = rememberLazyListState()
                    LaunchedEffect(shown.size) { if (shown.isNotEmpty()) listState.animateScrollToItem(shown.lastIndex) }
                    Box(Modifier.weight(1f).fillMaxWidth().padding(vertical = 8.dp)) {
                        if (shown.isEmpty()) {
                            Text(stringResource(R.string.mp_chat_empty), style = MaterialTheme.typography.bodyMedium, color = TextMid, modifier = Modifier.align(Alignment.Center))
                        }
                        LazyColumn(state = listState, verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                            items(shown, key = { it.id }) { message ->
                                val author = members.firstOrNull { it.userId == message.userId }
                                ChatLine(
                                    message = message,
                                    authorName = author?.name.orEmpty(),
                                    authorColor = factionOfKey(author?.faction)?.let { FactionStyle.color(it) } ?: Gold,
                                    mine = message.userId == session.userId,
                                    playing = playingId == message.id,
                                    onPlay = { play(message) },
                                    onReport = {
                                        scope.launch {
                                            try {
                                                session.report(message)
                                                notice = R.string.mp_reported
                                            } catch (e: MultiplayerException) {
                                                fail(e)
                                            }
                                        }
                                    },
                                    onMute = { multiplayer.setMuted(message.userId, true) },
                                )
                            }
                        }
                    }
                    notice?.let {
                        Text(stringResource(it), style = MaterialTheme.typography.labelMedium, color = if (it == R.string.mp_reported) Jade else Rust, modifier = Modifier.padding(bottom = 6.dp))
                        LaunchedEffect(it) {
                            delay(4000)
                            notice = null
                        }
                    }
                    if (recording) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(Modifier.size(12.dp).clip(CircleShape).background(Rust))
                            Spacer(Modifier.width(8.dp))
                            Text(
                                stringResource(R.string.mp_recording, (recordedMs / 1000).toInt(), VoiceRecorder.MAX_MS / 1000),
                                style = MaterialTheme.typography.bodyMedium,
                                color = TextHigh,
                                modifier = Modifier.weight(1f),
                            )
                            RoundIconButton(GameIcons.Close, stringResource(R.string.mp_record_cancel), {
                                recording = false
                                recorder.cancel()
                                music.setInterrupted(false)
                            }, size = 40.dp)
                            Spacer(Modifier.width(8.dp))
                            RoundIconButton(GameIcons.Send, stringResource(R.string.mp_record_stop), ::finishRecording, size = 44.dp)
                        }
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = draft,
                                onValueChange = { draft = it.take(RoomSession.MAX_TEXT) },
                                placeholder = { Text(stringResource(R.string.mp_chat_hint), color = TextLow) },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                                keyboardActions = KeyboardActions(onSend = { sendText() }),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedTextColor = TextHigh,
                                    unfocusedTextColor = TextHigh,
                                    focusedBorderColor = Gold,
                                    unfocusedBorderColor = Gold.copy(alpha = 0.4f),
                                    cursorColor = GoldBright,
                                ),
                                modifier = Modifier.weight(1f),
                            )
                            Spacer(Modifier.width(8.dp))
                            RoundIconButton(GameIcons.Mic, stringResource(R.string.mp_record_start), {
                                val granted = ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
                                if (granted) startRecording() else micPermission.launch(Manifest.permission.RECORD_AUDIO)
                            }, size = 44.dp)
                            Spacer(Modifier.width(6.dp))
                            RoundIconButton(GameIcons.Send, stringResource(R.string.mp_send), ::sendText, size = 44.dp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatLine(
    message: MessageRow,
    authorName: String,
    authorColor: Color,
    mine: Boolean,
    playing: Boolean,
    onPlay: () -> Unit,
    onReport: () -> Unit,
    onMute: () -> Unit,
) {
    var menuOpen by remember { mutableStateOf(false) }
    val shape = RoundedCornerShape(10.dp)
    Column(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (mine) Ink700 else Ink900.copy(alpha = 0.6f))
            .border(1.dp, authorColor.copy(alpha = 0.5f), shape)
            .then(if (mine) Modifier else Modifier.clickable(role = Role.Button) { menuOpen = true })
            .padding(horizontal = 10.dp, vertical = 6.dp),
    ) {
        Text(authorName, style = MaterialTheme.typography.labelMedium, color = authorColor)
        if (message.kind == "audio") {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) {
                RoundIconButton(if (playing) GameIcons.Stop else GameIcons.Play, stringResource(if (playing) R.string.mp_stop else R.string.mp_play), onPlay, size = 34.dp)
                Spacer(Modifier.width(8.dp))
                Text(ltr(stringResource(R.string.mp_voice_message, ((message.audioMs ?: 0) + 500) / 1000)), style = MaterialTheme.typography.bodyMedium, color = TextHigh)
            }
        } else {
            Text(message.body.orEmpty(), style = MaterialTheme.typography.bodyMedium, color = TextHigh)
        }
        DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
            DropdownMenuItem(text = { Text(stringResource(R.string.mp_report)) }, onClick = {
                menuOpen = false
                onReport()
            })
            DropdownMenuItem(text = { Text(stringResource(R.string.mp_mute)) }, onClick = {
                menuOpen = false
                onMute()
            })
        }
    }
}
