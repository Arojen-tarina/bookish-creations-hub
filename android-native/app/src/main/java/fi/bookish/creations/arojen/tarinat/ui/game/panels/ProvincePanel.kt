package fi.bookish.creations.arojen.tarinat.ui.game.panels

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.engine.BuildBlock
import fi.bookish.creations.arojen.tarinat.game.engine.buildBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.defenseBreakdown
import fi.bookish.creations.arojen.tarinat.game.engine.fortDurabilityOrFull
import fi.bookish.creations.arojen.tarinat.game.engine.isFortDamaged
import fi.bookish.creations.arojen.tarinat.game.engine.recruitBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.repairFortBlocker
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.ui.components.plus
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.effectRes
import fi.bookish.creations.arojen.tarinat.ui.game.hud.Dot
import fi.bookish.creations.arojen.tarinat.ui.game.hud.PanelSection
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ProgressBar
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceIcon
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceKind
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.game.icon
import fi.bookish.creations.arojen.tarinat.ui.game.messageRes
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink600
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlin.math.roundToInt

class ProvinceActions(
    val onSelectArmy: (String) -> Unit,
    val onMergeInto: (String) -> Unit,
    val onRecruit: (RecruitType) -> Unit,
    val onRepair: (useArtisan: Boolean) -> Unit,
    val onBuild: (BuildingType) -> Unit,
)

@Composable
fun ProvincePanel(game: GameState, province: Province?, selectedArmyId: String?, actions: ProvinceActions) {
    if (province == null) {
        PanelSection {
            Text(stringResource(R.string.province_none_selected_title), style = MaterialTheme.typography.titleMedium, color = TextHigh)
            Spacer(Modifier.size(4.dp))
            Text(stringResource(R.string.ui_select_province), style = MaterialTheme.typography.bodyMedium, color = TextMid)
        }
        return
    }
    val player = game.playerFactionId
    val owned = province.ownerId == player

    ProvinceHeader(game, province)
    ProvinceStats(game, province)
    ProvinceTraits(province)

    val armies = game.armiesIn(province.id)
    if (armies.isNotEmpty()) ArmyList(game, armies, selectedArmyId, actions)

    if (owned) {
        RecruitSection(game, province, actions)
        BuildSection(game, province, actions)
    }
}

@Composable
private fun ProvinceHeader(game: GameState, p: Province) {
    PanelSection {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(p.name, style = MaterialTheme.typography.headlineSmall, color = GoldBright, modifier = Modifier.weight(1f))
            if (p.isCapital) Badge(stringResource(R.string.ui_capital), Gold)
        }
        Spacer(Modifier.size(6.dp))
        KeyValue(stringResource(R.string.ui_owner)) {
            Dot(FactionStyle.color(p.ownerId))
            Spacer(Modifier.width(6.dp))
            val owner = when (p.ownerId) {
                null -> stringResource(R.string.ui_neutral)
                game.playerFactionId -> stringResource(R.string.ui_you)
                else -> stringResource(p.ownerId.nameRes)
            }
            Text(owner, style = MaterialTheme.typography.bodyMedium, color = TextHigh)
        }
        KeyValue(stringResource(R.string.ui_terrain)) {
            Text(stringResource(p.terrain.nameRes), style = MaterialTheme.typography.bodyMedium, color = TextHigh)
        }
    }
}

@Composable
private fun ProvinceStats(game: GameState, p: Province) {
    val defense = p.defenseBreakdown(additional = game.defenseBonus.toDouble())
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        StatTile(Modifier.weight(1f), { ResourceIcon(ResourceKind.GOLD) }, p.baseTax.toString(), stringResource(R.string.ui_taxes))
        StatTile(Modifier.weight(1f), { ResourceIcon(ResourceKind.MANPOWER) }, p.baseManpower.toString(), stringResource(R.string.ui_manpower))
    }
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        StatTile(
            Modifier.weight(1f),
            { Icon(GameIcons.Shield, null, tint = Jade, modifier = Modifier.size(18.dp)) },
            plus(formatNumber(defense.total)),
            stringResource(R.string.ui_defense),
        )
        StatTile(
            Modifier.weight(1f),
            { Icon(GameIcons.Flag, null, tint = Color(0xFFD8B4FE), modifier = Modifier.size(18.dp)) },
            p.supply.toString(),
            stringResource(R.string.ui_supply),
        )
    }
    if (p.fortLevel > 0) {
        PanelSection {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(GameIcons.Castle, null, tint = Gold, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.ui_fortress), style = MaterialTheme.typography.bodyMedium, color = TextHigh, modifier = Modifier.weight(1f))
                Text("${stringResource(R.string.ui_level)} ${p.fortLevel}", style = MaterialTheme.typography.labelLarge, color = GoldBright)
            }
            Spacer(Modifier.size(6.dp))
            val durability = p.fortDurabilityOrFull
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(R.string.ui_durability), style = MaterialTheme.typography.bodySmall, color = TextMid)
                Spacer(Modifier.width(8.dp))
                ProgressBar(durability / 100f, if (durability >= 100) Jade else Rust, Modifier.weight(1f))
                Spacer(Modifier.width(8.dp))
                Text("$durability%", style = MaterialTheme.typography.bodySmall, color = TextMid)
            }
            Text(
                "${stringResource(R.string.ui_terrain_short)} ${plus(formatNumber(defense.terrain))} · ${stringResource(R.string.ui_fortress_short)} ${plus(formatNumber(defense.fortress))}",
                style = MaterialTheme.typography.bodySmall,
                color = TextLow,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@Composable
private fun ProvinceTraits(p: Province) {
    p.tradeGood?.let { good ->
        PanelSection {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Image(painterResource(FactionStyle.resourceSprite(good)), null, Modifier.size(22.dp))
                Spacer(Modifier.width(8.dp))
                Column(Modifier.weight(1f)) {
                    Text(stringResource(good.nameRes), style = MaterialTheme.typography.titleSmall, color = TextHigh)
                    Text(stringResource(good.effectRes), style = MaterialTheme.typography.bodySmall, color = TextMid)
                }
            }
        }
    }
    if (p.hasSilkRoad) {
        PanelSection(accent = Gold) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(12.dp).clip(RoundedCornerShape(50)).background(Color(0xFFF59E0B)))
                Spacer(Modifier.width(10.dp))
                Column {
                    Text(stringResource(R.string.ui_on_silk_road), style = MaterialTheme.typography.titleSmall, color = GoldBright)
                    Text(stringResource(R.string.ui_silk_road_bonus), style = MaterialTheme.typography.bodySmall, color = TextMid)
                }
            }
        }
    }
    if (p.unrest > 0) {
        PanelSection(accent = Rust) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(R.string.ui_unrest), style = MaterialTheme.typography.titleSmall, color = Rust, modifier = Modifier.weight(1f))
                Text("${p.unrest}%", style = MaterialTheme.typography.labelLarge, color = Rust)
            }
            Spacer(Modifier.size(6.dp))
            ProgressBar(p.unrest / 100f, Rust)
        }
    }
}

@Composable
private fun ArmyList(game: GameState, armies: List<Army>, selectedArmyId: String?, actions: ProvinceActions) {
    val player = game.playerFactionId
    val selected = armies.firstOrNull { it.id == selectedArmyId }
    PanelSection {
        SectionTitle(stringResource(R.string.ui_armies), icon = GameIcons.Swords)
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (army in armies) {
                val mine = army.ownerId == player
                val isSelected = army.id == selectedArmyId
                val shape = RoundedCornerShape(10.dp)
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clip(shape)
                        .background(if (isSelected) Gold.copy(alpha = 0.16f) else Ink600)
                        .border(1.dp, if (isSelected) Gold else FactionStyle.color(army.ownerId).copy(alpha = 0.6f), shape)
                        .clickable(enabled = mine, role = Role.Button) { actions.onSelectArmy(army.id) }
                        .padding(10.dp),
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Dot(FactionStyle.color(army.ownerId))
                        Spacer(Modifier.width(6.dp))
                        Text(
                            if (mine) stringResource(R.string.ui_you) else stringResource(army.ownerId.nameRes),
                            style = MaterialTheme.typography.titleSmall,
                            color = TextHigh,
                            modifier = Modifier.weight(1f),
                        )
                        if (army.isChief) Badge(stringResource(R.string.army_chief), Gold)
                    }
                    Spacer(Modifier.size(6.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
                        UnitCount(GameIcons.Horseshoe, army.cavalry)
                        UnitCount(GameIcons.Sword, army.infantry)
                        UnitCount(GameIcons.Catapult, army.siege)
                        if (mine) {
                            Spacer(Modifier.weight(1f))
                            Text(
                                if (army.movementLeft > 0) pluralStringResource(R.plurals.army_moves_left, army.movementLeft, army.movementLeft) else stringResource(R.string.army_exhausted),
                                style = MaterialTheme.typography.labelSmall,
                                color = if (army.movementLeft > 0) Jade else TextLow,
                            )
                        }
                    }
                    Spacer(Modifier.size(6.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.ui_morale), style = MaterialTheme.typography.bodySmall, color = TextMid)
                        Spacer(Modifier.width(8.dp))
                        ProgressBar(army.morale / 100f, Gold, Modifier.weight(1f), height = 5.dp)
                        Spacer(Modifier.width(8.dp))
                        Text("${army.morale}%", style = MaterialTheme.typography.bodySmall, color = TextMid)
                    }
                    if (mine && selected != null && !isSelected && selected.ownerId == player) {
                        Spacer(Modifier.size(8.dp))
                        SmallActionButton(stringResource(R.string.ui_merge_armies), GameIcons.Merge, enabled = true) {
                            actions.onMergeInto(army.id)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RecruitSection(game: GameState, p: Province, actions: ProvinceActions) {
    PanelSection {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            val infantryBlock = recruitBlocker(game, p.id, RecruitType.INFANTRY)
            val cavalryBlock = recruitBlocker(game, p.id, RecruitType.CAVALRY)
            Column(Modifier.weight(1f)) {
                SmallActionButton(stringResource(R.string.ui_recruit_infantry), GameIcons.Sword, infantryBlock == null) { actions.onRecruit(RecruitType.INFANTRY) }
                infantryBlock?.let { BlockNote(stringResource(it.messageRes)) }
            }
            Column(Modifier.weight(1f)) {
                SmallActionButton(stringResource(R.string.ui_recruit_cavalry), GameIcons.Horseshoe, cavalryBlock == null) { actions.onRecruit(RecruitType.CAVALRY) }
                cavalryBlock?.let { BlockNote(stringResource(it.messageRes)) }
            }
        }
        BlockNote(stringResource(R.string.ui_recruit_note))
        if (p.isFortDamaged) {
            Spacer(Modifier.size(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                SmallActionButton(
                    stringResource(R.string.ui_repair_gold),
                    GameIcons.Wrench,
                    repairFortBlocker(game, p.id, useArtisan = false) == null,
                    Modifier.weight(1f),
                ) { actions.onRepair(false) }
                SmallActionButton(
                    stringResource(R.string.ui_repair_artisan),
                    GameIcons.Wrench,
                    repairFortBlocker(game, p.id, useArtisan = true) == null,
                    Modifier.weight(1f),
                ) { actions.onRepair(true) }
            }
        }
    }
}

@Composable
private fun BuildSection(game: GameState, p: Province, actions: ProvinceActions) {
    val isCapital = p.id == game.player.capitalId
    val existing = game.buildingsIn(p.id)
    PanelSection {
        SectionTitle(stringResource(R.string.ui_build_heading, p.name), icon = GameIcons.Hammer)
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (type in BuildingType.entries) {
                if (type == BuildingType.WONDER && !isCapital) continue
                val block = buildBlocker(game, p.id, type)
                val finished = block == BuildBlock.MAX_LEVEL || block == BuildBlock.ALREADY_BUILT
                BuildRow(game, p, type, existing.count { it == type }, block, finished) { actions.onBuild(type) }
            }
        }
    }
}

@Composable
private fun BuildRow(
    game: GameState,
    p: Province,
    type: BuildingType,
    count: Int,
    block: BuildBlock?,
    finished: Boolean,
    onBuild: () -> Unit,
) {
    val shape = RoundedCornerShape(10.dp)
    val affordable = block == null
    Row(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (finished) Jade.copy(alpha = 0.12f) else Ink600)
            .border(1.dp, if (finished) Jade.copy(alpha = 0.5f) else if (affordable) Gold.copy(alpha = 0.5f) else Ink500, shape)
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier.size(38.dp).clip(RoundedCornerShape(8.dp)).background(Ink900.copy(alpha = 0.6f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(type.icon, null, tint = if (finished) Jade else GoldBright, modifier = Modifier.size(22.dp))
        }
        Spacer(Modifier.width(10.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(stringResource(type.nameRes), style = MaterialTheme.typography.titleSmall, color = TextHigh)
                Spacer(Modifier.width(6.dp))
                when {
                    type == BuildingType.FORTRESS && p.fortLevel > 0 -> Badge("${stringResource(R.string.ui_level)} ${p.fortLevel}", Gold)
                    type == BuildingType.WONDER && count > 0 -> Badge(stringResource(R.string.wonder_count, count, Rules.WONDER_MAX), Gold)
                    finished -> Badge(stringResource(R.string.ui_built_badge), Jade)
                }
            }
            val effect = if (type == BuildingType.FORTRESS) {
                val next = minOf(Rules.FORT_MAX_LEVEL, p.fortLevel + 1)
                stringResource(R.string.ui_fortress_next_effect, next, (next * 35f).roundToInt())
            } else {
                stringResource(type.effectRes)
            }
            Text(effect, style = MaterialTheme.typography.bodySmall, color = TextMid)
            if (!finished) {
                Row(Modifier.padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                    CostChip({ ResourceIcon(ResourceKind.GOLD, size = 14.dp) }, type.goldCost, game.player.treasury >= type.goldCost)
                    if (type.artisanCost > 0) {
                        CostChip({ ResourceIcon(ResourceKind.ARTISANS, size = 14.dp) }, type.artisanCost, game.artisans >= type.artisanCost)
                    }
                }
            }
        }
        if (!finished) {
            Spacer(Modifier.width(8.dp))
            val label = if (type == BuildingType.FORTRESS && p.fortLevel > 0) R.string.ui_upgrade else R.string.ui_build
            SmallActionButton(stringResource(label), null, affordable, onClick = onBuild)
        }
    }
}

// ---------- small building blocks ----------

@Composable
private fun KeyValue(key: String, value: @Composable () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(key, style = MaterialTheme.typography.bodyMedium, color = TextMid, modifier = Modifier.weight(1f))
        value()
    }
}

@Composable
private fun StatTile(modifier: Modifier, icon: @Composable () -> Unit, value: String, label: String) {
    val shape = RoundedCornerShape(10.dp)
    Column(
        modifier.clip(shape).background(Ink600).border(1.dp, Ink500, shape).padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        icon()
        Text(value, style = MaterialTheme.typography.titleLarge, color = TextHigh, fontWeight = FontWeight.Bold)
        Text(label, style = MaterialTheme.typography.labelSmall, color = TextMid)
    }
}

@Composable
private fun UnitCount(icon: ImageVector, count: Int) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = TextMid, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(4.dp))
        Text(count.toString(), style = MaterialTheme.typography.labelLarge, color = TextHigh)
    }
}

@Composable
private fun CostChip(icon: @Composable () -> Unit, amount: Int, enough: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        icon()
        Spacer(Modifier.width(3.dp))
        Text(amount.toString(), style = MaterialTheme.typography.labelMedium, color = if (enough) GoldBright else Rust)
    }
}

@Composable
internal fun Badge(text: String, color: Color) {
    Text(
        text,
        style = MaterialTheme.typography.labelSmall,
        color = color,
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(color.copy(alpha = 0.15f))
            .border(1.dp, color.copy(alpha = 0.6f), RoundedCornerShape(50))
            .padding(horizontal = 8.dp, vertical = 2.dp),
    )
}

@Composable
private fun BlockNote(text: String) {
    Text(text, style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 4.dp))
}

@Composable
internal fun SmallActionButton(
    text: String,
    icon: ImageVector?,
    enabled: Boolean,
    modifier: Modifier = Modifier,
    color: Color = Gold,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(8.dp)
    Row(
        modifier
            .alpha(if (enabled) 1f else 0.45f)
            .clip(shape)
            .background(color.copy(alpha = 0.16f))
            .border(1.dp, color.copy(alpha = 0.75f), shape)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        if (icon != null) {
            Icon(icon, null, tint = color, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
        }
        Text(text, style = MaterialTheme.typography.labelMedium, color = TextHigh, maxLines = 2)
    }
}

/** Whole numbers without a decimal point, otherwise one decimal. */
internal fun formatNumber(value: Double): String =
    if (value == Math.floor(value)) value.toInt().toString() else "%.1f".format(value)
