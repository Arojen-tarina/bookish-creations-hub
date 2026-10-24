import { describe, expect, it } from 'vitest';
import { PROVINCES_1206 } from '../../src/game/data/provinces1206';
import { CITY_LORE_OVERRIDES, cityLoreFor } from '../../src/game/data/cityLore';

describe('city lore', () => {
  it('has a lore profile for every province, keyed by the same id', () => {
    for (const province of PROVINCES_1206) {
      const lore = cityLoreFor(province);
      expect(lore.cityId).toBe(province.id);
      expect(lore.title).toBe(province.name);
      expect(lore.summary.length).toBeGreaterThan(0);
    }
  });

  it('overrides only reference existing provinces', () => {
    const ids = new Set(PROVINCES_1206.map((p) => p.id));
    for (const id of Object.keys(CITY_LORE_OVERRIDES)) {
      expect(ids.has(id)).toBe(true);
      expect(CITY_LORE_OVERRIDES[id].sources.length).toBeGreaterThan(0);
    }
  });

  it('uses the realm capital lore where it exists', () => {
    const karakorum = PROVINCES_1206.find((p) => p.id === 'karakorum')!;
    expect(cityLoreFor(karakorum).summary).toContain('Karakorum');
    expect(cityLoreFor(karakorum).confidence).toBe('rulebook');
  });

  it('gives unspecified cities the honest fallback, with no invented events', () => {
    const plain = PROVINCES_1206.find((p) => p.id !== 'karakorum' && !CITY_LORE_OVERRIDES[p.id])!;
    const lore = cityLoreFor(plain);
    expect(lore.confidence).toBe('none');
    expect(lore.sources).toEqual([]);
    expect(lore.sections[0].body).toContain('ei ole tietoa');
  });

  it('does not mutate the province when reading lore', () => {
    const province = PROVINCES_1206.find((p) => p.id === 'hangzhou')!;
    const before = JSON.stringify(province);
    cityLoreFor(province);
    expect(JSON.stringify(province)).toBe(before);
  });
});
