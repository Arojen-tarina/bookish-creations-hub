package fi.bookish.creations.arojen.tarinat.ui.game.map

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import kotlin.math.max
import kotlin.math.min

/**
 * Board space maps the complete wide board image to x 0..130, beginning at y=20.
 */
internal object MapGeometry {
    const val PLAY_LEFT = 0f
    const val PLAY_WIDTH = 130f
    const val PLAY_TOP = 20f
    const val PLAY_HEIGHT = PLAY_WIDTH * 1360f / 1953f

    fun imageRect() = Rect(0f, PLAY_TOP, PLAY_WIDTH, PLAY_TOP + PLAY_HEIGHT)

    fun projectPoint(point: Offset) = point

    val playRect = Rect(PLAY_LEFT, PLAY_TOP, PLAY_LEFT + PLAY_WIDTH, PLAY_TOP + PLAY_HEIGHT)
}

/**
 * Pan/zoom state for the board. [scale] is screen pixels per board unit and
 * [center] is the board point at the middle of the viewport.
 */
@Stable
class MapCameraState(
    /** Zoom, centre x and centre y the player left the map at; put back once the map is laid out again. */
    private var savedView: FloatArray? = null,
) {
    /** True when the camera came back with the player's view, so it should not jump to the capital. */
    val restored = savedView != null

    var viewport by mutableStateOf(Size.Zero)
        private set
    var scale by mutableFloatStateOf(1f)
        private set
    var center by mutableStateOf(MapGeometry.playRect.center)
        private set

    private var userMoved = false

    /** Area the camera may show; set from the board art once it is loaded. */
    var bounds: Rect = MapGeometry.playRect
        set(value) {
            if (field == value) {
                if (viewport != Size.Zero) becomeReady()
                return
            }
            field = value
            if (viewport == Size.Zero) return
            // The art usually arrives after the first layout: refit unless the player already moved.
            if (userMoved) {
                scale = scale.coerceIn(minScale, maxScale)
            } else {
                scale = minScale
                center = MapGeometry.playRect.center
            }
            becomeReady()
        }

    /**
     * Fully zoomed out: the whole play area fits, and the board art always spans
     * the screen width so wide phones never show empty side bars.
     */
    val minScale: Float
        get() = if (viewport == Size.Zero) 1f
        else min(viewport.width / bounds.width, viewport.height / bounds.height)
    val maxScale: Float get() = minScale * MAX_ZOOM

    /** 1 = whole board visible, up to [MAX_ZOOM]. */
    val zoom: Float get() = scale / minScale

    private var initialized = false

    fun onViewportChanged(size: Size) {
        if (size == viewport || size.width <= 0f || size.height <= 0f) return
        val oldZoom = if (initialized) zoom else 1f
        viewport = size
        scale = minScale * oldZoom
        if (!initialized) {
            center = MapGeometry.playRect.center
            initialized = true
        }
        if (bounds != MapGeometry.playRect) becomeReady() else clamp()
    }

    /** Called once both the viewport and the board art are known. */
    private fun becomeReady() {
        savedView?.let { (zoom, x, y) ->
            scale = (minScale * zoom).coerceIn(minScale, maxScale)
            center = Offset(x, y)
            userMoved = true
            savedView = null
        }
        clamp()
        isReady = true
    }

    fun worldToScreen(p: Offset): Offset = Offset(
        (p.x - center.x) * scale + viewport.width / 2f,
        (p.y - center.y) * scale + viewport.height / 2f,
    )

    fun screenToWorld(p: Offset): Offset = Offset(
        (p.x - viewport.width / 2f) / scale + center.x,
        (p.y - viewport.height / 2f) / scale + center.y,
    )

    /** Board area currently on screen. */
    val visibleWorld: Rect
        get() {
            val halfW = viewport.width / 2f / scale
            val halfH = viewport.height / 2f / scale
            return Rect(center.x - halfW, center.y - halfH, center.x + halfW, center.y + halfH)
        }

    /** Pinch/pan: zoom about [focus] (screen px), then move by [pan] (screen px). */
    fun transform(focus: Offset, pan: Offset, zoomBy: Float) {
        userMoved = true
        val worldFocus = screenToWorld(focus)
        scale = (scale * zoomBy).coerceIn(minScale, maxScale)
        center = Offset(
            worldFocus.x - (focus.x - viewport.width / 2f) / scale,
            worldFocus.y - (focus.y - viewport.height / 2f) / scale,
        ) - pan / scale
        clamp()
    }

    suspend fun animateZoomBy(factor: Float) = animateTo(scale * factor, center)

    suspend fun animateToFit() = animateTo(minScale, MapGeometry.playRect.center)

    /** Screen pixels on the right covered by a side panel; the map may slide left to clear them. */
    private var rightInset = 0f

    /** Screen pixels at the top covered by the HUD. */
    var topInset = 0f

    /** True once the viewport is laid out and the board art has set the bounds. */
    var isReady by mutableStateOf(false)
        private set

    suspend fun setRightInset(px: Float) {
        if (px == rightInset) return
        rightInset = px
        if (viewport != Size.Zero) animateTo(scale, clampedCenter(center, scale))
    }

    /**
     * Glides (without zooming) so [world] sits in the middle of the area not
     * covered by the HUD or a panel. Unless [force], nothing moves when it is
     * already comfortably visible.
     */
    suspend fun animateIntoView(world: Offset, force: Boolean = false) {
        if (viewport == Size.Zero) return
        val margin = viewport.height * 0.12f
        val freeRight = viewport.width - rightInset
        val top = topInset + margin
        val bottom = viewport.height - margin
        val s = worldToScreen(world)
        val xOk = s.x in margin..(freeRight - margin)
        val yOk = s.y in top..bottom
        if (!force && xOk && yOk) return
        val targetX = if (!force && xOk) center.x else world.x - (freeRight / 2f - viewport.width / 2f) / scale
        val targetY = if (!force && yOk) center.y else world.y - ((topInset + viewport.height) / 2f - viewport.height / 2f) / scale
        animateTo(scale, Offset(targetX, targetY))
    }

    private suspend fun animateTo(targetScale: Float, targetCenter: Offset) {
        userMoved = true
        val fromScale = scale
        val fromCenter = center
        val toScale = targetScale.coerceIn(minScale, maxScale)
        val t = Animatable(0f)
        t.animateTo(1f, tween(300, easing = FastOutSlowInEasing)) {
            scale = fromScale + (toScale - fromScale) * value
            center = fromCenter + (targetCenter - fromCenter) * value
            clamp()
        }
    }

    private fun clamp() {
        center = clampedCenter(center, scale)
    }

    /**
     * Keeps the view over the board art, centring an axis that is smaller than
     * the screen. A right inset lets the art slide left by that much, so land
     * under an open side panel can still be brought into view.
     */
    private fun clampedCenter(c: Offset, s: Float): Offset {
        val halfW = viewport.width / 2f / s
        val halfH = viewport.height / 2f / s
        val insetW = rightInset / s
        val minX = bounds.left + halfW
        val maxX = bounds.right + insetW - halfW
        val x = if (minX > maxX) bounds.center.x + insetW / 2f else c.x.coerceIn(minX, maxX)
        val y = if (halfH * 2 >= bounds.height) bounds.center.y else c.y.coerceIn(bounds.top + halfH, bounds.bottom - halfH)
        return Offset(x, y)
    }

    companion object {
        const val MAX_ZOOM = 6f

        /** Zoom is kept relative to the fitted scale, which depends on the screen size. */
        val Saver: Saver<MapCameraState, FloatArray> = Saver(
            save = { if (it.isReady) floatArrayOf(it.zoom, it.center.x, it.center.y) else null },
            restore = { MapCameraState(it) },
        )
    }
}

/** Keeps the player's view when they come back from the rulebook or settings. */
@Composable
fun rememberMapCameraState(): MapCameraState = rememberSaveable(saver = MapCameraState.Saver) { MapCameraState() }
