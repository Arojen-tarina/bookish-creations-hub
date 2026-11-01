package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.data.VictoryTargets
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.Card
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

/** Card effects lose a turn; expired ones go, and the running bonus totals follow. */
private fun decayEffects(state: GameState): GameState {
    val effects = state.activeEffects
        .map { if (it.remainingTurns == -1) it else it.copy(remainingTurns = it.remainingTurns - 1) }
        .filter { it.remainingTurns == -1 || it.remainingTurns > 0 }
    val totals = bonusTotals(effects)
    return state.copy(activeEffects = effects, attackBonus = totals.attack, defenseBonus = totals.defense, movementBonus = totals.movement)
}

/**
 * Ends the player's turn: AI realms collect income and act, supply and siege
 * attrition apply, the Tribal Chief rallies nearby troops, victory is checked,
 * a card is drawn and the player's income for the new turn is credited.
 *
 * In multiplayer [otherHumans] are the other players' realms: no AI moves or
 * AI income for them; [seatRoundStart] does their own start of turn afterwards.
 */
fun endTurn(prev: GameState, rng: GameRandom, otherHumans: Set<FactionId> = emptySet()): GameState {
    val player = prev.playerFactionId
    val humans = otherHumans + player

    var base = decayEffects(prev)
    val log = mutableListOf<TurnLogEntry>()
    var nextId = base.nextId

    // 1. AI income (the player's income is credited at the start of each turn).
    val multiplier = base.difficulty.aiIncomeMultiplier
    val factions = base.factions.map { f ->
        if (f.id in humans) {
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
        if (faction.id in humans) continue
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
                        siege = target.siege + source.siege,
                        morale = ((target.morale + source.morale) / 2.0).roundJs(),
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
                        siege = 0,
                        morale = 70,
                        supply = 20,
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

    // 3. Supply: oversized stacks lose morale and men; friendly land restores them.
    armies = armies.mapTo(mutableListOf()) { army ->
        val province = provinces.firstOrNull { it.id == army.provinceId } ?: return@mapTo army
        val armySize = army.cavalry + army.infantry + army.siege
        val supplyLimit = province.supply + province.terrain.supplyLimit
        when {
            armySize > supplyLimit -> {
                val over = armySize - supplyLimit
                val moraleLoss = min(15, over * 3)
                val attritionChance = min(0.5, over * 0.08)
                val cavLoss = if (rng.nextDouble() < attritionChance) max(1, floor(army.cavalry * 0.1).toInt()) else 0
                val infLoss = if (rng.nextDouble() < attritionChance) max(1, floor(army.infantry * 0.1).toInt()) else 0
                army.copy(
                    morale = max(10, army.morale - moraleLoss),
                    cavalry = max(0, army.cavalry - cavLoss),
                    infantry = max(0, army.infantry - infLoss),
                    supply = max(0, army.supply - over),
                )
            }
            province.ownerId == army.ownerId -> army.copy(
                morale = min(100, army.morale + 5),
                supply = min(30, army.supply + supplyLimit),
            )
            else -> army.copy(supply = max(0, army.supply - 2))
        }
    }
    armies = armies
        .filter { it.cavalry + it.infantry > 0 }
        .mapTo(mutableListOf()) { it.copy(movementLeft = Rules.ARMY_MOVEMENT) }

    // 4. Tribal Chief: troops sharing or bordering the Chief's province rally.
    val chiefLocations = armies.filter { it.isChief }.associate { it.ownerId to it.provinceId }
    armies = armies.mapTo(mutableListOf()) { a ->
        val chiefProvince = chiefLocations[a.ownerId]
        when {
            a.isChief || chiefProvince == null -> a
            chiefProvince == a.provinceId -> a.copy(morale = min(100, a.morale + 5))
            provinces.firstOrNull { it.id == chiefProvince }?.neighbors?.contains(a.provinceId) == true ->
                a.copy(morale = min(100, a.morale + 1))
            else -> a
        }
    }
    // The player's Chief falling costs gold, influence and morale once.
    var chiefFell = false
    if (player !in chiefLocations && !prev.chiefLost && prev.armies.any { it.id == Army.chiefArmyId(player) }) {
        chiefFell = true
        val i = factions.indexOfFirst { it.id == player }
        factions[i] = factions[i].copy(treasury = max(0, factions[i].treasury - CHIEF_FALL_GOLD))
        armies = armies.mapTo(mutableListOf()) { if (it.ownerId == player) it.copy(morale = max(10, it.morale - 10)) else it }
        base = base.copy(influence = max(0, base.influence - CHIEF_FALL_INFLUENCE))
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
    val outcome = checkVictory(base, player, factions.toList(), provinces, armies, otherHumans)

    // 7. Draw a card, reshuffling the discard pile when the deck runs out.
    val (deck, discard) = deckForDraw(base, rng)

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

private const val CHIEF_FALL_GOLD = 30
private const val CHIEF_FALL_INFLUENCE = 15

/** The deck to draw from: the shuffled discard pile once the deck is empty. */
private fun deckForDraw(state: GameState, rng: GameRandom): Pair<List<Card>, List<Card>> =
    if (state.deck.isEmpty() && state.discard.isNotEmpty()) rng.shuffled(state.discard) to emptyList() else state.deck to state.discard

/**
 * Multiplayer: what [endTurn] does for its own player at the round's end, for
 * another player's seat. [view] is the advanced world (turn already counted,
 * AI moved) with that seat's cards and resources loaded; [armiesBeforeAi] are
 * the armies as the round's last seat ended (a Chief lost to the AI then costs).
 */
fun seatRoundStart(view: GameState, armiesBeforeAi: List<Army>, rng: GameRandom, otherHumans: Set<FactionId>): GameState {
    val player = view.playerFactionId
    var state = decayEffects(view)
    var log = state.turnLog

    var chiefFell = false
    if (state.armies.none { it.id == Army.chiefArmyId(player) } && !state.chiefLost && armiesBeforeAi.any { it.id == Army.chiefArmyId(player) }) {
        chiefFell = true
        state = state.copy(
            factions = state.factions.map { if (it.id == player) it.copy(treasury = max(0, it.treasury - CHIEF_FALL_GOLD)) else it },
            armies = state.armies.map { if (it.ownerId == player) it.copy(morale = max(10, it.morale - 10)) else it },
            influence = max(0, state.influence - CHIEF_FALL_INFLUENCE),
        )
        log = log + TurnLogEntry(TurnLogKind.PLAYER_CHIEF_FELL, player)
    }

    val outcome = checkVictory(state, player, state.factions, state.provinces, state.armies, otherHumans)
    val (deck, discard) = deckForDraw(state, rng)
    val turnStart = state.copy(
        food = max(0, state.food),
        deck = deck.drop(1),
        discard = discard,
        hand = state.hand + deck.take(1),
        gameOver = outcome.gameOver,
        winnerId = outcome.winnerId,
        winCondition = outcome.winCondition,
        chiefLost = state.chiefLost || chiefFell,
        treasuryStreak = outcome.treasuryStreak,
        turnLog = log,
        resourcesCollected = false,
        lastCollection = null,
        attackBonus = 0,
        defenseBonus = 0,
        movementBonus = 0,
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
            morale = max(fieldDefender.morale, garrison.morale),
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
    otherHumans: Set<FactionId>,
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

    // AI realms win by the same military and economic rules (other players are judged on their own seat).
    val aiStreaks = factions.filter { it.id != player && it.id !in otherHumans }.associate { f ->
        f.id to if (f.treasury >= VictoryTargets.GOLD) (base.aiTreasuryStreaks[f.id] ?: 0) + 1 else 0
    }
    for (f in factions) {
        if (gameOver) break
        if (f.id == player || f.id in otherHumans) continue
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
