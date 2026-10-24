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

const TERRAIN_LABELS: Record<string, string> = {
  steppe: 'aro',
  forest: 'metsä',
  hills: 'kukkulat',
  mountain: 'vuoristo',
  desert: 'autiomaa',
  marsh: 'kosteikko',
  farmland: 'viljelysmaa',
  grassland: 'niitty',
};

const TRADE_LABELS: Record<string, string> = {
  fur: 'turkis',
  horses: 'hevonen',
  iron: 'rauta',
  salt: 'suola',
  grain: 'vilja',
  livestock: 'karja',
};

/** Chronicle passages per region. Regions missing here are not described by the chronicle. */
const REGION_CHRONICLE: Record<string, { text: string; source: string }> = {
  mongolia: {
    text: 'Pohjoisen aroheimot ovat itsenäistä paimentolaiskulttuuria. He eivät rakenna kivitaloja, vaan liikkuvat kausiluonteisilla laitumilla.',
    source: 'Kronikka: Suuri kahtiajako',
  },
  rus: {
    text: 'Kronikka kuvaa Venäjän ruhtinaskunnat metsien puolustajina.',
    source: 'Kronikka: Liite A — Vuoden 1206 valtakunnat',
  },
  khwarezm: {
    text: 'Kronikka kuvaa Khwarezmia karavaanireittien valtiaana.',
    source: 'Kronikka: Liite A — Vuoden 1206 valtakunnat',
  },
  song_china: {
    text: 'Kronikka kuvaa Song-Kiinaa kauppias-sivistyksenä.',
    source: 'Kronikka: Liite A — Heimot ja kansat',
  },
};

/** Interpretation linking province facts to the regional chronicle. Labeled as interpretation in the profile. */
const REGION_INTERPRETATION: Record<string, string> = {
  mongolia: 'Tulkinta: kronikan kuvaus kausiliikkeestä selittää, miksi kaupungin merkitys on pelissä lähinnä laidunten ja reittien hallinnassa.',
  rus: 'Tulkinta: metsien puolustajien alueella kaupungin linnoitus ja maasto ovat pelissä keskeisiä.',
  khwarezm: 'Tulkinta: karavaanireittien valtiaan alueella kaupungin kauppa ja asema reittien varrella liittyvät kronikan kuvaukseen.',
  song_china: 'Tulkinta: kauppias-sivistyksen kuvaus sopii alueeseen, jonka kauppa on pelitiedoissa merkittävää.',
};

const NO_CHRONICLE_TEXT = 'Kronikka ei kuvaa tätä aluetta erikseen, joten kaupungille ei ole kirjattu tapahtumia.';

/** Profile for a city with no specific lore. Built from province game data and the regional chronicle passage only. */
function fallbackLore(province: Province): CityLore {
  const area = AREA_LABELS[province.region] ?? province.region;
  const realmId = CAPITAL_OF[province.id];
  const historical = historicalLabelFor(province.id, province.name);
  const terrain = TERRAIN_LABELS[province.terrain] ?? province.terrain;
  const capitalLine = realmId ? ` Se on valtakunnan pääkaupunki (${FACTION_NAMES[realmId] ?? realmId}).` : '';
  const ownerLine = province.ownerId ? ` Alkuasetelmassa se kuuluu: ${FACTION_NAMES[province.ownerId] ?? province.ownerId}.` : '';

  const maastoParts = [`Alueen maasto on ${terrain}.`];
  if (province.isCoastal) maastoParts.push('Kaupunki on rannikolla.');
  if (province.hasSilkRoad) maastoParts.push('Se sijaitsee Silkkitien varrella.');
  if (province.fortLevel > 0) maastoParts.push(`Linnoituksen taso on ${province.fortLevel}.`);

  const trade = province.tradeGood
    ? `Pelitietojen mukaan kaupungin erikoistuote on ${TRADE_LABELS[province.tradeGood] ?? province.tradeGood}.`
    : 'Pelitiedoissa kaupungilla ei ole erikoistuotetta.';

  const chronicle = REGION_CHRONICLE[province.region];
  const interpretation = chronicle ? REGION_INTERPRETATION[province.region] : undefined;

  const sources = ['Pelitiedot: provinssin maasto, kauppa ja linnoitus'];
  if (ownerLine) sources.push('Pelitiedot: alkuasetelma');
  if (chronicle) sources.push(chronicle.source);
  if (interpretation) sources.push('Tulkinta: kronikan alueen kuvaus ja pelitiedot');

  const sections: LoreSection[] = [
    { heading: 'Maasto ja asema', body: maastoParts.join(' ') },
    { heading: 'Kauppa', body: trade },
    { heading: 'Kronikka', body: chronicle ? chronicle.text : NO_CHRONICLE_TEXT },
  ];
  if (interpretation) sections.push({ heading: 'Tulkinta', body: interpretation });

  return {
    cityId: province.id,
    title: province.name,
    historicalName: historical && historical !== province.name ? historical : null,
    area,
    summary: `${province.name} sijaitsee alueella: ${area}.${capitalLine}${ownerLine}`,
    sections,
    sources,
    confidence: interpretation ? 'interpretation' : 'game-data',
  };
}

/** Lore for one city. Pure: reads the province, never changes it. */
export function cityLoreFor(province: Province): CityLore {
  const base = fallbackLore(province);
  const override = CITY_LORE_OVERRIDES[province.id];
  return override ? { ...base, ...override } : base;
}
