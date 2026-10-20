package fi.bookish.creations.arojen.tarinat.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldDeep
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900

enum class GameButtonStyle { Primary, Secondary }

private val PrimaryFill = Brush.verticalGradient(listOf(GoldBright, Gold, GoldDeep))
private val SecondaryFill = Brush.verticalGradient(listOf(Ink700.copy(alpha = 0.92f), Ink900.copy(alpha = 0.92f)))

/** Gold-trimmed button used across menus and the in-game HUD. */
@Composable
fun GameButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: GameButtonStyle = GameButtonStyle.Primary,
    enabled: Boolean = true,
    compact: Boolean = false,
) {
    val shape = MaterialTheme.shapes.small
    val (fill, border, textColor) = when (style) {
        GameButtonStyle.Primary -> Triple(PrimaryFill, BorderStroke(1.dp, GoldBright), Ink900)
        GameButtonStyle.Secondary -> Triple(SecondaryFill, BorderStroke(1.dp, Gold.copy(alpha = 0.65f)), GoldBright)
    }
    Box(
        modifier = modifier
            .defaultMinSize(minHeight = if (compact) 38.dp else 46.dp)
            .alpha(if (enabled) 1f else 0.4f)
            .clip(shape)
            .background(fill)
            .border(border, shape)
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick)
            .padding(horizontal = if (compact) 12.dp else 20.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = text,
            style = if (compact) MaterialTheme.typography.labelMedium else MaterialTheme.typography.labelLarge,
            color = textColor,
            textAlign = TextAlign.Center,
            maxLines = 1,
        )
    }
}
