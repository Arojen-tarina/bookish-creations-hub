// Head-to-head evaluation: legacy AI vs heuristic-only AI vs heuristic+ML AI, per difficulty, on identical seeds.
// Metric: share of provinces held by AI-controlled factions after TURNS turns (the player faction is passive in endTurn).
// Usage: npx vite-node ml/evaluate-ai.ts   (env: GAMES, TURNS)
import { DEFAULT_AI_POLICY } from '../src/game/engine/aiPolicy';
import { calculateAiActions } from '../src/game/engine/ai';
import { Mulberry32 } from '../src/game/engine/gameRandom';
import type { Difficulty } from '../src/game/model/enums';
import type { GameState } from '../src/game/model/models';
import { aiFactions, DIFFICULTIES, legacyDecision, newGame, ownedProvinces, stepWith } from './simulate';

const env = (k: string, d: number) => Number(process.env[k] ?? d);
const GAMES = env('GAMES', 100);
const TURNS = env('TURNS', 60);

type Decide = (s: GameState, rng: Mulberry32) => ReturnType<typeof legacyDecision>;
const ARMS: Record<string, Decide> = {
  legacy: () => legacyDecision(),
  heuristic: (s, rng) => (f, a, p, r) => calculateAiActions(f, a, p, r, { difficulty: s.difficulty, rng, policy: null }),
  ml: (s, rng) => (f, a, p, r) => calculateAiActions(f, a, p, r, { difficulty: s.difficulty, rng, policy: DEFAULT_AI_POLICY }),
};

function play(seed: number, difficulty: Difficulty, decide: Decide) {
  let s = newGame(seed, difficulty);
  const rng = new Mulberry32(seed + 1);
  for (let t = 0; t < TURNS && !s.gameOver; t++) s = stepWith(s, rng, decide);
  const ai = aiFactions(s);
  const aiOwned = ai.reduce((n, id) => n + ownedProvinces(s, id), 0);
  const total = s.provinces.filter(p => p.ownerId).length;
  const playerOwned = ownedProvinces(s, s.playerFactionId);
  return { share: total ? aiOwned / total : 0, aiOwned, playerOwned, aiAhead: aiOwned / Math.max(1, ai.length) > playerOwned };
}

const t0 = Date.now();
console.log(`games=${GAMES} turns=${TURNS} policy=${DEFAULT_AI_POLICY ? 'loaded' : 'none'}`);
for (const difficulty of DIFFICULTIES) {
  const rows = Object.entries(ARMS).map(([name, decide]) => {
    const res = Array.from({ length: GAMES }, (_, g) => play(1000 + g, difficulty, decide));
    const avg = (k: 'share' | 'aiOwned' | 'playerOwned') => res.reduce((n, r) => n + r[k], 0) / GAMES;
    return { name, share: avg('share'), aiOwned: avg('aiOwned'), playerOwned: avg('playerOwned'), aiAhead: res.filter(r => r.aiAhead).length / GAMES };
  });
  console.log(`\n[${difficulty}]`);
  console.log('arm        AIshare  AIprov  playerProv  AI>player');
  for (const r of rows) console.log(`${r.name.padEnd(10)} ${r.share.toFixed(3).padStart(7)} ${r.aiOwned.toFixed(1).padStart(7)} ${r.playerOwned.toFixed(1).padStart(11)} ${(r.aiAhead * 100).toFixed(0).padStart(8)}%`);
}
console.log(`\ndone in ${Date.now() - t0} ms`);
