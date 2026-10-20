package fi.bookish.creations.arojen.tarinat.ui.screens.menu

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh

/**
 * The one-time analytics question (GDPR opt-in), in the original's words.
 * Unlike the old web banner it cannot sit hidden behind other layers: it is a
 * dialog, and both answers are a clear choice that Settings can change later.
 */
@Composable
fun AnalyticsConsentDialog(onAccept: () -> Unit, onDecline: () -> Unit) {
    Dialog(onDismissRequest = {}, properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false)) {
        GamePanel(Modifier.widthIn(max = 440.dp), alpha = 0.98f) {
            Column(Modifier.padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(GameIcons.Shield, null, tint = Gold, modifier = Modifier.size(40.dp))
                Spacer(Modifier.height(8.dp))
                Text(
                    stringResource(R.string.analytics_consent_title),
                    style = MaterialTheme.typography.headlineSmall,
                    color = GoldBright,
                    textAlign = TextAlign.Center,
                )
                OrnamentDivider(Modifier.width(180.dp).padding(vertical = 8.dp))
                Text(
                    stringResource(R.string.analytics_consent_body),
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextHigh,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GameButton(stringResource(R.string.analytics_consent_decline), onDecline, style = GameButtonStyle.Secondary)
                    GameButton(stringResource(R.string.analytics_consent_accept), onAccept)
                }
            }
        }
    }
}
