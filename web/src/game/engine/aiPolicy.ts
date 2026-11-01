import type { Personality } from '../model/enums';
import weightsFile from './ml/aiPolicyWeights.json';

export type AiActionKind = 'ATTACK' | 'CAPTURE' | 'ADVANCE' | 'DEFEND' | 'RETREAT' | 'MERGE' | 'FORTIFY' | 'MARKET' | 'RECRUIT';
export const AI_ACTION_KINDS: AiActionKind[] = ['ATTACK', 'CAPTURE', 'ADVANCE', 'DEFEND', 'RETREAT', 'MERGE', 'FORTIFY', 'MARKET', 'RECRUIT'];
export const AI_PERSONALITY_ORDER: Personality[] = ['aggressive', 'defensive', 'trader', 'expansionist', 'cautious'];

export interface AiFeatureContext {
  winChance: number;
  provinceValue: number;
  enemyTarget: boolean;
  freeTarget: boolean;
  ownedRatio: number;
  threat: number;
  armyStrength: number;
  fortLevel: number;
  terrainDefense: number;
  treasury: number;
  border: boolean;
}

export const AI_FEATURE_COUNT = AI_ACTION_KINDS.length + AI_PERSONALITY_ORDER.length + 11;

export function buildAiFeatures(kind: AiActionKind, personality: Personality, c: AiFeatureContext): number[] {
  const flag = (b: boolean) => (b ? 1 : 0);
  return [
    ...AI_ACTION_KINDS.map(k => flag(k === kind)),
    ...AI_PERSONALITY_ORDER.map(p => flag(p === personality)),
    c.winChance,
    c.provinceValue / 20,
    flag(c.enemyTarget),
    flag(c.freeTarget),
    c.ownedRatio,
    Math.min(2, c.threat),
    Math.min(2, c.armyStrength / 20),
    c.fortLevel / 3,
    c.terrainDefense / 6,
    Math.min(1, c.treasury / 200),
    flag(c.border),
  ];
}

export interface AiPolicy {
  inputSize: number;
  hiddenSize: number;
  w1: number[];
  b1: number[];
  w2: number[];
  b2: number;
}

export function predictAiPolicy(policy: AiPolicy, x: number[]): number {
  let out = policy.b2;
  for (let h = 0; h < policy.hiddenSize; h++) {
    let s = policy.b1[h];
    const base = h * policy.inputSize;
    for (let i = 0; i < policy.inputSize; i++) s += policy.w1[base + i] * x[i];
    out += policy.w2[h] * Math.tanh(s);
  }
  return Math.tanh(out);
}

const isValidPolicy = (p: AiPolicy | null): p is AiPolicy =>
  !!p && p.inputSize === AI_FEATURE_COUNT && p.w1.length === p.inputSize * p.hiddenSize && p.b1.length === p.hiddenSize && p.w2.length === p.hiddenSize;

export const DEFAULT_AI_POLICY: AiPolicy | null = isValidPolicy(weightsFile as AiPolicy) ? (weightsFile as AiPolicy) : null;
