/**
 * ai.ts — Strateginen tekoäly provinssipelille
 *
 * Ominaisuudet:
 * - Persoonallisuuspohjainen päätöksenteko (aggressive, defensive, trader, expansionist, cautious)
 * - BFS-reitinhaku lähimpiin kohteisiin
 * - Uhka-arviointi ja puolustuksen priorisointi
 * - Armeijan rekrytointi ja strateginen sijoittelu
 * - Rakentaminen (linnoitukset, markkinat)
 * - Diplomaattiset suhteet vaikuttavat hyökkäyskohteisiin
 * - Armeijan yhdistäminen ja jakaminen
 */
import {
  Province,
  FactionId,
  Faction,
  Army,
  DiplomaticRelation,
  PROVINCE_TERRAIN_INFO,
} from '@/types/province';

// ============= TYPES =============

export interface AIAction {
  type: 'move' | 'attack' | 'build_fort' | 'build_market' | 'recruit' | 'merge' | 'skip';
  armyId?: string;
  mergeIntoId?: string;
  targetProvinceId?: string;
  description: string;
  priority: number; // higher = more important
}

interface ThreatInfo {
  factionId: FactionId;
  totalStrength: number;
  borderingProvinces: string[];
  armiesNearBorder: number;
}

interface ProvinceScore {
  provinceId: string;
  score: number;
  distance: number;
  path: string[];
}

// ============= HELPERS =============

function armyStrength(army: Army): number {
  return army.cavalry * 3 + army.infantry * 1.5 + army.siege * 2;
}

function totalFactionStrength(factionId: FactionId, armies: Army[]): number {
  return armies
    .filter(a => a.ownerId === factionId)
    .reduce((s, a) => s + armyStrength(a), 0);
}

function provinceValue(p: Province): number {
  return p.baseTax + p.baseManpower * 0.5 + (p.hasSilkRoad ? 3 : 0) +
    (p.tradeGood ? 2 : 0) + (p.isCapital ? 5 : 0);
}

/**
 * BFS: löydä lyhin reitti provinssista toiseen.
 * Palauttaa polun (ilman lähtöprovinsssia) tai null jos ei reittiä.
 */
function bfsPath(
  fromId: string,
  toId: string,
  provinces: Province[],
  maxDepth: number = 6,
): string[] | null {
  const queue: { id: string; path: string[] }[] = [{ id: fromId, path: [] }];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.path.length >= maxDepth) continue;

    const province = provinces.find(p => p.id === current.id);
    if (!province) continue;

    for (const nId of province.neighbors) {
      if (visited.has(nId)) continue;
      visited.add(nId);
      const newPath = [...current.path, nId];
      if (nId === toId) return newPath;
      queue.push({ id: nId, path: newPath });
    }
  }
  return null;
}

/**
 * BFS: löydä kaikki vihollisen/tyhjät provinssit tietyllä etäisyydellä
 */
function findTargetsInRange(
  startId: string,
  provinces: Province[],
  factionId: FactionId,
  maxRange: number = 4,
): ProvinceScore[] {
  const results: ProvinceScore[] = [];
  const queue: { id: string; path: string[]; dist: number }[] = [{ id: startId, path: [], dist: 0 }];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.dist > maxRange) continue;

    const province = provinces.find(p => p.id === current.id);
    if (!province) continue;

    // Target = ei oma provinssi (paitsi aloituspiste)
    if (current.dist > 0 && province.ownerId !== factionId) {
      results.push({
        provinceId: province.id,
        score: provinceValue(province) / Math.max(1, current.dist),
        distance: current.dist,
        path: current.path,
      });
    }

    for (const nId of province.neighbors) {
      if (visited.has(nId)) continue;
      visited.add(nId);
      queue.push({ id: nId, path: [...current.path, nId], dist: current.dist + 1 });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

// ============= THREAT ANALYSIS =============

function analyzeThreat(
  faction: Faction,
  provinces: Province[],
  armies: Army[],
  relations: DiplomaticRelation[],
): ThreatInfo[] {
  const myProvinces = provinces.filter(p => p.ownerId === faction.id);
  const myBorderIds = new Set<string>();
  const borderByFaction: Record<string, string[]> = {};

  // Etsi rajaprovinsset
  for (const mp of myProvinces) {
    for (const nId of mp.neighbors) {
      const neighbor = provinces.find(p => p.id === nId);
      if (neighbor && neighbor.ownerId !== null && neighbor.ownerId !== faction.id) {
        myBorderIds.add(mp.id);
        if (!borderByFaction[neighbor.ownerId]) borderByFaction[neighbor.ownerId] = [];
        borderByFaction[neighbor.ownerId].push(nId);
      }
    }
  }

  const threats: ThreatInfo[] = [];
  for (const [fId, borderProvs] of Object.entries(borderByFaction)) {
    const enemyArmiesNearBorder = armies.filter(a =>
      a.ownerId === fId && borderProvs.includes(a.provinceId)
    ).length;

    const rel = relations.find(r =>
      (r.factionA === faction.id && r.factionB === fId) ||
      (r.factionB === faction.id && r.factionA === fId)
    );

    const strength = totalFactionStrength(fId as FactionId, armies);
    const hostilityMod = rel ? Math.max(0, -rel.relation) / 100 : 0.5;

    threats.push({
      factionId: fId as FactionId,
      totalStrength: strength * (1 + hostilityMod),
      borderingProvinces: [...new Set(borderProvs)],
      armiesNearBorder: enemyArmiesNearBorder,
    });
  }

  return threats.sort((a, b) => b.totalStrength - a.totalStrength);
}

// ============= PERSONALITY WEIGHTS =============

interface PersonalityWeights {
  attackWeight: number;
  expandWeight: number;
  defendWeight: number;
  buildWeight: number;
  recruitWeight: number;
  aggressionThreshold: number; // min strength ratio to attack
}

const PERSONALITY_WEIGHTS: Record<string, PersonalityWeights> = {
  aggressive:    { attackWeight: 2.0, expandWeight: 1.5, defendWeight: 0.5, buildWeight: 0.5, recruitWeight: 1.5, aggressionThreshold: 0.6 },
  defensive:     { attackWeight: 0.5, expandWeight: 0.8, defendWeight: 2.0, buildWeight: 1.5, recruitWeight: 1.0, aggressionThreshold: 1.5 },
  trader:        { attackWeight: 0.3, expandWeight: 1.0, defendWeight: 1.0, buildWeight: 2.0, recruitWeight: 0.8, aggressionThreshold: 1.8 },
  expansionist:  { attackWeight: 1.0, expandWeight: 2.0, defendWeight: 0.8, buildWeight: 1.0, recruitWeight: 1.2, aggressionThreshold: 0.8 },
  cautious:      { attackWeight: 0.3, expandWeight: 0.6, defendWeight: 1.5, buildWeight: 1.5, recruitWeight: 1.0, aggressionThreshold: 2.0 },
};

// ============= MAIN AI =============

export function calculateAIActions(
  faction: Faction,
  armies: Army[],
  provinces: Province[],
  allArmies: Army[],
  relations: DiplomaticRelation[] = [],
): AIAction[] {
  const actions: AIAction[] = [];
  const weights = PERSONALITY_WEIGHTS[faction.personality] || PERSONALITY_WEIGHTS.cautious;

  const myArmies = armies.filter(a => a.ownerId === faction.id && a.movementLeft > 0);
  const myProvinces = provinces.filter(p => p.ownerId === faction.id);
  const myStrength = totalFactionStrength(faction.id, allArmies);
  const threats = analyzeThreat(faction, provinces, allArmies, relations);

  // Track which armies we've already assigned actions to
  const assignedArmies = new Set<string>();

  // ============= 1. MERGE weak armies in same province =============
  const armiesByProvince: Record<string, Army[]> = {};
  for (const a of myArmies) {
    if (!armiesByProvince[a.provinceId]) armiesByProvince[a.provinceId] = [];
    armiesByProvince[a.provinceId].push(a);
  }
  for (const [_pid, armsInProv] of Object.entries(armiesByProvince)) {
    if (armsInProv.length >= 2) {
      // Merge smallest into largest
      armsInProv.sort((a, b) => armyStrength(b) - armyStrength(a));
      for (let i = 1; i < armsInProv.length; i++) {
        actions.push({
          type: 'merge',
          armyId: armsInProv[i].id,
          mergeIntoId: armsInProv[0].id,
          description: `Yhdistä armeijat: ${armsInProv[i].id} → ${armsInProv[0].id}`,
          priority: 5,
        });
        assignedArmies.add(armsInProv[i].id);
      }
    }
  }

  // ============= 2. DEFEND threatened borders =============
  const highestThreat = threats[0];
  if (highestThreat && highestThreat.armiesNearBorder > 0) {
    // Find idle armies not near the threat
    const idleArmies = myArmies.filter(a =>
      !assignedArmies.has(a.id) &&
      !highestThreat.borderingProvinces.includes(a.provinceId)
    );

    for (const army of idleArmies) {
      if (assignedArmies.has(army.id)) continue;
      // Find closest threatened border province
      let bestTarget: string | null = null;
      let bestDist = Infinity;

      for (const borderProv of highestThreat.borderingProvinces) {
        // Find my province adjacent to this border
        const myBorderProvs = myProvinces.filter(mp =>
          mp.neighbors.includes(borderProv)
        );
        for (const mp of myBorderProvs) {
          const path = bfsPath(army.provinceId, mp.id, provinces, 4);
          if (path && path.length < bestDist) {
            bestDist = path.length;
            bestTarget = path[0]; // Next step
          }
        }
      }

      if (bestTarget && bestDist <= 3 && weights.defendWeight > 1.0) {
        actions.push({
          type: 'move',
          armyId: army.id,
          targetProvinceId: bestTarget,
          description: `Puolusta rajaa: ${provinces.find(p => p.id === bestTarget)?.name || bestTarget}`,
          priority: 8 * weights.defendWeight,
        });
        assignedArmies.add(army.id);
        break; // Only move one army to defend per turn
      }
    }
  }

  // ============= 3. ATTACK enemy provinces =============
  for (const army of myArmies) {
    if (assignedArmies.has(army.id)) continue;

    const currentProvince = provinces.find(p => p.id === army.provinceId);
    if (!currentProvince) continue;

    const neighbors = currentProvince.neighbors
      .map(nId => provinces.find(p => p.id === nId))
      .filter((p): p is Province => !!p);

    // Score each attackable neighbor
    const attackCandidates: { province: Province; score: number }[] = [];

    for (const neighbor of neighbors) {
      if (neighbor.ownerId === faction.id || neighbor.ownerId === null) continue;

      // Check diplomacy - don't attack allies
      const rel = relations.find(r =>
        (r.factionA === faction.id && r.factionB === neighbor.ownerId) ||
        (r.factionB === faction.id && r.factionA === neighbor.ownerId)
      );
      const hasTruce = rel?.treaties.some(t => t.type === 'truce' || t.type === 'alliance' || t.type === 'non_aggression');
      if (hasTruce && faction.personality !== 'aggressive') continue;

      const enemyArmiesHere = allArmies.filter(a => a.provinceId === neighbor.id && a.ownerId !== faction.id);
      const enemyStrength = enemyArmiesHere.reduce((s, a) => s + armyStrength(a), 0);
      const myStr = armyStrength(army);
      const terrainInfo = PROVINCE_TERRAIN_INFO[neighbor.terrain];
      const effectiveEnemyStr = enemyStrength * (1 + terrainInfo.defenseBonus * 0.2) * (1 + neighbor.fortLevel * 0.3);

      const ratio = myStr / Math.max(1, effectiveEnemyStr);
      if (ratio < weights.aggressionThreshold) continue;

      // Score: province value * strength ratio * personality weight
      const score = provinceValue(neighbor) * ratio * weights.attackWeight;
      attackCandidates.push({ province: neighbor, score });
    }

    if (attackCandidates.length > 0) {
      attackCandidates.sort((a, b) => b.score - a.score);
      const best = attackCandidates[0];
      const terrainInfo = PROVINCE_TERRAIN_INFO[best.province.terrain];

      if (army.movementLeft >= terrainInfo.movementCost) {
        actions.push({
          type: 'attack',
          armyId: army.id,
          targetProvinceId: best.province.id,
          description: `Hyökkää: ${best.province.name}`,
          priority: best.score,
        });
        assignedArmies.add(army.id);
      }
    }
  }

  // ============= 4. EXPAND to unowned provinces =============
  for (const army of myArmies) {
    if (assignedArmies.has(army.id)) continue;

    const targets = findTargetsInRange(army.provinceId, provinces, faction.id, 3);
    const unownedTargets = targets.filter(t => {
      const p = provinces.find(pr => pr.id === t.provinceId);
      return p && p.ownerId === null;
    });

    if (unownedTargets.length > 0) {
      const best = unownedTargets[0]; // Already sorted by score
      const nextStep = best.path[0];
      const nextProvince = provinces.find(p => p.id === nextStep);
      if (nextProvince) {
        const terrainInfo = PROVINCE_TERRAIN_INFO[nextProvince.terrain];
        if (army.movementLeft >= terrainInfo.movementCost) {
          const isDirectCapture = nextProvince.ownerId === null;
          actions.push({
            type: 'move',
            armyId: army.id,
            targetProvinceId: nextStep,
            description: isDirectCapture ? `Valloi: ${nextProvince.name}` : `Eteneminen: ${nextProvince.name}`,
            priority: best.score * weights.expandWeight,
          });
          assignedArmies.add(army.id);
        }
      }
    }
  }

  // ============= 5. ADVANCE toward enemy territory (if nothing else) =============
  for (const army of myArmies) {
    if (assignedArmies.has(army.id)) continue;

    const targets = findTargetsInRange(army.provinceId, provinces, faction.id, 4);
    const enemyTargets = targets.filter(t => {
      const p = provinces.find(pr => pr.id === t.provinceId);
      return p && p.ownerId !== null && p.ownerId !== faction.id;
    });

    if (enemyTargets.length > 0 && faction.personality !== 'cautious') {
      const best = enemyTargets[0];
      const nextStep = best.path[0];
      const nextProvince = provinces.find(p => p.id === nextStep);
      if (nextProvince) {
        const terrainInfo = PROVINCE_TERRAIN_INFO[nextProvince.terrain];
        if (army.movementLeft >= terrainInfo.movementCost) {
          actions.push({
            type: 'move',
            armyId: army.id,
            targetProvinceId: nextStep,
            description: `Eteneminen: ${nextProvince.name}`,
            priority: best.score * 0.5 * weights.attackWeight,
          });
          assignedArmies.add(army.id);
        }
      }
    }
  }

  // ============= 6. BUILD =============
  const capital = provinces.find(p => p.id === faction.capitalId && p.ownerId === faction.id);

  // Build fort on threatened border provinces
  if (weights.buildWeight >= 1.0 && faction.treasury >= 50) {
    const borderProvs = myProvinces.filter(mp =>
      mp.neighbors.some(nId => {
        const n = provinces.find(p => p.id === nId);
        return n && n.ownerId !== null && n.ownerId !== faction.id;
      })
    );
    // Fort the weakest border province without fort
    const needsFort = borderProvs.filter(p => p.fortLevel < 2).sort((a, b) => a.fortLevel - b.fortLevel);
    if (needsFort.length > 0) {
      actions.push({
        type: 'build_fort',
        targetProvinceId: needsFort[0].id,
        description: `Linnoita: ${needsFort[0].name}`,
        priority: 4 * weights.buildWeight,
      });
    }
  }

  // Build market on highest-tax provinces without market
  if (weights.buildWeight >= 1.5 && faction.treasury >= 30) {
    const richProvs = myProvinces
      .filter(p => p.baseTax >= 3 && p.fortLevel >= 0)
      .sort((a, b) => b.baseTax - a.baseTax);
    if (richProvs.length > 0) {
      actions.push({
        type: 'build_market',
        targetProvinceId: richProvs[0].id,
        description: `Markkina: ${richProvs[0].name}`,
        priority: 3 * weights.buildWeight,
      });
    }
  }

  // Build fort in capital if affordable
  if (capital && capital.fortLevel < 3 && faction.treasury >= 50) {
    actions.push({
      type: 'build_fort',
      targetProvinceId: capital.id,
      description: `Linnoita pääkaupunki: ${capital.name}`,
      priority: 6 * weights.defendWeight,
    });
  }

  // ============= 7. RECRUIT =============
  const shouldRecruit = (
    (myArmies.length < Math.ceil(myProvinces.length / 5)) || // Too few armies
    (highestThreat && highestThreat.totalStrength > myStrength * 0.8) || // Outmatched
    (faction.treasury >= 60 && faction.manpower >= 20) // Wealthy
  );

  if (shouldRecruit && faction.treasury >= 30 && faction.manpower >= 10) {
    // Recruit at threatened border or capital
    let recruitProv = capital;
    if (highestThreat && highestThreat.borderingProvinces.length > 0) {
      const borderProv = myProvinces.find(mp =>
        mp.neighbors.some(nId => highestThreat.borderingProvinces.includes(nId))
      );
      if (borderProv) recruitProv = borderProv;
    }
    if (!recruitProv) recruitProv = myProvinces[0];

    if (recruitProv) {
      actions.push({
        type: 'recruit',
        targetProvinceId: recruitProv.id,
        description: `Rekrytoi: ${recruitProv.name}`,
        priority: 5 * weights.recruitWeight,
      });
    }
  }

  // ============= FINALIZE =============
  if (actions.length === 0) {
    actions.push({ type: 'skip', description: 'Odottaa', priority: 0 });
  }

  // Sort by priority and return top actions
  actions.sort((a, b) => b.priority - a.priority);
  return actions.slice(0, 5); // Up to 5 actions per turn
}
