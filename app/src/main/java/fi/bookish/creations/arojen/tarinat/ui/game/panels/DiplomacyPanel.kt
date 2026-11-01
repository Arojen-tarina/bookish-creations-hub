package fi.bookish.creations.arojen.tarinat.ui.game.panels

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.DiplomaticRelation
import fi.bookish.creations.arojen.tarinat.game.model.Faction
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.ui.components.signed
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.descRes
import fi.bookish.creations.arojen.tarinat.ui.game.hud.PanelSection
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ProgressBar
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.game.rulerRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink600
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.Sky
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/** Treaties the player may offer; ones already in force are hidden. */
private val OFFERABLE = listOf(
    TreatyType.NON_AGGRESSION, TreatyType.TRADE_AGREEMENT, TreatyType.ALLIANCE,
    TreatyType.PEACE, TreatyType.WAR_SURPRISE, TreatyType.WAR_FORMAL,
)

@Composable
fun DiplomacyPanel(
    game: GameState,
    onPropose: (FactionId, TreatyType) -> Unit,
    onBreak: (FactionId, TreatyType) -> Unit,
) {
    Text(stringResource(R.string.dipl_subtitle), style = MaterialTheme.typography.bodySmall, color = TextMid)
    for (rival in game.factions.filter { it.id != game.playerFactionId }) {
        val rel = game.relation(game.playerFactionId, rival.id) ?: continue
        RivalCard(game, rival, rel, { onPropose(rival.id, it) }, { onBreak(rival.id, it) })
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun RivalCard(
    game: GameState,
    rival: Faction,
    rel: DiplomaticRelation,
    onPropose: (TreatyType) -> Unit,
    onBreak: (TreatyType) -> Unit,
) {
    var expanded by rememberSaveable(rival.id) { mutableStateOf(false) }
    val color = FactionStyle.color(rival.id)
    val (relationLabel, relationColor) = when {
        rel.relation > 30 -> R.string.rel_friendly to Jade
        rel.relation > 0 -> R.string.rel_positive to Jade
        rel.relation > -30 -> R.string.ui_neutral to Gold
        rel.relation > -60 -> R.string.rel_hostile to Rust
        else -> R.string.rel_enemy to Rust
    }
    val current = rel.treaties.map { it.type }.distinct()
    val proposalUsed = rel.lastProposalTurn == game.turn

    PanelSection(Modifier.clickable(role = Role.Button) { expanded = !expanded }, accent = color) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(32.dp).clip(CircleShape).background(color), contentAlignment = Alignment.Center) {
                Icon(GameIcons.Crown, null, tint = Color.White, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(stringResource(rival.id.nameRes), style = MaterialTheme.typography.titleSmall, color = TextHigh)
                rival.id.rulerRes?.let {
                    Text(stringResource(R.string.dipl_ruled_by, stringResource(it)), style = MaterialTheme.typography.bodySmall, color = TextMid)
                }
            }
            Text(stringResource(relationLabel), style = MaterialTheme.typography.labelMedium, color = relationColor)
        }
        Spacer(Modifier.size(8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(stringResource(R.string.dipl_relation), style = MaterialTheme.typography.labelSmall, color = TextMid)
            Spacer(Modifier.width(8.dp))
            ProgressBar((rel.relation + 100) / 200f, relationColor, Modifier.weight(1f))
            Spacer(Modifier.width(8.dp))
            Text(signed(rel.relation), style = MaterialTheme.typography.labelSmall, color = TextMid)
        }
        if (current.isNotEmpty()) {
            Spacer(Modifier.size(8.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                for (t in current) Badge(stringResource(t.nameRes), if (t.isWar) Rust else Gold)
            }
        }

        AnimatedVisibility(expanded) {
            Column(Modifier.padding(top = 10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Meter(Modifier.weight(1f), R.string.dipl_trust, rel.trust, Sky)
                    Meter(Modifier.weight(1f), R.string.dipl_threat, rel.threat, Rust)
                }
                Spacer(Modifier.size(10.dp))
                Text(stringResource(R.string.dipl_propose), style = MaterialTheme.typography.labelLarge, color = GoldBright)
                Text(stringResource(R.string.dipl_one_proposal), style = MaterialTheme.typography.bodySmall, color = TextLow)
                Spacer(Modifier.size(6.dp))
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    for (t in OFFERABLE.filter { it !in current }) {
                        TreatyOption(t, enabled = t.isWar || !proposalUsed) { onPropose(t) }
                    }
                }
                if (current.isNotEmpty()) {
                    Spacer(Modifier.size(10.dp))
                    Text(stringResource(R.string.dipl_break_treaty), style = MaterialTheme.typography.labelLarge, color = Rust)
                    Spacer(Modifier.size(6.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        for (t in current) {
                            SmallActionButton(stringResource(t.nameRes), GameIcons.Close, enabled = true, color = Rust) { onBreak(t) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TreatyOption(type: TreatyType, enabled: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(8.dp)
    val accent = if (type.isWar) Rust else Gold
    Row(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (enabled) Ink600 else Ink600.copy(alpha = 0.5f))
            .border(1.dp, if (enabled) accent.copy(alpha = 0.7f) else Ink500, shape)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(if (type.isWar) GameIcons.Swords else GameIcons.Scales, null, tint = if (enabled) accent else TextLow, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(10.dp))
        Column {
            Text(stringResource(type.nameRes), style = MaterialTheme.typography.titleSmall, color = if (enabled) TextHigh else TextLow)
            Text(stringResource(type.descRes), style = MaterialTheme.typography.bodySmall, color = TextMid)
        }
    }
}

@Composable
private fun Meter(modifier: Modifier, labelRes: Int, value: Int, color: Color) {
    Column(modifier) {
        Row {
            Text(stringResource(labelRes), style = MaterialTheme.typography.labelSmall, color = TextMid, modifier = Modifier.weight(1f))
            Text("$value%", style = MaterialTheme.typography.labelSmall, color = TextMid)
        }
        Spacer(Modifier.size(4.dp))
        ProgressBar(value / 100f, color)
    }
}
