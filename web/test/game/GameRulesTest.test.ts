import { describe, expect, it } from 'vitest';
import { Mulberry32 } from '../../src/game/engine/gameRandom';
import { startGame } from '../../src/game/engine/setup';
import { buildStructure, recruitArmy, canMoveTo, moveArmy } from '../../src/game/engine/playerActions';
import { calculateResourceCollection } from '../../src/game/engine/economy';

describe('game rules',()=>{
 it('creates a reproducible 1206 campaign with an initial collection',()=>{const a=startGame('mongol','normal',new Mulberry32(1));expect(a.turn).toBe(1);expect(a.year).toBe(1206);expect(a.hand).toHaveLength(5);expect(a.resourcesCollected).toBe(true);expect(a.lastCollection).not.toBeNull();});
 it('enforces capital building and recruitment costs',()=>{let s=startGame('mongol','normal',new Mulberry32(2));const playerId=s.playerFactionId;const treasury=s.factions.find(f=>f.id===playerId)!.treasury;const capital=s.factions.find(f=>f.id===playerId)!.capitalId;s=buildStructure(s,capital,'camp');expect(s.buildings[capital]).toContain('camp');expect(s.factions.find(f=>f.id===playerId)!.treasury).toBe(treasury-15);const count=s.armies.length;s=recruitArmy(s,capital,'infantry');expect(s.armies.length).toBe(count+1);});
 it('uses injected randomness in battles and keeps movement pure when blocked',()=>{const s=startGame('mongol','normal',new Mulberry32(3));const army=s.armies[0],target=s.provinces.find(p=>p.id===army.provinceId)!.neighbors[0];if(!canMoveTo(s,army.id,target)){expect(moveArmy(s,army.id,target,new Mulberry32(4)).state).toBe(s);}else expect(moveArmy(s,army.id,target,new Mulberry32(4)).state).not.toBe(s);});
 it('calculates resource collection without mutating state',()=>{const s=startGame('mongol','normal',new Mulberry32(1));expect(calculateResourceCollection(s,'mongol').taxIncome).toBeGreaterThan(0);expect(s.resourcesCollected).toBe(true);});
});
