package fi.bookish.creations.arojen.tarinat.game.challenge

import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.DayOfWeek
import java.time.LocalDate

@Serializable
enum class ChallengeGoal {
    /** Hold at least [DailyChallenge.target] provinces. */
    @SerialName("provinces") PROVINCES,

    /** Have at least [DailyChallenge.target] gold in the treasury at once. */
    @SerialName("treasury") TREASURY,

    /** Have at least [DailyChallenge.target] buildings standing in the realm. */
    @SerialName("buildings") BUILDINGS,
}

enum class ChallengeStatus { IN_PROGRESS, COMPLETED, FAILED }

/**
 * The day's challenge, carried by its campaign (and saved with it). Everyone
 * gets the same realm, map and goal on the same date. Reaching the goal by the
 * end of [turnLimit] completes it; [completedTurn] keeps it completed even if
 * the realm later shrinks.
 */
@Serializable
data class DailyChallenge(
    /** yyyy-MM-dd */
    val date: String,
    val goal: ChallengeGoal,
    val target: Int,
    val turnLimit: Int,
    val completedTurn: Int? = null,
) {
    fun progress(state: GameState): Int {
        val player = state.playerFactionId
        return when (goal) {
            ChallengeGoal.PROVINCES -> state.provinces.count { it.ownerId == player }
            ChallengeGoal.TREASURY -> state.player.treasury
            ChallengeGoal.BUILDINGS -> state.buildings.entries.filter { state.province(it.key)?.ownerId == player }.sumOf { it.value.size }
        }
    }

    fun status(state: GameState): ChallengeStatus = when {
        completedTurn != null -> ChallengeStatus.COMPLETED
        state.turn > turnLimit -> ChallengeStatus.FAILED
        else -> ChallengeStatus.IN_PROGRESS
    }

    /** True when this state reaches the goal for the first time, within the limit. */
    fun reachedIn(state: GameState): Boolean = completedTurn == null && state.turn <= turnLimit && progress(state) >= target
}

/** How a day's campaign starts: realm, difficulty and map seed, plus its goal. */
data class DailySetup(val faction: FactionId, val difficulty: Difficulty, val seed: Int, val challenge: DailyChallenge)

object DailyChallenges {
    /**
     * Targets a scripted test player (capital-only building, one infantry per turn)
     * comes close to on Normal; a real player reaches them with some planning.
     * See DailyChallengeTest.
     */
    private val GOALS = mapOf(
        ChallengeGoal.PROVINCES to (22 to 12),
        ChallengeGoal.TREASURY to (800 to 15),
        ChallengeGoal.BUILDINGS to (10 to 12),
    )

    fun forDate(date: LocalDate): DailySetup {
        val seed = mix(date.toEpochDay())
        val faction = ACTIVE_FACTIONS[Math.floorMod(seed, ACTIVE_FACTIONS.size)]
        val goal = ChallengeGoal.entries[Math.floorMod(seed ushr 8, ChallengeGoal.entries.size)]
        // Weekends are harder.
        val difficulty = if (date.dayOfWeek == DayOfWeek.SATURDAY || date.dayOfWeek == DayOfWeek.SUNDAY) Difficulty.HARD else Difficulty.NORMAL
        val (target, turns) = GOALS.getValue(goal)
        return DailySetup(faction, difficulty, seed, DailyChallenge(date.toString(), goal, target, turns))
    }

    /** A well-spread positive seed from the day number (same on every phone). */
    private fun mix(day: Long): Int {
        var x = day * -0x61c8864680b583ebL
        x = (x xor (x ushr 31)) * -0x40a7b892e31b1a47L
        x = x xor (x ushr 29)
        return (x and 0x7fffffffL).toInt()
    }
}
