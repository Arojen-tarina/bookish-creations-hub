package fi.bookish.creations.arojen.tarinat.ui.screens.menu

import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.challenge.ChallengeGoal
import fi.bookish.creations.arojen.tarinat.game.challenge.DailyChallenge

/** "Hold 22 provinces by turn 12" in the app language. */
@Composable
fun DailyChallenge.goalText(): String = stringResource(
    when (goal) {
        ChallengeGoal.PROVINCES -> R.string.daily_goal_provinces
        ChallengeGoal.TREASURY -> R.string.daily_goal_treasury
        ChallengeGoal.BUILDINGS -> R.string.daily_goal_buildings
    },
    target,
    turnLimit,
)
