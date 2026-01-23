import { useState, useCallback, useEffect } from 'react';
import { SaveData, SaveMetadata, ProvinceGameState, CURRENT_SAVE_VERSION, FactionId } from '@/types/province';

const SAVE_KEY_PREFIX = 'mongol_empire_save_';
const AUTOSAVE_KEY = 'mongol_empire_autosave';
const SAVES_INDEX_KEY = 'mongol_empire_saves_index';
const MAX_SLOTS = 5;

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

// Validate save data structure
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
    try {
      const indexJson = localStorage.getItem(SAVES_INDEX_KEY);
      if (indexJson) {
        const index = JSON.parse(indexJson) as SaveMetadata[];
        setSaves(index.filter(s => !s.isAutosave));
      }
    } catch (error) {
      console.error('Failed to load saves index:', error);
      setSaves([]);
    }
  };

  const loadAutosaveMetadata = () => {
    try {
      const autosaveJson = localStorage.getItem(AUTOSAVE_KEY);
      if (autosaveJson) {
        const data = JSON.parse(autosaveJson) as SaveData;
        if (validateSaveData(data)) {
          setAutosave(data.metadata);
        }
      }
    } catch (error) {
      console.error('Failed to load autosave metadata:', error);
      setAutosave(null);
    }
  };

  const updateSavesIndex = useCallback((newSaves: SaveMetadata[]) => {
    try {
      localStorage.setItem(SAVES_INDEX_KEY, JSON.stringify(newSaves));
      setSaves(newSaves);
    } catch (error) {
      console.error('Failed to update saves index:', error);
    }
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
      
      // Save to localStorage
      const key = `${SAVE_KEY_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      
      // Update index
      const newSaves = saves.filter(s => s.slotNumber !== slotNumber);
      newSaves.push(metadata);
      newSaves.sort((a, b) => a.slotNumber - b.slotNumber);
      updateSavesIndex(newSaves);
      
      console.log(`Game saved to slot ${slotNumber}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }, [saves, updateSavesIndex]);

  const loadGame = useCallback((slotNumber: number): ProvinceGameState | null => {
    try {
      const key = `${SAVE_KEY_PREFIX}${slotNumber}`;
      const saveJson = localStorage.getItem(key);
      
      if (!saveJson) {
        console.error(`No save found in slot ${slotNumber}`);
        return null;
      }
      
      const data = JSON.parse(saveJson);
      
      if (!validateSaveData(data)) {
        console.error('Invalid save data format');
        return null;
      }
      
      const migrated = migrateSaveData(data);
      return migrated.state;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }, []);

  const loadAutosave = useCallback((): ProvinceGameState | null => {
    try {
      const saveJson = localStorage.getItem(AUTOSAVE_KEY);
      
      if (!saveJson) {
        return null;
      }
      
      const data = JSON.parse(saveJson);
      
      if (!validateSaveData(data)) {
        console.error('Invalid autosave data format');
        return null;
      }
      
      const migrated = migrateSaveData(data);
      return migrated.state;
    } catch (error) {
      console.error('Failed to load autosave:', error);
      return null;
    }
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
      
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saveData));
      setAutosave(metadata);
      
      console.log('Autosave completed');
      return true;
    } catch (error) {
      console.error('Failed to autosave:', error);
      return false;
    }
  }, []);

  const exportSave = useCallback((slotNumber: number): string | null => {
    try {
      const key = slotNumber === 0 ? AUTOSAVE_KEY : `${SAVE_KEY_PREFIX}${slotNumber}`;
      const saveJson = localStorage.getItem(key);
      
      if (!saveJson) {
        return null;
      }
      
      // Return formatted JSON for export
      const data = JSON.parse(saveJson);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
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
      
      // Save to localStorage
      const key = `${SAVE_KEY_PREFIX}${targetSlot}`;
      localStorage.setItem(key, JSON.stringify(migrated));
      
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
