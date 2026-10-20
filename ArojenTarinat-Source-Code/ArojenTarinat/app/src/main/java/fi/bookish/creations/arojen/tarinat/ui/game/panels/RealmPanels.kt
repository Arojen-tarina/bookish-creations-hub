package fi.bookish.creations.arojen.tarinat.ui.game.panels

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.data.VictoryTargets
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.components.signed
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.cards.CardText
import fi.bookish.creations.arojen.tarinat.ui.game.hud.Dot
import fi.bookish.creations.arojen.tarinat.ui.game.hud.PanelSection
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ProgressBar
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceIcon
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceKind
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.game.turnLogText
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

private val MilitaryRed = Color(0xFFF87171)
private val EconomyGold = Color(0xFFFBBF24)
private val TechSky = Color(0xFF38BDF8)
private val DiplomacyJade = Color(0xFF34D399)
private val CultureViolet = Color(0xFFC084FC)

/** Progress towards the five victories, the race between realms, bonuses and statistics. */
@Composable
fun RealmPanel(game: GameState, cardTexts: Map<String, CardText>) {
    val player = game.playerFactionId
    val owned = game.provinces.count { it.ownerId == player }
    val survivors = game.factions.filter { f -> f.id != player && game.provinces.any { it.ownerId == f.id } }
    val allies = survivors.count { rival ->
        game.relation(player, rival.id)?.treaties?.any { it.type == TreatyType.ALLIANCE } == true
    }
    val alliesTarget = maxOf(VictoryTargets.DIPLOMATIC_MIN_ALLIES, survivors.size)

    PanelSection {
        SectionTitle(stringResource(R.string.ui_victory_goals), icon = GameIcons.Trophy)
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            GoalBar(GameIcons.Swords, R.string.faction_goal_military_sub, MilitaryRed, owned.toFloat() / VictoryTargets.PROVINCES,
                ltr(stringResource(R.string.goal_progress, owned, VictoryTargets.PROVINCES)))
            GoalBar(GameIcons.Market, R.string.faction_goal_economic_sub, EconomyGold, game.player.treasury.toFloat() / VictoryTargets.GOLD,
                ltr(stringResource(R.string.goal_progress, game.player.treasury, VictoryTargets.GOLD)))
            GoalBar(GameIcons.Cards, R.string.faction_goal_tech_sub, TechSky, game.playedTechCards.size.toFloat() / VictoryTargets.TECH,
                ltr(stringResource(R.string.goal_progress, game.playedTechCards.size, VictoryTargets.TECH)))
            GoalBar(
                GameIcons.Scales, R.string.faction_goal_diplomatic_sub, DiplomacyJade,
                maxOf(game.influence.toFloat() / VictoryTargets.INFLUENCE, if (alliesTarget > 0) allies.toFloat() / alliesTarget else 0f),
                stringResource(R.string.goal_diplomatic_progress, game.influence, VictoryTargets.INFLUENCE, allies, alliesTarget),
            )
            GoalBar(GameIcons.Temple, R.string.faction_goal_cultural_sub, CultureViolet, game.prestige.toFloat() / VictoryTargets.PRESTIGE,
                ltr(stringResource(R.string.goal_progress, game.prestige, VictoryTargets.PRESTIGE)))
        }
    }

    // How close every realm is to winning
    val silkTotal = game.provinces.count { it.hasSilkRoad }
    PanelSection {
        SectionTitle(stringResource(R.string.ui_realm_status), icon = GameIcons.Crown)
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (f in game.factions) {
                val provinces = game.provinces.count { it.ownerId == f.id }
                val silk = game.provinces.count { it.hasSilkRoad && it.ownerId == f.id }
                val streak = if (f.id == player) game.treasuryStreak else game.aiTreasuryStreaks[f.id] ?: 0
                val nearEconomic = f.treasury >= VictoryTargets.GOLD && silkTotal > 0 && silk * 2 > silkTotal
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Dot(FactionStyle.color(f.id))
                        Spacer(Modifier.width(6.dp))
                        val name = stringResource(f.id.nameRes) + if (f.id == player) " " + stringResource(R.string.ui_you_suffix) else ""
                        Text(name, style = MaterialTheme.typography.titleSmall, color = if (f.id == player) GoldBright else TextHigh,
                            maxLines = 1, overflow = TextOverflow.Ellipsis)
                    }
                    Row(Modifier.padding(start = 16.dp, top = 2.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        StatInline({ Icon(GameIcons.MapPin, null, tint = TextMid, modifier = Modifier.size(14.dp)) }, "$provinces")
                        StatInline({ ResourceIcon(ResourceKind.GOLD, size = 14.dp) }, "${f.treasury}")
                        StatInline({ Dot(Color(0xFFF59E0B), 8.dp) }, ltr("$silk/$silkTotal"))
                        if (nearEconomic) {
                            Text(stringResource(R.string.realm_streak, streak, VictoryTargets.TREASURY_STREAK), style = MaterialTheme.typography.labelSmall, color = Rust)
                        }
                    }
                }
            }
        }
    }

    if (game.attackBonus > 0 || game.defenseBonus > 0 || game.movementBonus > 0) {
        PanelSection(accent = CultureViolet) {
            SectionTitle(stringResource(R.string.ui_active_bonuses), icon = GameIcons.Flag)
            if (game.attackBonus > 0) BonusLine(GameIcons.Swords, "${signed(game.attackBonus)} ${stringResource(R.string.ui_bonus_attack)}", MilitaryRed)
            if (game.defenseBonus > 0) BonusLine(GameIcons.Shield, "${signed(game.defenseBonus)} ${stringResource(R.string.ui_bonus_defense)}", TechSky)
            if (game.movementBonus > 0) BonusLine(GameIcons.Boot, "${signed(game.movementBonus)} ${stringResource(R.string.ui_bonus_movement)}", DiplomacyJade)
        }
    }

    if (game.playedTechCards.isNotEmpty()) {
        PanelSection(accent = TechSky) {
            SectionTitle(stringResource(R.string.ui_technologies, game.playedTechCards.size), icon = GameIcons.Cards)
            for (card in game.playedTechCards) {
                val text = cardTexts[card.id]
                Text("${text?.n ?: card.id}: ${text?.s.orEmpty()}", style = MaterialTheme.typography.bodySmall, color = TextHigh)
            }
        }
    }

    PanelSection {
        SectionTitle(stringResource(R.string.ui_statistics), icon = GameIcons.Scroll)
        StatLine(stringResource(R.string.ui_stat_provinces), ltr("$owned / ${game.provinces.size}"))
        StatLine(stringResource(R.string.ui_armies), "${game.armies.count { it.ownerId == player }}")
        StatLine(stringResource(R.string.ui_stat_cards), "${game.hand.size}")
        StatLine(stringResource(R.string.ui_stat_buildings), "${game.buildings.values.sumOf { it.size }}")
    }
}

/** What happened during the last AI turn. */
@Composable
fun ChroniclePanel(game: GameState) {
    PanelSection {
        SectionTitle(stringResource(R.string.ui_ai_log), icon = GameIcons.Scroll)
        if (game.turnLog.isEmpty()) {
            Text(stringResource(R.string.ui_no_events), style = MaterialTheme.typography.bodyMedium, color = TextMid)
        } else {
            Text(stringResource(R.string.log_turn_header, game.turn - 1, game.year - 1), style = MaterialTheme.typography.labelMedium, color = TextLow)
            Spacer(Modifier.size(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                for (entry in game.turnLog) {
                    Row(verticalAlignment = Alignment.Top) {
                        // Nudge the dot down to sit on the first text line.
                        Box(Modifier.padding(top = 5.dp)) { Dot(FactionStyle.color(entry.factionId), 8.dp) }
                        Spacer(Modifier.width(8.dp))
                        Text(turnLogText(entry, game), style = MaterialTheme.typography.bodySmall, color = TextHigh)
                    }
                }
            }
        }
    }
}

@Composable
private fun GoalBar(icon: ImageVector, labelRes: Int, color: Color, fraction: Float, value: String) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = color, modifier = Modifier.size(14.dp))
            Spacer(Modifier.width(6.dp))
            Text(stringResource(labelRes), style = MaterialTheme.typography.labelMedium, color = color, modifier = Modifier.weight(1f))
            Text(value, style = MaterialTheme.typography.labelSmall, color = TextMid)
        }
        Spacer(Modifier.size(4.dp))
        ProgressBar(fraction, color)
    }
}

@Composable
private fun StatInline(icon: @Composable () -> Unit, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        icon()
        Spacer(Modifier.width(4.dp))
        Text(text, style = MaterialTheme.typography.labelSmall, color = TextMid)
    }
}

@Composable
private fun BonusLine(icon: ImageVector, text: String, color: Color) {
    Row(Modifier.padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = color, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(6.dp))
        Text(text, style = MaterialTheme.typography.bodyMedium, color = color)
    }
}

@Composable
private fun StatLine(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp)) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = TextMid, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.labelLarge, color = TextHigh)
    }
}
