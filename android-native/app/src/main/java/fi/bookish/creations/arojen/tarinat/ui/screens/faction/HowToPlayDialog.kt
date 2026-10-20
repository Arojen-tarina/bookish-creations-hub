package fi.bookish.creations.arojen.tarinat.ui.screens.faction

import androidx.annotation.StringRes
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.data.VictoryTargets
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.HudIconButton
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

private data class Step(val icon: ImageVector, @param:StringRes val title: Int, @param:StringRes val desc: Int, val color: Color)

private val STEPS = listOf(
    Step(GameIcons.Market, R.string.faction_step1_title, R.string.faction_step1_desc, Color(0xFFFBBF24)),
    Step(GameIcons.Cards, R.string.faction_step2_title, R.string.faction_step2_desc, Color(0xFFC084FC)),
    Step(GameIcons.Swords, R.string.faction_step3_title, R.string.faction_step3_desc, Color(0xFFF87171)),
    Step(GameIcons.Hammer, R.string.faction_step4_title, R.string.faction_step4_desc, Color(0xFF60A5FA)),
    Step(GameIcons.EndTurn, R.string.faction_step5_title, R.string.faction_step5_desc, Color(0xFFD6D3D1)),
)

/** The turn in five steps and the five ways to win (the original "How to play" box). */
@Composable
fun HowToPlayDialog(onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        GamePanel(Modifier.widthIn(max = 760.dp).fillMaxWidth(0.94f).fillMaxHeight(0.94f), alpha = 0.98f) {
            Row(Modifier.padding(start = 16.dp, end = 10.dp, top = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(stringResource(R.string.faction_how_to_play), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
                    Text(stringResource(R.string.how_to_play_hint), style = MaterialTheme.typography.bodySmall, color = TextMid)
                }
                HudIconButton(GameIcons.Close, stringResource(R.string.common_close), onDismiss)
            }
            Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 8.dp)) {
                Spacer(Modifier.height(12.dp))

                Text(stringResource(R.string.how_to_play_turn), style = MaterialTheme.typography.labelLarge, color = Gold)
                Spacer(Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    STEPS.forEachIndexed { i, step ->
                        Column(
                            Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(step.color.copy(alpha = 0.10f))
                                .border(1.dp, step.color.copy(alpha = 0.45f), RoundedCornerShape(10.dp))
                                .padding(8.dp),
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(22.dp).clip(CircleShape).background(step.color.copy(alpha = 0.25f)), contentAlignment = Alignment.Center) {
                                    Text("${i + 1}", style = MaterialTheme.typography.labelMedium, color = TextHigh)
                                }
                                Spacer(Modifier.width(6.dp))
                                Icon(step.icon, null, tint = step.color, modifier = Modifier.size(18.dp))
                            }
                            Spacer(Modifier.height(4.dp))
                            Text(stringResource(step.title), style = MaterialTheme.typography.titleSmall, color = TextHigh)
                            Text(stringResource(step.desc), style = MaterialTheme.typography.bodySmall, color = TextMid)
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))
                Text(stringResource(R.string.how_to_play_goals), style = MaterialTheme.typography.labelLarge, color = Gold)
                Spacer(Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Goal(Modifier.weight(1f), GameIcons.Swords, Color(0xFFF87171),
                        stringResource(R.string.faction_goal_military_title, VictoryTargets.PROVINCES), R.string.faction_goal_military_sub)
                    Goal(Modifier.weight(1f), GameIcons.Market, Color(0xFFFBBF24),
                        stringResource(R.string.faction_goal_economic_title, VictoryTargets.GOLD, VictoryTargets.TREASURY_STREAK), R.string.faction_goal_economic_sub)
                    Goal(Modifier.weight(1f), GameIcons.Cards, Color(0xFF38BDF8),
                        stringResource(R.string.faction_goal_tech_title, VictoryTargets.TECH), R.string.faction_goal_tech_sub)
                    Goal(Modifier.weight(1f), GameIcons.Scales, Color(0xFF34D399),
                        stringResource(R.string.faction_goal_diplomatic_title, VictoryTargets.INFLUENCE, VictoryTargets.DIPLOMATIC_MIN_ALLIES), R.string.faction_goal_diplomatic_sub)
                    Goal(Modifier.weight(1f), GameIcons.Temple, Color(0xFFC084FC),
                        stringResource(R.string.faction_goal_cultural_title, VictoryTargets.PRESTIGE), R.string.faction_goal_cultural_sub)
                }
            }
        }
    }
}

@Composable
private fun Goal(modifier: Modifier, icon: ImageVector, color: Color, title: String, @StringRes sub: Int) {
    Column(
        modifier
            .clip(RoundedCornerShape(10.dp))
            .background(Ink700)
            .border(1.dp, Ink500, RoundedCornerShape(10.dp))
            .padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
        Spacer(Modifier.height(4.dp))
        Text(title, style = MaterialTheme.typography.labelMedium, color = TextHigh, textAlign = TextAlign.Center)
        Text(stringResource(sub), style = MaterialTheme.typography.labelSmall, color = color, textAlign = TextAlign.Center)
    }
}
