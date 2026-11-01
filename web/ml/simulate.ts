// Shared simulation helpers for offline AI training and evaluation. Run scripts with `npx vite-node ml/<script>.ts`.
import { ACTIVE_FACTIONS } from '../src/game/data/gameData';
import type { Difficulty, FactionId } from '../src/game/model/enums';
import type { GameState } from '../src/game/model/models';
import { calculateAiActions, type AiAction } from '../src/game/engine/ai';
import { endTurn, type EndTurnOptions } from '../src/game/engine/endTurn';
import { Mulberry32 } from '../src/game/engine/gameRandom';
import { strength } from '../src/game/engine/combat';
import { startGame } from '../src/game/engine/setup';
import { calculateLegacyAiActions } from './baseline/legacyAi';

export const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export function newGame(seed: number, difficulty: Difficulty): GameState {
  const player = ACTIVE_FACTIONS[seed % ACTIVE_FACTIONS.length];
  return startGame(player, difficulty, new Mulberry32(seed));
}

export function aiFactions(state: GameState): FactionId[] {
  return state.factions.filter(f => f.id !== state.playerFactionId).map(f => f.id);
}

/** Heuristic-only decision for a faction; `policy: null` keeps training labels independent of the learned weights. */
export function heuristicDecision(state: GameState, rng: Mulberry32) {
  return (faction: GameState['factions'][number], armies: GameState['armies'], provinces: GameState['provinces'], relations: GameState['relations']) =>
    calculateAiActions(faction, armies, provinces, relations, { difficulty: state.difficulty, rng, policy: null });
}

export function ownedProvinces(state: GameState, factionId: FactionId): number {
  return state.provinces.filter(p => p.ownerId === factionId).length;
}

export function totalStrength(state: GameState, factionId: FactionId): number {
  return state.armies.filter(a => a.ownerId === factionId).reduce((n, a) => n + strength(a), 0);
}

/** Reward used for training labels: territory dominates, army and treasury break ties, elimination is heavily penalised. */
export function factionScore(state: GameState, factionId: FactionId): number {
  const owned = ownedProvinces(state, factionId);
  const faction = state.factions.find(f => f.id === factionId);
  return owned * 3 + totalStrength(state, factionId) * 0.1 + (faction?.treasury ?? 0) * 0.02 - (owned === 0 ? 10 : 0);
}

/** Plays `horizon` turns from `state`. If `forced` is set, `faction` executes exactly that action on the first turn. */
export function rollout(state: GameState, horizon: number, seed: number, forced: { faction: FactionId; action: AiAction } | null, decide?: (s: GameState, rng: Mulberry32) => NonNullable<EndTurnOptions['aiActions']>): GameState {
  const rng = new Mulberry32(seed);
  const aiRng = new Mulberry32(seed ^ 0x9e3779b9);
  let s = state;
  for (let h = 0; h < horizon; h++) {
    const base = (decide ? decide(s, aiRng) : heuristicDecision(s, aiRng)) as NonNullable<EndTurnOptions['aiActions']>;
    const options: EndTurnOptions = {
      aiActions: (faction, armies, provinces, relations) => {
        const plan = base(faction, armies, provinces, relations);
        if (!forced || h !== 0 || faction.id !== forced.faction) return plan;
        // Insert the candidate into the heuristic plan, dropping only actions that conflict with it.
        const c = forced.action;
        const kept = plan.filter(a => a.type !== 'SKIP' && a.armyId !== c.armyId && !((a.type === 'ATTACK' || a.kind === 'CAPTURE') && c.targetProvinceId && a.targetProvinceId === c.targetProvinceId));
        return [c, ...kept];
      },
    };
    s = endTurn(s, rng, options);
  }
  return s;
}

/** Turn-by-turn advance using the given decision policy for every AI faction. */
export function stepWith(state: GameState, rng: Mulberry32, decide: (s: GameState, rng: Mulberry32) => EndTurnOptions['aiActions']): GameState {
  return endTurn(state, rng, { aiActions: decide(state, rng) });
}

export const legacyDecision = () => (faction: GameState['factions'][number], armies: GameState['armies'], provinces: GameState['provinces'], relations: GameState['relations']) =>
  calculateLegacyAiActions(faction, armies, provinces, relations);
