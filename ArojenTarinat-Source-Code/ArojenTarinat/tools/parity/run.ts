// Parity harness: plays a scripted game on the ORIGINAL TypeScript engine with a
// seeded RNG and records a canonical snapshot after every step.
// Usage: see regenerate.sh (node out/run.mjs <faction> <seed> <difficulty> <maxTurns> <out.json> [full.json])
import { __beginRender, __reset } from 'react';
import { useProvinceGameState } from './patched/useProvinceGameState.ts';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';

(globalThis as any).sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const [faction, seedStr, difficulty, maxTurnsStr, outPath, fullPath] = process.argv.slice(2);
Math.random = mulberry32(parseInt(seedStr, 10));
__reset();
let api: any;
const render = () => { __beginRender(); api = useProvinceGameState(); };
const act = (fn: () => void) => { fn(); render(); };
render();
act(() => api.startGame(faction, difficulty));

const ids = (cards: any[]) => cards.map((c) => c.id);
function snapshot(s: any): string {
  const streaks = Object.entries(s.aiTreasuryStreaks || {}).sort(([a], [b]) => (a < b ? -1 : 1));
  const lc = s.lastCollection;
  return JSON.stringify([
    s.turn, s.year, s.food, s.artisans, s.influence ?? 0, s.prestige ?? 0, s.treasuryStreak ?? 0, streaks,
    !!s.gameOver, s.winnerId ?? null, s.winCondition ?? null, !!s.chiefLost,
    s.attackBonus, s.defenseBonus, s.movementBonus,
    s.factions.map((f: any) => [f.id, f.treasury, f.manpower, f.horses]),
    s.provinces.map((p: any) => [p.id, p.ownerId ?? null, p.fortLevel, p.fortDurability ?? null, p.garrison, p.unrest, p.siegeProgress ?? null]),
    s.armies.map((a: any) => [a.id, a.ownerId, a.provinceId, a.cavalry, a.infantry, a.siege, a.morale, a.supply, a.movementLeft]),
    ids(s.hand), ids(s.deck), ids(s.discard), ids(s.playedTechCards),
    s.activeEffects.map((e: any) => [e.cardId, e.type, e.value, e.remainingTurns]),
    Object.keys(s.buildings).sort().map((k) => [k, s.buildings[k]]),
    s.relations.map((r: any) => [r.factionA, r.factionB, r.relation, r.trust, r.threat, r.lastProposalTurn ?? null,
      r.treaties.map((t: any) => [t.type, t.startTurn, t.duration])]),
    s.aiLog.length,
    lc ? [lc.taxIncome, lc.manpowerGain, lc.marketBonus, lc.silkRoadBonus, lc.foodChange, lc.artisansGain, lc.horsesGain, lc.influenceGain, lc.prestigeGain] : null,
    !!s.resourcesCollected,
  ]);
}

const steps: { label: string; snap: string }[] = [];
const record = (label: string) => steps.push({ label, snap: snapshot(api.gameState) });
record('start');

const BUILD_ORDER = ['market', 'camp', 'workshop', 'stable', 'bridge', 'fortress'];
for (let i = 0; i < parseInt(maxTurnsStr, 10) && !api.gameState.gameOver; i++) {
  const s0 = api.gameState;
  const player = api.playerFaction;
  const turn = s0.turn;
  // 1. play the first card
  if (s0.hand.length > 0) act(() => api.playCard(s0.hand[0]));
  // 2. build in the capital
  const capital = api.gameState.factions.find((f: any) => f.id === player).capitalId;
  for (const b of BUILD_ORDER) act(() => api.buildStructure(capital, b));
  if (turn >= 10) act(() => api.buildStructure(capital, 'wonder'));
  // 3. recruit
  act(() => api.recruitArmy(capital, 'infantry'));
  if (turn % 3 === 0) act(() => api.recruitArmy(capital, 'cavalry'));
  // 4. merge stacks
  {
    const groups = new Map<string, string[]>();
    for (const a of api.gameState.armies) if (a.ownerId === player) {
      if (!groups.has(a.provinceId)) groups.set(a.provinceId, []);
      groups.get(a.provinceId)!.push(a.id);
    }
    for (const list of groups.values()) for (let k = 1; k < list.length; k++) act(() => api.mergeArmies(list[k], list[0]));
  }
  // 5. move every army one step into foreign land if possible
  const armyIds = api.gameState.armies.filter((a: any) => a.ownerId === player).map((a: any) => a.id);
  for (const id of armyIds) {
    const army = api.gameState.armies.find((a: any) => a.id === id);
    if (!army) continue;
    const prov = api.gameState.provinces.find((p: any) => p.id === army.provinceId);
    for (const n of prov.neighbors) {
      const t = api.gameState.provinces.find((p: any) => p.id === n);
      if (t.ownerId !== player && api.canMoveTo(id, n)) { act(() => api.moveArmy(id, n)); break; }
    }
  }
  // 6. diplomacy
  const rivals = api.gameState.factions.filter((f: any) => f.id !== player).map((f: any) => f.id);
  if (turn === 3 && rivals[0]) act(() => api.proposeTreaty(rivals[0], 'trade_agreement'));
  if (turn === 5 && rivals[1]) act(() => api.proposeTreaty(rivals[1], 'alliance'));
  if (turn === 8 && rivals[2]) act(() => api.proposeTreaty(rivals[2], 'non_aggression'));
  if (turn === 12 && rivals[2]) act(() => api.declareWar(rivals[2], false));
  if (turn === 16 && rivals[0]) act(() => api.breakTreaty(rivals[0], 'trade_agreement'));
  if (turn === 20 && rivals[1]) act(() => api.declareWar(rivals[1], true));
  // 7. repair damaged forts
  for (const p of api.gameState.provinces) {
    if (p.ownerId === player && p.fortLevel > 0 && (p.fortDurability ?? 100) < 100) act(() => api.repairFort(p.id, false));
  }
  record(`t${turn}-actions`);
  act(() => api.endTurn());
  record(`t${turn}-end`);
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
writeFileSync(outPath, JSON.stringify({
  faction, seed: parseInt(seedStr, 10), difficulty, maxTurns: parseInt(maxTurnsStr, 10),
  steps: steps.map((st) => ({ label: st.label, sha: sha(st.snap) })),
}, null, 1));
if (fullPath) writeFileSync(fullPath, JSON.stringify(steps));
console.log(`${faction} seed=${seedStr} ${difficulty}: ${steps.length} steps, final turn ${api.gameState.turn}, gameOver=${api.gameState.gameOver} winner=${api.gameState.winnerId} (${api.gameState.winCondition})`);
