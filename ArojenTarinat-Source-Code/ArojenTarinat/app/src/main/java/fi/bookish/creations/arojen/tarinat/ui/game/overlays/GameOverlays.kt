package fi.bookish.creations.arojen.tarinat.ui.game.overlays

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.OrnamentDivider
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.components.signed
import fi.bookish.creations.arojen.tarinat.ui.game.GameMessage
import fi.bookish.creations.arojen.tarinat.ui.game.MessageArg
import fi.bookish.creations.arojen.tarinat.ui.game.Tone
import fi.bookish.creations.arojen.tarinat.ui.game.cards.CardText
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceIcon
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceKind
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.game.victoryTextRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldDeep
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink800
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

// ============= GAME OVER =============

@Composable
fun GameOverDialog(game: GameState, onPlayAgain: () -> Unit, onMainMenu: () -> Unit, onSecondChance: (() -> Unit)? = null) {
    val victory = game.winnerId == game.playerFactionId
    val accent = if (victory) Gold else Rust
    // The second-chance offer needs room on a phone held sideways.
    val medal = if (onSecondChance != null) 60.dp else 84.dp
    Dialog(onDismissRequest = {}, properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false)) {
        GamePanel(Modifier.widthIn(max = 460.dp), alpha = 0.98f) {
            Column(Modifier.verticalScroll(rememberScrollState()).padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    Modifier.size(medal).clip(CircleShape).background(Brush.radialGradient(listOf(accent.copy(alpha = 0.35f), Color.Transparent))),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(if (victory) GameIcons.Trophy else GameIcons.Swords, null, tint = accent, modifier = Modifier.size(medal * 0.62f))
                }
                Text(
                    stringResource(if (victory) R.string.game_over_victory else R.string.game_over_defeat),
                    style = MaterialTheme.typography.displayMedium,
                    color = if (victory) GoldBright else Rust,
                )
                OrnamentDivider(Modifier.width(220.dp).padding(vertical = 8.dp), color = accent)
                val body = when {
                    victory -> stringResource(game.winCondition.victoryTextRes)
                    game.winnerId != null -> stringResource(R.string.game_over_defeat_by, stringResource(game.winnerId.nameRes))
                    else -> stringResource(R.string.game_over_defeat_text)
                }
                Text(body, style = MaterialTheme.typography.bodyLarge, color = TextHigh, textAlign = TextAlign.Center)
                Spacer(Modifier.height(6.dp))
                Text(stringResource(R.string.game_over_turn_year, game.turn, game.year), style = MaterialTheme.typography.bodySmall, color = TextMid)
                Spacer(Modifier.height(18.dp))
                if (onSecondChance != null) {
                    SecondChanceButton(onSecondChance)
                    Spacer(Modifier.height(10.dp))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GameButton(stringResource(R.string.game_over_main_menu), onMainMenu, style = GameButtonStyle.Secondary)
                    GameButton(
                        stringResource(R.string.game_over_play_again),
                        onPlayAgain,
                        style = if (onSecondChance != null) GameButtonStyle.Secondary else GameButtonStyle.Primary,
                    )
                }
            }
        }
    }
}

/**
 * The offer before the ad (the intro the rewarded format asks for): what watching
 * gives, and that it comes once per campaign. The other buttons are the way to say no.
 */
@Composable
private fun SecondChanceButton(onClick: () -> Unit) {
    val shape = MaterialTheme.shapes.small
    Row(
        Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(Brush.verticalGradient(listOf(GoldBright, Gold, GoldDeep)))
            .border(1.dp, GoldBright, shape)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(GameIcons.Rewind, null, tint = Ink900, modifier = Modifier.size(30.dp))
        Spacer(Modifier.width(12.dp))
        Column {
            Text(stringResource(R.string.second_chance_title), style = MaterialTheme.typography.titleMedium, color = Ink900)
            Text(stringResource(R.string.second_chance_body), style = MaterialTheme.typography.bodySmall, color = Ink900.copy(alpha = 0.8f))
        }
    }
}

// ============= PAUSE MENU =============

@Composable
fun PauseMenuDialog(
    musicMuted: Boolean,
    onToggleMusic: () -> Unit,
    onResume: () -> Unit,
    onSave: () -> Unit,
    onLoad: () -> Unit,
    onRulebook: () -> Unit,
    onSettings: () -> Unit,
    onExit: () -> Unit,
) {
    var confirmExit by remember { mutableStateOf(false) }
    Dialog(onDismissRequest = onResume) {
        GamePanel(Modifier.width(340.dp), alpha = 0.98f) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                if (!confirmExit) {
                    Text(stringResource(R.string.pause_title), style = MaterialTheme.typography.headlineMedium, color = GoldBright, textAlign = TextAlign.Center)
                    OrnamentDivider(Modifier.width(200.dp).padding(vertical = 10.dp))
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        GameButton(stringResource(R.string.pause_resume), onResume, Modifier.weight(1f))
                        // Quick music switch, as the original HUD had.
                        RoundIconButton(
                            if (musicMuted) GameIcons.SoundOff else GameIcons.SoundOn,
                            stringResource(if (musicMuted) R.string.hud_mute_on else R.string.hud_mute_off),
                            onToggleMusic,
                            size = 48.dp,
                        )
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        GameButton(stringResource(R.string.pause_save), onSave, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                        GameButton(stringResource(R.string.pause_load), onLoad, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        GameButton(stringResource(R.string.pause_rulebook), onRulebook, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                        GameButton(stringResource(R.string.pause_settings), onSettings, Modifier.weight(1f), GameButtonStyle.Secondary, compact = true)
                    }
                    Spacer(Modifier.height(8.dp))
                    GameButton(stringResource(R.string.pause_exit), { confirmExit = true }, Modifier.fillMaxWidth(), GameButtonStyle.Secondary)
                } else {
                    Text(stringResource(R.string.pause_exit_confirm_title), style = MaterialTheme.typography.headlineSmall, color = GoldBright, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(8.dp))
                    Text(stringResource(R.string.pause_exit_confirm_body), style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        GameButton(stringResource(R.string.pause_exit_confirm_no), { confirmExit = false }, style = GameButtonStyle.Secondary)
                        GameButton(stringResource(R.string.pause_exit_confirm_yes), onExit)
                    }
                }
            }
        }
    }
}

// ============= MESSAGES =============

/** Resolves a [GameMessage] to text in the current language. */
@Composable
fun messageText(message: GameMessage, cardTexts: Map<String, CardText>): String {
    val args = message.args.map { arg ->
        when (arg) {
            is MessageArg.Raw -> arg.value
            is MessageArg.Res -> stringResource(arg.id)
            is MessageArg.CardName -> cardTexts[arg.cardId]?.n ?: arg.cardId
        }
    }
    return stringResource(message.res, *args.toTypedArray())
}

/** Shows [message] as a pill for a few seconds, then calls [onDone]. */
@Composable
fun MessageToast(message: GameMessage?, cardTexts: Map<String, CardText>, onDone: () -> Unit, modifier: Modifier = Modifier) {
    LaunchedEffect(message) {
        if (message != null) {
            delay(2600)
            onDone()
        }
    }
    AnimatedVisibility(message != null, modifier, enter = fadeIn() + slideInVertically { -it }, exit = fadeOut()) {
        val shown = remember(message) { message } ?: return@AnimatedVisibility
        val color = when (shown.tone) { Tone.Positive -> Jade; Tone.Negative -> Rust; Tone.Neutral -> Gold }
        Row(
            Modifier
                .clip(RoundedCornerShape(50))
                .background(Ink800.copy(alpha = 0.96f))
                .border(1.dp, color.copy(alpha = 0.8f), RoundedCornerShape(50))
                .padding(horizontal = 16.dp, vertical = 9.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(Modifier.size(9.dp).clip(CircleShape).background(color))
            Spacer(Modifier.width(10.dp))
            Text(messageText(shown, cardTexts), style = MaterialTheme.typography.titleSmall, color = TextHigh)
        }
    }
}

// ============= TURN INCOME =============

/** Summary of what the realm collected at the start of the turn. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun IncomeToast(game: GameState, visible: Boolean, modifier: Modifier = Modifier) {
    val c = game.lastCollection
    AnimatedVisibility(visible && c != null, modifier, enter = fadeIn() + slideInVertically { -it / 2 }, exit = fadeOut() + slideOutVertically { -it / 2 }) {
        if (c == null) return@AnimatedVisibility
        GamePanel(alpha = 0.96f) {
            Column(Modifier.padding(horizontal = 16.dp, vertical = 10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(stringResource(R.string.resource_collected), style = MaterialTheme.typography.titleSmall, color = Jade)
                Spacer(Modifier.height(6.dp))
                // Wraps onto a second line where the map is narrow (small phones, drawer open).
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(14.dp, Alignment.CenterHorizontally),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Gain(ResourceKind.GOLD, c.taxIncome)
                    Gain(ResourceKind.MANPOWER, c.manpowerGain)
                    Gain(ResourceKind.FOOD, c.foodChange)
                    if (c.horsesGain != 0) Gain(ResourceKind.HORSES, c.horsesGain)
                    if (c.artisansGain != 0) Gain(ResourceKind.ARTISANS, c.artisansGain)
                    if (c.influenceGain != 0) Gain(ResourceKind.INFLUENCE, c.influenceGain)
                    if (c.prestigeGain != 0) Gain(ResourceKind.PRESTIGE, c.prestigeGain)
                }
                if (c.silkRoadBonus > 0 || c.marketBonus > 0) {
                    Spacer(Modifier.height(4.dp))
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp, Alignment.CenterHorizontally)) {
                        if (c.silkRoadBonus > 0) Text("${stringResource(R.string.resource_silk_road)} ${signed(c.silkRoadBonus)}", style = MaterialTheme.typography.labelSmall, color = Gold)
                        if (c.marketBonus > 0) Text("${stringResource(R.string.resource_market)} ${signed(c.marketBonus)}", style = MaterialTheme.typography.labelSmall, color = Gold)
                    }
                }
            }
        }
    }
}

@Composable
private fun Gain(kind: ResourceKind, amount: Int) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        ResourceIcon(kind, size = 16.dp)
        Spacer(Modifier.width(4.dp))
        Text(signed(amount, plusZero = true), style = MaterialTheme.typography.labelLarge, color = if (amount >= 0) kind.color else Rust)
    }
}

// ============= SELECTED ARMY =============

@Composable
fun ArmyBanner(army: Army, attackPower: Int, modifier: Modifier = Modifier) {
    Row(
        modifier
            .clip(RoundedCornerShape(50))
            .background(Ink800.copy(alpha = 0.94f))
            .border(1.dp, Jade.copy(alpha = 0.7f), RoundedCornerShape(50))
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        BannerStat(GameIcons.Horseshoe, army.cavalry)
        BannerStat(GameIcons.Sword, army.infantry)
        BannerStat(GameIcons.Swords, attackPower, stringResource(R.string.battle_attack_label))
        BannerStat(GameIcons.Boot, army.movementLeft)
        Spacer(Modifier.width(4.dp))
        Text(stringResource(R.string.army_banner_hint), style = MaterialTheme.typography.labelMedium, color = TextMid)
    }
}

@Composable
private fun BannerStat(icon: ImageVector, value: Int, description: String? = null) {
    Icon(icon, description, tint = Jade, modifier = Modifier.size(16.dp))
    Spacer(Modifier.width(4.dp))
    Text(value.toString(), style = MaterialTheme.typography.labelLarge, color = TextHigh)
    Spacer(Modifier.width(10.dp))
}

// ============= ENGAGEMENT =============

private data class Floater(val id: Long, val kind: ResourceKind?, val text: String, val color: Color, val xFraction: Float)

private enum class Milestone(val titleRes: Int, val descRes: Int) {
    FIRST_PROVINCE(R.string.milestone_first_province, R.string.milestone_first_province_desc),
    FIVE_PROVINCES(R.string.milestone_five_provinces, R.string.milestone_five_provinces_desc),
    TEN_PROVINCES(R.string.milestone_ten_provinces, R.string.milestone_ten_provinces_desc),
    TWENTY_PROVINCES(R.string.milestone_twenty_provinces, R.string.milestone_twenty_provinces_desc),
    HUNDRED_GOLD(R.string.milestone_hundred_gold, R.string.milestone_hundred_gold_desc),
    THREE_HUNDRED_GOLD(R.string.milestone_three_hundred_gold, R.string.milestone_three_hundred_gold_desc),
    STREAK5(R.string.milestone_streak5, R.string.milestone_streak5_desc),
    STREAK10(R.string.milestone_streak10, R.string.milestone_streak10_desc),
    STREAK20(R.string.milestone_streak20, R.string.milestone_streak20_desc),
}

private data class Snapshot(val gold: Int, val manpower: Int, val provinces: Int, val turn: Int)

/**
 * Feedback layer (from the original "engagement layer"): floating gains, a
 * flash when land is won, a no-loss streak counter and one-time milestones.
 * Purely visual: it never changes the game.
 */
@Composable
fun EngagementLayer(game: GameState, modifier: Modifier = Modifier) {
    val floaters = remember { mutableStateListOf<Floater>() }
    var previous by remember { mutableStateOf<Snapshot?>(null) }
    var streak by remember { mutableIntStateOf(0) }
    val unlocked = remember { mutableStateListOf<Milestone>() }
    var showing by remember { mutableStateOf<Milestone?>(null) }
    val flash = remember { Animatable(0f) }
    var nextId by remember { mutableLongStateOf(0L) }

    LaunchedEffect(game) {
        val now = Snapshot(game.player.treasury, game.player.manpower, game.provinces.count { it.ownerId == game.playerFactionId }, game.turn)
        val before = previous
        previous = now
        if (before == null) return@LaunchedEffect

        fun float(kind: ResourceKind?, text: String, color: Color) {
            floaters += Floater(nextId++, kind, text, color, 0.35f + (floaters.size % 4) * 0.1f)
        }
        val goldDelta = now.gold - before.gold
        if (goldDelta >= 5) float(ResourceKind.GOLD, signed(goldDelta), ResourceKind.GOLD.color)
        val menDelta = now.manpower - before.manpower
        if (menDelta >= 3) float(ResourceKind.MANPOWER, signed(menDelta), ResourceKind.MANPOWER.color)
        val landDelta = now.provinces - before.provinces
        if (landDelta > 0) {
            float(null, signed(landDelta), Jade)
            launch { flash.snapTo(0.22f); flash.animateTo(0f, tween(500)) }
        } else if (landDelta < 0) {
            float(null, signed(landDelta), Rust)
            streak = 0
        }
        if (now.turn > before.turn && landDelta >= 0) streak += 1

        fun unlock(m: Milestone) {
            if (m !in unlocked) {
                unlocked += m
                showing = m
            }
        }
        if (now.provinces >= 2 && before.provinces < 2) unlock(Milestone.FIRST_PROVINCE)
        if (now.provinces >= 5 && before.provinces < 5) unlock(Milestone.FIVE_PROVINCES)
        if (now.provinces >= 10 && before.provinces < 10) unlock(Milestone.TEN_PROVINCES)
        if (now.provinces >= 20 && before.provinces < 20) unlock(Milestone.TWENTY_PROVINCES)
        if (now.gold >= 100 && before.gold < 100) unlock(Milestone.HUNDRED_GOLD)
        if (now.gold >= 300 && before.gold < 300) unlock(Milestone.THREE_HUNDRED_GOLD)
        if (streak == 5) unlock(Milestone.STREAK5)
        if (streak == 10) unlock(Milestone.STREAK10)
        if (streak == 20) unlock(Milestone.STREAK20)
    }

    LaunchedEffect(showing) {
        if (showing != null) {
            delay(3200)
            showing = null
        }
    }

    Box(modifier.fillMaxSize()) {
        if (flash.value > 0f) Box(Modifier.fillMaxSize().background(Jade.copy(alpha = flash.value)))

        for (f in floaters.toList()) {
            key(f.id) {
                FloatingGain(f) { floaters.remove(f) }
            }
        }

        if (streak >= 3) {
            Row(
                Modifier
                    .align(Alignment.TopStart)
                    .padding(top = 64.dp, start = 4.dp)
                    .clip(RoundedCornerShape(50))
                    .background(Brush.horizontalGradient(listOf(Color(0xFFEA580C), Color(0xFFDC2626))))
                    .border(1.dp, GoldBright.copy(alpha = 0.7f), RoundedCornerShape(50))
                    .padding(horizontal = 12.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(GameIcons.Flag, null, tint = Color.White, modifier = Modifier.size(14.dp))
                Spacer(Modifier.width(6.dp))
                Text(stringResource(R.string.streak_label, streak), style = MaterialTheme.typography.labelMedium, color = Color.White)
            }
        }

        AnimatedVisibility(showing != null, Modifier.align(Alignment.Center), enter = fadeIn() + slideInVertically { it / 3 }, exit = fadeOut()) {
            val m = remember(showing) { showing } ?: return@AnimatedVisibility
            GamePanel(alpha = 0.97f) {
                Row(Modifier.padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(GameIcons.Trophy, null, tint = GoldBright, modifier = Modifier.size(34.dp))
                    Spacer(Modifier.width(12.dp))
                    Column {
                        Text(stringResource(m.titleRes), style = MaterialTheme.typography.headlineSmall, color = GoldBright, fontWeight = FontWeight.Bold)
                        Text(stringResource(m.descRes), style = MaterialTheme.typography.bodyMedium, color = TextMid)
                    }
                }
            }
        }
    }
}

@Composable
private fun FloatingGain(f: Floater, onDone: () -> Unit) {
    val progress = remember { Animatable(0f) }
    LaunchedEffect(Unit) {
        progress.animateTo(1f, tween(1800))
        onDone()
    }
    Box(Modifier.fillMaxSize()) {
        Row(
            Modifier
                .align(Alignment.TopStart)
                .offset { IntOffset(0, (-(progress.value * 90)).dp.roundToPx()) }
                .padding(top = 120.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
        ) {
            Row(
                Modifier
                    .offset { IntOffset(((f.xFraction - 0.5f) * 400).dp.roundToPx(), 0) }
                    .alpha(1f - progress.value * progress.value),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (f.kind != null) {
                    ResourceIcon(f.kind, size = 24.dp)
                } else {
                    Icon(GameIcons.MapPin, null, tint = f.color, modifier = Modifier.size(24.dp))
                }
                Spacer(Modifier.width(4.dp))
                Text(f.text, style = MaterialTheme.typography.headlineMedium, color = f.color, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun AiTurnOverlay(visible: Boolean) {
    AnimatedVisibility(visible, enter = fadeIn(), exit = fadeOut()) {
        Box(Modifier.fillMaxSize().background(Ink900.copy(alpha = 0.35f)), contentAlignment = Alignment.Center) {
            GamePanel(alpha = 0.96f) {
                Row(Modifier.padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(Modifier.size(18.dp), color = Gold, strokeWidth = 2.dp)
                    Spacer(Modifier.width(12.dp))
                    Text(stringResource(R.string.phase_ai_acting), style = MaterialTheme.typography.titleMedium, color = TextHigh)
                }
            }
        }
    }
}
