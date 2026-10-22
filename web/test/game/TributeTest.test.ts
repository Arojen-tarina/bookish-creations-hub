import { describe, expect, it } from 'vitest';
import { canDrawTributeCard, canTakeTribute, takeTribute, tributeGold } from '../../src/game/engine/tribute';
import { Mulberry32 } from '../../src/game/engine/gameRandom';
import { startGame } from '../../src/game/engine/setup';
describe('tribute',()=>{it('is optional once per turn and pays at least the minimum gold',()=>{const s=startGame('mongol','normal',new Mulberry32(1));expect(canTakeTribute(s)).toBe(true);expect(tributeGold(s)).toBeGreaterThanOrEqual(40);const next=takeTribute(s,'GOLD',new Mulberry32(2));expect(next.tributeTurn).toBe(s.turn);expect(canTakeTribute(next)).toBe(false);expect(takeTribute(next,'GOLD',new Mulberry32(3))).toBe(next);});it('can draw a card when deck or discard has one',()=>{const s=startGame('mongol','normal',new Mulberry32(1));expect(canDrawTributeCard(s)).toBe(true);const n=takeTribute(s,'CARD',new Mulberry32(2));expect(n.hand.length).toBe(s.hand.length+1);});});
