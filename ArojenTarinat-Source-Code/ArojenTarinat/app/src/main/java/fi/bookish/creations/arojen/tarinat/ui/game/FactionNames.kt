package fi.bookish.creations.arojen.tarinat.ui.game

import androidx.annotation.StringRes
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.FactionId

@get:StringRes
val FactionId?.nameRes: Int
    get() = when (this) {
        FactionId.MONGOL -> R.string.faction_name_mongol
        FactionId.SONG -> R.string.faction_name_song
        FactionId.RUS -> R.string.faction_name_rus
        FactionId.KHWAREZM -> R.string.faction_name_khwarezm
        FactionId.JIN -> R.string.faction_name_jin
        FactionId.XIXIA -> R.string.faction_name_xixia
        FactionId.KIPCHAK -> R.string.faction_name_kipchak
        null -> R.string.neutral_land
    }
