package fi.bookish.creations.arojen.tarinat.ui.screens.menu

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.exclude
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.BuildConfig
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.components.PremiumPill
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.moose.MooseButton
import fi.bookish.creations.arojen.tarinat.ui.theme.ArojenTarinatTheme
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.ParchmentDim
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

// Dark behind the menu column, fading so the board stays visible on the other side.
private val MenuStops = arrayOf(
    0f to Ink900.copy(alpha = 0.96f),
    0.45f to Ink900.copy(alpha = 0.82f),
    1f to Ink900.copy(alpha = 0.30f),
)
private val MenuOverlayLtr = Brush.horizontalGradient(*MenuStops)
// Right-to-left languages put the menu on the right, so the dark side follows it.
private val MenuOverlayRtl = Brush.horizontalGradient(*MenuStops.map { (f, c) -> (1f - f) to c }.reversed().toTypedArray())

/** What the daily challenge card shows: realm and difficulty, the goal, and the player's record. */
data class DailyCardInfo(val setup: String, val goal: String, val doneToday: Boolean, val streak: Int)

@Composable
fun MainMenuScreen(
    /** "Turn 12 · Mongol Empire" for the game Continue resumes, or null when there is none. */
    continueInfo: String?,
    onContinue: () -> Unit,
    onNewGame: () -> Unit,
    onLoadGame: () -> Unit,
    onAchievements: () -> Unit,
    onCodex: () -> Unit,
    onRulebook: () -> Unit,
    onSettings: () -> Unit,
    onMoose: () -> Unit,
    /** True after Continue found its save damaged (the menu then offers the next save, if any). */
    continueFailed: Boolean = false,
    /** Play has downloaded an update; [onInstallUpdate] restarts into it. */
    updateReady: Boolean = false,
    onInstallUpdate: () -> Unit = {},
    /** Pinned under the art on the right (the advert). */
    banner: @Composable () -> Unit = {},
    /** Monthly Premium price while the player has no subscription and Play offers one; null hides the offer. */
    premiumPrice: String? = null,
    onPremium: () -> Unit = {},
    /** "Level 4 · Rider"; null hides it. */
    levelLine: String? = null,
    daily: DailyCardInfo? = null,
    onDaily: () -> Unit = {},
    /** Online play; null hides the button (no server in this build). */
    onMultiplayer: (() -> Unit)? = null,
) {
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    BoardBackdrop(overlay = if (rtl) MenuOverlayRtl else MenuOverlayLtr) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                // The Moose guide's keyboard must not squeeze the screen behind its dialog.
                .windowInsetsPadding(WindowInsets.safeDrawing.exclude(WindowInsets.ime)),
        ) {
            Column(
                modifier = Modifier
                    .fillMaxHeight()
                    .widthIn(max = 380.dp)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 28.dp, vertical = 20.dp),
                verticalArrangement = Arrangement.Center,
            ) {
                MenuTitle()
                Spacer(Modifier.height(18.dp))

                if (continueFailed) {
                    Text(
                        stringResource(R.string.save_load_failed),
                        style = MaterialTheme.typography.labelLarge,
                        color = Rust,
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        textAlign = TextAlign.Center,
                    )
                }
                if (continueInfo != null) {
                    GameButton(stringResource(R.string.menu_continue), onContinue, Modifier.fillMaxWidth())
                    Text(
                        continueInfo,
                        style = MaterialTheme.typography.labelMedium,
                        color = TextMid,
                        modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(8.dp))
                    // With a campaign to continue, New and Load share a row so the menu still fits.
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        GameButton(stringResource(R.string.menu_new_game), onNewGame, Modifier.weight(1f), GameButtonStyle.Secondary)
                        GameButton(stringResource(R.string.menu_load_game), onLoadGame, Modifier.weight(1f), GameButtonStyle.Secondary)
                    }
                } else {
                    GameButton(stringResource(R.string.menu_new_game), onNewGame, Modifier.fillMaxWidth())
                    Spacer(Modifier.height(10.dp))
                    GameButton(stringResource(R.string.menu_load_game), onLoadGame, Modifier.fillMaxWidth(), GameButtonStyle.Secondary)
                }
                Spacer(Modifier.height(14.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    GameButton(stringResource(R.string.menu_achievements), onAchievements, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                    GameButton(stringResource(R.string.menu_settings), onSettings, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                }
                Spacer(Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    GameButton(stringResource(R.string.menu_codex), onCodex, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                    GameButton(stringResource(R.string.menu_rulebook), onRulebook, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                }
                Spacer(Modifier.height(14.dp))
                Text(
                    text = stringResource(R.string.menu_version, BuildConfig.VERSION_NAME),
                    style = MaterialTheme.typography.labelSmall,
                    color = TextLow,
                )
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .padding(24.dp),
            ) {
                Row(verticalAlignment = Alignment.Top) {
                    Column(Modifier.weight(1f, fill = false).widthIn(max = 380.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (updateReady) UpdateReady(onInstallUpdate)
                        if (levelLine != null) LevelChip(levelLine)
                        if (daily != null) DailyCard(daily, onDaily)
                        if (onMultiplayer != null) {
                            GameButton(stringResource(R.string.mp_title), onMultiplayer, Modifier.fillMaxWidth(), GameButtonStyle.Secondary, compact = true)
                        }
                    }
                    Spacer(Modifier.weight(0.01f).widthIn(min = 12.dp))
                    MooseButton(onMoose, size = 52.dp)
                }
                // The tagline keeps a space of its own below the cards and is left out where the screen is too short for it.
                BoxWithConstraints(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.BottomEnd) {
                    if (maxHeight >= 56.dp) {
                        Text(
                            text = stringResource(R.string.splash_tagline),
                            style = MaterialTheme.typography.bodyLarge.copy(fontStyle = FontStyle.Italic),
                            color = ParchmentDim,
                            textAlign = TextAlign.End,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.widthIn(max = 360.dp).padding(top = 8.dp),
                        )
                    }
                }
                if (premiumPrice != null) {
                    PremiumPill(stringResource(R.string.premium_menu, ltr(premiumPrice)), onPremium, Modifier.align(Alignment.End).padding(top = 8.dp, bottom = 6.dp))
                }
                // Over the decorative art, away from the menu buttons.
                banner()
            }
        }
    }
}

/** The player's level and rank title (from achievement points). */
@Composable
private fun LevelChip(text: String) {
    Row(
        Modifier
            .clip(RoundedCornerShape(50))
            .background(Ink900.copy(alpha = 0.85f))
            .border(1.dp, Gold.copy(alpha = 0.6f), RoundedCornerShape(50))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(GameIcons.Trophy, null, tint = GoldBright, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(8.dp))
        Text(text, style = MaterialTheme.typography.labelLarge, color = TextHigh, maxLines = 1)
    }
}

/** Today's challenge: same realm, map and goal for everyone; the record shows the player's streak. */
@Composable
private fun DailyCard(info: DailyCardInfo, onPlay: () -> Unit) {
    val shape = RoundedCornerShape(14.dp)
    Column(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(Ink900.copy(alpha = 0.88f))
            .border(1.dp, if (info.doneToday) Jade else Gold, shape)
            .padding(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(if (info.doneToday) GameIcons.Check else GameIcons.Flag, null, tint = if (info.doneToday) Jade else GoldBright, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text(stringResource(R.string.daily_title), style = MaterialTheme.typography.titleSmall, color = GoldBright, modifier = Modifier.weight(1f))
            if (info.streak > 0) Text(stringResource(R.string.daily_streak, info.streak), style = MaterialTheme.typography.labelMedium, color = TextMid)
        }
        Row(Modifier.padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(info.setup, style = MaterialTheme.typography.labelMedium, color = TextMid)
                Text(info.goal, style = MaterialTheme.typography.bodyMedium, color = TextHigh, modifier = Modifier.padding(top = 2.dp))
                if (info.doneToday) {
                    Text(stringResource(R.string.daily_done_today), style = MaterialTheme.typography.labelMedium, color = Jade, modifier = Modifier.padding(top = 2.dp))
                }
            }
            Spacer(Modifier.width(10.dp))
            GameButton(stringResource(R.string.daily_play), onPlay, compact = true)
        }
    }
}

/** A downloaded update waiting for a restart. */
@Composable
private fun UpdateReady(onRestart: () -> Unit, modifier: Modifier = Modifier) {
    Row(
        modifier
            .clip(RoundedCornerShape(50))
            .background(Ink900.copy(alpha = 0.9f))
            .border(1.dp, Gold, RoundedCornerShape(50))
            .padding(start = 16.dp, end = 6.dp, top = 6.dp, bottom = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(stringResource(R.string.update_ready), style = MaterialTheme.typography.labelLarge, color = GoldBright)
        GameButton(stringResource(R.string.update_restart), onRestart, compact = true)
    }
}

@Composable
private fun MenuTitle() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Image(
            painter = painterResource(R.drawable.emblem_compass),
            contentDescription = null,
            modifier = Modifier.size(56.dp),
        )
        Spacer(Modifier.width(10.dp))
        // The Latin brand name sits against the emblem in either layout direction.
        val towardEmblem = if (LocalLayoutDirection.current == LayoutDirection.Rtl) TextAlign.Right else TextAlign.Left
        Column {
            Text(
                text = stringResource(R.string.app_name).uppercase(),
                style = MaterialTheme.typography.headlineLarge,
                color = GoldBright,
                textAlign = towardEmblem,
            )
            Text(
                text = stringResource(R.string.splash_subtitle),
                style = MaterialTheme.typography.bodyMedium,
                color = TextMid,
                textAlign = towardEmblem,
            )
        }
    }
    Spacer(Modifier.height(10.dp))
    OrnamentDivider()
}

@Preview(widthDp = 800, heightDp = 360)
@Composable
private fun MainMenuPreview() {
    ArojenTarinatTheme {
        MainMenuScreen("Turn 12 · Mongol Empire", {}, {}, {}, {}, {}, {}, {}, {})
    }
}
