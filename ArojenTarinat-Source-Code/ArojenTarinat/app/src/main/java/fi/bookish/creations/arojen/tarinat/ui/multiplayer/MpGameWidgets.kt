package fi.bookish.creations.arojen.tarinat.ui.multiplayer

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.multiplayer.Multiplayer
import fi.bookish.creations.arojen.tarinat.multiplayer.RoomSession
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.GameUiState
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/** Online: whose turn it is while it is not this player's, and a way past a player who left or idles. */
@Composable
fun TurnBanner(ui: GameUiState, onSkip: () -> Unit) {
    val text = when {
        ui.eliminated -> stringResource(R.string.mp_eliminated)
        ui.waitingFor == null -> return
        ui.waitingFor.isEmpty() -> stringResource(R.string.mp_connecting)
        else -> stringResource(R.string.mp_waiting_for, ui.waitingFor)
    }
    Column(
        Modifier
            .widthIn(max = 420.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(Ink900.copy(alpha = 0.9f))
            .border(1.dp, if (ui.eliminated) Rust else Gold, RoundedCornerShape(14.dp))
            .padding(horizontal = 14.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(text, style = MaterialTheme.typography.titleSmall, color = TextHigh, textAlign = TextAlign.Center)
        if (ui.canSkipAbsent && !ui.eliminated) {
            Text(stringResource(R.string.mp_skip_hint), style = MaterialTheme.typography.labelSmall, color = TextMid, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 4.dp))
            GameButton(stringResource(R.string.mp_skip_absent), onSkip, Modifier.padding(top = 6.dp), compact = true)
        }
    }
}

/** Opens the room's chat; a dot counts messages that came in since it was last opened. */
@Composable
fun ChatButton(session: RoomSession, multiplayer: Multiplayer, chatOpen: Boolean, onOpen: () -> Unit) {
    val messages by session.messages.collectAsStateWithLifecycle()
    val muted by multiplayer.muted.collectAsStateWithLifecycle()
    var seenUpTo by rememberSaveable { mutableLongStateOf(messages.lastOrNull()?.id ?: 0L) }
    // What arrives while the chat is open has been seen.
    LaunchedEffect(chatOpen, messages.size) { if (chatOpen) messages.lastOrNull()?.let { seenUpTo = it.id } }
    val unread = messages.count { it.id > seenUpTo && it.userId != session.userId && it.userId !in muted }
    Box {
        RoundIconButton(GameIcons.Chat, stringResource(R.string.mp_chat), {
            seenUpTo = messages.lastOrNull()?.id ?: seenUpTo
            onOpen()
        })
        if (unread > 0) {
            Text(
                if (unread > 9) "9+" else unread.toString(),
                style = MaterialTheme.typography.labelSmall,
                color = TextHigh,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .clip(CircleShape)
                    .background(Rust)
                    .padding(horizontal = 5.dp, vertical = 1.dp),
            )
        }
    }
}
