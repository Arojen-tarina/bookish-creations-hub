package fi.bookish.creations.arojen.tarinat.ui.book

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import fi.bookish.creations.arojen.tarinat.ui.components.assetLanguage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * The game's two books, generated from the original pages by tools/parity
 * (dump-books.ts) into assets/i18n/<folder>/<lang>.json.
 */
enum class BookKind(val folder: String) { CODEX("codex"), RULEBOOK("rulebook") }

@Serializable
data class Book(
    val title: String,
    val subtitle: String,
    val eyebrow: String? = null,
    val tagline: String? = null,
    val quote: String? = null,
    /** Word shown before a chapter numeral ("Chapter IV"); null for the codex. */
    val chapterLabel: String? = null,
    val searchHint: String? = null,
    val chapters: List<BookChapter>,
)

@Serializable
data class BookChapter(
    val id: String,
    val numeral: String,
    val title: String,
    val subtitle: String? = null,
    /** Longer title shown above the chapter text, when it differs from [title]. */
    val heading: String? = null,
    val blocks: List<BookBlock>,
)

/** Texts may carry **bold** markers. */
@Serializable
sealed interface BookBlock {
    /** A paragraph; [n] is the rulebook article number ("4.2"). */
    @Serializable
    @SerialName("para")
    data class Para(val text: String, val n: String? = null) : BookBlock

    @Serializable
    @SerialName("quote")
    data class Quote(val text: String) : BookBlock

    @Serializable
    @SerialName("cards")
    data class Cards(val style: CardStyle, val items: List<BookCard>) : BookBlock

    @Serializable
    @SerialName("table")
    data class Table(val head: List<String>, val rows: List<List<String>>) : BookBlock
}

@Serializable
enum class CardStyle {
    @SerialName("grid") GRID,
    @SerialName("tiles") TILES,
    @SerialName("list") LIST,
    @SerialName("timeline") TIMELINE,
}

@Serializable
data class BookCard(
    val title: String,
    val text: String,
    val subtitle: String? = null,
    val kicker: String? = null,
    /** Picture key, mapped to a vector icon by [bookIcon]. */
    val icon: String? = null,
)

/** True when the chapter's title or any of its text contains [query]. */
fun BookChapter.matches(query: String): Boolean {
    if (query.isBlank()) return true
    if (title.contains(query, ignoreCase = true)) return true
    return blocks.any { it.matches(query) }
}

fun BookBlock.matches(query: String): Boolean = when (this) {
    is BookBlock.Para -> text.contains(query, ignoreCase = true)
    is BookBlock.Quote -> text.contains(query, ignoreCase = true)
    is BookBlock.Cards -> items.any { card ->
        listOfNotNull(card.title, card.text, card.subtitle, card.kicker).any { it.contains(query, ignoreCase = true) }
    }
    is BookBlock.Table -> (head + rows.flatten()).any { it.contains(query, ignoreCase = true) }
}

private val json = Json { ignoreUnknownKeys = true }
private val cache = HashMap<String, Book>()

private fun loadBook(context: Context, kind: BookKind, language: String): Book = synchronized(cache) {
    val path = "i18n/${kind.folder}/${assetLanguage(language)}.json"
    cache.getOrPut(path) {
        context.assets.open(path).bufferedReader().use { json.decodeFromString(it.readText()) }
    }
}

/** The book in the current UI language; null while it loads. */
@Composable
fun rememberBook(kind: BookKind): Book? {
    val context = LocalContext.current
    val language = LocalConfiguration.current.locales[0].language
    val book by produceState<Book?>(null, kind, language) {
        value = withContext(Dispatchers.IO) { loadBook(context.applicationContext, kind, language) }
    }
    return book
}
