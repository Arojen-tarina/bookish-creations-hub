/**
 * useProvinceGameState.ts — Pelattavan MVP:n tilan hallinta
 *
 * Kokonainen vuoropohjainen pelilooppi:
 * Resurssit → Kortit → Liike → Taistelu → Rakentaminen → Vuoron lopetus
 * Sisältää: korttikäsi, AI-vuorot, rakennukset, voitto/häviöehdot.
 */
import { useState, useCallback } from 'react';
import {
  Province,
  FactionId,
  Faction,
  Army,
  DiplomaticRelation,
  ProvinceGameState,
  GameEvent,
  ActiveGameEvent,
  Treaty,
  TreatyType,
  FACTION_DATA_1206,
  PROVINCE_TERRAIN_INFO,
} from '@/types/province';
import { getProvincesWithAdjacency } from '@/data/ProvinceData.ts';
import { BattleResult } from '@/game/BattleDisplay.tsx';
import { PlayableCard, createPlayableDeck, drawCards, shuffleDeck } from '@/game/cards';
import { calculateAIActions } from '@/game/ai';
import { MVPPhase } from '@/game/PhaseBar.tsx';

const generateId = () => Math.random().toString(36).substr(2, 9);

export type RecruitType = 'infantry' | 'cavalry';

// ============= VICTORY TARGETS =============
export const VICTORY_TARGETS = {
  provinces: 30, // ~40% of map
  gold: 500,
  tech: 5,
};

const PHASE_ORDER: MVPPhase[] = ['resource', 'cards', 'move', 'battle', 'build', 'end'];

// ============= BUILDING TYPES =============
export type MVPBuildingType = 'camp' | 'market' | 'fortress' | 'workshop' | 'stable';

export const BUILDING_INFO: Record<MVPBuildingType, {
  name: string; emoji: string; cost: { gold: number; artisans?: number };
  effect: string;
}> = {
  camp: { name: 'Leiri', emoji: '⛺', cost: { gold: 15 }, effect: '+2 ruokaa/vuoro, spawn-piste' },
  market: { name: 'Markkina', emoji: '🏪', cost: { gold: 25, artisans: 1 }, effect: '+3 kultaa/vuoro' },
  fortress: { name: 'Linnoitus', emoji: '🏯', cost: { gold: 50, artisans: 2 }, effect: '+3 puolustus' },
  workshop: { name: 'Paja', emoji: '🔨', cost: { gold: 30, artisans: 1 }, effect: '+1 käsityöläinen/vuoro' },
  stable: { name: 'Hevostalli', emoji: '🐎', cost: { gold: 40, artisans: 1 }, effect: '+1 hevonen/vuoro' },
};

// ============= EXTENDED STATE =============
export interface ResourceCollectionResult {
  taxIncome: number;
  manpowerGain: number;
  marketBonus: number;
  silkRoadBonus: number;
  foodChange: number;
  artisansGain: number;
  horsesGain: number;
}

export interface ResourceIncome {
  goldPerTurn: number;
  foodPerTurn: number;
  horsesPerTurn: number;
  artisansPerTurn: number;
  manpowerPerTurn: number;
}

export interface AIActionLog {
  factionName: string;
  factionColor: string;
  description: string;
  targetProvinceId?: string;
}

interface ActiveCardEffect {
  cardId: string;
  type: PlayableCard['parsedEffect']['type'];
  value: number;
  remainingTurns: number; // -1 = permanent
  description: string;
}

export interface MVPGameState extends Omit<ProvinceGameState, 'phase'> {
  phase: MVPPhase;
  
  // Cards
  deck: PlayableCard[];
  hand: PlayableCard[];
  discard: PlayableCard[];
  playedTechCards: PlayableCard[]; // permanent techs
  activeEffects: ActiveCardEffect[];
  
  // Active bonuses from cards
  attackBonus: number;
  defenseBonus: number;
  movementBonus: number;
  
  // Buildings
  buildings: Record<string, MVPBuildingType[]>; // provinceId -> buildings
  
  // Resources (use faction treasury/manpower/horses + these)
  food: number;
  artisans: number;
  
  // AI log
  aiLog: string[];
  aiActionLog: AIActionLog[]; // structured AI action log for animation
  
  // Resource collection
  resourcesCollected: boolean;
  lastCollection: ResourceCollectionResult | null;
  currentIncome: ResourceIncome; // calculated per-turn income
  
  // Win condition
  winCondition: string | null;
}

// ============= INIT =============
const createFactions = (playerFactionId: FactionId): Faction[] => {
  return (Object.keys(FACTION_DATA_1206) as FactionId[]).map(id => ({
    ...FACTION_DATA_1206[id],
    isPlayer: id === playerFactionId,
  }));
};

const createDiplomaticRelations = (factions: Faction[]): DiplomaticRelation[] => {
  const relations: DiplomaticRelation[] = [];
  for (let i = 0; i < factions.length; i++) {
    for (let j = i + 1; j < factions.length; j++) {
      let relation = 0;
      let threat = 30;
      if (factions[i].id === 'mongol' || factions[j].id === 'mongol') { relation = -20; threat = 60; }
      relations.push({
        factionA: factions[i].id,
        factionB: factions[j].id,
        relation, trust: 50, threat, treaties: [], borderFriction: 0, claims: [],
      });
    }
  }
  return relations;
};

const createStartingArmies = (factions: Faction[], provinces: Province[]): Army[] => {
  const armies: Army[] = [];
  factions.forEach(faction => {
    const capital = provinces.find(p => p.id === faction.capitalId);
    if (!capital) return;
    armies.push({
      id: `army-${faction.id}-main`,
      ownerId: faction.id,
      provinceId: capital.id,
      cavalry: faction.id === 'mongol' ? 12 : 5,
      infantry: faction.id === 'song' ? 15 : 8,
      siege: 1,
      morale: 80,
      supply: 30,
      movementLeft: 3,
      leaderBonus: faction.id === 'mongol' ? 0.3 : 0.1,
    });
  });
  return armies;
};

const getBonusesFromEffects = (effects: ActiveCardEffect[]) => effects.reduce(
  (totals, effect) => {
    if (effect.type === 'attack_bonus') totals.attackBonus += effect.value;
    if (effect.type === 'defense_bonus') totals.defenseBonus += effect.value;
    if (effect.type === 'movement_bonus') totals.movementBonus += effect.value;
    return totals;
  },
  { attackBonus: 0, defenseBonus: 0, movementBonus: 0 },
);

const calculateProvinceCenterDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const equalizeStartingProvinceOwnership = (provinces: Province[], factions: Faction[]): Province[] => {
  const factionIds = factions.map(f => f.id);
  const targetCount = Math.floor(provinces.length / factionIds.length);
  const currentCounts = factionIds.reduce((acc, factionId) => ({ ...acc, [factionId]: 0 }), {} as Record<FactionId, number>);
  const updatedProvinces = provinces.map(province => ({ ...province }));
  const provinceById = new Map(updatedProvinces.map(p => [p.id, p]));

  updatedProvinces.forEach(province => {
    if (province.ownerId && currentCounts[province.ownerId] !== undefined) {
      currentCounts[province.ownerId] += 1;
    }
  });

  const getProvinceValue = (province: Province) => province.baseTax + province.baseManpower + province.developmentLevel;

  const releaseSurplusProvinces = (factionId: FactionId, surplus: number) => {
    const faction = factions.find(f => f.id === factionId);
    const capital = faction ? provinceById.get(faction.capitalId) : undefined;
    if (!capital) return;

    const owned = updatedProvinces
      .filter(p => p.ownerId === factionId && !p.isCapital)
      .sort((a, b) => {
        const aDist = calculateProvinceCenterDistance(a.center, capital.center);
        const bDist = calculateProvinceCenterDistance(b.center, capital.center);
        const aValue = getProvinceValue(a);
        const bValue = getProvinceValue(b);
        return aDist === bDist ? aValue - bValue : bDist - aDist;
      });

    for (let i = 0; i < surplus && i < owned.length; i += 1) {
      owned[i].ownerId = null;
      currentCounts[factionId] -= 1;
    }
  };

  factionIds.forEach(factionId => {
    const surplus = currentCounts[factionId] - targetCount;
    if (surplus > 0) releaseSurplusProvinces(factionId, surplus);
  });

  const getNeutralNeighbors = (factionId: FactionId) => {
    const ownedIds = new Set(updatedProvinces.filter(p => p.ownerId === factionId).map(p => p.id));
    const neighbors: Province[] = [];

    updatedProvinces.forEach(province => {
      if (province.ownerId !== null) return;
      if (province.neighbors.some(neighborId => ownedIds.has(neighborId))) {
        neighbors.push(province);
      }
    });

    return neighbors.sort((a, b) => {
      const faction = factions.find(f => f.id === factionId);
      const capital = faction ? provinceById.get(faction.capitalId) : undefined;
      if (!capital) return 0;
      const aDist = calculateProvinceCenterDistance(a.center, capital.center);
      const bDist = calculateProvinceCenterDistance(b.center, capital.center);
      return aDist - bDist;
    });
  };

  const neutralPool = new Set(updatedProvinces.filter(p => p.ownerId === null).map(p => p.id));
  let changed = true;

  while (changed) {
    changed = false;

    for (const factionId of factionIds) {
      const need = targetCount - currentCounts[factionId];
      if (need <= 0) continue;

      const adjacentNeutrals = getNeutralNeighbors(factionId).filter(p => neutralPool.has(p.id));
      if (adjacentNeutrals.length === 0) continue;

      const chosen = adjacentNeutrals[0];
      chosen.ownerId = factionId;
      neutralPool.delete(chosen.id);
      currentCounts[factionId] += 1;
      changed = true;
    }
  }

  const remainingNeutrals = Array.from(neutralPool).map(id => provinceById.get(id)).filter(Boolean) as Province[];
  remainingNeutrals.forEach(province => {
    const closestFaction = factions
      .map(faction => ({
        factionId: faction.id,
        distance: calculateProvinceCenterDistance(province.center, provinceById.get(faction.capitalId)?.center ?? { x: 0, y: 0 }),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (!closestFaction) return;
    const factionId = closestFaction.factionId;
    if (currentCounts[factionId] < targetCount) {
      province.ownerId = factionId;
      currentCounts[factionId] += 1;
      neutralPool.delete(province.id);
    }
  });

  return updatedProvinces;
};

const calculateSilkRoadBonus = (ownedProvinces: Province[]): number => {
  const silkRoadProvinces = ownedProvinces.filter(p => p.hasSilkRoad);
  if (silkRoadProvinces.length === 0) return 0;

  const baseSilkIncome = silkRoadProvinces.reduce((sum, province) => sum + province.baseTax, 0);
  const silkTradeBonus = silkRoadProvinces.filter(p => p.tradeGood === 'silk').length * 2;

  const provinceMap = new Map(silkRoadProvinces.map((province) => [province.id, province]));
  const visited = new Set<string>();
  let chainBonus = 0;

  silkRoadProvinces.forEach((province) => {
    if (visited.has(province.id)) return;
    const queue = [province.id];
    visited.add(province.id);
    let clusterSize = 0;

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      clusterSize += 1;
      const currentProvince = provinceMap.get(currentId);
      if (!currentProvince) continue;

      currentProvince.neighbors.forEach((neighborId) => {
        if (visited.has(neighborId) || !provinceMap.has(neighborId)) return;
        visited.add(neighborId);
        queue.push(neighborId);
      });
    }

    if (clusterSize > 1) {
      chainBonus += (clusterSize - 1) * 2;
    }
  });

  return baseSilkIncome + silkTradeBonus + chainBonus;
};

const calculateResourceCollection = (state: MVPGameState, factionId: FactionId): ResourceCollectionResult => {
  const ownedProvinces = state.provinces.filter(p => p.ownerId === factionId);
  const baseTaxIncome = ownedProvinces.reduce((sum, p) => sum + p.baseTax, 0);
  const manpowerGain = Math.floor(ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0) * 0.3);
  const silkRoadBonus = calculateSilkRoadBonus(ownedProvinces);

  const marketCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
    const p = state.provinces.find(pr => pr.id === pid);
    return p?.ownerId === factionId && buildings.includes('market');
  }).length;
  const marketBonus = marketCount * 3;
  const taxIncome = baseTaxIncome + silkRoadBonus + marketBonus;

  const playerArmyCount = state.armies.filter(a => a.ownerId === factionId).length;
  const foodUpkeep = -playerArmyCount;
  const farmland = state.provinces.filter(p => p.ownerId === factionId && (p.terrain === 'farmland' || p.terrain === 'grassland')).length;
  const campCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
    const p = state.provinces.find(pr => pr.id === pid);
    return p?.ownerId === factionId && buildings.includes('camp');
  }).length;
  const foodChange = foodUpkeep + Math.floor(farmland * 0.5) + campCount * 2;

  const horseProvinces = ownedProvinces.filter(p => p.terrain === 'steppe' || p.tradeGood === 'horses');
  const stableCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
    const p = state.provinces.find(pr => pr.id === pid);
    return p?.ownerId === factionId && buildings.includes('stable');
  }).length;
  const horsesGain = horseProvinces.length + stableCount;

  const artisanProvinces = ownedProvinces.filter(p => p.terrain === 'farmland' || p.terrain === 'hills');
  const workshopCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
    const p = state.provinces.find(pr => pr.id === pid);
    return p?.ownerId === factionId && buildings.includes('workshop');
  }).length;
  let artisansGain = Math.floor(artisanProvinces.length * 0.5) + workshopCount;
  if (ownedProvinces.length >= 3) {
    artisansGain = Math.max(1, artisansGain);
  }

  return { taxIncome, manpowerGain, marketBonus, silkRoadBonus, foodChange, artisansGain, horsesGain };
};

// ============= COMBAT =============
const createProvinceGarrison = (province: Province): Army | null => {
  if (!province.ownerId) return null;

  const infantry = Math.max(
    province.garrison,
    province.fortLevel > 0 ? province.fortLevel * 3 + Math.max(1, Math.floor(province.developmentLevel / 2)) : 0,
  );

  if (infantry <= 0) return null;

  return {
    id: `garrison-${province.id}`,
    ownerId: province.ownerId,
    provinceId: province.id,
    cavalry: 0,
    infantry,
    siege: 0,
    morale: Math.min(95, 55 + province.fortLevel * 10 + province.developmentLevel * 2),
    supply: 20,
    movementLeft: 0,
    leaderBonus: 0,
  };
};

const isWarTreaty = (t: Treaty) => t.type === 'war_surprise' || t.type === 'war_formal';
const isWarActive = (t: Treaty, currentTurn: number) =>
  t.type === 'war_surprise' || (t.type === 'war_formal' && t.startTurn <= currentTurn);
const isPeacefulTreaty = (t: Treaty) =>
  ['non_aggression', 'peace', 'truce', 'alliance'].includes(t.type);

const getArmyTerrainMoveCost = (terrainInfo: typeof PROVINCE_TERRAIN_INFO[ProvinceTerrain], army: Army) => {
  if (army.siege > 0) return terrainInfo.movementCostSiege;
  if (army.cavalry >= army.infantry) return terrainInfo.movementCostCavalry;
  return terrainInfo.movementCostInfantry;
};

const activatePendingWars = (state: MVPGameState): MVPGameState => {
  const updatedRelations = state.relations.map(rel => {
    if (!rel.treaties.some(t => t.type === 'war_formal' && t.startTurn <= state.turn)) {
      return rel;
    }
    return {
      ...rel,
      relation: -90,
      trust: 0,
      threat: Math.min(100, rel.threat + 30),
    };
  });
  return { ...state, relations: updatedRelations };
};

const resolveCombat = (
  attacker: Army,
  defender: Army,
  terrain: Province,
  attackBonus: number = 0,
  defenseBonus: number = 0,
): {
  attackerWins: boolean;
  defenderDestroyed: boolean;
  attackerCavalryLoss: number;
  attackerInfantryLoss: number;
  defenderCavalryLoss: number;
  defenderInfantryLoss: number;
  attackRoll: number;
  defenseRoll: number;
} => {
  const terrainInfo = PROVINCE_TERRAIN_INFO[terrain.terrain];

  const calculateLossesFromDamage = (army: Army, damage: number) => {
    let remaining = damage;
    const infantryLoss = Math.min(army.infantry, remaining);
    remaining -= infantryLoss;
    const cavalryLoss = Math.min(army.cavalry, Math.floor(remaining / 2));
    return { cavalryLoss, infantryLoss };
  };

  const attackerPower = attacker.cavalry * 2 + attacker.infantry + attackBonus;
  const defenderPower = defender.cavalry * 2 + defender.infantry;

  const attackRoll = Math.floor(Math.random() * 6) + 1;
  const defenseRoll = Math.floor(Math.random() * 6) + 1;

  const attackerScore = attackerPower + attackRoll;
  const defenderScore = defenderPower + defenseRoll + terrainInfo.defenseBonus * 2 + terrain.fortLevel * 3;
  const attackerWins = attackerScore > defenderScore;

  const defenderDamage = attackerWins ? Math.max(0, attackerPower - defenseBonus) : 0;
  const attackerDamage = !attackerWins ? defenderPower : 0;

  const defenderLosses = calculateLossesFromDamage(defender, defenderDamage);
  const attackerLosses = calculateLossesFromDamage(attacker, attackerDamage);

  return {
    attackerWins,
    defenderDestroyed: attackerWins && defenderLosses.cavalryLoss >= defender.cavalry && defenderLosses.infantryLoss >= defender.infantry,
    attackerCavalryLoss: attackerLosses.cavalryLoss,
    attackerInfantryLoss: attackerLosses.infantryLoss,
    defenderCavalryLoss: defenderLosses.cavalryLoss,
    defenderInfantryLoss: defenderLosses.infantryLoss,
    attackRoll,
    defenseRoll,
  };
};

// ============= HOOK =============
export interface UseProvinceGameStateReturn {
  gameStarted: boolean;
  playerFaction: FactionId | null;
  gameState: MVPGameState | null;
  pendingBattle: BattleResult | null;
  clearBattle: () => void;
  startGame: (selectedFaction: FactionId) => void;
  selectProvince: (provinceId: string) => void;
  selectArmy: (armyId: string) => void;
  moveArmy: (armyId: string, targetProvinceId: string) => void;
  nextPhase: () => void;
  endTurn: () => void;
  resetGame: () => void;
  playCard: (card: PlayableCard) => void;
  buildStructure: (provinceId: string, type: MVPBuildingType) => void;
  recruitArmy: (provinceId: string, type?: RecruitType) => void;
  proposeTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  breakTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  buildFort: (provinceId: string) => void;
  resolveEvent: (choiceIndex?: number) => void;
  declareWar: (targetFaction: FactionId, surprise?: boolean) => void;
  repairFort: (provinceId: string, useArtisan: boolean) => void;
  getRelation: (factionA: FactionId, factionB: FactionId) => DiplomaticRelation | null;
  getPlayerFaction: () => Faction | null;
  getArmiesInProvince: (provinceId: string) => Army[];
  canMoveTo: (armyId: string, targetProvinceId: string) => boolean;
  endPhase: () => void;
  collectResources: () => void;
}

export const useProvinceGameState = (): UseProvinceGameStateReturn => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerFaction, setPlayerFaction] = useState<FactionId | null>(null);
  const [gameState, setGameState] = useState<MVPGameState | null>(null);
  const [pendingBattle, setPendingBattle] = useState<BattleResult | null>(null);

  // ============= START GAME =============
  const startGame = useCallback((selectedFaction: FactionId) => {
    const initialFactions = createFactions(selectedFaction);
    const rawProvinces = getProvincesWithAdjacency();
    const provinces = equalizeStartingProvinceOwnership(rawProvinces, initialFactions);

    // Filter factions to those that actually have presence on the map (or are the selected player)
    const visibleFactions = initialFactions.filter(f =>
      f.id === selectedFaction || provinces.some(p => p.ownerId === f.id)
    );

    const relations = createDiplomaticRelations(visibleFactions);
    const armies = createStartingArmies(visibleFactions, provinces);
    const deck = createPlayableDeck();
    const { drawn, remaining } = drawCards(deck, 5); // Starting hand
    
    const initialState: MVPGameState = {
      turn: 1,
      year: 1206,
      currentPlayerId: selectedFaction,
      phase: 'resource',
      provinces,
      factions: visibleFactions,
      relations,
      armies,
      activeEvents: [],
      eventDeck: [],
      selectedProvinceId: null,
      selectedArmyId: null,
      gameOver: false,
      winnerId: null,
      gameSpeed: 'normal',
      difficulty: 'normal',
      
      // Cards
      deck: remaining,
      hand: drawn,
      discard: [],
      playedTechCards: [],
      activeEffects: [],
      attackBonus: 0,
      defenseBonus: 0,
      movementBonus: 0,
      
      // Buildings
      buildings: {},
      
      // Resources
      food: 10,
      artisans: 3,
      
      // AI
      aiLog: [],
      aiActionLog: [],
      resourcesCollected: false,
      lastCollection: null,
      winCondition: null,
    };
    
    setPlayerFaction(selectedFaction);
    setGameState(initialState);
    setGameStarted(true);
  }, []);

  // ============= PROVINCE SELECTION =============
  const selectProvince = useCallback((provinceId: string) => {
    setGameState(prev => prev ? { ...prev, selectedProvinceId: provinceId, selectedArmyId: null } : null);
  }, []);

  // ============= ARMY SELECTION =============
  const selectArmy = useCallback((armyId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const army = prev.armies.find(a => a.id === armyId);
      // Don't allow selecting AI armies
      if (army && army.ownerId !== playerFaction) return prev;
      return { ...prev, selectedArmyId: armyId, selectedProvinceId: army?.provinceId || prev.selectedProvinceId };
    });
  }, [playerFaction]);

  // ============= CAN MOVE =============
  const canMoveTo = useCallback((armyId: string, targetProvinceId: string): boolean => {
    if (!gameState) return false;
    const army = gameState.armies.find(a => a.id === armyId);
    if (!army || army.movementLeft <= 0) return false;
    const currentProvince = gameState.provinces.find(p => p.id === army.provinceId);
    const targetProvince = gameState.provinces.find(p => p.id === targetProvinceId);
    if (!currentProvince || !targetProvince) return false;
    if (!currentProvince.neighbors.includes(targetProvinceId)) return false;
    if (targetProvince.ownerId && targetProvince.ownerId !== army.ownerId) {
      const relation = gameState.relations.find(r =>
        (r.factionA === army.ownerId && r.factionB === targetProvince.ownerId) ||
        (r.factionB === army.ownerId && r.factionA === targetProvince.ownerId)
      );
      if (relation) {
        const warActive = relation.treaties.some(t => isWarActive(t, gameState.turn));
        const peaceTreaty = relation.treaties.some(isPeacefulTreaty);
        if (peaceTreaty && !warActive) return false;
      }
    }
    const terrainInfo = PROVINCE_TERRAIN_INFO[targetProvince.terrain];
    const moveCost = Math.max(1, getArmyTerrainMoveCost(terrainInfo, army) - (gameState.movementBonus > 0 ? 1 : 0));
    if (army.movementLeft < moveCost) return false;
    return true;
  }, [gameState]);

  // ============= MOVE ARMY =============
  const moveArmy = useCallback((armyId: string, targetProvinceId: string) => {
    if (!canMoveTo(armyId, targetProvinceId)) return;
    
    setGameState(prev => {
      try {
        if (!prev) return null;
        const armyIndex = prev.armies.findIndex(a => a.id === armyId);
      if (armyIndex === -1) return prev;
      const army = prev.armies[armyIndex];
      const targetProvince = prev.provinces.find(p => p.id === targetProvinceId);
      if (!targetProvince) return prev;
      
      const terrainInfo = PROVINCE_TERRAIN_INFO[targetProvince.terrain];
      const moveCost = Math.max(1, getArmyTerrainMoveCost(terrainInfo, army) - (prev.movementBonus > 0 ? 1 : 0));
      
      // Check for combat (enemy army OR fortified/garrisoned enemy province)
      const enemyArmies = prev.armies.filter(a => a.provinceId === targetProvinceId && a.ownerId !== army.ownerId);
      const provinceGarrison = targetProvince.ownerId && targetProvince.ownerId !== army.ownerId
        ? createProvinceGarrison(targetProvince)
        : null;

      // Combine defending army with the province garrison so that fortifications
      // actually contribute their soldiers to the defending force.
      let defender: Army | null = enemyArmies[0] || provinceGarrison;
      if (enemyArmies[0] && provinceGarrison) {
        defender = {
          ...enemyArmies[0],
          infantry: enemyArmies[0].infantry + provinceGarrison.infantry,
          morale: Math.max(enemyArmies[0].morale, provinceGarrison.morale),
        };
      }
      let newArmies = [...prev.armies];
      const newProvinces = [...prev.provinces];
      
      if (defender) {
        const result = resolveCombat(army, defender, targetProvince, prev.attackBonus, prev.defenseBonus);
        
        const battleResult: BattleResult = {
          attacker: { ...army },
          defender: { ...defender },
          attackerFaction: army.ownerId,
          defenderFaction: defender.ownerId,
          provinceName: targetProvince.name,
          winner: result.attackerWins ? 'attacker' : 'defender',
          attackerLosses: { cavalry: result.attackerCavalryLoss, infantry: result.attackerInfantryLoss },
          defenderLosses: { cavalry: result.defenderCavalryLoss, infantry: result.defenderInfantryLoss },
          attackerMoraleLoss: result.attackerWins ? 10 : 20,
          defenderMoraleLoss: result.attackerWins ? 20 : 10,
          attackRoll: result.attackRoll,
          defenseRoll: result.defenseRoll,
        };
        setTimeout(() => setPendingBattle(battleResult), 50);
        if (result.attackerWins) {
        
        // If the province has fortifications, damage them first.
        const pIdx = newProvinces.findIndex(p => p.id === targetProvinceId);
        const targetFortLevel = pIdx !== -1 ? newProvinces[pIdx].fortLevel : 0;
        if (targetFortLevel > 0) {
          // Successful attacker reduces fort level instead of immediately capturing
          const newFortLevel = Math.max(0, targetFortLevel - 1);
          if (pIdx !== -1) {
            newProvinces[pIdx] = { ...newProvinces[pIdx], fortLevel: newFortLevel };
          }
          // Attacker still loses some units from the assault
          newArmies[armyIndex] = {
            ...army, movementLeft: 0,
            cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
            infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
            morale: Math.max(20, army.morale - 10),
          };
          // If defending field army exists, reduce its units
          if (enemyArmies[0]) {
            const defIdx = newArmies.findIndex(a => a.id === enemyArmies[0].id);
            if (defIdx !== -1) {
              newArmies[defIdx] = {
                ...enemyArmies[0],
                cavalry: Math.max(0, enemyArmies[0].cavalry - result.defenderCavalryLoss),
                infantry: Math.max(0, enemyArmies[0].infantry - result.defenderInfantryLoss),
                morale: Math.max(20, enemyArmies[0].morale - 20),
              };
            }
          }
          // Province not captured until fortLevel == 0
        } else {
          // No fortifications: normal capture behaviour
          newArmies[armyIndex] = {
            ...army, provinceId: targetProvinceId, movementLeft: 0,
            cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
            infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
            morale: Math.max(20, army.morale - 10),
          };

          if (enemyArmies[0]) {
            if (result.defenderDestroyed) {
              newArmies = newArmies.filter(a => a.id !== enemyArmies[0].id);
            } else {
              const defIdx = newArmies.findIndex(a => a.id === enemyArmies[0].id);
              newArmies[defIdx] = {
                ...enemyArmies[0],
                cavalry: Math.max(0, enemyArmies[0].cavalry - result.defenderCavalryLoss),
                infantry: Math.max(0, enemyArmies[0].infantry - result.defenderInfantryLoss),
                morale: Math.max(20, enemyArmies[0].morale - 20),
              };
            }
          }

          if (pIdx !== -1) {
            newProvinces[pIdx] = {
              ...newProvinces[pIdx],
              ownerId: army.ownerId,
              unrest: 30,
              garrison: provinceGarrison ? Math.max(0, defender.infantry - result.defenderInfantryLoss) : newProvinces[pIdx].garrison,
            };
          }
        }
        }
        else {
          newArmies[armyIndex] = {
            ...army, movementLeft: 0,
            cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
            infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
            morale: Math.max(20, army.morale - 20),
          };
        }
      } else {
        // Peaceful movement
        newArmies[armyIndex] = { ...army, provinceId: targetProvinceId, movementLeft: army.movementLeft - moveCost };
        if (targetProvince.ownerId === null || (targetProvince.ownerId !== army.ownerId && !prev.armies.some(a => a.provinceId === targetProvinceId && a.ownerId === targetProvince.ownerId))) {
          const pIdx = newProvinces.findIndex(p => p.id === targetProvinceId);
          if (pIdx !== -1) newProvinces[pIdx] = { ...newProvinces[pIdx], ownerId: army.ownerId };
        }
      }
      
      newArmies = newArmies.filter(a => a.cavalry + a.infantry > 0);
      
        return { ...prev, armies: newArmies, provinces: newProvinces, selectedArmyId: null, attackBonus: 0 };
      } catch (err) {
        // Defensive: log and skip state mutation to avoid runtime crash
        // eslint-disable-next-line no-console
        console.error('moveArmy error:', err);
        return prev;
      }
    });
  }, [canMoveTo]);

  // ============= WAR DECLARATIONS =============
  // (declareWar moved below after `proposeTreaty` definition to avoid TDZ)

  // ============= REPAIR FORT =============
  const repairFort = useCallback((provinceId: string, useArtisan: boolean) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || province.ownerId !== playerFaction) return prev;
      if (province.fortLevel <= 0) return prev;

      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction) return prev;

      const goldCost = 10;
      const artisanCost = 1;
      if (faction.treasury < goldCost) return prev;
      if (useArtisan && prev.artisans < artisanCost) return prev;

      const newFactions = prev.factions.map(f => f.id === playerFaction ? { ...f, treasury: f.treasury - goldCost } : f);
      const newArtisans = useArtisan ? prev.artisans - artisanCost : prev.artisans;
      const newProvinces = prev.provinces.map(p => p.id === provinceId ? { ...p, fortLevel: Math.min(3, p.fortLevel + 1) } : p);

      return { ...prev, factions: newFactions, artisans: newArtisans, provinces: newProvinces };
    });
  }, [playerFaction]);

  // ============= PLAY CARD =============
  const playCard = useCallback((card: PlayableCard) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const newHand = prev.hand.filter(c => c.id !== card.id);
      const newDiscard = [...prev.discard, card];
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction) return prev;
      
      const newState = { ...prev, hand: newHand, discard: newDiscard };
      const effect = card.parsedEffect;
      const duration = ((effect.type === 'attack_bonus' || effect.type === 'defense_bonus') && effect.duration === 0)
        ? 1
        : effect.duration;

      switch (effect.type) {
        case 'gold':
          newState.factions = prev.factions.map(f => f.id === playerFaction ? { ...f, treasury: f.treasury + effect.value } : f);
          break;
        case 'food':
          newState.food = prev.food + effect.value;
          break;
        case 'horses':
          newState.factions = prev.factions.map(f => f.id === playerFaction ? { ...f, horses: f.horses + effect.value } : f);
          break;
        case 'artisans':
          newState.artisans = prev.artisans + effect.value;
          break;
        case 'attack_bonus':
        case 'defense_bonus':
        case 'movement_bonus': {
          const activeEffect: ActiveCardEffect = {
            cardId: card.id,
            type: effect.type,
            value: effect.value,
            remainingTurns: duration === 0 ? 1 : duration,
            description: effect.description,
          };
          newState.activeEffects = [...prev.activeEffects, activeEffect];
          const totals = getBonusesFromEffects(newState.activeEffects);
          newState.attackBonus = totals.attackBonus;
          newState.defenseBonus = totals.defenseBonus;
          newState.movementBonus = totals.movementBonus;

          if (effect.type === 'movement_bonus') {
            newState.armies = prev.armies.map(a => a.ownerId === playerFaction ? { ...a, movementLeft: a.movementLeft + effect.value } : a);
          }
          break;
        }
        case 'permanent_attack':
        case 'permanent_defense':
          newState.playedTechCards = [...prev.playedTechCards, card];
          break;
        case 'terrain_ignore':
          newState.movementBonus = prev.movementBonus + 1;
          break;
      }
      
      return newState;
    });
  }, [playerFaction]);

  // ============= BUILD STRUCTURE =============
  const buildStructure = useCallback((provinceId: string, type: MVPBuildingType) => {
    setGameState(prev => {
      if (!prev || !playerFaction || prev.phase !== 'build') return prev;
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || province.ownerId !== playerFaction) return prev;
      
      const info = BUILDING_INFO[type];
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction || faction.treasury < info.cost.gold) return prev;
      if (info.cost.artisans && prev.artisans < info.cost.artisans) return prev;
      
      const existing = prev.buildings[provinceId] || [];
      // Fortress can be built multiple times (upgrades fortLevel up to 3)
      if (type === 'fortress') {
        const currentFortLevel = province.fortLevel;
        if (currentFortLevel >= 3) return prev; // Max level reached
      } else {
        if (existing.includes(type)) return prev; // Other buildings only once
      }
      
      const newFactions = prev.factions.map(f => f.id === playerFaction ? { ...f, treasury: f.treasury - info.cost.gold } : f);
      const newArtisans = prev.artisans - (info.cost.artisans || 0);
      const newBuildings = { ...prev.buildings, [provinceId]: [...existing, type] };
      
      let newProvinces = prev.provinces;
      if (type === 'fortress') {
        newProvinces = prev.provinces.map(p => p.id === provinceId
          ? {
              ...p,
              fortLevel: Math.min(3, p.fortLevel + 1),
              garrison: Math.max(p.garrison, 2 + Math.min(4, p.fortLevel + 1)),
            }
          : p,
        );
      }
      
      return { ...prev, factions: newFactions, artisans: newArtisans, buildings: newBuildings, provinces: newProvinces };
    });
  }, [playerFaction]);

  // ============= RECRUIT ARMY =============
  const recruitArmy = useCallback((provinceId: string, type: RecruitType = 'infantry') => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || province.ownerId !== playerFaction) return prev;
      
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction) return prev;
      // Recruitment costs per new rules
      // Infantry: 10 gold, 5 food
      // Cavalry: 20 gold, 5 horses, 10 food
      if (type === 'infantry') {
        if (faction.treasury < 10 || prev.food < 5) return prev;
      } else if (type === 'cavalry') {
        if (faction.treasury < 20 || faction.horses < 5 || prev.food < 10) return prev;
      }
      
      // Check if province has a camp or is capital
      const hasCamp = (prev.buildings[provinceId] || []).includes('camp');
      const isCapital = province.id === faction.capitalId;
      if (!hasCamp && !isCapital) return prev;
      
      const stableCount = (prev.buildings[provinceId] || []).includes('stable') ? 1 : 0;
      const cavalryCount = type === 'cavalry' ? Math.min(4 + stableCount, Math.floor(faction.horses / 2)) : Math.min(2, Math.floor(faction.horses / 2));
      const infantryCount = type === 'cavalry' ? Math.max(2, 6 - cavalryCount) : 5;
      
      const newArmy: Army = {
        id: generateId(),
        ownerId: playerFaction,
        provinceId,
        cavalry: cavalryCount,
        infantry: infantryCount,
        siege: 0,
        morale: 70,
        supply: 20,
        movementLeft: 0,
        leaderBonus: 0,
      };
      
      // Deduct recruitment costs according to type
      let newFactions = prev.factions;
      let newFood = prev.food;
      if (type === 'infantry') {
        newFactions = prev.factions.map(f => f.id === playerFaction ? { ...f, treasury: f.treasury - 10, manpower: Math.max(0, f.manpower - 0) } : f);
        newFood = Math.max(0, prev.food - 5);
      } else {
        const horsesUsed = 5; // fixed per new rule
        newFactions = prev.factions.map(f => f.id === playerFaction ? { ...f, treasury: f.treasury - 20, manpower: Math.max(0, f.manpower - 0), horses: Math.max(0, f.horses - horsesUsed) } : f);
        newFood = Math.max(0, prev.food - 10);
      }
      
  // ============= RESOURCE INCOME CALCULATION =============
  const calculateResourceIncome = useCallback((state: MVPGameState): ResourceIncome => {
    if (!playerFaction) return { goldPerTurn: 0, foodPerTurn: 0, horsesPerTurn: 0, artisansPerTurn: 0, manpowerPerTurn: 0 };
    
    const ownedProvinces = state.provinces.filter(p => p.ownerId === playerFaction);
    let taxIncome = ownedProvinces.reduce((sum, p) => sum + p.baseTax, 0);
    const manpowerGain = Math.floor(ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0) * 0.3);
    
    // Silk Road bonus: +2 gold per Silk Road province
    const silkRoadCount = ownedProvinces.filter(p => p.hasSilkRoad).length;
    const silkRoadBonus = silkRoadCount * 2;
    taxIncome += silkRoadBonus;
    
    const marketCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
      const p = state.provinces.find(pr => pr.id === pid);
      return p?.ownerId === playerFaction && buildings.includes('market');
    }).length;
    const marketBonus = marketCount * 3;
    taxIncome += marketBonus;
    
    const playerArmyCount = state.armies.filter(a => a.ownerId === playerFaction).length;
    const foodUpkeep = -playerArmyCount;
    const farmland = state.provinces.filter(p => p.ownerId === playerFaction && (p.terrain === 'farmland' || p.terrain === 'grassland')).length;
    const campCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
      const p = state.provinces.find(pr => pr.id === pid);
      return p?.ownerId === playerFaction && buildings.includes('camp');
    }).length;
    const foodGain = Math.floor(farmland * 0.5) + campCount * 2;
    const foodChange = foodUpkeep + foodGain;
    
    // Horses: steppe/grassland provinces produce horses, horse trade goods give extra
    const horseProvinces = ownedProvinces.filter(p => p.terrain === 'steppe' || p.tradeGood === 'horses');
    const horsesGain = horseProvinces.length;
    
    // Artisans: farmland/hills provinces and workshops produce artisans
    const artisanProvinces = ownedProvinces.filter(p => p.terrain === 'farmland' || p.terrain === 'hills');
    const workshopCount = Object.entries(state.buildings).filter(([pid, buildings]) => {
      const p = state.provinces.find(pr => pr.id === pid);
      return p?.ownerId === playerFaction && buildings.includes('workshop');
    }).length;
    const artisansGain = Math.floor(artisanProvinces.length * 0.5) + workshopCount;
    const finalArtisansGain = ownedProvinces.length >= 3 ? Math.max(1, artisansGain) : artisansGain;
    
    return {
      goldPerTurn: taxIncome,
      foodPerTurn: foodChange,
      horsesPerTurn: horsesGain,
      artisansPerTurn: finalArtisansGain,
      manpowerPerTurn: manpowerGain,
    };
  }, [playerFaction]);

  // ============= COLLECT RESOURCES =============
  const collectResources = useCallback(() => {
    setGameState(prev => {
      if (!prev || !playerFaction || prev.resourcesCollected) return prev;
      
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction) return prev;

      const collection = calculateResourceCollection(prev, playerFaction);
      const newFactions = prev.factions.map(f =>
        f.id === playerFaction ? { ...f, treasury: f.treasury + collection.taxIncome, manpower: f.manpower + collection.manpowerGain, horses: f.horses + collection.horsesGain } : f
      );
      
      return {
        ...prev,
        factions: newFactions,
        food: Math.max(0, prev.food + collection.foodChange),
        artisans: prev.artisans + collection.artisansGain,
        resourcesCollected: true,
        lastCollection: collection,
      };
    });
  }, [playerFaction]);

  const nextPhase = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      
      // Auto-collect resources if skipping resource phase
      let state = { ...prev };
      if (state.phase === 'resource' && !state.resourcesCollected && playerFaction) {
        const faction = state.factions.find(f => f.id === playerFaction);
        if (faction) {
          const collection = calculateResourceCollection(state, playerFaction);
          state = {
            ...state,
            factions: state.factions.map(f =>
              f.id === playerFaction ? { ...f, treasury: f.treasury + collection.taxIncome, manpower: f.manpower + collection.manpowerGain, horses: f.horses + collection.horsesGain } : f
            ),
            food: Math.max(0, state.food + collection.foodChange),
            artisans: state.artisans + collection.artisansGain,
            resourcesCollected: true,
            lastCollection: collection,
          };
        }
      }

      const currentIndex = PHASE_ORDER.indexOf(state.phase);
      if (currentIndex < PHASE_ORDER.length - 1) {
        const next = PHASE_ORDER[currentIndex + 1];
        
        // Auto-actions per phase
        if (next === 'cards') {
          if (state.deck.length > 0) {
            const { drawn, remaining } = drawCards(state.deck, 1);
            return { ...state, phase: next, hand: [...state.hand, ...drawn], deck: remaining };
          } else if (state.discard.length > 0) {
            const newDeck = shuffleDeck(state.discard);
            const { drawn, remaining } = drawCards(newDeck, 1);
            return { ...state, phase: next, hand: [...state.hand, ...drawn], deck: remaining, discard: [] };
          }
        }
        
        return { ...state, phase: next };
      }
      return state;
    });
  }, [playerFaction]);

  // ============= END TURN =============
  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev || !playerFaction) return null;
      
      const expiringEffects = prev.activeEffects
        .map(effect => effect.remainingTurns === -1 ? effect : { ...effect, remainingTurns: effect.remainingTurns - 1 })
        .filter(effect => effect.remainingTurns === -1 || effect.remainingTurns > 0);
      const bonusTotals = getBonusesFromEffects(expiringEffects);
      const newState = { ...prev, activeEffects: expiringEffects, attackBonus: bonusTotals.attackBonus, defenseBonus: bonusTotals.defenseBonus, movementBonus: bonusTotals.movementBonus };
      const aiLog: string[] = [];
      const aiActionLog: AIActionLog[] = [];
      
      // 1. Collect resources for AI factions only (player collects in resource phase)
      let newFactions = newState.factions.map(faction => {
        if (faction.id === playerFaction) return faction; // Player already collected
        const collection = calculateResourceCollection(newState, faction.id);
        return { ...faction, treasury: faction.treasury + collection.taxIncome, manpower: faction.manpower + collection.manpowerGain };
      });
      
      // 2. Food: skip player (already handled in collectResources), just track for state
      const newFood = newState.food;
      
      // 3. AI turns
      let newArmies = [...newState.armies];
      const newProvinces = [...newState.provinces];
      
      for (const faction of newFactions) {
        if (faction.id === playerFaction) continue;
        
        const aiActions = calculateAIActions(faction, newArmies, newProvinces, newArmies, newState.relations);
        
        for (const action of aiActions) {
          if (action.type === 'merge' && action.armyId && action.mergeIntoId) {
            const sourceIdx = newArmies.findIndex(a => a.id === action.armyId);
            const targetIdx = newArmies.findIndex(a => a.id === action.mergeIntoId);
            if (sourceIdx !== -1 && targetIdx !== -1) {
              const source = newArmies[sourceIdx];
              const target = newArmies[targetIdx];
              newArmies[targetIdx] = {
                ...target,
                cavalry: target.cavalry + source.cavalry,
                infantry: target.infantry + source.infantry,
                siege: target.siege + source.siege,
                morale: Math.round((target.morale + source.morale) / 2),
              };
              newArmies = newArmies.filter(a => a.id !== action.armyId);
              aiLog.push(`${faction.name}: Yhdisti armeijat`);
            }
          } else if (action.type === 'move' && action.armyId && action.targetProvinceId) {
            const armyIdx = newArmies.findIndex(a => a.id === action.armyId);
            if (armyIdx !== -1) {
              const army = newArmies[armyIdx];
              const target = newProvinces.find(p => p.id === action.targetProvinceId);
              if (target) {
                newArmies[armyIdx] = { ...army, provinceId: action.targetProvinceId!, movementLeft: 0 };
                if (target.ownerId === null) {
                  const pIdx = newProvinces.findIndex(p => p.id === action.targetProvinceId);
                  newProvinces[pIdx] = { ...newProvinces[pIdx], ownerId: faction.id };
                }
                aiLog.push(`${faction.name}: ${action.description}`);
              }
            }
          } else if (action.type === 'attack' && action.armyId && action.targetProvinceId) {
            const armyIdx = newArmies.findIndex(a => a.id === action.armyId);
            if (armyIdx === -1) continue;
            const army = newArmies[armyIdx];
            const target = newProvinces.find(p => p.id === action.targetProvinceId);
            if (!target) continue;
            
            const defenders = newArmies.filter(a => a.provinceId === action.targetProvinceId && a.ownerId !== faction.id);
            // Combine field defenders with garrison so that fortifications add their soldiers
            const garrison = target.ownerId && target.ownerId !== faction.id
              ? createProvinceGarrison(target)
              : null;
            let defender: Army | null = defenders[0] || garrison;
            if (defenders[0] && garrison) {
              defender = {
                ...defenders[0],
                infantry: defenders[0].infantry + garrison.infantry,
                morale: Math.max(defenders[0].morale, garrison.morale),
              };
            }
            
            if (defender) {
              const result = resolveCombat(army, defender, target);
              if (result.attackerWins) {
                newArmies[armyIdx] = {
                  ...army, provinceId: action.targetProvinceId!, movementLeft: 0,
                  cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
                  infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
                };
                if (defenders[0]) {
                  if (result.defenderDestroyed) {
                    newArmies = newArmies.filter(a => a.id !== defenders[0].id);
                  } else {
                    const dIdx = newArmies.findIndex(a => a.id === defenders[0].id);
                    newArmies[dIdx] = {
                      ...defenders[0],
                      cavalry: Math.max(0, defenders[0].cavalry - result.defenderCavalryLoss),
                      infantry: Math.max(0, defenders[0].infantry - result.defenderInfantryLoss),
                    };
                  }
                }
                const pIdx = newProvinces.findIndex(p => p.id === action.targetProvinceId);
                newProvinces[pIdx] = { ...newProvinces[pIdx], ownerId: faction.id };
                aiLog.push(`${faction.name}: Voitti taistelun - ${target.name}!`);
              } else {
                newArmies[armyIdx] = {
                  ...army, movementLeft: 0,
                  cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
                  infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
                };
                aiLog.push(`${faction.name}: Hyökkäys epäonnistui - ${target.name}`);
              }
            } else {
              // No defenders and no garrison, just take it
              newArmies[armyIdx] = { ...army, provinceId: action.targetProvinceId!, movementLeft: 0 };
              const pIdx = newProvinces.findIndex(p => p.id === action.targetProvinceId);
              newProvinces[pIdx] = { ...newProvinces[pIdx], ownerId: faction.id };
              aiLog.push(`${faction.name}: Valloitti ${target.name}`);
            }
          } else if (action.type === 'build_fort' && action.targetProvinceId) {
            const fIdx = newFactions.findIndex(f => f.id === faction.id);
            if (newFactions[fIdx].treasury >= 50) {
              newFactions[fIdx] = { ...newFactions[fIdx], treasury: newFactions[fIdx].treasury - 50 };
              const pIdx = newProvinces.findIndex(p => p.id === action.targetProvinceId);
              if (pIdx !== -1) {
                newProvinces[pIdx] = { ...newProvinces[pIdx], fortLevel: Math.min(3, newProvinces[pIdx].fortLevel + 1) };
              }
              aiLog.push(`${faction.name}: ${action.description}`);
            }
          } else if (action.type === 'build_market' && action.targetProvinceId) {
            const fIdx = newFactions.findIndex(f => f.id === faction.id);
            if (newFactions[fIdx].treasury >= 25) {
              newFactions[fIdx] = { ...newFactions[fIdx], treasury: newFactions[fIdx].treasury - 25 };
              aiLog.push(`${faction.name}: ${action.description}`);
            }
          } else if (action.type === 'recruit' && action.targetProvinceId) {
            const fIdx = newFactions.findIndex(f => f.id === faction.id);
            if (newFactions[fIdx].treasury >= 30 && newFactions[fIdx].manpower >= 10) {
              newFactions[fIdx] = { ...newFactions[fIdx], treasury: newFactions[fIdx].treasury - 30, manpower: newFactions[fIdx].manpower - 10 };
              const horsesAvail = newFactions[fIdx].horses || 0;
              const cavCount = Math.min(4, Math.floor(horsesAvail / 2));
              newFactions[fIdx] = { ...newFactions[fIdx], horses: newFactions[fIdx].horses - cavCount * 2 };
              newArmies.push({
                id: generateId(),
                ownerId: faction.id,
                provinceId: action.targetProvinceId,
                cavalry: cavCount, infantry: 6, siege: 0,
                morale: 70, supply: 20, movementLeft: 0, leaderBonus: 0,
              });
              aiLog.push(`${faction.name}: Rekrytoi armeijan`);
            }
          }
        }
      }
      
      // Build structured AI action log from aiLog strings
      // Parse "FactionName: description" format
      for (const msg of aiLog) {
        const colonIdx = msg.indexOf(':');
        if (colonIdx > 0) {
          const fName = msg.substring(0, colonIdx).trim();
          const desc = msg.substring(colonIdx + 1).trim();
          const fData = newFactions.find(f => f.name === fName);
          aiActionLog.push({
            factionName: fName,
            factionColor: fData?.color || '#888',
            description: `${fName}: ${desc}`,
          });
        }
      }
      
      // Remove destroyed armies
      newArmies = newArmies.filter(a => a.cavalry + a.infantry > 0);
      
      // ============= SUPPLY (TARJONTA) ATTRITION =============
      // Each army consumes supply based on its size vs province supply limit
      newArmies = newArmies.map(army => {
        const province = newProvinces.find(p => p.id === army.provinceId);
        if (!province) return army;
        const terrainInfo = PROVINCE_TERRAIN_INFO[province.terrain];
        const armySize = army.cavalry + army.infantry + army.siege;
        const supplyLimit = province.supply + terrainInfo.supplyLimit;
        // If army exceeds supply, lose morale and take attrition
        if (armySize > supplyLimit) {
          const overSupply = armySize - supplyLimit;
          const moraleLoss = Math.min(15, overSupply * 3);
          const attritionChance = Math.min(0.5, overSupply * 0.08);
          const cavLoss = Math.random() < attritionChance ? Math.max(1, Math.floor(army.cavalry * 0.1)) : 0;
          const infLoss = Math.random() < attritionChance ? Math.max(1, Math.floor(army.infantry * 0.1)) : 0;
          return {
            ...army,
            morale: Math.max(10, army.morale - moraleLoss),
            cavalry: Math.max(0, army.cavalry - cavLoss),
            infantry: Math.max(0, army.infantry - infLoss),
            supply: Math.max(0, army.supply - overSupply),
          };
        }
        // Friendly territory restores supply and morale
        if (province.ownerId === army.ownerId) {
          return {
            ...army,
            morale: Math.min(100, army.morale + 5),
            supply: Math.min(30, army.supply + supplyLimit),
          };
        }
        return { ...army, supply: Math.max(0, army.supply - 2) };
      });
      
      // Remove armies destroyed by attrition
      newArmies = newArmies.filter(a => a.cavalry + a.infantry > 0);
      
      // Reset movement for next turn
      newArmies = newArmies.map(a => ({ ...a, movementLeft: 3 }));

      // ============= SIEGE / FRONTLINE PROCESSING =============
      // For each province, check if it is fully surrounded by enemy-controlled neighbors.
      // If so, increase siegeProgress and apply modest attrition to the owning faction's treasury
      // (represents supply loss). If fortress exists, it will be drained by assaults elsewhere,
      // but here we reduce fortLevel slowly if siegeProgress grows.
      const siegeProvinces = newProvinces.map(p => ({ ...p }));
      const factionMap = new Map<string, number>();
      for (let i = 0; i < siegeProvinces.length; i++) {
        const p = siegeProvinces[i];
        if (!p.ownerId) continue;
        // If province has no neighbors, skip
        if (!p.neighbors || p.neighbors.length === 0) continue;
        const allNeighborsEnemy = p.neighbors.every(nid => {
          const nb = siegeProvinces.find(x => x.id === nid);
          return nb && nb.ownerId && nb.ownerId !== p.ownerId;
        });
        if (allNeighborsEnemy) {
          // increase siege progress
          const cur = typeof p.siegeProgress === 'number' ? p.siegeProgress : 0;
          siegeProvinces[i].siegeProgress = cur + 1;
          // If fort exists, reduce fortLevel first
          if (siegeProvinces[i].fortLevel && siegeProvinces[i].fortLevel > 0) {
            siegeProvinces[i].fortLevel = Math.max(0, siegeProvinces[i].fortLevel - 1);
          } else {
            // Penalize owner's treasury slightly per turn under siege
            factionMap.set(p.ownerId, (factionMap.get(p.ownerId) || 0) + 5);
          }
        } else {
          siegeProvinces[i].siegeProgress = 0;
        }
      }
      // Apply treasury penalties
      if (factionMap.size > 0) {
        newFactions = newFactions.map(f => {
          const penalty = factionMap.get(f.id) || 0;
          if (penalty > 0) return { ...f, treasury: Math.max(0, f.treasury - penalty) };
          return f;
        });
      }
      // Replace provinces with siege-processed array
      for (let i = 0; i < newProvinces.length; i++) {
        const updated = siegeProvinces.find(sp => sp.id === newProvinces[i].id);
        if (updated) newProvinces[i] = updated;
      }
      
      // 4. Check victory/defeat
      const playerProvinces = newProvinces.filter(p => p.ownerId === playerFaction).length;
      const playerArmies = newArmies.filter(a => a.ownerId === playerFaction);
      const playerFactionData = newFactions.find(f => f.id === playerFaction)!;
      const playerGold = playerFactionData.treasury;
      const playerTechCount = newState.playedTechCards.length;
      
      let gameOver = false;
      let winnerId: FactionId | null = null;
      let winCondition: string | null = null;
      
      // Military victory: control enough provinces
      if (playerProvinces >= VICTORY_TARGETS.provinces) {
        gameOver = true;
        winnerId = playerFaction;
        winCondition = 'military';
      }
      
      // Economic victory: amass enough gold
      if (!gameOver && playerGold >= VICTORY_TARGETS.gold) {
        gameOver = true;
        winnerId = playerFaction;
        winCondition = 'economic';
      }
      
      // Technology victory: play enough tech cards
      if (!gameOver && playerTechCount >= VICTORY_TARGETS.tech) {
        gameOver = true;
        winnerId = playerFaction;
        winCondition = 'technology';
      }
      
      // Defeat if player has lost all provinces and armies
      if (!gameOver && playerArmies.length === 0 && playerProvinces === 0) {
        gameOver = true;
        winnerId = null;
        winCondition = null;
      }
      
      // Check AI victory too
      for (const faction of newFactions) {
        if (faction.id === playerFaction) continue;
        const aiProvinces = newProvinces.filter(p => p.ownerId === faction.id).length;
        const aiGold = faction.treasury;
        const aiTechCount = 0; // AI tech victory not implemented yet
        const enemyOwned = newProvinces.filter(p => p.ownerId && p.ownerId !== faction.id).length;
        
        if (enemyOwned === 0 && aiProvinces > 0) {
          gameOver = true;
          winnerId = faction.id;
          winCondition = 'military';
        } else if (!gameOver && aiGold >= VICTORY_TARGETS.gold) {
          gameOver = true;
          winnerId = faction.id;
          winCondition = 'economic';
        } else if (!gameOver && aiTechCount >= VICTORY_TARGETS.tech) {
          gameOver = true;
          winnerId = faction.id;
          winCondition = 'technology';
        }
      }
      
      return activatePendingWars({
        ...newState,
        turn: newState.turn + 1,
        year: newState.year + 1,
        phase: 'resource' as MVPPhase,
        factions: newFactions,
        armies: newArmies,
        provinces: newProvinces,
        food: Math.max(0, newFood),
        gameOver,
        winnerId,
        winCondition,
        aiLog,
        aiActionLog,
        resourcesCollected: false,
        lastCollection: null,
        attackBonus: 0,
        defenseBonus: 0,
        movementBonus: 0,
        selectedArmyId: null,
        selectedProvinceId: null,
      });
    });
  }, [playerFaction]);

  // ============= TREATY =============
  const proposeTreaty = useCallback((targetFaction: FactionId, treatyType: TreatyType) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const relIdx = prev.relations.findIndex(r =>
        (r.factionA === playerFaction && r.factionB === targetFaction) ||
        (r.factionB === playerFaction && r.factionA === targetFaction)
      );
      if (relIdx === -1) return prev;
      const rel = prev.relations[relIdx];
      const isWar = treatyType === 'war_surprise' || treatyType === 'war_formal';
      const accepts = isWar ? true : Math.random() < ((rel.relation + 100) / 200) * (rel.trust / 100) + 0.2;
      if (!accepts) return prev;

      const newRels = prev.relations.map(r => {
        const involvesPlayer = r.factionA === playerFaction || r.factionB === playerFaction;
        const involvesTarget = r.factionA === targetFaction || r.factionB === targetFaction;
        if (treatyType === 'war_surprise' && involvesPlayer) {
          const filteredTreaties = r.treaties.filter(t => !['non_aggression', 'peace', 'truce', 'alliance'].includes(t.type));
          const newTreaty = {
            type: treatyType,
            startTurn: prev.turn,
            duration: -1,
          } as Treaty;
          return {
            ...r,
            treaties: [...filteredTreaties, newTreaty],
            relation: -100,
            trust: 0,
            threat: Math.min(100, r.threat + 30),
          };
        }

        if (involvesTarget && involvesPlayer) {
          const newTreaty = {
            type: treatyType,
            startTurn: treatyType === 'war_formal' ? prev.turn + 1 : prev.turn,
            duration: -1,
          } as Treaty;
          return {
            ...r,
            treaties: [...r.treaties, newTreaty],
            relation: isWar ? (treatyType === 'war_surprise' ? -100 : Math.max(-100, r.relation - 40)) : Math.min(100, r.relation + 10),
            trust: isWar ? 0 : Math.min(100, r.trust + 5),
            threat: isWar ? Math.min(100, r.threat + 30) : r.threat,
          };
        }

        return r;
      });

      return { ...prev, relations: newRels };
    });
  }, [playerFaction]);

  // ============= WAR DECLARATIONS =============
  const declareWar = useCallback((targetFaction: FactionId, surprise: boolean = false) => {
    const treatyType = surprise ? 'war_surprise' : 'war_formal';
    proposeTreaty(targetFaction, treatyType);
  }, [proposeTreaty]);

  const breakTreaty = useCallback((targetFaction: FactionId, treatyType: TreatyType) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const relIdx = prev.relations.findIndex(r =>
        (r.factionA === playerFaction && r.factionB === targetFaction) ||
        (r.factionB === playerFaction && r.factionA === targetFaction)
      );
      if (relIdx === -1) return prev;
      const rel = prev.relations[relIdx];
      const newRels = [...prev.relations];
      newRels[relIdx] = { ...rel, treaties: rel.treaties.filter(t => t.type !== treatyType), relation: rel.relation - 30, trust: Math.max(0, rel.trust - 20) };
      return { ...prev, relations: newRels };
    });
  }, [playerFaction]);

  const buildFort = useCallback((provinceId: string) => {
    buildStructure(provinceId, 'fortress');
  }, [buildStructure]);

  const resolveEvent = useCallback((_choiceIndex?: number) => {}, []);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setPlayerFaction(null);
    setGameState(null);
  }, []);

  const clearBattle = useCallback(() => setPendingBattle(null), []);

  const getRelation = useCallback((factionA: FactionId, factionB: FactionId) => {
    if (!gameState) return null;
    return gameState.relations.find(r =>
      (r.factionA === factionA && r.factionB === factionB) ||
      (r.factionB === factionA && r.factionA === factionB)
    ) || null;
  }, [gameState]);

  const getPlayerFaction = useCallback(() => {
    if (!gameState || !playerFaction) return null;
    return gameState.factions.find(f => f.id === playerFaction) || null;
  }, [gameState, playerFaction]);

  const getArmiesInProvince = useCallback((provinceId: string) => {
    if (!gameState) return [];
    return gameState.armies.filter(a => a.provinceId === provinceId);
  }, [gameState]);

  // endPhase is alias for nextPhase (backward compat)
  const endPhase = nextPhase;

  return {
    gameStarted, playerFaction, gameState,
    pendingBattle, clearBattle,
    startGame, selectProvince, selectArmy, moveArmy,
    nextPhase, endTurn, resetGame,
    playCard, buildStructure, recruitArmy,
    proposeTreaty, breakTreaty, buildFort, resolveEvent,
    declareWar, repairFort,
    getRelation, getPlayerFaction, getArmiesInProvince, canMoveTo,
    endPhase, collectResources,
  };
};
