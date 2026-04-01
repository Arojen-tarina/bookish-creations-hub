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
    center: { x: 34, y: 40 },
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
    center: { x: 78, y: 28 },
  }),
  p('dzungaria', 'Dzungaria', 'central_asia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 70, y: 32 },
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
    center: { x: 72, y: 22 },
  }),
  p('gobi_north', 'Pohjois-Gobi', 'mongolia', 'desert', 'mongol', {
    baseTax: 1, baseManpower: 2,
    center: { x: 90, y: 47 },
  }),
  // MANCHURIA
  // CENTRAL ASIA EDGES
];

// ============= SOUTH WEST (Caucasus, Persia, Western Khwarezm) =============
// Coordinates: x < 45, y >= 40
const southWestProvinces: Province[] = [
  // CAUCASUS
  p('azerbaijan', 'Azerbaijan', 'caucasus', 'hills', 'khwarezm', {
    baseTax: 4, baseManpower: 5, tradeGood: 'iron',
    center: { x: 48, y: 84 },
  }),
  p('shirvan', 'Shirvan', 'caucasus', 'hills', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 32, y: 78 },
  }),
  // KHWAREZM
  p('khiva', 'Khiva', 'khwarezm', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 38, y: 68 },
  }),
  p('urgench', 'Urgench', 'khwarezm', 'grassland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 2,
    center: { x: 42, y: 81 },
  }),
  p('bukhara', 'Bukhara', 'transoxiana', 'farmland', 'khwarezm', {
    baseTax: 8, baseManpower: 10, fortLevel: 2, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 52, y: 74 },
  }),
  p('merv', 'Merv', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, hasSilkRoad: true,
    center: { x: 52, y: 90 },
  }),
  p('nishapur', 'Nishapur', 'khorasan', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, hasSilkRoad: true, tradeGood: 'gems',
    center: { x: 36, y: 94 },
  }),
  p('balkh', 'Balkh', 'khorasan', 'grassland', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 54, y: 80 },
  }),
  p('herat', 'Herat', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 58, y: 86 },
  }),
  p('samarkand', 'Samarkand', 'transoxiana', 'farmland', 'khwarezm', {
    isCapital: true, baseTax: 10, baseManpower: 12, fortLevel: 3, developmentLevel: 5,
    hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 46, y: 72 },
  }),
  // PERSIA
  p('isfahan', 'Isfahan', 'persia', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, tradeGood: 'silk',
    center: { x: 34, y: 86 },
  }),
  p('shiraz', 'Shiraz', 'persia', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 7, tradeGood: 'spices',
    center: { x: 42, y: 96 },
  }),
  p('tabriz', 'Tabriz', 'persia', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 30, y: 70 },
  }),
  p('ray', 'Ray (Tehran)', 'persia', 'hills', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 26, y: 62 },
  }),
  p('kerman', 'Kerman', 'persia', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 50, y: 95 },
  }),
  p('hormuz', 'Hormuz', 'persia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 3, isCoastal: true, tradeGood: 'spices',
    center: { x: 46, y: 100 },
  }),
];

// ============= SOUTH EAST (Song China, Xia, Central Asia, Tibet, Korea) =============
// Coordinates: x >= 45, y >= 40
const southEastProvinces: Province[] = [
  // CENTRAL ASIA
  p('kashgar', 'Kashgar', 'central_asia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 5, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 60, y: 68 },
  }),
  // GOBI
  p('gobi_south', 'Etelä-Gobi', 'mongolia', 'desert', 'mongol', {
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
  // TURFAN - Central Asia, assigned to Song
  p('turfan', 'Turfan', 'central_asia', 'desert', 'song', {
    baseTax: 2, baseManpower: 3, hasSilkRoad: true, tradeGood: 'spices',
    center: { x: 76, y: 105 },
  }),
];

// Combine all provinces organized by map quadrant (NW, NE, SW, SE)
export const ALL_PROVINCES_1206: Province[] = [
  ...northWestProvinces,
  ...northEastProvinces,
  ...southWestProvinces,
  ...southEastProvinces,
];

// Adjacency - Each province connected to its 3 nearest neighbors by distance (ignoring ownership)
export const PROVINCE_ADJACENCY: Record<string, string[]> = {
  altai: ['mongol_central', 'baikal', 'dzungaria'],
  azerbaijan: ['urgench', 'merv', 'balkh'],
  baikal: ['altai', 'dzungaria', 'mongol_central'],
  balkh: ['bukhara', 'azerbaijan', 'herat'],
  bukhara: ['balkh', 'samarkand', 'kashgar'],
  chernigov: ['tver', 'pskov', 'smolensk'],
  dzungaria: ['mongol_central', 'altai', 'baikal'],
  fujian: ['jiangxi', 'hangzhou', 'suzhou'],
  gobi_north: ['gobi_south', 'karakorum', 'mongol_east'],
  gobi_south: ['onon', 'gobi_north', 'mongol_east'],
  guangdong: ['jiangxi', 'fujian', 'turfan'],
  hangzhou: ['nanjing', 'fujian', 'suzhou'],
  herat: ['merv', 'balkh', 'azerbaijan'],
  hormuz: ['shiraz', 'kerman', 'merv'],
  hubei: ['nanjing', 'hunan', 'sichuan'],
  hunan: ['hubei', 'jiangxi', 'yunnan'],
  isfahan: ['shirvan', 'nishapur', 'urgench'],
  jiangxi: ['fujian', 'guangdong', 'hunan'],
  karakorum: ['mongol_central', 'mongol_east', 'altai'],
  kashgar: ['bukhara', 'balkh', 'samarkand'],
  kerman: ['merv', 'hormuz', 'shiraz'],
  kerulen: ['onon', 'mongol_east', 'gobi_south'],
  khiva: ['tabriz', 'samarkand', 'shirvan'],
  kiev: ['smolensk', 'ray', 'khiva'],
  merv: ['kerman', 'azerbaijan', 'herat'],
  mongol_central: ['altai', 'karakorum', 'dzungaria'],
  mongol_east: ['karakorum', 'kerulen', 'mongol_central'],
  mongol_west: ['dzungaria', 'ryazan', 'mongol_central'],
  nanjing: ['hangzhou', 'hubei', 'jiangxi'],
  nishapur: ['shiraz', 'isfahan', 'hormuz'],
  novgorod: ['semirechye', 'chernigov', 'pskov'],
  onon: ['gobi_south', 'kerulen', 'mongol_east'],
  pskov: ['chernigov', 'smolensk', 'novgorod'],
  ray: ['kiev', 'tabriz', 'khiva'],
  ryazan: ['mongol_west', 'tver', 'dzungaria'],
  samarkand: ['bukhara', 'khiva', 'urgench'],
  semirechye: ['novgorod', 'vladimir', 'tver'],
  shiraz: ['hormuz', 'nishapur', 'kerman'],
  shirvan: ['isfahan', 'tabriz', 'urgench'],
  siberia_west: ['semirechye', 'vladimir', 'novgorod'],
  sichuan: ['hubei', 'hunan', 'yunnan'],
  smolensk: ['kiev', 'chernigov', 'pskov'],
  suzhou: ['hangzhou', 'fujian', 'jiangxi'],
  tabriz: ['shirvan', 'khiva', 'ray'],
  turfan: ['yunnan', 'guangdong', 'hunan'],
  tver: ['chernigov', 'semirechye', 'vladimir'],
  urgench: ['azerbaijan', 'isfahan', 'samarkand'],
  vladimir: ['semirechye', 'tver', 'chernigov'],
  yunnan: ['turfan', 'hunan', 'sichuan'],
};

// Apply adjacency
ALL_PROVINCES_1206.forEach(province => {
  province.neighbors = PROVINCE_ADJACENCY[province.id] || [];
});

// Helper used by game state hook
export const getProvincesWithAdjacency = (): Province[] =>
  ALL_PROVINCES_1206.map(p => ({ ...p, neighbors: PROVINCE_ADJACENCY[p.id] || [] }));
