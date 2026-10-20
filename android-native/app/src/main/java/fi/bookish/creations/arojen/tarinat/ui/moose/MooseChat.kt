package fi.bookish.creations.arojen.tarinat.ui.moose

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.isImeVisible
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.moose.MooseGuide
import fi.bookish.creations.arojen.tarinat.moose.MooseTexts
import fi.bookish.creations.arojen.tarinat.ui.components.assetLanguage
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldDeep
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

private const val MAX_QUESTION = 500

/** Ready-made questions: label and the local entry (generated id) that answers it. */
private val TOPICS: List<Pair<Int, String>> = listOf(
    R.string.moose_topic_win to "win",
    R.string.moose_topic_turn to "phases",
    R.string.moose_topic_combat to "combat",
    R.string.moose_topic_buildings to "buildings",
    R.string.moose_topic_cards to "cards",
    R.string.moose_topic_treaties to "diplomacy",
    R.string.moose_topic_handgai to "stag",
    R.string.moose_topic_save to "save",
)

private val ButtonFill = Brush.verticalGradient(listOf(GoldBright, Gold, GoldDeep))

/** Round gold button that opens the Moose guide. */
@Composable
fun MooseButton(onClick: () -> Unit, modifier: Modifier = Modifier, size: Dp = 48.dp) {
    Box(
        modifier
            .size(size)
            .clip(CircleShape)
            .background(ButtonFill)
            .border(1.dp, GoldBright, CircleShape)
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(GameIcons.Moose, stringResource(R.string.moose_open_aria), tint = Ink900, modifier = Modifier.size(size * 0.66f))
    }
}

@Composable
private fun mooseTexts(): MooseTexts {
    val turn = stringResource(R.string.moose_answer_turn)
    return MooseTexts(
        unavailable = stringResource(R.string.moose_unavailable),
        overrides = mapOf(
            // The original answers describe the web build's phases, top bar and session saves.
            "phases" to turn,
            "turn" to turn,
            "combat" to stringResource(R.string.moose_answer_combat),
            "cards" to stringResource(R.string.moose_answer_cards),
            "language" to stringResource(R.string.moose_answer_language),
            "save" to stringResource(R.string.moose_answer_save),
        ),
    )
}

/** The guide's chat window. The conversation lives in [guide] for the whole session. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MooseDialog(guide: MooseGuide, onDismiss: () -> Unit) {
    val messages by guide.messages.collectAsStateWithLifecycle()
    val thinking by guide.thinking.collectAsStateWithLifecycle()
    val language = assetLanguage(LocalConfiguration.current.locales[0].language)
    val texts = mooseTexts()
    var input by rememberSaveable { mutableStateOf("") }
    val list = rememberLazyListState()
    // In landscape the keyboard leaves little room: keep only the messages and the input then.
    val typing = WindowInsets.isImeVisible

    // Greeting + messages + the "thinking" line.
    val itemCount = 1 + messages.size + if (thinking) 1 else 0
    LaunchedEffect(itemCount) { list.animateScrollToItem(itemCount - 1) }

    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false)) {
        // Taken inside the dialog: its window owns the text field's focus and keyboard.
        val focus = LocalFocusManager.current
        val keyboard = LocalSoftwareKeyboardController.current
        fun send() {
            guide.ask(input, language, texts)
            input = ""
            // Close the keyboard so the answer has the whole window.
            keyboard?.hide()
            focus.clearFocus()
        }

        GamePanel(
            Modifier
                .imePadding()
                .padding(vertical = if (typing) 4.dp else 12.dp)
                .width(440.dp)
                .fillMaxHeight(0.94f),
            alpha = 0.98f,
        ) {
            if (!typing) Row(
                Modifier
                    .fillMaxWidth()
                    .background(Brush.horizontalGradient(listOf(Gold.copy(alpha = 0.18f), Color.Transparent)))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.size(36.dp).clip(CircleShape).background(ButtonFill), contentAlignment = Alignment.Center) {
                    Icon(GameIcons.Moose, null, tint = Ink900, modifier = Modifier.size(24.dp))
                }
                Spacer(Modifier.width(10.dp))
                Text(stringResource(R.string.moose_title), style = MaterialTheme.typography.titleLarge, color = GoldBright, modifier = Modifier.weight(1f))
                Icon(
                    GameIcons.Close,
                    stringResource(R.string.common_close),
                    tint = TextMid,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .clickable(role = Role.Button, onClick = onDismiss)
                        .padding(6.dp),
                )
            }

            LazyColumn(
                state = list,
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = if (typing) 6.dp else 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                item(key = "greeting") { Bubble(stringResource(R.string.moose_greeting), fromMoose = true) }
                items(messages, key = { it.id }) { Bubble(it.text, it.fromMoose) }
                if (thinking) item(key = "thinking") { Bubble(stringResource(R.string.moose_thinking), fromMoose = true, pending = true) }
            }

            if (!typing) LazyRow(
                contentPadding = PaddingValues(horizontal = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                items(TOPICS) { (label, entryId) ->
                    val question = stringResource(label)
                    TopicChip(question) { guide.ask(question, language, texts, topicId = entryId) }
                }
            }

            Row(Modifier.padding(horizontal = 12.dp, vertical = if (typing) 6.dp else 12.dp), verticalAlignment = Alignment.CenterVertically) {
                val shape = RoundedCornerShape(12.dp)
                BasicTextField(
                    value = input,
                    onValueChange = { input = it.take(MAX_QUESTION) },
                    singleLine = true,
                    textStyle = MaterialTheme.typography.bodyMedium.copy(color = TextHigh),
                    cursorBrush = SolidColor(Gold),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Send),
                    keyboardActions = KeyboardActions(onSend = { if (input.isNotBlank()) send() }),
                    modifier = Modifier.weight(1f),
                    decorationBox = { field ->
                        Box(
                            Modifier
                                .clip(shape)
                                .background(Ink900.copy(alpha = 0.7f))
                                .border(1.dp, Gold.copy(alpha = 0.35f), shape)
                                .padding(horizontal = 12.dp, vertical = 11.dp),
                        ) {
                            if (input.isEmpty()) {
                                Text(stringResource(R.string.moose_placeholder), style = MaterialTheme.typography.bodyMedium, color = TextLow, maxLines = 1)
                            }
                            field()
                        }
                    },
                )
                Spacer(Modifier.width(8.dp))
                val canSend = input.isNotBlank()
                Box(
                    Modifier
                        .size(42.dp)
                        .alpha(if (canSend) 1f else 0.45f)
                        .clip(CircleShape)
                        .background(ButtonFill)
                        .clickable(enabled = canSend, role = Role.Button, onClick = ::send),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(GameIcons.Send, stringResource(R.string.moose_send), tint = Ink900, modifier = Modifier.size(20.dp))
                }
            }
        }
    }
}

@Composable
private fun Bubble(text: String, fromMoose: Boolean, pending: Boolean = false) {
    val corner = 14.dp
    val tail = 4.dp
    val shape = if (fromMoose) {
        RoundedCornerShape(topStart = corner, topEnd = corner, bottomEnd = corner, bottomStart = tail)
    } else {
        RoundedCornerShape(topStart = corner, topEnd = corner, bottomEnd = tail, bottomStart = corner)
    }
    Row(Modifier.fillMaxWidth(), horizontalArrangement = if (fromMoose) Arrangement.Start else Arrangement.End) {
        Text(
            text,
            style = MaterialTheme.typography.bodyMedium.copy(fontStyle = if (pending) FontStyle.Italic else FontStyle.Normal),
            color = if (pending) TextMid else TextHigh,
            modifier = Modifier
                .widthIn(max = 330.dp)
                .clip(shape)
                .background(if (fromMoose) Ink700 else Gold.copy(alpha = 0.22f))
                .border(1.dp, Gold.copy(alpha = if (fromMoose) 0.28f else 0.5f), shape)
                .padding(horizontal = 12.dp, vertical = 8.dp),
        )
    }
}

@Composable
private fun TopicChip(label: String, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Text(
        label,
        style = MaterialTheme.typography.labelMedium,
        color = GoldBright,
        maxLines = 1,
        modifier = Modifier
            .clip(shape)
            .background(Ink700.copy(alpha = 0.9f))
            .border(1.dp, Gold.copy(alpha = 0.45f), shape)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 7.dp),
    )
}
