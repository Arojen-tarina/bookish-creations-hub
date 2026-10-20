package fi.bookish.creations.arojen.tarinat.ui.game.hud

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink800

/** Dark translucent surface with a thin gold rim, used for every in-game panel. */
@Composable
fun GamePanel(
    modifier: Modifier = Modifier,
    shape: Shape = MaterialTheme.shapes.large,
    alpha: Float = 0.94f,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = modifier
            .clip(shape)
            .background(Ink800.copy(alpha = alpha))
            .border(1.dp, Gold.copy(alpha = 0.35f), shape),
        content = content,
    )
}

/** Inset card inside a panel. */
@Composable
fun PanelSection(modifier: Modifier = Modifier, accent: Color? = null, content: @Composable ColumnScope.() -> Unit) {
    val shape = RoundedCornerShape(10.dp)
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(shape)
            .background(Ink700.copy(alpha = 0.85f))
            .border(BorderStroke(1.dp, (accent ?: Ink500).copy(alpha = if (accent != null) 0.6f else 1f)), shape)
            .padding(12.dp),
        content = content,
    )
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier, icon: ImageVector? = null) {
    Row(modifier.padding(bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        if (icon != null) {
            Icon(icon, null, tint = Gold, modifier = Modifier.size(16.dp))
            Spacer(Modifier.size(6.dp))
        }
        Text(text, style = MaterialTheme.typography.titleSmall, color = GoldBright)
    }
}

/** Square icon button for the HUD (vector icon, gold tint, optional active state). */
@Composable
fun HudIconButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    active: Boolean = false,
    size: Dp = 40.dp,
) {
    val shape = RoundedCornerShape(10.dp)
    Box(
        modifier = modifier
            .size(size)
            .clip(shape)
            .background(if (active) Gold.copy(alpha = 0.22f) else Ink700.copy(alpha = 0.9f))
            .border(1.dp, Gold.copy(alpha = if (active) 0.9f else 0.45f), shape)
            .clickable(role = Role.Button, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription, tint = GoldBright, modifier = Modifier.size(size * 0.52f))
    }
}

/** Kinds of resource shown in the HUD; sprites where the game has art, vector icons otherwise. */
enum class ResourceKind(val color: Color) {
    GOLD(Color(0xFFFCD34D)),
    FOOD(Color(0xFF86EFAC)),
    HORSES(Color(0xFF93C5FD)),
    MANPOWER(Color(0xFFBFDBFE)),
    ARTISANS(Color(0xFFFDBA74)),
    INFLUENCE(Color(0xFF7DD3FC)),
    PRESTIGE(Color(0xFFD8B4FE)),
}

@Composable
fun ResourceIcon(kind: ResourceKind, modifier: Modifier = Modifier, size: Dp = 18.dp) {
    val sized = modifier.size(size)
    when (kind) {
        ResourceKind.GOLD -> Image(painterResource(R.drawable.sprite_res_gold), null, sized)
        ResourceKind.FOOD -> Image(painterResource(R.drawable.sprite_res_food), null, sized)
        ResourceKind.HORSES -> Image(painterResource(R.drawable.sprite_res_horse), null, sized)
        ResourceKind.MANPOWER -> Icon(GameIcons.People, null, sized, tint = kind.color)
        ResourceKind.ARTISANS -> Icon(GameIcons.Hammer, null, sized, tint = kind.color)
        ResourceKind.INFLUENCE -> Icon(GameIcons.Seal, null, sized, tint = kind.color)
        ResourceKind.PRESTIGE -> Icon(GameIcons.Temple, null, sized, tint = kind.color)
    }
}

/** Thin horizontal progress bar. */
@Composable
fun ProgressBar(fraction: Float, color: Color, modifier: Modifier = Modifier, height: Dp = 6.dp) {
    val shape = RoundedCornerShape(50)
    Box(modifier.fillMaxWidth().height(height).clip(shape).background(Ink500)) {
        Box(Modifier.fillMaxWidth(fraction.coerceIn(0f, 1f)).height(height).clip(shape).background(color))
    }
}

/** Small colored dot (faction marker). */
@Composable
fun Dot(color: Color, size: Dp = 10.dp) {
    Box(Modifier.size(size).clip(RoundedCornerShape(50)).background(color))
}

/** Clickable row used inside panels. */
@Composable
fun PanelRowButton(onClick: () -> Unit, modifier: Modifier = Modifier, enabled: Boolean = true, content: @Composable () -> Unit) {
    Box(
        modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .clickable(enabled = enabled, role = Role.Button, onClick = onClick),
    ) { content() }
}
