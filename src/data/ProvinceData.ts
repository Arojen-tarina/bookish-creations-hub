/**
 * ProvinceData.ts — Provinssidata vuoden 1206 aloitusta varten
 */

import { Province, FactionId } from "@/types/province";
import { isOnSilkRoad, SILK_ROAD_BONUS } from "./SilkRoad";

const p = (
  id: string,
  name: string,
  region: Province["region"],
  terrain: Province["terrain"],
  ownerId: FactionId | null,
  options: Partial<Province> = {},
): Province => {
  const hasSilkRoad = isOnSilkRoad(id);

  return {
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

    hasSilkRoad,
    unrest: hasSilkRoad ? -SILK_ROAD_BONUS.unrestReduction : 0,
    fortLevel: 0,

    developmentLevel: 1,
    buildings: [],
    garrison: 0,

    tradePowerBonus: hasSilkRoad ? SILK_ROAD_BONUS.tradePowerBonus : 0,
    supplyBonus: hasSilkRoad ? SILK_ROAD_BONUS.supplyBonus : 0,
    taxBonus: hasSilkRoad ? SILK_ROAD_BONUS.taxBonus : 0,

    center: { x: 0, y: 0 },
    ...options,
  };
};

// ================= SOUTH WEST (Caucasus, Persia, Khwarezm) =================

const southWestProvinces: Province[] = [
  // CAUCASUS

  p("azerbaijan", "Azerbaijan", "caucasus", "hills", "khwarezm", {
    baseTax: 4,
    baseManpower: 5,
    tradeGood: "iron",
    center: { x: 43, y: 84 },
  }),

  // ✅ SILKKITIEPROVINSSI
  p("shirvan", "Shirvan", "caucasus", "hills", "khwarezm", {
    baseTax: 3 + SILK_ROAD_BONUS.taxBonus,
    baseManpower: 4,
    tradeGood: "silk",
    developmentLevel: 2,
    center: { x: 32, y: 78 },

    // Kaupunkitasoinen merkintä (UI:lle)
    cityModifiers: {
      silkRoadCity: true,
    },
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

  // TRANSOXIANA
  p("samarkand", "Samarkand", "transoxiana", "farmland", "khwarezm", {
    isCapital: true,
    baseTax: 10 + SILK_ROAD_BONUS.taxBonus,
    baseManpower: 12,
    fortLevel: 3,
    developmentLevel: 5,
    tradeGood: "silk",
    center: { x: 46, y: 76 },
  }),
];

// ================= EXPORT =================

export const ALL_PROVINCES_1206: Province[] = [...southWestProvinces];

// ================= ADJACENCY =================

export const PROVINCE_ADJACENCY: Record<string, string[]> = {
  shirvan: ["azerbaijan", "tabriz", "urgench"],
  azerbaijan: ["shirvan", "urgench"],
  urgench: ["shirvan", "samarkand"],
  samarkand: ["urgench"],
};

// Apply adjacency
ALL_PROVINCES_1206.forEach((province) => {
  province.neighbors = PROVINCE_ADJACENCY[province.id] || [];
});

// Helper
export const getProvincesWithAdjacency = (): Province[] =>
  ALL_PROVINCES_1206.map((p) => ({
    ...p,
    neighbors: PROVINCE_ADJACENCY[p.id] || [],
  }));
