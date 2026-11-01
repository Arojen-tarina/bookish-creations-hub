package fi.bookish.creations.arojen.tarinat.ui.screens.splash

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldDeep
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink600
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

/** Minimum time the branded splash stays up, so it never just flickers. */
private const val MIN_SPLASH_MS = 1600

/**
 * Branded loading screen shown right after the system splash.
 * [preload] runs one-off startup work (game data, saves, consent) in parallel
 * with the intro animation; [onFinished] fires once both are done.
 */
@Composable
fun LoadingScreen(
    onFinished: () -> Unit,
    preload: suspend () -> Unit = {},
) {
    val currentOnFinished by rememberUpdatedState(onFinished)
    val progress = remember { Animatable(0f) }
    val intro = remember { Animatable(0f) }

    LaunchedEffect(Unit) {
        coroutineScope {
            val work = async { preload() }
            async { intro.animateTo(1f, tween(700, easing = FastOutSlowInEasing)) }
            progress.animateTo(0.85f, tween(MIN_SPLASH_MS, easing = LinearEasing))
            work.await()
            progress.animateTo(1f, tween(200))
        }
        currentOnFinished()
    }

    val spin = rememberInfiniteTransition(label = "emblem")
    val rotation by spin.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(24_000, easing = LinearEasing), RepeatMode.Restart),
        label = "rotation",
    )

    BoardBackdrop {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp)
                .graphicsLayer {
                    alpha = intro.value
                    val scale = 0.92f + 0.08f * intro.value
                    scaleX = scale
                    scaleY = scale
                },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Image(
                painter = painterResource(R.drawable.emblem_compass),
                contentDescription = null,
                modifier = Modifier
                    .size(96.dp)
                    .graphicsLayer { rotationZ = rotation },
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.app_name).uppercase(),
                style = MaterialTheme.typography.displayLarge,
                color = GoldBright,
                textAlign = TextAlign.Center,
            )
            OrnamentDivider(modifier = Modifier.width(260.dp).padding(vertical = 6.dp))
            Text(
                text = stringResource(R.string.splash_subtitle),
                style = MaterialTheme.typography.titleMedium,
                color = TextMid,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.height(28.dp))
            LoadingBar(progress = progress.value, modifier = Modifier.width(240.dp))
            Spacer(Modifier.height(8.dp))
            Text(
                text = stringResource(R.string.common_loading),
                style = MaterialTheme.typography.labelMedium,
                color = TextLow,
            )
        }
    }
}

@Composable
private fun LoadingBar(progress: Float, modifier: Modifier = Modifier) {
    val shape = RoundedCornerShape(50)
    Box(
        modifier = modifier
            .height(6.dp)
            .clip(shape)
            .background(Ink600),
    ) {
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(progress.coerceIn(0f, 1f))
                .clip(shape)
                .background(Brush.horizontalGradient(listOf(GoldDeep, Gold, GoldBright))),
        )
    }
}
