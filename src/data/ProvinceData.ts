/**
 * ProvinceData.ts — Provinssidata vuoden 1206 aloitusta varten
 *
 * ~70 provinssia historiallisesti tärkeiltä alueilta.
 * Koordinaatit on sovitettu kuvitettuun pelilautaan (0-100 x 0-100).
 */
import { Province, FactionId } from '@/types/province';

const p = (
  id: string,
  name: string,
  region: Province['region'],
  terrain: Province['terrain'],
  ownerId: FactionId | null,
  options: Partial<Province> = {}
): Province => ({
  id, name, region, terrain, ownerId,
  isCoastal: false, isCapital: false, neighbors: [],
  baseTax: 2, baseManpower: 3, supply: 3,
  hasSilkRoad: false, unrest: 0, fortLevel: 0,
  developmentLevel: 1, buildings: [], garrison: 0,
  center: { x: 0, y: 0 },
  ...options,
});

// ============= NORTH WEST (Rus, Western Siberia, Western Kipchak) =============
// Coordinates: x < 45, y < 40
const northWestProvinces: Province[] = [
  // RUS KINGDOMS
  p('novgorod', 'Novgorod', 'rus', 'forest', 'rus', {
    isCapital: true, baseTax: 6, baseManpower: 8, fortLevel: 2, developmentLevel: 3,
    tradeGood: 'fur',
    center: { x: 28, y: 32 },
  }),
  p('pskov', 'Pihkova', 'rus', 'forest', 'rus', {
    baseTax: 3, baseManpower: 4, tradeGood: 'fur',
    center: { x: 26, y: 42 },
  }),
  p('tver', 'Tver', 'rus', 'forest', 'rus', {
    baseTax: 3, baseManpower: 5,
    center: { x: 40, y: 38 },
  }),
  p('vladimir', 'Vladimir', 'rus', 'forest', 'rus', {
    baseTax: 5, baseManpower: 7, fortLevel: 1, tradeGood: 'fur',
    center: { x: 44, y: 28 },
  }),
  p('smolensk', 'Smolensk', 'rus', 'forest', 'rus', {
    baseTax: 4, baseManpower: 6, fortLevel: 1,
    center: { x: 32, y: 48 },
  }),
  p('ryazan', 'Rjazan', 'rus', 'forest', 'rus', {
    baseTax: 4, baseManpower: 6,
    center: { x: 56, y: 40 },
  }),
  p('chernigov', 'Tšernihiv', 'rus', 'farmland', 'rus', {
    baseTax: 5, baseManpower: 7,
    center: { x: 34, y: 46 },
  }),
  p('kiev', 'Kiova', 'rus', 'farmland', 'rus', {
    baseTax: 7, baseManpower: 10, fortLevel: 2, tradeGood: 'grain',
    center: { x: 32, y: 56 },
  }),
  // WESTERN SIBERIA
  p('siberia_west', 'Länsi-Siperia', 'siberia', 'taiga', 'rus', {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 34, y: 10 },
  }),
  // CENTRAL ASIA EDGES
  p('altai', 'Altai', 'mongolia', 'mountain', 'mongol', {
    baseTax: 1, baseManpower: 2, fortLevel: 1,
    center: { x: 74, y: 30 },
  }),
  p('dzungaria', 'Dzungaria', 'central_asia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 76, y: 32 },
  }),
  p('semirechye', 'Seitsemän joki', 'central_asia', 'grassland', 'rus', {
    baseTax: 3, baseManpower: 5, tradeGood: 'horses',
    center: { x: 35, y: 30 },
  }),
  // KHWAREZM EDGES (moved to South West)
];

// ============= NORTH EAST (Mongolia, Eastern Manchuria, Northern China, Eastern Siberia) =============
// Coordinates: x >= 45, y < 40
const northEastProvinces: Province[] = [
  // MONGOLIA
  p('karakorum', 'Karakorum', 'mongolia', 'steppe', 'mongol', {
    isCapital: true, baseTax: 5, baseManpower: 8, fortLevel: 2, developmentLevel: 3,
    center: { x: 83, y: 37 },
  }),
  p('mongol_east', 'Itä-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 5, tradeGood: 'horses',
    center: { x: 90, y: 33 },
  }),
  p('mongol_central', 'Keski-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 6, tradeGood: 'livestock',
    center: { x: 78, y: 33 },
  }),
  p('mongol_west', 'Länsi-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 1, baseManpower: 4, tradeGood: 'horses',
    center: { x: 68, y: 43 },
  }),
  p('kerulen', 'Kerulenjoki', 'mongolia', 'grassland', 'mongol', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 100, y: 29 },
  }),
  p('onon', 'Ononjoki', 'mongolia', 'grassland', 'mongol', {
    baseTax: 2, baseManpower: 4,
    center: { x: 102, y: 37 },
  }),
  p('baikal', 'Baikaljärvi', 'mongolia', 'taiga', 'mongol', {
    baseTax: 2, baseManpower: 3, tradeGood: 'fur',
    center: { x: 72, y: 28 },
  }),
  p('gobi_north', 'Pohjois-Gobi', 'mongolia', 'desert', 'mongol', {
    baseTax: 1, baseManpower: 2,
    center: { x: 90, y: 47 },
  }),
  // EASTERN SIBERIA
  p('siberia_central', 'Keski-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 44, y: 6 },
  }),
  p('siberia_east', 'Itä-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 1, tradeGood: 'fur',
    center: { x: 54, y: 12 },
  }),
  p('yakutia', 'Jakutia', 'siberia', 'tundra', null, {
    baseTax: 0, baseManpower: 1,
    center: { x: 68, y: 10 },
  }),
  // MANCHURIA
  p('manchuria_north', 'Pohjois-Mantšuria', 'manchuria', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 74, y: 18 },
  }),
  // CENTRAL ASIA EDGES
  p('turfan', 'Turfan', 'central_asia', 'desert', null, {
    baseTax: 2, baseManpower: 3, hasSilkRoad: true, tradeGood: 'spices',
    center: { x: 46, y: 34 },
  }),
];

// ============= SOUTH WEST (Caucasus, Persia, Western Khwarezm) =============
// Coordinates: x < 45, y >= 40
const southWestProvinces: Province[] = [
  // CAUCASUS
  p('georgia', 'Georgia', 'caucasus', 'mountain', null, {
    baseTax: 4, baseManpower: 5, fortLevel: 1, tradeGood: 'gold',
    center: { x: 2, y: 42 },
  }),
  p('armenia', 'Armenia', 'caucasus', 'mountain', null, {
    baseTax: 3, baseManpower: 4, fortLevel: 1,
    center: { x: 10, y: 54 },
  }),
  p('azerbaijan', 'Azerbaijan', 'caucasus', 'hills', null, {
    baseTax: 4, baseManpower: 5, tradeGood: 'iron',
    center: { x: 40, y: 75 },
  }),
  p('shirvan', 'Shirvan', 'caucasus', 'hills', null, {
    baseTax: 3, baseManpower: 4,
    center: { x: 32, y: 85 },
  }),
  // KHWAREZM
  p('khiva', 'Khiva', 'khwarezm', 'desert', null, {
    baseTax: 3, baseManpower: 4,
    center: { x: 36, y: 71 },
  }),
  p('urgench', 'Urgench', 'khwarezm', 'grassland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 2,
    center: { x: 42, y: 81 },
  }),
  p('bukhara', 'Bukhara', 'transoxiana', 'farmland', 'khwarezm', {
    baseTax: 8, baseManpower: 10, fortLevel: 2, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 44, y: 75 },
  }),
  p('merv', 'Merv', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, hasSilkRoad: true,
    center: { x: 46, y: 90 },
  }),
  p('nishapur', 'Nishapur', 'khorasan', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, hasSilkRoad: true, tradeGood: 'gems',
    center: { x: 38, y: 90 },
  }),
  p('balkh', 'Balkh', 'khorasan', 'grassland', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 50, y: 82 },
  }),
  p('herat', 'Herat', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 56, y: 90 },
  }),
  p('samarkand', 'Samarkand', 'transoxiana', 'farmland', 'khwarezm', {
    isCapital: true, baseTax: 10, baseManpower: 12, fortLevel: 3, developmentLevel: 5,
    hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 46, y: 72 },
  }),
  // PERSIA
  p('isfahan', 'Isfahan', 'persia', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, tradeGood: 'silk',
    center: { x: 40, y: 88 },
  }),
  p('shiraz', 'Shiraz', 'persia', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 7, tradeGood: 'spices',
    center: { x: 40, y: 92 },
  }),
  p('tabriz', 'Tabriz', 'persia', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 32, y: 68 },
  }),
  p('ray', 'Ray (Tehran)', 'persia', 'hills', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 30, y: 60 },
  }),
  p('kerman', 'Kerman', 'persia', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 48, y: 88 },
  }),
  p('hormuz', 'Hormuz', 'persia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 3, isCoastal: true, tradeGood: 'spices',
    center: { x: 44, y: 92 },
  }),
];

// ============= SOUTH EAST (Song China, Xia, Central Asia, Tibet, Korea) =============
// Coordinates: x >= 45, y >= 40
const southEastProvinces: Province[] = [
  // CENTRAL ASIA
  p('kashgar', 'Kashgar', 'central_asia', 'desert', null, {
    baseTax: 4, baseManpower: 5, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 56, y: 70 },
  }),
  p('khotan', 'Khotan', 'central_asia', 'desert', null, {
    baseTax: 3, baseManpower: 3, hasSilkRoad: true, tradeGood: 'gems',
    center: { x: 38, y: 50 },
  }),
  p('dunhuang', 'Dunhuang', 'central_asia', 'desert', null, {
    baseTax: 3, baseManpower: 3, hasSilkRoad: true,
    center: { x: 52, y: 40 },
  }),
  // GOBI
  p('gobi_south', 'Etelä-Gobi', 'mongolia', 'desert', null, {
    baseTax: 1, baseManpower: 1,
    center: { x: 98, y: 43 },
  }),
  // SONG CHINA
  p('hangzhou', 'Hangzhou', 'song_china', 'farmland', 'song', {
    isCapital: true, baseTax: 12, baseManpower: 15, fortLevel: 2, developmentLevel: 5,
    isCoastal: true, tradeGood: 'silk',
    center: { x: 94, y: 91 },
  }),
  p('nanjing', 'Nanjing', 'song_china', 'farmland', 'song', {
    baseTax: 9, baseManpower: 12, fortLevel: 2, tradeGood: 'silk',
    center: { x: 90, y: 85 },
  }),
  p('suzhou', 'Suzhou', 'song_china', 'farmland', 'song', {
    baseTax: 8, baseManpower: 10, isCoastal: true, tradeGood: 'silk',
    center: { x: 102, y: 94 },
  }),
  p('fujian', 'Fujian', 'song_china', 'hills', 'song', {
    baseTax: 5, baseManpower: 7, isCoastal: true, tradeGood: 'spices',
    center: { x: 94, y: 99 },
  }),
  p('guangdong', 'Guangdong', 'song_china', 'farmland', 'song', {
    baseTax: 6, baseManpower: 8, isCoastal: true, tradeGood: 'spices',
    center: { x: 86, y: 105 },
  }),
  p('jiangxi', 'Jiangxi', 'song_china', 'hills', 'song', {
    baseTax: 5, baseManpower: 7, tradeGood: 'grain',
    center: { x: 88, y: 98 },
  }),
  p('hunan', 'Hunan', 'song_china', 'farmland', 'song', {
    baseTax: 5, baseManpower: 7, tradeGood: 'grain',
    center: { x: 80, y: 95 },
  }),
  p('hubei', 'Hubei', 'song_china', 'farmland', 'song', {
    baseTax: 6, baseManpower: 8, tradeGood: 'grain',
    center: { x: 82, y: 87 },
  }),
  p('sichuan', 'Sichuan', 'song_china', 'hills', 'song', {
    baseTax: 7, baseManpower: 10, fortLevel: 2, tradeGood: 'salt',
    center: { x: 72, y: 87 },
  }),
  p('yunnan', 'Yunnan', 'song_china', 'mountain', 'song', {
    baseTax: 3, baseManpower: 5, tradeGood: 'gems',
    center: { x: 72, y: 99 },
  }),
  // TIBET
  p('lhasa', 'Lhasa', 'tibet', 'mountain', null, {
    baseTax: 3, baseManpower: 4, fortLevel: 2, tradeGood: 'salt',
    center: { x: 50, y: 62 },
  }),
  p('tibet_east', 'Itä-Tiibet', 'tibet', 'mountain', null, {
    baseTax: 2, baseManpower: 3,
    center: { x: 60, y: 58 },
  }),
  p('tibet_west', 'Länsi-Tiibet', 'tibet', 'mountain', null, {
    baseTax: 1, baseManpower: 2,
    center: { x: 36, y: 60 },
  }),
  // KOREA
  p('goryeo', 'Goryeo', 'korea', 'hills', null, {
    baseTax: 5, baseManpower: 6, fortLevel: 1, isCoastal: true,
    center: { x: 94, y: 43 },
  }),
  p('korea_south', 'Etelä-Korea', 'korea', 'farmland', null, {
    baseTax: 4, baseManpower: 5, isCoastal: true, tradeGood: 'grain',
    center: { x: 88, y: 56 },
  }),
];

// Combine all provinces organized by map quadrant (NW, NE, SW, SE)
export const ALL_PROVINCES_1206: Province[] = [
  ...northWestProvinces,
  ...northEastProvinces,
  ...southWestProvinces,
  ...southEastProvinces,
];

// Adjacency
export const PROVINCE_ADJACENCY: Record<string, string[]> = {
  // Mongolia
  karakorum: ['mongol_east', 'mongol_central', 'mongol_west', 'gobi_north'],
  mongol_east: ['karakorum', 'mongol_central', 'kerulen', 'onon', 'baikal'],
  mongol_central: ['karakorum', 'mongol_east', 'mongol_west', 'gobi_north'],
  mongol_west: ['karakorum', 'mongol_central', 'altai', 'dzungaria'],
  gobi_north: ['karakorum', 'mongol_central', 'gobi_south'],
  gobi_south: ['gobi_north'],
  baikal: ['mongol_east', 'onon', 'siberia_east'],
  kerulen: ['mongol_east', 'onon', 'manchuria_north'],
  onon: ['mongol_east', 'kerulen', 'baikal'],
  altai: ['mongol_west', 'dzungaria', 'semirechye'],
  // Song China
  hangzhou: ['nanjing', 'suzhou', 'jiangxi'],
  nanjing: ['hangzhou', 'suzhou', 'hubei'],
  suzhou: ['hangzhou', 'nanjing', 'fujian'],
  fujian: ['suzhou', 'jiangxi', 'guangdong'],
  guangdong: ['fujian', 'jiangxi', 'yunnan'],
  jiangxi: ['hangzhou', 'fujian', 'guangdong', 'hunan'],
  hunan: ['jiangxi', 'hubei', 'yunnan', 'sichuan'],
  hubei: ['nanjing', 'hunan', 'sichuan'],
  sichuan: ['hubei', 'hunan', 'yunnan', 'tibet_east'],
  yunnan: ['hunan', 'guangdong', 'sichuan'],
  // Khwarezm
  samarkand: ['bukhara', 'ferghana', 'balkh', 'kashgar'],
  bukhara: ['samarkand', 'urgench', 'merv', 'khiva'],
  urgench: ['bukhara', 'khiva'],
  merv: ['bukhara', 'nishapur', 'balkh', 'herat'],
  nishapur: ['merv', 'ray', 'herat'],
  herat: ['merv', 'nishapur', 'balkh', 'isfahan'],
  balkh: ['samarkand', 'merv', 'herat', 'ferghana'],
  ferghana: ['samarkand', 'balkh', 'kashgar', 'semirechye'],
  khiva: ['bukhara', 'urgench'],
  kashgar: ['samarkand', 'ferghana', 'khotan', 'turfan'],
  // Persia
  isfahan: ['ray', 'shiraz', 'kerman', 'herat'],
  shiraz: ['isfahan', 'kerman', 'hormuz'],
  tabriz: ['ray', 'georgia', 'armenia', 'azerbaijan'],
  ray: ['tabriz', 'nishapur', 'isfahan', 'shirvan'],
  kerman: ['isfahan', 'shiraz', 'hormuz'],
  hormuz: ['shiraz', 'kerman'],
  // Rus
  novgorod: ['pskov', 'vladimir', 'tver'],
  kiev: ['chernigov', 'smolensk'],
  vladimir: ['novgorod', 'tver', 'ryazan'],
  smolensk: ['novgorod', 'chernigov', 'tver', 'kiev'],
  ryazan: ['vladimir', 'tver'],
  chernigov: ['smolensk', 'kiev'],
  pskov: ['novgorod'],
  tver: ['novgorod', 'vladimir', 'smolensk', 'ryazan'],
  // Central Asia
  khotan: ['kashgar', 'tibet_west', 'dunhuang'],
  dunhuang: ['khotan', 'turfan'],
  turfan: ['dunhuang', 'kashgar', 'dzungaria'],
  dzungaria: ['turfan', 'semirechye', 'altai', 'mongol_west'],
  semirechye: ['dzungaria', 'ferghana', 'altai'],
  // Tibet
  lhasa: ['tibet_east', 'tibet_west', 'khotan'],
  tibet_east: ['lhasa', 'sichuan', 'yunnan'],
  tibet_west: ['lhasa', 'khotan', 'kashgar'],
  // Caucasus
  georgia: ['armenia', 'azerbaijan', 'tabriz'],
  armenia: ['georgia', 'tabriz'],
  azerbaijan: ['georgia', 'shirvan', 'tabriz'],
  shirvan: ['azerbaijan', 'ray'],
  // Siberia
  siberia_west: ['siberia_central'],
  siberia_central: ['siberia_west', 'siberia_east'],
  siberia_east: ['siberia_central', 'baikal', 'yakutia'],
  yakutia: ['siberia_east', 'manchuria_north'],
  // Manchuria
  manchuria_north: ['kerulen', 'baikal'],
  // Korea
  goryeo: ['korea_south'],
  korea_south: ['goryeo'],
};

// Apply adjacency
ALL_PROVINCES_1206.forEach(province => {
  province.neighbors = PROVINCE_ADJACENCY[province.id] || [];
});

// Helper used by game state hook
export const getProvincesWithAdjacency = (): Province[] =>
  ALL_PROVINCES_1206.map(p => ({ ...p, neighbors: PROVINCE_ADJACENCY[p.id] || [] }));
