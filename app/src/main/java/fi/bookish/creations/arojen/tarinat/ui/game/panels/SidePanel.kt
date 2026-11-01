package fi.bookish.creations.arojen.tarinat.ui.game.panels

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.HudIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.hud.PanelTab
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

private data class TabSpec(val tab: PanelTab, val icon: ImageVector, val label: Int)

private val TABS = listOf(
    TabSpec(PanelTab.Province, GameIcons.MapPin, R.string.sidebar_tab_province),
    TabSpec(PanelTab.Realm, GameIcons.Trophy, R.string.sidebar_tab_goals),
    TabSpec(PanelTab.Chronicle, GameIcons.Scroll, R.string.sidebar_tab_log),
    TabSpec(PanelTab.Diplomacy, GameIcons.Scales, R.string.sidebar_tab_diplomacy),
)

/** Right-hand drawer with the four in-game tabs; [content] renders the active tab. */
@Composable
fun SidePanel(
    tab: PanelTab,
    onTab: (PanelTab) -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier,
    /** Pinned under the scrolling content (the drawer's advert). */
    footer: @Composable () -> Unit = {},
    content: @Composable () -> Unit,
) {
    GamePanel(modifier.fillMaxHeight()) {
        Row(
            Modifier.fillMaxWidth().padding(start = 6.dp, end = 6.dp, top = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            for (spec in TABS) {
                val active = spec.tab == tab
                Column(
                    Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (active) Gold.copy(alpha = 0.18f) else Color.Transparent)
                        .clickable(role = Role.Tab) { onTab(spec.tab) }
                        .padding(vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Icon(spec.icon, null, tint = if (active) GoldBright else TextMid, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.height(2.dp))
                    Text(
                        stringResource(spec.label),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (active) GoldBright else TextMid,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            HudIconButton(GameIcons.Close, stringResource(R.string.panel_close), onClose, size = 34.dp)
        }
        Column(
            Modifier
                .fillMaxWidth()
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            content()
        }
        footer()
    }
}

/** Width the drawer takes on screen. */
val SidePanelWidth = 340.dp
