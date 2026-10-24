package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.data.VictoryTargets
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.Faction
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.game.model.TurnLogEntry
import fi.bookish.creations.arojen.tarinat.game.model.TurnLogKind
import fi.bookish.creations.arojen.tarinat.game.model.WinCondition
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

/**
 * Ends the player's turn: AI realms collect income and act, sieges resolve,
 * victory is checked, a card is drawn and the player's income is credited.
 */
fun endTurn(prev: GameState, rng: GameRandom): GameState {
    val player = prev.playerFactionId

    val effects = prev.activeEffects
        .map { if (it.remainingTurns == -1) it else it.copy(remainingTurns = it.remainingTurns - 1) }
        .filter { it.remainingTurns == -1 || it.remainingTurns > 0 }
    val totals = bonusTotals(effects)
    var base = prev.copy(activeEffects = effects, attackBonus = totals.attack, defenseBonus = totals.defense, movementBonus = totals.movement)
    val log = mutableListOf<TurnLogEntry>()
    var nextId = base.nextId

    // 1. AI income (the player's income is credited at the start of each turn).
    val multiplier = base.difficulty.aiIncomeMultiplier
    val factions = base.factions.map { f ->
        if (f.id == player) {
            f
        } else {
            val c = calculateResourceCollection(base, f.id)
            f.copy(
                treasury = f.treasury + (c.taxIncome * multiplier).roundJs(),
                manpower = f.manpower + (c.manpowerGain * multiplier).roundJs(),
            )
        }
    }.toMutableList()

    // 2. AI turns
    var armies = base.armies.toMutableList()
    val provinces = base.provinces.toMutableList()
    fun provinceIndex(id: String) = provinces.indexOfFirst { it.id == id }

    for (faction in factions.toList()) {
        if (faction.id == player) continue
        val fIdx = factions.indexOfFirst { it.id == faction.id }
        for (action in calculateAiActions(faction, armies, provinces, base.relations)) {
            when (action.type) {
                AiActionType.MERGE -> {
                    val sourceIdx = armies.indexOfFirst { it.id == action.armyId }
                    val targetIdx = armies.indexOfFirst { it.id == action.mergeIntoId }
                    if (sourceIdx == -1 || targetIdx == -1) continue
                    val source = armies[sourceIdx]
                    val target = armies[targetIdx]
                    armies[targetIdx] = target.copy(
                        cavalry = target.cavalry + source.cavalry,
                        infantry = target.infantry + source.infantry,
                    )
                    armies = armies.filterTo(mutableListOf()) { it.id != action.armyId }
                    log += TurnLogEntry(TurnLogKind.MERGED_ARMIES, faction.id)
                }
                AiActionType.MOVE -> {
                    val armyIdx = armies.indexOfFirst { it.id == action.armyId }
                    val targetId = action.targetProvinceId ?: continue
                    if (armyIdx == -1) continue
                    val pIdx = provinceIndex(targetId)
                    if (pIdx == -1) continue
                    armies[armyIdx] = armies[armyIdx].copy(provinceId = targetId, movementLeft = 0)
                    if (provinces[pIdx].ownerId == null) provinces[pIdx] = provinces[pIdx].copy(ownerId = faction.id)
                    log += TurnLogEntry(action.logKind ?: TurnLogKind.ADVANCE, faction.id, targetId)
                }
                AiActionType.ATTACK -> {
                    val armyIdx = armies.indexOfFirst { it.id == action.armyId }
                    val targetId = action.targetProvinceId ?: continue
                    if (armyIdx == -1) continue
                    val pIdx = provinceIndex(targetId)
                    if (pIdx == -1) continue
                    val army = armies[armyIdx]
                    val target = provinces[pIdx]
                    log += resolveAiAttack(faction.id, army, armyIdx, target, pIdx, armies, provinces, rng).let { (newArmies, entry) ->
                        armies = newArmies
                        entry
                    }
                }
                AiActionType.BUILD_FORT -> {
                    val targetId = action.targetProvinceId ?: continue
                    if (factions[fIdx].treasury < 50) continue
                    factions[fIdx] = factions[fIdx].copy(treasury = factions[fIdx].treasury - 50)
                    val pIdx = provinceIndex(targetId)
                    if (pIdx != -1) provinces[pIdx] = provinces[pIdx].copy(fortLevel = min(Rules.FORT_MAX_LEVEL, provinces[pIdx].fortLevel + 1))
                    log += TurnLogEntry(action.logKind ?: TurnLogKind.FORTIFY, faction.id, targetId)
                }
                AiActionType.BUILD_MARKET -> {
                    val targetId = action.targetProvinceId ?: continue
                    if (factions[fIdx].treasury < 25) continue
                    // Matches the original: the AI pays for the market (no building is recorded yet).
                    factions[fIdx] = factions[fIdx].copy(treasury = factions[fIdx].treasury - 25)
                    log += TurnLogEntry(TurnLogKind.BUILD_MARKET, faction.id, targetId)
                }
                AiActionType.RECRUIT -> {
                    val targetId = action.targetProvinceId ?: continue
                    val f = factions[fIdx]
                    if (f.treasury < 30 || f.manpower < 10) continue
                    val cavalry = min(4, floor(f.horses / 2.0).toInt())
                    factions[fIdx] = f.copy(treasury = f.treasury - 30, manpower = f.manpower - 10, horses = f.horses - cavalry * 2)
                    armies += Army(
                        id = "army-${nextId++}",
                        ownerId = faction.id,
                        provinceId = targetId,
                        cavalry = cavalry,
                        infantry = 6,
                        movementLeft = 0,
                        leaderBonus = 0.0,
                    )
                    log += TurnLogEntry(TurnLogKind.RECRUITED, faction.id, targetId)
                }
                AiActionType.SKIP -> Unit
            }
        }
    }
    armies = armies.filterTo(mutableListOf()) { it.cavalry + it.infantry > 0 }

    // 3. Reset army movement for the new turn.
    armies = armies
        .filter { it.cavalry + it.infantry > 0 }
        .mapTo(mutableListOf()) { it.copy(movementLeft = Rules.ARMY_MOVEMENT) }

    // 4. The player's Chief falling costs gold and influence once.
    val chiefLocations = armies.filter { it.isChief }.associate { it.ownerId to it.provinceId }
    var chiefFell = false
    if (player !in chiefLocations && !prev.chiefLost && prev.armies.any { it.id == Army.chiefArmyId(player) }) {
        chiefFell = true
        val i = factions.indexOfFirst { it.id == player }
        factions[i] = factions[i].copy(treasury = max(0, factions[i].treasury - 30))
        base = base.copy(influence = max(0, base.influence - 15))
        log += TurnLogEntry(TurnLogKind.PLAYER_CHIEF_FELL, player)
    }

    // 5. Sieges: a province ringed entirely by foreign land loses walls, then gold.
    val byId = provinces.associateBy { it.id }
    val siegePenalty = LinkedHashMap<FactionId, Int>()
    for (i in provinces.indices) {
        val p = provinces[i]
        val owner = p.ownerId ?: continue
        if (p.neighbors.isEmpty()) continue
        val surrounded = p.neighbors.all { n -> byId[n]?.ownerId.let { it != null && it != owner } }
        provinces[i] = if (!surrounded) {
            p.copy(siegeProgress = 0)
        } else if (p.fortLevel > 0) {
            if (p.fortDurabilityOrFull > 0) {
                p.copy(siegeProgress = (p.siegeProgress ?: 0) + 1, fortDurability = 0)
            } else {
                val level = max(0, p.fortLevel - 1)
                p.copy(
                    siegeProgress = (p.siegeProgress ?: 0) + 1,
                    fortLevel = level,
                    fortDurability = if (level > 0) Rules.FORT_MAX_DURABILITY else 0,
                )
            }
        } else {
            siegePenalty[owner] = (siegePenalty[owner] ?: 0) + 5
            p.copy(siegeProgress = (p.siegeProgress ?: 0) + 1)
        }
    }
    for (i in factions.indices) {
        val penalty = siegePenalty[factions[i].id] ?: 0
        if (penalty > 0) factions[i] = factions[i].copy(treasury = max(0, factions[i].treasury - penalty))
    }

    // 6. Victory and defeat
    val outcome = checkVictory(base, player, factions.toList(), provinces, armies)

    // 7. Draw a card, reshuffling the discard pile when the deck runs out.
    var deck = base.deck
    var discard = base.discard
    if (deck.isEmpty() && discard.isNotEmpty()) {
        deck = rng.shuffled(discard)
        discard = emptyList()
    }

    val turnStart = activatePendingWars(
        base.copy(
            turn = base.turn + 1,
            year = base.year + 1,
            factions = factions,
            armies = armies,
            provinces = provinces,
            food = max(0, base.food),
            deck = deck.drop(1),
            discard = discard,
            hand = base.hand + deck.take(1),
            gameOver = outcome.gameOver,
            winnerId = outcome.winnerId,
            winCondition = outcome.winCondition,
            chiefLost = prev.chiefLost || chiefFell,
            treasuryStreak = outcome.treasuryStreak,
            aiTreasuryStreaks = outcome.aiTreasuryStreaks,
            turnLog = log,
            resourcesCollected = false,
            lastCollection = null,
            attackBonus = 0,
            defenseBonus = 0,
            movementBonus = 0,
            nextId = nextId,
        ),
    )
    return applyResourceCollection(turnStart, player, calculateResourceCollection(turnStart, player))
}

/** AI assault on [target]: no card bonuses, and a win always takes the province. */
private fun resolveAiAttack(
    attackerId: FactionId,
    army: Army,
    armyIdx: Int,
    target: Province,
    pIdx: Int,
    armiesIn: MutableList<Army>,
    provinces: MutableList<Province>,
    rng: GameRandom,
): Pair<MutableList<Army>, TurnLogEntry> {
    var armies = armiesIn
    val defenders = armies.filter { it.provinceId == target.id && it.ownerId != attackerId }
    val garrison = if (target.ownerId != null && target.ownerId != attackerId) createProvinceGarrison(target) else null
    val fieldDefender = defenders.firstOrNull()
    val defender = when {
        fieldDefender != null && garrison != null -> fieldDefender.copy(
            infantry = fieldDefender.infantry + garrison.infantry,
        )
        else -> fieldDefender ?: garrison
    }

    if (defender == null) {
        armies[armyIdx] = army.copy(provinceId = target.id, movementLeft = 0)
        provinces[pIdx] = provinces[pIdx].copy(ownerId = attackerId)
        return armies to TurnLogEntry(TurnLogKind.CONQUERED, attackerId, target.id)
    }

    val r = resolveCombat(army, defender, target, rng = rng)
    if (!r.attackerWins) {
        armies[armyIdx] = army.copy(
            movementLeft = 0,
            cavalry = max(0, army.cavalry - r.attackerCavalryLoss),
            infantry = max(0, army.infantry - r.attackerInfantryLoss),
        )
        return armies to TurnLogEntry(TurnLogKind.ATTACK_FAILED, attackerId, target.id)
    }

    armies[armyIdx] = army.copy(
        provinceId = target.id,
        movementLeft = 0,
        cavalry = max(0, army.cavalry - r.attackerCavalryLoss),
        infantry = max(0, army.infantry - r.attackerInfantryLoss),
    )
    if (fieldDefender != null) {
        if (r.defenderDestroyed) {
            armies = armies.filterTo(mutableListOf()) { it.id != fieldDefender.id }
        } else {
            val dIdx = armies.indexOfFirst { it.id == fieldDefender.id }
            armies[dIdx] = fieldDefender.copy(
                cavalry = max(0, fieldDefender.cavalry - r.defenderCavalryLoss),
                infantry = max(0, fieldDefender.infantry - r.defenderInfantryLoss),
            )
        }
    }
    provinces[pIdx] = provinces[pIdx].copy(ownerId = attackerId)
    return armies to TurnLogEntry(TurnLogKind.WON_BATTLE, attackerId, target.id)
}

private data class VictoryOutcome(
    val gameOver: Boolean,
    val winnerId: FactionId?,
    val winCondition: WinCondition?,
    val treasuryStreak: Int,
    val aiTreasuryStreaks: Map<FactionId, Int>,
)

private fun checkVictory(
    base: GameState,
    player: FactionId,
    factions: List<Faction>,
    provinces: List<Province>,
    armies: List<Army>,
): VictoryOutcome {
    val playerProvinces = provinces.count { it.ownerId == player }
    val playerArmies = armies.count { it.ownerId == player }
    val playerGold = factions.first { it.id == player }.treasury
    var gameOver = false
    var winnerId: FactionId? = null
    var winCondition: WinCondition? = null
    fun win(who: FactionId?, how: WinCondition?) {
        gameOver = true
        winnerId = who
        winCondition = how
    }
    fun capitalsOf(rivalsOf: FactionId) = factions.filter { it.id != rivalsOf }.mapNotNull { f -> provinces.firstOrNull { it.id == f.capitalId } }

    // Military: every rival capital, or enough provinces.
    val enemyCapitals = capitalsOf(player)
    val allCapitals = enemyCapitals.isNotEmpty() && enemyCapitals.all { it.ownerId == player }
    if ((allCapitals && playerProvinces > 0) || playerProvinces >= VictoryTargets.PROVINCES) win(player, WinCondition.MILITARY)

    // Economic: gold, a Silk Road majority, held for several turns.
    val silkHubs = provinces.filter { it.hasSilkRoad }
    val silkMajority = silkHubs.isNotEmpty() && silkHubs.count { it.ownerId == player } * 2 > silkHubs.size
    val treasuryStreak = if (playerGold >= VictoryTargets.GOLD) base.treasuryStreak + 1 else 0
    if (!gameOver && playerGold >= VictoryTargets.GOLD && silkMajority && treasuryStreak >= VictoryTargets.TREASURY_STREAK) {
        win(player, WinCondition.ECONOMIC)
    }

    // Technology: enough permanent tech cards played.
    if (!gameOver && base.playedTechCards.size >= VictoryTargets.TECH) win(player, WinCondition.TECHNOLOGY)

    // Diplomatic: influence target, or allied with every surviving rival.
    if (!gameOver) {
        val survivors = factions.filter { f -> f.id != player && provinces.any { it.ownerId == f.id } }
        val alliedWithAll = survivors.size >= VictoryTargets.DIPLOMATIC_MIN_ALLIES && survivors.all { rival ->
            base.relations.any { rel -> rel.isBetween(player, rival.id) && rel.treaties.any { it.type == TreatyType.ALLIANCE } }
        }
        if (base.influence >= VictoryTargets.INFLUENCE || alliedWithAll) win(player, WinCondition.DIPLOMATIC)
    }

    // Cultural: prestige from wonders.
    if (!gameOver && base.prestige >= VictoryTargets.PRESTIGE) win(player, WinCondition.CULTURAL)

    // Defeat: no land and no armies left.
    if (!gameOver && playerArmies == 0 && playerProvinces == 0) win(null, null)

    // AI realms win by the same military and economic rules.
    val aiStreaks = factions.filter { it.id != player }.associate { f ->
        f.id to if (f.treasury >= VictoryTargets.GOLD) (base.aiTreasuryStreaks[f.id] ?: 0) + 1 else 0
    }
    for (f in factions) {
        if (gameOver) break
        if (f.id == player) continue
        val owned = provinces.count { it.ownerId == f.id }
        val capitals = capitalsOf(f.id)
        val tookAllCapitals = capitals.isNotEmpty() && capitals.all { it.ownerId == f.id }
        if ((tookAllCapitals && owned > 0) || owned >= VictoryTargets.PROVINCES) {
            win(f.id, WinCondition.MILITARY)
        } else if (f.treasury >= VictoryTargets.GOLD && silkHubs.isNotEmpty() &&
            silkHubs.count { it.ownerId == f.id } * 2 > silkHubs.size &&
            (aiStreaks[f.id] ?: 0) >= VictoryTargets.TREASURY_STREAK
        ) {
            win(f.id, WinCondition.ECONOMIC)
        }
    }
    return VictoryOutcome(gameOver, winnerId, winCondition, treasuryStreak, aiStreaks)
}
