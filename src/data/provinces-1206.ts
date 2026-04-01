/**
 * provinces-1206.ts — Provinssidata vuoden 1206 aloitusta varten
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

// ============= MONGOLIA =============
const mongoliaProvinces: Province[] = [
  p('karakorum', 'Karakorum', 'mongolia', 'steppe', 'mongol', {
    isCapital: true, baseTax: 5, baseManpower: 8, fortLevel: 2, developmentLevel: 3,
    center: { x: 55, y: 32 },
  }),
  p('mongol_east', 'Itä-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 5, tradeGood: 'horses',
    center: { x: 62, y: 28 },
  }),
  p('mongol_central', 'Keski-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 2, baseManpower: 6, tradeGood: 'livestock',
    center: { x: 50, y: 28 },
  }),
  p('mongol_west', 'Länsi-Mongolia', 'mongolia', 'steppe', 'mongol', {
    baseTax: 1, baseManpower: 4, tradeGood: 'horses',
    center: { x: 44, y: 30 },
  }),
  p('gobi_north', 'Pohjois-Gobi', 'mongolia', 'desert', 'mongol', {
    baseTax: 1, baseManpower: 2,
    center: { x: 58, y: 35 },
  }),
  p('gobi_south', 'Etelä-Gobi', 'mongolia', 'desert', null, {
    baseTax: 1, baseManpower: 1,
    center: { x: 64, y: 36 },
  }),
  p('baikal', 'Baikaljärvi', 'mongolia', 'taiga', 'mongol', {
    baseTax: 2, baseManpower: 3, tradeGood: 'fur',
    center: { x: 60, y: 18 },
  }),
  p('kerulen', 'Kerulenjoki', 'mongolia', 'grassland', 'mongol', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 66, y: 24 },
  }),
  p('onon', 'Ononjoki', 'mongolia', 'grassland', 'mongol', {
    baseTax: 2, baseManpower: 4,
    center: { x: 70, y: 20 },
  }),
  p('altai', 'Altai', 'mongolia', 'mountain', null, {
    baseTax: 1, baseManpower: 2, fortLevel: 1,
    center: { x: 40, y: 22 },
  }),
];

// ============= JIN CHINA =============
const jinProvinces: Province[] = [
  p('zhongdu', 'Zhongdu (Beijing)', 'jin_china', 'farmland', 'jin', {
    isCapital: true, baseTax: 10, baseManpower: 15, fortLevel: 3, developmentLevel: 5,
    tradeGood: 'silk', hasSilkRoad: true,
    center: { x: 78, y: 38 },
  }),
  p('datong', 'Datong', 'jin_china', 'hills', 'jin', {
    baseTax: 5, baseManpower: 8, fortLevel: 2, tradeGood: 'iron', hasSilkRoad: true,
    center: { x: 72, y: 40 },
  }),
  p('taiyuan', 'Taiyuan', 'jin_china', 'farmland', 'jin', {
    baseTax: 6, baseManpower: 10, fortLevel: 1, tradeGood: 'grain',
    center: { x: 72, y: 46 },
  }),
  p('kaifeng', 'Kaifeng', 'jin_china', 'farmland', 'jin', {
    baseTax: 8, baseManpower: 12, fortLevel: 2, tradeGood: 'silk',
    center: { x: 78, y: 48 },
  }),
  p('luoyang', 'Luoyang', 'jin_china', 'farmland', 'jin', {
    baseTax: 7, baseManpower: 10, fortLevel: 1,
    center: { x: 72, y: 52 },
  }),
  p('shandong', 'Shandong', 'jin_china', 'farmland', 'jin', {
    baseTax: 6, baseManpower: 8, isCoastal: true, tradeGood: 'salt',
    center: { x: 84, y: 42 },
  }),
  p('hebei_north', 'Pohjois-Hebei', 'jin_china', 'farmland', 'jin', {
    baseTax: 5, baseManpower: 8, fortLevel: 1,
    center: { x: 82, y: 34 },
  }),
  p('shanxi_north', 'Pohjois-Shanxi', 'jin_china', 'hills', 'jin', {
    baseTax: 4, baseManpower: 6, tradeGood: 'iron',
    center: { x: 68, y: 46 },
  }),
  p('liaoyang', 'Liaoyang', 'manchuria', 'grassland', 'jin', {
    baseTax: 4, baseManpower: 6, fortLevel: 1,
    center: { x: 82, y: 28 },
  }),
  p('liaodong', 'Liaodong', 'manchuria', 'hills', 'jin', {
    baseTax: 3, baseManpower: 5, isCoastal: true,
    center: { x: 86, y: 32 },
  }),
  p('manchuria_central', 'Keski-Mantšuria', 'manchuria', 'forest', 'jin', {
    baseTax: 2, baseManpower: 4, tradeGood: 'fur',
    center: { x: 78, y: 24 },
  }),
  p('manchuria_north', 'Pohjois-Mantšuria', 'manchuria', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 74, y: 18 },
  }),
];

// ============= XI XIA =============
const xixiaProvinces: Province[] = [
  p('xingqing', 'Xingqing', 'xixia', 'grassland', 'xixia', {
    isCapital: true, baseTax: 5, baseManpower: 7, fortLevel: 2, developmentLevel: 3,
    hasSilkRoad: true,
    center: { x: 62, y: 44 },
  }),
  p('ganzhou', 'Ganzhou', 'xixia', 'desert', 'xixia', {
    baseTax: 3, baseManpower: 4, hasSilkRoad: true, tradeGood: 'salt',
    center: { x: 56, y: 42 },
  }),
  p('liangzhou', 'Liangzhou', 'xixia', 'grassland', 'xixia', {
    baseTax: 4, baseManpower: 5, hasSilkRoad: true,
    center: { x: 60, y: 48 },
  }),
  p('xixia_north', 'Pohjois-Xia', 'xixia', 'steppe', 'xixia', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses', hasSilkRoad: true,
    center: { x: 59, y: 39 },
  }),
  p('ordos', 'Ordos', 'xixia', 'desert', 'xixia', {
    baseTax: 1, baseManpower: 3, hasSilkRoad: true,
    center: { x: 65, y: 40 },
  }),
];

// ============= SONG CHINA =============
const songProvinces: Province[] = [
  p('hangzhou', 'Hangzhou', 'song_china', 'farmland', 'song', {
    isCapital: true, baseTax: 12, baseManpower: 15, fortLevel: 2, developmentLevel: 5,
    isCoastal: true, tradeGood: 'silk', hasSilkRoad: true,
    center: { x: 84, y: 62 },
  }),
  p('nanjing', 'Nanjing', 'song_china', 'farmland', 'song', {
    baseTax: 9, baseManpower: 12, fortLevel: 2, tradeGood: 'silk',
    center: { x: 80, y: 56 },
  }),
  p('suzhou', 'Suzhou', 'song_china', 'farmland', 'song', {
    baseTax: 8, baseManpower: 10, isCoastal: true, tradeGood: 'silk', hasSilkRoad: true,
    center: { x: 86, y: 56 },
  }),
  p('fujian', 'Fujian', 'song_china', 'hills', 'song', {
    baseTax: 5, baseManpower: 7, isCoastal: true, tradeGood: 'spices', hasSilkRoad: true,
    center: { x: 84, y: 70 },
  }),
  p('guangdong', 'Guangdong', 'song_china', 'farmland', 'song', {
    baseTax: 6, baseManpower: 8, isCoastal: true, tradeGood: 'spices', hasSilkRoad: true,
    center: { x: 76, y: 76 },
  }),
  p('jiangxi', 'Jiangxi', 'song_china', 'hills', 'song', {
    baseTax: 5, baseManpower: 7, tradeGood: 'grain', hasSilkRoad: true,
    center: { x: 78, y: 66 },
  }),
  p('hunan', 'Hunan', 'song_china', 'farmland', 'song', {
    baseTax: 5, baseManpower: 7, tradeGood: 'grain', hasSilkRoad: true,
    center: { x: 70, y: 66 },
  }),
  p('hubei', 'Hubei', 'song_china', 'farmland', 'song', {
    baseTax: 6, baseManpower: 8, tradeGood: 'grain', hasSilkRoad: true,
    center: { x: 72, y: 58 },
  }),
  p('sichuan', 'Sichuan', 'song_china', 'hills', 'song', {
    baseTax: 7, baseManpower: 10, fortLevel: 2, tradeGood: 'salt', hasSilkRoad: true,
    center: { x: 62, y: 58 },
  }),
  p('yunnan', 'Yunnan', 'song_china', 'mountain', 'song', {
    baseTax: 3, baseManpower: 5, tradeGood: 'gems',
    center: { x: 62, y: 70 },
  }),
];

// ============= KHWAREZM =============
const khwarezmProvinces: Province[] = [
  p('samarkand', 'Samarkand', 'transoxiana', 'farmland', 'khwarezm', {
    isCapital: true, baseTax: 10, baseManpower: 12, fortLevel: 3, developmentLevel: 5,
    hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 30, y: 38 },
  }),
  p('bukhara', 'Bukhara', 'transoxiana', 'farmland', 'khwarezm', {
    baseTax: 8, baseManpower: 10, fortLevel: 2, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 26, y: 44 },
  }),
  p('urgench', 'Urgench', 'khwarezm', 'grassland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 2,
    center: { x: 26, y: 38 },
  }),
  p('merv', 'Merv', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, hasSilkRoad: true,
    center: { x: 28, y: 50 },
  }),
  p('nishapur', 'Nishapur', 'khorasan', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, hasSilkRoad: true, tradeGood: 'gems',
    center: { x: 23, y: 54 },
  }),
  p('herat', 'Herat', 'khorasan', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 34, y: 50 },
  }),
  p('balkh', 'Balkh', 'khorasan', 'grassland', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 36, y: 42 },
  }),
  p('ferghana', 'Ferghana', 'transoxiana', 'farmland', 'khwarezm', {
    baseTax: 5, baseManpower: 7, tradeGood: 'horses', hasSilkRoad: true,
    center: { x: 36, y: 34 },
  }),
  p('khiva', 'Khiva', 'khwarezm', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4, hasSilkRoad: true,
    center: { x: 18, y: 30 },
  }),
  p('kashgar', 'Kashgar', 'central_asia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 5, hasSilkRoad: true, tradeGood: 'silk',
    center: { x: 42, y: 38 },
  }),
];

// ============= PERSIA =============
const persiaProvinces: Province[] = [
  p('isfahan', 'Isfahan', 'persia', 'farmland', 'khwarezm', {
    baseTax: 7, baseManpower: 9, fortLevel: 2, tradeGood: 'silk', hasSilkRoad: true,
    center: { x: 18, y: 58 },
  }),
  p('shiraz', 'Shiraz', 'persia', 'farmland', 'khwarezm', {
    baseTax: 6, baseManpower: 7, tradeGood: 'spices', hasSilkRoad: true,
    center: { x: 14, y: 66 },
  }),
  p('tabriz', 'Tabriz', 'persia', 'hills', 'khwarezm', {
    baseTax: 6, baseManpower: 8, fortLevel: 1, hasSilkRoad: true,
    center: { x: 14, y: 50 },
  }),
  p('ray', 'Ray (Tehran)', 'persia', 'hills', 'khwarezm', {
    baseTax: 5, baseManpower: 7, hasSilkRoad: true,
    center: { x: 17, y: 45 },
  }),
  p('kerman', 'Kerman', 'persia', 'desert', 'khwarezm', {
    baseTax: 3, baseManpower: 4, hasSilkRoad: true,
    center: { x: 22, y: 62 },
  }),
  p('hormuz', 'Hormuz', 'persia', 'desert', 'khwarezm', {
    baseTax: 4, baseManpower: 3, isCoastal: true, tradeGood: 'spices', hasSilkRoad: true,
    center: { x: 20, y: 72 },
  }),
];

// ============= RUS =============
const rusProvinces: Province[] = [
  p('novgorod', 'Novgorod', 'rus', 'forest', 'rus', {
    isCapital: true, baseTax: 6, baseManpower: 8, fortLevel: 2, developmentLevel: 3,
    tradeGood: 'fur',
    center: { x: 14, y: 12 },
  }),
  p('kiev', 'Kiova', 'rus', 'farmland', 'rus', {
    baseTax: 7, baseManpower: 10, fortLevel: 2, tradeGood: 'grain',
    center: { x: 12, y: 30 },
  }),
  p('vladimir', 'Vladimir', 'rus', 'forest', 'rus', {
    baseTax: 5, baseManpower: 7, fortLevel: 1, tradeGood: 'fur',
    center: { x: 22, y: 14 },
  }),
  p('smolensk', 'Smolensk', 'rus', 'forest', 'rus', {
    baseTax: 4, baseManpower: 6, fortLevel: 1,
    center: { x: 16, y: 22 },
  }),
  p('ryazan', 'Rjazan', 'rus', 'forest', 'rus', {
    baseTax: 4, baseManpower: 6,
    center: { x: 24, y: 20 },
  }),
  p('chernigov', 'Tšernihiv', 'rus', 'farmland', 'rus', {
    baseTax: 5, baseManpower: 7,
    center: { x: 14, y: 26 },
  }),
  p('pskov', 'Pihkova', 'rus', 'forest', 'rus', {
    baseTax: 3, baseManpower: 4, tradeGood: 'fur',
    center: { x: 10, y: 16 },
  }),
  p('tver', 'Tver', 'rus', 'forest', 'rus', {
    baseTax: 3, baseManpower: 5,
    center: { x: 20, y: 18 },
  }),
];

// ============= KIPCHAK =============
const kipchakProvinces: Province[] = [
  p('sarkel', 'Sarkel', 'kipchak', 'steppe', 'kipchak', {
    isCapital: true, baseTax: 3, baseManpower: 6, fortLevel: 1, developmentLevel: 2,
    tradeGood: 'horses',
    center: { x: 23, y: 35 },
  }),
  p('kipchak_west', 'Länsi-Kipčak', 'kipchak', 'steppe', 'kipchak', {
    baseTax: 2, baseManpower: 5, tradeGood: 'horses',
    center: { x: 17, y: 37 },
  }),
  p('kipchak_central', 'Keski-Kipčak', 'kipchak', 'steppe', 'kipchak', {
    baseTax: 2, baseManpower: 5, tradeGood: 'livestock',
    center: { x: 29, y: 22 },
  }),
  p('kipchak_east', 'Itä-Kipčak', 'kipchak', 'steppe', 'kipchak', {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses',
    center: { x: 34, y: 20 },
  }),
  p('volga_bulgars', 'Volgan Bulgaria', 'kipchak', 'grassland', null, {
    baseTax: 4, baseManpower: 5, tradeGood: 'fur',
    center: { x: 28, y: 14 },
  }),
  p('khazaria', 'Khazaria', 'kipchak', 'steppe', null, {
    baseTax: 3, baseManpower: 4,
    center: { x: 21, y: 43 },
  }),
];

// ============= CENTRAL ASIA =============
const centralAsiaProvinces: Province[] = [
  p('khotan', 'Khotan', 'central_asia', 'desert', null, {
    baseTax: 3, baseManpower: 3, tradeGood: 'gems', hasSilkRoad: true,
    center: { x: 46, y: 46 },
  }),
  p('dunhuang', 'Dunhuang', 'central_asia', 'desert', null, {
    baseTax: 3, baseManpower: 3, hasSilkRoad: true,
    center: { x: 52, y: 40 },
  }),
  p('turfan', 'Turfan', 'central_asia', 'desert', null, {
    baseTax: 2, baseManpower: 3, hasSilkRoad: true, tradeGood: 'spices',
    center: { x: 46, y: 34 },
  }),
  p('dzungaria', 'Dzungaria', 'central_asia', 'steppe', null, {
    baseTax: 2, baseManpower: 4, tradeGood: 'horses', hasSilkRoad: true,
    center: { x: 42, y: 25 },
  }),
  p('semirechye', 'Seitsemän joki', 'central_asia', 'grassland', null, {
    baseTax: 3, baseManpower: 5, tradeGood: 'horses', hasSilkRoad: true,
    center: { x: 35, y: 30 },
  }),
];

// ============= TIBET =============
const tibetProvinces: Province[] = [
  p('lhasa', 'Lhasa', 'tibet', 'mountain', null, {
    baseTax: 3, baseManpower: 4, fortLevel: 2, tradeGood: 'salt',
    center: { x: 50, y: 56 },
  }),
  p('tibet_east', 'Itä-Tiibet', 'tibet', 'mountain', null, {
    baseTax: 2, baseManpower: 3,
    center: { x: 56, y: 52 },
  }),
  p('tibet_west', 'Länsi-Tiibet', 'tibet', 'mountain', null, {
    baseTax: 1, baseManpower: 2,
    center: { x: 42, y: 54 },
  }),
];

// ============= CAUCASUS =============
const caucasusProvinces: Province[] = [
  p('georgia', 'Georgia', 'caucasus', 'mountain', null, {
    baseTax: 4, baseManpower: 5, fortLevel: 1, tradeGood: 'gold', hasSilkRoad: true,
    center: { x: 11, y: 40 },
  }),
  p('armenia', 'Armenia', 'caucasus', 'mountain', null, {
    baseTax: 3, baseManpower: 4, fortLevel: 1, hasSilkRoad: true,
    center: { x: 10, y: 48 },
  }),
  p('azerbaijan', 'Azerbaijan', 'caucasus', 'hills', 'khwarezm', {
    baseTax: 4, baseManpower: 5, tradeGood: 'iron', hasSilkRoad: true,
    center: { x: 13, y: 43 },
  }),
  p('shirvan', 'Shirvan', 'caucasus', 'hills', 'khwarezm', {
    baseTax: 3, baseManpower: 4, hasSilkRoad: true,
    center: { x: 21, y: 49 },
  }),
];

// ============= SIBERIA =============
const siberiaProvinces: Province[] = [
  p('siberia_west', 'Länsi-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 34, y: 10 },
  }),
  p('siberia_central', 'Keski-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 2, tradeGood: 'fur',
    center: { x: 44, y: 12 },
  }),
  p('siberia_east', 'Itä-Siperia', 'siberia', 'taiga', null, {
    baseTax: 1, baseManpower: 1, tradeGood: 'fur',
    center: { x: 54, y: 12 },
  }),
  p('yakutia', 'Jakutia', 'siberia', 'tundra', null, {
    baseTax: 0, baseManpower: 1,
    center: { x: 68, y: 10 },
  }),
];

// ============= KOREA =============
const koreaProvinces: Province[] = [
  p('goryeo', 'Goryeo', 'korea', 'hills', null, {
    baseTax: 5, baseManpower: 6, fortLevel: 1, isCoastal: true,
    center: { x: 88, y: 40 },
  }),
  p('korea_south', 'Etelä-Korea', 'korea', 'farmland', null, {
    baseTax: 4, baseManpower: 5, isCoastal: true, tradeGood: 'grain',
    center: { x: 88, y: 48 },
  }),
];

// Combine all
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

// Adjacency
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
  herat: ['merv', 'nishapur', 'balkh', 'isfahan'],
  balkh: ['samarkand', 'merv', 'herat', 'ferghana'],
  ferghana: ['samarkand', 'balkh', 'kashgar', 'semirechye'],
  khiva: ['bukhara', 'urgench', 'kipchak_west'],
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
  kiev: ['chernigov', 'smolensk', 'kipchak_west'],
  vladimir: ['novgorod', 'tver', 'ryazan'],
  smolensk: ['novgorod', 'chernigov', 'tver', 'kiev'],
  ryazan: ['vladimir', 'tver', 'kipchak_central'],
  chernigov: ['smolensk', 'kiev', 'kipchak_west'],
  pskov: ['novgorod'],
  tver: ['novgorod', 'vladimir', 'smolensk', 'ryazan'],
  // Kipchak
  sarkel: ['kipchak_west', 'kipchak_central', 'khazaria'],
  kipchak_west: ['sarkel', 'chernigov', 'kiev', 'khazaria', 'khiva'],
  kipchak_central: ['sarkel', 'kipchak_east', 'ryazan', 'volga_bulgars'],
  kipchak_east: ['kipchak_central', 'urgench', 'semirechye'],
  volga_bulgars: ['kipchak_central', 'vladimir', 'siberia_west'],
  khazaria: ['sarkel', 'kipchak_west', 'georgia', 'azerbaijan'],
  // Central Asia
  khotan: ['kashgar', 'tibet_west', 'dunhuang'],
  dunhuang: ['khotan', 'turfan', 'ganzhou', 'xixia_north'],
  turfan: ['dunhuang', 'kashgar', 'dzungaria'],
  dzungaria: ['turfan', 'semirechye', 'altai', 'mongol_west'],
  semirechye: ['dzungaria', 'kipchak_east', 'ferghana', 'altai'],
  // Tibet
  lhasa: ['tibet_east', 'tibet_west', 'khotan'],
  tibet_east: ['lhasa', 'sichuan', 'yunnan'],
  tibet_west: ['lhasa', 'khotan', 'kashgar'],
  // Caucasus
  georgia: ['armenia', 'azerbaijan', 'tabriz', 'khazaria'],
  armenia: ['georgia', 'tabriz'],
  azerbaijan: ['georgia', 'shirvan', 'tabriz', 'khazaria'],
  shirvan: ['azerbaijan', 'ray'],
  // Siberia
  siberia_west: ['volga_bulgars', 'siberia_central', 'kipchak_central'],
  siberia_central: ['siberia_west', 'siberia_east'],
  siberia_east: ['siberia_central', 'baikal', 'yakutia'],
  yakutia: ['siberia_east', 'manchuria_north'],
  // Korea
  goryeo: ['liaodong', 'korea_south'],
  korea_south: ['goryeo'],
};

// Apply adjacency
ALL_PROVINCES_1206.forEach(province => {
  province.neighbors = PROVINCE_ADJACENCY[province.id] || [];
});

// Helper used by game state hook
export const getProvincesWithAdjacency = (): Province[] =>
  ALL_PROVINCES_1206.map(p => ({ ...p, neighbors: PROVINCE_ADJACENCY[p.id] || [] }));
