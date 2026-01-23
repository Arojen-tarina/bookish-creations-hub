import { useState, useCallback, useEffect } from 'react';
import {
  Province,
  FactionId,
  Faction,
  Army,
  DiplomaticRelation,
  ProvinceGameState,
  GamePhase,
  GameEvent,
  ActiveGameEvent,
  Treaty,
  TreatyType,
  FACTION_DATA_1206,
  PROVINCE_TERRAIN_INFO,
} from '@/types/province';
import { getProvincesWithAdjacency } from '@/data/provinces-1206';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initialize factions for 1206 start
const createFactions = (playerFactionId: FactionId): Faction[] => {
  return (Object.keys(FACTION_DATA_1206) as FactionId[]).map(id => ({
    ...FACTION_DATA_1206[id],
    isPlayer: id === playerFactionId,
  }));
};

// Initialize diplomatic relations between all factions
const createDiplomaticRelations = (factions: Faction[]): DiplomaticRelation[] => {
  const relations: DiplomaticRelation[] = [];
  
  for (let i = 0; i < factions.length; i++) {
    for (let j = i + 1; j < factions.length; j++) {
      const factionA = factions[i].id;
      const factionB = factions[j].id;
      
      // Initial relations based on historical context
      let relation = 0;
      let threat = 30;
      
      // Mongols start hostile with most
      if (factionA === 'mongol' || factionB === 'mongol') {
        relation = -20;
        threat = 60;
      }
      
      // Jin and Song are rivals
      if ((factionA === 'jin' && factionB === 'song') || 
          (factionA === 'song' && factionB === 'jin')) {
        relation = -40;
        threat = 50;
      }
      
      // Kipchak and Mongol are related tribes
      if ((factionA === 'mongol' && factionB === 'kipchak') || 
          (factionA === 'kipchak' && factionB === 'mongol')) {
        relation = 10;
        threat = 40;
      }
      
      relations.push({
        factionA,
        factionB,
        relation,
        trust: 50,
        threat,
        treaties: [],
        borderFriction: 0,
        claims: [],
      });
    }
  }
  
  return relations;
};

// Create starting armies for each faction
const createStartingArmies = (factions: Faction[], provinces: Province[]): Army[] => {
  const armies: Army[] = [];
  
  factions.forEach(faction => {
    const capital = provinces.find(p => p.id === faction.capitalId);
    if (!capital) return;
    
    // Main army at capital
    armies.push({
      id: `army-${faction.id}-main`,
      ownerId: faction.id,
      provinceId: capital.id,
      cavalry: faction.id === 'mongol' ? 15 : 5,
      infantry: faction.id === 'song' ? 20 : 10,
      siege: faction.id === 'jin' ? 3 : 1,
      morale: 80,
      supply: 30,
      movementLeft: 3,
      leaderBonus: faction.id === 'mongol' ? 0.3 : 0.1, // Temujin bonus
    });
    
    // Secondary army for larger factions
    if (['jin', 'song', 'khwarezm'].includes(faction.id)) {
      const secondProvince = provinces.find(
        p => p.ownerId === faction.id && p.id !== capital.id && p.fortLevel > 0
      );
      
      if (secondProvince) {
        armies.push({
          id: `army-${faction.id}-second`,
          ownerId: faction.id,
          provinceId: secondProvince.id,
          cavalry: 3,
          infantry: 8,
          siege: 0,
          morale: 70,
          supply: 20,
          movementLeft: 3,
          leaderBonus: 0,
        });
      }
    }
  });
  
  return armies;
};

// Create event deck
const createEventDeck = (): GameEvent[] => {
  return [
    {
      id: 'mongol_rally',
      type: 'mongol_rally',
      name: 'Mongolisoturien kokoontuminen',
      description: 'Uudet soturit liittyvät hordaan',
      effect: '+5 ratsuväkeä pääkaupunkiin',
      duration: 0,
      weight: 10,
      conditions: [{ type: 'min_provinces', value: 5 }],
    },
    {
      id: 'silk_road_boom',
      type: 'trade_boom',
      name: 'Silkkitien kukoistus',
      description: 'Kauppa kukoistaa Silkkitiellä',
      effect: '+50% verotulot Silkkitien provinsseilta',
      duration: 3,
      weight: 15,
    },
    {
      id: 'drought_central_asia',
      type: 'drought',
      name: 'Kuivuus Keski-Aasiassa',
      description: 'Ankara kuivuus iskee stepille',
      effect: '-2 tarjonta steppiprovinsseissa',
      duration: 2,
      weight: 10,
    },
    {
      id: 'rebellion_unrest',
      type: 'rebellion',
      name: 'Kapina!',
      description: 'Tyytymättömät asukkaat nousevat kapinaan',
      effect: 'Korkean levottomuuden provinssi siirtyy neutraaliksi',
      duration: 0,
      weight: 8,
    },
    {
      id: 'plague_outbreak',
      type: 'plague',
      name: 'Ruttoepidemian puhkeaminen',
      description: 'Tauti leviää valtakunnassa',
      effect: '-20% miesvoima kaikissa provinsseissa 2 vuoroa',
      duration: 2,
      weight: 5,
    },
    {
      id: 'diplomatic_marriage',
      type: 'diplomatic_offer',
      name: 'Avioliittoliitto',
      description: 'Naapurivaltio tarjoaa dynastista liittoa',
      effect: '+30 suhde satunnaiseen viholliseen',
      duration: 0,
      weight: 12,
      choices: [
        { text: 'Hyväksy liitto', effect: '+30 suhde, +10 luottamus' },
        { text: 'Hylkää tarjous', effect: '-10 suhde, säilytä itsenäisyys' },
      ],
    },
    {
      id: 'conquest_opportunity',
      type: 'conquest_opportunity',
      name: 'Heikko naapuri',
      description: 'Naapurivaltio on sisäisessä kriisissä',
      effect: 'Rajaprovinssi on helpompi vallata tällä vuorolla',
      duration: 1,
      weight: 10,
    },
  ];
};

// Shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export interface ProvinceGameActions {
  startGame: (playerFaction: FactionId) => void;
  selectProvince: (provinceId: string) => void;
  selectArmy: (armyId: string) => void;
  moveArmy: (armyId: string, targetProvinceId: string) => void;
  endPhase: () => void;
  resetGame: () => void;
  
  // Diplomacy
  proposeTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  breakTreaty: (targetFaction: FactionId, treatyType: TreatyType) => void;
  
  // Building
  buildFort: (provinceId: string) => void;
  recruitArmy: (provinceId: string) => void;
  
  // Events
  resolveEvent: (choiceIndex?: number) => void;
}

export interface UseProvinceGameStateReturn extends ProvinceGameActions {
  gameStarted: boolean;
  playerFaction: FactionId | null;
  gameState: ProvinceGameState | null;
  getRelation: (factionA: FactionId, factionB: FactionId) => DiplomaticRelation | null;
  getPlayerFaction: () => Faction | null;
  getArmiesInProvince: (provinceId: string) => Army[];
  canMoveTo: (armyId: string, targetProvinceId: string) => boolean;
}

export const useProvinceGameState = (): UseProvinceGameStateReturn => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerFaction, setPlayerFaction] = useState<FactionId | null>(null);
  const [gameState, setGameState] = useState<ProvinceGameState | null>(null);

  // Start a new game
  const startGame = useCallback((selectedFaction: FactionId) => {
    const provinces = getProvincesWithAdjacency();
    const factions = createFactions(selectedFaction);
    const relations = createDiplomaticRelations(factions);
    const armies = createStartingArmies(factions, provinces);
    const eventDeck = shuffleArray(createEventDeck());
    
    const initialState: ProvinceGameState = {
      turn: 1,
      year: 1206,
      currentPlayerId: selectedFaction,
      phase: 'planning',
      provinces,
      factions,
      relations,
      armies,
      activeEvents: [],
      eventDeck,
      selectedProvinceId: null,
      selectedArmyId: null,
      gameOver: false,
      winnerId: null,
      gameSpeed: 'normal',
      difficulty: 'normal',
    };
    
    setPlayerFaction(selectedFaction);
    setGameState(initialState);
    setGameStarted(true);
  }, []);

  // Select a province
  const selectProvince = useCallback((provinceId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      return { ...prev, selectedProvinceId: provinceId, selectedArmyId: null };
    });
  }, []);

  // Select an army
  const selectArmy = useCallback((armyId: string) => {
    setGameState(prev => {
      if (!prev) return null;
      const army = prev.armies.find(a => a.id === armyId);
      return { 
        ...prev, 
        selectedArmyId: armyId,
        selectedProvinceId: army?.provinceId || prev.selectedProvinceId,
      };
    });
  }, []);

  // Check if army can move to target
  const canMoveTo = useCallback((armyId: string, targetProvinceId: string): boolean => {
    if (!gameState) return false;
    
    const army = gameState.armies.find(a => a.id === armyId);
    if (!army || army.movementLeft <= 0) return false;
    
    const currentProvince = gameState.provinces.find(p => p.id === army.provinceId);
    const targetProvince = gameState.provinces.find(p => p.id === targetProvinceId);
    
    if (!currentProvince || !targetProvince) return false;
    
    // Check adjacency
    if (!currentProvince.neighbors.includes(targetProvinceId)) return false;
    
    // Check movement cost
    const terrainInfo = PROVINCE_TERRAIN_INFO[targetProvince.terrain];
    if (army.movementLeft < terrainInfo.movementCost) return false;
    
    return true;
  }, [gameState]);

  // Move an army
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
      const movementCost = terrainInfo.movementCost;
      
      // Check for combat
      const enemyArmies = prev.armies.filter(
        a => a.provinceId === targetProvinceId && a.ownerId !== army.ownerId
      );
      
      let newArmies = [...prev.armies];
      let newProvinces = [...prev.provinces];
      
      if (enemyArmies.length > 0) {
        // Combat resolution
        const result = resolveCombat(army, enemyArmies[0], targetProvince);
        
        if (result.attackerWins) {
          // Move army and update province ownership
          newArmies[armyIndex] = {
            ...army,
            provinceId: targetProvinceId,
            movementLeft: 0,
            cavalry: army.cavalry - result.attackerCavalryLoss,
            infantry: army.infantry - result.attackerInfantryLoss,
            morale: Math.max(20, army.morale - 10),
          };
          
          // Remove or weaken defender
          const defenderIndex = newArmies.findIndex(a => a.id === enemyArmies[0].id);
          if (result.defenderDestroyed) {
            newArmies = newArmies.filter(a => a.id !== enemyArmies[0].id);
          } else {
            newArmies[defenderIndex] = {
              ...enemyArmies[0],
              cavalry: enemyArmies[0].cavalry - result.defenderCavalryLoss,
              infantry: enemyArmies[0].infantry - result.defenderInfantryLoss,
              morale: Math.max(20, enemyArmies[0].morale - 20),
            };
          }
          
          // Update province ownership
          const provinceIndex = newProvinces.findIndex(p => p.id === targetProvinceId);
          if (provinceIndex !== -1) {
            newProvinces[provinceIndex] = {
              ...newProvinces[provinceIndex],
              ownerId: army.ownerId,
              unrest: 30, // Conquest causes unrest
            };
          }
        } else {
          // Attack failed
          newArmies[armyIndex] = {
            ...army,
            movementLeft: 0,
            cavalry: army.cavalry - result.attackerCavalryLoss,
            infantry: army.infantry - result.attackerInfantryLoss,
            morale: Math.max(20, army.morale - 20),
          };
        }
      } else {
        // Peaceful movement
        newArmies[armyIndex] = {
          ...army,
          provinceId: targetProvinceId,
          movementLeft: army.movementLeft - movementCost,
        };
        
        // Claim unowned province
        if (targetProvince.ownerId === null) {
          const provinceIndex = newProvinces.findIndex(p => p.id === targetProvinceId);
          if (provinceIndex !== -1) {
            newProvinces[provinceIndex] = {
              ...newProvinces[provinceIndex],
              ownerId: army.ownerId,
            };
          }
        }
      }
      
      // Remove destroyed armies
      newArmies = newArmies.filter(a => a.cavalry + a.infantry > 0);
      
      return {
        ...prev,
        armies: newArmies,
        provinces: newProvinces,
        selectedArmyId: null,
      };
    });
  }, [canMoveTo]);

  // Combat resolution
  const resolveCombat = (
    attacker: Army, 
    defender: Army, 
    terrain: Province
  ): {
    attackerWins: boolean;
    defenderDestroyed: boolean;
    attackerCavalryLoss: number;
    attackerInfantryLoss: number;
    defenderCavalryLoss: number;
    defenderInfantryLoss: number;
  } => {
    const terrainInfo = PROVINCE_TERRAIN_INFO[terrain.terrain];
    
    // Calculate attack power
    const attackerPower = (attacker.cavalry * 3 + attacker.infantry * 1.5 + attacker.siege) 
      * (1 + attacker.leaderBonus) 
      * (attacker.morale / 100);
    
    // Calculate defense power with terrain bonus
    const defenderPower = (defender.cavalry * 2 + defender.infantry * 2 + defender.siege)
      * (1 + terrainInfo.defenseBonus * 0.2)
      * (1 + terrain.fortLevel * 0.3)
      * (defender.morale / 100);
    
    const ratio = attackerPower / defenderPower;
    const attackerWins = ratio > 0.8 + Math.random() * 0.4;
    
    // Calculate losses
    const baseLossRatio = attackerWins ? 0.2 : 0.4;
    const defenderLossRatio = attackerWins ? 0.5 : 0.2;
    
    return {
      attackerWins,
      defenderDestroyed: attackerWins && Math.random() > 0.3,
      attackerCavalryLoss: Math.floor(attacker.cavalry * baseLossRatio * Math.random()),
      attackerInfantryLoss: Math.floor(attacker.infantry * baseLossRatio * Math.random()),
      defenderCavalryLoss: Math.floor(defender.cavalry * defenderLossRatio),
      defenderInfantryLoss: Math.floor(defender.infantry * defenderLossRatio),
    };
  };

  // Propose a treaty
  const proposeTreaty = useCallback((targetFaction: FactionId, treatyType: TreatyType) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      
      const relationIndex = prev.relations.findIndex(
        r => (r.factionA === playerFaction && r.factionB === targetFaction) ||
             (r.factionB === playerFaction && r.factionA === targetFaction)
      );
      
      if (relationIndex === -1) return prev;
      
      const relation = prev.relations[relationIndex];
      
      // Check if AI accepts (based on relation and trust)
      const acceptChance = (relation.relation + 100) / 200 * (relation.trust / 100);
      const accepts = Math.random() < acceptChance + 0.2; // Slight bias to accept
      
      if (!accepts) return prev;
      
      const newTreaty: Treaty = {
        type: treatyType,
        startTurn: prev.turn,
        duration: treatyType === 'truce' ? 5 : -1,
      };
      
      const newRelations = [...prev.relations];
      newRelations[relationIndex] = {
        ...relation,
        treaties: [...relation.treaties, newTreaty],
        relation: relation.relation + 10,
        trust: relation.trust + 5,
      };
      
      return { ...prev, relations: newRelations };
    });
  }, [playerFaction]);

  // Break a treaty
  const breakTreaty = useCallback((targetFaction: FactionId, treatyType: TreatyType) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      
      const relationIndex = prev.relations.findIndex(
        r => (r.factionA === playerFaction && r.factionB === targetFaction) ||
             (r.factionB === playerFaction && r.factionA === targetFaction)
      );
      
      if (relationIndex === -1) return prev;
      
      const relation = prev.relations[relationIndex];
      const newRelations = [...prev.relations];
      
      newRelations[relationIndex] = {
        ...relation,
        treaties: relation.treaties.filter(t => t.type !== treatyType),
        relation: relation.relation - 30,
        trust: Math.max(0, relation.trust - 20),
        threat: relation.threat + 20,
      };
      
      return { ...prev, relations: newRelations };
    });
  }, [playerFaction]);

  // Build a fort
  const buildFort = useCallback((provinceId: string) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      
      const provinceIndex = prev.provinces.findIndex(p => p.id === provinceId);
      if (provinceIndex === -1) return prev;
      
      const province = prev.provinces[provinceIndex];
      if (province.ownerId !== playerFaction) return prev;
      if (province.fortLevel >= 3) return prev;
      
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction || faction.treasury < 50) return prev;
      
      const newProvinces = [...prev.provinces];
      newProvinces[provinceIndex] = {
        ...province,
        fortLevel: province.fortLevel + 1,
      };
      
      const newFactions = prev.factions.map(f => 
        f.id === playerFaction ? { ...f, treasury: f.treasury - 50 } : f
      );
      
      return { ...prev, provinces: newProvinces, factions: newFactions };
    });
  }, [playerFaction]);

  // Recruit army
  const recruitArmy = useCallback((provinceId: string) => {
    setGameState(prev => {
      if (!prev || !playerFaction) return prev;
      
      const province = prev.provinces.find(p => p.id === provinceId);
      if (!province || province.ownerId !== playerFaction) return prev;
      
      const faction = prev.factions.find(f => f.id === playerFaction);
      if (!faction || faction.treasury < 30 || faction.manpower < 10) return prev;
      
      const newArmy: Army = {
        id: generateId(),
        ownerId: playerFaction,
        provinceId,
        cavalry: 3,
        infantry: 5,
        siege: 0,
        morale: 70,
        supply: 20,
        movementLeft: 0, // Can't move on recruitment turn
        leaderBonus: 0,
      };
      
      const newFactions = prev.factions.map(f => 
        f.id === playerFaction 
          ? { ...f, treasury: f.treasury - 30, manpower: f.manpower - 10 }
          : f
      );
      
      return { 
        ...prev, 
        armies: [...prev.armies, newArmy],
        factions: newFactions,
      };
    });
  }, [playerFaction]);

  // End current phase
  const endPhase = useCallback(() => {
    setGameState(prev => {
      if (!prev) return null;
      
      const phases: GamePhase[] = ['planning', 'military', 'diplomacy', 'economy', 'event'];
      const currentIndex = phases.indexOf(prev.phase);
      
      if (currentIndex < phases.length - 1) {
        // Move to next phase
        return { ...prev, phase: phases[currentIndex + 1] };
      }
      
      // End of turn - process AI, collect resources, advance turn
      let newState = { ...prev };
      
      // Collect resources for all factions
      const newFactions = newState.factions.map(faction => {
        const ownedProvinces = newState.provinces.filter(p => p.ownerId === faction.id);
        const taxIncome = ownedProvinces.reduce((sum, p) => sum + p.baseTax, 0);
        const manpowerGain = ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0);
        
        return {
          ...faction,
          treasury: faction.treasury + taxIncome,
          manpower: faction.manpower + Math.floor(manpowerGain * 0.5),
        };
      });
      
      // Reset army movement
      const newArmies = newState.armies.map(army => ({
        ...army,
        movementLeft: 3,
        supply: Math.min(30, army.supply + 5),
      }));
      
      // Draw event (every 3 turns)
      let newEventDeck = [...newState.eventDeck];
      let newActiveEvents = [...newState.activeEvents];
      
      if (newState.turn % 3 === 0 && newEventDeck.length > 0) {
        const [drawnEvent, ...rest] = newEventDeck;
        newEventDeck = rest;
        newActiveEvents.push({
          event: drawnEvent,
          turnsRemaining: drawnEvent.duration,
          affectedFactions: [playerFaction!],
        });
      }
      
      // Tick down active events
      newActiveEvents = newActiveEvents
        .map(ae => ({ ...ae, turnsRemaining: ae.turnsRemaining - 1 }))
        .filter(ae => ae.turnsRemaining > 0 || ae.event.duration === 0);
      
      // Check victory conditions
      const playerProvinces = newState.provinces.filter(p => p.ownerId === playerFaction).length;
      const totalProvinces = newState.provinces.length;
      
      let gameOver = false;
      let winnerId: FactionId | null = null;
      
      if (playerProvinces >= totalProvinces * 0.6) {
        gameOver = true;
        winnerId = playerFaction;
      }
      
      return {
        ...newState,
        turn: newState.turn + 1,
        year: newState.year + 1,
        phase: 'planning',
        factions: newFactions,
        armies: newArmies,
        eventDeck: newEventDeck,
        activeEvents: newActiveEvents,
        gameOver,
        winnerId,
      };
    });
  }, [playerFaction]);

  // Resolve event
  const resolveEvent = useCallback((choiceIndex?: number) => {
    // Event handling would go here
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameStarted(false);
    setPlayerFaction(null);
    setGameState(null);
  }, []);

  // Helper: Get relation between two factions
  const getRelation = useCallback((factionA: FactionId, factionB: FactionId): DiplomaticRelation | null => {
    if (!gameState) return null;
    return gameState.relations.find(
      r => (r.factionA === factionA && r.factionB === factionB) ||
           (r.factionB === factionA && r.factionA === factionB)
    ) || null;
  }, [gameState]);

  // Helper: Get player faction
  const getPlayerFaction = useCallback((): Faction | null => {
    if (!gameState || !playerFaction) return null;
    return gameState.factions.find(f => f.id === playerFaction) || null;
  }, [gameState, playerFaction]);

  // Helper: Get armies in a province
  const getArmiesInProvince = useCallback((provinceId: string): Army[] => {
    if (!gameState) return [];
    return gameState.armies.filter(a => a.provinceId === provinceId);
  }, [gameState]);

  return {
    gameStarted,
    playerFaction,
    gameState,
    startGame,
    selectProvince,
    selectArmy,
    moveArmy,
    endPhase,
    resetGame,
    proposeTreaty,
    breakTreaty,
    buildFort,
    recruitArmy,
    resolveEvent,
    getRelation,
    getPlayerFaction,
    getArmiesInProvince,
    canMoveTo,
  };
};
