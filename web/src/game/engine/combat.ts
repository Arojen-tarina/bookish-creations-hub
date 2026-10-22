import { Rules } from '../data/gameData';
import type { Army, Province } from '../model/models';
import { d6, type GameRandom } from './gameRandom';

export const fortDurabilityOrFull = (p: Province): number => p.fortLevel > 0 ? p.fortDurability ?? Rules.FORT_MAX_DURABILITY : 0;
export const isFortDamaged = (p: Province): boolean => p.fortLevel > 0 && fortDurabilityOrFull(p) < Rules.FORT_MAX_DURABILITY;
export interface DefenseBreakdown { terrain: number; fortress: number; additional: number; total: number }
export function defenseBreakdown(p: Province, additional = 0, effectiveFortLevel = p.fortLevel): DefenseBreakdown {
  const terrain = ({ steppe:0,grassland:0,forest:1,mountain:3,desert:0,taiga:1,tundra:0,farmland:0,hills:2,marsh:1 } as const)[p.terrain] * 2;
  const fortress = effectiveFortLevel * 3 * fortDurabilityOrFull(p) / Rules.FORT_MAX_DURABILITY;
  return { terrain, fortress, additional, total: terrain + fortress + additional };
}
export const strength = (a: Army): number => a.cavalry * 3 + a.infantry * 1.5 + a.siege * 2;
export function createProvinceGarrison(p: Province): Army | null {
  if (!p.ownerId) return null;
  const fortGarrison = p.fortLevel > 0 ? p.fortLevel * 3 + Math.max(1, Math.floor(p.developmentLevel / 2)) : 0;
  const infantry = Math.max(p.garrison, fortGarrison);
  if (infantry <= 0) return null;
  return { id: `garrison-${p.id}`, ownerId: p.ownerId, provinceId: p.id, cavalry: 0, infantry, siege: 0, morale: Math.min(95, 55 + p.fortLevel * 10 + p.developmentLevel * 2), supply: 20, movementLeft: 0, leaderBonus: 0 };
}
export interface CombatOutcome { attackerWins: boolean; defenderDestroyed: boolean; attackerCavalryLoss: number; attackerInfantryLoss: number; defenderCavalryLoss: number; defenderInfantryLoss: number; attackRoll: number; defenseRoll: number; attackerScore: number; defenderScore: number }
const lossesFromDamage = (army: Army, damage: number): [number, number] => { const infantry = Math.min(army.infantry, damage); return [Math.min(army.cavalry, Math.floor((damage - infantry) / 2)), infantry]; };
export function resolveCombat(attacker: Army, defender: Army, battlefield: Province, attackBonus = 0, defenseBonus = 0, rng: GameRandom): CombatOutcome {
  const attackerPower = attacker.cavalry * 2 + attacker.infantry + attacker.siege + attackBonus;
  const defenderPower = defender.cavalry * 2 + defender.infantry;
  const attackRoll = d6(rng), defenseRoll = d6(rng);
  const attackerScore = attackerPower + attackRoll;
  const effectiveFortLevel = Math.max(0, battlefield.fortLevel - attacker.siege * .5);
  const defenderScore = defenderPower + defenseRoll + defenseBreakdown(battlefield, 0, effectiveFortLevel).terrain + defenseBreakdown(battlefield, 0, effectiveFortLevel).fortress;
  const attackerWins = attackerScore > defenderScore;
  const [defenderCavalryLoss, defenderInfantryLoss] = lossesFromDamage(defender, attackerWins ? Math.max(0, attackerPower - defenseBonus) : 0);
  const [attackerCavalryLoss, attackerInfantryLoss] = lossesFromDamage(attacker, attackerWins ? 0 : defenderPower);
  return { attackerWins, defenderDestroyed: attackerWins && defenderCavalryLoss >= defender.cavalry && defenderInfantryLoss >= defender.infantry, attackerCavalryLoss, attackerInfantryLoss, defenderCavalryLoss, defenderInfantryLoss, attackRoll, defenseRoll, attackerScore, defenderScore };
}
