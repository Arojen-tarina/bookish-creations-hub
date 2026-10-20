package fi.bookish.creations.arojen.tarinat.ui.game.cards

import android.content.Context
import android.graphics.BitmapFactory
import androidx.collection.LruCache
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import fi.bookish.creations.arojen.tarinat.ui.components.assetLanguage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.IOException

/** Display text for one card: name, description, flavour effect, optional cost, short effect line. */
@Serializable
data class CardText(val n: String, val d: String, val e: String, val c: String? = null, val s: String)

private val json = Json { ignoreUnknownKeys = true }
private val textCache = HashMap<String, Map<String, CardText>>()
private val artCache = LruCache<String, ImageBitmap>(48)

/** Card texts live in assets/i18n/cards/<lang>.json (generated from the original game). */
private fun loadTexts(context: Context, language: String): Map<String, CardText> = synchronized(textCache) {
    val lang = assetLanguage(language)
    textCache.getOrPut(lang) {
        context.assets.open("i18n/cards/$lang.json").bufferedReader().use { json.decodeFromString(it.readText()) }
    }
}

/** Card texts for the current UI language; empty until loaded. */
@Composable
fun rememberCardTexts(): Map<String, CardText> {
    val context = LocalContext.current
    val language = LocalConfiguration.current.locales[0].language
    val texts by produceState(emptyMap<String, CardText>(), language) {
        value = withContext(Dispatchers.IO) { loadTexts(context.applicationContext, language) }
    }
    return texts
}

/** Artwork for a card, or null while loading or when the card has no art (res-041..res-050). */
@Composable
fun rememberCardArt(cardId: String): ImageBitmap? {
    val context = LocalContext.current
    val art by produceState(artCache[cardId], cardId) {
        if (value != null) return@produceState
        value = withContext(Dispatchers.IO) {
            try {
                context.assets.open("cards/$cardId.jpg").use { BitmapFactory.decodeStream(it) }
                    ?.asImageBitmap()?.also { artCache.put(cardId, it) }
            } catch (_: IOException) {
                null
            }
        }
    }
    return art
}
