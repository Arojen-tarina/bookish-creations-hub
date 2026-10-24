package fi.bookish.creations.arojen.tarinat.game.data

import fi.bookish.creations.arojen.tarinat.game.model.Faction
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.Personality
import fi.bookish.creations.arojen.tarinat.game.model.Point
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.Region
import fi.bookish.creations.arojen.tarinat.game.model.Terrain
import fi.bookish.creations.arojen.tarinat.game.model.TradeGood

/** Realms that are actually simulated; the others only exist as neutral land. */
val ACTIVE_FACTIONS: List<FactionId> = listOf(FactionId.MONGOL, FactionId.SONG, FactionId.RUS, FactionId.KHWAREZM)

object VictoryTargets {
    /** ~60% of the 221-province map. */
    const val PROVINCES = 130
    const val GOLD = 2000
    const val TECH = 5
    /** Consecutive turns the gold threshold must be held (economic victory). */
    const val TREASURY_STREAK = 5
    /** Alliance with every surviving rival, minimum this many (diplomatic victory). */
    const val DIPLOMATIC_MIN_ALLIES = 2
    const val INFLUENCE = 100
    const val PRESTIGE = 60
}

object Rules {
    /** Wonders per capital; caps Prestige at 9 per turn. */
    const val WONDER_MAX = 3
    const val FORT_MAX_DURABILITY = 100
    const val FORT_MAX_LEVEL = 3
    const val START_YEAR = 1206
    const val STARTING_HAND = 5
    const val STARTING_FOOD = 10
    const val STARTING_ARTISANS = 3
    const val ARMY_MOVEMENT = 3
    const val REPAIR_FORT_GOLD = 10
    const val REPAIR_FORT_ARTISANS = 1
    const val INFANTRY_GOLD = 10
    const val INFANTRY_FOOD = 5
    const val CAVALRY_GOLD = 20
    const val CAVALRY_HORSES = 5
    const val CAVALRY_FOOD = 10
}

/** Starting stats for 1206 (FACTION_DATA_1206). Names, rulers and colours live in the UI layer. */
val FACTION_DATA_1206: Map<FactionId, Faction> = listOf(
    Faction(FactionId.MONGOL, "karakorum", Personality.AGGRESSIVE, 50, 80, 100, 0.3, 0.0, isPlayer = false),
    Faction(FactionId.JIN, "zhongdu", Personality.DEFENSIVE, 150, 200, 30, 0.0, 0.2, isPlayer = false),
    Faction(FactionId.SONG, "hangzhou", Personality.TRADER, 200, 150, 20, -0.1, 0.3, isPlayer = false),
    Faction(FactionId.XIXIA, "xingqing", Personality.CAUTIOUS, 60, 60, 40, 0.1, 0.1, isPlayer = false),
    Faction(FactionId.KHWAREZM, "samarkand", Personality.EXPANSIONIST, 120, 100, 50, 0.1, 0.2, isPlayer = false),
    Faction(FactionId.RUS, "novgorod", Personality.DEFENSIVE, 80, 80, 25, 0.0, 0.1, isPlayer = false),
    Faction(FactionId.KIPCHAK, "sarkel", Personality.AGGRESSIVE, 30, 50, 70, 0.2, -0.1, isPlayer = false),
).associateBy { it.id }

/** Shorthand used by the generated province table. */
internal fun province(
    id: String,
    name: String,
    region: Region,
    terrain: Terrain,
    owner: FactionId?,
    tax: Int,
    manpower: Int,
    development: Int,
    x: Double,
    y: Double,
    neighbors: List<String>,
    fort: Int = 0,
    tradeGood: TradeGood? = null,
    capital: Boolean = false,
    silkRoad: Boolean = false,
) = Province(
    id = id,
    name = name,
    region = region,
    ownerId = owner,
    terrain = terrain,
    isCapital = capital,
    neighbors = neighbors,
    baseTax = tax,
    baseManpower = manpower,
    tradeGood = tradeGood,
    hasSilkRoad = silkRoad,
    fortLevel = fort,
    developmentLevel = development,
    center = Point(x, y),
)
