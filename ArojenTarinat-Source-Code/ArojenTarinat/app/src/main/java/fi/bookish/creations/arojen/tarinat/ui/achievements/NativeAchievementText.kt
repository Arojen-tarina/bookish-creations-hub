package fi.bookish.creations.arojen.tarinat.ui.achievements

import fi.bookish.creations.arojen.tarinat.R

/** Text of [fi.bookish.creations.arojen.tarinat.game.achievements.NATIVE_ACHIEVEMENTS]. */
private val NATIVE_ACHIEVEMENT_TEXT: Map<String, AchievementText> = mapOf(
    "daily_challenge_first" to AchievementText(R.string.achv_daily_challenge_first_name, R.string.achv_daily_challenge_first_desc, R.string.achv_daily_challenge_first_reward),
    "daily_challenge_ten" to AchievementText(R.string.achv_daily_challenge_ten_name, R.string.achv_daily_challenge_ten_desc, null),
    "daily_challenge_streak_5" to AchievementText(R.string.achv_daily_challenge_streak_5_name, R.string.achv_daily_challenge_streak_5_desc, R.string.achv_daily_challenge_streak_5_reward),
)

/** Text for every achievement the app shows. */
val ALL_ACHIEVEMENT_TEXT: Map<String, AchievementText> = ACHIEVEMENT_TEXT + NATIVE_ACHIEVEMENT_TEXT
