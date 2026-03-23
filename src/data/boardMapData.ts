/**
 * boardMapData.ts — Lautapelikartan datadefinitiot
 * 
 * 44 strategista aluetta, yhteydet, fraktiot ja armeijatiedot
 * viitteen mukaisesti (Figma-kuva: Aasian Kartta - 1200-luku)
 */

export type BoardFaction = 'mongol' | 'china' | 'persia' | 'russia' | null;
export type BoardTerrain = 'city' | 'steppe' | 'mountain' | 'forest' | 'desert';

export interface BoardProvince {
  id: string;
  name: string;
  x: number;
  y: number;
  terrain: BoardTerrain;
  faction: BoardFaction;
  cavalry: number;
  infantry: number;
  hasFort: boolean;
  isCapital: boolean;
}

export interface BoardConnection {
  from: string;
  to: string;
}

export const BOARD_FACTIONS: Record<string, { name: string; color: string; borderColor: string }> = {
  mongol:  { name: 'Mongolit', color: '#d4a24c', borderColor: '#c49030' },
  china:   { name: 'Kiina',    color: '#c55a5a', borderColor: '#b04040' },
  persia:  { name: 'Persia',   color: '#5a8ac5', borderColor: '#4070b0' },
  russia:  { name: 'Venäjä',   color: '#5aad60', borderColor: '#409848' },
};

export const BOARD_TERRAINS: Record<BoardTerrain, { name: string; color: string; icon: string }> = {
  city:     { name: 'Kaupunki', color: '#6b4c3a', icon: '🏛️' },
  steppe:   { name: 'Steppi',   color: '#c8a860', icon: '🌾' },
  mountain: { name: 'Vuoristo', color: '#7a7a8a', icon: '⛰️' },
  forest:   { name: 'Metsä',    color: '#4a7a4a', icon: '🌲' },
  desert:   { name: 'Aavikko', color: '#c89060', icon: '🏜️' },
};

// 44 provinces positioned to match the reference Figma layout
// Coordinate system: 1000 x 680 SVG viewport
export const BOARD_PROVINCES: BoardProvince[] = [
  // === TOP ROW ===
  { id: 'arktis',        name: 'Arktis',          x: 315, y: 40,  terrain: 'mountain', faction: null,     cavalry: 0, infantry: 0, hasFort: false, isCapital: false },
  
  // === SECOND ROW ===
  { id: 'ural',          name: 'Ural',            x: 240, y: 75,  terrain: 'forest',   faction: 'russia', cavalry: 0, infantry: 2, hasFort: false, isCapital: false },
  { id: 'siperia',       name: 'Siperia',         x: 370, y: 70,  terrain: 'forest',   faction: null,     cavalry: 1, infantry: 4, hasFort: false, isCapital: false },
  { id: 'bajkal',        name: 'Bajkal',          x: 500, y: 60,  terrain: 'forest',   faction: 'mongol', cavalry: 2, infantry: 3, hasFort: false, isCapital: false },
  { id: 'inner_mongolia',name: 'Inner Mongolia',  x: 545, y: 75,  terrain: 'steppe',   faction: 'mongol', cavalry: 3, infantry: 1, hasFort: false, isCapital: false },

  // === THIRD ROW ===
  { id: 'novgorod',      name: 'Novgorod',        x: 210, y: 95,  terrain: 'forest',   faction: 'russia', cavalry: 0, infantry: 1, hasFort: false, isCapital: false },
  { id: 'moskova',       name: 'Moskova',         x: 160, y: 120, terrain: 'forest',   faction: 'russia', cavalry: 2, infantry: 5, hasFort: true,  isCapital: false },
  { id: 'taiga',         name: 'Taiga',           x: 300, y: 110, terrain: 'forest',   faction: 'mongol', cavalry: 1, infantry: 5, hasFort: false, isCapital: false },
  { id: 'altai',         name: 'Altai',           x: 390, y: 115, terrain: 'mountain', faction: 'mongol', cavalry: 2, infantry: 1, hasFort: false, isCapital: false },
  { id: 'karakorum',     name: 'Karakorum',       x: 475, y: 145, terrain: 'steppe',   faction: 'mongol', cavalry: 6, infantry: 3, hasFort: true,  isCapital: true },
  { id: 'itasteppi',     name: 'Itästeppi',       x: 575, y: 105, terrain: 'steppe',   faction: 'mongol', cavalry: 4, infantry: 2, hasFort: false, isCapital: false },
  { id: 'manchuria',     name: 'Manchuria',       x: 740, y: 120, terrain: 'forest',   faction: 'china',  cavalry: 1, infantry: 3, hasFort: false, isCapital: false },

  // === FOURTH ROW ===
  { id: 'kiova',         name: 'Kiova',           x: 110, y: 170, terrain: 'city',     faction: 'russia', cavalry: 2, infantry: 6, hasFort: true,  isCapital: true },
  { id: 'khwarezm',      name: 'Khwarezm',        x: 220, y: 175, terrain: 'desert',   faction: 'persia', cavalry: 3, infantry: 3, hasFort: false, isCapital: false },
  { id: 'aral',          name: 'Aral',            x: 235, y: 220, terrain: 'desert',   faction: 'persia', cavalry: 2, infantry: 3, hasFort: false, isCapital: false },
  { id: 'samarkand',     name: 'Samarkand',       x: 310, y: 220, terrain: 'city',     faction: 'persia', cavalry: 3, infantry: 4, hasFort: true,  isCapital: false },
  { id: 'keskisteppi',   name: 'Keskisteppi',     x: 460, y: 185, terrain: 'steppe',   faction: 'mongol', cavalry: 4, infantry: 2, hasFort: false, isCapital: false },
  { id: 'kashgar',       name: 'Kashgar',         x: 380, y: 200, terrain: 'desert',   faction: 'mongol', cavalry: 0, infantry: 2, hasFort: false, isCapital: false },
  { id: 'turfan',        name: 'Turfan',          x: 520, y: 185, terrain: 'desert',   faction: 'mongol', cavalry: 0, infantry: 4, hasFort: false, isCapital: false },
  { id: 'ordos',         name: 'Ordos',           x: 615, y: 155, terrain: 'steppe',   faction: 'mongol', cavalry: 4, infantry: 1, hasFort: false, isCapital: false },
  { id: 'beijing',       name: 'Beijing',         x: 700, y: 155, terrain: 'city',     faction: 'china',  cavalry: 0, infantry: 6, hasFort: true,  isCapital: true },
  { id: 'korea',         name: 'Korea',           x: 820, y: 140, terrain: 'mountain', faction: 'china',  cavalry: 2, infantry: 3, hasFort: false, isCapital: false },
  { id: 'shanghai',      name: 'Shanghai',        x: 790, y: 180, terrain: 'city',     faction: 'china',  cavalry: 0, infantry: 4, hasFort: true,  isCapital: false },

  // === FIFTH ROW ===
  { id: 'pontti',        name: 'Pontti',          x: 115, y: 215, terrain: 'steppe',   faction: 'russia', cavalry: 1, infantry: 2, hasFort: false, isCapital: false },
  { id: 'kaukasus',      name: 'Kaukasus',        x: 145, y: 260, terrain: 'mountain', faction: 'persia', cavalry: 1, infantry: 2, hasFort: false, isCapital: false },
  { id: 'silkkitie',     name: 'Silkkitie',       x: 345, y: 260, terrain: 'steppe',   faction: 'persia', cavalry: 0, infantry: 2, hasFort: false, isCapital: false },
  { id: 'khorasan',      name: 'Khorasan',        x: 305, y: 290, terrain: 'desert',   faction: 'persia', cavalry: 4, infantry: 1, hasFort: false, isCapital: false },
  { id: 'xian',          name: 'Xian',            x: 620, y: 225, terrain: 'city',     faction: 'china',  cavalry: 3, infantry: 1, hasFort: true,  isCapital: false },

  // === SIXTH ROW ===
  { id: 'mesopotamia',   name: 'Mesopotamia',     x: 115, y: 330, terrain: 'desert',   faction: 'persia', cavalry: 2, infantry: 5, hasFort: false, isCapital: false },
  { id: 'persia',        name: 'Persia',          x: 215, y: 310, terrain: 'desert',   faction: 'persia', cavalry: 3, infantry: 2, hasFort: false, isCapital: false },
  { id: 'baghdad',       name: 'Baghdad',         x: 145, y: 370, terrain: 'city',     faction: 'persia', cavalry: 0, infantry: 3, hasFort: true,  isCapital: true },
  { id: 'afganistan',    name: 'Afganistan',      x: 275, y: 350, terrain: 'mountain', faction: 'persia', cavalry: 2, infantry: 2, hasFort: false, isCapital: false },
  { id: 'himalaja',      name: 'Himalaja',        x: 420, y: 365, terrain: 'mountain', faction: null,     cavalry: 0, infantry: 1, hasFort: false, isCapital: false },
  { id: 'kashmir',       name: 'Kashmir',         x: 370, y: 410, terrain: 'mountain', faction: null,     cavalry: 1, infantry: 3, hasFort: false, isCapital: false },
  { id: 'sichuan',       name: 'Sichuan',         x: 560, y: 310, terrain: 'mountain', faction: 'china',  cavalry: 1, infantry: 3, hasFort: false, isCapital: false },
  { id: 'yangtze',       name: 'Yangtze',         x: 660, y: 260, terrain: 'steppe',   faction: 'china',  cavalry: 2, infantry: 2, hasFort: false, isCapital: false },
  { id: 'hangzhou',      name: 'Hangzhou',        x: 750, y: 285, terrain: 'city',     faction: 'china',  cavalry: 1, infantry: 3, hasFort: true,  isCapital: false },
  { id: 'yunnan',        name: 'Yunnan',           x: 510, y: 370, terrain: 'forest',   faction: 'china',  cavalry: 1, infantry: 3, hasFort: false, isCapital: false },
  { id: 'canton',        name: 'Canton',           x: 710, y: 325, terrain: 'city',     faction: 'china',  cavalry: 1, infantry: 3, hasFort: false, isCapital: false },

  // === BOTTOM ROW ===
  { id: 'delhi',         name: 'Delhi',            x: 445, y: 420, terrain: 'city',     faction: null,     cavalry: 1, infantry: 4, hasFort: true,  isCapital: false },
  { id: 'indokiina',     name: 'Indokiina',        x: 610, y: 400, terrain: 'forest',   faction: null,     cavalry: 0, infantry: 2, hasFort: false, isCapital: false },
];

// Connections between provinces (dashed lines)
export const BOARD_CONNECTIONS: BoardConnection[] = [
  // Top connections
  { from: 'arktis', to: 'ural' },
  { from: 'arktis', to: 'siperia' },
  { from: 'siperia', to: 'bajkal' },
  { from: 'bajkal', to: 'inner_mongolia' },
  { from: 'ural', to: 'novgorod' },
  { from: 'ural', to: 'siperia' },
  { from: 'ural', to: 'taiga' },
  
  // Russia
  { from: 'novgorod', to: 'moskova' },
  { from: 'moskova', to: 'kiova' },
  { from: 'moskova', to: 'taiga' },
  { from: 'kiova', to: 'pontti' },
  { from: 'kiova', to: 'khwarezm' },
  { from: 'pontti', to: 'kaukasus' },
  { from: 'pontti', to: 'khwarezm' },
  
  // Central steppe belt
  { from: 'taiga', to: 'altai' },
  { from: 'taiga', to: 'khwarezm' },
  { from: 'altai', to: 'karakorum' },
  { from: 'altai', to: 'kashgar' },
  { from: 'siperia', to: 'taiga' },
  { from: 'bajkal', to: 'karakorum' },
  { from: 'inner_mongolia', to: 'karakorum' },
  { from: 'inner_mongolia', to: 'itasteppi' },
  { from: 'karakorum', to: 'keskisteppi' },
  { from: 'karakorum', to: 'ordos' },
  { from: 'keskisteppi', to: 'turfan' },
  { from: 'keskisteppi', to: 'kashgar' },
  { from: 'kashgar', to: 'silkkitie' },
  { from: 'kashgar', to: 'samarkand' },
  { from: 'turfan', to: 'xian' },
  { from: 'turfan', to: 'ordos' },
  
  // Khwarezm / Persia
  { from: 'khwarezm', to: 'aral' },
  { from: 'aral', to: 'samarkand' },
  { from: 'samarkand', to: 'silkkitie' },
  { from: 'samarkand', to: 'khorasan' },
  { from: 'khorasan', to: 'persia' },
  { from: 'khorasan', to: 'afganistan' },
  { from: 'persia', to: 'mesopotamia' },
  { from: 'persia', to: 'kaukasus' },
  { from: 'mesopotamia', to: 'baghdad' },
  { from: 'baghdad', to: 'persia' },
  { from: 'afganistan', to: 'kashmir' },
  { from: 'afganistan', to: 'himalaja' },
  { from: 'silkkitie', to: 'khorasan' },
  
  // China
  { from: 'itasteppi', to: 'manchuria' },
  { from: 'itasteppi', to: 'ordos' },
  { from: 'ordos', to: 'beijing' },
  { from: 'beijing', to: 'manchuria' },
  { from: 'beijing', to: 'korea' },
  { from: 'beijing', to: 'shanghai' },
  { from: 'xian', to: 'ordos' },
  { from: 'xian', to: 'yangtze' },
  { from: 'xian', to: 'sichuan' },
  { from: 'yangtze', to: 'hangzhou' },
  { from: 'yangtze', to: 'shanghai' },
  { from: 'yangtze', to: 'canton' },
  { from: 'sichuan', to: 'yunnan' },
  { from: 'sichuan', to: 'yangtze' },
  { from: 'yunnan', to: 'canton' },
  { from: 'yunnan', to: 'indokiina' },
  { from: 'hangzhou', to: 'canton' },
  { from: 'shanghai', to: 'hangzhou' },
  
  // South
  { from: 'himalaja', to: 'kashmir' },
  { from: 'himalaja', to: 'yunnan' },
  { from: 'kashmir', to: 'delhi' },
  { from: 'delhi', to: 'himalaja' },
  { from: 'delhi', to: 'indokiina' },
  { from: 'indokiina', to: 'canton' },
];
