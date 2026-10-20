package fi.bookish.creations.arojen.tarinat.ui.game.map

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathOperation
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform

/** Small vector glyphs drawn on the map, defined in a 0..1 unit box. */
internal object MapGlyphs {

    val crown = Path().apply {
        moveTo(0.06f, 0.88f); lineTo(0.94f, 0.88f); lineTo(0.94f, 0.72f)
        lineTo(1f, 0.22f); lineTo(0.72f, 0.50f); lineTo(0.5f, 0.08f)
        lineTo(0.28f, 0.50f); lineTo(0f, 0.22f); lineTo(0.06f, 0.72f); close()
    }

    val shield = Path().apply {
        moveTo(0.5f, 0.02f); lineTo(0.92f, 0.16f); lineTo(0.88f, 0.52f)
        quadraticTo(0.8f, 0.86f, 0.5f, 0.98f)
        quadraticTo(0.2f, 0.86f, 0.12f, 0.52f)
        lineTo(0.08f, 0.16f); close()
    }

    /** Cavalry count marker. */
    val horseshoe = Path().apply {
        moveTo(0.18f, 0.95f); lineTo(0.18f, 0.45f)
        cubicTo(0.18f, 0.05f, 0.82f, 0.05f, 0.82f, 0.45f)
        lineTo(0.82f, 0.95f); lineTo(0.62f, 0.95f); lineTo(0.62f, 0.45f)
        cubicTo(0.62f, 0.27f, 0.38f, 0.27f, 0.38f, 0.45f)
        lineTo(0.38f, 0.95f); close()
    }

    /** Infantry count marker: a sword laid diagonally (point top-right) so it never reads as an arrow. */
    val sword: Path = listOf(
        // Blade with a pointed tip
        polygon(0.98f to 0.02f, 0.90f to 0.26f, 0.42f to 0.74f, 0.26f to 0.58f, 0.74f to 0.10f),
        // Cross-guard
        polygon(0.14f to 0.56f, 0.24f to 0.46f, 0.54f to 0.76f, 0.44f to 0.86f),
        // Grip
        polygon(0.30f to 0.62f, 0.38f to 0.70f, 0.16f to 0.92f, 0.08f to 0.84f),
        // Pommel
        Path().apply { addOval(Rect(0.02f, 0.86f, 0.14f, 0.98f)) },
    ).reduce { acc, part -> Path.combine(PathOperation.Union, acc, part) }

    private fun polygon(vararg points: Pair<Float, Float>) = Path().apply {
        moveTo(points[0].first, points[0].second)
        for (i in 1 until points.size) lineTo(points[i].first, points[i].second)
        close()
    }
}

/** Draws a unit-box [glyph] into [rect], optionally outlined. */
internal fun DrawScope.drawGlyph(glyph: Path, rect: Rect, fill: Color, outline: Color? = null, outlineWidthPx: Float = 0f) {
    withTransform({
        translate(rect.left, rect.top)
        scale(rect.width, rect.height, Offset.Zero)
    }) {
        drawPath(glyph, fill)
        if (outline != null && outlineWidthPx > 0f) {
            drawPath(glyph, outline, style = Stroke(width = outlineWidthPx / rect.width))
        }
    }
}
