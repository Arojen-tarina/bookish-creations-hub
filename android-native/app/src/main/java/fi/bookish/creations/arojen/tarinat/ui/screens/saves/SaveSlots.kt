package fi.bookish.creations.arojen.tarinat.ui.screens.saves

import android.text.format.DateUtils
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.data.SaveMeta
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.HudIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.screens.faction.labelRes
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/** Slots in display order: the autosave first, then the manual slots. */
val SLOT_ORDER = listOf(SaveRepository.AUTOSAVE) + (1..SaveRepository.SLOTS)

@Composable
fun slotTitle(slot: Int): String =
    if (slot == SaveRepository.AUTOSAVE) stringResource(R.string.save_autosave) else stringResource(R.string.save_slot, slot.toString())

@Composable
private fun savedAtText(meta: SaveMeta): String {
    val context = LocalContext.current
    return DateUtils.formatDateTime(
        context,
        meta.savedAt,
        DateUtils.FORMAT_SHOW_DATE or DateUtils.FORMAT_SHOW_TIME or DateUtils.FORMAT_ABBREV_MONTH,
    )
}

/**
 * One save slot: the realm's leader, name, turn, year and provinces, when it
 * was saved, and the slot's actions in [actions].
 */
@Composable
fun SaveSlotCard(
    slot: Int,
    meta: SaveMeta?,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    actions: @Composable () -> Unit = {},
) {
    val shape = RoundedCornerShape(12.dp)
    val color = meta?.let { FactionStyle.color(it.faction) } ?: Ink500
    Box(
        modifier
            .clip(shape)
            .background(Brush.linearGradient(listOf(color.copy(alpha = if (meta != null) 0.30f else 0.08f), Ink900.copy(alpha = 0.94f))))
            .border(1.dp, if (meta != null) color.copy(alpha = 0.6f) else Ink500, shape)
            .then(if (onClick != null) Modifier.clickable(role = Role.Button, onClick = onClick) else Modifier),
    ) {
        if (meta != null) {
            Image(
                painterResource(FactionStyle.leaderSprite(meta.faction)),
                contentDescription = null,
                modifier = Modifier.align(Alignment.BottomEnd).fillMaxHeight().width(90.dp).padding(top = 18.dp).alpha(0.85f),
            )
        }
        Column(Modifier.padding(12.dp)) {
            Text(slotTitle(slot), style = MaterialTheme.typography.labelMedium, color = if (meta != null) Gold else TextLow)
            Spacer(Modifier.height(4.dp))
            if (meta == null) {
                Text(stringResource(R.string.save_empty_slot), style = MaterialTheme.typography.titleMedium, color = TextLow)
            } else {
                Text(stringResource(meta.faction.nameRes), style = MaterialTheme.typography.titleMedium, color = TextHigh, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.widthIn(max = 220.dp))
                Text(stringResource(R.string.save_meta_line, meta.turn, meta.year, pluralStringResource(R.plurals.save_meta_provinces, meta.provinces, meta.provinces)), style = MaterialTheme.typography.bodySmall, color = TextMid)
                Text("${stringResource(meta.difficulty.labelRes)} · ${savedAtText(meta)}", style = MaterialTheme.typography.labelSmall, color = TextLow)
            }
            Spacer(Modifier.weight(1f))
            actions()
        }
    }
}

/** Pick a manual slot to save into; occupied slots ask before overwriting. */
@Composable
fun SaveGameDialog(slots: Map<Int, SaveMeta>, onSave: (Int) -> Unit, onDismiss: () -> Unit) {
    var confirmSlot by remember { mutableStateOf<Int?>(null) }
    Dialog(onDismissRequest = onDismiss) {
        GamePanel(Modifier.widthIn(max = 640.dp), alpha = 0.98f) {
            Row(Modifier.padding(start = 16.dp, end = 10.dp, top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(R.string.save_choose_slot), style = MaterialTheme.typography.headlineSmall, color = GoldBright, modifier = Modifier.weight(1f))
                HudIconButton(GameIcons.Close, stringResource(R.string.common_close), onDismiss)
            }
            val pending = confirmSlot
            if (pending == null) {
                Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    for (row in (1..SaveRepository.SLOTS).chunked(3)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            for (slot in row) {
                                val meta = slots[slot]
                                SaveSlotCard(
                                    slot = slot,
                                    meta = meta,
                                    modifier = Modifier.weight(1f).height(110.dp),
                                    onClick = { if (meta == null) onSave(slot) else confirmSlot = slot },
                                )
                            }
                            repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                        }
                    }
                }
            } else {
                Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(stringResource(R.string.save_overwrite_title, pending), style = MaterialTheme.typography.titleLarge, color = TextHigh, textAlign = TextAlign.Center)
                    Text(stringResource(R.string.save_overwrite_body), style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(14.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        GameButton(stringResource(R.string.save_cancel), { confirmSlot = null }, style = GameButtonStyle.Secondary)
                        GameButton(stringResource(R.string.save_overwrite_yes), { onSave(pending) })
                    }
                }
            }
        }
    }
}

/** Small icon + label action used on slot cards. */
@Composable
fun SlotAction(icon: ImageVector, label: String, onClick: () -> Unit, modifier: Modifier = Modifier, danger: Boolean = false) {
    val tint = if (danger) Rust else GoldBright
    val shape = RoundedCornerShape(8.dp)
    Row(
        modifier
            .clip(shape)
            .background(Ink700.copy(alpha = 0.9f))
            .border(1.dp, tint.copy(alpha = 0.6f), shape)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, null, tint = tint, modifier = Modifier.size(16.dp))
        if (label.isNotEmpty()) {
            Spacer(Modifier.width(6.dp))
            Text(label, style = MaterialTheme.typography.labelMedium, color = TextHigh)
        }
    }
}
