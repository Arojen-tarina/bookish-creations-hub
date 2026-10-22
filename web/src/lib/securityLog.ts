export type SecurityEventKind = 'storage_corrupt' | 'storage_checksum_mismatch' | 'storage_validation_failed' | 'save_invalid' | 'data_invalid' | 'other';
export interface SecurityEvent { kind: SecurityEventKind | string; at: number; context?: string }
const KEY = 'arojen_security_events';
const LIMIT = 100;

export function logSecurityEvent(kind: SecurityEventKind | string, context?: string): void {
  try {
    const raw = localStorage.getItem(KEY);
    let prior: SecurityEvent[] = [];
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) prior = parsed.filter(isEvent).slice(-LIMIT);
    }
    prior.push({ kind, at: Date.now(), ...(context ? { context: context.slice(0, 80) } : {}) });
    localStorage.setItem(KEY, JSON.stringify(prior.slice(-LIMIT)));
  } catch {
    // Security telemetry must not interfere with the game, especially when storage is unavailable.
  }
}

export function readSecurityEvents(): SecurityEvent[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isEvent).slice(-LIMIT) : [];
  } catch {
    return [];
  }
}

function isEvent(value: unknown): value is SecurityEvent {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.kind === 'string' && Number.isFinite(item.at);
}
