import { logSecurityEvent } from './securityLog';

export interface SecureEnvelope<T> { version: number; checksum: string; data: T }
export type Validator<T> = (value: unknown) => value is T;
const VERSION = 1;

// FNV-1a is an accidental-corruption/tampering indicator, not cryptographic protection.
function checksum(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 0x01000193);
  return (hash >>> 0).toString(16).padStart(8, '0');
}
// Merely touching localStorage throws in sandboxed iframes (e.g. editor preview panes).
function hasStorage(): boolean { try { return typeof localStorage !== 'undefined' && localStorage !== null; } catch { return false; } }

export function writeSecure<T>(key: string, data: T, version = VERSION): boolean {
  if (!hasStorage()) return false;
  try {
    const payload = JSON.stringify(data);
    const envelope: SecureEnvelope<T> = { version, checksum: checksum(payload), data };
    localStorage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    return false;
  }
}

export function readSecure<T>(key: string, validate: Validator<T>, fallback: T, version = VERSION): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('invalid envelope');
    const envelope = parsed as Partial<SecureEnvelope<unknown>>;
    if (envelope.version !== version || typeof envelope.checksum !== 'string' || !('data' in envelope)) throw new Error('unsupported envelope');
    const payload = JSON.stringify(envelope.data);
    if (checksum(payload) !== envelope.checksum) {
      logSecurityEvent('storage_checksum_mismatch', key);
      return fallback;
    }
    if (!validate(envelope.data)) {
      logSecurityEvent('storage_validation_failed', key);
      return fallback;
    }
    return envelope.data;
  } catch {
    logSecurityEvent('storage_corrupt', key);
    return fallback;
  }
}

export function removeSecure(key: string): void {
  try { if (hasStorage()) localStorage.removeItem(key); } catch { /* storage is optional */ }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
