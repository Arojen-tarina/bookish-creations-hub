import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore, createStore } from '../../lib/store';
import { systemRandom } from '../../game/engine/gameRandom';
import { canMoveTo, moveArmy, mergeArmies, buildBlocker, buildStructure, recruitBlocker, recruitArmy, repairFortBlocker, repairFort, playCard } from '../../game/engine/playerActions';
import { endTurn } from '../../game/engine/endTurn';
import { proposeTreaty, breakTreaty } from '../../game/engine/diplomacy';
import { canTakeSecondChance, takeSecondChance } from '../../game/engine/secondChance';
import { canTakeTribute, canDrawTributeCard, takeTribute, tributeGold, type TributeKind } from '../../game/engine/tribute';
import type { BuildingType, FactionId, RecruitType, TreatyType } from '../../game/model/enums';
import type { BattleReport, GameState } from '../../game/model/models';
import type { SaveRepository } from '../../data/SaveRepository';
import type { AchievementRepository } from '../../data/AchievementRepository';
import type { Analytics } from '../../analytics/Analytics';
import { StatsTracker } from '../../game/achievements/statsTracker';
import { Events } from '../../analytics/AnalyticsEvents';
import type { GameMessage } from './overlays/GameOverlays';

export interface GameUiState {
  game: GameState; selectedProvinceId: string | null; selectedArmyId: string | null;
  moveTargets: Set<string>; attackTargets: Set<string>; lastBattle: BattleReport | null; processingTurn: boolean;
  messages: Array<{ id: number; message: GameMessage }>;
}
const initialUi = (game: GameState): GameUiState => ({ game, selectedProvinceId: null, selectedArmyId: null, moveTargets: new Set(), attackTargets: new Set(), lastBattle: null, processingTurn: false, messages: [] });
export interface GameViewModelOptions { saves?: SaveRepository; achievements?: AchievementRepository; analytics?: Analytics; onSave?: (slot: number, state: GameState) => void; onRestart?: () => void }
export function useGameViewModel(initialGame: GameState, options: GameViewModelOptions = {}) {
  const storeRef = useRef<ReturnType<typeof createStore<GameUiState>> | null>(null);
  if (!storeRef.current) storeRef.current = createStore(initialUi(initialGame));
  const store = storeRef.current;
  const ui = useStore(store);
  const turnStart = useRef(initialGame);
  const lastInitial = useRef(initialGame);
  const previousGame = useRef<GameState | null>(null);
  const pendingDefeat = useRef<GameState | null>(null);
  useEffect(() => {
    if (lastInitial.current === initialGame) return;
    lastInitial.current = initialGame; turnStart.current = initialGame; previousGame.current = null; pendingDefeat.current = null;
    store.set(initialUi(initialGame));
  }, [initialGame, store]);
  useEffect(() => {
    if (store.get().game !== ui.game) return;
    const previous = previousGame.current;
    if (!previous) { options.achievements?.record((stats) => StatsTracker.onStateChanged(stats, null, ui.game)); previousGame.current = ui.game; return; }
    options.achievements?.record((stats) => StatsTracker.onStateChanged(stats, previous, ui.game));
    if (ui.game.gameOver && !previous.gameOver) {
      if (canTakeSecondChance(ui.game)) pendingDefeat.current = ui.game;
      else options.achievements?.record((stats) => StatsTracker.onGameOver(stats, ui.game));
    }
    if (previous.turn !== ui.game.turn) options.analytics?.noteTurnCompleted();
    options.analytics?.track(Events.fromStateChange(previous, ui.game, options.analytics.turnsThisSession));
    previousGame.current = ui.game;
  }, [ui.game, options.achievements, options.analytics]);
  useEffect(() => () => { if (pendingDefeat.current) options.achievements?.record((stats) => StatsTracker.onGameOver(stats, pendingDefeat.current!)); }, [options.achievements]);
  const nextMessage = useRef(0);
  const rng = systemRandom;
  const setUi = useCallback((change: (current: GameUiState) => GameUiState) => store.set(change), [store]);
  const say = useCallback((key: string, args: Array<string | number> = [], tone: GameMessage['tone'] = 'neutral') => {
    const id = ++nextMessage.current;
    setUi((current) => ({ ...current, messages: [...current.messages, { id, message: { key, args, tone } }] }));
  }, [setUi]);
  useEffect(() => {
    if (options.saves) {
      if (ui.game.gameOver) options.saves.delete(0);
      else if (options.saves.autosave(ui.game)) options.analytics?.track(Events.gameSaved(0));
    }
  }, [options.saves, options.analytics, ui.game]);

  const selectArmy = useCallback((state: GameUiState, id: string): GameUiState => {
    const army = state.game.armies.find((a) => a.id === id);
    if (!army) return state;
    const reachable = state.game.provinces.find((p) => p.id === army.provinceId)?.neighbors.filter((target) => canMoveTo(state.game, id, target)) ?? [];
    const attacks: string[] = [], moves: string[] = [];
    for (const target of reachable) {
      const province = state.game.provinces.find((p) => p.id === target);
      const attacked = state.game.armies.some((a) => a.provinceId === target && a.ownerId !== army.ownerId) || (!!province?.ownerId && province.ownerId !== army.ownerId);
      (attacked ? attacks : moves).push(target);
    }
    return { ...state, selectedArmyId: id, selectedProvinceId: army.provinceId, moveTargets: new Set(moves), attackTargets: new Set(attacks) };
  }, []);
  const onProvinceTap = useCallback((provinceId: string): boolean => {
    const current = store.get(); if (current.processingTurn) return false;
    const id = current.selectedArmyId;
    if (id && (current.moveTargets.has(provinceId) || current.attackTargets.has(provinceId))) {
      const result = moveArmy(current.game, id, provinceId, rng), moved = result.state.armies.find((a) => a.id === id);
      const next = moved && moved.movementLeft > 0 ? selectArmy({ ...current, game: result.state }, id) : { ...current, game: result.state, selectedArmyId: null, selectedProvinceId: provinceId, moveTargets: new Set<string>(), attackTargets: new Set<string>() };
      store.set({ ...next, lastBattle: result.battle });
      if (result.battle) options.achievements?.record((stats) => StatsTracker.onBattle(stats, result.battle!, result.battle!.attackerFaction));
      if (result.battle) options.analytics?.track(Events.battleOutcome(result.battle, result.state));
      if (result.surrenderedProvinceId) say('province_surrendered', [result.state.provinces.find((p) => p.id === result.surrenderedProvinceId)?.name ?? ''], 'positive');
      return true;
    }
    store.set({ ...current, selectedProvinceId: provinceId, selectedArmyId: null, moveTargets: new Set(), attackTargets: new Set() });
    return false;
  }, [rng, say, selectArmy, store, options.achievements, options.analytics]);
  const onArmyTap = useCallback((id: string) => {
    const current = store.get(); if (current.processingTurn) return;
    const army = current.game.armies.find((a) => a.id === id); if (!army) return;
    if (army.ownerId !== current.game.playerFactionId) { onProvinceTap(army.provinceId); return; }
    if (id === current.selectedArmyId) store.set({ ...current, selectedArmyId: null, moveTargets: new Set(), attackTargets: new Set() });
    else store.set(selectArmy(current, id));
  }, [onProvinceTap, selectArmy, store]);
  const clearSelection = useCallback(() => setUi((s) => ({ ...s, selectedProvinceId: null, selectedArmyId: null, moveTargets: new Set(), attackTargets: new Set() })), [setUi]);
  const dismissBattle = useCallback(() => setUi((s) => ({ ...s, lastBattle: null })), [setUi]);
  const dismissMessage = useCallback((id: number) => setUi((s) => ({ ...s, messages: s.messages.filter((m) => m.id !== id) })), [setUi]);
  const build = useCallback((id: string, type: BuildingType) => {
    const block = buildBlocker(store.get().game, id, type);
    if (block) { say(`block_${block.toLowerCase()}`, [], 'negative'); return; }
    const upgrading = type === 'fortress' && (store.get().game.provinces.find((p) => p.id === id)?.fortLevel ?? 0) > 0;
    setUi((s) => ({ ...s, game: buildStructure(s.game, id, type) })); say(upgrading ? 'ui_toast_upgraded' : 'ui_toast_built', [type], 'positive');
  }, [say, setUi, store]);
  const recruit = useCallback((id: string, type: RecruitType) => {
    const block = recruitBlocker(store.get().game, id, type);
    if (block) { say(`block_${block.toLowerCase()}`, [], 'negative'); return; }
    const name = store.get().game.provinces.find((p) => p.id === id)?.name ?? '';
    setUi((s) => ({ ...s, game: recruitArmy(s.game, id, type) })); say('toast_recruited', [name], 'positive');
  }, [say, setUi, store]);
  const repair = useCallback((id: string, useArtisan: boolean) => {
    const block = repairFortBlocker(store.get().game, id, useArtisan);
    if (block) { say(`block_${block.toLowerCase()}`, [], 'negative'); return; }
    const name = store.get().game.provinces.find((p) => p.id === id)?.name ?? '';
    setUi((s) => ({ ...s, game: repairFort(s.game, id, useArtisan) })); say('toast_repaired', [name], 'positive');
  }, [say, setUi, store]);
  const mergeSelectedInto = useCallback((intoId: string) => {
    const current = store.get(), id = current.selectedArmyId; if (!id) return;
    const game = mergeArmies(current.game, id, intoId); if (game === current.game) return;
    setUi((s) => selectArmy({ ...s, game }, intoId)); say('toast_merged', [], 'positive');
  }, [say, selectArmy, setUi, store]);
  const play = useCallback((cardId: string) => {
    const current = store.get(); if (!current.game.hand.some((c) => c.id === cardId)) return;
    let next = { ...current, game: playCard(current.game, cardId) };
    if (next.selectedArmyId && next.game.armies.some((a) => a.id === next.selectedArmyId)) next = selectArmy(next, next.selectedArmyId);
    setUi(() => next); say('toast_card_played', [cardId], 'positive');
  }, [say, selectArmy, setUi, store]);
  const propose = useCallback((target: FactionId, type: TreatyType) => {
    const current = store.get().game;
    if (!type.startsWith('war_') && current.relations.some((r) => ((r.factionA === current.playerFactionId && r.factionB === target) || (r.factionB === current.playerFactionId && r.factionA === target)) && r.lastProposalTurn === current.turn)) { say('treaty_proposal_used', [], 'negative'); return; }
    const result = proposeTreaty(current, target, type, rng); setUi((s) => ({ ...s, game: result.state }));
    say(type === 'war_surprise' || type === 'war_formal' ? 'treaty_war_declared' : result.accepted ? 'treaty_accepted' : 'treaty_rejected', result.accepted && !type.startsWith('war_') ? [target, type] : [target], result.accepted ? 'positive' : 'negative');
  }, [rng, say, setUi, store]);
  const breakDiplomacy = useCallback((target: FactionId, type: TreatyType) => { options.analytics?.track({ name: 'treaty_broken', payload: { faction: store.get().game.playerFactionId, target, treaty: type } }); setUi((s) => ({ ...s, game: breakTreaty(s.game, target, type) })); say('treaty_broken', [type], 'negative'); }, [options.analytics, say, setUi, store]);
  const takeTributeReward = useCallback((kind: TributeKind) => {
    const game = store.get().game; if (!canTakeTribute(game)) return;
    setUi((s) => ({ ...s, game: takeTribute(s.game, kind, rng) })); say(kind === 'GOLD' ? 'tribute_received_gold' : 'tribute_received_card', kind === 'GOLD' ? [tributeGold(game)] : [], 'positive');
  }, [rng, say, setUi, store]);
  const takeSecondChanceReward = useCallback(() => {
    const game = store.get().game; if (!canTakeSecondChance(game)) return;
    const replay = takeSecondChance(turnStart.current); pendingDefeat.current = null; store.set({ ...initialUi(replay), messages: [{ id: ++nextMessage.current, message: { key: 'second_chance_taken', args: [replay.turn], tone: 'positive' } }] });
    if (options.saves?.autosave(replay)) options.analytics?.track(Events.gameSaved(0));
  }, [options.saves, options.analytics, store]);
  const end = useCallback(() => {
    const current = store.get(); if (current.processingTurn || current.game.gameOver) return;
    store.set({ ...current, processingTurn: true, selectedArmyId: null, moveTargets: new Set(), attackTargets: new Set() });
    window.setTimeout(() => {
      const game = endTurn(current.game, rng); store.set({ ...initialUi(game), messages: current.messages });
      if (!game.gameOver) turnStart.current = game;
    }, 0);
  }, [rng, store]);
  const saveToSlot = useCallback((slot: number) => { const game = store.get().game; const ok = options.onSave ? (options.onSave(slot, game), true) : options.saves?.save(slot, game) ?? false; if (ok) options.analytics?.track(Events.gameSaved(slot)); say(ok ? 'save_saved' : 'save_save_failed', ok ? [slot] : [], ok ? 'positive' : 'negative'); }, [options, say, store]);
  const game = ui.game;
  return useMemo(() => ({ ...ui, game, onProvinceTap, onArmyTap, clearSelection, dismissBattle, dismissMessage, build, recruit, repair, mergeSelectedInto, playCard: play, propose, breakTreaty: breakDiplomacy, takeTribute: takeTributeReward, takeSecondChance: takeSecondChanceReward, endTurn: end, saveToSlot, canTakeTribute: canTakeTribute(game), canDrawTributeCard: canDrawTributeCard(game), tributeGold: tributeGold(game) }), [ui, game, onProvinceTap, onArmyTap, clearSelection, dismissBattle, dismissMessage, build, recruit, repair, mergeSelectedInto, play, propose, breakDiplomacy, takeTributeReward, takeSecondChanceReward, end, saveToSlot]);
}
