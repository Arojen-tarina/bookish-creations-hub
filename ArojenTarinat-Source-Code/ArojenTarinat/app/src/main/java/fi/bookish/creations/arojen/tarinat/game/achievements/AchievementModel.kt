package fi.bookish.creations.arojen.tarinat.game.achievements

import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import kotlinx.serialization.Serializable

enum class AchievementCategory {
    TUTORIAL, EARLY_GAME, MID_GAME, END_GAME, HIDDEN, SKILL, EXPLORATION,
    COLLECTION, CHALLENGE, HISTORICAL, CAMPAIGN, DAILY_WEEKLY, LIFETIME,
}

enum class AchievementDifficulty { TRIVIAL, EASY, MEDIUM, HARD, LEGENDARY }

/** Cosmetic reward granted with some achievements. */
enum class RewardKind { BADGE, TITLE, BANNER, PORTRAIT, UNIT_SKIN, DECORATION }

data class Progress(val current: Int, val target: Int)

/** Unlock rule plus, for threshold rules, the progress bar it drives. */
class AchievementCheck(val isMet: (PlayerStats) -> Boolean, val progress: ((PlayerStats) -> Progress)? = null)

fun atLeast(target: Int, stat: (PlayerStats) -> Int) = AchievementCheck(
    isMet = { stat(it) >= target },
    progress = { Progress(minOf(stat(it), target), target) },
)

/** "Lower is better" stats such as the fastest victory; null means "not yet achieved". */
fun atMost(target: Int, stat: (PlayerStats) -> Int?) = AchievementCheck(isMet = { s -> stat(s)?.let { it <= target } == true })

fun victoryWith(faction: FactionId) = AchievementCheck(isMet = { (it.victoriesByFaction[faction] ?: 0) >= 1 })

fun custom(isMet: (PlayerStats) -> Boolean) = AchievementCheck(isMet)

class AchievementDef(
    val id: String,
    val category: AchievementCategory,
    val difficulty: AchievementDifficulty,
    val points: Int,
    val hidden: Boolean = false,
    val legendary: Boolean = false,
    val reward: RewardKind? = null,
    val check: AchievementCheck,
)

/**
 * Lifetime statistics across every campaign (never reset by a new game).
 * Field names match the original game's PlayerStats.
 */
@Serializable
data class PlayerStats(
    val gamesPlayed: Int = 0,
    val gamesWon: Int = 0,
    val totalTurnsPlayed: Int = 0,
    val distinctPlayDays: Int = 0,
    val loginStreak: Int = 0,
    /** yyyy-MM-dd */
    val lastPlayedDate: String? = null,
    val battlesWon: Int = 0,
    val battlesLost: Int = 0,
    val perfectBattlesWon: Int = 0,
    val currentWinStreakBattles: Int = 0,
    val longestWinStreakBattles: Int = 0,
    val provincesCaptured: Int = 0,
    val provincesLost: Int = 0,
    val capitalsCaptured: Int = 0,
    val maxProvincesOwnedInRun: Int = 0,
    val regionsControlledPeak: Int = 0,
    val goldEarnedTotal: Int = 0,
    val peakTreasury: Int = 0,
    val silkRoadHubsPeak: Int = 0,
    val buildingsBuilt: Int = 0,
    val buildingTypesBuilt: Set<String> = emptySet(),
    val wondersBuilt: Int = 0,
    val cardsPlayedTotal: Int = 0,
    val techCardsPlayedTotal: Int = 0,
    val uniqueCardIdsPlayed: Set<String> = emptySet(),
    val legendaryCardsPlayed: Int = 0,
    val alliancesFormed: Int = 0,
    val warsDeclared: Int = 0,
    val treatiesSigned: Int = 0,
    val unitsRecruited: Int = 0,
    val militaryVictories: Int = 0,
    val economicVictories: Int = 0,
    val technologyVictories: Int = 0,
    val diplomaticVictories: Int = 0,
    val culturalVictories: Int = 0,
    val victoriesByFaction: Map<FactionId, Int> = emptyMap(),
    val fastestVictoryTurn: Int? = null,
    val hardDifficultyWins: Int = 0,
    val currentGameWinStreak: Int = 0,
    val longestGameWinStreak: Int = 0,
)

/** Player level from total points: gentle early, steeper later (50 * level * (level - 1) points per level). */
object Progression {
    fun pointsForLevel(level: Int): Int = 50 * level * (level - 1)

    fun level(totalPoints: Int): Int {
        var level = 1
        while (totalPoints >= pointsForLevel(level + 1)) level++
        return level
    }

    /** Highest rank level reached, used to pick the rank_<level> title. */
    fun rankLevel(level: Int): Int = RANK_LEVELS.lastOrNull { level >= it } ?: RANK_LEVELS.first()
}
