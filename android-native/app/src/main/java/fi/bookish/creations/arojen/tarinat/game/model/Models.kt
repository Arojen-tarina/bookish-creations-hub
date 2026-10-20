package fi.bookish.creations.arojen.tarinat.game.model

import kotlinx.serialization.Serializable

/** Board coordinates of a province token (board space is 130 x 90 starting at y = 20). */
@Serializable
data class Point(val x: Double, val y: Double)

@Serializable
data class Province(
    val id: String,
    /** Proper noun shown as-is in every language. */
    val name: String,
    val region: Region,
    val ownerId: FactionId?,
    val terrain: Terrain,
    val isCoastal: Boolean = false,
    val isCapital: Boolean = false,
    val neighbors: List<String> = emptyList(),
    val baseTax: Int,
    val baseManpower: Int,
    val supply: Int = 3,
    val tradeGood: TradeGood? = null,
    val hasSilkRoad: Boolean = false,
    val unrest: Int = 0,
    val fortLevel: Int = 0,
    /** 0..100; null on a fortified province means "never damaged" (treated as 100). */
    val fortDurability: Int? = null,
    val developmentLevel: Int = 1,
    val garrison: Int = 0,
    val siegeProgress: Int? = null,
    val center: Point,
)

@Serializable
data class Faction(
    val id: FactionId,
    val capitalId: String,
    val personality: Personality,
    val treasury: Int,
    val manpower: Int,
    val horses: Int,
    val cavalryBonus: Double,
    val taxBonus: Double,
    val siegeBonus: Double,
    val isPlayer: Boolean,
)

@Serializable
data class Army(
    val id: String,
    val ownerId: FactionId,
    val provinceId: String,
    val cavalry: Int,
    val infantry: Int,
    val siege: Int,
    /** 0..100 */
    val morale: Int,
    val supply: Int,
    val movementLeft: Int,
    val leaderBonus: Double = 0.0,
) {
    /** Each faction's founding army carries its Tribal Chief. */
    val isChief: Boolean get() = id == chiefArmyId(ownerId)

    companion object {
        fun chiefArmyId(owner: FactionId) = "army-${owner.key}-main"
    }
}

@Serializable
data class Treaty(
    val type: TreatyType,
    val startTurn: Int,
    /** -1 = permanent */
    val duration: Int,
)

@Serializable
data class DiplomaticRelation(
    val factionA: FactionId,
    val factionB: FactionId,
    /** -100..100 */
    val relation: Int,
    /** 0..100 */
    val trust: Int,
    /** 0..100 */
    val threat: Int,
    val treaties: List<Treaty> = emptyList(),
    val borderFriction: Int = 0,
    val lastProposalTurn: Int? = null,
) {
    fun involves(faction: FactionId) = factionA == faction || factionB == faction
    fun isBetween(a: FactionId, b: FactionId) = (factionA == a && factionB == b) || (factionA == b && factionB == a)
}

@Serializable
data class CardEffect(
    val type: CardEffectType,
    val value: Int,
    /** 0 = instant, -1 = permanent, N = N turns */
    val duration: Int,
)

/** Card text (name, description) lives in localized resources keyed by [id]. */
@Serializable
data class Card(
    val id: String,
    val type: CardType,
    val rarity: Rarity?,
    val effect: CardEffect,
)

@Serializable
data class ActiveCardEffect(
    val cardId: String,
    val type: CardEffectType,
    val value: Int,
    /** -1 = permanent */
    val remainingTurns: Int,
)

@Serializable
data class ResourceCollection(
    val taxIncome: Int,
    val manpowerGain: Int,
    val marketBonus: Int,
    val silkRoadBonus: Int,
    val foodChange: Int,
    val artisansGain: Int,
    val horsesGain: Int,
    val influenceGain: Int,
    val prestigeGain: Int,
)

/** Structured AI/turn log entry; the UI turns it into localized text. */
@Serializable
data class TurnLogEntry(
    val kind: TurnLogKind,
    val factionId: FactionId? = null,
    val provinceId: String? = null,
)

@Serializable
enum class TurnLogKind {
    MERGED_ARMIES,
    DEFEND_BORDER,
    CAPTURE,
    ADVANCE,
    WON_BATTLE,
    ATTACK_FAILED,
    CONQUERED,
    FORTIFY,
    FORTIFY_CAPITAL,
    BUILD_MARKET,
    RECRUITED,
    PLAYER_CHIEF_FELL,
}

@Serializable
data class UnitLosses(val cavalry: Int, val infantry: Int)

/** Everything the battle screen needs to replay a fight. */
@Serializable
data class BattleReport(
    val attacker: Army,
    val defender: Army,
    val attackerFaction: FactionId,
    val defenderFaction: FactionId,
    val provinceId: String,
    val attackerWon: Boolean,
    val attackerLosses: UnitLosses,
    val defenderLosses: UnitLosses,
    val attackerMoraleLoss: Int,
    val defenderMoraleLoss: Int,
    val attackRoll: Int,
    val defenseRoll: Int,
    val attackerPower: Double,
    val defenderPower: Double,
)

@Serializable
data class GameState(
    val turn: Int,
    val year: Int,
    val playerFactionId: FactionId,
    val difficulty: Difficulty,

    val provinces: List<Province>,
    val factions: List<Faction>,
    val relations: List<DiplomaticRelation>,
    val armies: List<Army>,

    // Cards
    val deck: List<Card>,
    val hand: List<Card>,
    val discard: List<Card>,
    val playedTechCards: List<Card> = emptyList(),
    val activeEffects: List<ActiveCardEffect> = emptyList(),
    val attackBonus: Int = 0,
    val defenseBonus: Int = 0,
    val movementBonus: Int = 0,

    /** provinceId -> buildings raised there (fortress and wonder may repeat). */
    val buildings: Map<String, List<BuildingType>> = emptyMap(),

    // Player-only resources (gold, manpower and horses live on the Faction)
    val food: Int,
    val artisans: Int,
    val influence: Int = 0,
    val prestige: Int = 0,
    val treasuryStreak: Int = 0,
    val aiTreasuryStreaks: Map<FactionId, Int> = emptyMap(),

    val turnLog: List<TurnLogEntry> = emptyList(),
    val resourcesCollected: Boolean = false,
    val lastCollection: ResourceCollection? = null,
    val chiefLost: Boolean = false,

    /** Last turn the player took the opt-in tribute (0 = never); it is offered once per turn. */
    val tributeTurn: Int = 0,
    /** True once the player has replayed a lost turn (the opt-in "second chance", once per campaign). */
    val secondChanceUsed: Boolean = false,

    val gameOver: Boolean = false,
    val winnerId: FactionId? = null,
    val winCondition: WinCondition? = null,

    /** Monotonic counter for generated army ids (keeps ids deterministic). */
    val nextId: Int = 1,
) {
    val player: Faction get() = factions.first { it.id == playerFactionId }
    fun province(id: String): Province? = provinces.firstOrNull { it.id == id }
    fun faction(id: FactionId): Faction? = factions.firstOrNull { it.id == id }
    fun relation(a: FactionId, b: FactionId): DiplomaticRelation? = relations.firstOrNull { it.isBetween(a, b) }
    fun armiesIn(provinceId: String): List<Army> = armies.filter { it.provinceId == provinceId }
    fun buildingsIn(provinceId: String): List<BuildingType> = buildings[provinceId].orEmpty()
}
