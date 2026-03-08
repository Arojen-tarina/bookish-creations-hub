/**
 * indexedDB.ts — IndexedDB-tallennuskerros suurille pelidatoille
 *
 * Tarjoaa rajapinnan pelitallennusten ja asetusten tallentamiseen
 * selainten IndexedDB-tietokantaan (idb-kirjastolla).
 * Vaihtoehto localStoragelle suurille datamäärille.
 */
// IndexedDB wrapper for large game data storage
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SaveData, ProvinceGameState, CURRENT_SAVE_VERSION, SaveMetadata } from '@/types/province';

interface MongolGameDB extends DBSchema {
  saves: {
    key: string;
    value: SaveData;
    indexes: { 'by-slot': number; 'by-timestamp': number };
  };
  mapData: {
    key: string;
    value: {
      id: string;
      type: 'geojson' | 'topojson';
      data: unknown;
      version: string;
      timestamp: number;
    };
  };
  gameCache: {
    key: string;
    value: {
      id: string;
      data: unknown;
      timestamp: number;
    };
  };
}

const DB_NAME = 'mongol_empire_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MongolGameDB>> | null = null;

const getDB = async (): Promise<IDBPDatabase<MongolGameDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<MongolGameDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Saves store
        if (!db.objectStoreNames.contains('saves')) {
          const saveStore = db.createObjectStore('saves', { keyPath: 'metadata.id' });
          saveStore.createIndex('by-slot', 'metadata.slotNumber');
          saveStore.createIndex('by-timestamp', 'metadata.timestamp');
        }
        
        // Map data store
        if (!db.objectStoreNames.contains('mapData')) {
          db.createObjectStore('mapData', { keyPath: 'id' });
        }
        
        // Game cache store
        if (!db.objectStoreNames.contains('gameCache')) {
          db.createObjectStore('gameCache', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// ============= SAVE OPERATIONS =============

export const saveToIndexedDB = async (
  slotNumber: number,
  name: string,
  state: ProvinceGameState,
  isAutosave: boolean = false
): Promise<boolean> => {
  try {
    const db = await getDB();
    
    // Create metadata
    const playerFaction = state.factions.find(f => f.isPlayer);
    const playerProvinces = state.provinces.filter(
      p => p.ownerId === playerFaction?.id
    ).length;
    
    const metadata: SaveMetadata = {
      id: isAutosave ? 'autosave' : `save_${slotNumber}_${Date.now()}`,
      slotNumber: isAutosave ? 0 : slotNumber,
      name: isAutosave ? 'Autosave' : name,
      timestamp: Date.now(),
      turn: state.turn,
      playerFaction: playerFaction?.id || 'mongol',
      provincesControlled: playerProvinces,
      version: CURRENT_SAVE_VERSION,
      isAutosave,
    };
    
    const saveData: SaveData = { metadata, state };
    
    // Delete old save in same slot first
    if (!isAutosave) {
      const existing = await db.getAllFromIndex('saves', 'by-slot', slotNumber);
      for (const save of existing) {
        if (!save.metadata.isAutosave) {
          await db.delete('saves', save.metadata.id);
        }
      }
    } else {
      // Delete existing autosave
      try {
        await db.delete('saves', 'autosave');
      } catch {
        // Ignore if doesn't exist
      }
    }
    
    await db.put('saves', saveData);
    
    // Also store metadata in localStorage for quick access
    updateLocalStorageIndex();
    
    return true;
  } catch (error) {
    console.error('Failed to save to IndexedDB:', error);
    return false;
  }
};

export const loadFromIndexedDB = async (slotNumber: number): Promise<ProvinceGameState | null> => {
  try {
    const db = await getDB();
    
    if (slotNumber === 0) {
      // Autosave
      const autosave = await db.get('saves', 'autosave');
      return autosave?.state || null;
    }
    
    const saves = await db.getAllFromIndex('saves', 'by-slot', slotNumber);
    const save = saves.find(s => !s.metadata.isAutosave);
    
    return save?.state || null;
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return null;
  }
};

export const deleteFromIndexedDB = async (slotNumber: number): Promise<boolean> => {
  try {
    const db = await getDB();
    
    if (slotNumber === 0) {
      await db.delete('saves', 'autosave');
    } else {
      const saves = await db.getAllFromIndex('saves', 'by-slot', slotNumber);
      for (const save of saves) {
        if (!save.metadata.isAutosave) {
          await db.delete('saves', save.metadata.id);
        }
      }
    }
    
    updateLocalStorageIndex();
    return true;
  } catch (error) {
    console.error('Failed to delete from IndexedDB:', error);
    return false;
  }
};

export const getAllSavesMetadata = async (): Promise<{
  saves: SaveMetadata[];
  autosave: SaveMetadata | null;
}> => {
  try {
    const db = await getDB();
    const allSaves = await db.getAll('saves');
    
    const autosave = allSaves.find(s => s.metadata.isAutosave)?.metadata || null;
    const saves = allSaves
      .filter(s => !s.metadata.isAutosave)
      .map(s => s.metadata)
      .sort((a, b) => a.slotNumber - b.slotNumber);
    
    return { saves, autosave };
  } catch (error) {
    console.error('Failed to get saves metadata:', error);
    return { saves: [], autosave: null };
  }
};

export const exportSaveFromIndexedDB = async (slotNumber: number): Promise<string | null> => {
  try {
    const db = await getDB();
    
    if (slotNumber === 0) {
      const autosave = await db.get('saves', 'autosave');
      return autosave ? JSON.stringify(autosave, null, 2) : null;
    }
    
    const saves = await db.getAllFromIndex('saves', 'by-slot', slotNumber);
    const save = saves.find(s => !s.metadata.isAutosave);
    
    return save ? JSON.stringify(save, null, 2) : null;
  } catch (error) {
    console.error('Failed to export save:', error);
    return null;
  }
};

export const importSaveToIndexedDB = async (
  jsonString: string
): Promise<{ success: boolean; error?: string; slotNumber?: number }> => {
  try {
    const data = JSON.parse(jsonString) as SaveData;
    
    // Validate
    if (!data.metadata || !data.state) {
      return { success: false, error: 'Invalid save format' };
    }
    
    const db = await getDB();
    
    // Find empty slot
    const { saves } = await getAllSavesMetadata();
    const usedSlots = new Set(saves.map(s => s.slotNumber));
    
    let targetSlot = 1;
    for (let i = 1; i <= 5; i++) {
      if (!usedSlots.has(i)) {
        targetSlot = i;
        break;
      }
      targetSlot = i;
    }
    
    // Update metadata
    data.metadata.slotNumber = targetSlot;
    data.metadata.id = `save_${targetSlot}_${Date.now()}`;
    data.metadata.isAutosave = false;
    
    await db.put('saves', data);
    updateLocalStorageIndex();
    
    return { success: true, slotNumber: targetSlot };
  } catch (error) {
    console.error('Failed to import save:', error);
    return { success: false, error: 'Failed to parse save file' };
  }
};

// Update localStorage index for quick checks (without full data)
const updateLocalStorageIndex = async () => {
  try {
    const { saves, autosave } = await getAllSavesMetadata();
    localStorage.setItem('mongol_empire_saves_index_v2', JSON.stringify({ saves, autosave }));
  } catch (error) {
    console.error('Failed to update localStorage index:', error);
  }
};

// ============= MAP DATA OPERATIONS =============

export const storeMapData = async (
  id: string,
  type: 'geojson' | 'topojson',
  data: unknown,
  version: string
): Promise<boolean> => {
  try {
    const db = await getDB();
    await db.put('mapData', {
      id,
      type,
      data,
      version,
      timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    console.error('Failed to store map data:', error);
    return false;
  }
};

export const getMapData = async (id: string): Promise<unknown | null> => {
  try {
    const db = await getDB();
    const result = await db.get('mapData', id);
    return result?.data || null;
  } catch (error) {
    console.error('Failed to get map data:', error);
    return null;
  }
};

// ============= CACHE OPERATIONS =============

export const cacheData = async (id: string, data: unknown): Promise<boolean> => {
  try {
    const db = await getDB();
    await db.put('gameCache', {
      id,
      data,
      timestamp: Date.now(),
    });
    return true;
  } catch (error) {
    console.error('Failed to cache data:', error);
    return false;
  }
};

export const getCachedData = async (id: string): Promise<unknown | null> => {
  try {
    const db = await getDB();
    const result = await db.get('gameCache', id);
    return result?.data || null;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

// Check if IndexedDB is available
export const isIndexedDBAvailable = (): boolean => {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
};
