/**
 * securityLog.ts — Local, privacy-safe log of tamper/anomaly events
 *
 * No PII and no gameplay secrets — just an event type, a timestamp, and a
 * small numeric/string context. Capped ring buffer in localStorage. Nothing
 * is uploaded by this module; it exists so (a) a future analytics/telemetry
 * pipeline has a ready-made source of "suspicious behaviour" events, and
 * (b) the log is inspectable during development/support.
 */

const LOG_KEY = 'arojen_tarinat_security_log_v1';
const MAX_ENTRIES = 200;

export type SecurityEventType =
  | 'storage_corrupt'      // JSON.parse failed or envelope shape was wrong
  | 'storage_tampered'     // checksum did not match stored payload
  | 'storage_invalid_shape' // checksum matched but the data failed schema validation
  | 'stat_anomaly'         // a stat delta was clamped for exceeding a sane bound
  | 'save_resync';         // a save/load produced a turn jump; diffing was skipped

export interface SecurityLogEntry {
  type: SecurityEventType;
  at: number;
  context?: Record<string, string | number>;
}

export const logSecurityEvent = (type: SecurityEventType, context?: Record<string, string | number>): void => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const entries: SecurityLogEntry[] = raw ? JSON.parse(raw) : [];
    entries.push({ type, at: Date.now(), context });
    while (entries.length > MAX_ENTRIES) entries.shift();
    localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  } catch {
    // Logging is best-effort only — it must never break gameplay.
  }
  if (import.meta.env.DEV) console.warn(`[security] ${type}`, context ?? '');
};

export const getSecurityLog = (): SecurityLogEntry[] => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearSecurityLog = (): void => {
  try { localStorage.removeItem(LOG_KEY); } catch { /* ignore */ }
};
