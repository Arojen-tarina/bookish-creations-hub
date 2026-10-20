package fi.bookish.creations.arojen.tarinat.ui.game.hud

import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Popup
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.ui.components.signed
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldDeep
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink800
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

enum class PanelTab { Province, Realm, Chronicle, Diplomacy }

/** In-game top bar: realm and date, resources with per-turn income, panels and End turn. */
@Composable
fun TopBar(
    game: GameState,
    openTab: PanelTab?,
    endTurnEnabled: Boolean,
    onMenu: () -> Unit,
    onTab: (PanelTab) -> Unit,
    onEndTurn: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val player = game.player
    val income = game.lastCollection
    BoxWithConstraints(modifier.fillMaxWidth()) {
        val roomy = maxWidth >= 860.dp
        // Smaller phones: compact resource chips, and below 700 dp an End turn button without its label,
        // so all seven resources stay visible.
        val compact = !roomy
        val endTurnLabel = maxWidth >= 700.dp
        Row(
            Modifier
                .fillMaxWidth()
                .height(52.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Brush.verticalGradient(listOf(Ink800.copy(alpha = 0.96f), Ink900.copy(alpha = 0.92f))))
                .border(1.dp, Gold.copy(alpha = 0.35f), RoundedCornerShape(14.dp))
                .padding(horizontal = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            HudIconButton(GameIcons.Menu, stringResource(R.string.hud_menu), onMenu, size = 38.dp)
            Spacer(Modifier.width(8.dp))

            // Realm and date
            Dot(FactionStyle.color(player.id), 12.dp)
            Spacer(Modifier.width(6.dp))
            Column(Modifier.width(if (roomy) 150.dp else 64.dp)) {
                if (roomy) {
                    Text(
                        stringResource(player.id.nameRes),
                        style = MaterialTheme.typography.labelMedium,
                        color = TextHigh,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                // On a phone the turn and the year take a line each: "Turn 15 · 1220" no longer fits
                // once the realm's numbers grow to three digits.
                val turnLine = stringResource(R.string.log_turn_header, game.turn, game.year)
                Text(
                    if (roomy) turnLine else turnLine.replace(" · ", "\n"),
                    style = MaterialTheme.typography.labelSmall,
                    color = TextMid,
                    maxLines = 2,
                )
            }

            // Resources
            Row(
                Modifier.weight(1f),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                ResourceChip(ResourceKind.GOLD, player.treasury, income?.taxIncome, R.string.hud_gold, compact)
                ResourceChip(ResourceKind.FOOD, game.food, income?.foodChange, R.string.hud_food, compact)
                ResourceChip(ResourceKind.HORSES, player.horses, income?.horsesGain, R.string.hud_horses, compact)
                ResourceChip(ResourceKind.MANPOWER, player.manpower, income?.manpowerGain, R.string.hud_manpower, compact)
                ResourceChip(ResourceKind.ARTISANS, game.artisans, income?.artisansGain, R.string.hud_artisans, compact)
                ResourceChip(ResourceKind.INFLUENCE, game.influence, income?.influenceGain, R.string.hud_influence, compact)
                ResourceChip(ResourceKind.PRESTIGE, game.prestige, income?.prestigeGain, R.string.hud_prestige, compact)
            }

            HudIconButton(GameIcons.Trophy, stringResource(R.string.ui_realm_status), { onTab(PanelTab.Realm) }, active = openTab == PanelTab.Realm, size = 38.dp)
            Spacer(Modifier.width(6.dp))
            HudIconButton(GameIcons.Scales, stringResource(R.string.dipl_title), { onTab(PanelTab.Diplomacy) }, active = openTab == PanelTab.Diplomacy, size = 38.dp)
            Spacer(Modifier.width(8.dp))
            EndTurnButton(onEndTurn, endTurnEnabled, showLabel = endTurnLabel)
        }
    }
}

@Composable
private fun EndTurnButton(onClick: () -> Unit, enabled: Boolean, showLabel: Boolean) {
    val shape = RoundedCornerShape(10.dp)
    Row(
        Modifier
            .height(40.dp)
            .alpha(if (enabled) 1f else 0.45f)
            .clip(shape)
            .background(Brush.verticalGradient(listOf(GoldBright, Gold, GoldDeep)))
            .border(1.dp, GoldBright, shape)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = if (showLabel) 14.dp else 11.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        val label = stringResource(R.string.phase_end_turn)
        Icon(GameIcons.EndTurn, if (showLabel) null else label, tint = Ink900, modifier = Modifier.size(18.dp))
        if (showLabel) {
            Spacer(Modifier.width(6.dp))
            Text(label, style = MaterialTheme.typography.labelLarge, color = Ink900, maxLines = 1)
        }
    }
}

/** Resource count that animates when it changes; tap for its name and per-turn income. */
@Composable
private fun ResourceChip(kind: ResourceKind, value: Int, perTurn: Int?, labelRes: Int, compact: Boolean) {
    var open by remember { mutableStateOf(false) }
    val shown by animateIntAsState(value, tween(600), label = "resource")
    Box {
        Row(
            Modifier
                .clip(RoundedCornerShape(8.dp))
                .clickable(role = Role.Button) { open = !open }
                .padding(horizontal = if (compact) 2.dp else 4.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            ResourceIcon(kind, size = if (compact) 15.dp else 18.dp)
            Spacer(Modifier.width(if (compact) 2.dp else 4.dp))
            Text(
                shown.toString(),
                style = if (compact) MaterialTheme.typography.labelMedium else MaterialTheme.typography.labelLarge,
                color = kind.color,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
            )
        }
        if (open) {
            Popup(alignment = Alignment.TopCenter, offset = IntOffset(0, 120), onDismissRequest = { open = false }) {
                Column(
                    Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Ink700)
                        .border(1.dp, Gold.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(stringResource(labelRes), style = MaterialTheme.typography.labelLarge, color = TextHigh)
                    if (perTurn != null) {
                        Text(stringResource(R.string.hud_per_turn, signed(perTurn, plusZero = true)), style = MaterialTheme.typography.bodySmall, color = kind.color)
                    }
                }
            }
        }
    }
}
