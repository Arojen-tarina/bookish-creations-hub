package fi.bookish.creations.arojen.tarinat.ui.screens.saves

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.data.SaveMeta
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.launch

/**
 * The autosave and the five manual slots. Loading decodes the save here and
 * hands it to the game screen through [onLoaded]; delete asks first.
 */
@Composable
fun LoadGameScreen(saves: SaveRepository, onLoaded: (SaveMeta) -> Unit, onBack: () -> Unit) {
    val slots by saves.slots.collectAsStateWithLifecycle()
    val scope = rememberCoroutineScope()
    var confirmDelete by remember { mutableStateOf<Int?>(null) }
    var failed by remember { mutableStateOf(false) }

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
                Text(stringResource(R.string.load_title), style = MaterialTheme.typography.headlineMedium, color = GoldBright, modifier = Modifier.weight(1f))
                if (failed) Text(stringResource(R.string.save_load_failed), style = MaterialTheme.typography.labelLarge, color = Rust)
            }
            Spacer(Modifier.height(12.dp))
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                for (row in SLOT_ORDER.chunked(3)) {
                    Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        for (slot in row) {
                            val meta = slots[slot]
                            SaveSlotCard(slot, meta, Modifier.weight(1f).fillMaxSize()) {
                                if (meta != null) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        SlotAction(GameIcons.Load, stringResource(R.string.save_load_button), {
                                            scope.launch {
                                                val state = saves.load(slot)
                                                if (state == null) {
                                                    failed = true
                                                } else {
                                                    saves.handOff(slot, state)
                                                    onLoaded(meta)
                                                }
                                            }
                                        })
                                        SlotAction(GameIcons.Trash, "", { confirmDelete = slot }, danger = true)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    confirmDelete?.let { slot ->
        Dialog(onDismissRequest = { confirmDelete = null }) {
            GamePanel(alpha = 0.98f) {
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(slotTitle(slot), style = MaterialTheme.typography.titleLarge, color = TextHigh)
                    Text(stringResource(R.string.save_confirm_delete), style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(14.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        GameButton(stringResource(R.string.save_cancel), { confirmDelete = null }, style = GameButtonStyle.Secondary)
                        GameButton(stringResource(R.string.save_delete_button), {
                            scope.launch { saves.delete(slot) }
                            confirmDelete = null
                        })
                    }
                }
            }
        }
    }
}
