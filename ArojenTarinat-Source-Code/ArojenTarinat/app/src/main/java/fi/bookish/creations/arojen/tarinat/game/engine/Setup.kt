package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.data.CARD_CATALOG
import fi.bookish.creations.arojen.tarinat.game.data.FACTION_DATA_1206
import fi.bookish.creations.arojen.tarinat.game.data.PROVINCES_1206
import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.Card
import fi.bookish.creations.arojen.tarinat.game.model.DiplomaticRelation
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.Faction
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Point
import fi.bookish.creations.arojen.tarinat.game.model.Province
import kotlin.math.max
import kotlin.math.sqrt

/**
 * Only the active realms are simulated. If the player somehow picks another
 * faction it joins them; the remaining 1206 realms exist only as neutral land.
 */
private fun createFactions(player: FactionId): List<Faction> {
    val ids = if (player in ACTIVE_FACTIONS) ACTIVE_FACTIONS else ACTIVE_FACTIONS + player
    return ids.map { FACTION_DATA_1206.getValue(it).copy(isPlayer = it == player) }
}

private fun neutralizeInactiveFactionProvinces(provinces: List<Province>, active: List<FactionId>): List<Province> =
    provinces.map { if (it.ownerId != null && it.ownerId !in active) it.copy(ownerId = null) else it }

private fun createDiplomaticRelations(factions: List<Faction>): List<DiplomaticRelation> {
    val relations = mutableListOf<DiplomaticRelation>()
    for (i in factions.indices) {
        for (j in i + 1 until factions.size) {
            val mongolInvolved = factions[i].id == FactionId.MONGOL || factions[j].id == FactionId.MONGOL
            relations += DiplomaticRelation(
                factionA = factions[i].id,
                factionB = factions[j].id,
                relation = if (mongolInvolved) -20 else 0,
                trust = 50,
                threat = if (mongolInvolved) 60 else 30,
            )
        }
    }
    return relations
}

/** Each realm starts with its Chief's army in the capital. */
private fun createStartingArmies(factions: List<Faction>, provinces: List<Province>): List<Army> =
    factions.mapNotNull { faction ->
        val capital = provinces.firstOrNull { it.id == faction.capitalId } ?: return@mapNotNull null
        Army(
            id = Army.chiefArmyId(faction.id),
            ownerId = faction.id,
            provinceId = capital.id,
            cavalry = if (faction.id == FactionId.MONGOL) 12 else 5,
            infantry = if (faction.id == FactionId.SONG) 15 else 8,
            siege = if (faction.id == FactionId.KHWAREZM) 0 else 1,
            movementLeft = Rules.ARMY_MOVEMENT,
            leaderBonus = if (faction.id == FactionId.MONGOL) 0.3 else 0.1,
        )
    }

private fun distance(a: Point, b: Point): Double {
    val dx = a.x - b.x
    val dy = a.y - b.y
    return sqrt(dx * dx + dy * dy)
}

/**
 * Balances the starting realms to the same province count, measured against
 * their existing territory only; the rest of the map stays neutral.
 * Surplus land furthest from the capital is released, then short realms grow
 * into adjacent neutral land closest to their capital.
 */
internal fun equalizeStartingProvinceOwnership(provinces: List<Province>, factions: List<Faction>): List<Province> {
    val factionIds = factions.map { it.id }
    val counts = factionIds.associateWith { 0 }.toMutableMap()
    val updated = provinces.toMutableList()
    val indexById = updated.withIndex().associate { (i, p) -> p.id to i }
    fun byId(id: String): Province? = indexById[id]?.let { updated[it] }
    fun setOwner(id: String, owner: FactionId?) {
        val i = indexById.getValue(id)
        updated[i] = updated[i].copy(ownerId = owner)
    }
    fun capitalOf(factionId: FactionId): Province? =
        factions.firstOrNull { it.id == factionId }?.let { byId(it.capitalId) }

    updated.forEach { p -> p.ownerId?.let { owner -> if (owner in counts) counts[owner] = counts.getValue(owner) + 1 } }

    val totalOwned = counts.values.sum()
    val target = max(1, totalOwned / factionIds.size)

    fun value(p: Province) = p.baseTax + p.baseManpower + p.developmentLevel

    for (factionId in factionIds) {
        val surplus = counts.getValue(factionId) - target
        if (surplus <= 0) continue
        val capital = capitalOf(factionId) ?: continue
        val owned = updated
            .filter { it.ownerId == factionId && !it.isCapital }
            .sortedWith { a, b ->
                val aDist = distance(a.center, capital.center)
                val bDist = distance(b.center, capital.center)
                if (aDist == bDist) value(a) - value(b) else bDist.compareTo(aDist)
            }
        for (i in 0 until minOf(surplus, owned.size)) {
            setOwner(owned[i].id, null)
            counts[factionId] = counts.getValue(factionId) - 1
        }
    }

    fun neutralNeighbors(factionId: FactionId): List<Province> {
        val ownedIds = updated.filter { it.ownerId == factionId }.map { it.id }.toHashSet()
        val neighbors = updated.filter { p -> p.ownerId == null && p.neighbors.any { it in ownedIds } }
        val capital = capitalOf(factionId) ?: return neighbors
        return neighbors.sortedBy { distance(it.center, capital.center) }
    }

    val neutralPool = LinkedHashSet(updated.filter { it.ownerId == null }.map { it.id })
    var changed = true
    while (changed) {
        changed = false
        for (factionId in factionIds) {
            if (target - counts.getValue(factionId) <= 0) continue
            val chosen = neutralNeighbors(factionId).firstOrNull { it.id in neutralPool } ?: continue
            setOwner(chosen.id, factionId)
            neutralPool.remove(chosen.id)
            counts[factionId] = counts.getValue(factionId) + 1
            changed = true
        }
    }

    for (id in neutralPool.toList()) {
        val province = byId(id) ?: continue
        val closest = factions
            .map { it.id to distance(province.center, byId(it.capitalId)?.center ?: Point(0.0, 0.0)) }
            .minByOrNull { it.second }
            ?: continue
        val factionId = closest.first
        if (counts.getValue(factionId) < target) {
            setOwner(id, factionId)
            counts[factionId] = counts.getValue(factionId) + 1
            neutralPool.remove(id)
        }
    }
    return updated
}

fun createPlayableDeck(rng: GameRandom): List<Card> = rng.shuffled(CARD_CATALOG)

/** Builds a new 1206 campaign for [playerFaction] and credits the first turn's income. */
fun startGame(playerFaction: FactionId, difficulty: Difficulty, rng: GameRandom): GameState {
    val initialFactions = createFactions(playerFaction)
    val raw = neutralizeInactiveFactionProvinces(PROVINCES_1206, initialFactions.map { it.id })
    val provinces = equalizeStartingProvinceOwnership(raw, initialFactions)

    // Only realms that hold land (or the player) take part; AI funds scale with difficulty.
    val multiplier = difficulty.aiIncomeMultiplier
    val factions = initialFactions
        .filter { f -> f.id == playerFaction || provinces.any { it.ownerId == f.id } }
        .map { f ->
            if (f.id == playerFaction) {
                f
            } else {
                f.copy(treasury = (f.treasury * multiplier).roundJs(), manpower = (f.manpower * multiplier).roundJs())
            }
        }

    val deck = createPlayableDeck(rng)
    val initial = GameState(
        turn = 1,
        year = Rules.START_YEAR,
        playerFactionId = playerFaction,
        difficulty = difficulty,
        provinces = provinces,
        factions = factions,
        relations = createDiplomaticRelations(factions),
        armies = createStartingArmies(factions, provinces),
        deck = deck.drop(Rules.STARTING_HAND),
        hand = deck.take(Rules.STARTING_HAND),
        discard = emptyList(),
        food = Rules.STARTING_FOOD,
        artisans = Rules.STARTING_ARTISANS,
    )
    return applyResourceCollection(initial, playerFaction, calculateResourceCollection(initial, playerFaction))
}
