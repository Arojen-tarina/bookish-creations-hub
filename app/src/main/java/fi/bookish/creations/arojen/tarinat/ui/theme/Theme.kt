package fi.bookish.creations.arojen.tarinat.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp

// The game always uses its own dark palette (no dynamic colour) so the look
// stays consistent with the board art on every device.
private val GameColorScheme = darkColorScheme(
    primary = Gold,
    onPrimary = Ink900,
    primaryContainer = GoldDeep,
    onPrimaryContainer = TextHigh,
    secondary = Parchment,
    onSecondary = ParchmentInk,
    tertiary = Sky,
    onTertiary = Ink900,
    background = Ink800,
    onBackground = TextHigh,
    surface = Ink700,
    onSurface = TextHigh,
    surfaceVariant = Ink600,
    onSurfaceVariant = TextMid,
    surfaceContainer = Ink700,
    surfaceContainerHigh = Ink600,
    surfaceContainerHighest = Ink500,
    outline = Ink500,
    outlineVariant = Ink600,
    error = Rust,
    onError = TextHigh,
    scrim = Scrim,
)

private val GameShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(6.dp),
    medium = RoundedCornerShape(10.dp),
    large = RoundedCornerShape(14.dp),
    extraLarge = RoundedCornerShape(20.dp),
)

@Composable
fun ArojenTarinatTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = GameColorScheme,
        typography = Typography,
        shapes = GameShapes,
        content = content,
    )
}
