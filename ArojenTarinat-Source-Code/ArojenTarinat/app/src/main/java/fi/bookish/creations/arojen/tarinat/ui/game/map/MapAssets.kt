package fi.bookish.creations.arojen.tarinat.ui.game.map

import android.content.res.Resources
import androidx.annotation.DrawableRes
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.platform.LocalResources
import androidx.compose.ui.res.imageResource
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.TradeGood
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Decoded board art and every map sprite, keyed by drawable id. */
class MapAssets private constructor(
    val board: ImageBitmap,
    private val sprites: Map<Int, ImageBitmap>,
) {
    fun sprite(@DrawableRes id: Int): ImageBitmap = sprites.getValue(id)

    companion object {
        /** Decodes everything up front (call off the main thread). */
        fun load(resources: Resources): MapAssets {
            val ids = buildSet {
                // One faction per art set is enough to cover all four sprite families.
                for (f in listOf(FactionId.MONGOL, FactionId.SONG, FactionId.KHWAREZM, FactionId.RUS)) {
                    add(FactionStyle.fortSprite(f))
                    add(FactionStyle.campSprite(f))
                    add(FactionStyle.bridgeSprite(f))
                    add(FactionStyle.leaderSprite(f))
                    add(FactionStyle.cavalrySprite(f))
                    add(FactionStyle.infantrySprite(f))
                }
                TradeGood.entries.forEach { add(FactionStyle.resourceSprite(it)) }
            }
            return MapAssets(
                board = ImageBitmap.imageResource(resources, R.drawable.board_map),
                sprites = ids.associateWith { ImageBitmap.imageResource(resources, it) },
            )
        }
    }
}

/** Null until the art has been decoded in the background. */
@Composable
fun rememberMapAssets(): MapAssets? {
    val resources = LocalResources.current
    val assets by produceState<MapAssets?>(null, resources) {
        value = withContext(Dispatchers.Default) { MapAssets.load(resources) }
    }
    return assets
}
