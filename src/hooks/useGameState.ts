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
  FACTIONS,
  TERRAIN_INFO,
  UNIT_INFO,
} from '@/types/game';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Create initial hex grid
const createHexGrid = (): HexTile[] => {
  const hexes: HexTile[] = [];
  const regions = [
    { name: 'Mongoliasteppi', terrain: 'steppe' as const, hasCity: false },
    { name: 'Gobin autiomaa', terrain: 'desert' as const, hasCity: false },
    { name: 'Kiinan valtakunta', terrain: 'city' as const, hasCity: true },
    { name: 'Samarkand', terrain: 'city' as const, hasCity: true },
    { name: 'Persianlahti', terrain: 'river' as const, hasCity: true },
    { name: 'Venäjän metsät', terrain: 'forest' as const, hasCity: false },
    { name: 'Vuoristopassit', terrain: 'mountain' as const, hasCity: false },
  ];

  // Create a smaller hex grid for playability (7 rings)
  const gridRadius = 3;
  
  for (let q = -gridRadius; q <= gridRadius; q++) {
    const r1 = Math.max(-gridRadius, -q - gridRadius);
    const r2 = Math.min(gridRadius, -q + gridRadius);
    
    for (let r = r1; r <= r2; r++) {
      const index = hexes.length;
      const region = regions[index % regions.length];
      
      // Determine terrain and features based on position
      let terrain = region.terrain;
      let hasCity = region.hasCity && Math.random() > 0.7;
      
      // Assign terrain based on position for variety
      if (Math.abs(q) + Math.abs(r) <= 1) {
        terrain = 'steppe'; // Center is steppe
      } else if (q > 2) {
        terrain = 'city';
        hasCity = true;
      } else if (q < -2) {
        terrain = 'forest';
      } else if (r > 2) {
        terrain = 'desert';
      } else if (r < -2) {
        terrain = 'mountain';
      }
      
      const resourceProduction: HexTile['resourceProduction'] = {};
      if (terrain === 'steppe') {
        resourceProduction.horses = 2;
        resourceProduction.cattle = 1;
      } else if (terrain === 'city') {
        resourceProduction.gold = 2;
        resourceProduction.artisans = 1;
      } else if (terrain === 'river') {
        resourceProduction.food = 2;
        resourceProduction.gold = 1;
      } else if (terrain === 'forest') {
        resourceProduction.food = 1;
      }
      
      hexes.push({
        id: `hex-${q}-${r}`,
        q,
        r,
        terrain,
        regionName: region.name,
        ownerId: null,
        units: [],
        hasCity,
        hasFortress: false,
        hasTradeRoute: terrain === 'city' || terrain === 'river',
        resourceProduction,
      });
    }
  }
  
  return hexes;
};

// Create starting units for a faction
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
  });
  
  return units;
};

const createInitialPlayer = (factionId: FactionId): Player => ({
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
  isAI: false,
});

// Starting positions for each faction
const STARTING_POSITIONS: Record<FactionId, { q: number; r: number }> = {
  mongol: { q: 0, r: 0 },
  china: { q: 3, r: -1 },
  persia: { q: -2, r: 3 },
  russia: { q: -3, r: 0 },
};

export const useGameState = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerFaction, setPlayerFaction] = useState<FactionId | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const startGame = useCallback((selectedFaction: FactionId) => {
    const hexes = createHexGrid();
    const allUnits: Unit[] = [];
    const players: Player[] = [];
    
    // Create player
    const humanPlayer = createInitialPlayer(selectedFaction);
    players.push(humanPlayer);
    
    // Get starting hex for human player
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
      const aiPlayer = { ...createInitialPlayer(factionId), isAI: true };
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
      hexes,
      units: allUnits,
      selectedUnitId: null,
      selectedHexId: null,
      availableMoves: [],
      combatLog: [],
      gameOver: false,
      winnerId: null,
      winCondition: null,
    };
    
    setPlayerFaction(selectedFaction);
    setGameState(initialState);
    setGameStarted(true);
  }, []);

  const selectHex = useCallback((hexId: string) => {
    if (!gameState) return;
    
    const hex = gameState.hexes.find(h => h.id === hexId);
    if (!hex) return;
    
    // If we have a selected unit and click on a valid move hex, move the unit
    if (gameState.selectedUnitId && gameState.availableMoves.includes(hexId)) {
      moveUnit(gameState.selectedUnitId, hexId);
      return;
    }
    
    // Select units on this hex if they belong to current player
    const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
    if (!currentPlayer) return;
    
    const unitsOnHex = gameState.units.filter(u => u.hexId === hexId && u.factionId === currentPlayer.factionId);
    
    if (unitsOnHex.length > 0) {
      const selectedUnit = unitsOnHex[0];
      const availableMoves = calculateAvailableMoves(selectedUnit, gameState.hexes);
      
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
      } : null);
    }
  }, [gameState]);

  const calculateAvailableMoves = (unit: Unit, hexes: HexTile[]): string[] => {
    const currentHex = hexes.find(h => h.id === unit.hexId);
    if (!currentHex || unit.movementLeft <= 0) return [];
    
    const moves: string[] = [];
    
    hexes.forEach(hex => {
      if (hex.id === unit.hexId) return;
      
      // Calculate distance (simplified for hex grid)
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
      
      const movementCost = TERRAIN_INFO[targetHex.terrain].movementCost;
      
      // Check for combat
      const enemyUnits = prev.units.filter(u => u.hexId === targetHexId && u.factionId !== unit.factionId);
      
      if (enemyUnits.length > 0) {
        // Combat!
        return resolveCombat(prev, unit, enemyUnits, targetHex);
      }
      
      // Normal movement
      const newUnits = [...prev.units];
      newUnits[unitIndex] = {
        ...unit,
        hexId: targetHexId,
        movementLeft: Math.max(0, unit.movementLeft - movementCost),
      };
      
      const newHexes = prev.hexes.map(h => {
        if (h.id === sourceHex.id) {
          return { ...h, units: h.units.filter(id => id !== unitId) };
        }
        if (h.id === targetHexId) {
          return { 
            ...h, 
            units: [...h.units, unitId],
            ownerId: unit.factionId, // Take control
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
    // Roll dice for combat
    const attackerDice = Math.min(6, attacker.attackPower);
    const defenderPower = defenders.reduce((sum, d) => sum + d.attackPower, 0);
    const defenderDice = Math.min(6, defenderPower + TERRAIN_INFO[hex.terrain].defenseBonus);
    
    const attackerRolls = Array.from({ length: attackerDice }, () => Math.floor(Math.random() * 6) + 1);
    const defenderRolls = Array.from({ length: defenderDice }, () => Math.floor(Math.random() * 6) + 1);
    
    // Hits on 4+
    const attackerHits = attackerRolls.filter(r => r >= 4).length;
    const defenderHits = defenderRolls.filter(r => r >= 4).length;
    
    let newUnits = [...state.units];
    let attackerLosses = 0;
    let defenderLosses = 0;
    
    // Apply damage to attacker
    const attackerIndex = newUnits.findIndex(u => u.id === attacker.id);
    if (attackerIndex !== -1) {
      const newHealth = newUnits[attackerIndex].health - defenderHits;
      if (newHealth <= 0) {
        newUnits = newUnits.filter(u => u.id !== attacker.id);
        attackerLosses = 1;
      } else {
        newUnits[attackerIndex] = { ...newUnits[attackerIndex], health: newHealth };
      }
    }
    
    // Apply damage to defenders
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
    };
    
    // Update hex ownership if attacker wins and survives
    const attackerSurvived = newUnits.some(u => u.id === attacker.id);
    const defendersRemain = newUnits.some(u => defenders.some(d => d.id === u.id));
    
    let newHexes = state.hexes;
    if (attackerSurvived && !defendersRemain) {
      // Attacker takes the hex
      const updatedAttacker = newUnits.find(u => u.id === attacker.id);
      if (updatedAttacker) {
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
        
        // Update unit position
        const attackerIdx = newUnits.findIndex(u => u.id === attacker.id);
        if (attackerIdx !== -1) {
          newUnits[attackerIdx] = { ...newUnits[attackerIdx], hexId: hex.id, movementLeft: 0 };
        }
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

  const endPhase = useCallback(() => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return null;
      
      const phases: GamePhase[] = ['planning', 'action', 'management', 'event'];
      const currentIndex = phases.indexOf(prev.currentPhase);
      const nextIndex = (currentIndex + 1) % phases.length;
      
      let newState = { ...prev, currentPhase: phases[nextIndex] };
      
      // If we complete all phases, go to next turn
      if (nextIndex === 0) {
        newState = endTurn(newState);
      }
      
      // Handle phase-specific logic
      if (phases[nextIndex] === 'management') {
        newState = collectResources(newState);
      }
      
      return newState;
    });
  }, [gameState]);

  const endTurn = (state: GameState): GameState => {
    // Reset unit movements
    const newUnits = state.units.map(u => ({
      ...u,
      movementLeft: u.maxMovement,
    }));
    
    // Check victory conditions
    const winCheck = checkVictoryConditions(state);
    
    // AI turns (simplified - just collect resources)
    let newState = {
      ...state,
      turn: state.turn + 1,
      units: newUnits,
      ...winCheck,
    };
    
    return newState;
  };

  const collectResources = (state: GameState): GameState => {
    const newPlayers = state.players.map(player => {
      const controlledHexes = state.hexes.filter(h => h.ownerId === player.factionId);
      
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
      });
      
      // Apply faction bonuses
      if (player.factionId === 'persia') {
        const tradeHexes = controlledHexes.filter(h => h.hasTradeRoute);
        resourceGains.gold += tradeHexes.length * 2;
        resourceGains.artisans += tradeHexes.length;
      }
      
      return {
        ...player,
        resources: {
          horses: player.resources.horses + resourceGains.horses,
          gold: player.resources.gold + resourceGains.gold,
          food: player.resources.food + resourceGains.food,
          artisans: player.resources.artisans + resourceGains.artisans,
          cattle: player.resources.cattle + resourceGains.cattle,
        },
        territoriesControlled: controlledHexes.length,
        citiesControlled: controlledHexes.filter(h => h.hasCity).length,
        tradeRoutes: controlledHexes.filter(h => h.hasTradeRoute).length,
      };
    });
    
    return { ...state, players: newPlayers };
  };

  const checkVictoryConditions = (state: GameState): { gameOver: boolean; winnerId: string | null; winCondition: string | null } => {
    for (const player of state.players) {
      // Military victory: control 60% of cities
      const totalCities = state.hexes.filter(h => h.hasCity).length;
      const playerCities = state.hexes.filter(h => h.hasCity && h.ownerId === player.factionId).length;
      
      if (playerCities >= totalCities * 0.6) {
        return { gameOver: true, winnerId: player.id, winCondition: 'Sotilaallinen Voitto: Maailmanvalloittaja' };
      }
      
      // Economic victory: 50 victory points and 5 trade routes
      if (player.victoryPoints >= 50 && player.tradeRoutes >= 5) {
        return { gameOver: true, winnerId: player.id, winCondition: 'Ekonominen Voitto: Silkkitien Herra' };
      }
      
      // Elimination check
      const playerUnits = state.units.filter(u => u.factionId === player.factionId);
      if (playerUnits.length === 0) {
        // Player eliminated
      }
    }
    
    return { gameOver: false, winnerId: null, winCondition: null };
  };

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setPlayerFaction(null);
    setGameState(null);
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
  };
};
