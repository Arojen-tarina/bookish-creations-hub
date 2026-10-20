package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.ResourceCollection
import fi.bookish.creations.arojen.tarinat.game.model.Terrain
import fi.bookish.creations.arojen.tarinat.game.model.TradeGood
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.pow

/**
 * Silk Road income: base tax of every owned hub, +2 per silk hub, plus a
 * super-linear bonus for each connected stretch of hubs (two or more).
 */
internal fun silkRoadBonus(ownedProvinces: List<Province>): Int {
    val hubs = ownedProvinces.filter { it.hasSilkRoad }
    if (hubs.isEmpty()) return 0

    val baseSilkIncome = hubs.sumOf { it.baseTax }
    val silkTradeBonus = hubs.count { it.tradeGood == TradeGood.SILK } * 2

    val hubById = hubs.associateBy { it.id }
    val visited = HashSet<String>()
    var chainBonus = 0
    for (hub in hubs) {
        if (hub.id in visited) continue
        val queue = ArrayDeque<String>()
        queue.add(hub.id)
        visited.add(hub.id)
        var clusterSize = 0
        while (queue.isNotEmpty()) {
            val current = hubById[queue.removeFirst()] ?: continue
            clusterSize += 1
            for (neighborId in current.neighbors) {
                if (neighborId in visited || neighborId !in hubById) continue
                visited.add(neighborId)
                queue.add(neighborId)
            }
        }
        if (clusterSize > 1) chainBonus += (clusterSize.toDouble().pow(1.45) * 1.6).roundJs()
    }
    return baseSilkIncome + silkTradeBonus + chainBonus
}

/** Number of [faction]'s provinces holding at least one [type] building. */
private fun GameState.provincesWithBuilding(faction: FactionId, type: BuildingType, extra: (Province) -> Boolean = { true }): Int =
    buildings.count { (provinceId, list) ->
        val p = province(provinceId)
        p?.ownerId == faction && type in list && extra(p)
    }

/** Per-turn yield for [factionId] (calculateResourceCollection in the original). */
internal fun calculateResourceCollection(state: GameState, factionId: FactionId): ResourceCollection {
    val owned = state.provinces.filter { it.ownerId == factionId }
    val baseTaxIncome = owned.sumOf { it.baseTax }
    val manpowerGain = floor(owned.sumOf { it.baseManpower } * 0.3).toInt()
    val silkBonus = silkRoadBonus(owned)

    val marketBonus = state.provincesWithBuilding(factionId, BuildingType.MARKET) * 3
    // Bridges on Silk Road provinces act as caravan crossings: +2 gold each.
    val bridgeBonus = state.provincesWithBuilding(factionId, BuildingType.BRIDGE) { it.hasSilkRoad } * 2
    // A captured capital halves income until it is recovered.
    val faction = state.faction(factionId)
    val capital = faction?.let { state.province(it.capitalId) }
    val capitalPenalty = if (capital != null && capital.ownerId != factionId) 0.5 else 1.0
    val taxIncome = floor((baseTaxIncome + silkBonus + marketBonus + bridgeBonus) * capitalPenalty).toInt()

    val foodUpkeep = -state.armies.count { it.ownerId == factionId }
    val farmland = owned.count { it.terrain == Terrain.FARMLAND || it.terrain == Terrain.GRASSLAND }
    val camps = state.provincesWithBuilding(factionId, BuildingType.CAMP)
    val foodChange = foodUpkeep + floor(farmland * 0.5).toInt() + camps * 2

    val horseProvinces = owned.count { it.terrain == Terrain.STEPPE || it.tradeGood == TradeGood.HORSES }
    val horsesGain = horseProvinces + state.provincesWithBuilding(factionId, BuildingType.STABLE)

    val artisanProvinces = owned.count { it.terrain == Terrain.FARMLAND || it.terrain == Terrain.HILLS }
    var artisansGain = floor(artisanProvinces * 0.5).toInt() + state.provincesWithBuilding(factionId, BuildingType.WORKSHOP)
    if (owned.size >= 3) artisansGain = max(1, artisansGain)

    // Influence: Silk Road hubs, a held capital, alliances and wonders. Prestige: wonders.
    val silkHubsOwned = owned.count { it.hasSilkRoad }
    val capitalHeld = if (capital != null && capital.ownerId == factionId) 1 else 0
    val allianceCount = state.relations.count { rel ->
        rel.involves(factionId) && rel.treaties.any { it.type == TreatyType.ALLIANCE }
    }
    val wonderCount = state.provincesWithBuilding(factionId, BuildingType.WONDER)
    val influenceGain = silkHubsOwned + capitalHeld * 2 + allianceCount * 2 + wonderCount * 2
    val prestigeGain = wonderCount * 3

    // Early-game boost speeds up the opening build-up.
    val earlyBoost = if (state.turn <= 4) 4 else 0

    return ResourceCollection(
        taxIncome = taxIncome + earlyBoost,
        manpowerGain = manpowerGain,
        marketBonus = marketBonus,
        silkRoadBonus = silkBonus,
        foodChange = foodChange,
        artisansGain = artisansGain,
        horsesGain = horsesGain,
        influenceGain = influenceGain,
        prestigeGain = prestigeGain,
    )
}

/** Credits a collection to [factionId]; food, artisans, influence and prestige are player-only pools. */
internal fun applyResourceCollection(state: GameState, factionId: FactionId, c: ResourceCollection): GameState =
    state.copy(
        factions = state.factions.map {
            if (it.id == factionId) {
                it.copy(
                    treasury = it.treasury + c.taxIncome,
                    manpower = it.manpower + c.manpowerGain,
                    horses = it.horses + c.horsesGain,
                )
            } else {
                it
            }
        },
        food = max(0, state.food + c.foodChange),
        artisans = state.artisans + c.artisansGain,
        influence = state.influence + c.influenceGain,
        prestige = state.prestige + c.prestigeGain,
        resourcesCollected = true,
        lastCollection = c,
    )
