import { describe, expect, it } from 'vitest';
import { canTakeSecondChance, takeSecondChance } from '../../src/game/engine/secondChance';
import { startGame } from '../../src/game/engine/setup';
import { Mulberry32 } from '../../src/game/engine/gameRandom';
describe('second chance',()=>{it('is offered only after defeat and can be used once',()=>{const state=startGame('mongol','normal',new Mulberry32(1)),lost={...state,gameOver:true,winnerId:'song' as const};expect(canTakeSecondChance(lost)).toBe(true);const used=takeSecondChance(lost);expect(used.secondChanceUsed).toBe(true);expect(canTakeSecondChance(used)).toBe(false);});});
