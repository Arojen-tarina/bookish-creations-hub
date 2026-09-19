/**
 * consent.ts — Opt-in analytiikkasuostumus (GDPR)
 *
 * Oletus on AINA "ei suostumusta" (opt-in, ei opt-out). `track()` (core.ts)
 * on täysin no-op ennen kuin pelaaja on eksplisiittisesti hyväksynyt
 * tiedonkeruun `AnalyticsConsentBanner.tsx`:n tai asetusvalikon kautta —
 * mitään käyttäytymisdataa ei puskuroida edes paikallisesti sitä ennen.
 * Ei PII:tä missään vaiheessa: vain satunnainen, ei-identifioiva clientId.
 */

const CONSENT_KEY = 'arojen_tarinat_analytics_consent_v1';
const CLIENT_ID_KEY = 'arojen_tarinat_analytics_client_id_v1';

export type ConsentState = 'granted' | 'denied' | 'undecided';

export const getAnalyticsConsent = (): ConsentState => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw === 'granted' || raw === 'denied') return raw;
  } catch {
    // ignore — treat storage errors as "undecided"
  }
  return 'undecided';
};

export const setAnalyticsConsent = (granted: boolean): void => {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    if (!granted) {
      // Withdrawing consent purges any locally buffered behavioural data immediately.
      localStorage.removeItem('arojen_tarinat_analytics_buffer_v1');
      localStorage.removeItem('arojen_tarinat_analytics_days_v1');
    }
  } catch {
    // Storage unavailable — consent simply won't persist across reloads.
  }
  window.dispatchEvent(new Event('analytics-consent:changed'));
};

const randomId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

/** Anonymous, non-identifying per-device id. Only created once consent is granted. */
export const getOrCreateClientId = (): string => {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const created = randomId();
    localStorage.setItem(CLIENT_ID_KEY, created);
    return created;
  } catch {
    return randomId();
  }
};

/** Forgets the anonymous client id (part of a full "delete my data" flow). */
export const forgetClientId = (): void => {
  try { localStorage.removeItem(CLIENT_ID_KEY); } catch { /* ignore */ }
};
