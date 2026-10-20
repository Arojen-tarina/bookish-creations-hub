package fi.bookish.creations.arojen.tarinat.moose

import kotlinx.serialization.Serializable
import java.text.Normalizer

/**
 * The Moose guide's local answers in one language (assets/i18n/moose/<lang>.json,
 * generated from the original mooseFaq.ts and mooseKnowledge.ts; Finnish and English only).
 */
@Serializable
data class MooseContent(
    val generic: String,
    val stopWords: List<String>,
    val faq: List<Entry>,
    val knowledge: List<Entry>,
) {
    @Serializable
    data class Entry(val id: String, val keywords: List<String>, val answer: String)

    fun entry(id: String): Entry? = faq.firstOrNull { it.id == id } ?: knowledge.firstOrNull { it.id == id }
}

/**
 * A local answer and the entry it came from (null for the generic help text).
 * [exact] tells whether a whole word of the question was one of its keywords.
 */
data class LocalAnswer(val entryId: String?, val text: String, val exact: Boolean = true)

/** Keyword search of the original guide: rules FAQ first, then the lore notes. */
object MooseMatcher {
    private val COMBINING_MARKS = Regex("[\\u0300-\\u036f]")
    private val NON_WORD = Regex("[^a-z0-9]+")

    fun normalize(value: String): String =
        COMBINING_MARKS.replace(Normalizer.normalize(value.lowercase(), Normalizer.Form.NFD), "")

    /**
     * The original asked the FAQ first and the lore notes only when it found nothing, so
     * "Who is Handgai?" got the cards answer ("hand" inside "handgai"). A whole-word hit
     * now beats a partial one.
     */
    fun answer(content: MooseContent, question: String): LocalAnswer? {
        val rules = faq(content, question)
        if (rules != null && rules.exact) return rules
        val lore = knowledge(content, question)
        if (lore != null && lore.exact) return lore
        return rules ?: lore
    }

    /** Port of matchMooseFaq: exact keyword 4 points, partial or prefix match 2; best entry wins. */
    fun faq(content: MooseContent, question: String): LocalAnswer? {
        val stop = content.stopWords.toSet()
        val words = normalize(question).split(NON_WORD).filter { it.length >= 2 && it !in stop }
        if (words.isEmpty()) return LocalAnswer(null, content.generic)

        var best: MooseContent.Entry? = null
        var bestScore = 0
        var bestExact = false
        for (entry in content.faq) {
            var exactHit = false
            val score = entry.keywords.map(::normalize).sumOf { kw ->
                val exact = words.any { it == kw }
                // The original also let two-letter words match inside keywords ("me" in "agreement");
                // a word now needs three letters to match part of a keyword.
                val partial = kw.length >= 3 && words.any { it.contains(kw) || (it.length >= 3 && kw.contains(it)) }
                val prefix = kw.length >= 4 && words.any { it.startsWith(kw) || (it.length >= 3 && kw.startsWith(it)) }
                if (exact) exactHit = true
                when {
                    exact -> 4
                    partial || prefix -> 2
                    else -> 0
                }
            }
            if (score > bestScore) {
                best = entry
                bestScore = score
                bestExact = exactHit
            }
        }
        return best?.takeIf { bestScore >= 2 }?.let { LocalAnswer(it.id, it.answer, bestExact) }
    }

    /** Port of matchMooseLocalKnowledge: one point per keyword any word matches. */
    fun knowledge(content: MooseContent, question: String): LocalAnswer? {
        val words = normalize(question).split(NON_WORD).filter { it.length >= 3 }
        var best: MooseContent.Entry? = null
        var bestScore = 0
        var bestExact = false
        for (entry in content.knowledge) {
            val keywords = entry.keywords.map(::normalize)
            val score = keywords.count { kw -> words.any { it == kw || it.contains(kw) || kw.contains(it) } }
            if (score > bestScore) {
                best = entry
                bestScore = score
                bestExact = keywords.any { it in words }
            }
        }
        return best?.let { LocalAnswer(it.id, it.answer, bestExact) }
    }
}
