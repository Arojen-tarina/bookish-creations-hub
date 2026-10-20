package fi.bookish.creations.arojen.tarinat.ui.screens.faction

import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.data.FACTION_DATA_1206
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.components.WordFitText
import fi.bookish.creations.arojen.tarinat.ui.game.FactionStyle
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceIcon
import fi.bookish.creations.arojen.tarinat.ui.game.hud.ResourceKind
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.game.rulerRes
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.Sky
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid

/** Presentation data per playable realm (from the original faction select). */
private data class RealmCard(
    val id: FactionId,
    val cavalry: Int,
    val economy: Int,
    val defense: Int,
    /** How hard the realm is to play well. */
    val challenge: Difficulty,
    @param:StringRes val ability: Int,
    @param:StringRes val flavor: Int,
)

private val REALMS = mapOf(
    FactionId.MONGOL to RealmCard(FactionId.MONGOL, 5, 2, 2, Difficulty.NORMAL, R.string.ability_mongol, R.string.faction_flavor_mongol),
    FactionId.SONG to RealmCard(FactionId.SONG, 1, 5, 3, Difficulty.EASY, R.string.ability_song, R.string.faction_flavor_song),
    FactionId.RUS to RealmCard(FactionId.RUS, 2, 3, 4, Difficulty.HARD, R.string.ability_rus, R.string.faction_flavor_rus),
    FactionId.KHWAREZM to RealmCard(FactionId.KHWAREZM, 3, 4, 3, Difficulty.NORMAL, R.string.ability_khwarezm, R.string.faction_flavor_khwarezm),
)

@get:StringRes
val Difficulty.labelRes: Int
    get() = when (this) {
        Difficulty.EASY -> R.string.difficulty_easy
        Difficulty.NORMAL -> R.string.difficulty_normal
        Difficulty.HARD -> R.string.difficulty_hard
    }

@get:StringRes
private val Difficulty.descRes: Int
    get() = when (this) {
        Difficulty.EASY -> R.string.difficulty_easy_desc
        Difficulty.NORMAL -> R.string.difficulty_normal_desc
        Difficulty.HARD -> R.string.difficulty_hard_desc
    }

private val Difficulty.color: Color
    get() = when (this) {
        Difficulty.EASY -> Jade
        Difficulty.NORMAL -> Gold
        Difficulty.HARD -> Rust
    }

/**
 * Choose a realm and difficulty: 2 x 2 realm tiles beside the selected realm's dossier.
 * [replaces] describes the campaign in the autosave, if any: starting asks first, since
 * the new campaign takes its place.
 */
@Composable
fun FactionSelectScreen(replaces: String?, onStart: (FactionId, Difficulty) -> Unit, onBack: () -> Unit) {
    var selectedName by rememberSaveable { mutableStateOf(FactionId.MONGOL.name) }
    var difficultyName by rememberSaveable { mutableStateOf(Difficulty.NORMAL.name) }
    var showGuide by rememberSaveable { mutableStateOf(false) }
    var confirmReplace by rememberSaveable { mutableStateOf(false) }
    val selected = FactionId.valueOf(selectedName)
    val difficulty = Difficulty.valueOf(difficultyName)

    BoardBackdrop {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 16.dp, vertical = 10.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                RoundIconButton(GameIcons.Back, stringResource(R.string.common_back), onBack, size = 40.dp)
                Spacer(Modifier.width(12.dp))
                Column(Modifier.weight(1f)) {
                    Text(stringResource(R.string.faction_select_title), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
                    Text(stringResource(R.string.faction_select_hint), style = MaterialTheme.typography.bodySmall, color = TextMid, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                GuideButton { showGuide = true }
            }
            Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(Modifier.weight(1.1f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    for (row in ACTIVE_FACTIONS.chunked(2)) {
                        Row(Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            for (id in row) {
                                RealmTile(REALMS.getValue(id), id == selected, Modifier.weight(1f).fillMaxHeight()) { selectedName = id.name }
                            }
                        }
                    }
                }
                Dossier(
                    realm = REALMS.getValue(selected),
                    difficulty = difficulty,
                    onDifficulty = { difficultyName = it.name },
                    onStart = { if (replaces != null) confirmReplace = true else onStart(selected, difficulty) },
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                )
            }
        }
    }

    if (showGuide) HowToPlayDialog { showGuide = false }

    if (confirmReplace && replaces != null) {
        Dialog(onDismissRequest = { confirmReplace = false }) {
            GamePanel(Modifier.widthIn(max = 420.dp), alpha = 0.98f) {
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(stringResource(R.string.new_game_replace_title), style = MaterialTheme.typography.headlineSmall, color = GoldBright, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(8.dp))
                    Text(stringResource(R.string.new_game_replace_body, replaces), style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        GameButton(stringResource(R.string.save_cancel), { confirmReplace = false }, style = GameButtonStyle.Secondary)
                        GameButton(stringResource(R.string.new_game_replace_yes), {
                            confirmReplace = false
                            onStart(selected, difficulty)
                        })
                    }
                }
            }
        }
    }
}

@Composable
private fun GuideButton(onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Row(
        Modifier
            .clip(shape)
            .background(Ink700.copy(alpha = 0.9f))
            .border(1.dp, Gold.copy(alpha = 0.6f), shape)
            .clickable(role = Role.Button, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(GameIcons.Scroll, null, tint = GoldBright, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(8.dp))
        Text(stringResource(R.string.faction_how_to_play), style = MaterialTheme.typography.labelLarge, color = TextHigh)
    }
}

@Composable
private fun RealmTile(realm: RealmCard, selected: Boolean, modifier: Modifier, onClick: () -> Unit) {
    val color = FactionStyle.color(realm.id)
    val shape = RoundedCornerShape(14.dp)
    val lift by animateFloatAsState(if (selected) 1f else 0f, label = "lift")
    Box(
        modifier
            .graphicsLayer {
                val s = 1f + 0.02f * lift
                scaleX = s
                scaleY = s
            }
            .clip(shape)
            .background(Brush.linearGradient(listOf(color.copy(alpha = 0.38f), Ink900.copy(alpha = 0.94f))))
            .border(if (selected) 2.dp else 1.dp, if (selected) GoldBright else color.copy(alpha = 0.55f), shape)
            .clickable(role = Role.RadioButton, onClick = onClick),
    ) {
        Image(
            painterResource(FactionStyle.leaderSprite(realm.id)),
            contentDescription = null,
            contentScale = ContentScale.Fit,
            alignment = Alignment.BottomEnd,
            modifier = Modifier.fillMaxHeight().fillMaxWidth(0.6f).align(Alignment.BottomEnd).padding(top = 8.dp, end = 4.dp),
        )
        // Keeps the name and badge readable where the portrait reaches under them.
        Box(
            Modifier
                .matchParentSize()
                .background(Brush.horizontalGradient(0f to Ink900.copy(alpha = 0.75f), 0.45f to Ink900.copy(alpha = 0.35f), 0.7f to Color.Transparent)),
        )
        Column(Modifier.padding(12.dp).fillMaxWidth(0.62f)) {
            Box(Modifier.size(10.dp).clip(CircleShape).background(color))
            Spacer(Modifier.height(6.dp))
            WordFitText(stringResource(realm.id.nameRes), MaterialTheme.typography.titleMedium, TextHigh)
            realm.id.rulerRes?.let { Text(stringResource(it), style = MaterialTheme.typography.bodySmall, color = TextMid, maxLines = 1, overflow = TextOverflow.Ellipsis) }
        }
        Box(Modifier.align(Alignment.BottomStart).padding(12.dp)) { ChallengeBadge(realm.challenge) }
    }
}

@Composable
private fun ChallengeBadge(d: Difficulty) {
    Text(
        stringResource(R.string.faction_challenge, stringResource(d.labelRes)),
        style = MaterialTheme.typography.labelSmall,
        color = d.color,
        maxLines = 1,
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(Ink900.copy(alpha = 0.85f))
            .background(d.color.copy(alpha = 0.16f))
            .border(1.dp, d.color.copy(alpha = 0.7f), RoundedCornerShape(50))
            .padding(horizontal = 8.dp, vertical = 3.dp),
    )
}

@Composable
private fun Dossier(
    realm: RealmCard,
    difficulty: Difficulty,
    onDifficulty: (Difficulty) -> Unit,
    onStart: () -> Unit,
    modifier: Modifier,
) {
    val color = FactionStyle.color(realm.id)
    val start = FACTION_DATA_1206.getValue(realm.id)
    GamePanel(modifier) {
        Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(14.dp)) {
            AnimatedContent(realm.id, transitionSpec = { fadeIn() togetherWith fadeOut() }, label = "dossier") { id ->
                val r = REALMS.getValue(id)
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(12.dp).clip(CircleShape).background(FactionStyle.color(id)))
                        Spacer(Modifier.width(8.dp))
                        Text(stringResource(id.nameRes), style = MaterialTheme.typography.headlineSmall, color = GoldBright)
                    }
                    Text(
                        stringResource(r.flavor),
                        style = MaterialTheme.typography.bodySmall.copy(fontStyle = FontStyle.Italic),
                        color = TextMid,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                    Spacer(Modifier.height(10.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        StatColumn(Modifier.weight(1f), GameIcons.Horseshoe, R.string.stat_cavalry, r.cavalry, Color(0xFFF87171))
                        StatColumn(Modifier.weight(1f), GameIcons.Market, R.string.stat_economy, r.economy, Color(0xFFFBBF24))
                        StatColumn(Modifier.weight(1f), GameIcons.Shield, R.string.stat_defense, r.defense, Sky)
                    }
                    Spacer(Modifier.height(10.dp))
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(color.copy(alpha = 0.14f))
                            .border(1.dp, color.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                            .padding(10.dp),
                    ) {
                        Text(stringResource(R.string.faction_special_ability), style = MaterialTheme.typography.labelMedium, color = Gold)
                        Text(stringResource(r.ability), style = MaterialTheme.typography.bodyMedium, color = TextHigh)
                    }
                }
            }
        }
        // The starting amounts, difficulty and start button stay pinned so they are always on screen.
        Column(Modifier.padding(start = 14.dp, end = 14.dp, top = 8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    stringResource(R.string.faction_starting),
                    style = MaterialTheme.typography.labelMedium,
                    color = TextLow,
                    modifier = Modifier.weight(1f, fill = false),
                )
                StartAmount(ResourceKind.GOLD, start.treasury)
                StartAmount(ResourceKind.MANPOWER, start.manpower)
                StartAmount(ResourceKind.HORSES, start.horses)
            }
            Spacer(Modifier.height(8.dp))
            Text(stringResource(R.string.faction_difficulty), style = MaterialTheme.typography.labelMedium, color = TextLow)
            Row(Modifier.padding(top = 6.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                for (d in Difficulty.entries) {
                    val on = d == difficulty
                    val shape = RoundedCornerShape(8.dp)
                    Text(
                        stringResource(d.labelRes),
                        style = MaterialTheme.typography.labelLarge,
                        color = if (on) Ink900 else d.color,
                        modifier = Modifier
                            .weight(1f)
                            .clip(shape)
                            .background(if (on) d.color else Ink700)
                            .border(1.dp, d.color.copy(alpha = if (on) 1f else 0.5f), shape)
                            .clickable(role = Role.RadioButton) { onDifficulty(d) }
                            .padding(vertical = 8.dp),
                        textAlign = TextAlign.Center,
                    )
                }
            }
            Text(
                stringResource(difficulty.descRes),
                style = MaterialTheme.typography.bodySmall,
                color = TextMid,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
        GameButton(
            text = stringResource(R.string.faction_lead_prompt, stringResource(realm.id.nameRes)),
            onClick = onStart,
            modifier = Modifier.fillMaxWidth().padding(start = 14.dp, end = 14.dp, top = 8.dp, bottom = 12.dp),
        )
    }
}

/** Rating out of five: icon and label over a row of pips. */
@Composable
private fun StatColumn(modifier: Modifier, icon: ImageVector, @StringRes label: Int, value: Int, color: Color) {
    Column(modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = color, modifier = Modifier.size(15.dp))
            Spacer(Modifier.width(5.dp))
            Text(stringResource(label), style = MaterialTheme.typography.labelMedium, color = TextHigh, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Spacer(Modifier.height(5.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
            repeat(5) { i ->
                Box(Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(50)).background(if (i < value) color else Ink500))
            }
        }
    }
}

@Composable
private fun StartAmount(kind: ResourceKind, amount: Int) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        ResourceIcon(kind)
        Spacer(Modifier.width(4.dp))
        Text(amount.toString(), style = MaterialTheme.typography.labelLarge, color = kind.color)
    }
}
