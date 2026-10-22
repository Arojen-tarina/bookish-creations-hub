export interface GameRandom { nextDouble(): number }
export const systemRandom: GameRandom = { nextDouble: () => Math.random() };
export const d6 = (rng: GameRandom): number => Math.floor(rng.nextDouble() * 6) + 1;
export function shuffled<T>(rng: GameRandom, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng.nextDouble() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export class Mulberry32 implements GameRandom {
  private state: number;
  constructor(seed: number) { this.state = seed | 0; }
  nextDouble(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
export const roundJs = (value: number): number => Math.floor(value + .5);
