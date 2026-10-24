package fi.bookish.creations.arojen.tarinat.game.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Serial names match the original TypeScript string literals so saves and
// parity tests stay readable and stable even if Kotlin names are refactored.

@Serializable
enum class FactionId {
    @SerialName("mongol") MONGOL,
    @SerialName("jin") JIN,
    @SerialName("song") SONG,
    @SerialName("xixia") XIXIA,
    @SerialName("khwarezm") KHWAREZM,
    @SerialName("rus") RUS,
    @SerialName("kipchak") KIPCHAK;

    /** Lower-case id used inside generated ids such as "army-mongol-main". */
    val key: String get() = name.lowercase()
}

@Serializable
enum class Region {
    @SerialName("mongolia") MONGOLIA,
    @SerialName("manchuria") MANCHURIA,
    @SerialName("jin_china") JIN_CHINA,
    @SerialName("song_china") SONG_CHINA,
    @SerialName("xixia") XIXIA,
    @SerialName("tibet") TIBET,
    @SerialName("khwarezm") KHWAREZM,
    @SerialName("persia") PERSIA,
    @SerialName("khorasan") KHORASAN,
    @SerialName("transoxiana") TRANSOXIANA,
    @SerialName("kipchak") KIPCHAK,
    @SerialName("rus") RUS,
    @SerialName("caucasus") CAUCASUS,
    @SerialName("siberia") SIBERIA,
    @SerialName("korea") KOREA,
    @SerialName("central_asia") CENTRAL_ASIA,
}

/** Terrain rules (PROVINCE_TERRAIN_INFO in the original). */
@Serializable
enum class Terrain(
    val movementCost: Int,
    val movementCostInfantry: Int,
    val movementCostCavalry: Int,
    val defenseBonus: Int,
    val taxModifier: Double,
) {
    @SerialName("steppe") STEPPE(1, 1, 1, 0, 0.8),
    @SerialName("grassland") GRASSLAND(1, 1, 1, 0, 1.0),
    @SerialName("forest") FOREST(2, 2, 1, 1, 0.9),
    @SerialName("mountain") MOUNTAIN(3, 3, 3, 3, 0.5),
    @SerialName("desert") DESERT(2, 2, 2, 0, 0.3),
    @SerialName("taiga") TAIGA(2, 2, 2, 1, 0.6),
    @SerialName("tundra") TUNDRA(2, 2, 2, 0, 0.2),
    @SerialName("farmland") FARMLAND(1, 1, 1, 0, 1.5),
    @SerialName("hills") HILLS(2, 2, 2, 2, 0.8),
    @SerialName("marsh") MARSH(3, 3, 3, 1, 0.4),
}

@Serializable
enum class TradeGood(val value: Int) {
    @SerialName("horses") HORSES(3),
    @SerialName("silk") SILK(5),
    @SerialName("spices") SPICES(4),
    @SerialName("gold") GOLD(6),
    @SerialName("iron") IRON(3),
    @SerialName("fur") FUR(4),
    @SerialName("grain") GRAIN(2),
    @SerialName("salt") SALT(3),
    @SerialName("livestock") LIVESTOCK(2),
    @SerialName("gems") GEMS(5),
}

@Serializable
enum class Personality {
    @SerialName("aggressive") AGGRESSIVE,
    @SerialName("defensive") DEFENSIVE,
    @SerialName("trader") TRADER,
    @SerialName("expansionist") EXPANSIONIST,
    @SerialName("cautious") CAUTIOUS,
}

@Serializable
enum class TreatyType {
    @SerialName("non_aggression") NON_AGGRESSION,
    @SerialName("trade_agreement") TRADE_AGREEMENT,
    @SerialName("alliance") ALLIANCE,
    @SerialName("truce") TRUCE,
    @SerialName("tributary") TRIBUTARY,
    @SerialName("peace") PEACE,
    @SerialName("war_surprise") WAR_SURPRISE,
    @SerialName("war_formal") WAR_FORMAL;

    val isWar: Boolean get() = this == WAR_SURPRISE || this == WAR_FORMAL
    val isPeaceful: Boolean get() = this == NON_AGGRESSION || this == PEACE || this == TRUCE || this == ALLIANCE
}

/** Buildings the player can raise in a province (MVPBuildingType in the original). */
@Serializable
enum class BuildingType(val goldCost: Int, val artisanCost: Int) {
    @SerialName("camp") CAMP(15, 0),
    @SerialName("market") MARKET(25, 1),
    @SerialName("fortress") FORTRESS(50, 2),
    @SerialName("workshop") WORKSHOP(30, 1),
    @SerialName("stable") STABLE(40, 1),
    @SerialName("bridge") BRIDGE(20, 1),
    @SerialName("wonder") WONDER(80, 3),
}

@Serializable
enum class RecruitType {
    @SerialName("infantry") INFANTRY,
    @SerialName("cavalry") CAVALRY,
}

/** Scales AI starting funds and income only; AI decision making is unchanged. */
@Serializable
enum class Difficulty(val aiIncomeMultiplier: Double) {
    @SerialName("easy") EASY(0.75),
    @SerialName("normal") NORMAL(1.0),
    @SerialName("hard") HARD(1.35),
}

@Serializable
enum class CardType {
    @SerialName("strategy") STRATEGY,
    @SerialName("diplomacy") DIPLOMACY,
    @SerialName("technology") TECHNOLOGY,
    @SerialName("resource") RESOURCE,
}

@Serializable
enum class Rarity {
    @SerialName("common") COMMON,
    @SerialName("uncommon") UNCOMMON,
    @SerialName("rare") RARE,
    @SerialName("legendary") LEGENDARY,
}

@Serializable
enum class CardEffectType {
    @SerialName("attack_bonus") ATTACK_BONUS,
    @SerialName("defense_bonus") DEFENSE_BONUS,
    @SerialName("movement_bonus") MOVEMENT_BONUS,
    @SerialName("gold") GOLD,
    @SerialName("food") FOOD,
    @SerialName("horses") HORSES,
    @SerialName("artisans") ARTISANS,
    @SerialName("draw_cards") DRAW_CARDS,
    @SerialName("recruit_free") RECRUIT_FREE,
    @SerialName("permanent_attack") PERMANENT_ATTACK,
    @SerialName("permanent_defense") PERMANENT_DEFENSE,
    @SerialName("terrain_ignore") TERRAIN_IGNORE,
}

@Serializable
enum class WinCondition {
    @SerialName("military") MILITARY,
    @SerialName("economic") ECONOMIC,
    @SerialName("technology") TECHNOLOGY,
    @SerialName("diplomatic") DIPLOMATIC,
    @SerialName("cultural") CULTURAL,
}
