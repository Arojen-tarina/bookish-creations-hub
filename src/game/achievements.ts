/**
 * achievements.ts — Saavutusjärjestelmä
 *
 * Saavutusten määrittelyt (id, nimi, kuvaus) elävät täällä, koska käännökset
 * ja pelitapahtumat käsitellään jo TypeScript-puolella. Lukitustila ja
 * avausajankohta tallennetaan pysyvästi: Android-builderissa natiivin
 * AchievementManager-Capacitor-pluginin kautta (SharedPreferences),
 * selaimessa (dev/preview) localStorage-varmuuskopiolla.
 */
import { registerPlugin, Capacitor } from '@capacitor/core';
import type { Language } from '@/lib/i18n.tsx';

export interface AchievementDefinition {
  id: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
}

export interface Achievement extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: number | null;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_province',
    name: { fi: 'Ensimmäinen valloitus', en: 'First Conquest' },
    description: { fi: 'Valtasi ensimmäisen provinssin.', en: 'Captured your first province.' },
  },
  {
    id: 'first_battle_won',
    name: { fi: 'Ensitaistelu', en: 'First Blood' },
    description: { fi: 'Voitit ensimmäisen taistelusi.', en: 'Won your first battle.' },
  },
  {
    id: 'military_victory',
    name: { fi: 'Valloittaja', en: 'Conqueror' },
    description: { fi: 'Saavutit sotilaallisen voiton.', en: 'Achieved a military victory.' },
  },
  {
    id: 'economic_victory',
    name: { fi: 'Kultainen valtakunta', en: 'Golden Empire' },
    description: { fi: 'Saavutit taloudellisen voiton.', en: 'Achieved an economic victory.' },
  },
  {
    id: 'technology_victory',
    name: { fi: 'Tiedon mestari', en: 'Master of Science' },
    description: { fi: 'Saavutit teknologisen voiton.', en: 'Achieved a technology victory.' },
  },
  {
    id: 'diplomatic_victory',
    name: { fi: 'Suurliitto', en: 'Grand Alliance' },
    description: { fi: 'Saavutit diplomaattisen voiton.', en: 'Achieved a diplomatic victory.' },
  },
  {
    id: 'cultural_victory',
    name: { fi: 'Ihmeiden rakentaja', en: 'Wonder Builder' },
    description: { fi: 'Saavutit kulttuurisen voiton.', en: 'Achieved a cultural victory.' },
  },
];

const DEFINITIONS_BY_ID = new Map(ACHIEVEMENT_DEFINITIONS.map(def => [def.id, def]));

interface UnlockResult {
  alreadyUnlocked: boolean;
  unlockedAt: number;
}

interface IsUnlockedResult {
  unlocked: boolean;
  unlockedAt: number | null;
}

interface GetAllResult {
  items: { id: string; unlockedAt: number }[];
}

/** Shape shared by the native Capacitor plugin and its web (localStorage) fallback. */
interface AchievementNativeApi {
  unlock(options: { id: string }): Promise<UnlockResult>;
  isUnlocked(options: { id: string }): Promise<IsUnlockedResult>;
  getAll(): Promise<GetAllResult>;
}

const WEB_STORAGE_KEY = 'arojen_tarinat_achievements';

/** localStorage-backed fallback used outside the native Android app (web/dev/preview). */
class AchievementWebStore implements AchievementNativeApi {
  private read(): Record<string, number> {
    try {
      const raw = localStorage.getItem(WEB_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private write(unlocked: Record<string, number>) {
    try {
      localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(unlocked));
    } catch {
      // Storage unavailable (e.g. private mode) — unlocks just won't persist.
    }
  }

  async unlock({ id }: { id: string }): Promise<UnlockResult> {
    const unlocked = this.read();
    const existing = unlocked[id];
    if (existing) return { alreadyUnlocked: true, unlockedAt: existing };

    const unlockedAt = Date.now();
    unlocked[id] = unlockedAt;
    this.write(unlocked);
    return { alreadyUnlocked: false, unlockedAt };
  }

  async isUnlocked({ id }: { id: string }): Promise<IsUnlockedResult> {
    const unlockedAt = this.read()[id] ?? null;
    return { unlocked: unlockedAt !== null, unlockedAt };
  }

  async getAll(): Promise<GetAllResult> {
    const unlocked = this.read();
    return { items: Object.entries(unlocked).map(([id, unlockedAt]) => ({ id, unlockedAt })) };
  }
}

// Routes to the native Android plugin (SharedPreferences) automatically on native
// platforms, and to AchievementWebStore (localStorage) everywhere else.
const AchievementNative = registerPlugin<AchievementNativeApi>('AchievementManager', {
  web: () => new AchievementWebStore(),
});

/**
 * Public API for gameplay code. Unlock state is persisted natively on Android
 * (SharedPreferences) and via localStorage on the web; achievement metadata
 * (name/description) always comes from ACHIEVEMENT_DEFINITIONS above.
 */
class AchievementManager {
  /** Unlocks an achievement by id. No-ops if already unlocked or the id is unknown. */
  async unlockAchievement(id: string): Promise<boolean> {
    if (!DEFINITIONS_BY_ID.has(id)) return false;
    const { alreadyUnlocked } = await AchievementNative.unlock({ id });
    return !alreadyUnlocked;
  }

  async isUnlocked(id: string): Promise<boolean> {
    const { unlocked } = await AchievementNative.isUnlocked({ id });
    return unlocked;
  }

  /** Merges persisted unlock state with the static definitions for display. */
  async getAllAchievements(): Promise<Achievement[]> {
    const { items } = await AchievementNative.getAll();
    const unlockedById = new Map(items.map(item => [item.id, item.unlockedAt]));

    return ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: unlockedById.has(def.id),
      unlockedAt: unlockedById.get(def.id) ?? null,
    }));
  }
}

export const achievementManager = new AchievementManager();

/** True on Android/iOS builds; false in the browser (web/dev/preview). */
export const isNativeAchievementStorage = () => Capacitor.isNativePlatform();
