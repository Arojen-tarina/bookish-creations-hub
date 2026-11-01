import type { FactionId } from '../model/enums';
import type { Army, Province } from '../model/models';
import { createProvinceGarrison, defenseBreakdown } from './combat';

const DICE_DIFFERENCES: number[] = [];
for (let attackRoll = 1; attackRoll <= 6; attackRoll++) for (let defenseRoll = 1; defenseRoll <= 6; defenseRoll++) DICE_DIFFERENCES.push(attackRoll - defenseRoll);

const attackPowerOf = (a: Army): number => a.cavalry * 2 + a.infantry;
const defensePowerOf = (a: Army): number => a.cavalry * 2 + a.infantry;

export function battleOdds(attacker: Army, defender: Army, battlefield: Province): number {
  const { terrain, fortress } = defenseBreakdown(battlefield, 0, battlefield.fortLevel);
  const requiredRollDifference = defensePowerOf(defender) + terrain + fortress - attackPowerOf(attacker);
  return DICE_DIFFERENCES.filter(diff => diff > requiredRollDifference).length / DICE_DIFFERENCES.length;
}

export function defenderOf(province: Province, armies: Army[], attackerId: FactionId): Army | null {
  const field = armies.find(a => a.provinceId === province.id && a.ownerId !== attackerId);
  const garrison = province.ownerId && province.ownerId !== attackerId ? createProvinceGarrison(province) : null;
  if (field && garrison) return { ...field, infantry: field.infantry + garrison.infantry };
  return field ?? garrison;
}
