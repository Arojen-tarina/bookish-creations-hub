package fi.bookish.creations.arojen.tarinat

import fi.bookish.creations.arojen.tarinat.moose.MooseContent
import fi.bookish.creations.arojen.tarinat.moose.MooseMatcher
import fi.bookish.creations.arojen.tarinat.ui.book.Book
import fi.bookish.creations.arojen.tarinat.ui.book.BookBlock
import fi.bookish.creations.arojen.tarinat.ui.book.matches
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/** Checks the generated book and Moose guide assets against the app's models. */
class ContentAssetsTest {
    private val assets = File("src/main/assets/i18n")
    private val json = Json { ignoreUnknownKeys = true }
    private val languages = listOf("en", "fi", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur", "id", "de", "ja")
    private val emoji = Regex("""[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}]""")

    private fun book(folder: String, lang: String): Book = json.decodeFromString(File(assets, "$folder/$lang.json").readText())

    private fun moose(lang: String): MooseContent = json.decodeFromString(File(assets, "moose/$lang.json").readText())

    private fun Book.texts(): List<String> = listOfNotNull(title, subtitle, eyebrow, tagline, quote) + chapters.flatMap { chapter ->
        listOfNotNull(chapter.title, chapter.subtitle, chapter.heading) + chapter.blocks.flatMap { block ->
            when (block) {
                is BookBlock.Para -> listOf(block.text)
                is BookBlock.Quote -> listOf(block.text)
                is BookBlock.Cards -> block.items.flatMap { listOfNotNull(it.title, it.text, it.subtitle, it.kicker) }
                is BookBlock.Table -> block.head + block.rows.flatten()
            }
        }
    }

    @Test
    fun `every language has both books with the same chapters`() {
        val rulebookIds = book("rulebook", "en").chapters.map { it.id }
        val codexIds = book("codex", "en").chapters.map { it.id }
        assertEquals(18, rulebookIds.size)
        for (lang in languages) {
            val rulebook = book("rulebook", lang)
            assertEquals(lang, rulebookIds, rulebook.chapters.map { it.id })
            assertTrue(lang, rulebook.chapterLabel!!.isNotBlank())
            // Finnish has the full chronicle; every other language the summary.
            val codex = book("codex", lang)
            if (lang != "fi") assertEquals(lang, codexIds, codex.chapters.map { it.id })
            for (text in rulebook.texts() + codex.texts()) {
                assertTrue("$lang: empty text", text.isNotBlank())
                assertFalse("$lang: emoji in \"$text\"", emoji.containsMatchIn(text))
            }
        }
        assertEquals(20, book("codex", "fi").chapters.size)
    }

    @Test
    fun `rulebook search finds chapters by their text`() {
        val rulebook = book("rulebook", "en")
        val silkRoad = rulebook.chapters.filter { it.matches("silk road") }.map { it.id }
        assertTrue("silkkitie" in silkRoad)
        assertTrue(rulebook.chapters.all { it.matches("") })
        assertTrue(rulebook.chapters.none { it.matches("zzzz-not-in-the-book") })
    }

    @Test
    fun `moose answers the questions the original answered`() {
        val en = moose("en")
        assertEquals("phases", MooseMatcher.answer(en, "What are the turn phases?")?.entryId)
        assertEquals("win", MooseMatcher.answer(en, "How do I win?")?.entryId)
        assertEquals("stag", MooseMatcher.answer(en, "Who is Handgai?")?.entryId)
        assertEquals("combat", MooseMatcher.answer(en, "How does combat work?")?.entryId)
        // Only stop words: the generic help text.
        val generic = MooseMatcher.answer(en, "how do I")
        assertNull(generic?.entryId)
        assertEquals(en.generic, generic?.text)

        val fi = moose("fi")
        assertEquals("phases", MooseMatcher.answer(fi, "Mitkä ovat vuoron vaiheet?")?.entryId)
        assertEquals("win", MooseMatcher.answer(fi, "Miten voitan?")?.entryId)
    }

    @Test
    fun `two-letter words no longer match inside keywords`() {
        // The original answered this with the treaty FAQ ("me" inside "agreement").
        assertNull(MooseMatcher.answer(moose("en"), "tell me a joke"))
    }

    @Test
    fun `every topic chip has a local answer in both languages`() {
        for (lang in listOf("en", "fi")) {
            val content = moose(lang)
            for (id in listOf("win", "phases", "combat", "buildings", "cards", "diplomacy", "stag", "save")) {
                assertTrue("$lang: $id", content.entry(id) != null)
            }
        }
    }
}
