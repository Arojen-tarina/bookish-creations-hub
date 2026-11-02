package fi.bookish.creations.arojen.tarinat.ui.game

import androidx.activity.compose.BackHandler
import androidx.activity.compose.LocalActivity
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.exclude
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ads.AdBanner
import fi.bookish.creations.arojen.tarinat.ads.AdBreak
import fi.bookish.creations.arojen.tarinat.ads.AdUnits
import fi.bookish.creations.arojen.tarinat.ads.Ads
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import fi.bookish.creations.arojen.tarinat.audio.MusicMood
import fi.bookish.creations.arojen.tarinat.billing.Premium
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.data.SettingsRepository
import fi.bookish.creations.arojen.tarinat.game.engine.TributeKind
import fi.bookish.creations.arojen.tarinat.game.engine.canDrawTributeCard
import fi.bookish.creations.arojen.tarinat.game.engine.canTakeSecondChance
import fi.bookish.creations.arojen.tarinat.game.engine.canTakeTribute
import fi.bookish.creations.arojen.tarinat.game.engine.tributeGold
import fi.bookish.creations.arojen.tarinat.moose.MooseGuide
import fi.bookish.creations.arojen.tarinat.multiplayer.Multiplayer
import fi.bookish.creations.arojen.tarinat.play.ReviewPrompt
import fi.bookish.creations.arojen.tarinat.ui.achievements.AchievementToast
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.game.cards.CardDetailDialog
import fi.bookish.creations.arojen.tarinat.ui.game.cards.CardTray
import fi.bookish.creations.arojen.tarinat.ui.game.cards.rememberCardTexts
import fi.bookish.creations.arojen.tarinat.ui.game.hud.PanelTab
import fi.bookish.creations.arojen.tarinat.ui.game.hud.TopBar
import fi.bookish.creations.arojen.tarinat.ui.game.map.GameMap
import fi.bookish.creations.arojen.tarinat.ui.game.map.rememberMapCameraState
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.AiTurnOverlay
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.ArmyBanner
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.BattleDialog
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.EngagementLayer
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.GameOverDialog
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.IncomeToast
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.MessageToast
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.PauseMenuDialog
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.TributeButton
import fi.bookish.creations.arojen.tarinat.ui.game.overlays.TributeDialog
import fi.bookish.creations.arojen.tarinat.ui.game.panels.ChroniclePanel
import fi.bookish.creations.arojen.tarinat.ui.game.panels.DiplomacyPanel
import fi.bookish.creations.arojen.tarinat.ui.game.panels.ProvinceActions
import fi.bookish.creations.arojen.tarinat.ui.game.panels.ProvincePanel
import fi.bookish.creations.arojen.tarinat.ui.game.panels.RealmPanel
import fi.bookish.creations.arojen.tarinat.ui.game.panels.SidePanel
import fi.bookish.creations.arojen.tarinat.ui.game.panels.SidePanelWidth
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.moose.MooseButton
import fi.bookish.creations.arojen.tarinat.ui.moose.MooseDialog
import fi.bookish.creations.arojen.tarinat.ui.multiplayer.ChatButton
import fi.bookish.creations.arojen.tarinat.ui.multiplayer.ChatDialog
import fi.bookish.creations.arojen.tarinat.ui.multiplayer.PlayersButton
import fi.bookish.creations.arojen.tarinat.ui.multiplayer.PlayersSheet
import fi.bookish.creations.arojen.tarinat.ui.multiplayer.TurnBanner
import fi.bookish.creations.arojen.tarinat.ui.screens.saves.SaveGameDialog
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/** The campaign screen: board, HUD, side panel, card hand and all in-game overlays. */
@Composable
fun GameScreen(
    saves: SaveRepository,
    achievements: AchievementRepository,
    moose: MooseGuide,
    music: GameMusic,
    settings: SettingsRepository,
    ads: Ads,
    premium: Premium,
    review: ReviewPrompt,
    onExit: () -> Unit,
    onNewGame: () -> Unit,
    onLoadGame: () -> Unit,
    onRulebook: () -> Unit,
    onSettings: () -> Unit,
    /** Online play, for the room's chat; null in a single-player campaign. */
    multiplayer: Multiplayer? = null,
    room: String? = null,
    viewModel: GameViewModel = viewModel(factory = GameViewModel.Factory),
) {
    val session = room?.let { id -> multiplayer?.session(id) }
    var chatOpen by rememberSaveable { mutableStateOf(false) }
    var playersOpen by rememberSaveable { mutableStateOf(false) }
    // Leaving the app (home button, call, screen off) always keeps the campaign.
    LifecycleEventEffect(Lifecycle.Event.ON_STOP) { viewModel.autosaveNow() }
    var saveDialogOpen by rememberSaveable { mutableStateOf(false) }
    var mooseOpen by rememberSaveable { mutableStateOf(false) }
    val ui by viewModel.ui.collectAsStateWithLifecycle()
    val game = ui.game
    val camera = rememberMapCameraState()
    val scope = rememberCoroutineScope()
    val cardTexts = rememberCardTexts()

    var panel by rememberSaveable { mutableStateOf<PanelTab?>(null) }
    // Tab drawn by the drawer, kept while it slides out after closing.
    var lastPanel by rememberSaveable { mutableStateOf(PanelTab.Province) }
    fun openPanel(tab: PanelTab?) {
        panel = tab
        if (tab != null) lastPanel = tab
    }
    var trayOpen by rememberSaveable { mutableStateOf(false) }
    var detailCardId by rememberSaveable { mutableStateOf<String?>(null) }
    var pauseOpen by rememberSaveable { mutableStateOf(false) }

    // One message at a time, in order.
    val queue = remember { mutableStateListOf<GameMessage>() }
    var message by remember { mutableStateOf<GameMessage?>(null) }
    LaunchedEffect(viewModel) { viewModel.messages.collect { queue += it } }
    LaunchedEffect(queue.size, message) {
        if (message == null && queue.isNotEmpty()) message = queue.removeAt(0)
    }

    // Open on the player's capital, framed below the HUD (a camera coming back from
    // another screen keeps the player's view).
    val density = LocalDensity.current
    LaunchedEffect(camera) {
        camera.topInset = with(density) { 68.dp.toPx() }
        snapshotFlow { camera.isReady }.first { it }
        if (camera.restored) return@LaunchedEffect
        game.province(game.player.capitalId)?.let {
            camera.animateIntoView(Offset(it.center.x.toFloat(), it.center.y.toFloat()), force = true)
        }
    }

    // An open drawer covers the right of the map: let the map slide clear of it,
    // and bring the province being inspected into the visible part.
    val drawerPx = with(density) { (SidePanelWidth + 16.dp).toPx() }
    LaunchedEffect(panel != null, ui.selectedProvinceId) {
        camera.setRightInset(if (panel != null) drawerPx else 0f)
        if (panel != null) {
            ui.selectedProvinceId?.let { game.province(it) }?.let {
                camera.animateIntoView(Offset(it.center.x.toFloat(), it.center.y.toFloat()))
            }
        }
    }

    // Combat music from the player's first battle of a turn until the turn ends, as in the original.
    var combatTurn by rememberSaveable { mutableIntStateOf(0) }
    LaunchedEffect(ui.lastBattle) { if (ui.lastBattle != null) combatTurn = game.turn }
    val mood = if (combatTurn == game.turn) MusicMood.COMBAT else MusicMood.CALM
    LaunchedEffect(mood) { music.setMood(mood) }
    DisposableEffect(music) { onDispose { music.setMood(MusicMood.CALM) } }

    // Income summary at the start of every turn, once: not again when coming back from the rulebook.
    var incomeShownTurn by rememberSaveable { mutableIntStateOf(0) }
    var incomeVisible by remember { mutableStateOf(false) }
    LaunchedEffect(game.turn) {
        if (incomeShownTurn == game.turn) return@LaunchedEffect
        // An advert at the end of the turn covers the screen: show the summary once it is gone.
        ads.fullScreenShowing.first { !it }
        incomeShownTurn = game.turn
        incomeVisible = true
        delay(4000)
        incomeVisible = false
    }

    // Adverts and the rating card need the activity to show over.
    val activity = LocalActivity.current
    val rewardReady by ads.rewardReady.collectAsStateWithLifecycle()
    val adFree by ads.adFree.collectAsStateWithLifecycle()
    // Where an advert stands before a reward, Premium is offered as the way to skip it.
    val premiumOffer by premium.offer.collectAsStateWithLifecycle()
    val premiumPrice = premiumOffer?.price
    val subscribe = { activity?.let(premium::subscribe); Unit }
    var tributeOpen by rememberSaveable { mutableStateOf(false) }
    val tributeOffered = rewardReady && canTakeTribute(game) && ui.canAct
    fun askTribute(kind: TributeKind) {
        tributeOpen = false
        val shown = activity != null && ads.showReward(activity) { viewModel.takeTribute(kind) }
        if (!shown) queue += GameMessage(R.string.tribute_unavailable, tone = Tone.Negative)
    }
    // After a defeat: replay the lost turn once per campaign, only while an advert is ready.
    val secondChanceOffered = rewardReady && canTakeSecondChance(game) && session == null
    fun askSecondChance() {
        if (activity != null) ads.showReward(activity) { viewModel.takeSecondChance() }
    }

    val victory = game.gameOver && game.winnerId == game.playerFactionId
    // A won campaign is a good moment to ask for a rating (Play decides whether the card appears).
    LaunchedEffect(victory) {
        if (!victory || activity == null) return@LaunchedEffect
        delay(1500)
        review.maybeAsk(activity, achievements.stats.value, afterVictory = true)
    }

    /** Runs [then] after a natural-break advert, when one is due. */
    fun adBreak(moment: AdBreak, turn: Int, then: () -> Unit) {
        if (activity == null) then() else ads.interstitialBreak(activity, moment, turn, then)
    }

    BackHandler {
        when {
            detailCardId != null -> detailCardId = null
            panel != null -> panel = null
            ui.selectedArmyId != null -> viewModel.clearSelection()
            else -> pauseOpen = true
        }
    }

    // Placed after every hook above: the early return must not change the hook order.
    if (ui.loading) {
        Box(Modifier.fillMaxSize().background(Ink900), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Gold)
        }
        return
    }

    Box(Modifier.fillMaxSize().background(Ink900)) {
        GameMap(
            state = game,
            selectedProvinceId = ui.selectedProvinceId,
            selectedArmyId = ui.selectedArmyId,
            moveTargets = ui.moveTargets,
            attackTargets = ui.attackTargets,
            onProvinceTap = { id -> if (!viewModel.onProvinceTap(id)) openPanel(PanelTab.Province) },
            onArmyTap = viewModel::onArmyTap,
            camera = camera,
            modifier = Modifier.fillMaxSize(),
        )
        EngagementLayer(game)

        Column(
            Modifier
                .fillMaxSize()
                // The Moose guide's keyboard must not squeeze the screen behind its dialog.
                .windowInsetsPadding(WindowInsets.safeDrawing.exclude(WindowInsets.ime))
                .padding(8.dp),
        ) {
            TopBar(
                game = game,
                openTab = panel,
                endTurnEnabled = ui.canAct && !game.gameOver,
                onMenu = { pauseOpen = true },
                onTab = { tab -> openPanel(if (panel == tab) null else tab) },
                onEndTurn = {
                    val ended = game.turn
                    viewModel.endTurn()
                    // The rival realms move behind the advert, so it costs the player no waiting.
                    // Online the others are waiting for this turn: no advert there.
                    if (session == null) adBreak(AdBreak.TURN_END, ended) {}
                },
            )
            Spacer(Modifier.padding(top = 8.dp))
            Row(Modifier.fillMaxSize()) {
                Box(Modifier.weight(1f).fillMaxHeight()) {
                    Column(
                        Modifier.align(Alignment.TopCenter),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        if (session != null) TurnBanner(ui, onSkip = viewModel::skipAbsentPlayer)
                        IncomeToast(game, incomeVisible)
                        MessageToast(message, cardTexts, onDone = { message = null })
                        AchievementToast(achievements)
                        ui.selectedArmyId?.let { id -> game.armies.firstOrNull { it.id == id } }?.let { ArmyBanner(it) }
                    }

                    // Map controls stacked above the Moose in the bottom corner, so they never overlap,
                    // even on a short screen with the tribute chest showing. The open card tray leaves this strip free.
                    Column(
                        Modifier.align(Alignment.BottomEnd),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        // The tribute (only while one can be taken and an advert is ready) and, online, the
                        // players and the chat share one row, so the column still fits above the Moose.
                        val online = session != null && multiplayer != null
                        if (tributeOffered || online) {
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                if (tributeOffered) TributeButton({ tributeOpen = true }, size = 44.dp)
                                if (session != null && multiplayer != null) {
                                    PlayersButton(onOpen = { playersOpen = true })
                                    ChatButton(session, multiplayer, chatOpen, onOpen = { chatOpen = true })
                                }
                            }
                        }
                        RoundIconButton(GameIcons.ZoomIn, stringResource(R.string.map_zoom_in), { scope.launch { camera.animateZoomBy(1.6f) } })
                        RoundIconButton(GameIcons.ZoomOut, stringResource(R.string.map_zoom_out), { scope.launch { camera.animateZoomBy(1 / 1.6f) } })
                        RoundIconButton(GameIcons.FitMap, stringResource(R.string.map_show_all), { scope.launch { camera.animateToFit() } })
                        Spacer(Modifier.height(4.dp))
                        MooseButton({ mooseOpen = true })
                    }

                    CardTray(
                        game = game,
                        texts = cardTexts,
                        expanded = trayOpen,
                        onToggle = { trayOpen = !trayOpen },
                        onCardClick = { detailCardId = it.id },
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .then(if (trayOpen) Modifier.fillMaxWidth().padding(end = 52.dp) else Modifier),
                    )
                }

                AnimatedVisibility(
                    panel != null,
                    enter = slideInHorizontally { it } + fadeIn(),
                    exit = slideOutHorizontally { it } + fadeOut(),
                ) {
                    SidePanel(
                        tab = lastPanel,
                        onTab = { openPanel(it) },
                        onClose = { openPanel(null) },
                        modifier = Modifier.padding(start = 8.dp).width(SidePanelWidth),
                        // The drawer is where the player reads, never over the map itself.
                        footer = { AdBanner(ads, AdUnits.BANNER_GAME, Modifier.padding(6.dp)) },
                    ) {
                        when (lastPanel) {
                            PanelTab.Province -> {
                                val pid = ui.selectedProvinceId
                                ProvincePanel(
                                    game = game,
                                    province = pid?.let { game.province(it) },
                                    selectedArmyId = ui.selectedArmyId,
                                    actions = ProvinceActions(
                                        onSelectArmy = viewModel::onArmyTap,
                                        onMergeInto = viewModel::mergeSelectedInto,
                                        onRecruit = { type -> pid?.let { viewModel.recruit(it, type) } },
                                        onRepair = { useArtisan -> pid?.let { viewModel.repair(it, useArtisan) } },
                                        onBuild = { type -> pid?.let { viewModel.build(it, type) } },
                                    ),
                                )
                            }
                            PanelTab.Realm -> RealmPanel(game, cardTexts)
                            PanelTab.Chronicle -> ChroniclePanel(game)
                            PanelTab.Diplomacy -> DiplomacyPanel(game, viewModel::propose, viewModel::breakTreaty)
                        }
                    }
                }
            }
        }

        AiTurnOverlay(ui.processingTurn)

        ui.lastBattle?.let { battle ->
            BattleDialog(
                battle = battle,
                provinceName = game.province(battle.provinceId)?.name.orEmpty(),
                captured = game.province(battle.provinceId)?.ownerId == battle.attackerFaction,
                onClose = viewModel::dismissBattle,
            )
        }

        detailCardId?.let { id ->
            game.hand.firstOrNull { it.id == id }?.let { card ->
                CardDetailDialog(
                    card = card,
                    text = cardTexts[id],
                    onPlay = {
                        viewModel.playCard(id)
                        detailCardId = null
                    },
                    onDismiss = { detailCardId = null },
                )
            }
        }

        if (game.gameOver && ui.lastBattle == null) {
            // After a defeat the advert comes as the player leaves; a victory gets the rating card instead.
            fun leave(then: () -> Unit) = if (victory) then() else adBreak(AdBreak.GAME_OVER, game.turn, then)
            GameOverDialog(
                game,
                onPlayAgain = {
                    viewModel.noteRestart()
                    if (session != null) multiplayer?.forget(session.roomId)
                    leave(onNewGame)
                },
                onMainMenu = {
                    // A finished online match is over for this phone too.
                    if (session != null) multiplayer?.forget(session.roomId)
                    leave(onExit)
                },
                onSecondChance = if (secondChanceOffered) ::askSecondChance else null,
                adFree = adFree,
                premiumPrice = premiumPrice,
                onPremium = subscribe,
            )
        }

        if (tributeOpen) {
            TributeDialog(
                gold = tributeGold(game),
                canDrawCard = canDrawTributeCard(game),
                onGold = { askTribute(TributeKind.GOLD) },
                onCard = { askTribute(TributeKind.CARD) },
                onDismiss = { tributeOpen = false },
                adFree = adFree,
                premiumPrice = premiumPrice,
                onPremium = subscribe,
            )
        }

        if (mooseOpen) MooseDialog(moose, onDismiss = { mooseOpen = false })
        if (chatOpen && session != null && multiplayer != null) ChatDialog(session, multiplayer, music) { chatOpen = false }
        if (playersOpen && session != null) PlayersSheet(session, game) { playersOpen = false }

        if (saveDialogOpen) {
            val slots by saves.slots.collectAsStateWithLifecycle()
            SaveGameDialog(
                slots = slots,
                onSave = { slot ->
                    viewModel.saveToSlot(slot)
                    saveDialogOpen = false
                },
                onDismiss = { saveDialogOpen = false },
            )
        }

        if (pauseOpen) {
            val muted = settings.settings.collectAsStateWithLifecycle().value.musicMuted
            PauseMenuDialog(
                musicMuted = muted,
                onToggleMusic = { scope.launch { settings.setMusicMuted(!muted) } },
                onResume = { pauseOpen = false },
                onSave = if (session != null) null else ({
                    pauseOpen = false
                    saveDialogOpen = true
                }),
                onLoad = if (session != null) null else ({
                    pauseOpen = false
                    viewModel.autosaveNow()
                    onLoadGame()
                }),
                onRulebook = {
                    pauseOpen = false
                    onRulebook()
                },
                onSettings = {
                    pauseOpen = false
                    onSettings()
                },
                onExit = {
                    pauseOpen = false
                    // Continue on the main menu picks up exactly here.
                    viewModel.autosaveNow()
                    adBreak(AdBreak.EXIT_TO_MENU, game.turn, onExit)
                },
            )
        }
    }
}
