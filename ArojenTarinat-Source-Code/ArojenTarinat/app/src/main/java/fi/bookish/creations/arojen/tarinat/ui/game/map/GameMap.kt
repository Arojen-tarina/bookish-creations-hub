package fi.bookish.creations.arojen.tarinat.ui.game.map

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.Shadow
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.text.TextMeasurer
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.toSize
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Province
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.map.MapMetrics.S
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

private val SelectGold = Color(0xFFFBBF24)
private val MoveGreen = Color(0xFF22C55E)
private val AttackRed = Color(0xFFEF4444)
private val TokenEdge = Color(0xFF1A1A1A)
private val SilkAmber = Color(0xFFF59E0B)
private val SilkEdge = Color(0xFF92400E)
private val LabelInk = Color(0xFFF5E6C8)
private val LabelTab = Color(0xB3120F0C)
private val PillInk = Color(0xCC1A1A1A)
private val MoveStateColors = mapOf(
    MoveState.FULL to Color(0xFF22C55E),
    MoveState.PARTIAL to Color(0xFFEAB308),
    MoveState.NONE to Color(0xFFEF4444),
)

/** Font size labels are measured at; they are scaled to the zoom when drawn. */
private const val LABEL_BASE_SP = 12f

/**
 * The game board: illustrated map, province tokens with their buildings and
 * resources, army stacks, and move/attack highlights. Pan with one finger,
 * pinch to zoom, tap to select.
 */
@Composable
fun GameMap(
    state: GameState,
    selectedProvinceId: String?,
    selectedArmyId: String?,
    moveTargets: Set<String>,
    attackTargets: Set<String>,
    onProvinceTap: (String) -> Unit,
    onArmyTap: (String) -> Unit,
    camera: MapCameraState,
    modifier: Modifier = Modifier,
) {
    val assets = rememberMapAssets()
    val textMeasurer = rememberTextMeasurer(cacheSize = 64)
    val provincesById = remember(state.provinces) { state.provinces.associateBy { it.id } }
    val badges = remember(state.armies, provincesById, state.playerFactionId) {
        buildArmyBadges(state.armies, provincesById, state.playerFactionId)
    }
    val nameLabels = remember(textMeasurer) {
        val style = TextStyle(
            color = LabelInk,
            fontSize = LABEL_BASE_SP.sp,
            fontWeight = FontWeight.Bold,
            shadow = Shadow(Color.Black, Offset.Zero, blurRadius = 3f),
        )
        state.provinces.associate { it.id to textMeasurer.measure(it.name, style) }
    }

    val pulse by rememberInfiniteTransition(label = "select").animateFloat(
        initialValue = 0.35f,
        targetValue = 0.95f,
        animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing), RepeatMode.Reverse),
        label = "pulse",
    )

    val currentBadges by rememberUpdatedState(badges)
    val currentProvinces by rememberUpdatedState(state.provinces)
    val currentSelectedArmy by rememberUpdatedState(selectedArmyId)
    val tapProvince by rememberUpdatedState(onProvinceTap)
    val tapArmy by rememberUpdatedState(onArmyTap)

    LaunchedEffect(assets) {
        if (assets != null) camera.bounds = MapGeometry.imageRect()
    }

    Canvas(
        modifier = modifier
            .onSizeChanged { camera.onViewportChanged(it.toSize()) }
            .pointerInput(camera) {
                detectTransformGestures { centroid, pan, zoom, _ -> camera.transform(centroid, pan, zoom) }
            }
            .pointerInput(camera) {
                detectTapGestures { tap ->
                    val minHitPx = 24.dp.toPx()
                    // Army stacks sit on top of tokens, so they win ties (last drawn first).
                    val badge = currentBadges.lastOrNull { b ->
                        (camera.worldToScreen(b.center) - tap).getDistance() <= max(b.hitRadius * camera.scale, minHitPx * 0.8f)
                    }
                    if (badge != null) {
                        val i = badge.armies.indexOfFirst { it.id == currentSelectedArmy }
                        tapArmy(badge.armies[(i + 1) % badge.armies.size].id)
                        return@detectTapGestures
                    }
                    val world = camera.screenToWorld(tap)
                    val hitRadius = max(MapMetrics.PROVINCE_HIT_RADIUS, minHitPx / camera.scale)
                    currentProvinces
                        .minByOrNull { distanceSq(it, world) }
                        ?.takeIf { distanceSq(it, world) <= hitRadius * hitRadius }
                        ?.let { tapProvince(it.id) }
                }
            },
    ) {
        drawRect(Ink900)
        if (assets == null || camera.viewport == Size.Zero) return@Canvas

        drawBoard(assets.board, camera)

        val visible = camera.visibleWorld.inflate(10f)
        val k = camera.scale
        val onScreen = state.provinces.filter { visible.contains(it.centerOffset()) }

        // Pass 1: tokens and highlights
        for (p in onScreen) {
            drawToken(
                p = p,
                c = camera.worldToScreen(p.centerOffset()),
                k = k,
                selected = p.id == selectedProvinceId,
                highlight = when (p.id) {
                    in attackTargets -> AttackRed
                    in moveTargets -> MoveGreen
                    else -> null
                },
                pulse = pulse,
            )
        }
        // Pass 2: structures and resources above all tokens
        for (p in onScreen) {
            drawProvinceDecor(p, camera.worldToScreen(p.centerOffset()), k, state.buildingsIn(p.id), assets)
        }
        // Pass 3: army stacks
        for (b in badges) {
            if (!visible.contains(b.center)) continue
            drawArmyBadge(b, camera.worldToScreen(b.center), k, b.armies.any { it.id == selectedArmyId }, pulse, assets, textMeasurer)
        }
        // Pass 4: province names on a dark tab just under each token, once zoomed in enough to read
        if (camera.zoom >= 1.8f) {
            val targetPx = (0.75f * S * k).coerceIn(9.sp.toPx(), 14.sp.toPx())
            val factor = targetPx / LABEL_BASE_SP.sp.toPx()
            for (p in onScreen) {
                val label = nameLabels[p.id] ?: continue
                val c = camera.worldToScreen(p.centerOffset())
                val top = c.y + MapMetrics.tokenRadius(p) * k + 0.25f * S * k
                val w = label.size.width * factor
                val h = label.size.height * factor
                val pad = h * 0.3f
                drawRoundRect(
                    LabelTab,
                    topLeft = Offset(c.x - w / 2 - pad, top),
                    size = Size(w + pad * 2, h),
                    cornerRadius = CornerRadius(h / 2),
                )
                drawScaledText(label, Offset(c.x, top), factor)
            }
        }
    }
}

private fun Province.centerOffset() = MapGeometry.projectPoint(Offset(center.x.toFloat(), center.y.toFloat()))

private fun distanceSq(p: Province, world: Offset): Float {
    val center = p.centerOffset()
    val dx = center.x - world.x
    val dy = center.y - world.y
    return dx * dx + dy * dy
}

/** Draws the visible portion of the complete board image, mapped through the camera. */
private fun DrawScope.drawBoard(board: ImageBitmap, camera: MapCameraState) {
    val imageRect = MapGeometry.imageRect()
    val visible = camera.visibleWorld.intersect(imageRect)
    if (visible.width <= 0f || visible.height <= 0f) return
    val pxPerUnitX = board.width / imageRect.width
    val pxPerUnitY = board.height / imageRect.height
    val srcLeft = floor((visible.left - imageRect.left) * pxPerUnitX).toInt().coerceIn(0, board.width - 1)
    val srcTop = floor((visible.top - imageRect.top) * pxPerUnitY).toInt().coerceIn(0, board.height - 1)
    val srcRight = ceil((visible.right - imageRect.left) * pxPerUnitX).toInt().coerceIn(srcLeft + 1, board.width)
    val srcBottom = ceil((visible.bottom - imageRect.top) * pxPerUnitY).toInt().coerceIn(srcTop + 1, board.height)
    val topLeft = camera.worldToScreen(Offset(imageRect.left + srcLeft / pxPerUnitX, imageRect.top + srcTop / pxPerUnitY))
    val bottomRight = camera.worldToScreen(Offset(imageRect.left + srcRight / pxPerUnitX, imageRect.top + srcBottom / pxPerUnitY))
    drawImage(
        image = board,
        srcOffset = IntOffset(srcLeft, srcTop),
        srcSize = IntSize(srcRight - srcLeft, srcBottom - srcTop),
        dstOffset = IntOffset(topLeft.x.roundToInt(), topLeft.y.roundToInt()),
        dstSize = IntSize((bottomRight.x - topLeft.x).roundToInt(), (bottomRight.y - topLeft.y).roundToInt()),
        filterQuality = FilterQuality.Medium,
    )
    // Soft vignette pulls the eye to the centre of the board.
    drawRect(
        Brush.radialGradient(
            listOf(Color.Transparent, Ink900.copy(alpha = 0.45f)),
            center = Offset(size.width / 2f, size.height / 2f),
            radius = max(size.width, size.height) * 0.75f,
        ),
    )
}

private fun DrawScope.drawToken(p: Province, c: Offset, k: Float, selected: Boolean, highlight: Color?, pulse: Float) {
    val r = MapMetrics.tokenRadius(p) * k
    if (highlight != null) {
        drawCircle(highlight.copy(alpha = 0.22f), radius = r + 1.4f * S * k, center = c)
    }
    drawCircle(Color.Black.copy(alpha = 0.4f), radius = r, center = c + Offset(0.3f * S * k, 0.3f * S * k))
    drawCircle(FactionStyle.color(p.ownerId), radius = r, center = c, alpha = 0.92f)
    // Soft top-left sheen so tokens read as raised discs rather than flat dots.
    drawCircle(Color.White.copy(alpha = 0.16f), radius = r * 0.55f, center = c + Offset(-r * 0.22f, -r * 0.22f))
    val (edge, edgeWidth) = when {
        selected -> SelectGold to 0.6f * S
        highlight != null -> highlight to 0.45f * S
        else -> TokenEdge to 0.3f * S
    }
    drawCircle(edge, radius = r, center = c, style = Stroke(edgeWidth * k))
    drawCircle(Color.White.copy(alpha = 0.3f), radius = r * 0.6f, center = c, style = Stroke(0.15f * S * k))
    if (selected) {
        drawCircle(SelectGold.copy(alpha = pulse), radius = r + 0.8f * S * k, center = c, style = Stroke(0.28f * S * k))
    }
    if (p.isCapital) {
        val w = 1.9f * S * k
        drawGlyph(MapGlyphs.crown, Rect(c.x - w / 2, c.y - w * 0.5f, c.x + w / 2, c.y + w * 0.4f), SelectGold, TokenEdge, 0.12f * S * k)
    } else if (p.garrison > 0) {
        val w = 1.3f * S * k
        drawGlyph(MapGlyphs.shield, Rect(c.x - w / 2, c.y - w / 2, c.x + w / 2, c.y + w / 2), Color.White, TokenEdge, 0.1f * S * k)
    }
    if (p.hasSilkRoad) {
        val sc = c + Offset(r * 0.6f, r * 0.6f)
        drawCircle(SilkAmber, radius = 0.5f * S * k, center = sc)
        drawCircle(SilkEdge, radius = 0.5f * S * k, center = sc, style = Stroke(0.1f * S * k))
    }
}

private fun DrawScope.drawProvinceDecor(p: Province, c: Offset, k: Float, buildings: List<BuildingType>, assets: MapAssets) {
    val r = MapMetrics.tokenRadius(p) * k
    if (p.fortLevel > 0) {
        val h = (2.9f + p.fortLevel * 0.35f) * S * k
        val w = (4.3f + p.fortLevel * 0.5f) * S * k
        val left = c.x - 2.9f * S * k
        val top = c.y - r - h + 0.2f * k
        drawSprite(assets.sprite(FactionStyle.fortSprite(p.ownerId)), Rect(left, top, left + w, top + h), bottomAligned = true)
    }
    if (BuildingType.CAMP in buildings) {
        val left = c.x - r - 4.6f * S * k
        val top = c.y - r * 0.4f
        drawSprite(assets.sprite(FactionStyle.campSprite(p.ownerId)), Rect(left, top, left + 4.6f * S * k, top + 3f * S * k), bottomAligned = true)
    }
    if (BuildingType.BRIDGE in buildings) {
        val left = c.x + r * 0.55f
        val top = c.y + r * 0.25f
        drawSprite(assets.sprite(FactionStyle.bridgeSprite(p.ownerId)), Rect(left, top, left + 4.4f * S * k, top + 2.5f * S * k))
    }
    p.tradeGood?.let { good ->
        val left = c.x - r - 2f * S * k
        val top = c.y - r - 1.4f * S * k
        drawSprite(assets.sprite(FactionStyle.resourceSprite(good)), Rect(left, top, left + 2f * S * k, top + 2.8f * S * k))
    }
}

private fun DrawScope.drawArmyBadge(
    b: ArmyBadge,
    c: Offset,
    k: Float,
    selected: Boolean,
    pulse: Float,
    assets: MapAssets,
    textMeasurer: TextMeasurer,
) {
    val w = b.spriteWidth * k
    val h = b.spriteHeight * k
    val color = FactionStyle.color(b.owner)

    // Faction-coloured aura behind the figure
    val aura = Size(w * 0.92f, h * 0.88f)
    drawOval(color.copy(alpha = 0.35f), topLeft = c - Offset(aura.width / 2, aura.height / 2), size = aura)
    drawOval(
        if (selected) SelectGold.copy(alpha = pulse) else color,
        topLeft = c - Offset(aura.width / 2, aura.height / 2),
        size = aura,
        style = Stroke((if (selected) 0.35f else 0.15f) * S * k),
    )

    val sprite = when (b.kind) {
        BadgeKind.LEADER -> FactionStyle.leaderSprite(b.owner)
        BadgeKind.CAVALRY -> FactionStyle.cavalrySprite(b.owner)
        BadgeKind.INFANTRY -> FactionStyle.infantrySprite(b.owner)
    }
    drawSprite(assets.sprite(sprite), Rect(c.x - w / 2, c.y - h / 2, c.x + w / 2, c.y + h / 2))

    if (b.hasChief) {
        val cw = 1.5f * S * k
        val top = c.y - h * 0.42f - cw * 0.8f
        drawGlyph(MapGlyphs.crown, Rect(c.x - cw / 2, top, c.x + cw / 2, top + cw * 0.8f), SelectGold, TokenEdge, 0.1f * S * k)
    }

    drawUnitPill(b, Offset(c.x, c.y + h * 0.5f + 0.1f * S * k), k, color, textMeasurer)

    if (b.isPlayer) {
        val dot = c + Offset(w * 0.42f, -h * 0.42f)
        drawCircle(MoveStateColors.getValue(b.moveState), radius = 0.4f * S * k, center = dot)
        drawCircle(TokenEdge, radius = 0.4f * S * k, center = dot, style = Stroke(0.1f * S * k))
    }
    if (b.armies.size > 1) {
        val at = c + Offset(-w * 0.42f, -h * 0.38f)
        val rr = 0.55f * S * k
        drawCircle(TokenEdge, radius = rr, center = at)
        drawCircle(SelectGold, radius = rr, center = at, style = Stroke(0.08f * S * k))
        val count = textMeasurer.measure(b.armies.size.toString(), TextStyle(color = SelectGold, fontSize = 10.sp, fontWeight = FontWeight.Bold))
        // Text fills ~70% of the circle's height, centred on it.
        drawScaledText(count, Offset(at.x, at.y - rr * 0.7f), rr * 1.4f / count.size.height)
    }
}

/** "[horseshoe] 12  [sword] 8" pill under an army figure. */
private fun DrawScope.drawUnitPill(b: ArmyBadge, topCenter: Offset, k: Float, edge: Color, textMeasurer: TextMeasurer) {
    val parts = buildList {
        if (b.cavalry > 0) add(MapGlyphs.horseshoe to b.cavalry)
        if (b.infantry > 0) add(MapGlyphs.sword to b.infantry)
    }
    if (parts.isEmpty()) return
    val pillH = 1.5f * S * k
    val glyph = pillH * 0.62f
    val gap = pillH * 0.18f
    val style = TextStyle(color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    val texts = parts.map { textMeasurer.measure(it.second.toString(), style) }
    val textScale = pillH * 0.7f / texts.first().size.height
    val contentW = parts.indices.sumOf { (glyph + gap + texts[it].size.width * textScale).toDouble() }.toFloat() +
        gap * 2 * (parts.size - 1)
    val pillW = contentW + pillH * 0.6f
    val left = topCenter.x - pillW / 2
    drawRoundRect(PillInk, Offset(left, topCenter.y), Size(pillW, pillH), CornerRadius(pillH / 2))
    drawRoundRect(edge, Offset(left, topCenter.y), Size(pillW, pillH), CornerRadius(pillH / 2), style = Stroke(0.12f * S * k))
    var x = left + pillH * 0.3f
    val midY = topCenter.y + pillH / 2
    parts.forEachIndexed { i, (path, _) ->
        drawGlyph(path, Rect(x, midY - glyph / 2, x + glyph, midY + glyph / 2), Color.White)
        x += glyph + gap
        val t = texts[i]
        drawScaledText(t, Offset(x + t.size.width * textScale / 2, midY - t.size.height * textScale / 2), textScale)
        x += t.size.width * textScale + gap * 2
    }
}

/** Draws [layout] scaled by [factor], horizontally centred on [topCenter]. */
private fun DrawScope.drawScaledText(layout: TextLayoutResult, topCenter: Offset, factor: Float) {
    val topLeft = Offset(topCenter.x - layout.size.width * factor / 2, topCenter.y)
    scale(factor, factor, pivot = topLeft) {
        drawText(layout, topLeft = topLeft)
    }
}

/** Fits [image] inside [box] keeping its aspect ratio (SVG "meet"). */
private fun DrawScope.drawSprite(image: ImageBitmap, box: Rect, bottomAligned: Boolean = false) {
    val fit = min(box.width / image.width, box.height / image.height)
    val w = image.width * fit
    val h = image.height * fit
    if (w < 1f || h < 1f) return
    val x = box.left + (box.width - w) / 2
    val y = if (bottomAligned) box.bottom - h else box.top + (box.height - h) / 2
    drawImage(
        image = image,
        dstOffset = IntOffset(x.roundToInt(), y.roundToInt()),
        dstSize = IntSize(w.roundToInt(), h.roundToInt()),
        filterQuality = FilterQuality.Medium,
    )
}
