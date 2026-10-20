package fi.bookish.creations.arojen.tarinat.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900

/**
 * The blurred board art used behind every non-game screen. [overlay] darkens it
 * so text stays readable; pass a horizontal gradient to keep one side brighter.
 */
@Composable
fun BoardBackdrop(
    modifier: Modifier = Modifier,
    overlay: Brush = Brush.radialGradient(listOf(Ink900.copy(alpha = 0.55f), Ink900.copy(alpha = 0.92f))),
    content: @Composable BoxScope.() -> Unit,
) {
    Box(modifier = modifier.fillMaxSize().background(Ink900)) {
        Image(
            painter = painterResource(R.drawable.bg_menu),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
        )
        Box(modifier = Modifier.fillMaxSize().background(overlay))
        content()
    }
}
