package fi.bookish.creations.arojen.tarinat.ui.achievements

import android.text.format.DateUtils
import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.game.achievements.AchievementCategory
import fi.bookish.creations.arojen.tarinat.game.achievements.AchievementDef
import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.game.achievements.RewardKind
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ProgressBar
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink800
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first

val LegendaryViolet = Color(0xFFC084FC)

@get:StringRes
val AchievementCategory.labelRes: Int
    get() = when (this) {
        AchievementCategory.TUTORIAL -> R.string.achv_category_tutorial
        AchievementCategory.EARLY_GAME -> R.string.achv_category_early_game
        AchievementCategory.MID_GAME -> R.string.achv_category_mid_game
        AchievementCategory.END_GAME -> R.string.achv_category_end_game
        AchievementCategory.HIDDEN -> R.string.achv_category_hidden
        AchievementCategory.SKILL -> R.string.achv_category_skill
        AchievementCategory.EXPLORATION -> R.string.achv_category_exploration
        AchievementCategory.COLLECTION -> R.string.achv_category_collection
        AchievementCategory.CHALLENGE -> R.string.achv_category_challenge
        AchievementCategory.HISTORICAL -> R.string.achv_category_historical
        AchievementCategory.CAMPAIGN -> R.string.achv_category_campaign
        AchievementCategory.DAILY_WEEKLY -> R.string.achv_category_daily_weekly
        AchievementCategory.LIFETIME -> R.string.achv_category_lifetime
    }

val RewardKind.icon: ImageVector
    get() = when (this) {
        RewardKind.BADGE -> GameIcons.Shield
        RewardKind.TITLE -> GameIcons.Crown
        RewardKind.BANNER -> GameIcons.Flag
        RewardKind.PORTRAIT -> GameIcons.People
        RewardKind.UNIT_SKIN -> GameIcons.Swords
        RewardKind.DECORATION -> GameIcons.Temple
    }

/**
 * One achievement tile: name and description (hidden until unlocked for
 * secret ones), points, reward, unlock date or progress towards it.
 */
@Composable
fun AchievementCard(def: AchievementDef, unlockedAt: Long?, stats: PlayerStats, modifier: Modifier = Modifier) {
    val text = ACHIEVEMENT_TEXT.getValue(def.id)
    val unlocked = unlockedAt != null
    val secret = def.hidden && !unlocked
    val accent = when {
        !unlocked -> Ink500
        def.legendary -> LegendaryViolet
        else -> Gold
    }
    val shape = RoundedCornerShape(12.dp)
    Column(
        modifier
            .clip(shape)
            .background(
                if (unlocked) Brush.linearGradient(listOf(accent.copy(alpha = 0.22f), Ink900.copy(alpha = 0.92f)))
                else Brush.linearGradient(listOf(Ink700.copy(alpha = 0.9f), Ink900.copy(alpha = 0.9f))),
            )
            .border(1.dp, accent.copy(alpha = if (unlocked) 0.8f else 1f), shape)
            .padding(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier.size(34.dp).clip(CircleShape).background(accent.copy(alpha = if (unlocked) 0.25f else 0.4f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(if (unlocked) GameIcons.Trophy else GameIcons.Lock, null, tint = if (unlocked) accent else TextLow, modifier = Modifier.size(18.dp))
            }
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    if (secret) stringResource(R.string.achv_category_hidden) else stringResource(text.name),
                    style = MaterialTheme.typography.titleSmall,
                    color = if (unlocked) TextHigh else TextMid,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                if (def.legendary && unlocked) {
                    Text(stringResource(R.string.achv_legendary), style = MaterialTheme.typography.labelSmall, color = LegendaryViolet)
                }
            }
            Text(
                ltr(stringResource(R.string.achv_points_badge, def.points)),
                style = MaterialTheme.typography.labelLarge,
                color = if (unlocked) accent else TextLow,
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(
            if (secret) stringResource(R.string.achv_hidden_desc) else stringResource(text.description),
            style = MaterialTheme.typography.bodySmall,
            color = TextMid,
            modifier = Modifier.alpha(if (unlocked) 1f else 0.85f),
        )
        val reward = def.reward
        if (reward != null && text.reward != null && !secret) {
            Spacer(Modifier.height(6.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(reward.icon, null, tint = if (unlocked) GoldBright else TextLow, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(6.dp))
                Text(
                    stringResource(R.string.achv_reward_line, stringResource(text.reward)),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (unlocked) GoldBright else TextLow,
                )
            }
        }
        Spacer(Modifier.weight(1f, fill = false))
        if (unlocked) {
            val date = DateUtils.formatDateTime(LocalContext.current, unlockedAt!!, DateUtils.FORMAT_SHOW_DATE or DateUtils.FORMAT_ABBREV_MONTH)
            Text(stringResource(R.string.achv_unlocked_on, date), style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 6.dp))
        } else {
            def.check.progress?.invoke(stats)?.let { p ->
                Row(Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    ProgressBar(p.current.toFloat() / p.target, Gold, Modifier.weight(1f), height = 5.dp)
                    Spacer(Modifier.width(8.dp))
                    Text(ltr("${p.current} / ${p.target}"), style = MaterialTheme.typography.labelSmall, color = TextMid)
                }
            }
        }
    }
}

/**
 * Announces each newly unlocked achievement, one after another, as a toast like the
 * game's other messages: in the map's top-centre column, so it never covers the drawer
 * or its close button.
 */
@Composable
fun AchievementToast(repo: AchievementRepository, modifier: Modifier = Modifier) {
    var showing by remember { mutableStateOf<AchievementDef?>(null) }
    // One at a time. Keyed on the repository alone: keying on what is showing restarted the
    // effect the moment a toast appeared, cancelled its timer and left it on screen for good.
    LaunchedEffect(repo) {
        while (true) {
            val next = repo.unannounced.first { it.isNotEmpty() }.first()
            showing = next
            delay(3500)
            showing = null
            repo.markAnnounced(next)
            // Let the toast fade out before the next one.
            delay(400)
        }
    }
    AnimatedVisibility(showing != null, modifier, enter = fadeIn() + slideInVertically { -it }, exit = fadeOut()) {
        val def = remember(showing) { showing } ?: return@AnimatedVisibility
        val accent = if (def.legendary) LegendaryViolet else Gold
        val shape = RoundedCornerShape(50)
        Row(
            Modifier
                .clip(shape)
                .background(Ink800.copy(alpha = 0.96f))
                .border(1.dp, accent.copy(alpha = 0.8f), shape)
                .padding(start = 10.dp, end = 16.dp, top = 6.dp, bottom = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.size(26.dp).clip(CircleShape).background(accent.copy(alpha = 0.25f)), contentAlignment = Alignment.Center) {
                Icon(GameIcons.Trophy, null, tint = accent, modifier = Modifier.size(16.dp))
            }
            Spacer(Modifier.width(10.dp))
            Text(stringResource(R.string.achv_banner_title), style = MaterialTheme.typography.labelMedium, color = accent)
            Spacer(Modifier.width(8.dp))
            Text(stringResource(ACHIEVEMENT_TEXT.getValue(def.id).name), style = MaterialTheme.typography.titleSmall, color = TextHigh)
            Spacer(Modifier.width(10.dp))
            Text(ltr(stringResource(R.string.achv_points_badge, def.points)), style = MaterialTheme.typography.titleSmall, color = accent)
        }
    }
}

