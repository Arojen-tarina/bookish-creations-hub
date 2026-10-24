import { describe, expect, it } from 'vitest';
import { CHIEF_AURA_ADJACENT, CHIEF_AURA_SAME_PROVINCE, chiefAuraBonus, resolveCombat } from '../../src/game/engine/combat';
import { Mulberry32 } from '../../src/game/engine/gameRandom';
import { newArmy, newProvince, type Province } from '../../src/game/model/models';

const provinces: Province[] = [
  newProvince({ id: 'a', name: 'A', region: 'mongolia', ownerId: 'mongol', terrain: 'steppe', baseTax: 1, baseManpower: 1, center: { x: 0, y: 0 }, neighbors: ['b'] }),
  newProvince({ id: 'b', name: 'B', region: 'mongolia', ownerId: 'mongol', terrain: 'steppe', baseTax: 1, baseManpower: 1, center: { x: 1, y: 0 }, neighbors: ['a', 'c'] }),
  newProvince({ id: 'c', name: 'C', region: 'mongolia', ownerId: 'mongol', terrain: 'steppe', baseTax: 1, baseManpower: 1, center: { x: 2, y: 0 }, neighbors: ['b'] }),
];

const chief = newArmy({ id: 'army-mongol-main', ownerId: 'mongol', provinceId: 'a', cavalry: 2, infantry: 2, siege: 0, movementLeft: 0 });
const unit = (provinceId: string) => newArmy({ id: `u-${provinceId}`, ownerId: 'mongol', provinceId, cavalry: 1, infantry: 1, siege: 0, movementLeft: 0 });

describe('chief aura', () => {
  it('gives the full bonus in the chief province and a smaller one next door', () => {
    const armies = [chief];
    expect(chiefAuraBonus(unit('a'), armies, provinces)).toBe(CHIEF_AURA_SAME_PROVINCE);
    expect(chiefAuraBonus(unit('b'), armies, provinces)).toBe(CHIEF_AURA_ADJACENT);
    expect(chiefAuraBonus(unit('c'), armies, provinces)).toBe(0);
    expect(CHIEF_AURA_SAME_PROVINCE).toBeGreaterThan(CHIEF_AURA_ADJACENT);
  });

  it('gives nothing when the chief is dead or belongs to another faction', () => {
    const dead = { ...chief, cavalry: 0, infantry: 0 };
    expect(chiefAuraBonus(unit('a'), [dead], provinces)).toBe(0);
    const rival = { ...unit('a'), ownerId: 'song' as const, id: 'army-song-main' };
    expect(chiefAuraBonus(unit('a'), [rival], provinces)).toBe(0);
  });

  it('raises defender power when the defender carries an aura', () => {
    const attacker = unit('b');
    const defender = unit('a');
    const battlefield = provinces[0];
    const plain = resolveCombat(attacker, defender, battlefield, 0, 0, new Mulberry32(7));
    const boosted = resolveCombat(attacker, defender, battlefield, 0, 0, new Mulberry32(7), CHIEF_AURA_SAME_PROVINCE);
    expect(boosted.defenderScore - plain.defenderScore).toBe(CHIEF_AURA_SAME_PROVINCE);
  });
});
