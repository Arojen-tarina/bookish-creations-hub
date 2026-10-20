package fi.bookish.creations.arojen.tarinat.ui.game.cards

import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.Card
import fi.bookish.creations.arojen.tarinat.game.model.CardEffectType
import fi.bookish.creations.arojen.tarinat.game.model.CardType
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Rarity
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.WordFitText
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.HudIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink800
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

val CardType.color: Color
    get() = when (this) {
        CardType.STRATEGY -> Color(0xFFDC2626)
        CardType.DIPLOMACY -> Color(0xFF2563EB)
        CardType.TECHNOLOGY -> Color(0xFF16A34A)
        CardType.RESOURCE -> Color(0xFFD97706)
    }

private val Rarity?.gemColor: Color
    get() = when (this) {
        Rarity.UNCOMMON -> Color(0xFF22C55E)
        Rarity.RARE -> Color(0xFF3B82F6)
        Rarity.LEGENDARY -> Color(0xFFA855F7)
        Rarity.COMMON, null -> Color(0xFF9CA3AF)
    }

/** Icon standing in for artwork on the fallback face, chosen by what the card does. */
@Composable
private fun EffectIcon(type: CardEffectType, tint: Color, modifier: Modifier) {
    val sprite = when (type) {
        CardEffectType.GOLD -> R.drawable.sprite_res_gold
        CardEffectType.FOOD -> R.drawable.sprite_res_food
        CardEffectType.HORSES -> R.drawable.sprite_res_horse
        else -> null
    }
    if (sprite != null) {
        Image(painterResource(sprite), null, modifier)
        return
    }
    val icon = when (type) {
        CardEffectType.ATTACK_BONUS, CardEffectType.PERMANENT_ATTACK -> GameIcons.Swords
        CardEffectType.DEFENSE_BONUS, CardEffectType.PERMANENT_DEFENSE -> GameIcons.Shield
        CardEffectType.MOVEMENT_BONUS, CardEffectType.TERRAIN_IGNORE -> GameIcons.Boot
        CardEffectType.ARTISANS -> GameIcons.Hammer
        CardEffectType.DRAW_CARDS -> GameIcons.Cards
        CardEffectType.MORALE -> GameIcons.Flag
        CardEffectType.RECRUIT_FREE -> GameIcons.People
        else -> GameIcons.Cards
    }
    Icon(icon, null, modifier, tint = tint)
}

/** One to three diamonds for common..rare, a four-point star for legendary. */
@Composable
private fun RarityGems(rarity: Rarity?, modifier: Modifier = Modifier) {
    val count = when (rarity) { Rarity.UNCOMMON -> 2; Rarity.RARE -> 3; Rarity.LEGENDARY -> 1; else -> 1 }
    val color = rarity.gemColor
    Canvas(modifier.size(width = (count * 9).dp, height = 10.dp)) {
        val w = size.height
        for (i in 0 until count) {
            val cx = w / 2 + i * w * 0.9f
            val cy = size.height / 2
            val r = if (rarity == Rarity.LEGENDARY) w * 0.55f else w * 0.45f
            val inner = if (rarity == Rarity.LEGENDARY) r * 0.38f else r
            val path = Path().apply {
                moveTo(cx, cy - r)
                lineTo(cx + inner * 0.7f, cy - inner * 0.7f)
                lineTo(cx + r, cy)
                lineTo(cx + inner * 0.7f, cy + inner * 0.7f)
                lineTo(cx, cy + r)
                lineTo(cx - inner * 0.7f, cy + inner * 0.7f)
                lineTo(cx - r, cy)
                lineTo(cx - inner * 0.7f, cy - inner * 0.7f)
                close()
            }
            drawPath(path, color)
            drawPath(path, Color.Black.copy(alpha = 0.6f), style = Stroke(1f))
        }
    }
}

/** Card face: art (or a coloured fallback with an effect icon), name, rarity and the short effect line. */
@Composable
fun CardFace(card: Card, text: CardText?, width: Dp, modifier: Modifier = Modifier, onClick: (() -> Unit)? = null) {
    val frame = card.type.color
    val shape = RoundedCornerShape(10.dp)
    val art = rememberCardArt(card.id)
    Column(
        modifier
            .width(width)
            .clip(shape)
            .background(Ink900)
            .border(2.dp, frame.copy(alpha = 0.85f), shape)
            .then(if (onClick != null) Modifier.clickable(role = Role.Button, onClick = onClick) else Modifier),
    ) {
        Box(Modifier.fillMaxWidth().aspectRatio(1f)) {
            if (art != null) {
                Image(art, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            } else {
                Box(
                    Modifier.fillMaxSize().background(Brush.radialGradient(listOf(frame.copy(alpha = 0.55f), Ink900))),
                    contentAlignment = Alignment.Center,
                ) {
                    EffectIcon(card.effect.type, GoldBright, Modifier.size(width * 0.42f))
                }
            }
            // Name and rarity share a row, so a long name (Finnish, German) wraps before the gems.
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(listOf(Ink900.copy(alpha = 0.92f), Color.Transparent)))
                    .padding(start = 6.dp, end = 4.dp, top = 4.dp, bottom = 10.dp),
            ) {
                WordFitText(
                    text?.n.orEmpty(),
                    MaterialTheme.typography.labelMedium.copy(fontSize = (width.value / 8.5f).coerceIn(10f, 15f).sp),
                    TextHigh,
                    Modifier.weight(1f),
                )
                RarityGems(card.rarity, Modifier.padding(start = 2.dp))
            }
        }
        Text(
            text?.s.orEmpty(),
            style = MaterialTheme.typography.labelSmall.copy(fontSize = (width.value / 9.5f).coerceIn(9f, 13f).sp),
            color = GoldBright,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier
                .fillMaxWidth()
                .background(frame.copy(alpha = 0.22f))
                .heightIn(min = 30.dp)
                .padding(horizontal = 4.dp, vertical = 4.dp),
        )
    }
}

/** Bottom-left hand of cards: a compact pill when collapsed, a scrolling row when open. */
@Composable
fun CardTray(
    game: GameState,
    texts: Map<String, CardText>,
    expanded: Boolean,
    onToggle: () -> Unit,
    onCardClick: (Card) -> Unit,
    modifier: Modifier = Modifier,
) {
    AnimatedContent(expanded, modifier, label = "tray") { open ->
        if (!open) {
            Row(
                Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(Ink800.copy(alpha = 0.94f))
                    .border(1.dp, Gold.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
                    .clickable(role = Role.Button, onClick = onToggle)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(GameIcons.Cards, null, tint = GoldBright, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.cards_hand_count, game.hand.size), style = MaterialTheme.typography.labelLarge, color = TextHigh)
            }
        } else {
            GamePanel(Modifier.fillMaxWidth()) {
                Row(Modifier.fillMaxWidth().padding(start = 12.dp, end = 6.dp, top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(GameIcons.Cards, null, tint = GoldBright, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(R.string.cards_hand_count, game.hand.size), style = MaterialTheme.typography.labelLarge, color = TextHigh)
                    Spacer(Modifier.width(10.dp))
                    Text(
                        stringResource(R.string.cards_deck_discard, game.deck.size, game.discard.size),
                        style = MaterialTheme.typography.labelSmall,
                        color = TextLow,
                        modifier = Modifier.weight(1f),
                    )
                    HudIconButton(GameIcons.Close, stringResource(R.string.cards_hide_hand), onToggle, size = 30.dp)
                }
                if (game.hand.isEmpty()) {
                    Text(
                        stringResource(R.string.cards_none),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextMid,
                        modifier = Modifier.padding(16.dp),
                    )
                } else {
                    LazyRow(
                        contentPadding = PaddingValues(10.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(game.hand, key = { it.id }) { card ->
                            CardFace(card, texts[card.id], 96.dp, onClick = { onCardClick(card) })
                        }
                    }
                }
            }
        }
    }
}

/** Large view of one card with its full text and a Play button. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CardDetailDialog(card: Card, text: CardText?, onPlay: () -> Unit, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        GamePanel(Modifier.width(520.dp), alpha = 0.98f) {
            Row(Modifier.padding(16.dp)) {
                CardFace(card, text, 170.dp)
                Spacer(Modifier.width(16.dp))
                Column(Modifier.weight(1f).heightIn(max = 300.dp).verticalScroll(rememberScrollState())) {
                    Text(text?.n.orEmpty(), style = MaterialTheme.typography.headlineSmall, color = GoldBright)
                    Spacer(Modifier.height(4.dp))
                    // Wraps between words instead of breaking "Uncommon" mid-word on narrow dialogs.
                    FlowRow(verticalArrangement = Arrangement.Center) {
                        Text(stringResource(card.type.nameRes), style = MaterialTheme.typography.labelMedium, color = card.type.color)
                        card.rarity?.let {
                            Text(" · ", style = MaterialTheme.typography.labelMedium, color = TextLow)
                            Text(stringResource(it.nameRes), style = MaterialTheme.typography.labelMedium, color = it.gemColor)
                        }
                    }
                    Spacer(Modifier.height(10.dp))
                    Text(text?.d.orEmpty(), style = MaterialTheme.typography.bodyLarge, color = TextHigh)
                    Spacer(Modifier.height(6.dp))
                    Text(text?.e.orEmpty(), style = MaterialTheme.typography.bodyMedium, color = TextMid)
                    text?.c?.let {
                        Spacer(Modifier.height(6.dp))
                        Text(stringResource(R.string.card_cost, it), style = MaterialTheme.typography.bodySmall, color = TextLow)
                    }
                    Spacer(Modifier.height(12.dp))
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(Ink700)
                            .padding(10.dp),
                    ) {
                        Text(stringResource(R.string.card_effect_now), style = MaterialTheme.typography.labelSmall, color = TextLow)
                        Text(text?.s.orEmpty(), style = MaterialTheme.typography.titleMedium, color = GoldBright, fontWeight = FontWeight.Bold)
                    }
                }
            }
            Row(
                Modifier.fillMaxWidth().padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp, Alignment.End),
            ) {
                GameButton(stringResource(R.string.common_close), onDismiss, style = GameButtonStyle.Secondary)
                GameButton(stringResource(R.string.cards_play), onPlay)
            }
        }
    }
}
