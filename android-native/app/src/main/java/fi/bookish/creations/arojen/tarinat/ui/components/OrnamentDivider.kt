package fi.bookish.creations.arojen.tarinat.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold

/** Thin gold rule that fades out at both ends, with a diamond in the middle. */
@Composable
fun OrnamentDivider(modifier: Modifier = Modifier, color: Color = Gold) {
    Canvas(modifier = modifier.fillMaxWidth().height(10.dp)) {
        val y = size.height / 2
        val mid = size.width / 2
        val d = size.height / 2
        val stroke = 1.dp.toPx()
        drawLine(
            brush = Brush.horizontalGradient(listOf(Color.Transparent, color), startX = 0f, endX = mid - d * 2),
            start = Offset(0f, y),
            end = Offset(mid - d * 2, y),
            strokeWidth = stroke,
        )
        drawLine(
            brush = Brush.horizontalGradient(listOf(color, Color.Transparent), startX = mid + d * 2, endX = size.width),
            start = Offset(mid + d * 2, y),
            end = Offset(size.width, y),
            strokeWidth = stroke,
        )
        val diamond = Path().apply {
            moveTo(mid, y - d)
            lineTo(mid + d, y)
            lineTo(mid, y + d)
            lineTo(mid - d, y)
            close()
        }
        drawPath(diamond, color)
    }
}
