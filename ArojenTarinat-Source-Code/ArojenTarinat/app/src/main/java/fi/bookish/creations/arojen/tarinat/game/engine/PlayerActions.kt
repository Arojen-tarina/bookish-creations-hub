package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.model.ActiveCardEffect
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.BattleReport
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.CardEffectType
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.model.UnitLosses
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

internal data class EffectTotals(val attack: Int, val defense: Int, val movement: Int)

internal fun bonusTotals(effects: List<ActiveCardEffect>) = EffectTotals(
    attack = effects.filter { it.type == CardEffectType.ATTACK_BONUS }.sumOf { it.value },
    defense = effects.filter { it.type == CardEffectType.DEFENSE_BONUS }.sumOf { it.value },
    movement = effects.filter { it.type == CardEffectType.MOVEMENT_BONUS }.sumOf { it.value },
)

/** Movement points an army spends to enter [terrainOf]; siege trains are slowest, cavalry-heavy stacks fastest. */
private fun Army.moveCostInto(target: Province): Int = when {
    siege > 0 -> target.terrain.movementCostSiege
    cavalry >= infantry -> target.terrain.movementCostCavalry
    else -> target.terrain.movementCostInfantry
}

private fun GameState.effectiveMoveCost(army: Army, target: Province): Int =
    max(1, army.moveCostInto(target) - if (movementBonus > 0) 1 else 0)

// ============= MOVEMENT & COMBAT =============

fun canMoveTo(state: GameState, armyId: String, targetProvinceId: String): Boolean {
    val army = state.armies.firstOrNull { it.id == armyId } ?: return false
    if (army.movementLeft <= 0) return false
    val current = state.province(army.provinceId) ?: return false
    val target = state.province(targetProvinceId) ?: return false
    if (targetProvinceId !in current.neighbors) return false
    val owner = target.ownerId
    if (owner != null && owner != army.ownerId) {
        val relation = state.relation(army.ownerId, owner)
        if (relation != null) {
            val warActive = relation.treaties.any { it.isActiveWar(state.turn) }
            val peace = relation.treaties.any { it.type.isPeaceful }
            if (peace && !warActive) return false
        }
    }
    return army.movementLeft >= state.effectiveMoveCost(army, target)
}

/** Result of a player move: the new state plus what the UI should present. */
data class MoveResult(
    val state: GameState,
    val battle: BattleReport? = null,
    /** Set when a lone garrison surrendered to overwhelming force. */
    val surrenderedProvinceId: String? = null,
)

fun moveArmy(state: GameState, armyId: String, targetProvinceId: String, rng: GameRandom): MoveResult {
    if (!canMoveTo(state, armyId, targetProvinceId)) return MoveResult(state)
    val armyIndex = state.armies.indexOfFirst { it.id == armyId }
    val army = state.armies[armyIndex]
    val target = state.province(targetProvinceId) ?: return MoveResult(state)
    val moveCost = state.effectiveMoveCost(army, target)

    // Defenders: the first enemy field army, reinforced by the province garrison.
    val enemyArmy = state.armies.firstOrNull { it.provinceId == targetProvinceId && it.ownerId != army.ownerId }
    val garrison = if (target.ownerId != null && target.ownerId != army.ownerId) createProvinceGarrison(target) else null
    val defender: Army? = when {
        enemyArmy != null && garrison != null -> enemyArmy.copy(
            infantry = enemyArmy.infantry + garrison.infantry,
        )
        else -> enemyArmy ?: garrison
    }

    val armies = state.armies.toMutableList()
    val provinces = state.provinces.toMutableList()
    val targetIndex = provinces.indexOfFirst { it.id == targetProvinceId }

    // Negotiated surrender: a lone garrison facing overwhelming odds gives up without a fight.
    if (defender != null && enemyArmy == null && garrison != null) {
        val attackerStrength = army.strength() * (1 + army.leaderBonus)
        val defenderStrength = defender.infantry * 2 + defender.cavalry * 2 + target.fortLevel * 3
        if (attackerStrength > defenderStrength * 3) {
            provinces[targetIndex] = provinces[targetIndex].copy(
                ownerId = army.ownerId,
                unrest = max(0, provinces[targetIndex].unrest - 10),
            )
            armies[armyIndex] = army.copy(
                provinceId = targetProvinceId,
                movementLeft = max(0, army.movementLeft - moveCost),
            )
            return MoveResult(state.copy(armies = armies, provinces = provinces), surrenderedProvinceId = targetProvinceId)
        }
    }

    var battle: BattleReport? = null
    if (defender != null) {
        val r = resolveCombat(army, defender, target, state.attackBonus, state.defenseBonus, rng)
        battle = BattleReport(
            attacker = army,
            defender = defender,
            attackerFaction = army.ownerId,
            defenderFaction = defender.ownerId,
            provinceId = targetProvinceId,
            attackerWon = r.attackerWins,
            attackerLosses = UnitLosses(r.attackerCavalryLoss, r.attackerInfantryLoss),
            defenderLosses = UnitLosses(r.defenderCavalryLoss, r.defenderInfantryLoss),
            attackRoll = r.attackRoll,
            defenseRoll = r.defenseRoll,
            attackerPower = r.attackerScore,
            defenderPower = r.defenderScore,
        )
        val battered = army.copy(
            movementLeft = 0,
            cavalry = max(0, army.cavalry - r.attackerCavalryLoss),
            infantry = max(0, army.infantry - r.attackerInfantryLoss),
        )
        fun damagedDefender(def: Army) = def.copy(
            cavalry = max(0, def.cavalry - r.defenderCavalryLoss),
            infantry = max(0, def.infantry - r.defenderInfantryLoss),
        )

        if (!r.attackerWins) {
            armies[armyIndex] = battered
        } else if (target.fortLevel > 0) {
            // Walls absorb the assault: durability first, then a fort level. No capture yet.
            val walls = provinces[targetIndex]
            provinces[targetIndex] = if (walls.fortDurabilityOrFull <= 0) {
                walls.copy(
                    fortLevel = max(0, target.fortLevel - 1),
                    fortDurability = if (target.fortLevel > 1) Rules.FORT_MAX_DURABILITY else 0,
                )
            } else {
                walls.copy(fortDurability = 0)
            }
            armies[armyIndex] = battered
            if (enemyArmy != null) {
                val i = armies.indexOfFirst { it.id == enemyArmy.id }
                if (i != -1) armies[i] = damagedDefender(enemyArmy)
            }
        } else {
            // Open ground: the attacker takes the province.
            armies[armyIndex] = battered.copy(provinceId = targetProvinceId)
            if (enemyArmy != null) {
                if (r.defenderDestroyed) {
                    armies.removeAll { it.id == enemyArmy.id }
                } else {
                    val i = armies.indexOfFirst { it.id == enemyArmy.id }
                    armies[i] = damagedDefender(enemyArmy)
                }
            }
            provinces[targetIndex] = provinces[targetIndex].copy(
                ownerId = army.ownerId,
                unrest = 30,
                garrison = if (garrison != null) max(0, defender.infantry - r.defenderInfantryLoss) else provinces[targetIndex].garrison,
            )
        }
    } else {
        // Peaceful movement; empty or undefended land changes hands.
        armies[armyIndex] = army.copy(provinceId = targetProvinceId, movementLeft = army.movementLeft - moveCost)
        val owner = target.ownerId
        if (owner == null || (owner != army.ownerId && state.armies.none { it.provinceId == targetProvinceId && it.ownerId == owner })) {
            provinces[targetIndex] = provinces[targetIndex].copy(ownerId = army.ownerId)
        }
    }

    val survivors = armies.filter { it.cavalry + it.infantry > 0 }
    return MoveResult(state.copy(armies = survivors, provinces = provinces, attackBonus = 0), battle)
}

/** Combines two of the player's armies standing in the same province. */
fun mergeArmies(state: GameState, armyId: String, mergeIntoId: String): GameState {
    if (armyId == mergeIntoId) return state
    val source = state.armies.firstOrNull { it.id == armyId } ?: return state
    val target = state.armies.firstOrNull { it.id == mergeIntoId } ?: return state
    val player = state.playerFactionId
    if (source.ownerId != player || target.ownerId != player) return state
    if (source.provinceId != target.provinceId) return state

    val merged = target.copy(
        cavalry = target.cavalry + source.cavalry,
        infantry = target.infantry + source.infantry,
        siege = target.siege + source.siege,
        // Merging spends the turn's movement for the combined stack.
        movementLeft = min(target.movementLeft, source.movementLeft),
    )
    return state.copy(armies = state.armies.map { if (it.id == mergeIntoId) merged else it }.filter { it.id != armyId })
}

// ============= CONSTRUCTION & RECRUITMENT =============

enum class RepairBlock { NOT_OWNED, NOT_DAMAGED, NO_GOLD, NO_ARTISANS }

fun repairFortBlocker(state: GameState, provinceId: String, useArtisan: Boolean): RepairBlock? {
    val province = state.province(provinceId)
    if (province == null || province.ownerId != state.playerFactionId) return RepairBlock.NOT_OWNED
    if (!province.isFortDamaged) return RepairBlock.NOT_DAMAGED
    if (useArtisan && state.artisans < Rules.REPAIR_FORT_ARTISANS) return RepairBlock.NO_ARTISANS
    if (!useArtisan && state.player.treasury < Rules.REPAIR_FORT_GOLD) return RepairBlock.NO_GOLD
    return null
}

fun repairFort(state: GameState, provinceId: String, useArtisan: Boolean): GameState {
    if (repairFortBlocker(state, provinceId, useArtisan) != null) return state
    val player = state.playerFactionId
    return state.copy(
        factions = if (useArtisan) state.factions else state.factions.map {
            if (it.id == player) it.copy(treasury = it.treasury - Rules.REPAIR_FORT_GOLD) else it
        },
        artisans = if (useArtisan) state.artisans - Rules.REPAIR_FORT_ARTISANS else state.artisans,
        provinces = state.provinces.map { if (it.id == provinceId) it.copy(fortDurability = Rules.FORT_MAX_DURABILITY) else it },
    )
}

enum class BuildBlock { NOT_OWNED, NO_GOLD, NO_ARTISANS, CAPITAL_ONLY, MAX_LEVEL, ALREADY_BUILT }

fun buildBlocker(state: GameState, provinceId: String, type: BuildingType): BuildBlock? {
    val province = state.province(provinceId)
    if (province == null || province.ownerId != state.playerFactionId) return BuildBlock.NOT_OWNED
    val faction = state.player
    if (faction.treasury < type.goldCost) return BuildBlock.NO_GOLD
    if (type.artisanCost > 0 && state.artisans < type.artisanCost) return BuildBlock.NO_ARTISANS
    // Wonders may only rise in the capital.
    if (type == BuildingType.WONDER && province.id != faction.capitalId) return BuildBlock.CAPITAL_ONLY
    val existing = state.buildingsIn(provinceId)
    return when (type) {
        BuildingType.FORTRESS -> if (province.fortLevel >= Rules.FORT_MAX_LEVEL) BuildBlock.MAX_LEVEL else null
        BuildingType.WONDER -> if (existing.count { it == BuildingType.WONDER } >= Rules.WONDER_MAX) BuildBlock.MAX_LEVEL else null
        else -> if (type in existing) BuildBlock.ALREADY_BUILT else null
    }
}

fun buildStructure(state: GameState, provinceId: String, type: BuildingType): GameState {
    if (buildBlocker(state, provinceId, type) != null) return state
    val player = state.playerFactionId
    val provinces = if (type == BuildingType.FORTRESS) {
        state.provinces.map {
            if (it.id == provinceId) {
                it.copy(
                    fortLevel = min(Rules.FORT_MAX_LEVEL, it.fortLevel + 1),
                    fortDurability = Rules.FORT_MAX_DURABILITY,
                    garrison = max(it.garrison, 2 + min(4, it.fortLevel + 1)),
                )
            } else {
                it
            }
        }
    } else {
        state.provinces
    }
    return state.copy(
        factions = state.factions.map { if (it.id == player) it.copy(treasury = it.treasury - type.goldCost) else it },
        artisans = state.artisans - type.artisanCost,
        buildings = state.buildings + (provinceId to state.buildingsIn(provinceId) + type),
        provinces = provinces,
    )
}

enum class RecruitBlock { NOT_OWNED, NO_GOLD, NO_FOOD, NO_HORSES, CAPITAL_LOST, NEEDS_CAMP, NEEDS_STABLE }

fun recruitBlocker(state: GameState, provinceId: String, type: RecruitType): RecruitBlock? {
    val province = state.province(provinceId)
    if (province == null || province.ownerId != state.playerFactionId) return RecruitBlock.NOT_OWNED
    val faction = state.player
    when (type) {
        RecruitType.INFANTRY -> {
            if (faction.treasury < Rules.INFANTRY_GOLD) return RecruitBlock.NO_GOLD
            if (state.food < Rules.INFANTRY_FOOD) return RecruitBlock.NO_FOOD
        }
        RecruitType.CAVALRY -> {
            if (faction.treasury < Rules.CAVALRY_GOLD) return RecruitBlock.NO_GOLD
            if (faction.horses < Rules.CAVALRY_HORSES) return RecruitBlock.NO_HORSES
            if (state.food < Rules.CAVALRY_FOOD) return RecruitBlock.NO_FOOD
        }
    }
    // A captured capital suspends recruitment until it is recovered.
    if (state.province(faction.capitalId)?.let { it.ownerId != state.playerFactionId } == true) return RecruitBlock.CAPITAL_LOST
    // Camps raise infantry, stables raise cavalry; the capital can raise either.
    val buildings = state.buildingsIn(provinceId)
    val isCapital = province.id == faction.capitalId
    return when (type) {
        RecruitType.CAVALRY -> if (BuildingType.STABLE !in buildings && !isCapital) RecruitBlock.NEEDS_STABLE else null
        RecruitType.INFANTRY -> if (BuildingType.CAMP !in buildings && !isCapital) RecruitBlock.NEEDS_CAMP else null
    }
}

fun recruitArmy(state: GameState, provinceId: String, type: RecruitType): GameState {
    if (recruitBlocker(state, provinceId, type) != null) return state
    val player = state.playerFactionId
    val faction = state.player
    val buildings = state.buildingsIn(provinceId)
    val stableCount = if (BuildingType.STABLE in buildings) 1 else 0
    val cavalry = if (type == RecruitType.CAVALRY) {
        min(4 + stableCount, floor(faction.horses / 2.0).toInt())
    } else {
        min(2, floor(faction.horses / 2.0).toInt())
    }
    val infantry = if (type == RecruitType.CAVALRY) max(2, 6 - cavalry) else 5

    val newArmy = Army(
        id = "army-${state.nextId}",
        ownerId = player,
        provinceId = provinceId,
        cavalry = cavalry,
        infantry = infantry,
        siege = 0,
        movementLeft = 0,
        leaderBonus = 0.0,
    )
    val factions = state.factions.map {
        when {
            it.id != player -> it
            type == RecruitType.INFANTRY -> it.copy(treasury = it.treasury - Rules.INFANTRY_GOLD)
            else -> it.copy(treasury = it.treasury - Rules.CAVALRY_GOLD, horses = max(0, it.horses - Rules.CAVALRY_HORSES))
        }
    }
    val foodCost = if (type == RecruitType.INFANTRY) Rules.INFANTRY_FOOD else Rules.CAVALRY_FOOD
    return state.copy(
        factions = factions,
        food = max(0, state.food - foodCost),
        armies = state.armies + newArmy,
        nextId = state.nextId + 1,
    )
}

// ============= CARDS & RESOURCES =============

fun playCard(state: GameState, cardId: String): GameState {
    val card = state.hand.firstOrNull { it.id == cardId } ?: return state
    val player = state.playerFactionId
    var next = state.copy(hand = state.hand.filter { it.id != cardId }, discard = state.discard + card)
    val effect = card.effect
    when (effect.type) {
        CardEffectType.GOLD -> next = next.copy(factions = state.factions.map {
            if (it.id == player) it.copy(treasury = it.treasury + effect.value) else it
        })
        CardEffectType.FOOD -> next = next.copy(food = state.food + effect.value)
        CardEffectType.HORSES -> next = next.copy(factions = state.factions.map {
            if (it.id == player) it.copy(horses = it.horses + effect.value) else it
        })
        CardEffectType.ARTISANS -> next = next.copy(artisans = state.artisans + effect.value)
        CardEffectType.ATTACK_BONUS, CardEffectType.DEFENSE_BONUS, CardEffectType.MOVEMENT_BONUS -> {
            // Instant attack/defence bonuses still last for the current turn.
            val duration = if (effect.duration == 0) 1 else effect.duration
            val effects = state.activeEffects + ActiveCardEffect(card.id, effect.type, effect.value, duration)
            val totals = bonusTotals(effects)
            next = next.copy(
                activeEffects = effects,
                attackBonus = totals.attack,
                defenseBonus = totals.defense,
                movementBonus = totals.movement,
            )
            if (effect.type == CardEffectType.MOVEMENT_BONUS) {
                next = next.copy(armies = state.armies.map {
                    if (it.ownerId == player) it.copy(movementLeft = it.movementLeft + effect.value) else it
                })
            }
        }
        CardEffectType.PERMANENT_ATTACK, CardEffectType.PERMANENT_DEFENSE ->
            next = next.copy(playedTechCards = state.playedTechCards + card)
        CardEffectType.TERRAIN_IGNORE -> next = next.copy(movementBonus = state.movementBonus + 1)
        CardEffectType.DRAW_CARDS, CardEffectType.RECRUIT_FREE -> Unit
    }
    return next
}

/** Collects the player's income once per turn (endTurn already does this automatically). */
fun collectResources(state: GameState): GameState =
    if (state.resourcesCollected) state
    else applyResourceCollection(state, state.playerFactionId, calculateResourceCollection(state, state.playerFactionId))
