import { describe, expect, it } from 'vitest';
import { PROVINCES_1206 } from '../../src/game/data/provinces1206';
import { HISTORICAL_NAMES_1206, HISTORICAL_SOURCES, historicalLabelFor } from '../../src/game/data/historicalNames1206';

const VALID_CONFIDENCE = ['verified', 'probable', 'uncertain', 'unavailable'];

describe('historical 1206 names', () => {
  it('has an entry for every province id', () => {
    const missing = PROVINCES_1206.map((p) => p.id).filter((id) => !HISTORICAL_NAMES_1206[id]);
    expect(missing).toEqual([]);
  });

  it('has no entries for unknown ids', () => {
    const ids = new Set(PROVINCES_1206.map((p) => p.id));
    const extra = Object.keys(HISTORICAL_NAMES_1206).filter((id) => !ids.has(id));
    expect(extra).toEqual([]);
  });

  it('uses only valid confidence values and known sources', () => {
    for (const [id, entry] of Object.entries(HISTORICAL_NAMES_1206)) {
      expect(VALID_CONFIDENCE, id).toContain(entry.historicalNameConfidence);
      expect(entry.historicalName1206.length, id).toBeGreaterThan(0);
      expect(entry.historicalNameLanguage.length, id).toBeGreaterThan(0);
      for (const src of entry.historicalSources) expect(HISTORICAL_SOURCES[src], `${id}:${src}`).toBeDefined();
    }
  });

  it('hides labels for unavailable entries and identical names', () => {
    expect(historicalLabelFor('loulan', 'Loulan')).toBeNull();
    expect(historicalLabelFor('buhara', 'Bukhara')).toBeNull();
    expect(historicalLabelFor('loulan', 'Loulan')).toBeNull();
    expect(historicalLabelFor('unknown-id', 'X')).toBeNull();
  });

  it('marks uncertain names with a question mark', () => {
    expect(historicalLabelFor('karakorum', 'Orkhon')).toBe('Ordu-Baliq?');
  });

  it('returns the 1206 name for distinct probable/verified entries', () => {
    expect(historicalLabelFor('kiova', 'Kiev')).toBe('Kyiv');
  });
});
