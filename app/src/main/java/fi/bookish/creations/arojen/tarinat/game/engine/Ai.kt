package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.DiplomaticRelation
import fi.bookish.creations.arojen.tarinat.game.model.Faction
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.Personality
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.game.model.TurnLogKind
import kotlin.math.ceil
import kotlin.math.max

internal enum class AiActionType { MOVE, ATTACK, BUILD_FORT, BUILD_MARKET, RECRUIT, MERGE, SKIP }

internal data class AiAction(
    val type: AiActionType,
    val armyId: String? = null,
    val mergeIntoId: String? = null,
    val targetProvinceId: String? = null,
    /** How the turn log describes the action; attack outcomes are logged by the resolver. */
    val logKind: TurnLogKind? = null,
    /** Higher runs first. */
    val priority: Double,
)

private data class ThreatInfo(
    val factionId: FactionId,
    val totalStrength: Double,
    val borderingProvinces: List<String>,
    val armiesNearBorder: Int,
)

private data class TargetScore(val provinceId: String, val score: Double, val distance: Int, val path: List<String>)

private data class PersonalityWeights(
    val attack: Double,
    val expand: Double,
    val defend: Double,
    val build: Double,
    val recruit: Double,
    /** Minimum strength ratio before attacking. */
    val aggressionThreshold: Double,
)

private val PERSONALITY_WEIGHTS = mapOf(
    Personality.AGGRESSIVE to PersonalityWeights(2.0, 1.5, 0.5, 0.5, 1.5, 0.6),
    Personality.DEFENSIVE to PersonalityWeights(0.5, 0.8, 2.0, 1.5, 1.0, 1.5),
    Personality.TRADER to PersonalityWeights(0.3, 1.0, 1.0, 2.0, 0.8, 1.8),
    Personality.EXPANSIONIST to PersonalityWeights(1.0, 2.0, 0.8, 1.0, 1.2, 0.8),
    Personality.CAUTIOUS to PersonalityWeights(0.3, 0.6, 1.5, 1.5, 1.0, 2.0),
)

private fun factionStrength(factionId: FactionId, armies: List<Army>): Double =
    armies.filter { it.ownerId == factionId }.sumOf { it.strength() }

private fun provinceValue(p: Province): Double =
    p.baseTax + p.baseManpower * 0.5 + (if (p.hasSilkRoad) 3 else 0) + (if (p.tradeGood != null) 2 else 0) + (if (p.isCapital) 5 else 0)

/** Shortest path (excluding the start) within [maxDepth] steps, or null. */
private fun bfsPath(fromId: String, toId: String, byId: Map<String, Province>, maxDepth: Int = 6): List<String>? {
    val queue = ArrayDeque<Pair<String, List<String>>>()
    queue.add(fromId to emptyList())
    val visited = hashSetOf(fromId)
    while (queue.isNotEmpty()) {
        val (id, path) = queue.removeFirst()
        if (path.size >= maxDepth) continue
        val province = byId[id] ?: continue
        for (n in province.neighbors) {
            if (n in visited) continue
            visited.add(n)
            val newPath = path + n
            if (n == toId) return newPath
            queue.add(n to newPath)
        }
    }
    return null
}

/** Every province not owned by [factionId] within [maxRange] steps, best score first. */
private fun findTargetsInRange(startId: String, byId: Map<String, Province>, factionId: FactionId, maxRange: Int): List<TargetScore> {
    val results = mutableListOf<TargetScore>()
    val queue = ArrayDeque<Triple<String, List<String>, Int>>()
    queue.add(Triple(startId, emptyList(), 0))
    val visited = hashSetOf(startId)
    while (queue.isNotEmpty()) {
        val (id, path, dist) = queue.removeFirst()
        if (dist > maxRange) continue
        val province = byId[id] ?: continue
        if (dist > 0 && province.ownerId != factionId) {
            results += TargetScore(province.id, provinceValue(province) / max(1, dist), dist, path)
        }
        for (n in province.neighbors) {
            if (n in visited) continue
            visited.add(n)
            queue.add(Triple(n, path + n, dist + 1))
        }
    }
    return results.sortedByDescending { it.score }
}

private fun relationBetween(relations: List<DiplomaticRelation>, a: FactionId, b: FactionId?): DiplomaticRelation? =
    b?.let { other -> relations.firstOrNull { it.isBetween(a, other) } }

private fun analyzeThreat(
    faction: Faction,
    provinces: List<Province>,
    byId: Map<String, Province>,
    armies: List<Army>,
    relations: List<DiplomaticRelation>,
): List<ThreatInfo> {
    val borderByFaction = LinkedHashMap<FactionId, MutableList<String>>()
    for (mine in provinces) {
        if (mine.ownerId != faction.id) continue
        for (nId in mine.neighbors) {
            val owner = byId[nId]?.ownerId ?: continue
            if (owner == faction.id) continue
            borderByFaction.getOrPut(owner) { mutableListOf() }.add(nId)
        }
    }
    return borderByFaction.map { (fId, borderProvinces) ->
        val nearBorder = armies.count { it.ownerId == fId && it.provinceId in borderProvinces }
        val rel = relationBetween(relations, faction.id, fId)
        val hostility = if (rel != null) max(0, -rel.relation) / 100.0 else 0.5
        ThreatInfo(fId, factionStrength(fId, armies) * (1 + hostility), borderProvinces.distinct(), nearBorder)
    }.sortedByDescending { it.totalStrength }
}

/**
 * Picks up to five actions for one AI realm this turn: merge, defend, attack,
 * expand, advance, build and recruit, weighted by the realm's personality.
 */
internal fun calculateAiActions(
    faction: Faction,
    armies: List<Army>,
    provinces: List<Province>,
    relations: List<DiplomaticRelation>,
): List<AiAction> {
    val actions = mutableListOf<AiAction>()
    val weights = PERSONALITY_WEIGHTS[faction.personality] ?: PERSONALITY_WEIGHTS.getValue(Personality.CAUTIOUS)
    val byId = provinces.associateBy { it.id }

    val myArmies = armies.filter { it.ownerId == faction.id && it.movementLeft > 0 }
    val myProvinces = provinces.filter { it.ownerId == faction.id }
    val myStrength = factionStrength(faction.id, armies)
    val threats = analyzeThreat(faction, provinces, byId, armies, relations)
    val assigned = HashSet<String>()

    // 1. Merge stacks that share a province into the strongest one.
    val byProvince = LinkedHashMap<String, MutableList<Army>>()
    for (a in myArmies) byProvince.getOrPut(a.provinceId) { mutableListOf() }.add(a)
    for (stack in byProvince.values) {
        if (stack.size < 2) continue
        val sorted = stack.sortedByDescending { it.strength() }
        for (i in 1 until sorted.size) {
            actions += AiAction(AiActionType.MERGE, armyId = sorted[i].id, mergeIntoId = sorted[0].id, logKind = TurnLogKind.MERGED_ARMIES, priority = 5.0)
            assigned += sorted[i].id
        }
    }

    // 2. Send one idle army towards the most threatened border.
    val highestThreat = threats.firstOrNull()
    if (highestThreat != null && highestThreat.armiesNearBorder > 0) {
        val idle = myArmies.filter { it.id !in assigned && it.provinceId !in highestThreat.borderingProvinces }
        for (army in idle) {
            if (army.id in assigned) continue
            var bestTarget: String? = null
            var bestDist = Int.MAX_VALUE
            for (borderProv in highestThreat.borderingProvinces) {
                for (mp in myProvinces) {
                    if (borderProv !in mp.neighbors) continue
                    val path = bfsPath(army.provinceId, mp.id, byId, 4)
                    if (path != null && path.size < bestDist) {
                        bestDist = path.size
                        bestTarget = path[0]
                    }
                }
            }
            if (bestTarget != null && bestDist <= 3 && weights.defend > 1.0) {
                actions += AiAction(AiActionType.MOVE, armyId = army.id, targetProvinceId = bestTarget, logKind = TurnLogKind.DEFEND_BORDER, priority = 8 * weights.defend)
                assigned += army.id
                break
            }
        }
    }

    // 3. Attack the best-scoring enemy neighbour the army can beat.
    for (army in myArmies) {
        if (army.id in assigned) continue
        val current = byId[army.provinceId] ?: continue
        val candidates = mutableListOf<Pair<Province, Double>>()
        for (neighbor in current.neighbors.mapNotNull { byId[it] }) {
            val owner = neighbor.ownerId ?: continue
            if (owner == faction.id) continue
            val rel = relationBetween(relations, faction.id, owner)
            val hasTruce = rel?.treaties?.any {
                it.type == TreatyType.TRUCE || it.type == TreatyType.ALLIANCE || it.type == TreatyType.NON_AGGRESSION
            } == true
            if (hasTruce && faction.personality != Personality.AGGRESSIVE) continue

            val enemyStrength = armies.filter { it.provinceId == neighbor.id && it.ownerId != faction.id }.sumOf { it.strength() }
            val effectiveEnemy = enemyStrength + neighbor.terrain.defenseBonus * 2 + neighbor.fortLevel * 3
            val ratio = army.strength() / max(1.0, effectiveEnemy)
            if (ratio < weights.aggressionThreshold) continue
            candidates += neighbor to provinceValue(neighbor) * ratio * weights.attack
        }
        val best = candidates.sortedByDescending { it.second }.firstOrNull() ?: continue
        if (army.movementLeft >= best.first.terrain.movementCost) {
            actions += AiAction(AiActionType.ATTACK, armyId = army.id, targetProvinceId = best.first.id, priority = best.second)
            assigned += army.id
        }
    }

    // 4. Expand towards the best unowned province within three steps.
    for (army in myArmies) {
        if (army.id in assigned) continue
        val best = findTargetsInRange(army.provinceId, byId, faction.id, 3)
            .firstOrNull { byId[it.provinceId]?.ownerId == null } ?: continue
        val nextStep = best.path[0]
        val next = byId[nextStep] ?: continue
        if (army.movementLeft >= next.terrain.movementCost) {
            val kind = if (next.ownerId == null) TurnLogKind.CAPTURE else TurnLogKind.ADVANCE
            actions += AiAction(AiActionType.MOVE, armyId = army.id, targetProvinceId = nextStep, logKind = kind, priority = best.score * weights.expand)
            assigned += army.id
        }
    }

    // 5. Otherwise advance towards enemy territory (cautious realms hold back).
    for (army in myArmies) {
        if (army.id in assigned) continue
        val best = findTargetsInRange(army.provinceId, byId, faction.id, 4)
            .firstOrNull { val owner = byId[it.provinceId]?.ownerId; owner != null && owner != faction.id } ?: continue
        if (faction.personality == Personality.CAUTIOUS) continue
        val nextStep = best.path[0]
        val next = byId[nextStep] ?: continue
        if (army.movementLeft >= next.terrain.movementCost) {
            actions += AiAction(AiActionType.MOVE, armyId = army.id, targetProvinceId = nextStep, logKind = TurnLogKind.ADVANCE, priority = best.score * 0.5 * weights.attack)
            assigned += army.id
        }
    }

    // 6. Build: border forts, markets, capital walls.
    val capital = provinces.firstOrNull { it.id == faction.capitalId && it.ownerId == faction.id }
    if (weights.build >= 1.0 && faction.treasury >= 50) {
        val border = myProvinces.filter { mp ->
            mp.neighbors.any { n -> val owner = byId[n]?.ownerId; owner != null && owner != faction.id }
        }
        val needsFort = border.filter { it.fortLevel < 2 }.sortedBy { it.fortLevel }
        if (needsFort.isNotEmpty()) {
            actions += AiAction(AiActionType.BUILD_FORT, targetProvinceId = needsFort[0].id, logKind = TurnLogKind.FORTIFY, priority = 4 * weights.build)
        }
    }
    if (weights.build >= 1.5 && faction.treasury >= 30) {
        val rich = myProvinces.filter { it.baseTax >= 3 && it.fortLevel >= 0 }.sortedByDescending { it.baseTax }
        if (rich.isNotEmpty()) {
            actions += AiAction(AiActionType.BUILD_MARKET, targetProvinceId = rich[0].id, logKind = TurnLogKind.BUILD_MARKET, priority = 3 * weights.build)
        }
    }
    if (capital != null && capital.fortLevel < 3 && faction.treasury >= 50) {
        actions += AiAction(AiActionType.BUILD_FORT, targetProvinceId = capital.id, logKind = TurnLogKind.FORTIFY_CAPITAL, priority = 6 * weights.defend)
    }

    // 7. Recruit when short of armies, outmatched, or simply rich.
    val shouldRecruit = myArmies.size < ceil(myProvinces.size / 5.0) ||
        (highestThreat != null && highestThreat.totalStrength > myStrength * 0.8) ||
        (faction.treasury >= 60 && faction.manpower >= 20)
    if (shouldRecruit && faction.treasury >= 30 && faction.manpower >= 10) {
        var recruitAt = capital
        if (highestThreat != null && highestThreat.borderingProvinces.isNotEmpty()) {
            myProvinces.firstOrNull { mp -> mp.neighbors.any { it in highestThreat.borderingProvinces } }
                ?.let { recruitAt = it }
        }
        if (recruitAt == null) recruitAt = myProvinces.firstOrNull()
        recruitAt?.let {
            actions += AiAction(AiActionType.RECRUIT, targetProvinceId = it.id, logKind = TurnLogKind.RECRUITED, priority = 5 * weights.recruit)
        }
    }

    if (actions.isEmpty()) actions += AiAction(AiActionType.SKIP, priority = 0.0)
    return actions.sortedByDescending { it.priority }.take(5)
}
