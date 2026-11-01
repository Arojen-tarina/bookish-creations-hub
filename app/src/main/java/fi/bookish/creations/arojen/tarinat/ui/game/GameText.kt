package fi.bookish.creations.arojen.tarinat.ui.game

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.engine.BuildBlock
import fi.bookish.creations.arojen.tarinat.game.engine.RecruitBlock
import fi.bookish.creations.arojen.tarinat.game.engine.RepairBlock
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.CardType
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Rarity
import fi.bookish.creations.arojen.tarinat.game.model.Terrain
import fi.bookish.creations.arojen.tarinat.game.model.TradeGood
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.game.model.TurnLogEntry
import fi.bookish.creations.arojen.tarinat.game.model.TurnLogKind
import fi.bookish.creations.arojen.tarinat.game.model.WinCondition
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons

// Maps engine enums to localized resources and icons. Kept in one place so
// every screen names things the same way.

@get:StringRes
val Terrain.nameRes: Int
    get() = when (this) {
        Terrain.STEPPE -> R.string.terrain_steppe
        Terrain.GRASSLAND -> R.string.terrain_grassland
        Terrain.FOREST -> R.string.terrain_forest
        Terrain.MOUNTAIN -> R.string.terrain_mountain
        Terrain.DESERT -> R.string.terrain_desert
        Terrain.TAIGA -> R.string.terrain_taiga
        Terrain.TUNDRA -> R.string.terrain_tundra
        Terrain.FARMLAND -> R.string.terrain_farmland
        Terrain.HILLS -> R.string.terrain_hills
        Terrain.MARSH -> R.string.terrain_marsh
    }

@get:StringRes
val TradeGood.nameRes: Int
    get() = when (this) {
        TradeGood.HORSES -> R.string.good_horses
        TradeGood.SILK -> R.string.good_silk
        TradeGood.SPICES -> R.string.good_spices
        TradeGood.GOLD -> R.string.good_gold
        TradeGood.IRON -> R.string.good_iron
        TradeGood.FUR -> R.string.good_fur
        TradeGood.GRAIN -> R.string.good_grain
        TradeGood.SALT -> R.string.good_salt
        TradeGood.LIVESTOCK -> R.string.good_livestock
        TradeGood.GEMS -> R.string.good_gems
    }

@get:StringRes
val TradeGood.effectRes: Int
    get() = when (this) {
        TradeGood.HORSES -> R.string.good_effect_horses
        TradeGood.SILK -> R.string.good_effect_silk
        TradeGood.SPICES -> R.string.good_effect_spices
        TradeGood.GOLD -> R.string.good_effect_gold
        TradeGood.IRON -> R.string.good_effect_iron
        TradeGood.FUR -> R.string.good_effect_fur
        TradeGood.GRAIN -> R.string.good_effect_grain
        TradeGood.SALT -> R.string.good_effect_salt
        TradeGood.LIVESTOCK -> R.string.good_effect_livestock
        TradeGood.GEMS -> R.string.good_effect_gems
    }

@get:StringRes
val BuildingType.nameRes: Int
    get() = when (this) {
        BuildingType.CAMP -> R.string.building_camp_name
        BuildingType.MARKET -> R.string.building_market_name
        BuildingType.FORTRESS -> R.string.building_fortress_name
        BuildingType.WORKSHOP -> R.string.building_workshop_name
        BuildingType.STABLE -> R.string.building_stable_name
        BuildingType.BRIDGE -> R.string.building_bridge_name
        BuildingType.WONDER -> R.string.building_wonder_name
    }

@get:StringRes
val BuildingType.effectRes: Int
    get() = when (this) {
        BuildingType.CAMP -> R.string.building_camp_effect
        BuildingType.MARKET -> R.string.building_market_effect
        BuildingType.FORTRESS -> R.string.building_fortress_effect
        BuildingType.WORKSHOP -> R.string.building_workshop_effect
        BuildingType.STABLE -> R.string.building_stable_effect
        BuildingType.BRIDGE -> R.string.building_bridge_effect
        BuildingType.WONDER -> R.string.building_wonder_effect
    }

val BuildingType.icon: ImageVector
    get() = when (this) {
        BuildingType.CAMP -> GameIcons.Tent
        BuildingType.MARKET -> GameIcons.Market
        BuildingType.FORTRESS -> GameIcons.Castle
        BuildingType.WORKSHOP -> GameIcons.Anvil
        BuildingType.STABLE -> GameIcons.Horseshoe
        BuildingType.BRIDGE -> GameIcons.Bridge
        BuildingType.WONDER -> GameIcons.Temple
    }

@get:StringRes
val TreatyType.nameRes: Int
    get() = when (this) {
        TreatyType.NON_AGGRESSION -> R.string.treaty_non_aggression_name
        TreatyType.TRADE_AGREEMENT -> R.string.treaty_trade_agreement_name
        TreatyType.ALLIANCE -> R.string.treaty_alliance_name
        TreatyType.TRUCE -> R.string.treaty_truce_name
        TreatyType.TRIBUTARY -> R.string.treaty_tributary_name
        TreatyType.PEACE -> R.string.treaty_peace_name
        TreatyType.WAR_SURPRISE -> R.string.treaty_war_surprise_name
        TreatyType.WAR_FORMAL -> R.string.treaty_war_formal_name
    }

@get:StringRes
val TreatyType.descRes: Int
    get() = when (this) {
        TreatyType.NON_AGGRESSION -> R.string.treaty_non_aggression_desc
        TreatyType.TRADE_AGREEMENT -> R.string.treaty_trade_agreement_desc
        TreatyType.ALLIANCE -> R.string.treaty_alliance_desc
        TreatyType.TRUCE -> R.string.treaty_truce_desc
        TreatyType.TRIBUTARY -> R.string.treaty_tributary_desc
        TreatyType.PEACE -> R.string.treaty_peace_desc
        TreatyType.WAR_SURPRISE -> R.string.treaty_war_surprise_desc
        TreatyType.WAR_FORMAL -> R.string.treaty_war_formal_desc
    }

/** Ruler names exist for the four playable realms; others show no ruler line. */
@get:StringRes
val FactionId.rulerRes: Int?
    get() = when (this) {
        FactionId.MONGOL -> R.string.faction_ruler_mongol
        FactionId.SONG -> R.string.faction_ruler_song
        FactionId.RUS -> R.string.faction_ruler_rus
        FactionId.KHWAREZM -> R.string.faction_ruler_khwarezm
        else -> null
    }

@get:StringRes
val WinCondition?.victoryTextRes: Int
    get() = when (this) {
        WinCondition.MILITARY -> R.string.game_over_victory_military
        WinCondition.ECONOMIC -> R.string.game_over_victory_economic
        WinCondition.TECHNOLOGY -> R.string.game_over_victory_technology
        WinCondition.DIPLOMATIC -> R.string.game_over_victory_diplomatic
        WinCondition.CULTURAL -> R.string.game_over_victory_cultural
        null -> R.string.game_over_victory_generic
    }

@get:StringRes
val CardType.nameRes: Int
    get() = when (this) {
        CardType.STRATEGY -> R.string.card_type_strategy
        CardType.DIPLOMACY -> R.string.card_type_diplomacy
        CardType.TECHNOLOGY -> R.string.card_type_technology
        CardType.RESOURCE -> R.string.card_type_resource
    }

@get:StringRes
val Rarity.nameRes: Int
    get() = when (this) {
        Rarity.COMMON -> R.string.rarity_common
        Rarity.UNCOMMON -> R.string.rarity_uncommon
        Rarity.RARE -> R.string.rarity_rare
        Rarity.LEGENDARY -> R.string.rarity_legendary
    }

@get:StringRes
val BuildBlock.messageRes: Int
    get() = when (this) {
        BuildBlock.NOT_OWNED -> R.string.block_not_owned
        BuildBlock.NO_GOLD -> R.string.block_no_gold
        BuildBlock.NO_ARTISANS -> R.string.block_no_artisans
        BuildBlock.CAPITAL_ONLY -> R.string.block_capital_only
        BuildBlock.MAX_LEVEL -> R.string.block_max_level
        BuildBlock.ALREADY_BUILT -> R.string.block_already_built
    }

@get:StringRes
val RecruitBlock.messageRes: Int
    get() = when (this) {
        RecruitBlock.NOT_OWNED -> R.string.block_not_owned
        RecruitBlock.NO_GOLD -> R.string.block_no_gold
        RecruitBlock.NO_FOOD -> R.string.block_no_food
        RecruitBlock.NO_HORSES -> R.string.block_no_horses
        RecruitBlock.CAPITAL_LOST -> R.string.block_capital_lost
        RecruitBlock.NEEDS_CAMP -> R.string.block_needs_camp
        RecruitBlock.NEEDS_STABLE -> R.string.block_needs_stable
    }

@get:StringRes
val RepairBlock.messageRes: Int
    get() = when (this) {
        RepairBlock.NOT_OWNED -> R.string.block_not_owned
        RepairBlock.NOT_DAMAGED -> R.string.block_not_damaged
        RepairBlock.NO_GOLD -> R.string.block_no_gold
        RepairBlock.NO_ARTISANS -> R.string.block_no_artisans
    }

/** One line of the turn chronicle in the player's language. */
@Composable
fun turnLogText(entry: TurnLogEntry, game: GameState): String {
    val who = stringResource(entry.factionId.nameRes)
    val where = entry.provinceId?.let { game.province(it)?.name }.orEmpty()
    return when (entry.kind) {
        TurnLogKind.MERGED_ARMIES -> stringResource(R.string.log_merged_armies, who)
        TurnLogKind.DEFEND_BORDER -> stringResource(R.string.log_defend_border, who, where)
        TurnLogKind.CAPTURE -> stringResource(R.string.log_capture, who, where)
        TurnLogKind.ADVANCE -> stringResource(R.string.log_advance, who, where)
        TurnLogKind.WON_BATTLE -> stringResource(R.string.log_won_battle, who, where)
        TurnLogKind.ATTACK_FAILED -> stringResource(R.string.log_attack_failed, who, where)
        TurnLogKind.CONQUERED -> stringResource(R.string.log_conquered, who, where)
        TurnLogKind.FORTIFY -> stringResource(R.string.log_fortify, who, where)
        TurnLogKind.FORTIFY_CAPITAL -> stringResource(R.string.log_fortify_capital, who, where)
        TurnLogKind.BUILD_MARKET -> stringResource(R.string.log_build_market, who, where)
        TurnLogKind.RECRUITED -> stringResource(R.string.log_recruited, who, where)
        TurnLogKind.PLAYER_CHIEF_FELL -> stringResource(R.string.log_player_chief_fell)
    }
}
