/**
 * core.ts — Analytiikkamoottori: puskurointi, istunnot, lähetys
 *
 * Kaikki tapahtumat kulkevat `track()`:in läpi. Suostumus (consent.ts) on
 * kova portti: ilman `granted`-tilaa mitään ei puskuroida edes paikallisesti,
 * eikä mitään lähetetä verkkoon. Kun suostumus on annettu:
 *  1. Tapahtuma kirjoitetaan pieneen paikalliseen rengaspuskuriin
 *     (selviää sivunlatauksesta ennen kuin ehditään lähettää).
 *  2. Puskuri lähetetään erässä Supabaseen (`analytics_events`-taulu,
 *     ks. supabase/migrations) tasaisin väliajoin + sivun piiloutuessa.
 *  3. Onnistunut lähetys tyhjentää lähetetyt rivit puskurista; epäonnistunut
 *     jättää ne odottamaan seuraavaa yritystä (puskuri on silti kokorajattu,
 *     jottei se kasva rajattomasti offline-pelaajalla).
 *
 * Tämä EI ole reaaliaikainen striimi — se on tarkoituksella yksinkertainen
 * "kerää ja lähetä erissä" -malli, joka riittää yhden kehittäjän tarpeisiin
 * eikä vaadi erillistä analytiikka-SaaSia tai omaa palvelininfraa.
 */
import { supabase } from '@/integrations/supabase/client.ts';
import { getAnalyticsConsent, getOrCreateClientId } from './consent.ts';
import type { AnalyticsEventName, AnalyticsEventPayloadMap, StoredAnalyticsEvent } from './types.ts';
import { recordAppOpenDay } from './retention.ts';

const APP_VERSION = '0.1.0'; // keep roughly in sync with package.json "version"
const BUFFER_KEY = 'arojen_tarinat_analytics_buffer_v1';
const MAX_BUFFERED_EVENTS = 300;
const FLUSH_BATCH_SIZE = 25;
const FLUSH_INTERVAL_MS = 20_000;

let sessionId: string | null = null;
let sessionStartedAt = 0;
let turnsThisSession = 0;
let flushTimer: ReturnType<typeof setInterval> | null = null;

const readBuffer = (): StoredAnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(BUFFER_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeBuffer = (events: StoredAnalyticsEvent[]) => {
  try { localStorage.setItem(BUFFER_KEY, JSON.stringify(events)); } catch { /* ignore */ }
};

const newSessionId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

/** Records one analytics event. No-op unless the player has opted in (see consent.ts). */
export const track = <K extends AnalyticsEventName>(name: K, payload: AnalyticsEventPayloadMap[K]): void => {
  if (getAnalyticsConsent() !== 'granted') return;
  if (!sessionId) startSession();

  const event: StoredAnalyticsEvent<K> = {
    name, payload, clientId: getOrCreateClientId(), sessionId: sessionId!, at: Date.now(), appVersion: APP_VERSION,
  };
  const buffer = readBuffer();
  buffer.push(event);
  while (buffer.length > MAX_BUFFERED_EVENTS) buffer.shift();
  writeBuffer(buffer);
};

/** Starts (or resumes) an analytics session. Idempotent per page-load. Safe to call before consent exists. */
export const startSession = (): void => {
  if (sessionId) return;
  if (getAnalyticsConsent() !== 'granted') return;

  sessionId = newSessionId();
  sessionStartedAt = Date.now();
  turnsThisSession = 0;

  const { daysSinceFirstOpen, isNewPlayer } = recordAppOpenDay();
  track('session_start', { clientId: getOrCreateClientId(), sessionId, daysSinceFirstOpen, isNewPlayer });

  if (!flushTimer) flushTimer = setInterval(() => { void flush(); }, FLUSH_INTERVAL_MS);
};

/** Call once per completed turn so `session_end`/dashboards can report turns-per-session. */
export const noteTurnCompleted = (): void => { turnsThisSession += 1; };

/** Ends the current session (tab close, visibility hidden, or consent withdrawn). */
export const endSession = (): void => {
  if (!sessionId) return;
  track('session_end', { sessionId, durationMs: Date.now() - sessionStartedAt, turnsThisSession });
  void flush(true);
  sessionId = null;
  if (flushTimer) { clearInterval(flushTimer); flushTimer = null; }
};

/**
 * Sends up to `FLUSH_BATCH_SIZE` buffered events to Supabase. `useBeacon`
 * best-effort mode (page is unloading) skips the round-trip promise chain
 * and just fires the insert without awaiting it.
 */
export const flush = async (useBeacon = false): Promise<void> => {
  if (getAnalyticsConsent() !== 'granted') return;
  const buffer = readBuffer();
  if (buffer.length === 0) return;

  const batch = buffer.slice(0, FLUSH_BATCH_SIZE);
  const rows = batch.map(e => ({
    client_id: e.clientId,
    session_id: e.sessionId,
    event_name: e.name,
    payload: e.payload,
    app_version: e.appVersion,
    created_at: new Date(e.at).toISOString(),
  }));

  const send = supabase.from('analytics_events').insert(rows);
  if (useBeacon) {
    // Fire-and-forget: the page may be gone before this resolves, that's fine.
    void send.then(({ error }) => { if (!error) writeBuffer(readBuffer().slice(batch.length)); });
    return;
  }
  try {
    const { error } = await send;
    if (error) return; // leave buffered, retry on next flush
    writeBuffer(readBuffer().slice(batch.length));
  } catch {
    // Offline or network error — keep buffered for the next attempt.
  }
};

let lifecycleWired = false;

/** Wires page-visibility/unload listeners so sessions end cleanly. Call once (see useAnalyticsSession). */
export const wireSessionLifecycle = (): (() => void) => {
  if (lifecycleWired) return () => {};
  lifecycleWired = true;

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') endSession();
    else if (getAnalyticsConsent() === 'granted') startSession();
  };
  const onPageHide = () => endSession();
  const onConsentChanged = () => {
    if (getAnalyticsConsent() === 'granted') startSession();
    else endSession();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('analytics-consent:changed', onConsentChanged);

  return () => {
    lifecycleWired = false;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('analytics-consent:changed', onConsentChanged);
  };
};

/** For the local dev dashboard: events not yet flushed to Supabase. */
export const getBufferedEvents = (): StoredAnalyticsEvent[] => readBuffer();
