/**
 * useGameState.ts — Heksipohjaisen pelin tilan hallinta (vanha versio)
 *
 * Hallinnoi pelitilaa: vuorot, vaiheet, yksiköt, taistelut, resurssit,
 * rakentaminen ja tekoälyn vuorot. Käytetään MongolianGame-komponentissa.
 */
import { useState, useCallback } from 'react';
import {
  GameState,
  GamePhase,
  FactionId,
  Player,
  HexTile,
  Unit,
  Resources,
  CombatLogEntry,
  Building,
  BuildingType,
  EventCard,
  ActiveEvent,
  GameEventLog,
  AIDecision,
  FACTIONS,
  TERRAIN_INFO,
  UNIT_INFO,
  BUILDING_INFO,
  EVENT_CARDS,
  AI_PERSONALITIES,
} from '@/types/game';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Create initial hex grid - larger for more strategic depth
const createHexGrid = (): HexTile[] => {
  const hexes: HexTile[] = [];
  const gridRadius = 4;
  
  const regionData = [
    { name: 'Mongoliasteppi', terrain: 'steppe' as const },
    { name: 'Gobin autiomaa', terrain: 'desert' as const },
    { name: 'Kiinan valtakunta', terrain: 'city' as const },
    { name: 'Samarkand', terrain: 'river' as const },
    { name: 'Persianlahti', terrain: 'city' as const },
    { name: 'Venäjän metsät', terrain: 'forest' as const },
    { name: 'Vuoristopassit', terrain: 'mountain' as const },
    { name: 'Silkkitie', terrain: 'river' as const },
  ];
  
  for (let q = -gridRadius; q <= gridRadius; q++) {
    const r1 = Math.max(-gridRadius, -q - gridRadius);
    const r2 = Math.min(gridRadius, -q + gridRadius);
    
    for (let r = r1; r <= r2; r++) {
      const index = hexes.length;
      const region = regionData[index % regionData.length];
      
      // Terrain based on position for variety
      let terrain = region.terrain;
      let hasCity = false;
      
      // Center is steppe (Mongolia)
      if (Math.abs(q) + Math.abs(r) <= 1) {
        terrain = 'steppe';
      } else if (q >= 3) {
        terrain = Math.random() > 0.5 ? 'city' : 'forest';
        hasCity = terrain === 'city';
      } else if (q <= -3) {
        terrain = 'forest';
      } else if (r >= 3) {
        terrain = Math.random() > 0.5 ? 'desert' : 'river';
      } else if (r <= -3) {
        terrain = 'mountain';
      } else if (Math.abs(q - r) >= 3) {
        terrain = Math.random() > 0.6 ? 'city' : 'steppe';
        hasCity = terrain === 'city';
      }
      
      const resourceProduction: HexTile['resourceProduction'] = {};
      switch (terrain) {
        case 'steppe':
          resourceProduction.horses = 2;
          resourceProduction.cattle = 1;
          break;
        case 'city':
          resourceProduction.gold = 3;
          resourceProduction.artisans = 2;
          hasCity = true;
          break;
        case 'river':
          resourceProduction.food = 3;
          resourceProduction.gold = 1;
          break;
        case 'forest':
          resourceProduction.food = 2;
          break;
        case 'desert':
          resourceProduction.gold = 1;
          break;
        case 'mountain':
          resourceProduction.artisans = 1;
          break;
      }
      
      hexes.push({
        id: `hex-${q}-${r}`,
        q,
        r,
        terrain,
        regionName: region.name,
        ownerId: null,
        units: [],
        buildings: [],
        hasCity,
        hasFortress: false,
        hasTradeRoute: terrain === 'city' || terrain === 'river',
        resourceProduction,
        defenseBonus: TERRAIN_INFO[terrain].defenseBonus,
      });
    }
  }
  
  return hexes;
};

const createStartingUnits = (factionId: FactionId, startHexId: string): Unit[] => {
  const units: Unit[] = [];
  
  // 3 cavalry
  for (let i = 0; i < 3; i++) {
    units.push({
      id: `${factionId}-cavalry-${i}`,
      type: 'cavalry',
      factionId,
      hexId: startHexId,
      health: 3,
      maxHealth: 3,
      movementLeft: UNIT_INFO.cavalry.baseMovement,
      maxMovement: UNIT_INFO.cavalry.baseMovement,
      attackPower: UNIT_INFO.cavalry.basePower,
      hasActed: false,
    });
  }
  
  // 2 infantry
  for (let i = 0; i < 2; i++) {
    units.push({
      id: `${factionId}-infantry-${i}`,
      type: 'infantry',
      factionId,
      hexId: startHexId,
      health: 2,
      maxHealth: 2,
      movementLeft: UNIT_INFO.infantry.baseMovement,
      maxMovement: UNIT_INFO.infantry.baseMovement,
      attackPower: UNIT_INFO.infantry.basePower,
      hasActed: false,
    });
  }
  
  // 1 leader
  units.push({
    id: `${factionId}-leader-0`,
    type: 'leader',
    factionId,
    hexId: startHexId,
    health: 5,
    maxHealth: 5,
    movementLeft: UNIT_INFO.leader.baseMovement,
    maxMovement: UNIT_INFO.leader.baseMovement,
    attackPower: UNIT_INFO.leader.basePower,
    hasActed: false,
  });
  
  return units;
};

const getAIPersonality = (factionId: FactionId): 'aggressive' | 'defensive' | 'economic' | 'balanced' => {
  const personalities: Record<FactionId, 'aggressive' | 'defensive' | 'economic' | 'balanced'> = {
    mongol: 'aggressive',
    china: 'defensive',
    persia: 'economic',
    russia: 'balanced',
  };
  return personalities[factionId];
};

const createInitialPlayer = (factionId: FactionId, isAI: boolean): Player => ({
  id: `player-${factionId}`,
  factionId,
  resources: {
    horses: 5,
    gold: 10,
    food: 8,
    artisans: 3,
    cattle: 4,
  },
  victoryPoints: 0,
  territoriesControlled: 1,
  citiesControlled: 0,
  tradeRoutes: 0,
  technologies: [],
  isAI,
  aiPersonality: getAIPersonality(factionId),
});

const STARTING_POSITIONS: Record<FactionId, { q: number; r: number }> = {
  mongol: { q: 0, r: 0 },
  china: { q: 4, r: -2 },
  persia: { q: -2, r: 4 },
  russia: { q: -4, r: 1 },
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// AI Logic
const evaluateHexValue = (hex: HexTile, player: Player): number => {
  let value = 0;
  
  // Resource value
  Object.entries(hex.resourceProduction).forEach(([resource, amount]) => {
    if (amount) value += amount * 2;
  });
  
  // City bonus
  if (hex.hasCity) value += 10;
  
  // Trade route bonus
  if (hex.hasTradeRoute) value += 5;
  
  // Strategic position (center is valuable)
  const distanceFromCenter = Math.abs(hex.q) + Math.abs(hex.r);
  value += Math.max(0, 5 - distanceFromCenter);
  
  return value;
};

const calculateAIDecisions = (gameState: GameState, player: Player): AIDecision[] => {
  const decisions: AIDecision[] = [];
  const personality = AI_PERSONALITIES[player.aiPersonality];
  const playerUnits = gameState.units.filter(u => u.factionId === player.factionId && !u.hasActed);
  
  for (const unit of playerUnits) {
    const currentHex = gameState.hexes.find(h => h.id === unit.hexId);
    if (!currentHex || unit.movementLeft <= 0) continue;
    
    // Find available moves
    const availableMoves = gameState.hexes.filter(hex => {
      if (hex.id === unit.hexId) return false;
      const distance = Math.max(
        Math.abs(hex.q - currentHex.q),
        Math.abs(hex.r - currentHex.r),
        Math.abs((-hex.q - hex.r) - (-currentHex.q - currentHex.r))
      );
      return distance <= unit.movementLeft;
    });
    
    for (const targetHex of availableMoves) {
      const enemyUnits = gameState.units.filter(u => u.hexId === targetHex.id && u.factionId !== player.factionId);
      const isEnemy = enemyUnits.length > 0;
      const hexValue = evaluateHexValue(targetHex, player);
      
      if (isEnemy && personality.aggressiveness > 0.5) {
        // Attack decision
        const enemyPower = enemyUnits.reduce((sum, u) => sum + u.attackPower, 0);
        const attackAdvantage = unit.attackPower - enemyPower + targetHex.defenseBonus;
        
        if (attackAdvantage > -1 || Math.random() < personality.aggressiveness) {
          decisions.push({
            type: 'attack',
            priority: hexValue + attackAdvantage * 3 + personality.aggressiveness * 10,
            unitId: unit.id,
            targetHexId: targetHex.id,
            reasoning: `Hyökkää kohteeseen ${targetHex.regionName} (arvo: ${hexValue.toFixed(1)})`,
          });
        }
      } else if (!isEnemy && targetHex.ownerId !== player.factionId) {
        // Expansion decision
        decisions.push({
          type: 'move',
          priority: hexValue * personality.expansionism,
          unitId: unit.id,
          targetHexId: targetHex.id,
          reasoning: `Laajenna kohteeseen ${targetHex.regionName} (arvo: ${hexValue.toFixed(1)})`,
        });
      }
    }
  }
  
  // Building decisions
  if (personality.economicFocus > 0.4 && player.resources.gold >= 5) {
    const ownedHexes = gameState.hexes.filter(h => h.ownerId === player.factionId && h.buildings.length === 0);
    
    for (const hex of ownedHexes) {
      if (hex.hasCity && player.resources.gold >= 5 && player.resources.artisans >= 2) {
        decisions.push({
          type: 'build',
          priority: 15 * personality.economicFocus,
          targetHexId: hex.id,
          buildingType: 'market',
          reasoning: `Rakenna kauppatori kohteeseen ${hex.regionName}`,
        });
      } else if (hex.terrain === 'steppe' && player.resources.gold >= 4 && player.resources.food >= 3) {
        decisions.push({
          type: 'build',
          priority: 12 * personality.economicFocus,
          targetHexId: hex.id,
          buildingType: 'stable',
          reasoning: `Rakenna talli kohteeseen ${hex.regionName}`,
        });
      }
    }
  }
  
  // Recruit decisions
  if (player.resources.gold >= 2 && player.resources.food >= 2) {
    const capitalHex = gameState.hexes.find(h => 
      h.ownerId === player.factionId && 
      h.q === STARTING_POSITIONS[player.factionId].q && 
      h.r === STARTING_POSITIONS[player.factionId].r
    );
    
    if (capitalHex && personality.aggressiveness > 0.3) {
      decisions.push({
        type: 'recruit',
        priority: 8 * personality.aggressiveness,
        targetHexId: capitalHex.id,
        reasoning: 'Rekrytoi uusia yksiköitä',
      });
    }
  }
  
  // Sort by priority
  decisions.sort((a, b) => b.priority - a.priority);
  
  return decisions.slice(0, 3); // Return top 3 decisions
};

export const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerFaction, setPlayerFaction] = useState<FactionId | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const startGame = useCallback((selectedFaction: FactionId) => {
    const hexes = createHexGrid();
    const allUnits: Unit[] = [];
    const players: Player[] = [];
    
    // Create human player
    const humanPlayer = createInitialPlayer(selectedFaction, false);
    players.push(humanPlayer);
    
    // Set up human player start
    const humanStartPos = STARTING_POSITIONS[selectedFaction];
    const humanStartHex = hexes.find(h => h.q === humanStartPos.q && h.r === humanStartPos.r);
    if (humanStartHex) {
      const humanUnits = createStartingUnits(selectedFaction, humanStartHex.id);
      allUnits.push(...humanUnits);
      humanStartHex.ownerId = selectedFaction;
      humanStartHex.units = humanUnits.map(u => u.id);
    }
    
    // Create AI opponents
    const aiFactions = (Object.keys(FACTIONS) as FactionId[]).filter(f => f !== selectedFaction);
    aiFactions.forEach(factionId => {
      const aiPlayer = createInitialPlayer(factionId, true);
      players.push(aiPlayer);
      
      const startPos = STARTING_POSITIONS[factionId];
      const startHex = hexes.find(h => h.q === startPos.q && h.r === startPos.r);
      if (startHex) {
        const aiUnits = createStartingUnits(factionId, startHex.id);
        allUnits.push(...aiUnits);
        startHex.ownerId = factionId;
        startHex.units = aiUnits.map(u => u.id);
      }
    });
    
    const initialState: GameState = {
      players,
      currentPlayerId: humanPlayer.id,
      currentPhase: 'planning',
      turn: 1,
      maxTurns: 30,
      hexes,
      units: allUnits,
      buildings: [],
      selectedUnitId: null,
      selectedHexId: null,
      availableMoves: [],
      combatLog: [],
      eventLog: [],
      activeEvents: [],
      eventDeck: shuffleArray([...EVENT_CARDS]),
      currentEvent: null,
      gameOver: false,
      winnerId: null,
      winCondition: null,
      showEventModal: false,
      showBuildMenu: false,
      aiThinking: false,
      lastAIActions: [],
      cameraAngle: 0,
      gameSpeed: 'normal',
    };
    
    setPlayerFaction(selectedFaction);
    setGameState(initialState);
    setGameStarted(true);
  }, []);

  const addEventLog = useCallback((
    type: GameEventLog['type'],
    message: string,
    factionId?: FactionId
  ) => {
    setGameState(prev => {
      if (!prev) return null;
      const newEvent: GameEventLog = {
        id: generateId(),
        turn: prev.turn,
        type,
        message,
        factionId,
        timestamp: Date.now(),
      };
      return {
        ...prev,
        eventLog: [...prev.eventLog.slice(-50), newEvent],
      };
    });
  }, []);

  const selectHex = useCallback((hexId: string) => {
    if (!gameState) return;
    
    const hex = gameState.hexes.find(h => h.id === hexId);
    if (!hex) return;
    
    // If we have a selected unit and click on a valid move hex
    if (gameState.selectedUnitId && gameState.availableMoves.includes(hexId)) {
      moveUnit(gameState.selectedUnitId, hexId);
      return;
    }
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer || currentPlayer.isAI) return;
    
    const unitsOnHex = gameState.units.filter(
      u => u.hexId === hexId && u.factionId === currentPlayer.factionId && !u.hasActed
    );
    
    if (unitsOnHex.length > 0 && gameState.currentPhase === 'action') {
      const selectedUnit = unitsOnHex[0];
      const availableMoves = calculateAvailableMoves(selectedUnit, gameState.hexes, gameState.units);
      
      setGameState(prev => prev ? {
        ...prev,
        selectedUnitId: selectedUnit.id,
        selectedHexId: hexId,
        availableMoves,
      } : null);
    } else {
      setGameState(prev => prev ? {
        ...prev,
        selectedUnitId: null,
        selectedHexId: hexId,
        availableMoves: [],
        showBuildMenu: hex.ownerId === currentPlayer?.factionId && gameState.currentPhase === 'building',
      } : null);
    }
  }, [gameState]);

  const calculateAvailableMoves = (unit: Unit, hexes: HexTile[], units: Unit[]): string[] => {
    const currentHex = hexes.find(h => h.id === unit.hexId);
    if (!currentHex || unit.movementLeft <= 0) return [];
    
    const moves: string[] = [];
    
    hexes.forEach(hex => {
      if (hex.id === unit.hexId) return;
      
      const distance = Math.max(
        Math.abs(hex.q - currentHex.q),
        Math.abs(hex.r - currentHex.r),
        Math.abs((-hex.q - hex.r) - (-currentHex.q - currentHex.r))
      );
      
      const movementCost = TERRAIN_INFO[hex.terrain].movementCost;
      
      if (distance * movementCost <= unit.movementLeft) {
        moves.push(hex.id);
      }
    });
    
    return moves;
  };

  const moveUnit = useCallback((unitId: string, targetHexId: string) => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const unitIndex = prev.units.findIndex(u => u.id === unitId);
      if (unitIndex === -1) return prev;
      
      const unit = prev.units[unitIndex];
      const sourceHex = prev.hexes.find(h => h.id === unit.hexId);
      const targetHex = prev.hexes.find(h => h.id === targetHexId);
      
      if (!sourceHex || !targetHex) return prev;
      
      const enemyUnits = prev.units.filter(u => u.hexId === targetHexId && u.factionId !== unit.factionId);
      
      if (enemyUnits.length > 0) {
        return resolveCombat(prev, unit, enemyUnits, targetHex);
      }
      
      const movementCost = TERRAIN_INFO[targetHex.terrain].movementCost;
      const newUnits = [...prev.units];
      newUnits[unitIndex] = {
        ...unit,
        hexId: targetHexId,
        movementLeft: Math.max(0, unit.movementLeft - movementCost),
        hasActed: true,
      };
      
      const newHexes = prev.hexes.map(h => {
        if (h.id === sourceHex.id) {
          return { ...h, units: h.units.filter(id => id !== unitId) };
        }
        if (h.id === targetHexId) {
          return { 
            ...h, 
            units: [...h.units, unitId],
            ownerId: unit.factionId,
          };
        }
        return h;
      });
      
      return {
        ...prev,
        units: newUnits,
        hexes: newHexes,
        selectedUnitId: null,
        selectedHexId: null,
        availableMoves: [],
      };
    });
  }, [gameState]);

  const resolveCombat = (state: GameState, attacker: Unit, defenders: Unit[], hex: HexTile): GameState => {
    const attackerDice = Math.min(6, attacker.attackPower);
    const defenderPower = defenders.reduce((sum, d) => sum + d.attackPower, 0);
    const defenderDice = Math.min(6, defenderPower + hex.defenseBonus);
    
    const attackerRolls = Array.from({ length: attackerDice }, () => Math.floor(Math.random() * 6) + 1);
    const defenderRolls = Array.from({ length: defenderDice }, () => Math.floor(Math.random() * 6) + 1);
    
    const attackerHits = attackerRolls.filter(r => r >= 4).length;
    const defenderHits = defenderRolls.filter(r => r >= 4).length;
    
    let newUnits = [...state.units];
    let attackerLosses = 0;
    let defenderLosses = 0;
    
    const attackerIndex = newUnits.findIndex(u => u.id === attacker.id);
    if (attackerIndex !== -1) {
      const newHealth = newUnits[attackerIndex].health - defenderHits;
      if (newHealth <= 0) {
        newUnits = newUnits.filter(u => u.id !== attacker.id);
        attackerLosses = 1;
      } else {
        newUnits[attackerIndex] = { ...newUnits[attackerIndex], health: newHealth, hasActed: true };
      }
    }
    
    let remainingHits = attackerHits;
    defenders.forEach(defender => {
      if (remainingHits <= 0) return;
      
      const defIndex = newUnits.findIndex(u => u.id === defender.id);
      if (defIndex !== -1) {
        const newHealth = newUnits[defIndex].health - remainingHits;
        if (newHealth <= 0) {
          newUnits = newUnits.filter(u => u.id !== defender.id);
          defenderLosses++;
          remainingHits = Math.abs(newHealth);
        } else {
          newUnits[defIndex] = { ...newUnits[defIndex], health: newHealth };
          remainingHits = 0;
        }
      }
    });
    
    const result: CombatLogEntry['result'] = 
      defenderLosses > attackerLosses ? 'attacker_wins' : 
      attackerLosses > defenderLosses ? 'defender_wins' : 'draw';
    
    const combatEntry: CombatLogEntry = {
      id: generateId(),
      turn: state.turn,
      attackerId: attacker.factionId,
      defenderId: defenders[0].factionId,
      attackerUnits: 1,
      defenderUnits: defenders.length,
      attackerRolls,
      defenderRolls,
      attackerLosses,
      defenderLosses,
      hexId: hex.id,
      result,
      timestamp: Date.now(),
    };
    
    const attackerSurvived = newUnits.some(u => u.id === attacker.id);
    const defendersRemain = newUnits.some(u => defenders.some(d => d.id === u.id));
    
    let newHexes = state.hexes;
    if (attackerSurvived && !defendersRemain) {
      const sourceHex = state.hexes.find(h => h.id === attacker.hexId);
      newHexes = state.hexes.map(h => {
        if (h.id === sourceHex?.id) {
          return { ...h, units: h.units.filter(id => id !== attacker.id) };
        }
        if (h.id === hex.id) {
          return { 
            ...h, 
            units: [attacker.id],
            ownerId: attacker.factionId,
          };
        }
        return h;
      });
      
      const attackerIdx = newUnits.findIndex(u => u.id === attacker.id);
      if (attackerIdx !== -1) {
        newUnits[attackerIdx] = { ...newUnits[attackerIdx], hexId: hex.id, movementLeft: 0, hasActed: true };
      }
    }
    
    return {
      ...state,
      units: newUnits,
      hexes: newHexes,
      combatLog: [...state.combatLog, combatEntry],
      selectedUnitId: null,
      selectedHexId: null,
      availableMoves: [],
    };
  };

  const buildStructure = useCallback((hexId: string, buildingType: BuildingType) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer) return;
    
    const buildingInfo = BUILDING_INFO[buildingType];
    const cost = buildingInfo.cost;
    
    // Check resources
    let canAfford = true;
    (Object.entries(cost) as [keyof Resources, number][]).forEach(([resource, amount]) => {
      if (currentPlayer.resources[resource] < amount) canAfford = false;
    });
    
    if (!canAfford) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const newBuilding: Building = {
        id: generateId(),
        type: buildingType,
        hexId,
        ownerId: currentPlayer.factionId,
        health: 5,
        maxHealth: 5,
        level: 1,
      };
      
      // Deduct resources
      const newPlayers = prev.players.map(p => {
        if (p.id !== currentPlayer.id) return p;
        const newResources = { ...p.resources };
        (Object.entries(cost) as [keyof Resources, number][]).forEach(([resource, amount]) => {
          newResources[resource] -= amount;
        });
        return { ...p, resources: newResources };
      });
      
      // Update hex
      const newHexes = prev.hexes.map(h => {
        if (h.id !== hexId) return h;
        return {
          ...h,
          buildings: [...h.buildings, newBuilding.id],
          defenseBonus: h.defenseBonus + buildingInfo.defenseBonus,
          hasFortress: buildingType === 'fortress' ? true : h.hasFortress,
        };
      });
      
      return {
        ...prev,
        players: newPlayers,
        hexes: newHexes,
        buildings: [...prev.buildings, newBuilding],
        showBuildMenu: false,
      };
    });
  }, [gameState]);

  const executeAITurn = useCallback(async () => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer || !currentPlayer.isAI) return;
    
    setGameState(prev => prev ? { ...prev, aiThinking: true } : null);
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const decisions = calculateAIDecisions(gameState, currentPlayer);
    
    setGameState(prev => {
      if (!prev) return null;
      
      let newState = { ...prev, lastAIActions: decisions };
      
      // Execute top decision
      for (const decision of decisions.slice(0, 2)) {
        if (decision.type === 'move' || decision.type === 'attack') {
          if (decision.unitId && decision.targetHexId) {
            const unit = newState.units.find(u => u.id === decision.unitId);
            if (unit && !unit.hasActed) {
              const targetHex = newState.hexes.find(h => h.id === decision.targetHexId);
              if (targetHex) {
                const enemyUnits = newState.units.filter(
                  u => u.hexId === decision.targetHexId && u.factionId !== unit.factionId
                );
                
                if (enemyUnits.length > 0) {
                  newState = resolveCombat(newState, unit, enemyUnits, targetHex);
                } else {
                  // Simple move
                  const sourceHex = newState.hexes.find(h => h.id === unit.hexId);
                  const unitIndex = newState.units.findIndex(u => u.id === unit.id);
                  
                  if (sourceHex && unitIndex !== -1) {
                    const newUnits = [...newState.units];
                    newUnits[unitIndex] = { ...unit, hexId: decision.targetHexId!, hasActed: true, movementLeft: 0 };
                    
                    const newHexes = newState.hexes.map(h => {
                      if (h.id === sourceHex.id) {
                        return { ...h, units: h.units.filter(id => id !== unit.id) };
                      }
                      if (h.id === decision.targetHexId) {
                        return { ...h, units: [...h.units, unit.id], ownerId: unit.factionId };
                      }
                      return h;
                    });
                    
                    newState = { ...newState, units: newUnits, hexes: newHexes };
                  }
                }
              }
            }
          }
        }
      }
      
      return { ...newState, aiThinking: false };
    });
  }, [gameState]);

  const drawEventCard = useCallback(() => {
    if (!gameState || gameState.eventDeck.length === 0) return;
    
    setGameState(prev => {
      if (!prev || prev.eventDeck.length === 0) return prev;
      
      const [drawnEvent, ...remainingDeck] = prev.eventDeck;
      
      return {
        ...prev,
        currentEvent: drawnEvent,
        eventDeck: remainingDeck,
        showEventModal: true,
      };
    });
  }, [gameState]);

  const resolveEvent = useCallback(() => {
    if (!gameState || !gameState.currentEvent) return;
    
    setGameState(prev => {
      if (!prev || !prev.currentEvent) return prev;
      
      const event = prev.currentEvent;
      let newPlayers = [...prev.players];
      const newUnits = [...prev.units];
      
      // Apply event effects
      switch (event.type) {
        case 'harvest':
          newPlayers = newPlayers.map(p => ({
            ...p,
            resources: { ...p.resources, food: p.resources.food + 5 },
          }));
          break;
        case 'trade_boom':
          newPlayers = newPlayers.map(p => ({
            ...p,
            resources: { ...p.resources, gold: p.resources.gold + p.tradeRoutes * 3 },
          }));
          break;
        case 'plague':
          newPlayers = newPlayers.map(p => ({
            ...p,
            resources: { ...p.resources, food: Math.max(0, p.resources.food - 2) },
          }));
          break;
        case 'mongol_horde':
          if (event.targetFaction === 'mongol') {
            const mongolPlayer = newPlayers.find(p => p.factionId === 'mongol');
            if (mongolPlayer) {
              const startHex = prev.hexes.find(h => h.ownerId === 'mongol');
              if (startHex) {
                for (let i = 0; i < 2; i++) {
                  newUnits.push({
                    id: `mongol-bonus-cavalry-${generateId()}`,
                    type: 'cavalry',
                    factionId: 'mongol',
                    hexId: startHex.id,
                    health: 3,
                    maxHealth: 3,
                    movementLeft: 3,
                    maxMovement: 3,
                    attackPower: 3,
                    hasActed: true,
                  });
                }
              }
            }
          }
          break;
        case 'alliance': {
          const currentPlayer = newPlayers.find(p => p.id === prev.currentPlayerId);
          if (currentPlayer) {
            newPlayers = newPlayers.map(p => 
              p.id === currentPlayer.id 
                ? { ...p, resources: { ...p.resources, gold: p.resources.gold + 10 }, victoryPoints: p.victoryPoints + 5 }
                : p
            );
          }
          break;
        }
      }
      
      const activeEvent: ActiveEvent = {
        event,
        turnsRemaining: event.duration,
        affectedFactions: event.affectsAll 
          ? newPlayers.map(p => p.factionId) 
          : event.targetFaction 
            ? [event.targetFaction]
            : [newPlayers.find(p => p.id === prev.currentPlayerId)?.factionId || 'mongol'],
      };
      
      return {
        ...prev,
        players: newPlayers,
        units: newUnits,
        currentEvent: null,
        showEventModal: false,
        activeEvents: [...prev.activeEvents, activeEvent],
        eventLog: [...prev.eventLog, {
          id: generateId(),
          turn: prev.turn,
          type: 'event' as const,
          message: `${event.name}: ${event.effect}`,
          timestamp: Date.now(),
        }],
      };
    });
  }, [gameState]);

  const endPhase = useCallback(async () => {
    if (!gameState) return;
    
    const phases: GamePhase[] = ['planning', 'action', 'building', 'event', 'management'];
    const currentIndex = phases.indexOf(gameState.currentPhase);
    const nextIndex = (currentIndex + 1) % phases.length;
    
    // If entering event phase, draw a card
    if (phases[nextIndex] === 'event' && gameState.eventDeck.length > 0) {
      drawEventCard();
      setGameState(prev => prev ? { ...prev, currentPhase: 'event' } : null);
      return;
    }
    
    setGameState(prev => {
      if (!prev) return null;
      
      let newState = { ...prev, currentPhase: phases[nextIndex] };
      
      // If completing all phases, go to next player/turn
      if (nextIndex === 0) {
        newState = endTurnForPlayer(newState);
      }
      
      // Handle phase-specific logic
      if (phases[nextIndex] === 'management') {
        newState = collectResources(newState);
      }
      
      return newState;
    });
    
    // If next player is AI, execute their turn
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (currentPlayer?.isAI && phases[nextIndex] === 'action') {
      await executeAITurn();
    }
  }, [gameState, drawEventCard, executeAITurn, endTurnForPlayer]);

  const endTurnForPlayer = useCallback((state: GameState): GameState => {
    const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
    const isNewTurn = nextPlayerIndex === 0;
    
    // Reset units for next player
    const nextPlayer = state.players[nextPlayerIndex];
    const newUnits = state.units.map(u => ({
      ...u,
      movementLeft: u.factionId === nextPlayer.factionId ? u.maxMovement : u.movementLeft,
      hasActed: u.factionId === nextPlayer.factionId ? false : u.hasActed,
    }));
    
    // Decrement active events
    const newActiveEvents = state.activeEvents
      .map(ae => ({ ...ae, turnsRemaining: isNewTurn ? ae.turnsRemaining - 1 : ae.turnsRemaining }))
      .filter(ae => ae.turnsRemaining > 0);
    
    // Check victory conditions
    const winCheck = checkVictoryConditions(state);
    
    return {
      ...state,
      currentPlayerId: state.players[nextPlayerIndex].id,
      turn: isNewTurn ? state.turn + 1 : state.turn,
      units: newUnits,
      activeEvents: newActiveEvents,
      currentPhase: 'planning',
      ...winCheck,
    };
  }, []);

  const collectResources = (state: GameState): GameState => {
    const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
    if (!currentPlayer) return state;
    
    const controlledHexes = state.hexes.filter(h => h.ownerId === currentPlayer.factionId);
    
    const resourceGains: Resources = {
      horses: 0,
      gold: 0,
      food: 0,
      artisans: 0,
      cattle: 0,
    };
    
    controlledHexes.forEach(hex => {
      Object.entries(hex.resourceProduction).forEach(([resource, amount]) => {
        if (amount) {
          resourceGains[resource as keyof Resources] += amount;
        }
      });
      
      // Building bonuses
      hex.buildings.forEach(buildingId => {
        const building = state.buildings.find(b => b.id === buildingId);
        if (building) {
          const info = BUILDING_INFO[building.type];
          Object.entries(info.resourceBonus).forEach(([resource, amount]) => {
            if (amount) {
              resourceGains[resource as keyof Resources] += amount;
            }
          });
        }
      });
    });
    
    // Faction bonuses
    if (currentPlayer.factionId === 'persia') {
      const tradeHexes = controlledHexes.filter(h => h.hasTradeRoute);
      resourceGains.gold += tradeHexes.length * 2;
      resourceGains.artisans += tradeHexes.length;
    }
    
    const newPlayers = state.players.map(p => {
      if (p.id !== currentPlayer.id) return p;
      
      return {
        ...p,
        resources: {
          horses: p.resources.horses + resourceGains.horses,
          gold: p.resources.gold + resourceGains.gold,
          food: p.resources.food + resourceGains.food,
          artisans: p.resources.artisans + resourceGains.artisans,
          cattle: p.resources.cattle + resourceGains.cattle,
        },
        territoriesControlled: controlledHexes.length,
        citiesControlled: controlledHexes.filter(h => h.hasCity).length,
        tradeRoutes: controlledHexes.filter(h => h.hasTradeRoute).length,
        victoryPoints: p.victoryPoints + controlledHexes.filter(h => h.hasCity).length,
      };
    });
    
    return { ...state, players: newPlayers };
  };

  const checkVictoryConditions = (state: GameState): { gameOver: boolean; winnerId: string | null; winCondition: string | null } => {
    // Turn limit
    if (state.turn >= state.maxTurns) {
      const winner = state.players.reduce((prev, current) => 
        (prev.victoryPoints > current.victoryPoints) ? prev : current
      );
      return { 
        gameOver: true, 
        winnerId: winner.id, 
        winCondition: `Voittopisteet: ${winner.victoryPoints} (${FACTIONS[winner.factionId].name})` 
      };
    }
    
    for (const player of state.players) {
      // Military victory: control 60% of cities
      const totalCities = state.hexes.filter(h => h.hasCity).length;
      const playerCities = state.hexes.filter(h => h.hasCity && h.ownerId === player.factionId).length;
      
      if (totalCities > 0 && playerCities >= totalCities * 0.6) {
        return { 
          gameOver: true, 
          winnerId: player.id, 
          winCondition: `Sotilaallinen Voitto: ${FACTIONS[player.factionId].name} hallitsee ${playerCities}/${totalCities} kaupunkia` 
        };
      }
      
      // Economic victory
      if (player.victoryPoints >= 50 && player.tradeRoutes >= 5) {
        return { 
          gameOver: true, 
          winnerId: player.id, 
          winCondition: `Ekonominen Voitto: ${FACTIONS[player.factionId].name} - Silkkitien Herra` 
        };
      }
      
      // Domination: last faction standing
      const activeFactions = new Set(state.units.map(u => u.factionId));
      if (activeFactions.size === 1 && activeFactions.has(player.factionId)) {
        return {
          gameOver: true,
          winnerId: player.id,
          winCondition: `Täydellinen Voitto: ${FACTIONS[player.factionId].name} on valloittanut kaikki!`
        };
      }
    }
    
    return { gameOver: false, winnerId: null, winCondition: null };
  };

  const recruitUnit = useCallback((hexId: string, unitType: 'cavalry' | 'infantry') => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer) return;
    
    const cost = UNIT_INFO[unitType].cost;
    
    // Check resources
    let canAfford = true;
    (Object.entries(cost) as [keyof Resources, number][]).forEach(([resource, amount]) => {
      if (currentPlayer.resources[resource] < amount) canAfford = false;
    });
    
    if (!canAfford) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const newUnit: Unit = {
        id: `${currentPlayer.factionId}-${unitType}-${generateId()}`,
        type: unitType,
        factionId: currentPlayer.factionId,
        hexId,
        health: UNIT_INFO[unitType].basePower,
        maxHealth: UNIT_INFO[unitType].basePower,
        movementLeft: 0,
        maxMovement: UNIT_INFO[unitType].baseMovement,
        attackPower: UNIT_INFO[unitType].basePower,
        hasActed: true,
      };
      
      // Deduct resources
      const newPlayers = prev.players.map(p => {
        if (p.id !== currentPlayer.id) return p;
        const newResources = { ...p.resources };
        (Object.entries(cost) as [keyof Resources, number][]).forEach(([resource, amount]) => {
          newResources[resource] -= amount;
        });
        return { ...p, resources: newResources };
      });
      
      // Update hex
      const newHexes = prev.hexes.map(h => {
        if (h.id !== hexId) return h;
        return { ...h, units: [...h.units, newUnit.id] };
      });
      
      return {
        ...prev,
        players: newPlayers,
        hexes: newHexes,
        units: [...prev.units, newUnit],
      };
    });
  }, [gameState]);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setPlayerFaction(null);
    setGameState(null);
  }, []);

  const rotateCameraLeft = useCallback(() => {
    setGameState(prev => prev ? { ...prev, cameraAngle: prev.cameraAngle - 15 } : null);
  }, []);

  const rotateCameraRight = useCallback(() => {
    setGameState(prev => prev ? { ...prev, cameraAngle: prev.cameraAngle + 15 } : null);
  }, []);

  return {
    gameStarted,
    playerFaction,
    gameState,
    startGame,
    selectHex,
    moveUnit,
    endPhase,
    resetGame,
    buildStructure,
    recruitUnit,
    resolveEvent,
    rotateCameraLeft,
    rotateCameraRight,
  };
};
