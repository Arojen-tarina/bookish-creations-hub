import { createStore, type Store } from '../lib/store';
import { readSecure, writeSecure } from '../lib/secureStorage';

export type AnalyticsConsent = 'UNDECIDED' | 'GRANTED' | 'DENIED';
export interface Settings { musicVolume: number; musicMuted: boolean; analyticsConsent: AnalyticsConsent }
export interface AnalyticsIdentity { clientId: string; firstOpenDate: string; isNewPlayer: boolean }
const SETTINGS_KEY = 'arojen_settings';
const DEFAULT_SETTINGS: Settings = { musicVolume: 0.5, musicMuted: false, analyticsConsent: 'UNDECIDED' };
const validSettings = (v: unknown): v is Settings => !!v && typeof v === 'object' && Number.isFinite((v as Settings).musicVolume) && (v as Settings).musicVolume >= 0 && (v as Settings).musicVolume <= 1 && typeof (v as Settings).musicMuted === 'boolean' && ['UNDECIDED', 'GRANTED', 'DENIED'].includes((v as Settings).analyticsConsent);

/** Stores player preferences and the consent-gated anonymous analytics identity. */
export class SettingsRepository {
  readonly settings: Store<Settings> = createStore(readSecure(SETTINGS_KEY, validSettings, DEFAULT_SETTINGS));
  private identity = readSecure<AnalyticsIdentity | null>('arojen_analytics_identity', (v): v is AnalyticsIdentity | null => v === null || (!!v && typeof v === 'object' && typeof (v as AnalyticsIdentity).clientId === 'string' && typeof (v as AnalyticsIdentity).firstOpenDate === 'string' && typeof (v as AnalyticsIdentity).isNewPlayer === 'boolean'), null);
  private activeDays = readSecure<string[]>('arojen_analytics_days', (v): v is string[] => Array.isArray(v) && v.length <= 400 && v.every(x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)), []);

  private commit(value: Settings): void { this.settings.set(value); writeSecure(SETTINGS_KEY, value); }
  setMusicVolume(volume: number): void { this.commit({ ...this.settings.get(), musicVolume: Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0.5)) }); }
  setMusicMuted(muted: boolean): void { this.commit({ ...this.settings.get(), musicMuted: muted }); }
  setAnalyticsConsent(consent: AnalyticsConsent): void {
    this.commit({ ...this.settings.get(), analyticsConsent: consent });
    if (consent === 'DENIED') this.forgetAnalyticsDays();
  }
  recordAnalyticsOpen(today: string, newClientId: () => string): AnalyticsIdentity {
    const isNewPlayer = !this.identity;
    const identity = this.identity ?? { clientId: newClientId(), firstOpenDate: today, isNewPlayer: true };
    this.identity = { ...identity, isNewPlayer };
    this.activeDays = [...new Set([...this.activeDays, today])].sort().slice(-400);
    writeSecure('arojen_analytics_identity', this.identity);
    writeSecure('arojen_analytics_days', this.activeDays);
    return this.identity;
  }
  forgetAnalyticsDays(): void { this.activeDays = []; writeSecure('arojen_analytics_days', []); }
  legacyImportDone(): boolean { return readSecure('arojen_legacy_import_done', (v): v is boolean => typeof v === 'boolean', false); }
  markLegacyImportDone(): void { writeSecure('arojen_legacy_import_done', true); }
}
export const DEFAULT_MUSIC_VOLUME = 0.5;
