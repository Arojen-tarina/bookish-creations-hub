package fi.bookish.creations.arojen.tarinat.ui.screens.menu

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.BuildConfig
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.moose.MooseButton
import fi.bookish.creations.arojen.tarinat.ui.theme.ArojenTarinatTheme
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.ParchmentDim
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
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
                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.BottomEnd) {
                    MooseButton(onMoose, Modifier.align(Alignment.TopEnd), size = 52.dp)
                    if (updateReady) UpdateReady(onInstallUpdate, Modifier.align(Alignment.TopStart))
                    Text(
                        text = stringResource(R.string.splash_tagline),
                        style = MaterialTheme.typography.bodyLarge.copy(fontStyle = FontStyle.Italic),
                        color = ParchmentDim,
                        textAlign = TextAlign.End,
                        modifier = Modifier.widthIn(max = 360.dp),
                    )
                }
                // Over the decorative art, away from the menu buttons.
                banner()
            }
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
