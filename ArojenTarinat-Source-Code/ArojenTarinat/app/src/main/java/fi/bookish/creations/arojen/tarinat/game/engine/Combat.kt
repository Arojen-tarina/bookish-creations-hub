package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.data.Rules
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.Province
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min

/** Current fort durability; a fortified province that was never damaged counts as full. */
val Province.fortDurabilityOrFull: Int
    get() = if (fortLevel > 0) fortDurability ?: Rules.FORT_MAX_DURABILITY else 0

val Province.isFortDamaged: Boolean
    get() = fortLevel > 0 && fortDurabilityOrFull < Rules.FORT_MAX_DURABILITY

data class DefenseBreakdown(val terrain: Double, val fortress: Double, val additional: Double) {
    val total: Double get() = terrain + fortress + additional
}

fun Province.defenseBreakdown(
    additional: Double = 0.0,
    effectiveFortLevel: Double = fortLevel.toDouble(),
): DefenseBreakdown {
    val terrainBonus = (terrain.defenseBonus * 2).toDouble()
    val durabilityRatio = fortDurabilityOrFull.toDouble() / Rules.FORT_MAX_DURABILITY
    val fortress = effectiveFortLevel * 3 * durabilityRatio
    return DefenseBreakdown(terrainBonus, fortress, additional)
}

/** Strength estimate the AI and the surrender rule use (not the battle formula). */
internal fun Army.strength(): Double = cavalry * 3 + infantry * 1.5 + siege * 2
internal fun Army.attackPower(attackBonus: Int = 0): Int = cavalry * 2 + infantry + siege + attackBonus

/** Soldiers a fortified or garrisoned province fields on its own. */
internal fun createProvinceGarrison(province: Province): Army? {
    val owner = province.ownerId ?: return null
    val fortGarrison = if (province.fortLevel > 0) {
        province.fortLevel * 3 + max(1, floor(province.developmentLevel / 2.0).toInt())
    } else {
        0
    }
    val infantry = max(province.garrison, fortGarrison)
    if (infantry <= 0) return null
    return Army(
        id = "garrison-${province.id}",
        ownerId = owner,
        provinceId = province.id,
        cavalry = 0,
        infantry = infantry,
        siege = 0,
        movementLeft = 0,
        leaderBonus = 0.0,
    )
}

internal data class CombatOutcome(
    val attackerWins: Boolean,
    val defenderDestroyed: Boolean,
    val attackerCavalryLoss: Int,
    val attackerInfantryLoss: Int,
    val defenderCavalryLoss: Int,
    val defenderInfantryLoss: Int,
    val attackRoll: Int,
    val defenseRoll: Int,
    val attackerScore: Double,
    val defenderScore: Double,
)

/** Losses soak into infantry first; every two leftover points cost one cavalry. */
private fun lossesFromDamage(army: Army, damage: Int): Pair<Int, Int> {
    var remaining = damage
    val infantryLoss = min(army.infantry, remaining)
    remaining -= infantryLoss
    val cavalryLoss = min(army.cavalry, floor(remaining / 2.0).toInt())
    return cavalryLoss to infantryLoss
}

internal fun resolveCombat(
    attacker: Army,
    defender: Army,
    battlefield: Province,
    attackBonus: Int = 0,
    defenseBonus: Int = 0,
    rng: GameRandom,
): CombatOutcome {
    val attackerPower = attacker.attackPower(attackBonus)
    val defenderPower = defender.cavalry * 2 + defender.infantry

    val attackRoll = rng.d6()
    val defenseRoll = rng.d6()

    // Siege units undermine walls, lowering the effective fortification level.
    val effectiveFortLevel = max(0.0, battlefield.fortLevel - attacker.siege * 0.5)
    val attackerScore = (attackerPower + attackRoll).toDouble()
    val breakdown = battlefield.defenseBreakdown(0.0, effectiveFortLevel)
    val defenderScore = (defenderPower + defenseRoll).toDouble() + breakdown.terrain + breakdown.fortress
    val attackerWins = attackerScore > defenderScore

    val defenderDamage = if (attackerWins) max(0, attackerPower - defenseBonus) else 0
    val attackerDamage = if (!attackerWins) defenderPower else 0
    val (defCav, defInf) = lossesFromDamage(defender, defenderDamage)
    val (attCav, attInf) = lossesFromDamage(attacker, attackerDamage)

    return CombatOutcome(
        attackerWins = attackerWins,
        defenderDestroyed = attackerWins && defCav >= defender.cavalry && defInf >= defender.infantry,
        attackerCavalryLoss = attCav,
        attackerInfantryLoss = attInf,
        defenderCavalryLoss = defCav,
        defenderInfantryLoss = defInf,
        attackRoll = attackRoll,
        defenseRoll = defenseRoll,
        attackerScore = attackerScore,
        defenderScore = defenderScore,
    )
}
