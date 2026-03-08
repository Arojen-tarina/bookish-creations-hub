/**
 * useTurnLog.ts — Vuoroloki (tapahtumapäiväkirja)
 *
 * Tallentaa pelin tapahtumat (liikkeet, taistelut, valtaukset, sopimukset,
 * rakennukset, rekrytoinnit, tulot) vuorokohtaisesti.
 * Tarjoaa apufunktiot lokiviestien luomiseen.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { FactionId, GamePhase } from '@/types/province';

interface TurnLogEntry {
  id: string;
  turn: number;
  phase: GamePhase;
  type: 'move' | 'battle' | 'capture' | 'treaty' | 'build' | 'recruit' | 'income' | 'event';
  message: string;
  details?: string;
  factionId?: FactionId;
  timestamp: number;
}

interface UseTurnLogReturn {
  entries: TurnLogEntry[];
  addEntry: (entry: Omit<TurnLogEntry, 'id' | 'timestamp'>) => void;
  clearTurnLogs: () => void;
  getEntriesForTurn: (turn: number) => TurnLogEntry[];
}

export const useTurnLog = (): UseTurnLogReturn => {
  const [entries, setEntries] = useState<TurnLogEntry[]>([]);
  const idCounter = useRef(0);

  const addEntry = useCallback((entry: Omit<TurnLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: TurnLogEntry = {
      ...entry,
      id: `log-${++idCounter.current}`,
      timestamp: Date.now(),
    };
    
    setEntries(prev => [...prev, newEntry]);
  }, []);

  const clearTurnLogs = useCallback(() => {
    setEntries([]);
  }, []);

  const getEntriesForTurn = useCallback((turn: number) => {
    return entries.filter(e => e.turn === turn);
  }, [entries]);

  return {
    entries,
    addEntry,
    clearTurnLogs,
    getEntriesForTurn,
  };
};

// Helper to create common log entries
export const createLogMessage = {
  armyMoved: (armyName: string, from: string, to: string): string => 
    `${armyName} siirtyi alueelta ${from} alueelle ${to}`,
  
  battleWon: (provinceName: string, enemyFaction: string): string =>
    `Voitit taistelun provinssissa ${provinceName} (vs ${enemyFaction})`,
  
  battleLost: (provinceName: string, enemyFaction: string): string =>
    `Hävisit taistelun provinssissa ${provinceName} (vs ${enemyFaction})`,
  
  provinceCaptured: (provinceName: string): string =>
    `Valloitit provinssin ${provinceName}`,
  
  provinceLost: (provinceName: string, enemyFaction: string): string =>
    `Menetit provinssin ${provinceName} (${enemyFaction})`,
  
  treatySigned: (treatyType: string, factionName: string): string =>
    `Solmit sopimuksen: ${treatyType} (${factionName})`,
  
  treatyBroken: (treatyType: string, factionName: string): string =>
    `Sopimus rikottu: ${treatyType} (${factionName})`,
  
  fortBuilt: (provinceName: string, level: number): string =>
    `Rakennettu linnoitus (taso ${level}) provinssiin ${provinceName}`,
  
  armyRecruited: (provinceName: string): string =>
    `Rekrytoitu armeija provinssiin ${provinceName}`,
  
  incomeCollected: (amount: number): string =>
    `Kerätty verot: +${amount} kultaa`,
  
  eventOccurred: (eventName: string): string =>
    `Tapahtuma: ${eventName}`,
};

export type { TurnLogEntry };
