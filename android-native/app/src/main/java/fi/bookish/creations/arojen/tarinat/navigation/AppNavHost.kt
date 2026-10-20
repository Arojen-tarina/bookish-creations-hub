package fi.bookish.creations.arojen.tarinat.navigation

import androidx.activity.compose.LocalActivity
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import fi.bookish.creations.arojen.tarinat.ArojenApp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ads.AdBanner
import fi.bookish.creations.arojen.tarinat.ads.AdUnits
import fi.bookish.creations.arojen.tarinat.analytics.Events
import fi.bookish.creations.arojen.tarinat.data.AnalyticsConsent
import fi.bookish.creations.arojen.tarinat.data.SaveMeta
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.game.achievements.StatsTracker
import fi.bookish.creations.arojen.tarinat.ui.achievements.AchievementsScreen
import fi.bookish.creations.arojen.tarinat.ui.book.BookKind
import fi.bookish.creations.arojen.tarinat.ui.book.BookScreen
import fi.bookish.creations.arojen.tarinat.ui.game.GameScreen
import fi.bookish.creations.arojen.tarinat.ui.game.nameRes
import fi.bookish.creations.arojen.tarinat.ui.moose.MooseDialog
import fi.bookish.creations.arojen.tarinat.ui.screens.menu.AnalyticsConsentDialog
import fi.bookish.creations.arojen.tarinat.ui.screens.faction.FactionSelectScreen
import fi.bookish.creations.arojen.tarinat.ui.screens.menu.MainMenuScreen
import fi.bookish.creations.arojen.tarinat.ui.screens.saves.LoadGameScreen
import fi.bookish.creations.arojen.tarinat.ui.screens.settings.SettingsScreen
import fi.bookish.creations.arojen.tarinat.ui.screens.splash.LoadingScreen
import java.time.LocalDate
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AppNavHost(navController: NavHostController = rememberNavController()) {
    val container = (LocalContext.current.applicationContext as ArojenApp).container
    val saves = container.saves
    val scope = rememberCoroutineScope()
    val activity = LocalActivity.current
    val back: () -> Unit = { navController.popBackStack() }
    val menuBanner: @Composable () -> Unit = { AdBanner(container.ads, AdUnits.BANNER_MENU) }
    val analytics = container.analytics

    /** A main-menu button, counted for the analytics' feature-discovery view. */
    fun menu(target: String, action: () -> Unit): () -> Unit = {
        analytics.track(Events.menuInteraction(target))
        action()
    }

    /** Opens a decoded save (already handed off to the repository) as the only game on the stack. */
    fun openSave(meta: SaveMeta) {
        navController.navigate(GameRoute(meta.faction.key, meta.difficulty.name.lowercase(), meta.slot)) {
            popUpTo(MenuRoute)
        }
    }

    NavHost(
        navController = navController,
        startDestination = SplashRoute,
        enterTransition = { fadeIn(tween(250)) },
        exitTransition = { fadeOut(tween(250)) },
        popEnterTransition = { fadeIn(tween(250)) },
        popExitTransition = { fadeOut(tween(250)) },
    ) {
        composable<SplashRoute> {
            LoadingScreen(
                preload = {
                    saves.refresh()
                    container.achievements.load()
                    // First launch after updating from the WebView version only.
                    container.legacyImport.runOnce()
                    container.achievements.record { StatsTracker.onAppOpened(it, LocalDate.now()) }
                    // Returning players: the app-open advert, if it arrives while the game loads.
                    container.ads.awaitAppOpen()
                },
                onFinished = {
                    navController.navigate(MenuRoute) {
                        popUpTo(SplashRoute) { inclusive = true }
                    }
                    activity?.let(container.ads::finishColdStart)
                },
            )
        }
        composable<MenuRoute> {
            var mooseOpen by rememberSaveable { mutableStateOf(false) }
            var continueFailed by remember { mutableStateOf(false) }
            val slots by saves.slots.collectAsStateWithLifecycle()
            val continueMeta = saves.continueSlot()?.let { slots[it] }
            val updateReady by container.updates.readyToInstall.collectAsStateWithLifecycle()
            val consent by container.settings.settings.collectAsStateWithLifecycle()
            val adConsentDone by container.ads.consentFlowDone.collectAsStateWithLifecycle()
            // A player who keeps coming back is asked for a rating once in a while (not over an advert).
            LaunchedEffect(Unit) {
                delay(2500)
                if (activity != null && !container.ads.fullScreenShowing.value) {
                    container.review.maybeAsk(activity, container.achievements.stats.value, afterVictory = false)
                }
            }
            MainMenuScreen(
                continueInfo = continueMeta?.let {
                    stringResource(R.string.menu_continue_desc, it.turn, stringResource(it.faction.nameRes))
                },
                onContinue = menu("continue") {
                    val meta = continueMeta ?: return@menu
                    scope.launch {
                        val state = saves.load(meta.slot)
                        continueFailed = state == null
                        if (state != null) {
                            saves.handOff(meta.slot, state)
                            openSave(meta)
                        }
                    }
                },
                continueFailed = continueFailed,
                onNewGame = menu("new_game") { navController.navigate(FactionSelectRoute) },
                onLoadGame = menu("load_game") { navController.navigate(LoadGameRoute) },
                onAchievements = menu("achievements") { navController.navigate(AchievementsRoute) },
                onCodex = menu("codex") { navController.navigate(CodexRoute) },
                onRulebook = menu("rulebook") { navController.navigate(RulebookRoute) },
                onSettings = menu("settings") { navController.navigate(SettingsRoute) },
                onMoose = menu("moose") { mooseOpen = true },
                updateReady = updateReady,
                onInstallUpdate = container.updates::installNow,
                banner = menuBanner,
            )
            if (mooseOpen) MooseDialog(container.moose, onDismiss = { mooseOpen = false })
            // Asked once, after Google's advert consent form (if any) has closed.
            if (consent.analyticsConsent == AnalyticsConsent.UNDECIDED && adConsentDone) {
                AnalyticsConsentDialog(
                    onAccept = { scope.launch { container.settings.setAnalyticsConsent(AnalyticsConsent.GRANTED) } },
                    onDecline = { scope.launch { container.settings.setAnalyticsConsent(AnalyticsConsent.DENIED) } },
                )
            }
        }
        composable<FactionSelectRoute> {
            LaunchedEffect(Unit) { analytics.track(Events.onboarding(Events.Onboarding.FACTION_SELECT_VIEWED)) }
            // A new campaign takes the autosave's place: the screen asks before replacing a running one.
            val slots by saves.slots.collectAsStateWithLifecycle()
            FactionSelectScreen(
                replaces = slots[SaveRepository.AUTOSAVE]?.let {
                    stringResource(R.string.menu_continue_desc, it.turn, stringResource(it.faction.nameRes))
                },
                onStart = { faction, difficulty ->
                    analytics.track(Events.onboarding(Events.Onboarding.FACTION_CHOSEN))
                    navController.navigate(GameRoute(faction.key, difficulty.name.lowercase())) {
                        popUpTo(MenuRoute)
                    }
                },
                onBack = back,
            )
        }
        composable<GameRoute> {
            GameScreen(
                saves = saves,
                achievements = container.achievements,
                moose = container.moose,
                music = container.music,
                settings = container.settings,
                ads = container.ads,
                review = container.review,
                onExit = { navController.popBackStack(MenuRoute, inclusive = false) },
                onNewGame = {
                    navController.navigate(FactionSelectRoute) { popUpTo(MenuRoute) }
                },
                onLoadGame = { navController.navigate(LoadGameRoute) },
                onRulebook = { navController.navigate(RulebookRoute) },
                onSettings = { navController.navigate(SettingsRoute) },
            )
        }
        composable<LoadGameRoute> { LoadGameScreen(saves, onLoaded = ::openSave, onBack = back) }
        composable<AchievementsRoute> { AchievementsScreen(container.achievements, onBack = back) }
        // Switching between the books replaces the open one, so back returns to where the reader came from.
        composable<CodexRoute> {
            BookScreen(BookKind.CODEX, onBack = back, onOpenOther = {
                navController.navigate(RulebookRoute) { popUpTo<CodexRoute> { inclusive = true } }
            }, banner = menuBanner)
        }
        composable<RulebookRoute> {
            BookScreen(BookKind.RULEBOOK, onBack = back, onOpenOther = {
                navController.navigate(CodexRoute) { popUpTo<RulebookRoute> { inclusive = true } }
            }, banner = menuBanner)
        }
        composable<SettingsRoute> { SettingsScreen(container.settings, container.music, container.ads, analytics, onBack = back) }
    }
}
