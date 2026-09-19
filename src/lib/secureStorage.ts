/**
 * secureStorage.ts — Tamper-evident localStorage envelope
 *
 * Honest scope: this is client-side, single-player, offline storage running
 * inside a browser/WebView the player fully controls. No client-side secret
 * can survive being shipped in the bundle — anyone reading this file (or the
 * minified output) can recompute the checksum below. This is therefore
 * TAMPER *DETECTION*, not cryptographic proof, and it is a deliberate,
 * proportionate choice for a solo-dev single-player game with no real-money
 * economy or leaderboard: it stops casual editing (hex/text editors,
 * copy-pasted saves, accidental corruption) and gives every read a clear
 * "was this touched outside the game?" signal that callers can log and act
 * on. Real cheat-proofing of anything that matters competitively (e.g. a
 * future leaderboard) requires server-side validation — see the security
 * roadmap notes in achievementTypes.ts / achievements.ts.
 */
import { logSecurityEvent } from './securityLog.ts';

const PEPPER = 'arojen-tarinat-v1'; // raises the bar above trivial editing; NOT a secret

/** Fast, deterministic, non-cryptographic hash — sufficient for tamper detection. */
const hashString = (input: string): string => {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
};

interface SecureEnvelope<T> {
  v: number;
  data: T;
  checksum: string;
}

const computeChecksum = (version: number, data: unknown): string =>
  hashString(PEPPER + version + JSON.stringify(data));

/** Serializes `data` into a checksummed envelope and writes it to localStorage. */
export const writeSecure = <T>(key: string, version: number, data: T): void => {
  const envelope: SecureEnvelope<T> = { v: version, data, checksum: computeChecksum(version, data) };
  try {
    localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Storage unavailable (quota/private mode) — persistence is best-effort.
  }
};

export type SecureReadResult<T> =
  | { status: 'ok'; version: number; data: T }
  | { status: 'missing' }
  | { status: 'tampered' | 'corrupt' | 'invalid_shape' };

/**
 * Reads and verifies a secure envelope written by `writeSecure`.
 * `isValid` is a caller-supplied type guard run only after the checksum
 * passes, so schema drift and tampering are reported as distinct outcomes.
 */
export const readSecure = <T>(key: string, isValid: (data: unknown) => data is T): SecureReadResult<T> => {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return { status: 'missing' };
  }
  if (!raw) return { status: 'missing' };

  let envelope: Partial<SecureEnvelope<unknown>>;
  try {
    envelope = JSON.parse(raw);
  } catch {
    logSecurityEvent('storage_corrupt', { key, reason: 'invalid_json' });
    return { status: 'corrupt' };
  }

  if (!envelope || typeof envelope !== 'object' || typeof envelope.checksum !== 'string' || typeof envelope.v !== 'number') {
    logSecurityEvent('storage_corrupt', { key, reason: 'invalid_envelope' });
    return { status: 'corrupt' };
  }

  if (computeChecksum(envelope.v, envelope.data) !== envelope.checksum) {
    logSecurityEvent('storage_tampered', { key });
    return { status: 'tampered' };
  }

  if (!isValid(envelope.data)) {
    logSecurityEvent('storage_invalid_shape', { key });
    return { status: 'invalid_shape' };
  }

  return { status: 'ok', version: envelope.v, data: envelope.data };
};
