import { startGame } from './src/game/engine/setup';
import { systemRandom } from './src/game/engine/gameRandom';
import { SaveRepository } from './src/data/SaveRepository';
class MemoryStorage { private values = new Map<string, string>(); getItem(k: string) { return this.values.get(k) ?? null; } setItem(k: string, v: string) { this.values.set(k, v); } removeItem(k: string) { this.values.delete(k); } }
Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true });
const state = startGame('mongol', 'normal', systemRandom);
const saves = new SaveRepository(() => 1_800_000_000_000);
if (!saves.save(0, state)) throw new Error('fresh game save rejected');
saves.refresh();
if (saves.load(0)?.turn !== 1) throw new Error('fresh game save did not round-trip');
console.log('foundation save round-trip passed');
