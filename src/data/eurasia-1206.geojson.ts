// GeoJSON data for Eurasia 1206 provinces
// This is a simplified representation for game purposes

import { FeatureCollection, Feature, Polygon } from 'geojson';
import { FactionId, ProvinceTerrain, TradeGood } from '@/types/province';

export interface ProvinceProperties {
  id: string;
  name: string;
  region: string;
  terrain: ProvinceTerrain;
  ownerId: FactionId | null;
  baseTax: number;
  baseManpower: number;
  supply: number;
  fortLevel: number;
  isCapital: boolean;
  isCoastal: boolean;
  hasSilkRoad: boolean;
  tradeGood?: TradeGood;
  developmentLevel: number;
}

// Helper to create a hexagonal polygon around a center point
const createHexPolygon = (
  centerLon: number,
  centerLat: number,
  size: number = 2.5
): number[][] => {
  const points: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const lon = centerLon + size * Math.cos(angle) * 1.2; // Stretch horizontally
    const lat = centerLat + size * Math.sin(angle);
    points.push([lon, lat]);
  }
  points.push(points[0]); // Close the polygon
  return points;
};

// Helper to create a province feature
const createProvince = (
  id: string,
  name: string,
  lon: number,
  lat: number,
  props: Partial<ProvinceProperties>,
  size: number = 2.5
): Feature<Polygon, ProvinceProperties> => ({
  type: 'Feature',
  properties: {
    id,
    name,
    region: 'mongolia',
    terrain: 'steppe',
    ownerId: null,
    baseTax: 2,
    baseManpower: 3,
    supply: 3,
    fortLevel: 0,
    isCapital: false,
    isCoastal: false,
    hasSilkRoad: false,
    developmentLevel: 1,
    ...props,
  },
  geometry: {
    type: 'Polygon',
    coordinates: [createHexPolygon(lon, lat, size)],
  },
});

// ============= PROVINCE DEFINITIONS =============

// Mongolia Provinces (centered around 100°E, 47°N)
const mongoliaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('karakorum', 'Karakorum', 102, 47, {
    region: 'mongolia',
    terrain: 'steppe',
    ownerId: 'mongol',
    isCapital: true,
    baseTax: 5,
    baseManpower: 8,
    fortLevel: 2,
    developmentLevel: 3,
  }),
  createProvince('mongol_east', 'Itä-Mongolia', 110, 46, {
    region: 'mongolia',
    terrain: 'steppe',
    ownerId: 'mongol',
    baseTax: 2,
    baseManpower: 5,
    tradeGood: 'horses',
  }),
  createProvince('mongol_central', 'Keski-Mongolia', 100, 48, {
    region: 'mongolia',
    terrain: 'steppe',
    ownerId: 'mongol',
    baseTax: 2,
    baseManpower: 6,
    tradeGood: 'livestock',
  }),
  createProvince('mongol_west', 'Länsi-Mongolia', 92, 48, {
    region: 'mongolia',
    terrain: 'steppe',
    ownerId: 'mongol',
    baseTax: 1,
    baseManpower: 4,
    tradeGood: 'horses',
  }),
  createProvince('gobi_north', 'Pohjois-Gobi', 105, 44, {
    region: 'mongolia',
    terrain: 'desert',
    ownerId: 'mongol',
    baseTax: 1,
    baseManpower: 2,
  }),
  createProvince('gobi_south', 'Etelä-Gobi', 108, 42, {
    region: 'mongolia',
    terrain: 'desert',
    ownerId: null,
    baseTax: 1,
    baseManpower: 1,
  }),
  createProvince('baikal', 'Baikaljärvi', 108, 52, {
    region: 'mongolia',
    terrain: 'taiga',
    ownerId: 'mongol',
    baseTax: 2,
    baseManpower: 3,
    tradeGood: 'fur',
  }),
  createProvince('altai', 'Altai', 88, 49, {
    region: 'mongolia',
    terrain: 'mountain',
    ownerId: null,
    baseTax: 1,
    baseManpower: 2,
    fortLevel: 1,
  }),
];

// Jin China Provinces
const jinProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('zhongdu', 'Zhongdu (Beijing)', 116, 40, {
    region: 'jin_china',
    terrain: 'farmland',
    ownerId: 'jin',
    isCapital: true,
    baseTax: 10,
    baseManpower: 15,
    fortLevel: 3,
    developmentLevel: 5,
    tradeGood: 'silk',
    hasSilkRoad: true,
  }),
  createProvince('datong', 'Datong', 113, 40, {
    region: 'jin_china',
    terrain: 'hills',
    ownerId: 'jin',
    baseTax: 5,
    baseManpower: 8,
    fortLevel: 2,
    tradeGood: 'iron',
  }),
  createProvince('taiyuan', 'Taiyuan', 112, 37.5, {
    region: 'jin_china',
    terrain: 'farmland',
    ownerId: 'jin',
    baseTax: 6,
    baseManpower: 10,
    fortLevel: 1,
    tradeGood: 'grain',
  }),
  createProvince('kaifeng', 'Kaifeng', 114, 35, {
    region: 'jin_china',
    terrain: 'farmland',
    ownerId: 'jin',
    baseTax: 8,
    baseManpower: 12,
    fortLevel: 2,
    tradeGood: 'silk',
  }),
  createProvince('shandong', 'Shandong', 118, 36, {
    region: 'jin_china',
    terrain: 'farmland',
    ownerId: 'jin',
    isCoastal: true,
    baseTax: 6,
    baseManpower: 8,
    tradeGood: 'salt',
  }),
  createProvince('liaoyang', 'Liaoyang', 123, 41, {
    region: 'manchuria',
    terrain: 'grassland',
    ownerId: 'jin',
    baseTax: 4,
    baseManpower: 6,
    fortLevel: 1,
  }),
];

// Xi Xia Provinces
const xixiaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('xingqing', 'Xingqing', 106, 38, {
    region: 'xixia',
    terrain: 'grassland',
    ownerId: 'xixia',
    isCapital: true,
    baseTax: 5,
    baseManpower: 7,
    fortLevel: 2,
    developmentLevel: 3,
    hasSilkRoad: true,
  }),
  createProvince('ganzhou', 'Ganzhou', 100, 39, {
    region: 'xixia',
    terrain: 'desert',
    ownerId: 'xixia',
    baseTax: 3,
    baseManpower: 4,
    hasSilkRoad: true,
    tradeGood: 'salt',
  }),
  createProvince('liangzhou', 'Liangzhou', 102, 37, {
    region: 'xixia',
    terrain: 'grassland',
    ownerId: 'xixia',
    baseTax: 4,
    baseManpower: 5,
    hasSilkRoad: true,
  }),
];

// Song China Provinces
const songProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('hangzhou', 'Hangzhou', 120, 30, {
    region: 'song_china',
    terrain: 'farmland',
    ownerId: 'song',
    isCapital: true,
    isCoastal: true,
    baseTax: 12,
    baseManpower: 15,
    fortLevel: 2,
    developmentLevel: 5,
    tradeGood: 'silk',
  }),
  createProvince('nanjing', 'Nanjing', 118, 32, {
    region: 'song_china',
    terrain: 'farmland',
    ownerId: 'song',
    baseTax: 9,
    baseManpower: 12,
    fortLevel: 2,
    tradeGood: 'silk',
  }),
  createProvince('sichuan', 'Sichuan', 104, 30, {
    region: 'song_china',
    terrain: 'hills',
    ownerId: 'song',
    baseTax: 7,
    baseManpower: 10,
    fortLevel: 2,
    tradeGood: 'salt',
  }),
  createProvince('guangdong', 'Guangdong', 113, 23, {
    region: 'song_china',
    terrain: 'farmland',
    ownerId: 'song',
    isCoastal: true,
    baseTax: 6,
    baseManpower: 8,
    tradeGood: 'spices',
  }),
];

// Khwarezm Provinces
const khwarezmProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('samarkand', 'Samarkand', 67, 39.5, {
    region: 'transoxiana',
    terrain: 'farmland',
    ownerId: 'khwarezm',
    isCapital: true,
    baseTax: 10,
    baseManpower: 12,
    fortLevel: 3,
    developmentLevel: 5,
    hasSilkRoad: true,
    tradeGood: 'silk',
  }),
  createProvince('bukhara', 'Bukhara', 64, 40, {
    region: 'transoxiana',
    terrain: 'farmland',
    ownerId: 'khwarezm',
    baseTax: 8,
    baseManpower: 10,
    fortLevel: 2,
    hasSilkRoad: true,
    tradeGood: 'silk',
  }),
  createProvince('urgench', 'Urgench', 59, 42, {
    region: 'khwarezm',
    terrain: 'grassland',
    ownerId: 'khwarezm',
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 2,
  }),
  createProvince('merv', 'Merv', 62, 37.5, {
    region: 'khorasan',
    terrain: 'farmland',
    ownerId: 'khwarezm',
    baseTax: 7,
    baseManpower: 9,
    fortLevel: 2,
    hasSilkRoad: true,
  }),
  createProvince('nishapur', 'Nishapur', 59, 36, {
    region: 'khorasan',
    terrain: 'hills',
    ownerId: 'khwarezm',
    baseTax: 6,
    baseManpower: 8,
    hasSilkRoad: true,
    tradeGood: 'gems',
  }),
  createProvince('herat', 'Herat', 62, 34, {
    region: 'khorasan',
    terrain: 'farmland',
    ownerId: 'khwarezm',
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 1,
    hasSilkRoad: true,
  }),
  createProvince('kashgar', 'Kashgar', 76, 39, {
    region: 'central_asia',
    terrain: 'desert',
    ownerId: 'khwarezm',
    baseTax: 4,
    baseManpower: 5,
    hasSilkRoad: true,
    tradeGood: 'silk',
  }),
];

// Persia Provinces
const persiaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('isfahan', 'Isfahan', 52, 33, {
    region: 'persia',
    terrain: 'farmland',
    ownerId: 'khwarezm',
    baseTax: 7,
    baseManpower: 9,
    fortLevel: 2,
    tradeGood: 'silk',
  }),
  createProvince('tabriz', 'Tabriz', 46, 38, {
    region: 'persia',
    terrain: 'hills',
    ownerId: 'khwarezm',
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 1,
    hasSilkRoad: true,
  }),
  createProvince('ray', 'Ray (Tehran)', 51, 36, {
    region: 'persia',
    terrain: 'hills',
    ownerId: 'khwarezm',
    baseTax: 5,
    baseManpower: 7,
    hasSilkRoad: true,
  }),
];

// Rus Provinces
const rusProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('novgorod', 'Novgorod', 31, 58, {
    region: 'rus',
    terrain: 'forest',
    ownerId: 'rus',
    isCapital: true,
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 2,
    developmentLevel: 3,
    tradeGood: 'fur',
  }),
  createProvince('kiev', 'Kiova', 30, 50, {
    region: 'rus',
    terrain: 'farmland',
    ownerId: 'rus',
    baseTax: 7,
    baseManpower: 10,
    fortLevel: 2,
    tradeGood: 'grain',
  }),
  createProvince('vladimir', 'Vladimir', 40, 56, {
    region: 'rus',
    terrain: 'forest',
    ownerId: 'rus',
    baseTax: 5,
    baseManpower: 7,
    fortLevel: 1,
    tradeGood: 'fur',
  }),
];

// Kipchak Steppe Provinces
const kipchakProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('sarkel', 'Sarkel', 42, 47, {
    region: 'kipchak',
    terrain: 'steppe',
    ownerId: 'kipchak',
    isCapital: true,
    baseTax: 3,
    baseManpower: 6,
    fortLevel: 1,
    developmentLevel: 2,
    tradeGood: 'horses',
  }),
  createProvince('kipchak_west', 'Länsi-Kipčak', 35, 48, {
    region: 'kipchak',
    terrain: 'steppe',
    ownerId: 'kipchak',
    baseTax: 2,
    baseManpower: 5,
    tradeGood: 'horses',
  }),
  createProvince('kipchak_east', 'Itä-Kipčak', 55, 48, {
    region: 'kipchak',
    terrain: 'steppe',
    ownerId: 'kipchak',
    baseTax: 2,
    baseManpower: 4,
    tradeGood: 'horses',
  }),
];

// Central Asia
const centralAsiaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('dunhuang', 'Dunhuang', 94, 40, {
    region: 'central_asia',
    terrain: 'desert',
    ownerId: null,
    baseTax: 3,
    baseManpower: 3,
    hasSilkRoad: true,
  }),
  createProvince('turfan', 'Turfan', 89, 43, {
    region: 'central_asia',
    terrain: 'desert',
    ownerId: null,
    baseTax: 2,
    baseManpower: 3,
    hasSilkRoad: true,
    tradeGood: 'spices',
  }),
  createProvince('dzungaria', 'Dzungaria', 85, 46, {
    region: 'central_asia',
    terrain: 'steppe',
    ownerId: null,
    baseTax: 2,
    baseManpower: 4,
    tradeGood: 'horses',
  }),
];

// Tibet
const tibetProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('lhasa', 'Lhasa', 91, 30, {
    region: 'tibet',
    terrain: 'mountain',
    ownerId: null,
    baseTax: 3,
    baseManpower: 4,
    fortLevel: 2,
    tradeGood: 'salt',
  }),
];

// Caucasus
const caucasusProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('georgia', 'Georgia', 43, 42, {
    region: 'caucasus',
    terrain: 'mountain',
    ownerId: null,
    baseTax: 4,
    baseManpower: 5,
    fortLevel: 1,
    tradeGood: 'gold',
  }),
  createProvince('azerbaijan', 'Azerbaijan', 48, 40, {
    region: 'caucasus',
    terrain: 'hills',
    ownerId: 'khwarezm',
    baseTax: 4,
    baseManpower: 5,
    tradeGood: 'iron',
  }),
];

// Korea
const koreaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('goryeo', 'Goryeo', 127, 37, {
    region: 'korea',
    terrain: 'hills',
    ownerId: null,
    isCoastal: true,
    baseTax: 5,
    baseManpower: 6,
    fortLevel: 1,
  }),
];

// Siberia - Neutral territories
const siberiaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('yenisei', 'Yenisei', 92, 55, {
    region: 'siberia',
    terrain: 'taiga',
    ownerId: null,
    baseTax: 1,
    baseManpower: 2,
    tradeGood: 'fur',
  }),
  createProvince('yakutia', 'Yakutia', 130, 58, {
    region: 'siberia',
    terrain: 'tundra',
    ownerId: null,
    baseTax: 1,
    baseManpower: 1,
    tradeGood: 'fur',
  }),
  createProvince('irkutsk', 'Irkutsk', 104, 52, {
    region: 'siberia',
    terrain: 'taiga',
    ownerId: null,
    baseTax: 2,
    baseManpower: 2,
    tradeGood: 'fur',
  }),
  createProvince('tomsk', 'Tomsk', 85, 54, {
    region: 'siberia',
    terrain: 'taiga',
    ownerId: null,
    baseTax: 1,
    baseManpower: 2,
    tradeGood: 'fur',
  }),
];

// India Border - Neutral territories
const indiaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('delhi', 'Delhi', 77, 28, {
    region: 'india',
    terrain: 'farmland',
    ownerId: null,
    baseTax: 8,
    baseManpower: 10,
    fortLevel: 2,
    developmentLevel: 4,
    tradeGood: 'spices',
  }),
  createProvince('multan', 'Multan', 71, 30, {
    region: 'india',
    terrain: 'farmland',
    ownerId: null,
    baseTax: 5,
    baseManpower: 6,
    hasSilkRoad: true,
  }),
  createProvince('kashmir', 'Kashmir', 75, 34, {
    region: 'india',
    terrain: 'mountain',
    ownerId: null,
    baseTax: 3,
    baseManpower: 4,
    fortLevel: 1,
    tradeGood: 'silk',
  }),
];

// Arabia Border - Neutral territories
const arabiaProvinces: Feature<Polygon, ProvinceProperties>[] = [
  createProvince('baghdad', 'Baghdad', 44, 33, {
    region: 'arabia',
    terrain: 'farmland',
    ownerId: null,
    baseTax: 7,
    baseManpower: 8,
    fortLevel: 2,
    developmentLevel: 4,
    tradeGood: 'spices',
  }),
  createProvince('basra', 'Basra', 48, 30, {
    region: 'arabia',
    terrain: 'marsh',
    ownerId: null,
    isCoastal: true,
    baseTax: 5,
    baseManpower: 5,
    tradeGood: 'spices',
  }),
  createProvince('mosul', 'Mosul', 43, 36, {
    region: 'arabia',
    terrain: 'hills',
    ownerId: null,
    baseTax: 4,
    baseManpower: 5,
    hasSilkRoad: true,
  }),
];

// ============= COMBINED GEOJSON =============

export const EURASIA_1206_GEOJSON: FeatureCollection<Polygon, ProvinceProperties> = {
  type: 'FeatureCollection',
  features: [
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
    ...koreaProvinces,
    ...siberiaProvinces,
    ...indiaProvinces,
    ...arabiaProvinces,
  ],
};

// ============= ADJACENCY GRAPH =============

// Pre-computed adjacency based on geographic proximity
export const PROVINCE_ADJACENCY_GRAPH: Record<string, string[]> = {
  // Mongolia
  karakorum: ['mongol_east', 'mongol_central', 'mongol_west', 'gobi_north'],
  mongol_east: ['karakorum', 'mongol_central', 'gobi_north', 'baikal', 'liaoyang'],
  mongol_central: ['karakorum', 'mongol_east', 'mongol_west', 'gobi_north', 'altai'],
  mongol_west: ['karakorum', 'mongol_central', 'altai', 'dzungaria'],
  gobi_north: ['karakorum', 'mongol_central', 'gobi_south'],
  gobi_south: ['gobi_north', 'xingqing', 'ganzhou'],
  baikal: ['mongol_east', 'irkutsk', 'yenisei'],
  altai: ['mongol_west', 'mongol_central', 'dzungaria', 'turfan', 'tomsk'],
  
  // Jin China
  zhongdu: ['datong', 'shandong', 'liaoyang', 'kaifeng'],
  datong: ['zhongdu', 'taiyuan', 'xingqing'],
  taiyuan: ['datong', 'kaifeng'],
  kaifeng: ['zhongdu', 'taiyuan', 'shandong', 'nanjing'],
  shandong: ['zhongdu', 'kaifeng', 'nanjing'],
  liaoyang: ['zhongdu', 'mongol_east', 'goryeo', 'pyongyang'],
  
  // Xi Xia
  xingqing: ['ganzhou', 'liangzhou', 'gobi_south', 'datong'],
  ganzhou: ['xingqing', 'liangzhou', 'gobi_south', 'dunhuang'],
  liangzhou: ['xingqing', 'ganzhou', 'sichuan'],
  
  // Song China
  hangzhou: ['nanjing', 'guangdong'],
  nanjing: ['hangzhou', 'kaifeng', 'shandong', 'sichuan'],
  sichuan: ['nanjing', 'liangzhou', 'lhasa'],
  guangdong: ['hangzhou'],
  
  // Khwarezm
  samarkand: ['bukhara', 'merv', 'kashgar', 'ferghana'],
  bukhara: ['samarkand', 'urgench', 'merv'],
  urgench: ['bukhara', 'kipchak_east'],
  merv: ['samarkand', 'bukhara', 'nishapur', 'herat'],
  nishapur: ['merv', 'herat', 'ray'],
  herat: ['merv', 'nishapur', 'isfahan', 'kashmir', 'multan'],
  kashgar: ['samarkand', 'dunhuang', 'turfan', 'khotan', 'ferghana'],
  ferghana: ['samarkand', 'kashgar', 'kucha'],
  
  // Persia
  isfahan: ['herat', 'ray', 'tabriz', 'baghdad'],
  tabriz: ['isfahan', 'ray', 'azerbaijan', 'georgia', 'mosul'],
  ray: ['nishapur', 'isfahan', 'tabriz'],
  
  // Rus
  novgorod: ['vladimir'],
  kiev: ['vladimir', 'kipchak_west'],
  vladimir: ['novgorod', 'kiev'],
  
  // Kipchak
  sarkel: ['kipchak_west', 'kipchak_east', 'kiev'],
  kipchak_west: ['sarkel', 'kiev', 'georgia', 'circassia'],
  kipchak_east: ['sarkel', 'urgench', 'dzungaria'],
  
  // Central Asia
  dunhuang: ['ganzhou', 'kashgar', 'turfan', 'kucha', 'khotan'],
  turfan: ['dunhuang', 'kashgar', 'altai', 'dzungaria', 'kucha'],
  dzungaria: ['mongol_west', 'altai', 'turfan', 'kipchak_east', 'tomsk'],
  khotan: ['kashgar', 'dunhuang', 'lhasa', 'ngari'],
  kucha: ['turfan', 'dunhuang', 'ferghana'],
  
  // Tibet
  lhasa: ['sichuan', 'shigatse', 'chamdo', 'ngari', 'khotan'],
  shigatse: ['lhasa', 'ngari', 'delhi'],
  chamdo: ['lhasa', 'sichuan'],
  ngari: ['lhasa', 'shigatse', 'khotan', 'kashmir'],
  
  // Caucasus
  georgia: ['tabriz', 'azerbaijan', 'kipchak_west', 'armenia', 'circassia'],
  azerbaijan: ['georgia', 'tabriz', 'armenia'],
  armenia: ['georgia', 'azerbaijan', 'mosul'],
  circassia: ['georgia', 'kipchak_west'],
  
  // Korea
  goryeo: ['liaoyang', 'pyongyang'],
  pyongyang: ['goryeo', 'liaoyang'],
  
  // Siberia
  yenisei: ['baikal', 'irkutsk', 'tomsk', 'yakutia'],
  yakutia: ['yenisei', 'irkutsk'],
  irkutsk: ['baikal', 'yenisei', 'yakutia'],
  tomsk: ['altai', 'dzungaria', 'yenisei'],
  
  // India
  delhi: ['multan', 'kashmir', 'shigatse'],
  multan: ['delhi', 'kashmir', 'herat'],
  kashmir: ['delhi', 'multan', 'herat', 'ngari'],
  
  // Arabia
  baghdad: ['isfahan', 'mosul', 'basra'],
  basra: ['baghdad'],
  mosul: ['baghdad', 'tabriz', 'armenia'],
};

// Get all province IDs
export const getAllProvinceIds = (): string[] => {
  return EURASIA_1206_GEOJSON.features.map(f => f.properties.id);
};

// Get province by ID
export const getProvinceById = (id: string): Feature<Polygon, ProvinceProperties> | undefined => {
  return EURASIA_1206_GEOJSON.features.find(f => f.properties.id === id);
};

// Get neighbors for a province
export const getProvinceNeighbors = (id: string): string[] => {
  return PROVINCE_ADJACENCY_GRAPH[id] || [];
};
