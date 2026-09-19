/**
 * achievements.ts — Saavutusjärjestelmän AchievementManager
 *
 * Saavutusten määrittelyt elävät achievementDefinitions.ts:ssä (data-vetoinen,
 * helposti laajennettava taulukko: kategoria, vaikeus, pisteet, palkinto,
 * unlock-ehto). Tämä tiedosto vastaa vain lukitustilan tallennuksesta ja
 * pisteiden/tason/arvonimen laskennasta. Lukitustila ja avausajankohta
 * tallennetaan pysyvästi: Android-builderissa natiivin AchievementManager-
 * Capacitor-pluginin kautta (SharedPreferences), selaimessa (dev/preview)
 * localStorage-varmuuskopiolla.
 */
import { registerPlugin, Capacitor } from '@capacitor/core';
import { ACHIEVEMENT_DEFINITIONS, ACHIEVEMENT_DEFINITIONS_BY_ID } from './achievementDefinitions.ts';
import { getPlayerLevel, getRankTitle, pointsForLevel } from './achievementTypes.ts';
import type { Achievement, AchievementDefinition } from './achievementTypes.ts';
import type { Language } from '@/lib/i18n.tsx';

export type { Achievement, AchievementDefinition };
export { ACHIEVEMENT_DEFINITIONS };

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
 * (name/description/category/reward/points) always comes from
 * ACHIEVEMENT_DEFINITIONS in achievementDefinitions.ts.
 */
class AchievementManager {
  /** Unlocks an achievement by id. No-ops if already unlocked or the id is unknown. */
  async unlockAchievement(id: string): Promise<boolean> {
    if (!ACHIEVEMENT_DEFINITIONS_BY_ID.has(id)) return false;
    const { alreadyUnlocked } = await AchievementNative.unlock({ id });
    if (!alreadyUnlocked) window.dispatchEvent(new Event(ACHIEVEMENTS_UPDATED_EVENT));
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

  /** Total achievement points currently unlocked. */
  async getTotalPoints(): Promise<number> {
    const { items } = await AchievementNative.getAll();
    const unlockedIds = new Set(items.map(item => item.id));
    let total = 0;
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (unlockedIds.has(def.id)) total += def.points;
    }
    return total;
  }
}

export const achievementManager = new AchievementManager();

/** Fired on window whenever an achievement is newly unlocked, so open UI can refresh. */
export const ACHIEVEMENTS_UPDATED_EVENT = 'achievements:updated';

/** True on Android/iOS builds; false in the browser (web/dev/preview). */
export const isNativeAchievementStorage = () => Capacitor.isNativePlatform();

/** Player level derived from total achievement points, plus its rank title (fi/en). */
export const getPlayerProgression = (totalPoints: number, lang: Language) => {
  const level = getPlayerLevel(totalPoints);
  const pointsForCurrent = pointsForLevel(level);
  const pointsForNext = pointsForLevel(level + 1);
  return {
    level,
    title: getRankTitle(level)[lang],
    pointsIntoLevel: totalPoints - pointsForCurrent,
    pointsForNextLevel: pointsForNext - pointsForCurrent,
  };
};
