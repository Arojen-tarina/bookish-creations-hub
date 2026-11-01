// Offline trainer for the AI action policy (MLP 25 -> 16 -> 1, tanh).
// Labels come from counterfactual self-play: for sampled decision points, the value of inserting a candidate
// action into the heuristic plan, measured as the change in the faction's score after a short horizon.
// Usage: npx vite-node ml/train-ai-policy.ts   (env: GAMES, TURNS, HORIZON, SAMPLE_P, PER_DECISION, HIDDEN, EPOCHS, LR)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AI_FEATURE_COUNT } from '../src/game/engine/aiPolicy';
import { calculateAiCandidates } from '../src/game/engine/ai';
import { Mulberry32 } from '../src/game/engine/gameRandom';
import { aiFactions, DIFFICULTIES, factionScore, heuristicDecision, newGame, rollout, stepWith } from './simulate';

const env = (k: string, d: number) => Number(process.env[k] ?? d);
const GAMES = env('GAMES', 120);
const TURNS = env('TURNS', 30);
const HORIZON = env('HORIZON', 2);
const SAMPLE_P = env('SAMPLE_P', .08);
const PER_DECISION = env('PER_DECISION', 6);
const HIDDEN = env('HIDDEN', 16);
const EPOCHS = env('EPOCHS', 150);
const LR = env('LR', .01);
const OUT = fileURLToPath(new URL('../src/game/engine/ml/aiPolicyWeights.json', import.meta.url));

interface Sample { x: number[]; y: number; game: number }

function collectSamples(): Sample[] {
  const samples: Sample[] = [];
  const pick = new Mulberry32(4242);
  for (let g = 0; g < GAMES; g++) {
    const difficulty = DIFFICULTIES[g % DIFFICULTIES.length];
    let s = newGame(1000 + g, difficulty);
    const rng = new Mulberry32(5000 + g);
    for (let turn = 0; turn < TURNS && !s.gameOver; turn++) {
      for (const fId of aiFactions(s)) {
        if (pick.nextDouble() > SAMPLE_P) continue;
        const faction = s.factions.find(f => f.id === fId)!;
        const candidates = calculateAiCandidates(faction, s.armies, s.provinces, s.relations);
        const chosen = candidates.map(c => ({ c, r: pick.nextDouble() })).sort((a, b) => a.r - b.r).slice(0, PER_DECISION).map(x => x.c);
        const seed = g * 1_000_003 + turn * 1009 + fId.length * 17;
        const base = factionScore(rollout(s, HORIZON, seed, null, heuristicDecision), fId);
        for (const action of chosen) {
          const score = factionScore(rollout(s, HORIZON, seed, { faction: fId, action }, heuristicDecision), fId);
          samples.push({ x: action.features!, y: Math.tanh((score - base) / 3), game: g });
        }
      }
      s = stepWith(s, rng, heuristicDecision);
    }
  }
  return samples;
}

interface Net { w1: number[]; b1: number[]; w2: number[]; b2: number }

function forward(net: Net, x: number[]) {
  const a = new Array<number>(HIDDEN);
  for (let h = 0; h < HIDDEN; h++) {
    let s = net.b1[h];
    for (let i = 0; i < AI_FEATURE_COUNT; i++) s += net.w1[h * AI_FEATURE_COUNT + i] * x[i];
    a[h] = Math.tanh(s);
  }
  let z = net.b2;
  for (let h = 0; h < HIDDEN; h++) z += net.w2[h] * a[h];
  return { a, o: Math.tanh(z) };
}

function mse(net: Net, data: Sample[]) {
  return data.reduce((n, d) => n + (forward(net, d.x).o - d.y) ** 2, 0) / Math.max(1, data.length);
}

function train(train: Sample[], val: Sample[]): { net: Net; valMse: number; valR2: number } {
  const rng = new Mulberry32(7);
  const init = (n: number) => Array.from({ length: n }, () => (rng.nextDouble() * 2 - 1) * 0.1);
  const net: Net = { w1: init(HIDDEN * AI_FEATURE_COUNT), b1: new Array(HIDDEN).fill(0), w2: init(HIDDEN), b2: 0 };
  let best = structuredClone(net);
  let bestVal = Infinity;
  for (let epoch = 0; epoch < EPOCHS; epoch++) {
    const order = train.map((_, i) => i).sort(() => rng.nextDouble() - .5);
    for (const idx of order) {
      const { x, y } = train[idx];
      const { a, o } = forward(net, x);
      const g = 2 * (o - y) * (1 - o * o);
      for (let h = 0; h < HIDDEN; h++) {
        const ds = g * net.w2[h] * (1 - a[h] * a[h]);
        net.w2[h] -= LR * (g * a[h] + 1e-4 * net.w2[h]);
        net.b1[h] -= LR * ds;
        for (let i = 0; i < AI_FEATURE_COUNT; i++) net.w1[h * AI_FEATURE_COUNT + i] -= LR * (ds * x[i] + 1e-4 * net.w1[h * AI_FEATURE_COUNT + i]);
      }
      net.b2 -= LR * g;
    }
    const v = mse(net, val);
    if (v < bestVal) { bestVal = v; best = structuredClone(net); }
  }
  const mean = val.reduce((n, d) => n + d.y, 0) / Math.max(1, val.length);
  const variance = val.reduce((n, d) => n + (d.y - mean) ** 2, 0) / Math.max(1, val.length);
  return { net: best, valMse: bestVal, valR2: variance > 0 ? 1 - bestVal / variance : 0 };
}

const t0 = Date.now();
const samples = collectSamples();
const trainSet = samples.filter(s => s.game % 6 !== 0);
const valSet = samples.filter(s => s.game % 6 === 0);
console.log(`samples=${samples.length} train=${trainSet.length} val=${valSet.length} collectMs=${Date.now() - t0}`);
const { net, valMse, valR2 } = train(trainSet, valSet);
const round = (v: number) => Math.round(v * 1e6) / 1e6;
const out = {
  inputSize: AI_FEATURE_COUNT,
  hiddenSize: HIDDEN,
  w1: net.w1.map(round),
  b1: net.b1.map(round),
  w2: net.w2.map(round),
  b2: round(net.b2),
  trained: true,
  samples: samples.length,
  validationMse: round(valMse),
  validationR2: round(valR2),
  horizonTurns: HORIZON,
  generatedBy: 'ml/train-ai-policy.ts',
};
writeFileSync(OUT, JSON.stringify(out));
console.log(`valMse=${valMse.toFixed(4)} valR2=${valR2.toFixed(3)} wrote=${OUT} totalMs=${Date.now() - t0}`);
