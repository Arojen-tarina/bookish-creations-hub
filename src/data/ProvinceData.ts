/**
 * ProvinceData.ts — Provinssidata vuoden 1206 aloitusta varten
 *
 * ~70 provinssia historiallisesti tärkeiltä alueilta.
 * Koordinaatit on sovitettu kuvitettuun pelilautaan (0-100 x 0-100).
 */
import { Province, FactionId } from "@/types/province";

const p = (
  id: string,
  name: string,
  region: Province["region"],
  terrain: Province["terrain"],
  ownerId: FactionId | null,
  options: Partial<Province> = {},
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

// ============= NORTH WEST (Rus, Western Siberia, Western Kipchak) =============
// Coordinates: x < 45, y < 40
const northWestProvinces: Province[] = [
  // RUS KINGDOMS
  p("novgorod", "Novgorod", "rus", "forest", "rus", {
    isCapital: true,
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 2,
    developmentLevel: 3,
    tradeGood: "fur",
    center: { x: 22, y: 26 },
  }),
  p("pskov", "Pihkova", "rus", "forest", "rus", {
    baseTax: 3,
    baseManpower: 4,
    tradeGood: "fur",
    center: { x: 26, y: 42 },
  }),
  p("tver", "Tver", "rus", "forest", "rus", {
    baseTax: 3,
    baseManpower: 5,
    center: { x: 44, y: 38 },
  }),
  p("vladimir", "Vladimir", "rus", "forest", "rus", {
    baseTax: 5,
    baseManpower: 7,
    fortLevel: 1,
    tradeGood: "fur",
    center: { x: 49, y: 28 },
  }),
  p("smolensk", "Smolensk", "rus", "forest", "rus", {
    baseTax: 4,
    baseManpower: 6,
    fortLevel: 1,
    center: { x: 32, y: 48 },
  }),
  p("ryazan", "Rjazan", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 56, y: 40 },
  }),
  p("ryazan1", "Rjazan1", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 44, y: 51 },
  }),
  p("ryazan2", "Rjazan2", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 66, y: 61 },
  }),
  p("ryazan3", "Rjazan3", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 70, y: 76 },
  }),

  p("ryazan4", "Rjazan4", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 100, y: 60 },
  }),
  p("ryazan5", "Rjazan5", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 93, y: 70 },
  }),

  p("ryazan6", "Rjazan6", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 78, y: 68 },
  }),

  p("ryazan7", "Rjazan7", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 60, y: 24 },
  }),

  p("ryazan8", "Rjazan8", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 58, y: 54 },
  }),
  p("ryazan9", "Rjazan9", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 75, y: 55 },
  }),

  p("ryazan10", "Rjazan10", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 86, y: 78 },
  }),
  p("ryazan8", "Rjazan8", "rus", "forest", null, {
    baseTax: 4,
    baseManpower: 6,
    center: { x: 48, y: 59 },
  }),

  p("chernigov", "Tšernihiv", "rus", "farmland", "rus", {
    baseTax: 5,
    baseManpower: 7,
    center: { x: 34, y: 40 },
  }),
  p("kiev", "Kiova", "rus", "farmland", "rus", {
    baseTax: 7,
    baseManpower: 10,
    fortLevel: 2,
    tradeGood: "grain",
    center: { x: 32, y: 56 },
  }),
  // WESTERN SIBERIA
  p("siberia_west", "Länsi-Siperia", "siberia", "taiga", "rus", {
    baseTax: 1,
    baseManpower: 2,
    tradeGood: "fur",
    center: { x: 29, y: 21 },
  }),
  // CENTRAL ASIA EDGES
  p("altai", "Altai", "mongolia", "mountain", "mongol", {
    baseTax: 1,
    baseManpower: 2,
    fortLevel: 1,
    center: { x: 86, y: 24 },
  }),
  p("dzungaria", "Dzungaria", "central_asia", "steppe", "mongol", {
    baseTax: 2,
    baseManpower: 4,
    tradeGood: "horses",
    center: { x: 65, y: 32 },
  }),
  p("semirechye", "Seitsemän joki", "central_asia", "grassland", "rus", {
    baseTax: 3,
    baseManpower: 5,
    tradeGood: "horses",
    center: { x: 35, y: 30 },
  }),
  // KHWAREZM EDGES (moved to South West)
];

// ============= NORTH EAST (Mongolia, Eastern Manchuria, Northern China, Eastern Siberia) =============
// Coordinates: x >= 45, y < 40
const northEastProvinces: Province[] = [
  // MONGOLIA
  p("karakorum", "Karakorum", "mongolia", "steppe", "mongol", {
    isCapital: true,
    baseTax: 5,
    baseManpower: 8,
    fortLevel: 2,
    developmentLevel: 3,
    center: { x: 83, y: 40 },
  }),
  p("mongol_east", "Itä-Mongolia", "mongolia", "steppe", "mongol", {
    baseTax: 2,
    baseManpower: 5,
    tradeGood: "horses",
    center: { x: 90, y: 50 },
  }),
  p("mongol_central", "Keski-Mongolia", "mongolia", "steppe", "mongol", {
    baseTax: 2,
    baseManpower: 6,
    tradeGood: "livestock",
    center: { x: 78, y: 33 },
  }),
  p("mongol_west", "Länsi-Mongolia", "mongolia", "steppe", "mongol", {
    baseTax: 1,
    baseManpower: 4,
    tradeGood: "horses",
    center: { x: 72, y: 46 },
  }),
  p("kerulen", "Kerulenjoki", "mongolia", "grassland", "mongol", {
    baseTax: 2,
    baseManpower: 4,
    tradeGood: "horses",
    center: { x: 100, y: 29 },
  }),
  p("onon", "Ononjoki", "mongolia", "grassland", "mongol", {
    baseTax: 2,
    baseManpower: 4,
    center: { x: 102, y: 37 },
  }),
  p("baikal", "Baikaljärvi", "mongolia", "taiga", "mongol", {
    baseTax: 2,
    baseManpower: 3,
    tradeGood: "fur",
    center: { x: 72, y: 22 },
  }),
  p("gobi_north", "Pohjois-Gobi", "mongolia", "desert", "mongol", {
    baseTax: 1,
    baseManpower: 2,
    center: { x: 102, y: 20 },
  }),
  // MANCHURIA
  // CENTRAL ASIA EDGES
];

// ============= SOUTH WEST (Caucasus, Persia, Western Khwarezm) =============
// Coordinates: x < 45, y >= 40
const southWestProvinces: Province[] = [
  // CAUCASUS
  p("azerbaijan", "Azerbaijan", "caucasus", "hills", "khwarezm", {
    baseTax: 4,
    baseManpower: 5,
    tradeGood: "iron",
    center: { x: 43, y: 84 },
  }),
  p("shirvan", "Shirvan", "caucasus", "hills", "khwarezm", {
    baseTax: 3,
    baseManpower: 4,
    center: { x: 32, y: 78 },
    hasSilksRoad: true,
  }),
  // KHWAREZM
  p("khiva", "Khiva", "khwarezm", "desert", "khwarezm", {
    baseTax: 3,
    baseManpower: 4,
    center: { x: 38, y: 68 },
  }),
  p("urgench", "Urgench", "khwarezm", "grassland", "khwarezm", {
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 2,
    center: { x: 32, y: 90 },
  }),

  p("merv", "Merv", "khorasan", "farmland", "khwarezm", {
    baseTax: 7,
    baseManpower: 9,
    fortLevel: 2,
    center: { x: 52, y: 90 },
  }),
  p("nishapur", "Nishapur", "khorasan", "hills", "khwarezm", {
    baseTax: 6,
    baseManpower: 8,
    hasSilkRoad: true,
    tradeGood: "gems",
    center: { x: 28, y: 98 },
  }),
  p("balkh", "Balkh", "khorasan", "grassland", "khwarezm", {
    baseTax: 5,
    baseManpower: 7,
    hasSilkRoad: true,
    center: { x: 54, y: 80 },
  }),
  p("herat", "Herat", "khorasan", "farmland", null, {
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 1,
    hasSilkRoad: true,
    center: { x: 58, y: 86 },
  }),
  p("samarkand", "Samarkand", "transoxiana", "farmland", "khwarezm", {
    isCapital: true,
    baseTax: 10,
    baseManpower: 12,
    fortLevel: 3,
    developmentLevel: 5,
    hasSilkRoad: true,
    tradeGood: "silk",
    center: { x: 46, y: 76 },
  }),
  // PERSIA
  p("isfahan", "Isfahan", "persia", "farmland", "khwarezm", {
    baseTax: 7,
    baseManpower: 9,
    fortLevel: 2,
    tradeGood: "silk",
    center: { x: 17, y: 100 },
  }),
  p("shiraz", "Shiraz", "persia", "farmland", "khwarezm", {
    baseTax: 6,
    baseManpower: 7,
    tradeGood: "spices",
    center: { x: 42, y: 96 },
  }),
  p("tabriz", "Tabriz", "persia", "hills", "khwarezm", {
    baseTax: 6,
    baseManpower: 8,
    fortLevel: 1,
    hasSilkRoad: true,
    center: { x: 21, y: 77 },
  }),
  p("ray", "Ray (Tehran)", "persia", "hills", null, {
    baseTax: 5,
    baseManpower: 7,
    hasSilkRoad: true,
    center: { x: 26, y: 66 },
  }),
  p("kerman", "Kerman", "persia", "desert", "khwarezm", {
    baseTax: 3,
    baseManpower: 4,
    center: { x: 59, y: 102 },
  }),
];

// ============= SOUTH EAST (Song China, Xia, Central Asia, Tibet, Korea) =============
// Coordinates: x >= 45, y >= 40
const southEastProvinces: Province[] = [
  // CENTRAL ASIA
  p("kashgar", "Kashgar", "central_asia", "desert", null, {
    baseTax: 4,
    baseManpower: 5,
    hasSilkRoad: true,
    tradeGood: "silk",
    center: { x: 60, y: 68 },
  }),
  // GOBI
  p("gobi_south", "Etelä-Gobi", "mongolia", "desert", "mongol", {
    baseTax: 1,
    baseManpower: 1,
    center: { x: 98, y: 43 },
  }),
  // SONG CHINA
  p("hangzhou", "Hangzhou", "song_china", "farmland", "song", {
    isCapital: true,
    baseTax: 12,
    baseManpower: 15,
    fortLevel: 2,
    developmentLevel: 5,
    isCoastal: true,
    tradeGood: "silk",
    center: { x: 94, y: 91 },
  }),
  p("nanjing", "Nanjing", "song_china", "farmland", "song", {
    baseTax: 9,
    baseManpower: 12,
    fortLevel: 2,
    tradeGood: "silk",
    center: { x: 90, y: 85 },
  }),
  p("suzhou", "Suzhou", "song_china", "farmland", "song", {
    baseTax: 8,
    baseManpower: 10,
    isCoastal: true,
    tradeGood: "silk",
    center: { x: 102, y: 94 },
  }),
  p("fujian", "Fujian", "song_china", "hills", "song", {
    baseTax: 5,
    baseManpower: 7,
    isCoastal: true,
    tradeGood: "spices",
    center: { x: 100, y: 102 },
  }),
  p("guangdong", "Guangdong", "song_china", "farmland", "song", {
    baseTax: 6,
    baseManpower: 8,
    isCoastal: true,
    tradeGood: "spices",
    center: { x: 86, y: 110 },
  }),
  p("jiangxi", "Jiangxi", "song_china", "hills", "song", {
    baseTax: 5,
    baseManpower: 7,
    tradeGood: "grain",
    center: { x: 88, y: 98 },
  }),
  p("hunan", "Hunan", "song_china", "farmland", "song", {
    baseTax: 5,
    baseManpower: 7,
    tradeGood: "grain",
    center: { x: 80, y: 95 },
  }),
  p("hubei", "Hubei", "song_china", "farmland", "song", {
    baseTax: 6,
    baseManpower: 8,
    tradeGood: "grain",
    center: { x: 82, y: 87 },
  }),
  p("sichuan", "Sichuan", "song_china", "hills", "song", {
    baseTax: 7,
    baseManpower: 10,
    fortLevel: 2,
    tradeGood: "salt",
    center: { x: 72, y: 87 },
  }),
  p("yunnan", "Yunnan", "song_china", "mountain", "song", {
    baseTax: 3,
    baseManpower: 5,
    tradeGood: "gems",
    center: { x: 72, y: 99 },
  }),
  // TURFAN - Central Asia, assigned to Song
  p("turfan", "Turfan", "central_asia", "desert", "song", {
    baseTax: 2,
    baseManpower: 3,
    tradeGood: "spices",
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
  altai: ["mongol_central", "baikal", "dzungaria"],
  azerbaijan: ["urgench", "merv", "balkh"],
  baikal: ["altai", "dzungaria", "mongol_central"],
  balkh: ["bukhara", "azerbaijan", "herat"],
  bukhara: ["balkh", "samarkand", "kashgar"],
  chernigov: ["tver", "pskov", "smolensk"],
  dzungaria: ["mongol_central", "altai", "baikal"],
  fujian: ["jiangxi", "hangzhou", "suzhou"],
  gobi_north: ["gobi_south", "karakorum", "mongol_east"],
  gobi_south: ["onon", "gobi_north", "mongol_east"],
  guangdong: ["jiangxi", "fujian", "turfan"],
  hangzhou: ["nanjing", "fujian", "suzhou"],
  herat: ["merv", "balkh", "azerbaijan"],
  hormuz: ["shiraz", "kerman", "merv"],
  hubei: ["nanjing", "hunan", "sichuan"],
  hunan: ["hubei", "jiangxi", "yunnan"],
  isfahan: ["shirvan", "nishapur", "urgench"],
  jiangxi: ["fujian", "guangdong", "hunan"],
  karakorum: ["mongol_central", "mongol_east", "altai"],
  kashgar: ["bukhara", "balkh", "samarkand"],
  kerman: ["merv", "hormuz", "shiraz"],
  kerulen: ["onon", "mongol_east", "gobi_south"],
  khiva: ["tabriz", "samarkand", "shirvan"],
  kiev: ["smolensk", "ray", "khiva"],
  merv: ["kerman", "azerbaijan", "herat"],
  mongol_central: ["altai", "karakorum", "dzungaria"],
  mongol_east: ["karakorum", "kerulen", "mongol_central"],
  mongol_west: ["dzungaria", "ryazan", "mongol_central"],
  nanjing: ["hangzhou", "hubei", "jiangxi"],
  nishapur: ["shiraz", "isfahan", "hormuz"],
  novgorod: ["semirechye", "chernigov", "pskov"],
  onon: ["gobi_south", "kerulen", "mongol_east"],
  pskov: ["chernigov", "smolensk", "novgorod"],
  ray: ["kiev", "tabriz", "khiva"],
  ryazan: ["mongol_west", "tver", "dzungaria"],
  samarkand: ["bukhara", "khiva", "urgench"],
  semirechye: ["novgorod", "vladimir", "tver"],
  shiraz: ["hormuz", "nishapur", "kerman"],
  shirvan: ["isfahan", "tabriz", "urgench"],
  siberia_west: ["semirechye", "vladimir", "novgorod"],
  sichuan: ["hubei", "hunan", "yunnan"],
  smolensk: ["kiev", "chernigov", "pskov"],
  suzhou: ["hangzhou", "fujian", "jiangxi"],
  tabriz: ["shirvan", "khiva", "ray"],
  turfan: ["yunnan", "guangdong", "hunan"],
  tver: ["chernigov", "semirechye", "vladimir"],
  urgench: ["azerbaijan", "isfahan", "samarkand"],
  vladimir: ["semirechye", "tver", "chernigov"],
  yunnan: ["turfan", "hunan", "sichuan"],
};

// Apply adjacency
ALL_PROVINCES_1206.forEach((province) => {
  province.neighbors = PROVINCE_ADJACENCY[province.id] || [];
});

// Helper used by game state hook
export const getProvincesWithAdjacency = (): Province[] =>
  ALL_PROVINCES_1206.map((p) => ({ ...p, neighbors: PROVINCE_ADJACENCY[p.id] || [] }));
// SilkRoad.ts
// Vastaa Silkkitien reitistä ja sen bonuksista

export type SilkRoadNodeType = "province" | "hex" | "city";

export interface SilkRoadNode {
  id: string;
  type: SilkRoadNodeType;
}

export interface SilkRoadBonus {
  taxBonus: number;
  tradePowerBonus: number;
  supplyBonus: number;
  unrestReduction: number;
}

// Yleinen Silkkitie-bonus
export const SILK_ROAD_BONUS: SilkRoadBonus = {
  taxBonus: 2,
  tradePowerBonus: 3,
  supplyBonus: 2,
  unrestReduction: 1,
};

// Silkkitien reitti (tähän voi lisätä myöhemmin lisää)
export const SILK_ROAD_NODES: SilkRoadNode[] = [
  { id: "samarkand", type: "province" },
  { id: "bukhara", type: "province" },
  { id: "urgench", type: "province" },
  { id: "shirvan", type: "province" }, // ✅ TÄMÄ PROVINSSI
  { id: "tabriz", type: "province" },
  { id: "ray", type: "province" },
];

// Helper
export const isOnSilkRoad = (provinceId: string): boolean =>
  SILK_ROAD_NODES.some((node) => node.type === "province" && node.id === provinceId);
