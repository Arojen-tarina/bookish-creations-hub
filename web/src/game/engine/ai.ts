import type { Difficulty, FactionId, Personality, TurnLogKind } from '../model/enums';
import type { Army, DiplomaticRelation, Faction, Province } from '../model/models';
import { type AiActionKind, type AiFeatureContext, type AiPolicy, buildAiFeatures, DEFAULT_AI_POLICY, predictAiPolicy } from './aiPolicy';
import { battleOdds, defenderOf } from './battleOdds';
import { defenseBreakdown, strength } from './combat';
import type { GameRandom } from './gameRandom';

export type AiActionType = 'MOVE' | 'ATTACK' | 'BUILD_FORT' | 'BUILD_MARKET' | 'RECRUIT' | 'MERGE' | 'SKIP';
export interface AiAction {
  type: AiActionType;
  armyId?: string;
  mergeIntoId?: string;
  targetProvinceId?: string;
  logKind?: TurnLogKind;
  priority: number;
  kind?: AiActionKind;
  winChance?: number;
  features?: number[];
}

/** `caution` shifts the personality's minimum attack win chance; negative values attack more recklessly. */
export interface AiSkill { noise: number; policyWeight: number; maxActions: number; caution: number; retreat: boolean }
export const AI_SKILL: Record<Difficulty, AiSkill> = {
  easy: { noise: .3, policyWeight: 0, maxActions: 3, caution: -.12, retreat: false },
  normal: { noise: .1, policyWeight: .6, maxActions: 5, caution: 0, retreat: true },
  hard: { noise: 0, policyWeight: 1, maxActions: 6, caution: -.03, retreat: true },
};

const PERSONALITY: Record<Personality, { attack: number; expand: number; defend: number; build: number; recruit: number; minWinChance: number }> = {
  aggressive: { attack: 2, expand: 1.5, defend: .5, build: .5, recruit: 1.5, minWinChance: .42 },
  defensive: { attack: .5, expand: .8, defend: 2, build: 1.5, recruit: 1, minWinChance: .68 },
  trader: { attack: .3, expand: 1, defend: 1, build: 2, recruit: .8, minWinChance: .6 },
  expansionist: { attack: 1, expand: 2, defend: .8, build: 1, recruit: 1.2, minWinChance: .5 },
  cautious: { attack: .3, expand: .6, defend: 1.5, build: 1.5, recruit: 1, minWinChance: .8 },
};

const MOVE_COST: Record<Province['terrain'], number> = { steppe: 1, grassland: 1, forest: 1, mountain: 3, desert: 2, taiga: 2, tundra: 2, farmland: 1, hills: 2, marsh: 3 };
const RETREAT_DANGER = .7;

const value = (p: Province) => p.baseTax + p.baseManpower * .5 + (p.hasSilkRoad ? 3 : 0) + (p.tradeGood ? 2 : 0) + (p.isCapital ? 5 : 0);

function path(from: string, to: string, by: Map<string, Province>, maxDepth = 6): string[] | null {
  const queue: { id: string; path: string[] }[] = [{ id: from, path: [] }];
  const seen = new Set([from]);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.path.length >= maxDepth) continue;
    for (const n of by.get(cur.id)?.neighbors ?? []) {
      if (seen.has(n)) continue;
      seen.add(n);
      const p = [...cur.path, n];
      if (n === to) return p;
      queue.push({ id: n, path: p });
    }
  }
  return null;
}

/** Routes never pass through hostile provinces; they may only end on one. */
function targets(from: string, by: Map<string, Province>, f: FactionId, maxRange: number) {
  const out: { provinceId: string; score: number; path: string[] }[] = [];
  const queue: { id: string; path: string[]; dist: number }[] = [{ id: from, path: [], dist: 0 }];
  const seen = new Set([from]);
  while (queue.length) {
    const x = queue.shift()!;
    if (x.dist > maxRange) continue;
    const p = by.get(x.id);
    if (!p) continue;
    const hostile = !!p.ownerId && p.ownerId !== f;
    if (x.dist > 0 && p.ownerId !== f) out.push({ provinceId: p.id, score: value(p) / Math.max(1, x.dist), path: x.path });
    if (x.dist > 0 && hostile) continue;
    for (const n of p.neighbors) {
      if (seen.has(n)) continue;
      seen.add(n);
      queue.push({ id: n, path: [...x.path, n], dist: x.dist + 1 });
    }
  }
  return out.sort((a, b) => b.score - a.score);
}

/** All legal candidate actions with their policy features. Selection is done by `selectAiActions`. */
export function calculateAiCandidates(faction: Faction, armies: Army[], provinces: Province[], relations: DiplomaticRelation[]): AiAction[] {
  const w = PERSONALITY[faction.personality];
  const by = new Map(provinces.map(p => [p.id, p] as const));
  const owned = provinces.filter(p => p.ownerId === faction.id);
  const my = armies.filter(a => a.ownerId === faction.id && a.movementLeft > 0);
  const ownedRatio = owned.length / Math.max(1, provinces.length);
  const ownStrength = armies.filter(a => a.ownerId === faction.id).reduce((n, a) => n + strength(a), 0);
  const candidates: AiAction[] = [];

  const add = (action: AiAction, kind: AiActionKind, ctx: Partial<AiFeatureContext> = {}) => {
    const full: AiFeatureContext = { winChance: .5, provinceValue: 0, enemyTarget: false, freeTarget: false, ownedRatio, threat: 0, armyStrength: 0, fortLevel: 0, terrainDefense: 0, treasury: faction.treasury, border: false, ...ctx };
    candidates.push({ ...action, kind, winChance: full.winChance, features: buildAiFeatures(kind, faction.personality, full) });
  };

  const hostility = (fId: FactionId) => {
    const rel = relations.find(r => (r.factionA === faction.id && r.factionB === fId) || (r.factionB === faction.id && r.factionA === fId));
    return rel ? Math.max(0, -rel.relation) / 100 : .5;
  };
  const borderMap = new Map<FactionId, string[]>();
  for (const mine of owned) for (const nid of mine.neighbors) {
    const owner = by.get(nid)?.ownerId;
    if (owner && owner !== faction.id) borderMap.set(owner, [...(borderMap.get(owner) ?? []), nid]);
  }
  const threats = [...borderMap].map(([fId, ids]) => {
    const border = [...new Set(ids)];
    const near = armies.filter(a => a.ownerId === fId && border.includes(a.provinceId)).length;
    const total = armies.filter(a => a.ownerId === fId).reduce((n, a) => n + strength(a), 0) * (1 + hostility(fId));
    return { factionId: fId, totalStrength: total, borderingProvinces: border, armiesNearBorder: near };
  }).sort((a, b) => b.totalStrength - a.totalStrength);
  const highestThreat = threats[0];
  const threatRatio = highestThreat ? highestThreat.totalStrength / Math.max(1, ownStrength) : 0;
  const enemyStrengthNear = (provinceId: string) => {
    const p = by.get(provinceId);
    if (!p) return 0;
    return armies.filter(x => x.ownerId !== faction.id && p.neighbors.includes(x.provinceId)).reduce((n, x) => n + strength(x), 0);
  };

  const merged = new Set<string>();
  const groups = new Map<string, Army[]>();
  for (const a of my) groups.set(a.provinceId, [...(groups.get(a.provinceId) ?? []), a]);
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => strength(b) - strength(a));
    for (const a of sorted.slice(1)) {
      add({ type: 'MERGE', armyId: a.id, mergeIntoId: sorted[0].id, priority: 5 }, 'MERGE', { armyStrength: strength(a) });
      merged.add(a.id);
    }
  }

  for (const a of my) {
    if (merged.has(a.id)) continue;
    const cur = by.get(a.provinceId);
    if (!cur) continue;
    const force = strength(a);
    const nearby = enemyStrengthNear(cur.id);
    const threatCtx = { armyStrength: force, threat: nearby / Math.max(1, force), border: cur.neighbors.some(n => { const o = by.get(n)?.ownerId; return !!o && o !== faction.id; }), fortLevel: cur.fortLevel, terrainDefense: defenseBreakdown(cur).terrain, provinceValue: value(cur) };

    for (const nid of cur.neighbors) {
      const p = by.get(nid);
      if (!p || !p.ownerId || p.ownerId === faction.id) continue;
      const treatied = relations.find(r => (r.factionA === faction.id && r.factionB === p.ownerId) || (r.factionB === faction.id && r.factionA === p.ownerId));
      if (treatied?.treaties.some(t => ['truce', 'alliance', 'non_aggression'].includes(t.type)) && faction.personality !== 'aggressive') continue;
      if (a.movementLeft < MOVE_COST[p.terrain]) continue;
      const defender = defenderOf(p, armies, faction.id);
      const win = defender ? battleOdds(a, defender, p) : 1;
      if (win < w.minWinChance - .15) continue;
      const lastGuard = cur.isCapital && armies.filter(x => x.ownerId === faction.id && x.provinceId === cur.id).length === 1;
      if (lastGuard && win < .85) continue;
      add({ type: 'ATTACK', armyId: a.id, targetProvinceId: p.id, priority: value(p) * win * w.attack }, 'ATTACK', {
        ...threatCtx, winChance: win, enemyTarget: true, fortLevel: p.fortLevel, terrainDefense: defenseBreakdown(p).terrain, provinceValue: value(p), border: true,
      });
    }

    const danger = nearby > 0 && cur.ownerId === faction.id
      ? Math.max(0, ...armies.filter(x => x.ownerId !== faction.id && cur.neighbors.includes(x.provinceId)).map(e => {
        const d = defenderOf(cur, armies, e.ownerId);
        return d ? battleOdds(e, d, cur) : 1;
      }))
      : 0;
    if (danger >= RETREAT_DANGER) {
      const safe = cur.neighbors.map(id => by.get(id)).filter((p): p is Province => !!p && p.ownerId === faction.id).sort((x, y) => enemyStrengthNear(x.id) - enemyStrengthNear(y.id))[0];
      if (safe && enemyStrengthNear(safe.id) < nearby) {
        add({ type: 'MOVE', armyId: a.id, targetProvinceId: safe.id, logKind: 'DEFEND_BORDER', priority: 4 + 6 * danger }, 'RETREAT', { ...threatCtx, winChance: 1 - danger });
      }
    }

    if (highestThreat && highestThreat.armiesNearBorder > 0 && !highestThreat.borderingProvinces.includes(a.provinceId)) {
      let best: { step: string; dist: number } | undefined;
      for (const border of highestThreat.borderingProvinces) for (const mp of owned) {
        if (!mp.neighbors.includes(border)) continue;
        const route = path(a.provinceId, mp.id, by, 4);
        if (route && (!best || route.length < best.dist)) best = { step: route[0], dist: route.length };
      }
      if (best && best.dist <= 3) add({ type: 'MOVE', armyId: a.id, targetProvinceId: best.step, logKind: 'DEFEND_BORDER', priority: 8 * w.defend }, 'DEFEND', { ...threatCtx, threat: threatRatio });
    }

    const freeTarget = targets(a.provinceId, by, faction.id, 3).find(x => by.get(x.provinceId)?.ownerId === null);
    if (freeTarget && freeTarget.path.length) {
      add({ type: 'MOVE', armyId: a.id, targetProvinceId: freeTarget.path[0], logKind: 'CAPTURE', priority: freeTarget.score * w.expand }, 'CAPTURE', { ...threatCtx, freeTarget: true, provinceValue: value(by.get(freeTarget.provinceId)!) });
    }

    if (faction.personality !== 'cautious') {
      const advance = targets(a.provinceId, by, faction.id, 4).find(x => by.get(x.provinceId)?.ownerId);
      if (advance && advance.path.length) {
        add({ type: 'MOVE', armyId: a.id, targetProvinceId: advance.path[0], logKind: 'ADVANCE', priority: advance.score * .5 * w.attack }, 'ADVANCE', { ...threatCtx, enemyTarget: true, provinceValue: value(by.get(advance.provinceId)!) });
      }
    }
  }

  const capital = owned.find(p => p.id === faction.capitalId);
  const threatened = new Set(highestThreat?.borderingProvinces ?? []);
  const fortTarget = owned.filter(p => p.neighbors.some(n => { const x = by.get(n)?.ownerId; return !!x && x !== faction.id; })).filter(p => p.fortLevel < 2).sort((a, b) => a.fortLevel - b.fortLevel)[0];
  if (fortTarget && faction.treasury >= 50) {
    const pressed = fortTarget.neighbors.some(n => threatened.has(n));
    add({ type: 'BUILD_FORT', targetProvinceId: fortTarget.id, logKind: 'FORTIFY', priority: 4 * w.build + (pressed ? 2 : 0) }, 'FORTIFY', { border: true, fortLevel: fortTarget.fortLevel, terrainDefense: defenseBreakdown(fortTarget).terrain, provinceValue: value(fortTarget), threat: threatRatio });
  }
  if (faction.treasury >= 30 && w.build >= 1.5) {
    const rich = owned.filter(p => p.baseTax >= 3).sort((a, b) => b.baseTax - a.baseTax)[0];
    if (rich) add({ type: 'BUILD_MARKET', targetProvinceId: rich.id, priority: 3 * w.build }, 'MARKET', { provinceValue: value(rich) });
  }
  if (capital && capital.fortLevel < 3 && faction.treasury >= 50) {
    add({ type: 'BUILD_FORT', targetProvinceId: capital.id, logKind: 'FORTIFY_CAPITAL', priority: 6 * w.defend }, 'FORTIFY', { border: true, fortLevel: capital.fortLevel, provinceValue: value(capital), threat: threatRatio });
  }

  if (my.length < Math.ceil(owned.length / 5) || (highestThreat !== undefined && highestThreat.totalStrength > ownStrength * .8) || (faction.treasury >= 60 && faction.manpower >= 20)) {
    let place = capital;
    if (highestThreat?.borderingProvinces.length) place = owned.find(p => p.neighbors.some(n => highestThreat.borderingProvinces.includes(n))) ?? place;
    place = place ?? owned[0];
    if (place && faction.treasury >= 30 && faction.manpower >= 10) add({ type: 'RECRUIT', targetProvinceId: place.id, priority: 5 * w.recruit }, 'RECRUIT', { provinceValue: value(place), threat: threatRatio });
  }

  return candidates;
}

export interface AiOptions { difficulty?: Difficulty; rng?: GameRandom; policy?: AiPolicy | null }

/** Ranks candidates by priority (+ learned policy value and difficulty noise) and enforces one order per army and one attack per target. */
export function selectAiActions(candidates: AiAction[], personality: Personality, options: AiOptions = {}): AiAction[] {
  const skill = AI_SKILL[options.difficulty ?? 'normal'];
  const policy = options.policy === undefined ? DEFAULT_AI_POLICY : options.policy;
  const minWin = PERSONALITY[personality].minWinChance + skill.caution;
  const scored = candidates
    .filter(c => !(c.kind === 'RETREAT' && !skill.retreat))
    .filter(c => c.kind !== 'ATTACK' || (c.winChance ?? 0) >= minWin)
    .map(action => {
      let priority = action.priority;
      if (policy && skill.policyWeight > 0 && action.features) priority += skill.policyWeight * 3 * predictAiPolicy(policy, action.features);
      if (skill.noise > 0 && options.rng) priority += (options.rng.nextDouble() * 2 - 1) * skill.noise * 3;
      return { action, priority };
    })
    .sort((a, b) => b.priority - a.priority);

  const usedArmies = new Set<string>();
  const claimedTargets = new Set<string>();
  const out: AiAction[] = [];
  for (const { action, priority } of scored) {
    if (out.length >= skill.maxActions) break;
    if (action.armyId && usedArmies.has(action.armyId)) continue;
    if ((action.type === 'ATTACK' || action.kind === 'CAPTURE') && action.targetProvinceId) {
      if (claimedTargets.has(action.targetProvinceId)) continue;
      claimedTargets.add(action.targetProvinceId);
    }
    if (action.armyId) usedArmies.add(action.armyId);
    out.push({ ...action, priority });
  }
  return out.length ? out : [{ type: 'SKIP', priority: 0 }];
}

export function calculateAiActions(faction: Faction, armies: Army[], provinces: Province[], relations: DiplomaticRelation[], options: AiOptions = {}): AiAction[] {
  return selectAiActions(calculateAiCandidates(faction, armies, provinces, relations), faction.personality, options);
}
