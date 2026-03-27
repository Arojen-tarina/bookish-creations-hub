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
import { getProvincesWithAdjacency } from '@/data/provinces-1206';
import { BattleResult } from '@/components/game/digital/BattleDisplay';
import { PlayableCard, createPlayableDeck, drawCards, shuffleDeck } from '@/game/cards';
import { calculateAIActions } from '@/game/ai';
import { MVPPhase } from '@/components/game/digital/PhaseBar';

const generateId = () => Math.random().toString(36).substr(2, 9);

// ============= VICTORY TARGETS =============
export const VICTORY_TARGETS = {
  provinces: 30, // ~40% of map
  gold: 500,
  tech: 5,
};

// ============= BUILDING TYPES =============
export type MVPBuildingType = 'camp' | 'market' | 'fortress';

export const BUILDING_INFO: Record<MVPBuildingType, {
  name: string; emoji: string; cost: { gold: number; artisans?: number };
  effect: string;
}> = {
  camp: { name: 'Leiri', emoji: '⛺', cost: { gold: 15 }, effect: 'Hallinta/spawn-piste' },
  market: { name: 'Markkina', emoji: '🏪', cost: { gold: 25, artisans: 1 }, effect: '+3 kultaa/vuoro' },
  fortress: { name: 'Linnoitus', emoji: '🏯', cost: { gold: 50, artisans: 2 }, effect: '+3 puolustus' },
};

// ============= EXTENDED STATE =============
export interface ResourceCollectionResult {
  taxIncome: number;
  manpowerGain: number;
  marketBonus: number;
  foodChange: number;
}

export interface AIActionLog {
  factionName: string;
  factionColor: string;
  description: string;
  targetProvinceId?: string;
}

export interface MVPGameState extends Omit<ProvinceGameState, 'phase'> {
  phase: MVPPhase;
  
  // Cards
  deck: PlayableCard[];
  hand: PlayableCard[];
  discard: PlayableCard[];
  playedTechCards: PlayableCard[]; // permanent techs
  
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

// ============= COMBAT =============
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
  
  const attackerPower = (attacker.cavalry * 3 + attacker.infantry * 1.5 + attacker.siege)
    * (1 + attacker.leaderBonus)
    * (attacker.morale / 100)
    + attackBonus;
  
  const defenderPower = (defender.cavalry * 2 + defender.infantry * 2 + defender.siege)
    * (1 + terrainInfo.defenseBonus * 0.2)
    * (1 + terrain.fortLevel * 0.3)
    * (defender.morale / 100)
    + defenseBonus;
  
  const attackRoll = Math.floor(Math.random() * 6) + 1;
  const defenseRoll = Math.floor(Math.random() * 6) + 1;
  
  const ratio = (attackerPower + attackRoll * 2) / (defenderPower + defenseRoll * 2);
  const attackerWins = ratio > 0.9;
  
  const baseLossRatio = attackerWins ? 0.15 : 0.35;
  const defenderLossRatio = attackerWins ? 0.45 : 0.15;
  
  return {
    attackerWins,
    defenderDestroyed: attackerWins && Math.random() > 0.35,
    attackerCavalryLoss: Math.max(1, Math.floor(attacker.cavalry * baseLossRatio * (0.5 + Math.random() * 0.5))),
    attackerInfantryLoss: Math.max(1, Math.floor(attacker.infantry * baseLossRatio * (0.5 + Math.random() * 0.5))),
    defenderCavalryLoss: Math.max(1, Math.floor(defender.cavalry * defenderLossRatio)),
    defenderInfantryLoss: Math.max(1, Math.floor(defender.infantry * defenderLossRatio)),
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
  recruitArmy: (provinceId: string) => void;
  proposeTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  breakTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  buildFort: (provinceId: string) => void;
  resolveEvent: (choiceIndex?: number) => void;
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
    const provinces = getProvincesWithAdjacency();
    const factions = createFactions(selectedFaction);
    const relations = createDiplomaticRelations(factions);
    const armies = createStartingArmies(factions, provinces);
    const deck = createPlayableDeck();
    const { drawn, remaining } = drawCards(deck, 5); // Starting hand
    
    const initialState: MVPGameState = {
      turn: 1,
      year: 1206,
      currentPlayerId: selectedFaction,
      phase: 'resource',
      provinces,
      factions,
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
      return { ...prev, selectedArmyId: armyId, selectedProvinceId: army?.provinceId || prev.selectedProvinceId };
    });
  }, []);

  // ============= CAN MOVE =============
  const canMoveTo = useCallback((armyId: string, targetProvinceId: string): boolean => {
    if (!gameState) return false;
    const army = gameState.armies.find(a => a.id === armyId);
    if (!army || army.movementLeft <= 0) return false;
    const currentProvince = gameState.provinces.find(p => p.id === army.provinceId);
    const targetProvince = gameState.provinces.find(p => p.id === targetProvinceId);
    if (!currentProvince || !targetProvince) return false;
    if (!currentProvince.neighbors.includes(targetProvinceId)) return false;
    const terrainInfo = PROVINCE_TERRAIN_INFO[targetProvince.terrain];
    const moveCost = Math.max(1, terrainInfo.movementCost - (gameState.movementBonus > 0 ? 1 : 0));
    if (army.movementLeft < moveCost) return false;
    return true;
  }, [gameState]);

  // ============= MOVE ARMY =============
  const moveArmy = useCallback((armyId: string, targetProvinceId: string) => {
    if (!canMoveTo(armyId, targetProvinceId)) return;
    
    setGameState(prev => {
      if (!prev) return null;
      const armyIndex = prev.armies.findIndex(a => a.id === armyId);
      if (armyIndex === -1) return prev;
      const army = prev.armies[armyIndex];
      const targetProvince = prev.provinces.find(p => p.id === targetProvinceId);
      if (!targetProvince) return prev;
      
      const terrainInfo = PROVINCE_TERRAIN_INFO[targetProvince.terrain];
      const moveCost = Math.max(1, terrainInfo.movementCost - (prev.movementBonus > 0 ? 1 : 0));
      
      // Check for combat
      const enemyArmies = prev.armies.filter(a => a.provinceId === targetProvinceId && a.ownerId !== army.ownerId);
      let newArmies = [...prev.armies];
      let newProvinces = [...prev.provinces];
      
      if (enemyArmies.length > 0) {
        const result = resolveCombat(army, enemyArmies[0], targetProvince, prev.attackBonus, prev.defenseBonus);
        
        const battleResult: BattleResult = {
          attacker: { ...army },
          defender: { ...enemyArmies[0] },
          attackerFaction: army.ownerId,
          defenderFaction: enemyArmies[0].ownerId,
          provinceName: targetProvince.name,
          winner: result.attackerWins ? 'attacker' : 'defender',
          attackerLosses: { cavalry: result.attackerCavalryLoss, infantry: result.attackerInfantryLoss },
          defenderLosses: { cavalry: result.defenderCavalryLoss, infantry: result.defenderInfantryLoss },
          attackerMoraleLoss: result.attackerWins ? 10 : 20,
          defenderMoraleLoss: result.attackerWins ? 20 : 10,
        };
        setTimeout(() => setPendingBattle(battleResult), 50);
        
        if (result.attackerWins) {
          newArmies[armyIndex] = {
            ...army, provinceId: targetProvinceId, movementLeft: 0,
            cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
            infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
            morale: Math.max(20, army.morale - 10),
          };
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
          const pIdx = newProvinces.findIndex(p => p.id === targetProvinceId);
          if (pIdx !== -1) {
            newProvinces[pIdx] = { ...newProvinces[pIdx], ownerId: army.ownerId, unrest: 30 };
          }
        } else {
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
    });
  }, [canMoveTo]);

  // ============= PLAY CARD =============
  const playCard = useCallback((card: PlayableCard) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const newHand = prev.hand.filter(c => c.id !== card.id);
      const newDiscard = [...prev.discard, card];
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction) return prev;
      
      let newState = { ...prev, hand: newHand, discard: newDiscard };
      const effect = card.parsedEffect;
      
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
          newState.attackBonus = prev.attackBonus + effect.value;
          break;
        case 'defense_bonus':
          newState.defenseBonus = prev.defenseBonus + effect.value;
          break;
        case 'movement_bonus':
          newState.movementBonus = prev.movementBonus + effect.value;
          // Apply to all player armies
          newState.armies = prev.armies.map(a => a.ownerId === playerFaction ? { ...a, movementLeft: a.movementLeft + effect.value } : a);
          break;
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
      if (!prev || !playerFaction) return prev;
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || province.ownerId !== playerFaction) return prev;
      
      const info = BUILDING_INFO[type];
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction || faction.treasury < info.cost.gold) return prev;
      if (info.cost.artisans && prev.artisans < info.cost.artisans) return prev;
      
      const existing = prev.buildings[provinceId] || [];
      if (existing.includes(type)) return prev; // Already built
      
      const newFactions = prev.factions.map(f => f.id === playerFaction ? { ...f, treasury: f.treasury - info.cost.gold } : f);
      const newArtisans = prev.artisans - (info.cost.artisans || 0);
      const newBuildings = { ...prev.buildings, [provinceId]: [...existing, type] };
      
      // Apply building effect
      let newProvinces = prev.provinces;
      if (type === 'fortress') {
        newProvinces = prev.provinces.map(p => p.id === provinceId ? { ...p, fortLevel: Math.min(3, p.fortLevel + 1) } : p);
      }
      
      return { ...prev, factions: newFactions, artisans: newArtisans, buildings: newBuildings, provinces: newProvinces };
    });
  }, [playerFaction]);

  // ============= RECRUIT ARMY =============
  const recruitArmy = useCallback((provinceId: string) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || province.ownerId !== playerFaction) return prev;
      
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction || faction.treasury < 20 || faction.manpower < 5) return prev;
      
      // Check if province has a camp or is capital
      const hasCamp = (prev.buildings[provinceId] || []).includes('camp');
      const isCapital = province.id === faction.capitalId;
      if (!hasCamp && !isCapital) return prev;
      
      const newArmy: Army = {
        id: generateId(),
        ownerId: playerFaction,
        provinceId,
        cavalry: Math.min(3, Math.floor(faction.horses / 2)),
        infantry: 5,
        siege: 0,
        morale: 70,
        supply: 20,
        movementLeft: 0,
        leaderBonus: 0,
      };
      
      const horsesUsed = newArmy.cavalry * 2;
      const newFactions = prev.factions.map(f =>
        f.id === playerFaction ? { ...f, treasury: f.treasury - 20, manpower: f.manpower - 5, horses: f.horses - horsesUsed } : f
      );
      const newFood = prev.food - 2;
      
      return { ...prev, armies: [...prev.armies, newArmy], factions: newFactions, food: Math.max(0, newFood) };
    });
  }, [playerFaction]);

  // ============= COLLECT RESOURCES =============
  const collectResources = useCallback(() => {
    setGameState(prev => {
      if (!prev || !playerFaction || prev.resourcesCollected) return prev;
      
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction) return prev;
      
      const ownedProvinces = prev.provinces.filter(p => p.ownerId === playerFaction);
      let taxIncome = ownedProvinces.reduce((sum, p) => sum + p.baseTax, 0);
      const manpowerGain = Math.floor(ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0) * 0.3);
      
      const marketCount = Object.entries(prev.buildings).filter(([pid, buildings]) => {
        const p = prev.provinces.find(pr => pr.id === pid);
        return p?.ownerId === playerFaction && buildings.includes('market');
      }).length;
      const marketBonus = marketCount * 3;
      taxIncome += marketBonus;
      
      const playerArmyCount = prev.armies.filter(a => a.ownerId === playerFaction).length;
      const foodUpkeep = -playerArmyCount;
      const farmland = prev.provinces.filter(p => p.ownerId === playerFaction && (p.terrain === 'farmland' || p.terrain === 'grassland')).length;
      const foodGain = Math.floor(farmland * 0.5);
      const foodChange = foodUpkeep + foodGain;
      
      const newFactions = prev.factions.map(f =>
        f.id === playerFaction ? { ...f, treasury: f.treasury + taxIncome, manpower: f.manpower + manpowerGain } : f
      );
      
      const collection: ResourceCollectionResult = { taxIncome, manpowerGain, marketBonus, foodChange };
      
      return {
        ...prev,
        factions: newFactions,
        food: Math.max(0, prev.food + foodChange),
        resourcesCollected: true,
        lastCollection: collection,
      };
    });
  }, [playerFaction]);


  const PHASE_ORDER: MVPPhase[] = ['resource', 'cards', 'move', 'battle', 'build', 'end'];
  
  const nextPhase = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      const currentIndex = PHASE_ORDER.indexOf(prev.phase);
      if (currentIndex < PHASE_ORDER.length - 1) {
        const next = PHASE_ORDER[currentIndex + 1];
        
        // Auto-actions per phase
        if (next === 'cards') {
          // Draw 1 card
          if (prev.deck.length > 0) {
            const { drawn, remaining } = drawCards(prev.deck, 1);
            return { ...prev, phase: next, hand: [...prev.hand, ...drawn], deck: remaining };
          } else if (prev.discard.length > 0) {
            // Reshuffle discard into deck
            const newDeck = shuffleDeck(prev.discard);
            const { drawn, remaining } = drawCards(newDeck, 1);
            return { ...prev, phase: next, hand: [...prev.hand, ...drawn], deck: remaining, discard: [] };
          }
        }
        
        return { ...prev, phase: next };
      }
      return prev;
    });
  }, []);

  // ============= END TURN =============
  const endTurn = useCallback(() => {
    setGameState(prev => {
      if (!prev || !playerFaction) return null;
      
      let newState = { ...prev };
      const aiLog: string[] = [];
      const aiActionLog: AIActionLog[] = [];
      
      // 1. Collect resources for AI factions only (player collects in resource phase)
      const newFactions = newState.factions.map(faction => {
        if (faction.id === playerFaction) return faction; // Player already collected
        const ownedProvinces = newState.provinces.filter(p => p.ownerId === faction.id);
        const taxIncome = ownedProvinces.reduce((sum, p) => sum + p.baseTax, 0);
        const manpowerGain = Math.floor(ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0) * 0.3);
        
        return { ...faction, treasury: faction.treasury + taxIncome, manpower: faction.manpower + manpowerGain };
      });
      
      // 2. Food: skip player (already handled in collectResources), just track for state
      let newFood = newState.food;
      
      // 3. AI turns
      let newArmies = [...newState.armies];
      let newProvinces = [...newState.provinces];
      
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
            if (defenders.length > 0) {
              const result = resolveCombat(army, defenders[0], target);
              if (result.attackerWins) {
                newArmies[armyIdx] = {
                  ...army, provinceId: action.targetProvinceId!, movementLeft: 0,
                  cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss),
                  infantry: Math.max(0, army.infantry - result.attackerInfantryLoss),
                };
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
              // No defenders, just take it
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
      
      // Reset movement for next turn
      newArmies = newArmies.map(a => ({ ...a, movementLeft: 3 }));
      
      // 4. Check victory/defeat
      const playerProvinces = newProvinces.filter(p => p.ownerId === playerFaction).length;
      const playerArmies = newArmies.filter(a => a.ownerId === playerFaction);
      const playerFactionData = newFactions.find(f => f.id === playerFaction)!;
      
      let gameOver = false;
      let winnerId: FactionId | null = null;
      let winCondition: string | null = null;
      
      // Victory
      if (playerProvinces >= VICTORY_TARGETS.provinces) {
        gameOver = true; winnerId = playerFaction; winCondition = 'military';
      } else if (playerFactionData.treasury >= VICTORY_TARGETS.gold) {
        gameOver = true; winnerId = playerFaction; winCondition = 'economic';
      } else if (newState.playedTechCards.length >= VICTORY_TARGETS.tech) {
        gameOver = true; winnerId = playerFaction; winCondition = 'technology';
      }
      
      // Defeat
      if (playerArmies.length === 0 && playerProvinces === 0) {
        gameOver = true; winnerId = null; winCondition = null;
      }
      
      // Check AI victory too
      for (const faction of newFactions) {
        if (faction.id === playerFaction) continue;
        const aiProvinces = newProvinces.filter(p => p.ownerId === faction.id).length;
        if (aiProvinces >= VICTORY_TARGETS.provinces) {
          gameOver = true; winnerId = faction.id; winCondition = 'military';
        }
      }
      
      return {
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
      };
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
      const accepts = Math.random() < (rel.relation + 100) / 200 * (rel.trust / 100) + 0.2;
      if (!accepts) return prev;
      const newRels = [...prev.relations];
      newRels[relIdx] = { ...rel, treaties: [...rel.treaties, { type: treatyType, startTurn: prev.turn, duration: -1 }], relation: rel.relation + 10, trust: rel.trust + 5 };
      return { ...prev, relations: newRels };
    });
  }, [playerFaction]);

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
  }, []);

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
    gameStarted, playerFaction, gameState: gameState as any,
    pendingBattle, clearBattle,
    startGame, selectProvince, selectArmy, moveArmy,
    nextPhase, endTurn, resetGame,
    playCard, buildStructure, recruitArmy,
    proposeTreaty, breakTreaty, buildFort, resolveEvent,
    getRelation, getPlayerFaction, getArmiesInProvince, canMoveTo,
    endPhase, collectResources,
  };
};
