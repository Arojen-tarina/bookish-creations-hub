import { describe, expect, it } from 'vitest';
import { Mulberry32 } from '../../src/game/engine/gameRandom';
import { startGame } from '../../src/game/engine/setup';
import { buildStructure, recruitArmy, canMoveTo, moveArmy } from '../../src/game/engine/playerActions';
import { calculateResourceCollection } from '../../src/game/engine/economy';
import { attackPower } from '../../src/game/engine/combat';
import { PROVINCES_1206 } from '../../src/game/data/provinces1206';
import { mapImageRect } from '../../src/ui/game/map/mapCamera';

describe('game rules',()=>{
 it('creates a reproducible 1206 campaign with an initial collection',()=>{const a=startGame('mongol','normal',new Mulberry32(1));expect(a.turn).toBe(1);expect(a.year).toBe(1206);expect(a.hand).toHaveLength(5);expect(a.resourcesCollected).toBe(true);expect(a.lastCollection).not.toBeNull();});
 it('enforces capital building and recruitment costs',()=>{let s=startGame('mongol','normal',new Mulberry32(2));const playerId=s.playerFactionId;const treasury=s.factions.find(f=>f.id===playerId)!.treasury;const capital=s.factions.find(f=>f.id===playerId)!.capitalId;s=buildStructure(s,capital,'camp');expect(s.buildings[capital]).toContain('camp');expect(s.factions.find(f=>f.id===playerId)!.treasury).toBe(treasury-15);const count=s.armies.length;s=recruitArmy(s,capital,'infantry');expect(s.armies.length).toBe(count+1);});
 it('uses injected randomness in battles and keeps movement pure when blocked',()=>{const s=startGame('mongol','normal',new Mulberry32(3));const army=s.armies[0],target=s.provinces.find(p=>p.id===army.provinceId)!.neighbors[0];if(!canMoveTo(s,army.id,target)){expect(moveArmy(s,army.id,target,new Mulberry32(4)).state).toBe(s);}else expect(moveArmy(s,army.id,target,new Mulberry32(4)).state).not.toBe(s);});
 it('calculates resource collection without mutating state',()=>{const s=startGame('mongol','normal',new Mulberry32(1));expect(calculateResourceCollection(s,'mongol').taxIncome).toBeGreaterThan(0);expect(s.resourcesCollected).toBe(true);});
 it('calculates displayed attack power with the active bonus',()=>{const s=startGame('mongol','normal',new Mulberry32(1));const army=s.armies[0];expect(attackPower({...army,cavalry:3,infantry:4,siege:2},5)).toBe(17);});
 it('places all provinces on the requested staggered 17 by 13 hex grid',()=>{expect(PROVINCES_1206).toHaveLength(17*13);PROVINCES_1206.forEach((province,index)=>{const row=Math.floor(index/17),column=index%17;expect(province.center.x).toBeCloseTo(6.82+column*7.26+(row%2)*3.63,2);expect(province.center.y).toBeCloseTo(26.87+row*6.43,2);});});
 it('fits the complete source map image without cropping',()=>{const rect=mapImageRect(1953,1360);expect(rect.left).toBe(0);expect(rect.top).toBe(20);expect(rect.right-rect.left).toBe(130);expect(rect.bottom-rect.top).toBeCloseTo(130*1360/1953,6);});
});
