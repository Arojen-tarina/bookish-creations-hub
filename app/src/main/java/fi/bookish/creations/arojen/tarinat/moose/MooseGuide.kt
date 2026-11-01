package fi.bookish.creations.arojen.tarinat.moose

import android.content.res.AssetManager
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.util.concurrent.atomic.AtomicLong

data class MooseMessage(val id: Long, val fromMoose: Boolean, val text: String)

/**
 * Texts the guide takes from the current UI language: the "cannot reach the
 * assistant" reply, and native replacements for answers that describe the web build.
 */
data class MooseTexts(val unavailable: String, val overrides: Map<String, String>)

/**
 * The Moose guide's conversation, kept for the whole app session like the
 * original's floating chat. As in the original, Finnish and English questions
 * are answered locally first; other languages go to [remote], which answers in
 * the player's language, with the English notes as the fallback.
 */
class MooseGuide(
    private val assets: AssetManager,
    private val remote: MooseRemote?,
    private val scope: CoroutineScope,
    private val io: CoroutineDispatcher = Dispatchers.IO,
) {
    private val _messages = MutableStateFlow<List<MooseMessage>>(emptyList())
    val messages: StateFlow<List<MooseMessage>> = _messages.asStateFlow()

    private val _thinking = MutableStateFlow(false)
    val thinking: StateFlow<Boolean> = _thinking.asStateFlow()

    private val json = Json { ignoreUnknownKeys = true }
    private val content = HashMap<String, MooseContent>()
    private val answering = Mutex()
    private val nextId = AtomicLong()

    /**
     * Asks a typed question, or a topic chip when [topicId] names a local entry
     * (the chip then needs no keyword match).
     */
    fun ask(question: String, language: String, texts: MooseTexts, topicId: String? = null) {
        val text = question.trim()
        if (text.isEmpty()) return
        val history = _messages.value.takeLast(6).map { MooseRemote.Turn(if (it.fromMoose) "assistant" else "user", it.text) }
        post(fromMoose = false, text)
        scope.launch {
            answering.withLock { post(fromMoose = true, answer(text, language, history, texts, topicId)) }
        }
    }

    private suspend fun answer(
        question: String,
        language: String,
        history: List<MooseRemote.Turn>,
        texts: MooseTexts,
        topicId: String?,
    ): String {
        val hasLocalContent = language == "fi" || language == "en"
        val notes = content(if (language == "fi") "fi" else "en")
        fun local(): String? {
            val found = topicId?.let { id -> notes.entry(id)?.let { LocalAnswer(id, it.answer) } }
                ?: MooseMatcher.answer(notes, question)
                ?: return null
            return found.entryId?.let(texts.overrides::get) ?: found.text
        }

        if (hasLocalContent) local()?.let { return it }
        if (remote != null) {
            _thinking.value = true
            try {
                remote.reply(question, language, history)?.let { return it }
            } finally {
                _thinking.value = false
            }
        }
        return (if (hasLocalContent) null else local()) ?: texts.unavailable
    }

    private suspend fun content(lang: String): MooseContent = withContext(io) {
        synchronized(content) {
            content.getOrPut(lang) {
                assets.open("i18n/moose/$lang.json").bufferedReader().use { json.decodeFromString(it.readText()) }
            }
        }
    }

    private fun post(fromMoose: Boolean, text: String) {
        _messages.update { it + MooseMessage(nextId.getAndIncrement(), fromMoose, text) }
    }
}
