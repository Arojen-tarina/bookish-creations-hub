package fi.bookish.creations.arojen.tarinat.ui.game.overlays

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.animateIntAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.BattleReport
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.signed
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.game.panels.formatNumber
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.Sky
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlin.random.Random
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

private enum class BattlePhase { Intro, Clash, Rolling, Power, Losses, Result }

/**
 * Animated battle report: the armies meet, the dice roll, power totals and
 * losses are revealed, then the outcome. Tap anywhere to skip to the result.
 */
@Composable
fun BattleDialog(
    battle: BattleReport,
    provinceName: String,
    /** Whether the attacker now owns the province (forts can hold even after a won assault). */
    captured: Boolean,
    onClose: () -> Unit,
) {
    var phase by remember(battle) { mutableStateOf(BattlePhase.Intro) }
    var attackFace by remember(battle) { mutableIntStateOf(1) }
    var defenseFace by remember(battle) { mutableIntStateOf(1) }
    val flash = remember(battle) { Animatable(0f) }
    val shake = remember(battle) { Animatable(0f) }

    LaunchedEffect(battle) {
        delay(650)
        phase = BattlePhase.Clash
        launch { flash.snapTo(0.7f); flash.animateTo(0f, tween(600)) }
        launch { repeat(5) { i -> shake.animateTo(if (i % 2 == 0) 10f else -10f, tween(50)) }; shake.animateTo(0f, tween(60)) }
        delay(700)
        phase = BattlePhase.Rolling
        repeat(14) {
            attackFace = Random.nextInt(1, 7)
            defenseFace = Random.nextInt(1, 7)
            delay(90)
        }
        attackFace = battle.attackRoll
        defenseFace = battle.defenseRoll
        phase = BattlePhase.Power
        delay(1000)
        phase = BattlePhase.Losses
        delay(1300)
        phase = BattlePhase.Result
    }

    fun skip() {
        if (phase != BattlePhase.Result) {
            attackFace = battle.attackRoll
            defenseFace = battle.defenseRoll
            phase = BattlePhase.Result
        }
    }

    Dialog(onDismissRequest = { if (phase == BattlePhase.Result) onClose() else skip() }, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Box(
            Modifier
                .fillMaxSize()
                .clickable(remember { MutableInteractionSource() }, indication = null) { skip() },
            contentAlignment = Alignment.Center,
        ) {
            GamePanel(
                Modifier
                    .widthIn(max = 640.dp)
                    .fillMaxWidth(0.92f)
                    .offset { IntOffset(shake.value.toInt(), 0) },
                alpha = 0.98f,
            ) {
                Box {
                    Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        val attacker = stringResource(battle.attackerFaction.nameRes)
                        val defender = stringResource(battle.defenderFaction.nameRes)
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(GameIcons.Swords, null, tint = Rust, modifier = Modifier.size(22.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(stringResource(R.string.battle_title, provinceName), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
                        }
                        Text(stringResource(R.string.battle_versus, attacker, defender), style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
                        Spacer(Modifier.height(12.dp))

                        val showLosses = phase >= BattlePhase.Losses
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Combatant(
                                Modifier.weight(1f), battle.attacker, battle.attackerFaction, stringResource(R.string.battle_attacker),
                                battle.attackerLosses.cavalry, battle.attackerLosses.infantry, showLosses,
                            )
                            Column(Modifier.width(150.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                if (phase == BattlePhase.Intro) {
                                    Text(stringResource(R.string.battle_clash), style = MaterialTheme.typography.titleMedium, color = Rust, textAlign = TextAlign.Center)
                                } else {
                                    Text(stringResource(R.string.battle_dice), style = MaterialTheme.typography.labelSmall, color = TextLow)
                                    Spacer(Modifier.height(6.dp))
                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        Die(if (phase >= BattlePhase.Rolling) attackFace else 1, Color(0xFFF87171))
                                        Die(if (phase >= BattlePhase.Rolling) defenseFace else 1, Sky)
                                    }
                                    if (phase >= BattlePhase.Power) {
                                        Spacer(Modifier.height(10.dp))
                                        Text(stringResource(R.string.battle_total_power), style = MaterialTheme.typography.labelSmall, color = TextLow)
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(formatNumber(battle.attackerPower), style = MaterialTheme.typography.headlineSmall, color = Color(0xFFF87171), fontWeight = FontWeight.Bold)
                                            Text("  :  ", style = MaterialTheme.typography.titleMedium, color = TextLow)
                                            Text(formatNumber(battle.defenderPower), style = MaterialTheme.typography.headlineSmall, color = Sky, fontWeight = FontWeight.Bold)
                                        }
                                    }
                                }
                            }
                            Combatant(
                                Modifier.weight(1f), battle.defender, battle.defenderFaction, stringResource(R.string.battle_defender),
                                battle.defenderLosses.cavalry, battle.defenderLosses.infantry, showLosses,
                            )
                        }

                        AnimatedVisibility(phase == BattlePhase.Result, enter = fadeIn() + scaleIn(initialScale = 0.8f)) {
                            Column(Modifier.padding(top = 14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                val winnerColor = FactionStyle.color(if (battle.attackerWon) battle.attackerFaction else battle.defenderFaction)
                                Text(
                                    if (battle.attackerWon) stringResource(R.string.battle_attacker_wins, attacker) else stringResource(R.string.battle_defender_holds, defender),
                                    style = MaterialTheme.typography.headlineSmall,
                                    color = winnerColor,
                                    textAlign = TextAlign.Center,
                                )
                                Text(
                                    stringResource(
                                        when {
                                            !battle.attackerWon -> R.string.battle_attack_repelled
                                            captured -> R.string.battle_province_taken
                                            else -> R.string.battle_walls_hold
                                        },
                                    ),
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = TextMid,
                                    textAlign = TextAlign.Center,
                                )
                                Spacer(Modifier.height(12.dp))
                                GameButton(stringResource(R.string.battle_continue), onClose, Modifier.width(200.dp))
                            }
                        }
                        if (phase != BattlePhase.Result) {
                            Spacer(Modifier.height(10.dp))
                            Text(stringResource(R.string.battle_skip), style = MaterialTheme.typography.labelSmall, color = TextLow)
                        }
                    }
                    // Clash flash
                    if (flash.value > 0f) Box(Modifier.matchParentSize().background(Color.White.copy(alpha = flash.value)))
                }
            }
        }
    }
}

@Composable
private fun Combatant(
    modifier: Modifier,
    army: Army,
    faction: FactionId,
    role: String,
    cavalryLoss: Int,
    infantryLoss: Int,
    showLosses: Boolean,
) {
    val color = FactionStyle.color(faction)
    val sprite = when {
        army.isChief -> FactionStyle.leaderSprite(faction)
        army.cavalry >= army.infantry && army.cavalry > 0 -> FactionStyle.cavalrySprite(faction)
        else -> FactionStyle.infantrySprite(faction)
    }
    val shape = RoundedCornerShape(12.dp)
    Column(
        modifier
            .clip(shape)
            .background(Brush.verticalGradient(listOf(color.copy(alpha = 0.22f), Ink900.copy(alpha = 0.6f))))
            .border(1.dp, color.copy(alpha = if (showLosses && (cavalryLoss + infantryLoss) > 0) 0.9f else 0.5f), shape)
            .padding(10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(stringResource(faction.nameRes), style = MaterialTheme.typography.titleSmall, color = color, textAlign = TextAlign.Center, maxLines = 1)
        Text(role, style = MaterialTheme.typography.labelSmall, color = TextLow)
        Image(painterResource(sprite), null, Modifier.size(width = 96.dp, height = 72.dp))
        UnitRow(GameIcons.Horseshoe, army.cavalry, cavalryLoss, showLosses)
        UnitRow(GameIcons.Sword, army.infantry, infantryLoss, showLosses)
    }
}

@Composable
private fun UnitRow(icon: ImageVector, from: Int, loss: Int, showLosses: Boolean) {
    val shown by animateIntAsState(if (showLosses) from - loss else from, tween(900), label = "units")
    Row(Modifier.padding(top = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = TextMid, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(6.dp))
        Text(shown.coerceAtLeast(0).toString(), style = MaterialTheme.typography.titleMedium, color = TextHigh, fontWeight = FontWeight.Bold)
        if (showLosses && loss > 0) {
            Spacer(Modifier.width(6.dp))
            Text(signed(-loss), style = MaterialTheme.typography.labelLarge, color = Rust)
        }
    }
}

/** A die face with pips. */
@Composable
private fun Die(value: Int, color: Color) {
    Canvas(Modifier.size(46.dp)) {
        val s = size.minDimension
        drawRoundRect(color.copy(alpha = 0.18f), cornerRadius = CornerRadius(s * 0.2f))
        drawRoundRect(color, cornerRadius = CornerRadius(s * 0.2f), style = Stroke(s * 0.05f))
        val r = s * 0.085f
        val a = s * 0.27f
        val m = s * 0.5f
        val b = s * 0.73f
        val pips = when (value) {
            1 -> listOf(m to m)
            2 -> listOf(b to a, a to b)
            3 -> listOf(b to a, m to m, a to b)
            4 -> listOf(a to a, b to a, a to b, b to b)
            5 -> listOf(a to a, b to a, m to m, a to b, b to b)
            else -> listOf(a to a, b to a, a to m, b to m, a to b, b to b)
        }
        pips.forEach { (x, y) -> drawCircle(color, r, Offset(x, y)) }
    }
}
