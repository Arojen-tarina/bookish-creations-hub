import type { Province } from '../model/models';
import { FACTION_DATA_1206 } from './gameData';
import { historicalLabelFor } from './historicalNames1206';

/**
 * City lore, grounded in the existing repository lore:
 * - rulebook (en.json, valtakuntataulukko): realm capitals and rulers
 * - game-data (gameData.ts): realm capitals for the realms not in the rulebook table
 * - Rajaseudun Kronikka (codex/fi.json): the world chronicle
 *
 * Cities the sources do not mention get a short, honest profile. No events are invented for them.
 * Lore text is Finnish, matching the canonical chronicle.
 */

export type LoreConfidence = 'rulebook' | 'game-data' | 'interpretation' | 'none';

export interface LoreSection { heading: string; body: string }

export interface CityLore {
  cityId: string;
  title: string;
  historicalName: string | null;
  area: string;
  summary: string;
  sections: LoreSection[];
  sources: string[];
  confidence: LoreConfidence;
}

type LoreOverride = Pick<CityLore, 'summary' | 'sections' | 'sources' | 'confidence'>;

const AREA_LABELS: Record<string, string> = {
  mongolia: 'Mongolia (aro)',
  rus: 'Venäjän ruhtinaskunnat',
  song_china: 'Etelä-Kiina (Song)',
  jin_china: 'Pohjois-Kiina (Jin)',
  manchuria: 'Mandžuria',
  central_asia: 'Tarimin allas ja Keski-Aasia',
  transoxiana: 'Transoksania',
  khwarezm: 'Khwarezm ja Iran',
  xixia: 'Xixia',
  tibet: 'Tiibet',
  kipchak: 'Kipchakien aro',
};

const FACTION_NAMES: Record<string, string> = {
  mongol: 'Mongolien valtakunta',
  song: 'Song-dynastia',
  rus: 'Venäjän ruhtinaskunnat',
  khwarezm: 'Khwarezmin valtakunta',
  jin: 'Jin-dynastia',
  xixia: 'Xixia',
  kipchak: 'Kipchakit',
};

/** Province id to realm id, for realm capitals only. */
const CAPITAL_OF: Record<string, string> = Object.fromEntries(
  Object.values(FACTION_DATA_1206).map((faction) => [faction.capitalId, faction.id]),
);

/** Hand-written lore for the realm capitals. Every entry names its source. */
export const CITY_LORE_OVERRIDES: Record<string, LoreOverride> = {
  karakorum: {
    summary: 'Karakorum on mongolien valtakunnan pääkaupunki pelisäännöissä. Kronikka ei mainitse sitä nimeltä.',
    sections: [{
      heading: 'Ristiriita',
      body: 'Kronikan mukaan Temüü rakensi yhdistetyn valtakunnan hallinnollisen keskuksen Ulanbataariin. Pelisäännöt pitävät Karakorumia pääkaupunkina. Kumpi on kanoninen, on avoin kysymys.',
    }],
    sources: ['Pelisäännöt: valtakuntataulukko (Mongolien valtakunta, Dschingis Khan)', 'Kronikka: Jälleenrakennus — Ulanbataar'],
    confidence: 'rulebook',
  },
  hangzhou: {
    summary: "Lin'an (Hangzhou) on Song-dynastian pääkaupunki pelisäännöissä, ja keisari Ningzong hallitsee sitä.",
    sections: [{
      heading: 'Yhteys kronikkaan',
      body: 'Kronikan eteläinen keisarikunta on merkantiili, byrokraattinen ja kivimuurein suojattu valtio, jolla on arkistot ja kauppa. Kuvaus sopii Song-dynastiaan, mutta kronikka ei nimeä kaupunkia. Yhteys on tulkinta.',
    }],
    sources: ['Pelisäännöt: valtakuntataulukko (Song-dynastia, Ningzong)', 'Kronikka: Liite A — Eteläinen keisarikunta'],
    confidence: 'interpretation',
  },
  zhongdu: {
    summary: 'Zhongdu on Jin-dynastian pääkaupunki pelitiedoissa. Jin ei esiinny maailmankronikassa, joten kaupungille ei ole kirjoitettu tapahtumia.',
    sections: [],
    sources: ['Pelitiedot: valtakuntien pääkaupungit'],
    confidence: 'game-data',
  },
  samarkand: {
    summary: 'Samarkand on Khwarezmin valtakunnan pääkaupunki pelisäännöissä, ja shaahi Muhammad II hallitsee sitä.',
    sections: [{
      heading: 'Kronikka',
      body: 'Kronikan mukaan Khwarezm on karavaanireittien valtias, joka kantaa aro–kivi-jännitettä pelilaudalle. Kronikassa ei mainita Samarkandia.',
    }],
    sources: ['Pelisäännöt: valtakuntataulukko (Khwarezmin valtakunta, Muhammad II)', 'Kronikka: Liite A — Vuoden 1206 valtakunnat'],
    confidence: 'rulebook',
  },
  novgorod: {
    summary: 'Novgorod on Venäjän ruhtinaskuntien pääkaupunki pelisäännöissä, ja sitä johtaa suuriruhtinas.',
    sections: [{
      heading: 'Kronikka',
      body: 'Kronikka kuvaa Venäjän ruhtinaskunnat metsien puolustajina. Novgorodia ei mainita kronikassa.',
    }],
    sources: ['Pelisäännöt: valtakuntataulukko (Venäjän ruhtinaskunnat, suuriruhtinas)', 'Kronikka: Liite A — Vuoden 1206 valtakunnat'],
    confidence: 'rulebook',
  },
  xingqing: {
    summary: 'Xingqing on Xixian pääkaupunki pelitiedoissa. Xixia ei esiinny maailmankronikassa, joten kaupungille ei ole kirjoitettu tapahtumia.',
    sections: [],
    sources: ['Pelitiedot: valtakuntien pääkaupungit'],
    confidence: 'game-data',
  },
};

/** Profile for a city with no specific lore. Built from the province data only. */
function fallbackLore(province: Province): CityLore {
  const area = AREA_LABELS[province.region] ?? province.region;
  const realmId = CAPITAL_OF[province.id];
  const historical = historicalLabelFor(province.id, province.name);
  const capitalLine = realmId ? ` Se on valtakunnan pääkaupunki (${FACTION_NAMES[realmId] ?? realmId}).` : '';
  return {
    cityId: province.id,
    title: province.name,
    historicalName: historical && historical !== province.name ? historical : null,
    area,
    summary: `${province.name} sijaitsee alueella: ${area}.${capitalLine}`,
    sections: [{
      heading: 'Kronikka',
      body: 'Maailmankronikassa ei ole tietoa tästä kaupungista. Sen historiaa ei ole täydennetty keksimällä tapahtumia.',
    }],
    sources: [],
    confidence: 'none',
  };
}

/** Lore for one city. Pure: reads the province, never changes it. */
export function cityLoreFor(province: Province): CityLore {
  const base = fallbackLore(province);
  const override = CITY_LORE_OVERRIDES[province.id];
  return override ? { ...base, ...override } : base;
}
