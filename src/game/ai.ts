/**
 * ai.ts — Yksinkertainen tekoäly (MVP)
 * 
 * AI liikuttaa armeijoita, valloittaa vapaita alueita, hyökkää heikkoihin
 * kohteisiin ja rakentaa. Ei tarvitse olla älykäs, mutta toimiva.
 */
import { Province, FactionId, Faction, Army, PROVINCE_TERRAIN_INFO } from '@/types/province';

export interface AIAction {
  type: 'move' | 'attack' | 'build_fort' | 'recruit' | 'skip';
  armyId?: string;
  targetProvinceId?: string;
  description: string;
}

export function calculateAIActions(
  faction: Faction,
  armies: Army[],
  provinces: Province[],
  allArmies: Army[],
): AIAction[] {
  const actions: AIAction[] = [];
  const myArmies = armies.filter(a => a.ownerId === faction.id && a.movementLeft > 0);
  const myProvinces = provinces.filter(p => p.ownerId === faction.id);
  
  for (const army of myArmies) {
    const currentProvince = provinces.find(p => p.id === army.provinceId);
    if (!currentProvince) continue;
    
    // Find neighbors we can move to
    const neighbors = currentProvince.neighbors
      .map(nId => provinces.find(p => p.id === nId))
      .filter((p): p is Province => !!p);
    
    // Priority 1: Attack weak adjacent enemies
    const attackTargets = neighbors.filter(p => {
      if (p.ownerId === faction.id || p.ownerId === null) return false;
      const enemyArmies = allArmies.filter(a => a.provinceId === p.id && a.ownerId !== faction.id);
      const enemyStrength = enemyArmies.reduce((s, a) => s + a.cavalry * 3 + a.infantry * 1.5, 0);
      const myStrength = army.cavalry * 3 + army.infantry * 1.5;
      return myStrength > enemyStrength * 0.8; // Attack if we're roughly equal or stronger
    });
    
    if (attackTargets.length > 0 && faction.personality !== 'cautious') {
      const target = attackTargets[0];
      actions.push({
        type: 'attack',
        armyId: army.id,
        targetProvinceId: target.id,
        description: `Hyökkää: ${target.name}`,
      });
      continue;
    }
    
    // Priority 2: Capture unowned neighbors
    const unowned = neighbors.filter(p => p.ownerId === null);
    if (unowned.length > 0) {
      // Prefer higher value provinces
      unowned.sort((a, b) => b.baseTax - a.baseTax);
      actions.push({
        type: 'move',
        armyId: army.id,
        targetProvinceId: unowned[0].id,
        description: `Valloi: ${unowned[0].name}`,
      });
      continue;
    }
    
    // Priority 3: Move toward enemy territory
    const enemyNeighbors = neighbors.filter(p => 
      p.ownerId !== null && p.ownerId !== faction.id
    );
    if (enemyNeighbors.length > 0 && faction.personality !== 'cautious') {
      // Move toward weakest enemy neighbor
      const target = enemyNeighbors[0];
      const terrainInfo = PROVINCE_TERRAIN_INFO[target.terrain];
      if (army.movementLeft >= terrainInfo.movementCost) {
        actions.push({
          type: 'move',
          armyId: army.id,
          targetProvinceId: target.id,
          description: `Eteneminen: ${target.name}`,
        });
        continue;
      }
    }
  }
  
  // Build fort in capital if affordable
  const capital = provinces.find(p => p.id === faction.capitalId && p.ownerId === faction.id);
  if (capital && capital.fortLevel < 3 && faction.treasury >= 50) {
    actions.push({
      type: 'build_fort',
      targetProvinceId: capital.id,
      description: `Linnoita: ${capital.name}`,
    });
  }
  
  // Recruit if wealthy enough
  if (faction.treasury >= 40 && faction.manpower >= 15) {
    const recruitProvince = capital || myProvinces[0];
    if (recruitProvince) {
      actions.push({
        type: 'recruit',
        targetProvinceId: recruitProvince.id,
        description: `Rekrytoi: ${recruitProvince.name}`,
      });
    }
  }
  
  if (actions.length === 0) {
    actions.push({ type: 'skip', description: 'Odottaa' });
  }
  
  return actions.slice(0, 3); // Max 3 actions per turn
}
