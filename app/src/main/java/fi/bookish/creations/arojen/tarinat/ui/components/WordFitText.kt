package fi.bookish.creations.arojen.tarinat.ui.components

import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextOverflow

/**
 * A short title (card, realm) in up to [maxLines] lines. Long compound words (Finnish, German)
 * and narrow phones shrink the text until the longest word fits a line, instead of breaking
 * in the middle of a word.
 */
@Composable
fun WordFitText(text: String, style: TextStyle, color: Color, modifier: Modifier = Modifier, maxLines: Int = 2) {
    val measurer = rememberTextMeasurer()
    BoxWithConstraints(modifier) {
        val room = constraints.maxWidth
        val widest = remember(text, style) {
            text.split(' ').maxOfOrNull { measurer.measure(it, style, softWrap = false, maxLines = 1).size.width } ?: 0
        }
        // A small margin: glyph rounding at the smaller size can still push the last letter over.
        val limit = room * 0.92f
        val fitted = if (widest > limit && room > 0) style.copy(fontSize = style.fontSize * (limit / widest)) else style
        Text(text, style = fitted, color = color, maxLines = maxLines, overflow = TextOverflow.Ellipsis)
    }
}
