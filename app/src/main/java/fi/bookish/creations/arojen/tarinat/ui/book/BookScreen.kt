package fi.bookish.creations.arojen.tarinat.ui.book

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.exclude
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Cinzel
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/**
 * World chronicle or rulebook: chapter list on the start side, the open chapter
 * on the other. The rulebook can be searched; matches are highlighted.
 */
@Composable
fun BookScreen(
    kind: BookKind,
    onBack: () -> Unit,
    onOpenOther: () -> Unit,
    /** Pinned under the page (the advert). */
    banner: @Composable () -> Unit = {},
) {
    val book = rememberBook(kind)
    BoardBackdrop {
        if (book != null) BookLayout(kind, book, onBack, onOpenOther, banner)
    }
}

@Composable
private fun BookLayout(kind: BookKind, book: Book, onBack: () -> Unit, onOpenOther: () -> Unit, banner: @Composable () -> Unit) {
    // Chapter ids are the same in every language, so the open chapter survives a language switch.
    var selectedId by rememberSaveable { mutableStateOf(book.chapters.first().id) }
    var query by rememberSaveable { mutableStateOf("") }
    val index = book.chapters.indexOfFirst { it.id == selectedId }.coerceAtLeast(0)
    val chapter = book.chapters[index]
    val shown = remember(book, query) { book.chapters.filter { it.matches(query.trim()) } }
    val showCover = index == 0 && book.tagline != null
    val content = rememberLazyListState()
    val focus = LocalFocusManager.current
    // Applied once the newly opened chapter is composed, so the index refers to its items.
    var scrollTarget by remember { mutableStateOf<Int?>(null) }
    LaunchedEffect(chapter.id, scrollTarget) {
        scrollTarget?.let {
            content.scrollToItem(it)
            scrollTarget = null
        }
    }

    fun open(target: BookChapter) {
        focus.clearFocus()
        selectedId = target.id
        // With a search active, open the chapter at its first match.
        val q = query.trim()
        val firstMatch = if (q.isEmpty()) -1 else target.blocks.indexOfFirst { it.matches(q) }
        val leading = if (target == book.chapters.first() && book.tagline != null) 2 else 1
        scrollTarget = if (firstMatch < 0) 0 else firstMatch + leading
    }

    Row(
        Modifier
            .fillMaxSize()
            // The keyboard may cover the chapter list; resizing the whole layout would crush it in landscape.
            .windowInsetsPadding(WindowInsets.safeDrawing.exclude(WindowInsets.ime))
            .padding(12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        GamePanel(Modifier.width(276.dp).fillMaxHeight()) {
            Column(Modifier.fillMaxSize().padding(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    RoundIconButton(GameIcons.Back, stringResource(R.string.common_back), onBack, size = 40.dp)
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) {
                        Text(book.title, style = MaterialTheme.typography.headlineSmall, color = GoldBright, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        Text(book.subtitle, style = MaterialTheme.typography.labelSmall, color = TextLow, maxLines = 2, overflow = TextOverflow.Ellipsis)
                    }
                }
                if (kind == BookKind.RULEBOOK) {
                    SearchField(query, { query = it }, book.searchHint.orEmpty(), Modifier.padding(top = 10.dp))
                }
                Spacer(Modifier.height(8.dp))
                LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    items(shown, key = { it.id }) { ch ->
                        ChapterRow(ch, selected = ch.id == selectedId) { open(ch) }
                    }
                    if (shown.isEmpty()) {
                        item {
                            Text(
                                stringResource(R.string.book_no_matches),
                                style = MaterialTheme.typography.bodySmall,
                                color = TextLow,
                                modifier = Modifier.padding(10.dp),
                            )
                        }
                    }
                }
                Spacer(Modifier.height(8.dp))
                GameButton(
                    text = stringResource(if (kind == BookKind.CODEX) R.string.menu_rulebook else R.string.menu_codex),
                    onClick = onOpenOther,
                    style = GameButtonStyle.Secondary,
                    compact = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
        GamePanel(Modifier.weight(1f).fillMaxHeight()) {
            LazyColumn(
                state = content,
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
                modifier = Modifier.fillMaxWidth().weight(1f),
            ) {
                if (showCover) item(key = "cover") { BookCover(kind, book) }
                item(key = "head-${chapter.id}") { ChapterHeader(chapter, book.chapterLabel) }
                items(chapter.blocks.size, key = { "${chapter.id}-$it" }) { BookBlockView(chapter.blocks[it], query) }
                if (index == book.chapters.lastIndex && book.quote != null) {
                    item(key = "quote") {
                        Column(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            OrnamentDivider(Modifier.widthIn(max = 320.dp))
                            Spacer(Modifier.height(14.dp))
                            Text(
                                book.quote,
                                style = MaterialTheme.typography.titleMedium.copy(fontStyle = FontStyle.Italic),
                                color = Gold.copy(alpha = 0.85f),
                                textAlign = TextAlign.Center,
                            )
                        }
                    }
                }
                item(key = "nav-${chapter.id}") {
                    ChapterFooter(
                        previous = book.chapters.getOrNull(index - 1),
                        next = book.chapters.getOrNull(index + 1),
                        onOpen = ::open,
                    )
                }
            }
            banner()
        }
    }
}

@Composable
private fun SearchField(query: String, onQuery: (String) -> Unit, hint: String, modifier: Modifier = Modifier) {
    val focus = LocalFocusManager.current
    val shape = RoundedCornerShape(10.dp)
    BasicTextField(
        value = query,
        onValueChange = onQuery,
        singleLine = true,
        textStyle = MaterialTheme.typography.bodyMedium.copy(color = TextHigh),
        cursorBrush = SolidColor(Gold),
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
        keyboardActions = KeyboardActions(onSearch = { focus.clearFocus() }),
        modifier = modifier.fillMaxWidth(),
        decorationBox = { field ->
            Row(
                Modifier
                    .clip(shape)
                    .background(Ink900.copy(alpha = 0.7f))
                    .border(1.dp, Gold.copy(alpha = 0.35f), shape)
                    .padding(horizontal = 10.dp, vertical = 9.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(GameIcons.Search, null, tint = TextLow, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(8.dp))
                Box(Modifier.weight(1f)) {
                    if (query.isEmpty()) Text(hint, style = MaterialTheme.typography.bodyMedium, color = TextLow, maxLines = 1)
                    field()
                }
                if (query.isNotEmpty()) {
                    Icon(
                        GameIcons.Close,
                        stringResource(R.string.book_search_clear),
                        tint = TextMid,
                        modifier = Modifier
                            .size(18.dp)
                            .clickable(role = Role.Button) { onQuery("") },
                    )
                }
            }
        },
    )
}

@Composable
private fun ChapterRow(chapter: BookChapter, selected: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(10.dp)
    Row(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (selected) Gold.copy(alpha = 0.16f) else Color.Transparent)
            .border(1.dp, if (selected) Gold.copy(alpha = 0.55f) else Color.Transparent, shape)
            .clickable(role = Role.Tab, onClick = onClick)
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (chapter.numeral.isNotEmpty()) {
            Text(
                chapter.numeral,
                style = MaterialTheme.typography.titleSmall.copy(fontFamily = Cinzel),
                color = Gold.copy(alpha = if (selected) 1f else 0.7f),
                modifier = Modifier.widthIn(min = 42.dp).padding(end = 6.dp),
            )
        }
        Column(Modifier.weight(1f)) {
            Text(chapter.title, style = MaterialTheme.typography.titleSmall, color = if (selected) TextHigh else TextMid)
            chapter.subtitle?.let {
                Text(it, style = MaterialTheme.typography.labelSmall, color = TextLow, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

@Composable
private fun BookCover(kind: BookKind, book: Book) {
    Column(Modifier.fillMaxWidth().padding(bottom = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            Modifier.size(60.dp).clip(CircleShape).background(Gold.copy(alpha = 0.1f)).border(1.dp, Gold.copy(alpha = 0.4f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Icon(if (kind == BookKind.CODEX) GameIcons.Feather else GameIcons.Scroll, null, tint = GoldBright, modifier = Modifier.size(30.dp))
        }
        book.eyebrow?.let {
            Spacer(Modifier.height(10.dp))
            Text(it.uppercase(), style = MaterialTheme.typography.labelMedium.copy(letterSpacing = 4.sp), color = Gold.copy(alpha = 0.7f))
        }
        Spacer(Modifier.height(4.dp))
        Text(book.title, style = MaterialTheme.typography.headlineLarge, color = TextHigh, textAlign = TextAlign.Center)
        Text(book.subtitle, style = MaterialTheme.typography.titleMedium, color = Gold.copy(alpha = 0.85f), textAlign = TextAlign.Center)
        book.tagline?.let {
            Spacer(Modifier.height(12.dp))
            Text(
                it,
                style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic),
                color = TextMid,
                textAlign = TextAlign.Center,
                modifier = Modifier.widthIn(max = 540.dp),
            )
        }
        Spacer(Modifier.height(14.dp))
        OrnamentDivider(Modifier.widthIn(max = 360.dp))
    }
}

@Composable
private fun ChapterHeader(chapter: BookChapter, chapterLabel: String?) {
    val rtl = LocalLayoutDirection.current == LayoutDirection.Rtl
    val fade = listOf(Gold.copy(alpha = 0.6f), Color.Transparent)
    Row(verticalAlignment = Alignment.CenterVertically) {
        // The rulebook names its chapters ("Chapter IV") instead of the large numeral.
        if (chapter.numeral.isNotEmpty() && chapterLabel == null) {
            Text(chapter.numeral, style = MaterialTheme.typography.displayMedium, color = Gold.copy(alpha = 0.35f))
            Spacer(Modifier.width(16.dp))
        }
        Column(Modifier.weight(1f)) {
            chapterLabel?.let {
                Text("$it ${chapter.numeral}", style = MaterialTheme.typography.labelMedium, color = Gold.copy(alpha = 0.75f))
            }
            Box(
                Modifier
                    .padding(vertical = 4.dp)
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(Brush.horizontalGradient(if (rtl) fade.reversed() else fade)),
            )
            Text(chapter.heading ?: chapter.title, style = MaterialTheme.typography.headlineMedium, color = TextHigh)
            chapter.subtitle?.let { Text(it, style = MaterialTheme.typography.labelMedium, color = Gold.copy(alpha = 0.65f)) }
        }
    }
}

@Composable
private fun ChapterFooter(previous: BookChapter?, next: BookChapter?, onOpen: (BookChapter) -> Unit) {
    Row(Modifier.fillMaxWidth().padding(top = 10.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        if (previous != null) FooterLink(previous, stringResource(R.string.book_previous), forward = false, onOpen, Modifier.weight(1f))
        else Spacer(Modifier.weight(1f))
        if (next != null) FooterLink(next, stringResource(R.string.book_next), forward = true, onOpen, Modifier.weight(1f))
        else Spacer(Modifier.weight(1f))
    }
}

@Composable
private fun FooterLink(chapter: BookChapter, label: String, forward: Boolean, onOpen: (BookChapter) -> Unit, modifier: Modifier) {
    val shape = RoundedCornerShape(10.dp)
    Row(
        modifier
            .clip(shape)
            .background(Ink700.copy(alpha = 0.85f))
            .border(1.dp, Gold.copy(alpha = 0.35f), shape)
            .clickable(role = Role.Button) { onOpen(chapter) }
            .padding(horizontal = 12.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = if (forward) Arrangement.End else Arrangement.Start,
    ) {
        if (!forward) {
            Icon(GameIcons.Back, null, tint = Gold, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(10.dp))
        }
        Column(Modifier.weight(1f, fill = false), horizontalAlignment = if (forward) Alignment.End else Alignment.Start) {
            Text(label, style = MaterialTheme.typography.labelSmall, color = TextLow)
            Text(
                if (chapter.numeral.isEmpty()) chapter.title else "${chapter.numeral}. ${chapter.title}",
                style = MaterialTheme.typography.titleSmall,
                color = GoldBright,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        if (forward) {
            Spacer(Modifier.width(10.dp))
            Icon(GameIcons.Back, null, tint = Gold, modifier = Modifier.size(18.dp).rotate(180f))
        }
    }
}
