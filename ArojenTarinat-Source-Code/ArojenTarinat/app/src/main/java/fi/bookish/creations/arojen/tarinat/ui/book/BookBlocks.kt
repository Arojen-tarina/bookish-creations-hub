package fi.bookish.creations.arojen.tarinat.ui.book

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Cinzel
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink600
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

private val BOLD = Regex("""\*\*(.+?)\*\*""")
private val BoldStyle = SpanStyle(fontWeight = FontWeight.Bold, color = GoldBright)
private val MatchStyle = SpanStyle(background = Gold.copy(alpha = 0.38f), color = TextHigh)

/** Turns **bold** markers into styled spans and highlights every match of [query]. */
fun bookText(text: String, query: String = ""): AnnotatedString {
    val plain = StringBuilder()
    val bold = mutableListOf<IntRange>()
    var last = 0
    for (m in BOLD.findAll(text)) {
        plain.append(text, last, m.range.first)
        val start = plain.length
        plain.append(m.groupValues[1])
        bold += start until plain.length
        last = m.range.last + 1
    }
    plain.append(text, last, text.length)
    return buildAnnotatedString {
        append(plain)
        bold.forEach { addStyle(BoldStyle, it.first, it.last + 1) }
        val q = query.trim()
        if (q.isNotEmpty()) {
            var i = plain.indexOf(q, ignoreCase = true)
            while (i >= 0) {
                addStyle(MatchStyle, i, i + q.length)
                i = plain.indexOf(q, i + q.length, ignoreCase = true)
            }
        }
    }
}

@Composable
private fun rememberBookText(text: String, query: String) = remember(text, query) { bookText(text, query) }

/** Vector icon for a card picture key written by dump-books.ts. */
fun bookIcon(key: String?): ImageVector? = when (key) {
    null -> null
    "paw" -> GameIcons.Paw
    "swords" -> GameIcons.Swords
    "sword" -> GameIcons.Sword
    "compass" -> GameIcons.Compass
    "temple" -> GameIcons.Temple
    "feather" -> GameIcons.Feather
    "horseshoe" -> GameIcons.Horseshoe
    "crown" -> GameIcons.Crown
    "people" -> GameIcons.People
    "shield" -> GameIcons.Shield
    "hammer" -> GameIcons.Hammer
    "castle" -> GameIcons.Castle
    "bridge" -> GameIcons.Bridge
    "mountain" -> GameIcons.Mountain
    "leaf" -> GameIcons.Leaf
    else -> GameIcons.Scroll
}

@Composable
fun BookBlockView(block: BookBlock, query: String, modifier: Modifier = Modifier) {
    when (block) {
        is BookBlock.Para -> ParaView(block, query, modifier)
        is BookBlock.Quote -> QuoteView(block.text, query, modifier)
        is BookBlock.Cards -> CardsView(block, query, modifier)
        is BookBlock.Table -> TableView(block, query, modifier)
    }
}

@Composable
private fun ParaView(para: BookBlock.Para, query: String, modifier: Modifier) {
    Row(modifier.fillMaxWidth()) {
        if (para.n != null) {
            Text(
                ltr("§ ${para.n}"),
                style = MaterialTheme.typography.titleSmall.copy(fontFamily = Cinzel),
                color = Gold,
                modifier = Modifier.width(56.dp).padding(top = 2.dp),
            )
        }
        Text(rememberBookText(para.text, query), style = MaterialTheme.typography.bodyLarge, color = TextHigh.copy(alpha = 0.92f))
    }
}

@Composable
fun QuoteView(text: String, query: String, modifier: Modifier = Modifier) {
    val shape = RoundedCornerShape(topEnd = 10.dp, bottomEnd = 10.dp)
    Row(modifier.fillMaxWidth().height(IntrinsicSize.Min).clip(shape).background(Gold.copy(alpha = 0.08f))) {
        Box(Modifier.width(3.dp).fillMaxHeight().background(Gold.copy(alpha = 0.6f)))
        Text(
            rememberBookText(text, query),
            style = MaterialTheme.typography.titleMedium.copy(fontStyle = FontStyle.Italic, fontWeight = FontWeight.Normal, lineHeight = 22.sp),
            color = GoldBright.copy(alpha = 0.92f),
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )
    }
}

@Composable
private fun CardsView(cards: BookBlock.Cards, query: String, modifier: Modifier) {
    if (cards.style == CardStyle.TIMELINE) {
        Timeline(cards.items, query, modifier)
        return
    }
    val columns = when (cards.style) {
        CardStyle.GRID -> 2
        CardStyle.TILES -> 3
        else -> 1
    }
    Column(modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        cards.items.chunked(columns).forEach { row ->
            Row(Modifier.height(IntrinsicSize.Max), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { card ->
                    val cardModifier = Modifier.weight(1f).fillMaxHeight()
                    if (cards.style == CardStyle.TILES) TileCard(card, query, cardModifier) else BookCardView(card, query, large = cards.style == CardStyle.LIST, modifier = cardModifier)
                }
                repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}

private val CardShape = RoundedCornerShape(12.dp)

private fun Modifier.cardSurface() =
    clip(CardShape).background(Ink900.copy(alpha = 0.55f)).border(1.dp, Gold.copy(alpha = 0.25f), CardShape)

@Composable
private fun IconMedallion(icon: ImageVector, size: Dp) {
    Box(
        Modifier.size(size).clip(CircleShape).background(Gold.copy(alpha = 0.12f)).border(1.dp, Gold.copy(alpha = 0.4f), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, null, tint = GoldBright, modifier = Modifier.size(size * 0.52f))
    }
}

@Composable
private fun BookCardView(card: BookCard, query: String, large: Boolean, modifier: Modifier) {
    Column(modifier.cardSurface().padding(14.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            bookIcon(card.icon)?.let {
                IconMedallion(it, if (large) 46.dp else 36.dp)
                Spacer(Modifier.width(12.dp))
            }
            Column(Modifier.weight(1f)) {
                card.kicker?.let { Text(it, style = MaterialTheme.typography.labelSmall, color = Gold.copy(alpha = 0.75f)) }
                Text(
                    rememberBookText(card.title, query),
                    style = if (large) MaterialTheme.typography.headlineSmall else MaterialTheme.typography.titleMedium,
                    color = GoldBright,
                )
                card.subtitle?.let { Text(rememberBookText(it, query), style = MaterialTheme.typography.labelMedium, color = Gold.copy(alpha = 0.7f)) }
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(rememberBookText(card.text, query), style = MaterialTheme.typography.bodyMedium, color = TextMid)
    }
}

@Composable
private fun TileCard(card: BookCard, query: String, modifier: Modifier) {
    Column(modifier.cardSurface().padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        bookIcon(card.icon)?.let {
            IconMedallion(it, 44.dp)
            Spacer(Modifier.height(10.dp))
        }
        Text(rememberBookText(card.title, query), style = MaterialTheme.typography.titleMedium, color = GoldBright, textAlign = TextAlign.Center)
        Spacer(Modifier.height(6.dp))
        Text(rememberBookText(card.text, query), style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
    }
}

/** Eras: a gold line with a dot per entry. */
@Composable
private fun Timeline(items: List<BookCard>, query: String, modifier: Modifier) {
    Column(modifier.fillMaxWidth()) {
        items.forEachIndexed { i, item ->
            val lastItem = i == items.lastIndex
            Row(Modifier.height(IntrinsicSize.Min)) {
                Box(Modifier.width(20.dp).fillMaxHeight()) {
                    Box(
                        Modifier
                            .align(Alignment.TopCenter)
                            .width(2.dp)
                            .then(if (lastItem) Modifier.height(10.dp) else Modifier.fillMaxHeight())
                            .background(Gold.copy(alpha = 0.35f)),
                    )
                    Box(
                        Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 3.dp)
                            .size(13.dp)
                            .clip(CircleShape)
                            .background(Ink900)
                            .border(2.dp, Gold, CircleShape),
                    )
                }
                Column(Modifier.weight(1f).padding(start = 12.dp, bottom = if (lastItem) 0.dp else 18.dp)) {
                    item.kicker?.let { Text(it, style = MaterialTheme.typography.labelSmall, color = Gold.copy(alpha = 0.75f)) }
                    Text(rememberBookText(item.title, query), style = MaterialTheme.typography.titleMedium, color = TextHigh)
                    Spacer(Modifier.height(4.dp))
                    Text(rememberBookText(item.text, query), style = MaterialTheme.typography.bodyMedium, color = TextMid)
                }
            }
        }
    }
}

/** Rough text width so table columns line up without measuring every cell. */
private fun estimateWidth(text: String): Dp {
    val units = text.sumOf { c -> if (c.code >= 0x2E80) 1.9 else 1.0 }
    return (units * 7.4).dp
}

@Composable
private fun TableView(table: BookBlock.Table, query: String, modifier: Modifier) {
    val shape = RoundedCornerShape(10.dp)
    BoxWithConstraints(modifier.fillMaxWidth().clip(shape).border(1.dp, Ink500, shape)) {
        val natural = remember(table) {
            table.head.indices.map { j ->
                val longest = (listOf(table.head[j]) + table.rows.mapNotNull { it.getOrNull(j) }).maxOf { estimateWidth(it) }
                (longest + 22.dp).coerceIn(64.dp, 240.dp)
            }
        }
        // Stretch narrow tables to the pane; wide ones scroll sideways.
        val total = natural.fold(0.dp) { acc, w -> acc + w }
        val stretch = if (total < maxWidth) maxWidth / total else 1f
        val widths = natural.map { it * stretch }
        Column(Modifier.horizontalScroll(rememberScrollState())) {
            Row(Modifier.background(Ink600)) {
                table.head.forEachIndexed { j, h ->
                    Text(
                        h,
                        style = MaterialTheme.typography.labelMedium,
                        color = GoldBright,
                        modifier = Modifier.width(widths[j]).padding(horizontal = 10.dp, vertical = 9.dp),
                    )
                }
            }
            table.rows.forEachIndexed { i, row ->
                Row(Modifier.background(if (i % 2 == 0) Ink900.copy(alpha = 0.6f) else Ink700.copy(alpha = 0.6f))) {
                    row.forEachIndexed { j, cell ->
                        Text(
                            rememberBookText(cell, query),
                            style = MaterialTheme.typography.bodySmall,
                            color = TextHigh.copy(alpha = 0.9f),
                            modifier = Modifier.width(widths.getOrElse(j) { 64.dp }).padding(horizontal = 10.dp, vertical = 8.dp),
                        )
                    }
                }
            }
        }
    }
}
