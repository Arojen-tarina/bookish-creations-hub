package fi.bookish.creations.arojen.tarinat.ui.game

import androidx.annotation.StringRes
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.createSavedStateHandle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import androidx.navigation.toRoute
import fi.bookish.creations.arojen.tarinat.ArojenApp
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.analytics.Analytics
import fi.bookish.creations.arojen.tarinat.analytics.Events
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.game.achievements.StatsTracker
import fi.bookish.creations.arojen.tarinat.game.engine.GameRandom
import fi.bookish.creations.arojen.tarinat.game.engine.breakTreaty
import fi.bookish.creations.arojen.tarinat.game.engine.buildBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.TributeKind
import fi.bookish.creations.arojen.tarinat.game.engine.buildStructure
import fi.bookish.creations.arojen.tarinat.game.engine.canMoveTo
import fi.bookish.creations.arojen.tarinat.game.engine.canTakeSecondChance
import fi.bookish.creations.arojen.tarinat.game.engine.canTakeTribute
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.mergeArmies
import fi.bookish.creations.arojen.tarinat.game.engine.moveArmy
import fi.bookish.creations.arojen.tarinat.game.engine.playCard
import fi.bookish.creations.arojen.tarinat.game.engine.proposeTreaty
import fi.bookish.creations.arojen.tarinat.game.engine.recruitArmy
import fi.bookish.creations.arojen.tarinat.game.engine.recruitBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.repairFort
import fi.bookish.creations.arojen.tarinat.game.engine.repairFortBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.engine.takeSecondChance
import fi.bookish.creations.arojen.tarinat.game.engine.takeTribute
import fi.bookish.creations.arojen.tarinat.game.engine.tributeGold
import fi.bookish.creations.arojen.tarinat.game.model.BattleReport
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.navigation.GameRoute
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class GameUiState(
    val game: GameState,
    val selectedProvinceId: String? = null,
    val selectedArmyId: String? = null,
    /** Provinces the selected army can enter peacefully. */
    val moveTargets: Set<String> = emptySet(),
    /** Provinces the selected army would fight its way into. */
    val attackTargets: Set<String> = emptySet(),
    val lastBattle: BattleReport? = null,
    /** True while the AI realms take their turn. */
    val processingTurn: Boolean = false,
)

enum class Tone { Positive, Negative, Neutral }

/** Something to tell the player; resolved to text in the UI so it follows the app language. */
data class GameMessage(@param:StringRes val res: Int, val args: List<MessageArg> = emptyList(), val tone: Tone = Tone.Neutral)

sealed interface MessageArg {
    data class Raw(val value: String) : MessageArg
    data class Res(@param:StringRes val id: Int) : MessageArg
    data class CardName(val cardId: String) : MessageArg
}

class GameViewModel(
    private val savedStateHandle: SavedStateHandle,
    private val saves: SaveRepository,
    private val achievements: AchievementRepository,
    private val analytics: Analytics,
    private val appScope: CoroutineScope,
) : ViewModel() {

    private val rng = GameRandom.System
    private val route = savedStateHandle.toRoute<GameRoute>()

    private val _ui = MutableStateFlow(GameUiState(game = initialGame()))
    val ui: StateFlow<GameUiState> = _ui.asStateFlow()

    /** The campaign as the current turn began: what a second chance goes back to. */
    private var turnStart: GameState = _ui.value.game

    /** A defeat the player may still replay; it counts in the stats once it stands. */
    private var pendingDefeat: GameState? = null

    /**
     * A loaded save, or a new campaign. After process death the screen resumes
     * from the autosave instead of silently starting over.
     */
    private fun initialGame(): GameState {
        val resume = savedStateHandle.get<Int>(KEY_RESUME_SLOT)
        val slot = resume ?: route.loadSlot.takeIf { it != GameRoute.NEW_GAME }
        slot?.let { s ->
            saves.takeOrLoad(s)?.let {
                analytics.track(Events.gameLoaded(s), Events.gameStart(it, isContinue = true))
                return it
            }
        }
        val fresh = startGame(FactionId.valueOf(route.faction.uppercase()), Difficulty.valueOf(route.difficulty.uppercase()), rng)
        analytics.track(Events.gameStart(fresh, isContinue = false))
        autosave(fresh)
        return fresh
    }

    /** Fire-and-forget autosave that survives leaving the screen. */
    private fun autosave(state: GameState) {
        appScope.launch {
            if (state.gameOver) {
                // A finished campaign is not something to "Continue".
                saves.delete(SaveRepository.AUTOSAVE)
            } else if (saves.autosave(state)) {
                analytics.track(Events.gameSaved(SaveRepository.AUTOSAVE))
                withContext(Dispatchers.Main) { savedStateHandle[KEY_RESUME_SLOT] = SaveRepository.AUTOSAVE }
            }
        }
    }

    /** Called when the app goes to the background. */
    fun autosaveNow() {
        if (!_ui.value.processingTurn) autosave(game)
    }

    fun saveToSlot(slot: Int) {
        val state = game
        viewModelScope.launch {
            if (saves.save(slot, state)) {
                analytics.track(Events.gameSaved(slot))
                say(R.string.save_saved, MessageArg.Raw(slot.toString()), tone = Tone.Positive)
            } else {
                say(R.string.save_save_failed, tone = Tone.Negative)
            }
        }
    }

    init {
        // Every state change feeds the lifetime stats behind achievements.
        viewModelScope.launch {
            var prev: GameState? = null
            _ui.map { it.game }.distinctUntilChanged().collect { next ->
                // A second chance steps back in time: that is not a sequence of real events.
                val before = prev?.takeIf { next.turn >= it.turn }
                prev = next
                achievements.record { StatsTracker.onStateChanged(it, before, next) }
                if (next.gameOver && before != null && !before.gameOver) {
                    if (canTakeSecondChance(next)) {
                        pendingDefeat = next
                    } else {
                        achievements.record { StatsTracker.onGameOver(it, next) }
                    }
                }
                // The same changes feed the anonymous usage analytics (if the player agreed to them).
                if (before != null) {
                    if (next.turn == before.turn + 1) analytics.noteTurnCompleted()
                    analytics.track(Events.fromStateChange(before, next, analytics.turnsThisSession))
                }
            }
        }
    }

    private val _messages = Channel<GameMessage>(Channel.BUFFERED)
    val messages: Flow<GameMessage> = _messages.receiveAsFlow()

    private val game get() = _ui.value.game
    private fun say(@StringRes res: Int, vararg args: MessageArg, tone: Tone = Tone.Neutral) {
        _messages.trySend(GameMessage(res, args.toList(), tone))
    }
    private fun provinceName(id: String) = MessageArg.Raw(game.province(id)?.name.orEmpty())

    // ============= MAP INTERACTION =============

    /** Returns true when the tap moved the selected army (so the UI need not open the province panel). */
    fun onProvinceTap(provinceId: String): Boolean {
        val ui = _ui.value
        if (ui.processingTurn) return false
        val armyId = ui.selectedArmyId
        if (armyId != null && (provinceId in ui.moveTargets || provinceId in ui.attackTargets)) {
            val result = moveArmy(ui.game, armyId, provinceId, rng)
            val moved = result.state.armies.firstOrNull { it.id == armyId }
            // Keep a surviving army selected while it can still move, so marches can be chained.
            val next = if (moved != null && moved.movementLeft > 0) {
                ui.copy(game = result.state).withArmySelected(moved.id)
            } else {
                ui.copy(game = result.state, selectedArmyId = null, selectedProvinceId = provinceId, moveTargets = emptySet(), attackTargets = emptySet())
            }
            _ui.value = next.copy(lastBattle = result.battle)
            result.battle?.let { b ->
                // The player's first battle ever is an onboarding step (checked before this one is counted).
                if (achievements.stats.value.let { it.battlesWon + it.battlesLost } == 0) {
                    analytics.track(Events.onboarding(Events.Onboarding.FIRST_BATTLE))
                }
                analytics.track(Events.battleOutcome(b, result.state))
                achievements.record { StatsTracker.onBattle(it, b, b.attackerFaction) }
            }
            result.surrenderedProvinceId?.let { say(R.string.province_surrendered, provinceName(it), tone = Tone.Positive) }
            return true
        }
        _ui.value = ui.copy(selectedProvinceId = provinceId, selectedArmyId = null, moveTargets = emptySet(), attackTargets = emptySet())
        return false
    }

    fun onArmyTap(armyId: String) {
        val ui = _ui.value
        if (ui.processingTurn) return
        val army = ui.game.armies.firstOrNull { it.id == armyId } ?: return
        when {
            // Tapping a rival's stack means "go there".
            army.ownerId != ui.game.playerFactionId -> onProvinceTap(army.provinceId)
            armyId == ui.selectedArmyId -> _ui.value = ui.copy(selectedArmyId = null, moveTargets = emptySet(), attackTargets = emptySet())
            else -> _ui.value = ui.withArmySelected(armyId)
        }
    }

    fun clearSelection() = _ui.update { it.copy(selectedProvinceId = null, selectedArmyId = null, moveTargets = emptySet(), attackTargets = emptySet()) }

    fun dismissBattle() = _ui.update { it.copy(lastBattle = null) }

    // ============= PROVINCE ACTIONS =============

    fun build(provinceId: String, type: BuildingType) {
        buildBlocker(game, provinceId, type)?.let { return say(it.messageRes, tone = Tone.Negative) }
        val upgrading = type == BuildingType.FORTRESS && (game.province(provinceId)?.fortLevel ?: 0) > 0
        _ui.update { it.copy(game = buildStructure(it.game, provinceId, type)) }
        analytics.trackFirst(Events.Onboarding.FIRST_BUILDING)
        say(if (upgrading) R.string.ui_toast_upgraded else R.string.ui_toast_built, MessageArg.Res(type.nameRes), tone = Tone.Positive)
    }

    fun recruit(provinceId: String, type: RecruitType) {
        recruitBlocker(game, provinceId, type)?.let { return say(it.messageRes, tone = Tone.Negative) }
        _ui.update { it.copy(game = recruitArmy(it.game, provinceId, type)) }
        say(R.string.toast_recruited, provinceName(provinceId), tone = Tone.Positive)
    }

    fun repair(provinceId: String, useArtisan: Boolean) {
        repairFortBlocker(game, provinceId, useArtisan)?.let { return say(it.messageRes, tone = Tone.Negative) }
        _ui.update { it.copy(game = repairFort(it.game, provinceId, useArtisan)) }
        say(R.string.toast_repaired, provinceName(provinceId), tone = Tone.Positive)
    }

    /** Folds the selected army into [intoId] (both must stand in the same province). */
    fun mergeSelectedInto(intoId: String) {
        val armyId = _ui.value.selectedArmyId ?: return
        val merged = mergeArmies(game, armyId, intoId)
        if (merged === game) return
        _ui.update { it.copy(game = merged).withArmySelected(intoId) }
        say(R.string.toast_merged, tone = Tone.Positive)
    }

    fun playCard(cardId: String) {
        if (game.hand.none { it.id == cardId }) return
        _ui.update { ui ->
            val next = ui.copy(game = playCard(ui.game, cardId))
            // A movement card changes what the selected army can reach.
            next.selectedArmyId?.takeIf { id -> next.game.armies.any { it.id == id } }?.let { next.withArmySelected(it) } ?: next
        }
        say(R.string.toast_card_played, MessageArg.CardName(cardId), tone = Tone.Positive)
    }

    // ============= DIPLOMACY =============

    fun propose(target: FactionId, type: TreatyType) {
        val rel = game.relation(game.playerFactionId, target) ?: return
        if (!type.isWar && rel.lastProposalTurn == game.turn) return say(R.string.treaty_proposal_used, tone = Tone.Negative)
        val result = proposeTreaty(game, target, type, rng)
        _ui.update { it.copy(game = result.state) }
        val realm = MessageArg.Res(target.nameRes)
        when {
            type.isWar -> say(R.string.treaty_war_declared, realm, tone = Tone.Negative)
            result.accepted -> say(R.string.treaty_accepted, realm, MessageArg.Res(type.nameRes), tone = Tone.Positive)
            else -> say(R.string.treaty_rejected, realm, tone = Tone.Negative)
        }
    }

    fun breakTreaty(target: FactionId, type: TreatyType) {
        _ui.update { it.copy(game = breakTreaty(it.game, target, type)) }
        say(R.string.treaty_broken, MessageArg.Res(type.nameRes), tone = Tone.Negative)
    }

    /** The player starts over from this campaign (Play again, or New game from it). */
    fun noteRestart() = analytics.track(Events.campaignRestart(game))

    // ============= TRIBUTE (opt-in ad reward) =============

    /** Pays the tribute the player chose after watching the ad. */
    fun takeTribute(kind: TributeKind) {
        val before = game
        if (!canTakeTribute(before)) return
        _ui.update { it.copy(game = takeTribute(it.game, kind, rng)) }
        when (kind) {
            TributeKind.GOLD -> say(R.string.tribute_received_gold, MessageArg.Raw(tributeGold(before).toString()), tone = Tone.Positive)
            TributeKind.CARD -> say(R.string.tribute_received_card, tone = Tone.Positive)
        }
    }

    // ============= SECOND CHANCE (opt-in ad reward after a defeat) =============

    /** Plays the lost turn again from its start, after the player watched the ad. */
    fun takeSecondChance() {
        if (!canTakeSecondChance(game)) return
        val replay = takeSecondChance(turnStart)
        pendingDefeat = null
        _ui.value = GameUiState(game = replay)
        autosave(replay)
        say(R.string.second_chance_taken, MessageArg.Raw(replay.turn.toString()), tone = Tone.Positive)
    }

    override fun onCleared() {
        // The player left without replaying: the defeat stands.
        pendingDefeat?.let { defeat -> achievements.record { StatsTracker.onGameOver(it, defeat) } }
    }

    // ============= TURN =============

    fun endTurn() {
        val start = _ui.value
        if (start.processingTurn || start.game.gameOver) return
        _ui.value = start.copy(processingTurn = true, selectedArmyId = null, moveTargets = emptySet(), attackTargets = emptySet())
        viewModelScope.launch {
            val next = withContext(Dispatchers.Default) { endTurn(start.game, rng) }
            _ui.update { it.copy(game = next, processingTurn = false, lastBattle = null) }
            if (!next.gameOver) turnStart = next
            autosave(next)
        }
    }

    private fun GameUiState.withArmySelected(armyId: String): GameUiState {
        val army = game.armies.first { it.id == armyId }
        val reachable = game.province(army.provinceId)?.neighbors.orEmpty().filter { canMoveTo(game, armyId, it) }
        val (attacks, moves) = reachable.partition { id ->
            val owner = game.province(id)?.ownerId
            game.armies.any { it.provinceId == id && it.ownerId != army.ownerId } || (owner != null && owner != army.ownerId)
        }
        return copy(
            selectedArmyId = armyId,
            selectedProvinceId = army.provinceId,
            moveTargets = moves.toSet(),
            attackTargets = attacks.toSet(),
        )
    }

    companion object {
        private const val KEY_RESUME_SLOT = "resumeSlot"

        val Factory = viewModelFactory {
            initializer {
                val container = (this[ViewModelProvider.AndroidViewModelFactory.APPLICATION_KEY] as ArojenApp).container
                GameViewModel(createSavedStateHandle(), container.saves, container.achievements, container.analytics, container.appScope)
            }
        }
    }
}
