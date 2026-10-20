package fi.bookish.creations.arojen.tarinat.ui.game

import androidx.compose.ui.graphics.Color
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.TradeGood

/** Visual identity per realm: map colour and which art set its sprites use. */
object FactionStyle {

    val Neutral = Color(0xFF8A8A8A)

    // Rus moved from slate grey to a clear blue so it no longer reads as neutral land.
    fun color(id: FactionId?): Color = when (id) {
        FactionId.MONGOL -> Color(0xFFF59E0B)
        FactionId.SONG -> Color(0xFF22C55E)
        FactionId.KHWAREZM -> Color(0xFF8B5CF6)
        FactionId.RUS -> Color(0xFF3B7DD8)
        FactionId.JIN -> Color(0xFFEF4444)
        FactionId.XIXIA -> Color(0xFF06B6D4)
        FactionId.KIPCHAK -> Color(0xFFEC4899)
        null -> Neutral
    }

    enum class ArtSet { MONGOL, CHINESE, PERSIAN, NOVGOROD }

    fun artSet(id: FactionId?): ArtSet = when (id) {
        FactionId.MONGOL, FactionId.KIPCHAK -> ArtSet.MONGOL
        FactionId.JIN, FactionId.SONG, FactionId.XIXIA -> ArtSet.CHINESE
        FactionId.KHWAREZM -> ArtSet.PERSIAN
        FactionId.RUS, null -> ArtSet.NOVGOROD
    }

    fun fortSprite(id: FactionId?) = when (artSet(id)) {
        ArtSet.MONGOL -> R.drawable.sprite_fort_mongol
        ArtSet.CHINESE -> R.drawable.sprite_fort_chinese
        ArtSet.PERSIAN -> R.drawable.sprite_fort_persian
        ArtSet.NOVGOROD -> R.drawable.sprite_fort_novgorod
    }

    fun campSprite(id: FactionId?) = when (artSet(id)) {
        ArtSet.MONGOL -> R.drawable.sprite_camp_mongol
        ArtSet.CHINESE -> R.drawable.sprite_camp_chinese
        ArtSet.PERSIAN -> R.drawable.sprite_camp_persian
        ArtSet.NOVGOROD -> R.drawable.sprite_camp_novgorod
    }

    fun bridgeSprite(id: FactionId?) = when (artSet(id)) {
        ArtSet.MONGOL -> R.drawable.sprite_bridge_mongol
        ArtSet.CHINESE -> R.drawable.sprite_bridge_chinese
        ArtSet.PERSIAN -> R.drawable.sprite_bridge_persian
        ArtSet.NOVGOROD -> R.drawable.sprite_bridge_novgorod
    }

    fun leaderSprite(id: FactionId?) = when (artSet(id)) {
        ArtSet.MONGOL -> R.drawable.sprite_leader_mongol
        ArtSet.CHINESE -> R.drawable.sprite_leader_chinese
        ArtSet.PERSIAN -> R.drawable.sprite_leader_persian
        ArtSet.NOVGOROD -> R.drawable.sprite_leader_novgorod
    }

    fun cavalrySprite(id: FactionId?) = when (artSet(id)) {
        ArtSet.MONGOL -> R.drawable.sprite_cavalry_mongol
        ArtSet.CHINESE -> R.drawable.sprite_cavalry_chinese
        ArtSet.PERSIAN -> R.drawable.sprite_cavalry_persian
        ArtSet.NOVGOROD -> R.drawable.sprite_cavalry_novgorod
    }

    fun infantrySprite(id: FactionId?) = when (artSet(id)) {
        ArtSet.MONGOL -> R.drawable.sprite_infantry_mongol
        ArtSet.CHINESE -> R.drawable.sprite_infantry_chinese
        ArtSet.PERSIAN -> R.drawable.sprite_infantry_persian
        ArtSet.NOVGOROD -> R.drawable.sprite_infantry_novgorod
    }

    /** Which of the six resource tokens represents a trade good on the map. */
    fun resourceSprite(good: TradeGood) = when (good) {
        TradeGood.HORSES -> R.drawable.sprite_res_horse
        TradeGood.LIVESTOCK, TradeGood.GRAIN, TradeGood.SALT -> R.drawable.sprite_res_food
        TradeGood.FUR -> R.drawable.sprite_res_wood
        TradeGood.IRON -> R.drawable.sprite_res_iron
        TradeGood.SILK, TradeGood.GOLD, TradeGood.GEMS -> R.drawable.sprite_res_gold
        TradeGood.SPICES -> R.drawable.sprite_res_stone
    }
}
