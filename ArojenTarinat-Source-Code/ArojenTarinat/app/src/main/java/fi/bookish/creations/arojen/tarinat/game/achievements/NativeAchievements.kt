package fi.bookish.creations.arojen.tarinat.game.achievements

/**
 * Achievements of the native app that the original did not have (the daily
 * challenge). Kept apart from the generated [ACHIEVEMENTS]; text lives in
 * strings_achievements.xml under the same achv_<id>_ names.
 */
val NATIVE_ACHIEVEMENTS: List<AchievementDef> = listOf(
    AchievementDef("daily_challenge_first", AchievementCategory.DAILY_WEEKLY, AchievementDifficulty.EASY, points = 20, reward = RewardKind.BADGE, check = atLeast(1) { it.dailyChallengesCompleted }),
    AchievementDef("daily_challenge_ten", AchievementCategory.DAILY_WEEKLY, AchievementDifficulty.MEDIUM, points = 45, check = atLeast(10) { it.dailyChallengesCompleted }),
    AchievementDef("daily_challenge_streak_5", AchievementCategory.DAILY_WEEKLY, AchievementDifficulty.HARD, points = 60, reward = RewardKind.TITLE, check = atLeast(5) { it.longestDailyChallengeStreak }),
)

/** Every achievement the app shows and tracks. */
val ALL_ACHIEVEMENTS: List<AchievementDef> = ACHIEVEMENTS + NATIVE_ACHIEVEMENTS
