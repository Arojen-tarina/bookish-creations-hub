import type { SettingsRepository } from '../data/SettingsRepository';
import { readSecure, writeSecure } from '../lib/secureStorage';
import { ALLOWED_EVENTS, Events, type AnalyticsEvent } from './AnalyticsEvents';
import { SupabaseAnalyticsUploader, type AnalyticsRow, type AnalyticsUploader } from './AnalyticsUploader';

interface StoredEvent { name: string; payload: Record<string, unknown>; clientId: string; sessionId: string; appVersion: string }
const BUFFER_KEY = 'arojen_analytics_buffer';
const stringValue = (v: unknown): v is string => typeof v === 'string';

/** Anonymous, opt-in analytics client; no event is retained or sent before explicit consent. */
export class Analytics {
  private readonly uploader: AnalyticsUploader | null;
  private session: { id: string; clientId: string; startedAt: number; turns: number } | null = null;
  private foreground = false;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private firsts = new Set<string>();
  private readonly appVersion = '1.0.0';
  constructor(private readonly settings: SettingsRepository, uploader?: AnalyticsUploader | null, private readonly clock: () => number = Date.now) {
    const url = import.meta.env.VITE_SUPABASE_URL ?? '';
    const key = import.meta.env.VITE_SUPABASE_KEY ?? '';
    this.uploader = uploader === undefined ? (url && key ? new SupabaseAnalyticsUploader(url, key) : null) : uploader;
    settings.settings.subscribe(() => this.onConsentChange());
    this.onConsentChange();
  }
  private get consented(): boolean { return this.settings.settings.get().analyticsConsent === 'GRANTED'; }
  onForeground(): void { this.foreground = true; if (this.consented) this.startSession(); }
  onBackground(): void {
    this.foreground = false;
    if (this.session && this.consented) this.append([Events.sessionEnd(this.session.id, this.clock() - this.session.startedAt, this.session.turns)]);
    this.session = null;
    if (this.flushTimer) clearInterval(this.flushTimer);
    this.flushTimer = null;
    void this.flush();
  }
  track(...events: AnalyticsEvent[] | [AnalyticsEvent[]]): void {
    const list = Array.isArray(events[0]) ? events[0] as AnalyticsEvent[] : events as AnalyticsEvent[];
    if (!this.consented || !this.session || !list.length) return;
    this.append(list);
  }
  trackFirst(step: string): void {
    if (!this.consented || !this.session || this.firsts.has(step)) return;
    this.firsts.add(step); this.track(Events.onboarding(step));
  }
  noteTurnCompleted(): void { if (this.session) this.session.turns++; }
  get turnsThisSession(): number { return this.session?.turns ?? 0; }
  async flush(): Promise<void> {
    if (!this.uploader || !this.consented) return;
    const buffer = readBuffer();
    if (!buffer.length) return;
    const rows: AnalyticsRow[] = buffer.slice(0, 50).map(e => ({ client_id: e.clientId, session_id: e.sessionId, event_name: e.name, payload: e.payload, platform: 'web', app_version: e.appVersion }));
    const result = await this.uploader.insert(rows);
    if (result !== 'FAILED') writeSecure(BUFFER_KEY, buffer.slice(rows.length));
  }
  private append(events: AnalyticsEvent[]): void {
    const session = this.session;
    if (!session || !this.consented) return;
    const rows: StoredEvent[] = events.filter(item => ALLOWED_EVENTS.has(item.name)).map(item => ({ name: item.name, payload: item.payload, clientId: session.clientId, sessionId: session.id, appVersion: this.appVersion }));
    writeSecure(BUFFER_KEY, [...readBuffer(), ...rows].slice(-500));
  }
  private startSession(): void {
    if (this.session || !this.consented) return;
    const now = new Date(this.clock());
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    const identity = this.settings.recordAnalyticsOpen(today, () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${this.clock()}-${Math.random().toString(36).slice(2)}`);
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${this.clock()}-${Math.random().toString(36).slice(2)}`;
    this.session = { id, clientId: identity.clientId, startedAt: this.clock(), turns: 0 };
    const days = Math.max(0, Math.floor((Date.parse(today) - Date.parse(identity.firstOpenDate)) / 86_400_000));
    this.append([Events.sessionStart(identity.clientId, id, days, identity.isNewPlayer)]);
    if (!this.flushTimer) this.flushTimer = setInterval(() => void this.flush(), 60_000);
  }
  private onConsentChange(): void {
    if (this.consented) { if (this.foreground) this.startSession(); }
    else {
      this.session = null;
      if (this.settings.settings.get().analyticsConsent === 'DENIED') writeSecure(BUFFER_KEY, []);
      if (this.flushTimer) clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
function readBuffer(): StoredEvent[] {
  return readSecure<StoredEvent[]>(BUFFER_KEY, (v): v is StoredEvent[] => Array.isArray(v) && v.length <= 500 && v.every(row => !!row && typeof row === 'object' && stringValue((row as StoredEvent).name) && stringValue((row as StoredEvent).clientId) && stringValue((row as StoredEvent).sessionId)), []);
}
export { Events } from './AnalyticsEvents';
