package fi.bookish.creations.arojen.tarinat.ui.multiplayer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.pluralStringResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.multiplayer.RoomSession
import fi.bookish.creations.arojen.tarinat.ui.components.GameSheet
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/** Opens the [PlayersSheet]. */
@Composable
fun PlayersButton(onOpen: () -> Unit) {
    RoundIconButton(GameIcons.People, stringResource(R.string.mp_players_label), onOpen)
}

/**
 * The human players of an online match in turn order: their realm, name, land
 * and armies, and whether they are on turn, have left (the AI plays on) or fell.
 * [view] is this player's own view of the map.
 */
@Composable
fun PlayersSheet(session: RoomSession, view: GameState, onDismiss: () -> Unit) {
    val snapshot by session.snapshot.collectAsStateWithLifecycle()
    val snap = snapshot ?: return
    val game = snap.game ?: return
    GameSheet(onDismiss) {
        SectionTitle(stringResource(R.string.mp_players_label), icon = GameIcons.People)
        for (seat in game.seats) {
            val faction = seat.faction
            val provinces = view.provinces.count { it.ownerId == faction }
            val armies = view.armies.count { it.ownerId == faction }
            val name = snap.nameOf(faction).orEmpty()
            val mine = faction == session.myFaction
            val status = when {
                seat.eliminated -> stringResource(R.string.mp_fallen) to Rust
                seat.left -> stringResource(R.string.mp_ai_plays) to TextLow
                !game.finished && faction == game.activeFaction -> stringResource(R.string.mp_on_turn) to Jade
                else -> null
            }
            Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                Box(Modifier.size(14.dp).clip(CircleShape).background(FactionStyle.color(faction)))
                Spacer(Modifier.width(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(
                        if (mine) "$name (${stringResource(R.string.mp_you)})" else name,
                        style = MaterialTheme.typography.bodyLarge,
                        color = if (mine) Gold else TextHigh,
                    )
                    Text(
                        listOf(
                            stringResource(faction.nameRes),
                            pluralStringResource(R.plurals.save_meta_provinces, provinces, provinces),
                            pluralStringResource(R.plurals.mp_armies, armies, armies),
                        ).joinToString(" · "),
                        style = MaterialTheme.typography.labelMedium,
                        color = TextMid,
                    )
                }
                status?.let { (text, color) -> Text(text, style = MaterialTheme.typography.labelLarge, color = color) }
            }
        }
    }
}
