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

  it('gives every city without an override a profile built from game data, with interpretation labeled', () => {
    for (const province of PROVINCES_1206) {
      if (CITY_LORE_OVERRIDES[province.id]) continue;
      const lore = cityLoreFor(province);
      const headings = lore.sections.map((s) => s.heading);
      expect(headings.slice(0, 3)).toEqual(['Maasto ja asema', 'Kauppa', 'Kronikka']);
      const hasInterpretation = headings.includes('Tulkinta');
      expect(lore.confidence).toBe(hasInterpretation ? 'interpretation' : 'game-data');
      if (hasInterpretation) expect(lore.sources).toContain('Tulkinta: kronikan alueen kuvaus ja pelitiedot');
      expect(lore.sources.length).toBeGreaterThan(0);
      for (const section of lore.sections) expect(section.body.length).toBeGreaterThan(0);
    }
  });

  it('marks interpretation only for cities in chronicle regions', () => {
    const mongol = PROVINCES_1206.find((p) => p.region === 'mongolia' && !CITY_LORE_OVERRIDES[p.id])!;
    const lore = cityLoreFor(mongol);
    expect(lore.confidence).toBe('interpretation');
    expect(lore.sections.find((s) => s.heading === 'Tulkinta')!.body.startsWith('Tulkinta:')).toBe(true);
    const tibetan = PROVINCES_1206.find((p) => p.region === 'tibet' && !CITY_LORE_OVERRIDES[p.id])!;
    expect(cityLoreFor(tibetan).sections.map((s) => s.heading)).not.toContain('Tulkinta');
  });

  it('states when the chronicle does not describe a city, instead of inventing events', () => {
    const tibetan = PROVINCES_1206.find((p) => p.region === 'tibet' && !CITY_LORE_OVERRIDES[p.id])!;
    const chronicle = cityLoreFor(tibetan).sections.find((s) => s.heading === 'Kronikka')!;
    expect(chronicle.body).toContain('ei kuvaa');
    expect(cityLoreFor(tibetan).sources).not.toContain('Kronikka: Liite A — Vuoden 1206 valtakunnat');
  });

  it('reports only the province facts the game data actually has', () => {
    const silk = PROVINCES_1206.find((p) => p.hasSilkRoad && !CITY_LORE_OVERRIDES[p.id])!;
    const lore = cityLoreFor(silk);
    expect(lore.sections[0].body).toContain('Silkkitien varrella');
    const plainTrade = PROVINCES_1206.find((p) => p.tradeGood === null && !CITY_LORE_OVERRIDES[p.id])!;
    expect(cityLoreFor(plainTrade).sections[1].body).toContain('ei ole erikoistuotetta');
  });

  it('does not mutate the province when reading lore', () => {
    const province = PROVINCES_1206.find((p) => p.id === 'hangzhou')!;
    const before = JSON.stringify(province);
    cityLoreFor(province);
    expect(JSON.stringify(province)).toBe(before);
  });
});
