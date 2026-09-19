/**
 * useSaveManager.ts — Pelitallennusten hallinta (localStorage)
 *
 * 5 tallennuspaikkaa + autosave. Tukee tallennusta, latausta, poistoa,
 * vientiä (JSON) ja tuontia. Validoi ja migroi tallennetun datan.
 */
import { useState, useCallback, useEffect } from 'react';
import { SaveData, SaveMetadata, ProvinceGameState, CURRENT_SAVE_VERSION, FactionId } from '@/types/province';
import { readSecure, writeSecure } from '@/lib/secureStorage.ts';
import { track } from '@/lib/analytics';

const SAVE_KEY_PREFIX = 'mongol_empire_save_';
const AUTOSAVE_KEY = 'mongol_empire_autosave';
const SAVES_INDEX_KEY = 'mongol_empire_saves_index';
const MAX_SLOTS = 5;
// Storage-envelope schema version (separate from CURRENT_SAVE_VERSION, which
// versions the SaveData shape itself for in-game migrations).
const STORAGE_ENVELOPE_VERSION = 1;

interface SaveManagerReturn {
  saves: SaveMetadata[];
  autosave: SaveMetadata | null;
  saveGame: (slotNumber: number, name: string, state: ProvinceGameState) => boolean;
  loadGame: (slotNumber: number) => ProvinceGameState | null;
  loadAutosave: () => ProvinceGameState | null;
  deleteGame: (slotNumber: number) => boolean;
  autoSave: (state: ProvinceGameState) => boolean;
  exportSave: (slotNumber: number) => string | null;
  importSave: (jsonString: string) => { success: boolean; error?: string; slotNumber?: number };
  hasContinueGame: boolean;
  continueGame: () => ProvinceGameState | null;
}

// Migrate old save formats if needed
const migrateSaveData = (data: SaveData): SaveData => {
  const version = data.metadata.version;
  
  // Add migration logic here as versions evolve
  if (!version || version < CURRENT_SAVE_VERSION) {
    // Perform migrations
    data.metadata.version = CURRENT_SAVE_VERSION;
  }
  
  return data;
};

// Validate save data structure. Deliberately generous bounds (this is a
// single-player save the player is free to hand-edit via export/import) —
// the goal is only to reject shapes that would crash the reducer or
// obviously couldn't come from real gameplay (e.g. a map with 50,000
// provinces), not to police the player's own single-player choices.
const MAX_PLAUSIBLE_PROVINCES = 1000;
const MAX_PLAUSIBLE_FACTIONS = 20;
const MAX_PLAUSIBLE_TURN = 100_000;
const MAX_PLAUSIBLE_RESOURCE = 10_000_000;

const validateSaveData = (data: unknown): data is SaveData => {
  if (!data || typeof data !== 'object') return false;
  
  const save = data as SaveData;
  
  if (!save.metadata || typeof save.metadata !== 'object') return false;
  if (!save.state || typeof save.state !== 'object') return false;
  
  // Check required metadata fields
  if (typeof save.metadata.id !== 'string') return false;
  if (typeof save.metadata.slotNumber !== 'number') return false;
  if (typeof save.metadata.timestamp !== 'number') return false;
  if (typeof save.metadata.turn !== 'number') return false;
  
  // Check required state fields
  if (typeof save.state.turn !== 'number') return false;
  if (!Array.isArray(save.state.provinces)) return false;
  if (!Array.isArray(save.state.factions)) return false;

  // Plausibility bounds — reject shapes that couldn't come from real gameplay
  // and would otherwise crash rendering or blow up map/faction loops.
  if (save.state.turn < 0 || save.state.turn > MAX_PLAUSIBLE_TURN) return false;
  if (save.state.provinces.length > MAX_PLAUSIBLE_PROVINCES) return false;
  if (save.state.factions.length > MAX_PLAUSIBLE_FACTIONS) return false;
  for (const faction of save.state.factions) {
    if (typeof faction !== 'object' || faction === null) return false;
    const f = faction as { treasury?: unknown; manpower?: unknown; horses?: unknown };
    for (const value of [f.treasury, f.manpower, f.horses]) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > MAX_PLAUSIBLE_RESOURCE) return false;
    }
  }

  return true;
};

export const useSaveManager = (): SaveManagerReturn => {
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [autosave, setAutosave] = useState<SaveMetadata | null>(null);

  // Load saves index on mount
  useEffect(() => {
    loadSavesIndex();
    loadAutosaveMetadata();
  }, []);

  const loadSavesIndex = () => {
    const result = readSecure(SAVES_INDEX_KEY, (data): data is SaveMetadata[] => Array.isArray(data));
    if (result.status === 'ok') {
      setSaves(result.data.filter(s => !s.isAutosave));
    } else {
      setSaves([]);
    }
  };

  const loadAutosaveMetadata = () => {
    const result = readSecure(AUTOSAVE_KEY, validateSaveData);
    setAutosave(result.status === 'ok' ? result.data.metadata : null);
  };

  const updateSavesIndex = useCallback((newSaves: SaveMetadata[]) => {
    writeSecure(SAVES_INDEX_KEY, STORAGE_ENVELOPE_VERSION, newSaves);
    setSaves(newSaves);
  }, []);

  const createSaveMetadata = (
    slotNumber: number,
    name: string,
    state: ProvinceGameState,
    isAutosave: boolean = false
  ): SaveMetadata => {
    const playerFaction = state.factions.find(f => f.isPlayer);
    const playerProvinces = state.provinces.filter(
      p => p.ownerId === playerFaction?.id
    ).length;

    return {
      id: `save_${slotNumber}_${Date.now()}`,
      slotNumber,
      name: isAutosave ? 'Autosave' : name,
      timestamp: Date.now(),
      turn: state.turn,
      playerFaction: playerFaction?.id || 'mongol',
      provincesControlled: playerProvinces,
      version: CURRENT_SAVE_VERSION,
      isAutosave,
    };
  };

  const saveGame = useCallback((
    slotNumber: number,
    name: string,
    state: ProvinceGameState
  ): boolean => {
    if (slotNumber < 1 || slotNumber > MAX_SLOTS) {
      console.error(`Invalid slot number: ${slotNumber}`);
      return false;
    }

    try {
      const metadata = createSaveMetadata(slotNumber, name, state);
      const saveData: SaveData = { metadata, state };
      
      // Save to localStorage (checksummed envelope — see secureStorage.ts)
      const key = `${SAVE_KEY_PREFIX}${slotNumber}`;
      writeSecure(key, STORAGE_ENVELOPE_VERSION, saveData);
      
      // Update index
      const newSaves = saves.filter(s => s.slotNumber !== slotNumber);
      newSaves.push(metadata);
      newSaves.sort((a, b) => a.slotNumber - b.slotNumber);
      updateSavesIndex(newSaves);
      
      console.log(`Game saved to slot ${slotNumber}`);
      track('game_saved', { slot: slotNumber });
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [saves, updateSavesIndex]);

  const loadGame = useCallback((slotNumber: number): ProvinceGameState | null => {
    const key = `${SAVE_KEY_PREFIX}${slotNumber}`;
    const result = readSecure(key, validateSaveData);
    if (result.status !== 'ok') {
      console.error(`Could not load slot ${slotNumber}: ${result.status}`);
      return null;
    }
    // Tamper is only logged (not blocked) for single-player saves — the
    // player may legitimately hand-edit an exported save via importSave.
    const migrated = migrateSaveData(result.data);
    track('game_loaded', { slot: slotNumber });
    return migrated.state;
  }, []);

  const loadAutosave = useCallback((): ProvinceGameState | null => {
    const result = readSecure(AUTOSAVE_KEY, validateSaveData);
    if (result.status !== 'ok') return null;
    const migrated = migrateSaveData(result.data);
    track('game_loaded', { slot: 'auto' });
    return migrated.state;
  }, []);

  const deleteGame = useCallback((slotNumber: number): boolean => {
    try {
      const key = `${SAVE_KEY_PREFIX}${slotNumber}`;
      localStorage.removeItem(key);
      
      const newSaves = saves.filter(s => s.slotNumber !== slotNumber);
      updateSavesIndex(newSaves);
      
      console.log(`Save in slot ${slotNumber} deleted`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }, [saves, updateSavesIndex]);

  const autoSave = useCallback((state: ProvinceGameState): boolean => {
    try {
      const metadata = createSaveMetadata(0, 'Autosave', state, true);
      const saveData: SaveData = { metadata, state };
      
      writeSecure(AUTOSAVE_KEY, STORAGE_ENVELOPE_VERSION, saveData);
      setAutosave(metadata);
      
      console.log('Autosave completed');
      track('game_saved', { slot: 'auto' });
      return true;
    } catch (error) {
      console.error('Failed to autosave:', error);
      return false;
    }
  }, []);

  const exportSave = useCallback((slotNumber: number): string | null => {
    const key = slotNumber === 0 ? AUTOSAVE_KEY : `${SAVE_KEY_PREFIX}${slotNumber}`;
    const result = readSecure(key, validateSaveData);
    if (result.status !== 'ok') return null;
    // Export the plain SaveData (not the internal envelope) so it stays a
    // portable, human-readable format the player can back up or re-import.
    return JSON.stringify(result.data, null, 2);
  }, []);

  const importSave = useCallback((jsonString: string): { 
    success: boolean; 
    error?: string; 
    slotNumber?: number 
  } => {
    try {
      const data = JSON.parse(jsonString);
      
      if (!validateSaveData(data)) {
        return { success: false, error: 'Invalid save file format' };
      }
      
      const migrated = migrateSaveData(data);
      
      // Find first empty slot or use slot 5
      let targetSlot = 1;
      for (let i = 1; i <= MAX_SLOTS; i++) {
        if (!saves.some(s => s.slotNumber === i)) {
          targetSlot = i;
          break;
        }
        targetSlot = i;
      }
      
      // Update slot number in imported save
      migrated.metadata.slotNumber = targetSlot;
      migrated.metadata.id = `save_${targetSlot}_${Date.now()}`;
      
      // Save to localStorage (checksummed envelope — see secureStorage.ts)
      const key = `${SAVE_KEY_PREFIX}${targetSlot}`;
      writeSecure(key, STORAGE_ENVELOPE_VERSION, migrated);
      
      // Update index
      const newSaves = saves.filter(s => s.slotNumber !== targetSlot);
      newSaves.push(migrated.metadata);
      newSaves.sort((a, b) => a.slotNumber - b.slotNumber);
      updateSavesIndex(newSaves);
      
      return { success: true, slotNumber: targetSlot };
    } catch (error) {
      console.error('Failed to import save:', error);
      return { success: false, error: 'Failed to parse save file' };
    }
  }, [saves, updateSavesIndex]);

  const hasContinueGame = autosave !== null || saves.length > 0;

  const continueGame = useCallback((): ProvinceGameState | null => {
    // Try autosave first
    if (autosave) {
      return loadAutosave();
    }
    
    // Then try most recent manual save
    if (saves.length > 0) {
      const mostRecent = [...saves].sort((a, b) => b.timestamp - a.timestamp)[0];
      return loadGame(mostRecent.slotNumber);
    }
    
    return null;
  }, [autosave, saves, loadAutosave, loadGame]);

  return {
    saves,
    autosave,
    saveGame,
    loadGame,
    loadAutosave,
    deleteGame,
    autoSave,
    exportSave,
    importSave,
    hasContinueGame,
    continueGame,
  };
};
