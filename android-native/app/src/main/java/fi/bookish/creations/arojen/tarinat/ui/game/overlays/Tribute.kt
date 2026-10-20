package fi.bookish.creations.arojen.tarinat.ui.game.overlays

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldDeep
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh

private val ChestFill = Brush.verticalGradient(listOf(GoldBright, Gold, GoldDeep))

/** Gold chest on the map: shown only while a tribute can be taken this turn and an ad is ready. */
@Composable
fun TributeButton(onClick: () -> Unit, modifier: Modifier = Modifier, size: Dp = 48.dp) {
    Box(
        modifier
            .size(size)
            .clip(CircleShape)
            .background(ChestFill)
            .border(1.dp, GoldBright, CircleShape)
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(GameIcons.Chest, stringResource(R.string.tribute_button), tint = Ink900, modifier = Modifier.size(size * 0.6f))
    }
}

/**
 * The offer before the ad (the intro screen the rewarded format asks for): what
 * the tribute pays, and a clear way to say no.
 */
@Composable
fun TributeDialog(gold: Int, canDrawCard: Boolean, onGold: () -> Unit, onCard: () -> Unit, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        GamePanel(Modifier.widthIn(max = 400.dp), alpha = 0.98f) {
            Column(Modifier.padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(56.dp).clip(CircleShape).background(ChestFill), contentAlignment = Alignment.Center) {
                    Icon(GameIcons.Chest, null, tint = Ink900, modifier = Modifier.size(34.dp))
                }
                Spacer(Modifier.height(8.dp))
                Text(stringResource(R.string.tribute_title), style = MaterialTheme.typography.headlineSmall, color = GoldBright, textAlign = TextAlign.Center)
                OrnamentDivider(Modifier.width(180.dp).padding(vertical = 8.dp))
                Text(stringResource(R.string.tribute_body), style = MaterialTheme.typography.bodyMedium, color = TextHigh, textAlign = TextAlign.Center)
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GameButton(stringResource(R.string.tribute_gold, gold), onGold)
                    if (canDrawCard) GameButton(stringResource(R.string.tribute_card), onCard, style = GameButtonStyle.Secondary)
                }
                Spacer(Modifier.height(8.dp))
                GameButton(stringResource(R.string.tribute_decline), onDismiss, style = GameButtonStyle.Secondary, compact = true)
            }
        }
    }
}
