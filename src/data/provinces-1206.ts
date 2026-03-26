/**
 * provinces-1206.ts — Provinssidata vuoden 1206 aloitusta varten
 *
 * ~40 provinssia historiallisesti tärkeiltä alueilta (Mongolia, Kiina,
 * Keski-Aasia, Persia, Venäjä). Sisältää maaston, verot, miesvoiman,
 * kauppatavarat, Silkkitie-merkinnät ja aloitusomistajat.
 */
// Province data for 1206 start - Eurasian map with ~250 provinces
// Simplified version focusing on historically important regions

import { Province, FactionId } from '@/types/province';

// Helper to create province
const p = (
  id: string,
  name: string,
  region: Province['region'],
  terrain: Province['terrain'],
  ownerId: FactionId | null,
  options: Partial<Province> = {}
): Province => ({
  id,
  name,
  region,
  terrain,
  ownerId,
  isCoastal: false,
  isCapital: false,
  neighbors: [],
  baseTax: 2,
  baseManpower: 3,
  supply: 3,
  hasSilkRoad: false,
  unrest: 0,
  fortLevel: 0,
  developmentLevel: 1,
  buildings: [],
  garrison: 0,
  center: { x: 0, y: 0 },
  ...options,
});

// ============= MONGOLIA REGION =============
// Coordinates spread for game readability (min ~2.0 unit spacing)
const mongoliaProvinces: Province[] = [
  p('karakorum', 'Karakorum', 'mongolia', 'steppe', 'mongol', {
    isCapital: true, baseTax: 5, baseManpower: 8, fortLevel: 2, developmentLevel: 3,
    center: { x: 81, y: 12.5 },
  }),
  p('mongol_east', 'Itä-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 5, tradeGood: 'horses',
    center: { x: 84, y: 12 },
  }),
  p('mongol_central', 'Keski-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 6, tradeGood: 'livestock',
    center: { x: 79, y: 13.5 },
  }),
  p('mongol_west', 'Länsi-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 1, baseManpower: 4, tradeGood: 'horses',
    center: { x: 77, y: 11 },
  }),
  p('gobi_north', 'Pohjois-Gobi', 'mongolia', 'desert', 'mongol', {
    baseTax: 1, baseManpower: 2,
    center: { x: 80, y: 15 },
  }),
  p('gobi_south', 'Etelä-Gobi', 'mongolia', 'desert', null, {
    baseTax: 1, baseManpower: 1,
    center: { x: 82, y: 16.5 },
  }),
  p('baikal', 'Baikaljärvi', 'mongolia', 'taiga', 'mongol', {
    baseTax: 2, baseManpower: 3, tradeGood: 'fur',
    center: { x: 83, y: 8.5 },
  }),
  p('kerulen', 'Kerulenjoki', 'mongolia', 'grassland', 'mongol', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 84.5, y: 11 },
  }),
  p('onon', 'Ononjoki', 'mongolia', 'grassland', 'mongol', {
    baseTax: 2, baseManpower: 4,
    center: { x: 86.5, y: 10 },
  }),
  p('altai', 'Altai', 'mongolia', 'mountain', null, {
    baseTax: 1, baseManpower: 2, fortLevel: 1,
    center: { x: 74, y: 11 },
  }),
];

// ============= JIN CHINA REGION =============
const jinProvinces: Province[] = [
  p('zhongdu', 'Zhongdu (Beijing)', 'jin_china', 'farmland', 'jin', {
    isCapital: true, baseTax: 10, baseManpower: 15, fortLevel: 3, developmentLevel: 5,
    tradeGood: 'silk', hasSilkRoad: true,
    center: { x: 87, y: 17.5 },
  }),
  p('datong', 'Datong', 'jin_china', 'hills', 'jin', {
    baseTax: 5, baseManpower: 8, fortLevel: 2, tradeGood: 'iron',
    center: { x: 84.5, y: 17 },
  }),
  p('taiyuan', 'Taiyuan', 'jin_china', 'farmland', 'jin', {
    baseTax: 6, baseManpower: 10, fortLevel: 1, tradeGood: 'grain',
    center: { x: 83.5, y: 20 },
  }),
  p('kaifeng', 'Kaifeng', 'jin_china', 'farmland', 'jin', {
    baseTax: 8, baseManpower: 12, fortLevel: 2, tradeGood: 'silk',
    center: { x: 85.5, y: 21 },
  }),
  p('luoyang', 'Luoyang', 'jin_china', 'farmland', 'jin', {
    baseTax: 7, baseManpower: 10, fortLevel: 1,
    center: { x: 81, y: 22 },
  }),
  p('shandong', 'Shandong', 'jin_china', 'farmland', 'jin', {
    baseTax: 6, baseManpower: 8, isCoastal: true, tradeGood: 'salt',
    center: { x: 88.5, y: 19 },
  }),
  p('hebei_north', 'Pohjois-Hebei', 'jin_china', 'farmland', 'jin', {
    baseTax: 5, baseManpower: 8, fortLevel: 1,
    center: { x: 87.5, y: 15.5 },
  }),
  p('shanxi_north', 'Pohjois-Shanxi', 'jin_china', 'hills', 'jin', {
    baseTax: 4, baseManpower: 6, tradeGood: 'iron',
    center: { x: 85, y: 19 },
  }),
  p('liaoyang', 'Liaoyang', 'manchuria', 'grassland', 'jin', {
    baseTax: 4, baseManpower: 6, fortLevel: 1,
    center: { x: 89, y: 15 },
  }),
  p('liaodong', 'Liaodong', 'manchuria', 'hills', 'jin', {
    baseTax: 3, baseManpower: 5, isCoastal: true,
    center: { x: 90, y: 17 },
  }),
  p('manchuria_central', 'Keski-Mantšuria', 'manchuria', 'forest', 'jin', {
    baseTax: 2, baseManpower: 4, tradeGood: 'fur',
    center: { x: 91, y: 13 },
  }),
  p('manchuria_north', 'Pohjois-Mantšuria', 'manchuria', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 90.5, y: 11 },
  }),
];

// ============= XI XIA REGION =============
const xixiaProvinces: Province[] = [
  p('xingqing', 'Xingqing', 'xixia', 'grassland', 'xixia', {
    isCapital: true, baseTax: 5, baseManpower: 7, fortLevel: 2, developmentLevel: 3,
    hasSilkRoad: true,
    center: { x: 79.5, y: 19 },
  }),
  p('ganzhou', 'Ganzhou', 'xixia', 'desert', 'xixia', {
    baseTax: 3, baseManpower: 4, hasSilkRoad: true, tradeGood: 'salt',
    center: { x: 77.5, y: 17.5 },
  }),
  p('liangzhou', 'Liangzhou', 'xixia', 'grassland', 'xixia', {
    baseTax: 4, baseManpower: 5, hasSilkRoad: true,
    center: { x: 78, y: 20 },
  }),
  p('xixia_north', 'Pohjois-Xia', 'xixia', 'steppe', 'xixia', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 79, y: 17 },
  }),
  p('ordos', 'Ordos', 'xixia', 'desert', 'xixia', {
    baseTax: 1, baseManpower: 3,
    center: { x: 83, y: 18.5 },
  }),
];

// ============= SONG CHINA REGION =============
const songProvinces: Province[] = [
  p('hangzhou', 'Hangzhou', 'song_china', 'farmland', 'song', {
    isCapital: true, baseTax: 12, baseManpower: 15, fortLevel: 2, developmentLevel: 5,
    isCoastal: true, tradeGood: 'silk',
    center: { x: 88.5, y: 24.5 },
  }),
  p('nanjing', 'Nanjing', 'song_china', 'farmland', 'song', {
    baseTax: 9, baseManpower: 12, fortLevel: 2, tradeGood: 'silk',
    center: { x: 87.5, y: 22.5 },
  }),
  p('suzhou', 'Suzhou', 'song_china', 'farmland', 'song', {
    baseTax: 8, baseManpower: 10, isCoastal: true, tradeGood: 'silk',
    center: { x: 90.5, y: 22 },
  }),
  p('fujian', 'Fujian', 'song_china', 'hills', 'song', {
    baseTax: 5, baseManpower: 7, isCoastal: true, tradeGood: 'spices',
    center: { x: 88, y: 27 },
  }),
  p('guangdong', 'Guangdong', 'song_china', 'farmland', 'song', {
    baseTax: 6, baseManpower: 8, isCoastal: true, tradeGood: 'spices',
    center: { x: 85, y: 29 },
  }),
  p('jiangxi', 'Jiangxi', 'song_china', 'hills', 'song', {
    baseTax: 5, baseManpower: 7, tradeGood: 'grain',
    center: { x: 86, y: 25.5 },
  }),
  p('hunan', 'Hunan', 'song_china', 'farmland', 'song', {
    baseTax: 5, baseManpower: 7, tradeGood: 'grain',
    center: { x: 83, y: 25 },
  }),
  p('hubei', 'Hubei', 'song_china', 'farmland', 'song', {
    baseTax: 6, baseManpower: 8, tradeGood: 'grain',
    center: { x: 83, y: 23 },
  }),
  p('sichuan', 'Sichuan', 'song_china', 'hills', 'song', {
    baseTax: 7, baseManpower: 10, fortLevel: 2, tradeGood: 'salt',
    center: { x: 79, y: 23 },
  }),
  p('yunnan', 'Yunnan', 'song_china', 'mountain', 'song', {
    baseTax: 3, baseManpower: 5, tradeGood: 'gems',
    center: { x: 78, y: 26 },
  }),
];

// ============= KHWAREZM REGION =============
const khwarezmProvinces: Province[] = [
  p('samarkand', 'Samarkand', 'transoxiana', 'farmland', 'khwarezm', {
    isCapital: true, baseTax: 10, baseManpower: 12, fortLevel: 3, developmentLevel: 5,
    hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 69, y: 17 },
  }),
  p('bukhara', 'Bukhara', 'transoxiana', 'farmland', 'khwarezm', {
    baseTax: 8, baseManpower: 10, fortLevel: 2, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 67, y: 19 },
  }),
  p('urgench', 'Urgench', 'khwarezm', 'grassland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 2,
    center: { x: 66, y: 16 },
  }),
  p('merv', 'Merv', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, hasSilkRoad: true,
    center: { x: 67.5, y: 21.5 },
  }),
  p('nishapur', 'Nishapur', 'khorasan', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, hasSilkRoad: true, tradeGood: 'gems',
    center: { x: 64.5, y: 22 },
  }),
  p('herat', 'Herat', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 68, y: 23.5 },
  }),
  p('balkh', 'Balkh', 'khorasan', 'grassland', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 70, y: 19 },
  }),
  p('ferghana', 'Ferghana', 'transoxiana', 'farmland', 'khwarezm', {
    baseTax: 5, baseManpower: 7, tradeGood: 'horses',
    center: { x: 71, y: 15 },
  }),
  p('khiva', 'Khiva', 'khwarezm', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 64.5, y: 14.5 },
  }),
  p('kashgar', 'Kashgar', 'central_asia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 5, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 73, y: 17 },
  }),
];

// ============= PERSIA REGION =============
const persiaProvinces: Province[] = [
  p('isfahan', 'Isfahan', 'persia', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, tradeGood: 'silk',
    center: { x: 63, y: 24.5 },
  }),
  p('shiraz', 'Shiraz', 'persia', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 7, tradeGood: 'spices',
    center: { x: 62, y: 27 },
  }),
  p('tabriz', 'Tabriz', 'persia', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 59, y: 22.5 },
  }),
  p('ray', 'Ray (Tehran)', 'persia', 'hills', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 63, y: 21 },
  }),
  p('kerman', 'Kerman', 'persia', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 66, y: 26 },
  }),
  p('hormuz', 'Hormuz', 'persia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 3, isCoastal: true, tradeGood: 'spices',
    center: { x: 65, y: 28.5 },
  }),
];

// ============= RUS REGION =============
const rusProvinces: Province[] = [
  p('novgorod', 'Novgorod', 'rus', 'forest', 'rus', {
    isCapital: true, baseTax: 6, baseManpower: 8, fortLevel: 2, developmentLevel: 3,
    tradeGood: 'fur',
    center: { x: 52, y: 8 },
  }),
  p('kiev', 'Kiova', 'rus', 'farmland', 'rus', {
    baseTax: 7, baseManpower: 10, fortLevel: 2, tradeGood: 'grain',
    center: { x: 50, y: 16.5 },
  }),
  p('vladimir', 'Vladimir', 'rus', 'forest', 'rus', {
    baseTax: 5, baseManpower: 7, fortLevel: 1, tradeGood: 'fur',
    center: { x: 58, y: 9 },
  }),
  p('smolensk', 'Smolensk', 'rus', 'forest', 'rus', {
    baseTax: 4, baseManpower: 6, fortLevel: 1,
    center: { x: 52, y: 11 },
  }),
  p('ryazan', 'Rjazan', 'rus', 'forest', 'rus', {
    baseTax: 4, baseManpower: 6,
    center: { x: 57, y: 12 },
  }),
  p('chernigov', 'Tšernihiv', 'rus', 'farmland', 'rus', {
    baseTax: 5, baseManpower: 7,
    center: { x: 52, y: 14 },
  }),
  p('pskov', 'Pihkova', 'rus', 'forest', 'rus', {
    baseTax: 3, baseManpower: 4, tradeGood: 'fur',
    center: { x: 50, y: 6.5 },
  }),
  p('tver', 'Tver', 'rus', 'forest', 'rus', {
    baseTax: 3, baseManpower: 5,
    center: { x: 55, y: 8 },
  }),
];

// ============= KIPCHAK STEPPE =============
const kipchakProvinces: Province[] = [
  p('sarkel', 'Sarkel', 'kipchak', 'steppe', 'kipchak', {
    isCapital: true, baseTax: 3, baseManpower: 6, fortLevel: 1, developmentLevel: 2,
    tradeGood: 'horses',
    center: { x: 59, y: 16 },
  }),
  p('kipchak_west', 'Länsi-Kipčak', 'kipchak', 'steppe', 'kipchak', {
    baseTax: 2, baseManpower: 5, tradeGood: 'horses',
    center: { x: 56, y: 15 },
  }),
  p('kipchak_central', 'Keski-Kipčak', 'kipchak', 'steppe', 'kipchak', {
    baseTax: 2, baseManpower: 5, tradeGood: 'livestock',
    center: { x: 63, y: 12 },
  }),
  p('kipchak_east', 'Itä-Kipčak', 'kipchak', 'steppe', 'kipchak', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 67, y: 13 },
  }),
  p('volga_bulgars', 'Volgan Bulgaria', 'kipchak', 'grassland', null, {
    baseTax: 4, baseManpower: 5, tradeGood: 'fur',
    center: { x: 62, y: 9 },
  }),
  p('khazaria', 'Khazaria', 'kipchak', 'steppe', null, {
    baseTax: 3, baseManpower: 4,
    center: { x: 61.5, y: 18.5 },
  }),
];

// ============= CENTRAL ASIA =============
const centralAsiaProvinces: Province[] = [
  p('khotan', 'Khotan', 'central_asia', 'desert', null, {
    baseTax: 3, baseManpower: 3, hasSilkRoad: true, tradeGood: 'gems',
    center: { x: 73, y: 20 },
  }),
  p('dunhuang', 'Dunhuang', 'central_asia', 'desert', null, {
    baseTax: 3, baseManpower: 3, hasSilkRoad: true,
    center: { x: 77, y: 16 },
  }),
  p('turfan', 'Turfan', 'central_asia', 'desert', null, {
    baseTax: 2, baseManpower: 3, hasSilkRoad: true, tradeGood: 'spices',
    center: { x: 75, y: 14.5 },
  }),
  p('dzungaria', 'Dzungaria', 'central_asia', 'steppe', null, {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 73.5, y: 12.5 },
  }),
  p('semirechye', 'Seitsemän joki', 'central_asia', 'grassland', null, {
    baseTax: 3, baseManpower: 5, tradeGood: 'horses',
    center: { x: 71, y: 13.5 },
  }),
];

// ============= TIBET =============
const tibetProvinces: Province[] = [
  p('lhasa', 'Lhasa', 'tibet', 'mountain', null, {
    baseTax: 3, baseManpower: 4, fortLevel: 2, tradeGood: 'salt',
    center: { x: 75, y: 22 },
  }),
  p('tibet_east', 'Itä-Tiibet', 'tibet', 'mountain', null, {
    baseTax: 2, baseManpower: 3,
    center: { x: 77.5, y: 21 },
  }),
  p('tibet_west', 'Länsi-Tiibet', 'tibet', 'mountain', null, {
    baseTax: 1, baseManpower: 2,
    center: { x: 71, y: 22 },
  }),
];

// ============= CAUCASUS =============
const caucasusProvinces: Province[] = [
  p('georgia', 'Georgia', 'caucasus', 'mountain', null, {
    baseTax: 4, baseManpower: 5, fortLevel: 1, tradeGood: 'gold',
    center: { x: 56, y: 19 },
  }),
  p('armenia', 'Armenia', 'caucasus', 'mountain', null, {
    baseTax: 3, baseManpower: 4, fortLevel: 1,
    center: { x: 55.5, y: 21.5 },
  }),
  p('azerbaijan', 'Azerbaijan', 'caucasus', 'hills', 'khwarezm', {
    baseTax: 4, baseManpower: 5, tradeGood: 'iron',
    center: { x: 59.5, y: 20 },
  }),
  p('shirvan', 'Shirvan', 'caucasus', 'hills', 'khwarezm', {
    baseTax: 3, baseManpower: 4,
    center: { x: 63.5, y: 17 },
  }),
];

// ============= SIBERIA =============
const siberiaProvinces: Province[] = [
  p('siberia_west', 'Länsi-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 66, y: 6 },
  }),
  p('siberia_central', 'Keski-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 74, y: 5 },
  }),
  p('siberia_east', 'Itä-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 1, tradeGood: 'fur',
    center: { x: 83, y: 6 },
  }),
  p('yakutia', 'Jakutia', 'siberia', 'tundra', null, {
    baseTax: 0, baseManpower: 1,
    center: { x: 92, y: 4 },
  }),
];

// ============= KOREA =============
const koreaProvinces: Province[] = [
  p('goryeo', 'Goryeo', 'korea', 'hills', null, {
    baseTax: 5, baseManpower: 6, fortLevel: 1, isCoastal: true,
    center: { x: 91, y: 19 },
  }),
  p('korea_south', 'Etelä-Korea', 'korea', 'farmland', null, {
    baseTax: 4, baseManpower: 5, isCoastal: true, tradeGood: 'grain',
    center: { x: 91, y: 21.5 },
  }),
];

// Combine all provinces
export const ALL_PROVINCES_1206: Province[] = [
  ...mongoliaProvinces,
  ...jinProvinces,
  ...xixiaProvinces,
  ...songProvinces,
  ...khwarezmProvinces,
  ...persiaProvinces,
  ...rusProvinces,
  ...kipchakProvinces,
  ...centralAsiaProvinces,
  ...tibetProvinces,
  ...caucasusProvinces,
  ...siberiaProvinces,
  ...koreaProvinces,
];

// Define adjacency (simplified - will be calculated from GeoJSON in production)
export const PROVINCE_ADJACENCY: Record<string, string[]> = {
  // Mongolia
  karakorum: ['mongol_east', 'mongol_central', 'mongol_west', 'gobi_north'],
  mongol_east: ['karakorum', 'mongol_central', 'kerulen', 'onon', 'baikal'],
  mongol_central: ['karakorum', 'mongol_east', 'mongol_west', 'gobi_north'],
  mongol_west: ['karakorum', 'mongol_central', 'altai', 'dzungaria'],
  gobi_north: ['karakorum', 'mongol_central', 'gobi_south'],
  gobi_south: ['gobi_north', 'xixia_north', 'ordos'],
  baikal: ['mongol_east', 'onon', 'siberia_east'],
  kerulen: ['mongol_east', 'onon', 'manchuria_north'],
  onon: ['mongol_east', 'kerulen', 'baikal', 'manchuria_central'],
  altai: ['mongol_west', 'dzungaria', 'semirechye'],
  
  // Jin China
  zhongdu: ['datong', 'hebei_north', 'shandong', 'liaoyang'],
  datong: ['zhongdu', 'taiyuan', 'shanxi_north', 'ordos'],
  taiyuan: ['datong', 'kaifeng', 'luoyang', 'shanxi_north'],
  kaifeng: ['taiyuan', 'luoyang', 'shandong', 'hubei'],
  luoyang: ['taiyuan', 'kaifeng', 'hubei', 'sichuan'],
  shandong: ['zhongdu', 'kaifeng', 'nanjing'],
  hebei_north: ['zhongdu', 'liaoyang', 'datong'],
  shanxi_north: ['datong', 'taiyuan', 'ordos'],
  liaoyang: ['zhongdu', 'hebei_north', 'liaodong', 'manchuria_central'],
  liaodong: ['liaoyang', 'goryeo'],
  manchuria_central: ['liaoyang', 'onon', 'manchuria_north'],
  manchuria_north: ['manchuria_central', 'kerulen', 'baikal'],
  
  // Xi Xia
  xingqing: ['ganzhou', 'liangzhou', 'xixia_north', 'ordos'],
  ganzhou: ['xingqing', 'liangzhou', 'dunhuang'],
  liangzhou: ['xingqing', 'ganzhou', 'sichuan'],
  xixia_north: ['xingqing', 'gobi_south', 'ordos'],
  ordos: ['xingqing', 'xixia_north', 'gobi_south', 'datong', 'shanxi_north'],
  
  // Song China
  hangzhou: ['nanjing', 'suzhou', 'jiangxi'],
  nanjing: ['hangzhou', 'suzhou', 'shandong', 'hubei'],
  suzhou: ['hangzhou', 'nanjing', 'fujian'],
  fujian: ['suzhou', 'jiangxi', 'guangdong'],
  guangdong: ['fujian', 'jiangxi', 'yunnan'],
  jiangxi: ['hangzhou', 'fujian', 'guangdong', 'hunan'],
  hunan: ['jiangxi', 'hubei', 'yunnan', 'sichuan'],
  hubei: ['kaifeng', 'luoyang', 'nanjing', 'hunan', 'sichuan'],
  sichuan: ['luoyang', 'hubei', 'hunan', 'yunnan', 'liangzhou', 'tibet_east'],
  yunnan: ['hunan', 'guangdong', 'sichuan'],
  
  // Khwarezm
  samarkand: ['bukhara', 'ferghana', 'balkh', 'kashgar'],
  bukhara: ['samarkand', 'urgench', 'merv', 'khiva'],
  urgench: ['bukhara', 'khiva', 'kipchak_east'],
  merv: ['bukhara', 'nishapur', 'balkh', 'herat'],
  nishapur: ['merv', 'ray', 'herat'],
  herat: ['merv', 'nishapur', 'balkh', 'isfahan', 'kerman'],
  balkh: ['samarkand', 'merv', 'herat', 'kashgar'],
  ferghana: ['samarkand', 'semirechye', 'kashgar'],
  khiva: ['bukhara', 'urgench', 'kipchak_east'],
  kashgar: ['samarkand', 'balkh', 'ferghana', 'khotan', 'dunhuang'],
  
  // Persia
  isfahan: ['ray', 'shiraz', 'herat', 'kerman'],
  shiraz: ['isfahan', 'kermanhormuz'],
  tabriz: ['ray', 'azerbaijan', 'armenia', 'georgia'],
  ray: ['nishapur', 'isfahan', 'tabriz'],
  kerman: ['isfahan', 'herat', 'hormuz'],
  hormuz: ['shiraz', 'kerman'],
  
  // Rus
  novgorod: ['pskov', 'tver', 'vladimir'],
  kiev: ['smolensk', 'chernigov', 'kipchak_west'],
  vladimir: ['novgorod', 'tver', 'ryazan', 'volga_bulgars'],
  smolensk: ['novgorod', 'tver', 'kiev', 'chernigov'],
  ryazan: ['vladimir', 'chernigov', 'kipchak_west'],
  chernigov: ['kiev', 'smolensk', 'ryazan', 'kipchak_west'],
  pskov: ['novgorod'],
  tver: ['novgorod', 'vladimir', 'smolensk'],
  
  // Kipchak
  sarkel: ['kipchak_west', 'kipchak_central', 'khazaria'],
  kipchak_west: ['sarkel', 'kipchak_central', 'kiev', 'chernigov', 'ryazan'],
  kipchak_central: ['sarkel', 'kipchak_west', 'kipchak_east', 'volga_bulgars', 'khazaria'],
  kipchak_east: ['kipchak_central', 'urgench', 'khiva', 'semirechye'],
  volga_bulgars: ['vladimir', 'kipchak_central', 'siberia_west'],
  khazaria: ['sarkel', 'kipchak_central', 'shirvan', 'georgia'],
  
  // Central Asia
  khotan: ['kashgar', 'dunhuang', 'tibet_west'],
  dunhuang: ['kashgar', 'khotan', 'turfan', 'ganzhou'],
  turfan: ['dunhuang', 'dzungaria'],
  dzungaria: ['altai', 'mongol_west', 'turfan', 'semirechye'],
  semirechye: ['altai', 'dzungaria', 'ferghana', 'kipchak_east'],
  
  // Tibet
  lhasa: ['tibet_east', 'tibet_west', 'yunnan'],
  tibet_east: ['lhasa', 'sichuan', 'yunnan'],
  tibet_west: ['lhasa', 'khotan'],
  
  // Caucasus
  georgia: ['armenia', 'tabriz', 'khazaria'],
  armenia: ['georgia', 'tabriz', 'azerbaijan'],
  azerbaijan: ['armenia', 'tabriz', 'shirvan'],
  shirvan: ['azerbaijan', 'khazaria'],
  
  // Siberia
  siberia_west: ['volga_bulgars', 'siberia_central'],
  siberia_central: ['siberia_west', 'siberia_east'],
  siberia_east: ['siberia_central', 'baikal', 'yakutia'],
  yakutia: ['siberia_east'],
  
  // Korea
  goryeo: ['liaodong', 'korea_south'],
  korea_south: ['goryeo'],
};

// Apply adjacency to provinces
export const getProvincesWithAdjacency = (): Province[] => {
  return ALL_PROVINCES_1206.map(province => ({
    ...province,
    neighbors: PROVINCE_ADJACENCY[province.id] || [],
  }));
};
