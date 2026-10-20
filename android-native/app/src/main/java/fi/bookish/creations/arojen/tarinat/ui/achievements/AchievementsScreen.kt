package fi.bookish.creations.arojen.tarinat.ui.achievements

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.game.achievements.ACHIEVEMENTS
import fi.bookish.creations.arojen.tarinat.game.achievements.AchievementCategory
import fi.bookish.creations.arojen.tarinat.game.achievements.Progression
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ProgressBar
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/** Category order of the original panel; hidden ones last. */
private val CATEGORY_ORDER = listOf(
    AchievementCategory.TUTORIAL, AchievementCategory.EARLY_GAME, AchievementCategory.MID_GAME, AchievementCategory.END_GAME,
    AchievementCategory.SKILL, AchievementCategory.EXPLORATION, AchievementCategory.COLLECTION, AchievementCategory.CHALLENGE,
    AchievementCategory.HISTORICAL, AchievementCategory.CAMPAIGN, AchievementCategory.DAILY_WEEKLY, AchievementCategory.LIFETIME,
    AchievementCategory.HIDDEN,
)

@Composable
fun AchievementsScreen(repo: AchievementRepository, onBack: () -> Unit) {
    val unlocked by repo.unlocked.collectAsStateWithLifecycle()
    val stats by repo.stats.collectAsStateWithLifecycle()
    var filterName by rememberSaveable { mutableStateOf<String?>(null) }
    val filter = filterName?.let { AchievementCategory.valueOf(it) }

    val points = ACHIEVEMENTS.filter { it.id in unlocked }.sumOf { it.points }
    val level = Progression.level(points)
    val levelStart = Progression.pointsForLevel(level)
    val levelEnd = Progression.pointsForLevel(level + 1)
    val shown = ACHIEVEMENTS
        .filter { filter == null || it.category == filter }
        .sortedWith(compareBy({ CATEGORY_ORDER.indexOf(it.category) }, { it.id !in unlocked }))

    BoardBackdrop {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 16.dp, vertical = 10.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                RoundIconButton(GameIcons.Back, stringResource(R.string.common_back), onBack, size = 40.dp)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(stringResource(R.string.achv_title), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
                    Text(stringResource(R.string.achv_summary, unlocked.size, ACHIEVEMENTS.size), style = MaterialTheme.typography.bodySmall, color = TextMid)
                }
                GamePanel(Modifier.widthIn(min = 260.dp, max = 340.dp)) {
                    Column(Modifier.padding(horizontal = 14.dp, vertical = 8.dp)) {
                        val rank = RANK_TITLE.getValue(Progression.rankLevel(level))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(stringResource(R.string.achv_level_line, level, stringResource(rank)), style = MaterialTheme.typography.titleSmall, color = TextHigh, modifier = Modifier.weight(1f))
                            Text(ltr(stringResource(R.string.achv_points_line, points)), style = MaterialTheme.typography.labelLarge, color = Gold)
                        }
                        Spacer(Modifier.height(6.dp))
                        ProgressBar((points - levelStart).toFloat() / (levelEnd - levelStart), Gold)
                        Text(
                            stringResource(R.string.achv_next_level, levelEnd - points, level + 1),
                            style = MaterialTheme.typography.labelSmall,
                            color = TextMid,
                            modifier = Modifier.padding(top = 4.dp),
                        )
                    }
                }
            }
            Spacer(Modifier.height(10.dp))
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    CategoryChip(stringResource(R.string.achv_all), "${unlocked.size}/${ACHIEVEMENTS.size}", filter == null) { filterName = null }
                }
                items(CATEGORY_ORDER) { cat ->
                    val inCat = ACHIEVEMENTS.filter { it.category == cat }
                    CategoryChip(stringResource(cat.labelRes), "${inCat.count { it.id in unlocked }}/${inCat.size}", filter == cat) { filterName = cat.name }
                }
            }
            Spacer(Modifier.height(10.dp))
            LazyVerticalGrid(
                columns = GridCells.Adaptive(250.dp),
                contentPadding = PaddingValues(bottom = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f),
            ) {
                items(shown, key = { it.id }) { def ->
                    AchievementCard(def, unlocked[def.id], stats, Modifier.height(150.dp))
                }
            }
        }
    }
}

@Composable
private fun CategoryChip(label: String, count: String, selected: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Row(
        Modifier
            .clip(shape)
            .background(if (selected) Gold else Ink700.copy(alpha = 0.92f))
            .border(1.dp, if (selected) GoldBright else Gold.copy(alpha = 0.4f), shape)
            .clickable(role = Role.Tab, onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(label, style = MaterialTheme.typography.labelLarge, color = if (selected) Ink900 else TextHigh)
        Spacer(Modifier.width(6.dp))
        Text(ltr(count), style = MaterialTheme.typography.labelSmall, color = if (selected) Ink900 else TextMid)
    }
}
