import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, ZoomIn, ZoomOut, X, MapPin, Shield, Swords, Coins, Mountain, TreePine, Waves, Sun, Building2, Wheat, Image, Grid3X3 } from 'lucide-react';
import gameBoardImage from '@/assets/game-board-map.png';
import { FACTION_DATA_1206, PROVINCE_TERRAIN_INFO, type FactionId } from '@/types/province';

// ─── Types ───────────────────────────────────────────────────────────
interface HexTile {
  id: string;
  q: number;
  r: number;
  region: string;
  terrain: 'steppe' | 'desert' | 'mountain' | 'forest' | 'river' | 'city' | 'tundra' | 'sea';
  name?: string;
  isCity?: boolean;
  isCapital?: boolean;
}

interface TerrainInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  movement: string;
  combat: string;
  resources: string;
  special: string;
}

interface RegionInfo {
  name: string;
  description: string;
  capital: string;
  faction: string;
  bonuses: string[];
  historicalNote: string;
}

// ─── Terrain data ────────────────────────────────────────────────────
const terrainInfo: Record<string, TerrainInfo> = {
  steppe:   { name: 'Steppialue',   icon: Sun,       movement: 'Nopea (+1)',         combat: 'Ratsuväki +2',            resources: 'Hevoset, Karja',        special: 'Mongolit: lisäbonus' },
  desert:   { name: 'Autiomaa',     icon: Waves,     movement: 'Hidas (-1)',          combat: 'Ei etuja',                resources: 'Kauppareitit',          special: 'Vaatii lisäruokaa' },
  mountain: { name: 'Vuoristo',     icon: Mountain,  movement: 'Eritt. hidas (-2)',   combat: 'Puolustaja +3',           resources: 'Malmit',                special: 'Estää ratsuväen' },
  forest:   { name: 'Metsä',        icon: TreePine,  movement: 'Normaali',            combat: 'Jalkaväki +1, Ratsu -1',  resources: 'Puu, Turkikset',        special: 'Venäläiset: lisäbonus' },
  river:    { name: 'Jokilaakso',   icon: Wheat,     movement: 'Normaali',            combat: 'Puolustaja +1',           resources: 'Ruoka, Kauppa',         special: 'Kaupungit +1 kultaa' },
  city:     { name: 'Kaupunki',     icon: Building2, movement: 'Normaali',            combat: 'Linnoitus +3',            resources: 'Kulta, Käsityöläiset',  special: 'Voidaan piirittää' },
  tundra:   { name: 'Tundra',       icon: Mountain,  movement: 'Hidas (-1)',          combat: 'Ei etuja',                resources: 'Turkikset',             special: 'Talvella läpipääsemätön' },
  sea:      { name: 'Meri',         icon: Waves,     movement: 'Ei liikettä',         combat: 'Ei taistelua',            resources: 'Kalastus',              special: 'Vain laivoilla' },
};

// Terrain colors matching digital game's PROVINCE_TERRAIN_INFO
const terrainColors: Record<string, { fill: string; stroke: string }> = {
  steppe:   { fill: '#a8b077', stroke: '#8a9360' },
  desert:   { fill: '#d4a574', stroke: '#b8864a' },
  mountain: { fill: '#6b7280', stroke: '#4b5563' },
  forest:   { fill: '#2d5a27', stroke: '#1e3a1a' },
  river:    { fill: '#7cb342', stroke: '#5a9230' },
  city:     { fill: '#8bc34a', stroke: '#6d9a36' },
  tundra:   { fill: '#b8c4cc', stroke: '#8fa898' },
  sea:      { fill: '#3b6fa0', stroke: '#2d5580' },
};

// ─── Historically accurate regions (c. 1206) — unified with digital game ──
const regionInfo: Record<string, RegionInfo> = {
  'Mongolia': {
    name: 'Mongolien valtakunta',
    description: FACTION_DATA_1206.mongol.name + ' — Tšingis-kaanin yhdistämä valtakunta.',
    capital: 'Karakorum',
    faction: FACTION_DATA_1206.mongol.name,
    bonuses: ['Ratsuväki +30%', 'Piiritystaito +20%', 'Nomadibonus'],
    historicalNote: 'Vuonna 1206 Temüjin sai arvonimen Genghis Khan kurultaissa Onon-joen varrella.'
  },
  'Jin': {
    name: 'Jin-dynastia (金朝)',
    description: FACTION_DATA_1206.jin.name + ' — Juršen-kansan hallitsema Pohjois-Kiinan valtakunta.',
    capital: 'Zhongdu (Peking)',
    faction: FACTION_DATA_1206.jin.name,
    bonuses: ['Teknologia +20%', 'Muuri: puolustus +2', 'Runsaat resurssit'],
    historicalNote: 'Jin hallitsi Pohjois-Kiinaa 1115–1234. Pääkaupunki Zhongdu vallattiin 1215.'
  },
  'Xi Xia': {
    name: 'Länsi-Xia (西夏)',
    description: FACTION_DATA_1206.xixia.name + ' — Tangut-kansan buddhalainen valtakunta.',
    capital: 'Zhongxing',
    faction: FACTION_DATA_1206.xixia.name,
    bonuses: ['Silkkitie +10%', 'Puolustusetu', 'Kauppiaat'],
    historicalNote: 'Genghis Khanin ensimmäinen suuri valloituskohde. Xi Xia tuhottiin 1227.'
  },
  'Khwarezmia': {
    name: 'Khwarezmin šaahinvaltakunta',
    description: FACTION_DATA_1206.khwarezm.name + ' — Voimakas islamilainen valtakunta Keski-Aasiassa.',
    capital: 'Samarkand',
    faction: FACTION_DATA_1206.khwarezm.name,
    bonuses: ['Kauppa +20%', 'Silkkitien hallinta', 'Piiritystaito +10%'],
    historicalNote: 'Šaahi Muhammad II loukkasi mongoleja teloittamalla kauppalähetystön 1218.'
  },
  'Kara-Khitai': {
    name: 'Kara-Khitai (西遼)',
    description: 'Khitanien perustama valtakunta Keski-Aasiassa. Buddhalainen ja monikulttuurinen.',
    capital: 'Balasagun',
    faction: 'Kara-Khitai',
    bonuses: ['Kulttuuri +1', 'Strateginen sijainti', 'Liittolaiset'],
    historicalNote: 'Kuchlukin kaappasi vallan 1211. Mongolit valloittivat valtakunnan 1218.'
  },
  'Kipchak': {
    name: 'Kipčakkien steppivaltakunta',
    description: FACTION_DATA_1206.kipchak.name + ' — Kumaani-kipčakkien hallitsema laaja steppivyöhyke.',
    capital: 'Sarkel',
    faction: FACTION_DATA_1206.kipchak.name,
    bonuses: ['Ratsuväki +20%', 'Laaja alue', 'Nomadien verkostot'],
    historicalNote: 'Kipčakit olivat mongolilaisten sukulaiskansaa. Alueesta tuli myöhemmin Kultaisen ordan ydin.'
  },
  'Venäjä': {
    name: 'Venäjän ruhtinaskunnat',
    description: FACTION_DATA_1206.rus.name + ' — Hajanainen slaavilaisten ruhtinaskuntien kokoelma.',
    capital: 'Novgorod',
    faction: FACTION_DATA_1206.rus.name,
    bonuses: ['Talvibonus +10%', 'Metsätaistelu +10%', 'Sitkeä puolustus'],
    historicalNote: 'Mongoliarmeija murskasi venäläis-kumaaniliiton Kalka-joen taistelussa 1223.'
  },
  'Persia': {
    name: 'Abbasidien kalifaatti',
    description: 'Islamilaisen maailman henkinen keskus Bagdadissa.',
    capital: 'Bagdad',
    faction: 'Abbasidi-kalifaatti',
    bonuses: ['Kulttuuri +2', 'Tiede +1', 'Vauras talous'],
    historicalNote: 'Bagdad tuhottiin 1258 Hülegün johdolla.'
  },
  'Intia': {
    name: 'Delhin sulttaanikunta',
    description: 'Pohjois-Intian islamilainen valtakunta.',
    capital: 'Delhi',
    faction: 'Delhi-sultantti',
    bonuses: ['Puolustus +2', 'Elefantit', 'Rikkaat kaupungit'],
    historicalNote: 'Mongolit hyökkäsivät Intiaan useaan otteeseen mutta eivät koskaan valloittaneet Delhiä.'
  },
  'Song': {
    name: 'Etelä-Songin dynastia (南宋)',
    description: FACTION_DATA_1206.song.name + ' — Maailman rikkain ja edistynein valtakunta.',
    capital: 'Hangzhou (Lin\'an)',
    faction: FACTION_DATA_1206.song.name,
    bonuses: ['Teknologia +30%', 'Laivasto', 'Rikkain talous'],
    historicalNote: 'Song kesti mongolien hyökkäykset 40 vuotta (1235–1279).'
  },
  'Kaukasia': {
    name: 'Kaukasian kuningaskunnat',
    description: 'Georgian ja Armenian kristityt kuningaskunnat.',
    capital: 'Tbilisi',
    faction: 'Georgian kuningaskunta',
    bonuses: ['Vuoristopuolustus +2', 'Kristilliset liittolaiset', 'Kauppareitit'],
    historicalNote: 'Georgia oli alueellinen suurvalta kuningatar Tamarin (1184–1213) aikana.'
  },
};

// Region colors matching digital game's FACTION_DATA_1206
const regionColors: Record<string, string> = {
  'Mongolia':    FACTION_DATA_1206.mongol.color,    // #f59e0b (amber/gold)
  'Jin':         FACTION_DATA_1206.jin.color,        // #ef4444 (red)
  'Xi Xia':      FACTION_DATA_1206.xixia.color,      // #3b82f6 (blue)
  'Khwarezmia':  FACTION_DATA_1206.khwarezm.color,    // #8b5cf6 (purple)
  'Kara-Khitai': '#14b8a6',                           // teal
  'Kipchak':     FACTION_DATA_1206.kipchak.color,      // #ec4899 (pink)
  'Venäjä':      FACTION_DATA_1206.rus.color,          // #64748b (slate)
  'Persia':      '#20B2AA',
  'Intia':       '#FF6347',
  'Song':        FACTION_DATA_1206.song.color,         // #22c55e (green)
  'Kaukasia':    '#C71585',
};

// ─── Geographically accurate hex grid ────────────────────────────────
// Grid: q=0–18 (West→East, ~40°E to 130°E), r=0–12 (North→South, ~55°N to 20°N)
// Approximate mapping: 1 hex ≈ 500km

const generateHexGrid = (): HexTile[] => {
  const tiles: HexTile[] = [];

  // ── Venäjä / Kiovan Rus ──
  const russia: Partial<HexTile>[] = [
    { q: 0, r: 0, terrain: 'tundra' },
    { q: 1, r: 0, terrain: 'tundra' },
    { q: 2, r: 0, terrain: 'tundra' },
    { q: 0, r: 1, terrain: 'forest', name: 'Novgorod', isCity: true },
    { q: 1, r: 1, terrain: 'forest' },
    { q: 2, r: 1, terrain: 'forest' },
    { q: 0, r: 2, terrain: 'forest' },
    { q: 1, r: 2, terrain: 'forest' },
    { q: 0, r: 3, terrain: 'city', name: 'Kiev', isCity: true, isCapital: true },
    { q: 1, r: 3, terrain: 'forest' },
    { q: 0, r: 4, terrain: 'steppe' },
    { q: 1, r: 4, terrain: 'steppe' },
  ];
  russia.forEach((h, i) => tiles.push({ id: `rus-${i}`, region: 'Venäjä', ...h } as HexTile));

  // ── Kipchak Steppe ──
  const kipchak: Partial<HexTile>[] = [
    { q: 2, r: 2, terrain: 'steppe' },
    { q: 3, r: 2, terrain: 'steppe' },
    { q: 4, r: 2, terrain: 'steppe' },
    { q: 2, r: 3, terrain: 'steppe' },
    { q: 3, r: 3, terrain: 'steppe' },
    { q: 4, r: 3, terrain: 'steppe' },
    { q: 5, r: 2, terrain: 'steppe' },
    { q: 5, r: 3, terrain: 'steppe' },
    { q: 6, r: 2, terrain: 'steppe' },
    { q: 6, r: 3, terrain: 'steppe' },
    { q: 7, r: 2, terrain: 'steppe' },
    { q: 7, r: 3, terrain: 'steppe' },
    { q: 3, r: 1, terrain: 'steppe' },
    { q: 4, r: 1, terrain: 'steppe' },
    { q: 5, r: 1, terrain: 'steppe' },
  ];
  kipchak.forEach((h, i) => tiles.push({ id: `kip-${i}`, region: 'Kipchak', ...h } as HexTile));

  // ── Kaukasia ──
  const caucasus: Partial<HexTile>[] = [
    { q: 3, r: 4, terrain: 'mountain' },
    { q: 4, r: 4, terrain: 'city', name: 'Tbilisi', isCity: true, isCapital: true },
    { q: 2, r: 4, terrain: 'mountain' },
    { q: 3, r: 5, terrain: 'mountain' },
  ];
  caucasus.forEach((h, i) => tiles.push({ id: `cau-${i}`, region: 'Kaukasia', ...h } as HexTile));

  // ── Khwarezmia ──
  const khwarezm: Partial<HexTile>[] = [
    { q: 6, r: 4, terrain: 'city', name: 'Urgench', isCity: true, isCapital: true },
    { q: 7, r: 4, terrain: 'city', name: 'Bukhara', isCity: true },
    { q: 8, r: 4, terrain: 'city', name: 'Samarkand', isCity: true },
    { q: 5, r: 4, terrain: 'steppe' },
    { q: 7, r: 5, terrain: 'steppe' },
    { q: 8, r: 5, terrain: 'mountain' },
    { q: 6, r: 5, terrain: 'desert' },
    { q: 5, r: 5, terrain: 'desert' },
    { q: 9, r: 5, terrain: 'desert' },
  ];
  khwarezm.forEach((h, i) => tiles.push({ id: `khw-${i}`, region: 'Khwarezmia', ...h } as HexTile));

  // ── Persia / Abbasidi ──
  const persia: Partial<HexTile>[] = [
    { q: 4, r: 5, terrain: 'desert' },
    { q: 4, r: 6, terrain: 'city', name: 'Bagdad', isCity: true, isCapital: true },
    { q: 5, r: 6, terrain: 'desert' },
    { q: 3, r: 6, terrain: 'desert' },
    { q: 6, r: 6, terrain: 'mountain', name: 'Zagros' },
    { q: 7, r: 6, terrain: 'city', name: 'Isfahan', isCity: true },
    { q: 3, r: 7, terrain: 'desert' },
    { q: 4, r: 7, terrain: 'desert' },
    { q: 5, r: 7, terrain: 'desert' },
  ];
  persia.forEach((h, i) => tiles.push({ id: `per-${i}`, region: 'Persia', ...h } as HexTile));

  // ── Seas ──
  const seas: Partial<HexTile>[] = [
    { q: 2, r: 5, terrain: 'sea', name: 'Mustameri' },
    { q: 1, r: 5, terrain: 'sea' },
    { q: 2, r: 6, terrain: 'sea', name: 'Välimeri' },
    { q: 1, r: 6, terrain: 'sea' },
    { q: 0, r: 5, terrain: 'sea' },
    { q: 0, r: 6, terrain: 'sea' },
    // Kaspianmeri
    { q: 5, r: 3, terrain: 'sea', name: 'Kaspianmeri' },
    // Itäiset meret
    { q: 18, r: 3, terrain: 'sea' },
    { q: 18, r: 4, terrain: 'sea' },
    { q: 18, r: 5, terrain: 'sea' },
    { q: 18, r: 6, terrain: 'sea' },
    { q: 18, r: 7, terrain: 'sea' },
    { q: 18, r: 8, terrain: 'sea' },
    { q: 17, r: 5, terrain: 'sea' },
    { q: 17, r: 6, terrain: 'sea' },
    { q: 17, r: 7, terrain: 'sea' },
    { q: 17, r: 8, terrain: 'sea' },
    // Intian valtameri
    { q: 6, r: 9, terrain: 'sea', name: 'Arabiameri' },
    { q: 7, r: 10, terrain: 'sea' },
    { q: 8, r: 10, terrain: 'sea' },
    { q: 5, r: 9, terrain: 'sea' },
    { q: 4, r: 8, terrain: 'sea' },
    { q: 5, r: 8, terrain: 'sea' },
  ];
  seas.forEach((h, i) => tiles.push({ id: `sea-${i}`, region: 'Persia', ...h } as HexTile));

  // ── Kara-Khitai ──
  const karaKhitai: Partial<HexTile>[] = [
    { q: 9, r: 3, terrain: 'steppe', name: 'Balasagun', isCity: true, isCapital: true },
    { q: 10, r: 3, terrain: 'steppe' },
    { q: 9, r: 4, terrain: 'steppe' },
    { q: 10, r: 4, terrain: 'mountain', name: 'Tien Shan' },
    { q: 8, r: 3, terrain: 'steppe' },
    { q: 10, r: 5, terrain: 'desert' },
    { q: 11, r: 5, terrain: 'desert' },
  ];
  karaKhitai.forEach((h, i) => tiles.push({ id: `kkh-${i}`, region: 'Kara-Khitai', ...h } as HexTile));

  // ── Mongolia ──
  const mongolia: Partial<HexTile>[] = [
    { q: 11, r: 2, terrain: 'steppe', name: 'Karakorum', isCity: true, isCapital: true },
    { q: 12, r: 2, terrain: 'steppe' },
    { q: 13, r: 2, terrain: 'steppe' },
    { q: 10, r: 2, terrain: 'steppe' },
    { q: 11, r: 1, terrain: 'steppe' },
    { q: 12, r: 1, terrain: 'forest' },
    { q: 13, r: 1, terrain: 'forest' },
    { q: 10, r: 1, terrain: 'steppe' },
    { q: 11, r: 3, terrain: 'steppe' },
    { q: 12, r: 3, terrain: 'steppe' },
    { q: 9, r: 1, terrain: 'steppe' },
    { q: 9, r: 2, terrain: 'steppe' },
    { q: 8, r: 1, terrain: 'steppe' },
    { q: 8, r: 2, terrain: 'steppe' },
    { q: 14, r: 1, terrain: 'forest' },
    { q: 14, r: 2, terrain: 'steppe' },
    // Northern Siberia
    { q: 3, r: 0, terrain: 'tundra' },
    { q: 4, r: 0, terrain: 'tundra' },
    { q: 5, r: 0, terrain: 'tundra' },
    { q: 6, r: 0, terrain: 'tundra' },
    { q: 7, r: 0, terrain: 'tundra' },
    { q: 8, r: 0, terrain: 'tundra' },
    { q: 9, r: 0, terrain: 'tundra' },
    { q: 10, r: 0, terrain: 'tundra' },
    { q: 11, r: 0, terrain: 'tundra' },
    { q: 12, r: 0, terrain: 'tundra' },
    { q: 13, r: 0, terrain: 'forest' },
    { q: 14, r: 0, terrain: 'forest' },
    { q: 15, r: 0, terrain: 'forest' },
    { q: 16, r: 0, terrain: 'tundra' },
    { q: 17, r: 0, terrain: 'tundra' },
    // Extra steppe
    { q: 6, r: 1, terrain: 'forest' },
    { q: 7, r: 1, terrain: 'forest' },
  ];
  mongolia.forEach((h, i) => tiles.push({ id: `mng-${i}`, region: 'Mongolia', ...h } as HexTile));

  // ── Xi Xia ──
  const xiXia: Partial<HexTile>[] = [
    { q: 12, r: 4, terrain: 'city', name: 'Zhongxing', isCity: true, isCapital: true },
    { q: 11, r: 4, terrain: 'desert' },
    { q: 13, r: 3, terrain: 'desert' },
    { q: 13, r: 4, terrain: 'mountain' },
    { q: 12, r: 5, terrain: 'desert', name: 'Gobi' },
    { q: 13, r: 5, terrain: 'desert' },
  ];
  xiXia.forEach((h, i) => tiles.push({ id: `xix-${i}`, region: 'Xi Xia', ...h } as HexTile));

  // ── Jin Dynasty ──
  const jin: Partial<HexTile>[] = [
    { q: 15, r: 2, terrain: 'city', name: 'Zhongdu', isCity: true, isCapital: true },
    { q: 15, r: 3, terrain: 'river', name: 'Huangjoki' },
    { q: 16, r: 2, terrain: 'forest' },
    { q: 16, r: 3, terrain: 'river' },
    { q: 14, r: 3, terrain: 'steppe' },
    { q: 14, r: 4, terrain: 'river' },
    { q: 15, r: 4, terrain: 'city', name: 'Kaifeng', isCity: true },
    { q: 16, r: 4, terrain: 'river' },
    { q: 15, r: 1, terrain: 'forest' },
    { q: 16, r: 1, terrain: 'forest' },
    { q: 17, r: 1, terrain: 'forest' },
    { q: 17, r: 2, terrain: 'forest' },
    { q: 17, r: 3, terrain: 'steppe' },
    { q: 17, r: 4, terrain: 'river' },
    { q: 14, r: 5, terrain: 'river' },
  ];
  jin.forEach((h, i) => tiles.push({ id: `jin-${i}`, region: 'Jin', ...h } as HexTile));

  // ── Song Dynasty ──
  const song: Partial<HexTile>[] = [
    { q: 16, r: 7, terrain: 'city', name: 'Lin\'an', isCity: true, isCapital: true },
    { q: 15, r: 7, terrain: 'river', name: 'Jangtse' },
    { q: 14, r: 7, terrain: 'river' },
    { q: 14, r: 8, terrain: 'mountain' },
    { q: 15, r: 8, terrain: 'river' },
    { q: 16, r: 8, terrain: 'river' },
    { q: 13, r: 7, terrain: 'mountain' },
    { q: 13, r: 8, terrain: 'river', name: 'Guangzhou' },
    { q: 15, r: 5, terrain: 'river' },
    { q: 16, r: 5, terrain: 'river' },
    { q: 15, r: 6, terrain: 'river' },
    { q: 16, r: 6, terrain: 'river' },
    { q: 14, r: 6, terrain: 'mountain' },
    { q: 12, r: 8, terrain: 'mountain' },
    { q: 13, r: 9, terrain: 'sea' },
    { q: 14, r: 9, terrain: 'sea' },
    { q: 15, r: 9, terrain: 'sea' },
    { q: 16, r: 9, terrain: 'sea' },
    { q: 17, r: 9, terrain: 'sea' },
    { q: 18, r: 9, terrain: 'sea' },
  ];
  song.forEach((h, i) => tiles.push({ id: `sng-${i}`, region: 'Song', ...h } as HexTile));

  // ── Intia / Delhi ──
  const india: Partial<HexTile>[] = [
    { q: 8, r: 8, terrain: 'city', name: 'Delhi', isCity: true, isCapital: true },
    { q: 7, r: 7, terrain: 'mountain', name: 'Hindukuš' },
    { q: 8, r: 7, terrain: 'mountain', name: 'Khyber' },
    { q: 9, r: 6, terrain: 'mountain', name: 'Himalaja' },
    { q: 10, r: 6, terrain: 'mountain' },
    { q: 11, r: 6, terrain: 'mountain', name: 'Tibet' },
    { q: 12, r: 6, terrain: 'mountain' },
    { q: 13, r: 6, terrain: 'mountain' },
    { q: 7, r: 8, terrain: 'mountain' },
    { q: 9, r: 7, terrain: 'mountain' },
    { q: 7, r: 9, terrain: 'river', name: 'Indus' },
    { q: 8, r: 9, terrain: 'river' },
    { q: 9, r: 8, terrain: 'river', name: 'Ganges' },
    { q: 9, r: 9, terrain: 'river' },
    { q: 10, r: 7, terrain: 'mountain' },
    { q: 10, r: 8, terrain: 'steppe' },
    { q: 11, r: 7, terrain: 'mountain' },
    { q: 12, r: 7, terrain: 'mountain' },
    { q: 6, r: 7, terrain: 'desert' },
    { q: 6, r: 8, terrain: 'desert' },
    { q: 10, r: 9, terrain: 'river' },
    { q: 11, r: 8, terrain: 'forest' },
    { q: 11, r: 9, terrain: 'sea' },
    { q: 12, r: 9, terrain: 'sea' },
  ];
  india.forEach((h, i) => tiles.push({ id: `ind-${i}`, region: 'Intia', ...h } as HexTile));

  // ── Filler hexes — neutral/unclaimed territory ──
  const fillers: Partial<HexTile>[] = [
    // Arabian peninsula
    { q: 1, r: 7, terrain: 'desert' },
    { q: 2, r: 7, terrain: 'desert' },
    { q: 2, r: 8, terrain: 'desert' },
    { q: 3, r: 8, terrain: 'sea' },
    { q: 0, r: 7, terrain: 'sea' },
    { q: 0, r: 8, terrain: 'sea' },
    { q: 1, r: 8, terrain: 'sea' },
    // Central gap fillers
    { q: 8, r: 6, terrain: 'mountain' },
    { q: 9, r: 5, terrain: 'desert' },
    // Korean peninsula
    { q: 18, r: 1, terrain: 'forest' },
    { q: 18, r: 2, terrain: 'forest' },
    // Bottom row
    { q: 0, r: 9, terrain: 'sea' },
    { q: 1, r: 9, terrain: 'sea' },
    { q: 2, r: 9, terrain: 'sea' },
    { q: 3, r: 9, terrain: 'sea' },
    { q: 4, r: 9, terrain: 'sea' },
    { q: 5, r: 10, terrain: 'sea' },
    { q: 6, r: 10, terrain: 'sea' },
    { q: 7, r: 10, terrain: 'sea' },
  ];
  fillers.forEach((h, i) => tiles.push({ id: `fil-${i}`, region: 'Persia', ...h } as HexTile));

  return tiles;
};

// ─── Rendering ──────────────────────────────────────────────────────
const HEX_SIZE = 30;

const hexToPixel = (q: number, r: number) => {
  const x = HEX_SIZE * (3 / 2 * q);
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x: x + 60, y: y + 70 };
};

const hexPath = (size: number) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push(`${size * Math.cos(angle)},${size * Math.sin(angle)}`);
  }
  return `M ${points.join(' L ')} Z`;
};

const terrainIcons: Record<string, string> = {
  steppe:   'M-8,-2 Q-4,-6 0,-2 Q4,-6 8,-2 M-6,2 Q-2,-2 2,2 Q6,-2 10,2',
  desert:   'M-8,4 Q-4,0 0,4 Q4,0 8,4 M-6,-2 L-4,-4 L-2,-2 M2,-2 L4,-4 L6,-2',
  mountain: 'M-10,6 L-4,-6 L2,6 M-2,6 L4,-4 L10,6',
  forest:   'M0,-8 L-6,4 L6,4 Z M-8,4 L-8,8 M0,4 L0,8 M8,4 L8,8',
  river:    'M-8,0 Q-4,-4 0,0 Q4,4 8,0',
  city:     'M-6,6 L-6,-2 L0,-6 L6,-2 L6,6 M-2,6 L-2,2 L2,2 L2,6',
  tundra:   'M-6,-2 L-4,-6 L-2,-2 M2,-2 L4,-6 L6,-2 M-4,4 L0,0 L4,4',
  sea:      'M-10,0 Q-6,-4 -2,0 Q2,4 6,0 Q10,-4 14,0',
};

// ─── Silk Road trade route coordinates ──────────────────────────────
const silkRoadPath = [
  { q: 3, r: 5 },  // Bagdad
  { q: 5, r: 4 },
  { q: 6, r: 4 },  // Urgench
  { q: 7, r: 4 },  // Bukhara
  { q: 8, r: 4 },  // Samarkand
  { q: 9, r: 3 },  // Balasagun
  { q: 11, r: 4 }, // Gobi
  { q: 12, r: 4 }, // Zhongxing
  { q: 14, r: 4 },
  { q: 15, r: 4 }, // Kaifeng
];

interface HexTileComponentProps {
  tile: HexTile;
  size: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const HexTileComponent = ({ tile, size, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave }: HexTileComponentProps) => {
  const { x, y } = hexToPixel(tile.q, tile.r);
  const colors = terrainColors[tile.terrain];
  const regionColor = regionColors[tile.region];

  const highlightStroke = isSelected ? '#FFFFFF' : isHovered ? '#FFE066' : regionColor;
  const highlightWidth = isSelected ? 4 : isHovered ? 3 : (tile.isCapital ? 3 : 1.5);
  const glowFilter = isSelected || isHovered ? 'url(#glow)' : undefined;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      <path d={hexPath(size)} fill={colors.fill} stroke={highlightStroke} strokeWidth={highlightWidth} filter={glowFilter} className="transition-all duration-200" />
      <path d={terrainIcons[tile.terrain]} fill="none" stroke={colors.stroke} strokeWidth={1.5} opacity={0.5} />

      {tile.isCity && (
        <>
          <circle cx={0} cy={0} r={tile.isCapital ? 10 : 6} fill={tile.isCapital ? '#FFD700' : '#FFFFFF'} stroke="#333" strokeWidth={1.5} />
          {tile.isCapital && <text x={0} y={4} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#333">★</text>}
        </>
      )}

      {tile.name && (
        <text x={0} y={size + 10} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#333" className="font-display pointer-events-none">
          {tile.name}
        </text>
      )}
    </g>
  );
};

// ─── Info panel ─────────────────────────────────────────────────────
const InfoPanel = ({ tile, onClose }: { tile: HexTile | null; onClose: () => void }) => {
  if (!tile) return null;
  const terrain = terrainInfo[tile.terrain];
  const region = regionInfo[tile.region];
  const TerrainIcon = terrain.icon;

  return (
    <Card className="absolute top-4 right-4 w-80 shadow-xl border-2 border-amber-600 bg-background/95 backdrop-blur z-50 print:hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            {tile.name || `Heksi ${tile.q},${tile.r}`}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
        </div>
        <div className="flex gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${regionColors[tile.region]}33`, color: regionColors[tile.region] }}>
            {tile.region}
          </span>
          {tile.isCapital && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-medium">★ Pääkaupunki</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="p-3 rounded-lg" style={{ backgroundColor: terrainColors[tile.terrain].fill + '40' }}>
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: terrainColors[tile.terrain].stroke }}>
              <TerrainIcon className="w-3 h-3 text-white" />
            </div>
            {terrain.name}
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-muted-foreground">Liikkuminen:</span><span>{terrain.movement}</span>
            <span className="text-muted-foreground">Taistelu:</span><span>{terrain.combat}</span>
            <span className="text-muted-foreground">Resurssit:</span><span>{terrain.resources}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground italic">{terrain.special}</p>
        </div>

        <div className="border-t pt-3">
          <h4 className="font-semibold mb-1 flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: regionColors[tile.region] }} />
            {region.name}
          </h4>
          <p className="text-xs text-muted-foreground mb-2">{region.description}</p>
          <div className="text-xs space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Faktio:</span><span className="font-medium">{region.faction}</span></div>
            {region.capital !== '-' && <div className="flex justify-between"><span className="text-muted-foreground">Pääkaupunki:</span><span className="font-medium">{region.capital}</span></div>}
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Aluebonukset:</p>
            <ul className="text-xs space-y-0.5">
              {region.bonuses.map((b, i) => <li key={i} className="flex items-center gap-1"><span className="text-green-600">+</span> {b}</li>)}
            </ul>
          </div>
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs italic text-amber-800">
            📜 {region.historicalNote}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main component ─────────────────────────────────────────────────
export const PrintableGameBoard = () => {
  const [zoom, setZoom] = useState(1);
  const [selectedTile, setSelectedTile] = useState<HexTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<HexTile | null>(null);
  const [boardType, setBoardType] = useState<'image' | 'svg'>('image');
  const tiles = generateHexGrid();

  const BOARD_WIDTH = 920;
  const BOARD_HEIGHT = 620;

  const handlePrint = () => { setSelectedTile(null); setTimeout(() => window.print(), 100); };

  // Silk Road line path
  const silkRoadSvgPath = silkRoadPath.map((p, i) => {
    const { x, y } = hexToPixel(p.q, p.r);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      <Tabs value={boardType} onValueChange={(v) => setBoardType(v as 'image' | 'svg')} className="print:hidden">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="image" className="gap-2"><Image className="w-4 h-4" />AI-Generoitu Kartta</TabsTrigger>
          <TabsTrigger value="svg" className="gap-2"><Grid3X3 className="w-4 h-4" />Interaktiivinen Heksilauta</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-4 items-center print:hidden">
        <Button onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4" />Tulosta Pelilauta</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="w-4 h-4" /></Button>
          <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="w-4 h-4" /></Button>
          <Button variant="outline" onClick={() => setZoom(1)}>100%</Button>
        </div>
        {boardType === 'svg' && <span className="text-sm text-muted-foreground">💡 Klikkaa heksaa nähdäksesi aluetiedot ja historiallisia yksityiskohtia</span>}
      </div>

      {boardType === 'image' && (
        <div className="space-y-4">
          <div className="relative overflow-auto rounded-xl shadow-2xl" style={{ maxHeight: '80vh' }}>
            {/* Decorative frame */}
            <div className="absolute inset-0 pointer-events-none z-10 rounded-xl" style={{ 
              boxShadow: 'inset 0 0 0 6px #8B4513, inset 0 0 0 8px #D2691E, inset 0 0 0 10px #8B4513',
              borderRadius: '0.75rem'
            }} />

            {/* Base image + terrain overlay */}
            <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: zoom > 1 ? `${100 * zoom}%` : '100%' }}>
              <img src={gameBoardImage} alt="Mongolien Valtakunta - 1206 AD pelilauta" className="w-full h-auto block" />
              
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none" style={{ mixBlendMode: 'multiply' }}>
                <defs>
                  <pattern id="img-steppe" patternUnits="userSpaceOnUse" width="30" height="20">
                    <rect width="30" height="20" fill="#a8b077" />
                    <path d="M0 12 Q4 8 8 12 Q12 16 16 12 Q20 8 24 12 Q28 16 30 12" stroke="#8a9a5a" strokeWidth="0.8" fill="none" />
                    <path d="M5 6 Q9 3 13 6 Q17 9 21 6 Q25 3 29 6" stroke="#9aaa6a" strokeWidth="0.5" fill="none" opacity="0.6" />
                    <line x1="7" y1="10" x2="7" y2="16" stroke="#7a8a4a" strokeWidth="0.4" opacity="0.5" />
                    <line x1="15" y1="9" x2="15" y2="15" stroke="#7a8a4a" strokeWidth="0.4" opacity="0.5" />
                    <line x1="23" y1="10" x2="23" y2="16" stroke="#7a8a4a" strokeWidth="0.4" opacity="0.5" />
                  </pattern>
                  <pattern id="img-desert" patternUnits="userSpaceOnUse" width="40" height="25">
                    <rect width="40" height="25" fill="#d4a574" />
                    <path d="M0 15 Q10 8 20 15 Q30 22 40 15" stroke="#c49060" strokeWidth="1" fill="none" opacity="0.5" />
                    <path d="M5 20 Q15 14 25 20 Q35 26 40 20" stroke="#c49060" strokeWidth="0.6" fill="none" opacity="0.3" />
                    <circle cx="10" cy="6" r="0.8" fill="#c8985c" opacity="0.4" />
                    <circle cx="30" cy="10" r="0.5" fill="#c8985c" opacity="0.3" />
                  </pattern>
                  <pattern id="img-forest" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#2d6a27" />
                    <path d="M5 18 L5 12 L2 12 L5 7 L3 7 L5 3 L7 7 L5.5 7 L8 12 L5 12" fill="#1e5a1a" opacity="0.6" />
                    <path d="M14 18 L14 13 L11 13 L14 8 L12 8 L14 4 L16 8 L14.5 8 L17 13 L14 13" fill="#1e5a1a" opacity="0.5" />
                    <circle cx="5" cy="5" r="3" fill="#246a20" opacity="0.3" />
                    <circle cx="15" cy="7" r="2.5" fill="#246a20" opacity="0.25" />
                  </pattern>
                  <pattern id="img-taiga" patternUnits="userSpaceOnUse" width="24" height="20">
                    <rect width="24" height="20" fill="#3a7a34" />
                    <path d="M8 18 L8 10 L5 10 L8 4 L11 10 L8 10" fill="#2a5a24" opacity="0.5" />
                    <path d="M18 18 L18 12 L16 12 L18 7 L20 12 L18 12" fill="#2a5a24" opacity="0.4" />
                    <rect x="7.5" y="14" width="1" height="4" fill="#5a3a1a" opacity="0.3" />
                    <rect x="17.5" y="14" width="1" height="4" fill="#5a3a1a" opacity="0.3" />
                  </pattern>
                  <pattern id="img-mountain" patternUnits="userSpaceOnUse" width="30" height="24">
                    <rect width="30" height="24" fill="#7a7f88" />
                    <path d="M0 24 L8 6 L16 24 Z" fill="#6a6f78" opacity="0.5" />
                    <path d="M14 24 L22 4 L30 24 Z" fill="#5a5f68" opacity="0.4" />
                    <path d="M6 10 L8 6 L10 10" fill="#e8e8f0" opacity="0.5" />
                    <path d="M20 8 L22 4 L24 8" fill="#e8e8f0" opacity="0.6" />
                  </pattern>
                  <pattern id="img-tundra" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#c0ccd4" />
                    <circle cx="5" cy="5" r="3" fill="#d8e4ec" opacity="0.5" />
                    <circle cx="15" cy="12" r="2.5" fill="#d8e4ec" opacity="0.4" />
                    <path d="M2 14 L4 14 M3 13 L3 15" stroke="#e8f0f8" strokeWidth="0.5" opacity="0.4" />
                    <path d="M16 4 L18 4 M17 3 L17 5" stroke="#e8f0f8" strokeWidth="0.5" opacity="0.4" />
                  </pattern>
                  <pattern id="img-farmland" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#7cb342" />
                    <rect x="0" y="0" width="9" height="9" fill="#8cc44a" opacity="0.5" />
                    <rect x="10" y="10" width="10" height="10" fill="#6ca332" opacity="0.4" />
                    <line x1="0" y1="5" x2="20" y2="5" stroke="#6aa030" strokeWidth="0.4" opacity="0.3" />
                    <line x1="0" y1="15" x2="20" y2="15" stroke="#6aa030" strokeWidth="0.4" opacity="0.3" />
                  </pattern>
                  <pattern id="img-water" patternUnits="userSpaceOnUse" width="24" height="16">
                    <rect width="24" height="16" fill="#3b6fa0" />
                    <path d="M0 8 Q6 4 12 8 Q18 12 24 8" stroke="#5a8ac0" strokeWidth="0.8" fill="none" opacity="0.5" />
                    <path d="M0 13 Q6 10 12 13 Q18 16 24 13" stroke="#5a8ac0" strokeWidth="0.5" fill="none" opacity="0.3" />
                  </pattern>
                  {/* Silk Road glow */}
                  <filter id="silk-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* === FULL MAP TERRAIN — high opacity to create painted map look === */}

                {/* Base fill — light warm wash */}
                <rect width="1000" height="700" fill="#ddd4c0" opacity="0.3" />

                {/* Tundra — wilderness, strong */}
                <path d="M 0 0 L 1000 0 L 1000 90 Q 800 70 600 80 Q 400 70 200 75 Q 100 65 0 70 Z" fill="url(#img-tundra)" opacity="0.55" />
                
                {/* Venäjän metsät — moderate (has Novgorod, Kiev labels) */}
                <path d="M 0 70 Q 30 60 80 75 Q 140 100 180 140 Q 210 200 200 260 Q 180 310 120 320 Q 60 310 20 290 Q 0 260 0 200 Z" fill="url(#img-forest)" opacity="0.4" />

                {/* Siperian taiga — wilderness, stronger */}
                <path d="M 120 55 Q 300 40 500 55 Q 650 50 780 80 Q 800 110 750 140 Q 650 150 500 130 Q 350 115 220 100 Q 140 90 120 75 Z" fill="url(#img-taiga)" opacity="0.5" />

                {/* Itä-Siperian taiga — wilderness */}
                <path d="M 750 60 Q 830 50 900 70 Q 930 100 920 140 Q 880 160 830 150 Q 770 130 750 100 Z" fill="url(#img-taiga)" opacity="0.45" />

                {/* Kipčakkien aro — moderate (has some labels) */}
                <path d="M 100 200 Q 180 175 300 190 Q 400 210 430 250 Q 420 300 340 310 Q 220 300 130 270 Q 90 240 100 200 Z" fill="url(#img-steppe)" opacity="0.4" />

                {/* Mongolian aro — strong wilderness */}
                <path d="M 520 90 Q 650 70 800 110 Q 850 160 840 230 Q 800 270 700 260 Q 590 240 530 190 Q 510 140 520 90 Z" fill="url(#img-steppe)" opacity="0.5" />

                {/* Kara-Khitain aro */}
                <path d="M 400 150 Q 520 130 590 170 Q 600 220 550 250 Q 460 260 400 230 Q 380 190 400 150 Z" fill="url(#img-steppe)" opacity="0.4" />

                {/* Gobin autiomaa — strong wilderness */}
                <path d="M 600 210 Q 740 190 810 250 Q 830 310 800 360 Q 710 380 620 340 Q 570 290 600 210 Z" fill="url(#img-desert)" opacity="0.55" />

                {/* Taklamakanin autiomaa — strong */}
                <path d="M 440 250 Q 530 230 590 270 Q 600 320 560 350 Q 480 360 430 330 Q 410 290 440 250 Z" fill="url(#img-desert)" opacity="0.5" />

                {/* Keski-Aasian autiomaa — moderate (has Samarkand, Bukhara) */}
                <path d="M 240 250 Q 370 220 450 270 Q 480 330 450 380 Q 360 410 270 380 Q 220 330 240 250 Z" fill="url(#img-desert)" opacity="0.4" />

                {/* Persian autiomaa — moderate (has cities) */}
                <path d="M 80 330 Q 200 290 300 350 Q 330 420 300 490 Q 200 530 100 490 Q 50 430 80 330 Z" fill="url(#img-desert)" opacity="0.4" />

                {/* Arabian autiomaa — strong wilderness */}
                <path d="M 0 400 Q 60 370 130 400 Q 160 450 140 510 Q 80 540 30 520 Q 0 480 0 430 Z" fill="url(#img-desert)" opacity="0.5" />

                {/* Khwarezmin viljelymaat — light (many cities) */}
                <path d="M 310 240 Q 400 220 440 265 Q 445 310 400 340 Q 330 345 300 310 Q 290 275 310 240 Z" fill="url(#img-farmland)" opacity="0.3" />

                {/* Mesopotamian viljelymaat — light (Baghdad etc) */}
                <path d="M 160 330 Q 210 310 240 340 Q 240 380 210 400 Q 170 400 155 370 Z" fill="url(#img-farmland)" opacity="0.3" />

                {/* Tiibetin vuoristo — strong (wilderness, few labels) */}
                <path d="M 380 360 Q 560 330 720 380 Q 760 440 730 510 Q 600 550 450 520 Q 370 470 380 360 Z" fill="url(#img-mountain)" opacity="0.55" />

                {/* Altai-vuoret — strong */}
                <path d="M 490 110 Q 550 90 590 130 Q 600 180 570 200 Q 510 200 490 170 Q 480 140 490 110 Z" fill="url(#img-mountain)" opacity="0.5" />

                {/* Kaukasus — moderate (has Georgia, Tbilisi) */}
                <path d="M 170 270 Q 240 260 290 290 Q 290 330 250 350 Q 190 350 170 320 Q 160 295 170 270 Z" fill="url(#img-mountain)" opacity="0.4" />

                {/* Tien Shan — strong */}
                <path d="M 420 220 Q 480 200 520 230 Q 520 270 490 285 Q 440 285 420 260 Z" fill="url(#img-mountain)" opacity="0.45" />

                {/* Uralin vuoret */}
                <path d="M 260 50 Q 270 40 280 50 Q 290 100 285 160 Q 280 200 270 230 Q 260 220 255 170 Q 250 100 260 50 Z" fill="url(#img-mountain)" opacity="0.4" />

                {/* Jin viljelymaat — lighter (Zhongdu, Datong labels) */}
                <path d="M 790 180 Q 890 160 930 220 Q 945 310 920 380 Q 850 400 790 360 Q 760 290 780 220 Z" fill="url(#img-farmland)" opacity="0.35" />

                {/* Song metsät — lighter (Hangzhou etc) */}
                <path d="M 800 380 Q 880 350 940 410 Q 970 500 950 590 Q 880 630 810 590 Q 770 510 790 430 Z" fill="url(#img-forest)" opacity="0.3" />
                <path d="M 830 410 Q 890 390 920 440 Q 930 500 910 550 Q 860 560 840 520 Q 820 470 830 410 Z" fill="url(#img-farmland)" opacity="0.25" />

                {/* Intian viljelymaat — moderate (Delhi etc) */}
                <path d="M 350 460 Q 500 430 600 500 Q 630 580 600 660 Q 500 700 380 670 Q 320 590 350 460 Z" fill="url(#img-farmland)" opacity="0.3" />

                {/* Intian trooppinen metsä — strong wilderness */}
                <path d="M 420 530 Q 520 510 570 560 Q 580 620 540 660 Q 460 670 420 630 Q 400 580 420 530 Z" fill="url(#img-forest)" opacity="0.4" />

                {/* Kashmir / Hindukush — strong */}
                <path d="M 360 380 Q 440 360 500 400 Q 500 450 460 480 Q 380 480 350 440 Q 340 410 360 380 Z" fill="url(#img-mountain)" opacity="0.45" />

                {/* Korean metsät */}
                <path d="M 900 180 Q 930 170 945 200 Q 950 250 935 280 Q 910 285 900 260 Q 890 220 900 180 Z" fill="url(#img-forest)" opacity="0.3" />

                {/* Manchurian metsät */}
                <path d="M 830 120 Q 890 100 920 140 Q 930 180 910 210 Q 870 220 840 200 Q 820 170 830 120 Z" fill="url(#img-forest)" opacity="0.35" />

                {/* === WATER BODIES — keep strong === */}
                <path d="M 940 0 L 1000 0 L 1000 700 L 920 700 Q 945 500 955 300 Q 950 150 940 0 Z" fill="url(#img-water)" opacity="0.55" />
                <path d="M 0 580 Q 200 560 400 630 Q 350 700 100 700 L 0 700 Z" fill="url(#img-water)" opacity="0.4" />
                <path d="M 130 260 Q 160 250 180 265 Q 185 285 170 295 Q 145 295 130 280 Z" fill="url(#img-water)" opacity="0.6" />
                <path d="M 210 280 Q 235 270 250 295 Q 255 340 240 370 Q 215 375 200 350 Q 195 310 210 280 Z" fill="url(#img-water)" opacity="0.6" />
                <path d="M 310 225 Q 330 218 340 235 Q 342 260 325 268 Q 308 262 305 245 Z" fill="url(#img-water)" opacity="0.6" />
                <path d="M 688 75 Q 702 65 712 78 Q 718 100 708 115 Q 695 110 688 98 Z" fill="url(#img-water)" opacity="0.65" />
                <path d="M 180 430 Q 210 420 230 440 Q 230 470 210 480 Q 185 475 178 455 Z" fill="url(#img-water)" opacity="0.55" />
                <path d="M 280 600 Q 400 580 500 620 Q 500 700 350 700 Q 250 700 250 650 Z" fill="url(#img-water)" opacity="0.35" />

                {/* === SILK ROAD — golden dashed line === */}
                <path 
                  d="M 900 290 Q 870 280 840 300 Q 800 310 760 300 Q 720 280 680 270 Q 640 260 600 270 Q 560 280 520 260 Q 480 240 440 250 Q 400 260 370 270 Q 340 275 310 265 Q 280 255 250 270 Q 230 280 210 310 Q 190 330 170 350 Q 150 365 130 370"
                  fill="none" stroke="#DAA520" strokeWidth="3" strokeDasharray="10,5" opacity="0.6" filter="url(#silk-glow)" strokeLinecap="round"
                />
                {/* Northern Silk Road branch */}
                <path 
                  d="M 600 270 Q 570 240 540 220 Q 510 200 480 190 Q 450 180 420 185 Q 390 190 360 210 Q 340 225 320 235"
                  fill="none" stroke="#DAA520" strokeWidth="2" strokeDasharray="8,4" opacity="0.4" filter="url(#silk-glow)" strokeLinecap="round"
                />
                {/* Southern branch toward India */}
                <path 
                  d="M 370 270 Q 380 310 400 350 Q 410 380 420 410"
                  fill="none" stroke="#DAA520" strokeWidth="2" strokeDasharray="8,4" opacity="0.35" filter="url(#silk-glow)" strokeLinecap="round"
                />

                {/* === RIVERS === */}
                {/* Keltainenjoki */}
                <path d="M 760 250 Q 800 230 830 260 Q 850 290 870 280 Q 890 270 900 290" fill="none" stroke="#4a80b0" strokeWidth="1.8" opacity="0.4" strokeLinecap="round" />
                {/* Jangtse */}
                <path d="M 720 360 Q 780 340 820 370 Q 860 390 900 380 Q 930 400 950 420" fill="none" stroke="#4a80b0" strokeWidth="2" opacity="0.35" strokeLinecap="round" />
                {/* Amu-Darja */}
                <path d="M 320 240 Q 340 260 360 250 Q 380 240 400 260 Q 420 280 430 270" fill="none" stroke="#4a80b0" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
                {/* Syr-Darja */}
                <path d="M 330 220 Q 370 210 410 220 Q 450 230 470 240" fill="none" stroke="#4a80b0" strokeWidth="1.3" opacity="0.3" strokeLinecap="round" />
                {/* Volga */}
                <path d="M 160 150 Q 180 200 200 240 Q 210 270 220 290" fill="none" stroke="#4a80b0" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" />
                {/* Dnepr */}
                <path d="M 100 160 Q 110 200 120 240 Q 125 260 130 270" fill="none" stroke="#4a80b0" strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
                {/* Don */}
                <path d="M 150 180 Q 155 210 150 240 Q 145 260 140 270" fill="none" stroke="#4a80b0" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
                {/* Onon-joki */}
                <path d="M 680 130 Q 700 140 720 135 Q 740 130 760 140" fill="none" stroke="#4a80b0" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
                {/* Kerulen */}
                <path d="M 700 150 Q 730 155 760 150 Q 790 145 810 155" fill="none" stroke="#4a80b0" strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />
                {/* Indus */}
                <path d="M 430 400 Q 420 440 410 470 Q 400 500 390 540 Q 385 570 380 600" fill="none" stroke="#4a80b0" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
                {/* Ganges */}
                <path d="M 480 440 Q 500 460 520 470 Q 550 480 580 490 Q 600 495 620 500" fill="none" stroke="#4a80b0" strokeWidth="1.3" opacity="0.25" strokeLinecap="round" />
                {/* Eufrat */}
                <path d="M 200 310 Q 190 340 180 370 Q 175 400 170 430 Q 168 450 170 465" fill="none" stroke="#4a80b0" strokeWidth="1.2" opacity="0.3" strokeLinecap="round" />
                {/* Tigris */}
                <path d="M 215 315 Q 205 345 200 375 Q 195 410 192 440 Q 190 460 192 475" fill="none" stroke="#4a80b0" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
                {/* Ob */}
                <path d="M 460 30 Q 470 60 475 100 Q 480 140 478 180" fill="none" stroke="#4a80b0" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
                {/* Irtysh */}
                <path d="M 430 50 Q 445 80 455 120 Q 465 160 470 190" fill="none" stroke="#4a80b0" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
                {/* Yenisei */}
                <path d="M 560 25 Q 570 55 575 95 Q 580 130 578 170" fill="none" stroke="#4a80b0" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
                {/* Lena */}
                <path d="M 680 20 Q 690 50 695 90 Q 698 120 695 150" fill="none" stroke="#4a80b0" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
                {/* Tarim */}
                <path d="M 480 270 Q 510 285 540 290 Q 570 292 590 285" fill="none" stroke="#4a80b0" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />

                {/* === MOUNTAIN PEAKS === */}
                {/* Himalaja */}
                {[
                  [520, 410], [550, 420], [580, 415], [610, 425], [640, 418],
                  [500, 430], [530, 440], [560, 435], [590, 445], [620, 440],
                  [480, 420], [660, 430], [540, 450],
                ].map(([cx, cy], i) => (
                  <g key={`peak-h-${i}`} opacity="0.4">
                    <path d={`M ${cx-6} ${cy+4} L ${cx} ${cy-6} L ${cx+6} ${cy+4} Z`} fill="#6a6f78" />
                    <path d={`M ${cx-2} ${cy-3} L ${cx} ${cy-6} L ${cx+2} ${cy-3}`} fill="#f0f0f8" />
                  </g>
                ))}
                {/* Altai */}
                {[
                  [520, 135], [540, 145], [555, 155], [530, 160], [510, 150],
                ].map(([cx, cy], i) => (
                  <g key={`peak-a-${i}`} opacity="0.35">
                    <path d={`M ${cx-5} ${cy+3} L ${cx} ${cy-5} L ${cx+5} ${cy+3} Z`} fill="#6a7078" />
                    <path d={`M ${cx-1.5} ${cy-2.5} L ${cx} ${cy-5} L ${cx+1.5} ${cy-2.5}`} fill="#e8e8f0" />
                  </g>
                ))}
                {/* Kaukasus */}
                {[
                  [200, 285], [220, 295], [240, 305], [230, 290], [260, 315],
                ].map(([cx, cy], i) => (
                  <g key={`peak-c-${i}`} opacity="0.3">
                    <path d={`M ${cx-4} ${cy+3} L ${cx} ${cy-4} L ${cx+4} ${cy+3} Z`} fill="#6a7078" />
                    <path d={`M ${cx-1} ${cy-2} L ${cx} ${cy-4} L ${cx+1} ${cy-2}`} fill="#e8e8f0" />
                  </g>
                ))}
                {/* Tien Shan */}
                {[
                  [440, 240], [460, 250], [480, 255], [500, 248], [470, 265],
                ].map(([cx, cy], i) => (
                  <g key={`peak-t-${i}`} opacity="0.3">
                    <path d={`M ${cx-4} ${cy+3} L ${cx} ${cy-5} L ${cx+4} ${cy+3} Z`} fill="#6a7078" />
                    <path d={`M ${cx-1} ${cy-2.5} L ${cx} ${cy-5} L ${cx+1} ${cy-2.5}`} fill="#e8e8f0" />
                  </g>
                ))}
                {/* Hindukush */}
                {[
                  [390, 390], [410, 400], [430, 395], [400, 410],
                ].map(([cx, cy], i) => (
                  <g key={`peak-hk-${i}`} opacity="0.28">
                    <path d={`M ${cx-4} ${cy+3} L ${cx} ${cy-5} L ${cx+4} ${cy+3} Z`} fill="#6a7078" />
                    <path d={`M ${cx-1} ${cy-2.5} L ${cx} ${cy-5} L ${cx+1} ${cy-2.5}`} fill="#e8e8f0" />
                  </g>
                ))}
                {/* Ural peaks */}
                {[
                  [268, 80], [270, 110], [272, 140], [271, 170],
                ].map(([cx, cy], i) => (
                  <g key={`peak-u-${i}`} opacity="0.2">
                    <path d={`M ${cx-3} ${cy+2} L ${cx} ${cy-3} L ${cx+3} ${cy+2} Z`} fill="#7a7f88" />
                    <path d={`M ${cx-0.8} ${cy-1.5} L ${cx} ${cy-3} L ${cx+0.8} ${cy-1.5}`} fill="#e8e8f0" />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}

      {boardType === 'svg' && (
        <>
          {/* Region legend */}
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-2 p-3 bg-muted rounded-lg print:bg-white print:border print:border-gray-300">
            <h4 className="col-span-full font-display font-bold mb-1 text-sm">Valtakunnat (1206 AD):</h4>
            {Object.entries(regionColors).map(([region, color]) => (
              <div key={region} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border-2" style={{ borderColor: color, backgroundColor: `${color}33` }} />
                <span className="text-xs">{region}</span>
              </div>
            ))}
          </div>

          {/* Terrain legend */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 p-3 bg-muted rounded-lg print:bg-white print:border print:border-gray-300">
            <h4 className="col-span-full font-display font-bold mb-1 text-sm">Maastotyypit:</h4>
            {Object.entries(terrainColors).map(([terrain, colors]) => (
              <div key={terrain} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }} />
                <span className="text-xs">{terrainInfo[terrain]?.name || terrain}</span>
              </div>
            ))}
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #DAA520' }} />
              <span className="text-xs">Silkkitie</span>
            </div>
          </div>

          <div className="relative">
            <InfoPanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
            <div className="overflow-auto border-4 border-amber-700 rounded-lg print:hidden" style={{ maxHeight: '80vh', backgroundColor: '#d8cbb0' }}>
              <svg viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} style={{ width: zoom === 1 ? '100%' : `${BOARD_WIDTH * zoom}px`, minWidth: `${BOARD_WIDTH}px`, height: 'auto' }}>
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  {/* Terrain fill patterns for background regions */}
                  <pattern id="bg-steppe" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#c4c89a" />
                    <circle cx="5" cy="5" r="1" fill="#aab07a" opacity="0.4" />
                    <circle cx="15" cy="15" r="1" fill="#aab07a" opacity="0.4" />
                  </pattern>
                  <pattern id="bg-desert" patternUnits="userSpaceOnUse" width="15" height="15">
                    <rect width="15" height="15" fill="#e4c49a" />
                    <path d="M0 7 Q7 4 15 7" stroke="#d0a878" strokeWidth="0.5" fill="none" opacity="0.5" />
                  </pattern>
                  <pattern id="bg-mountain" patternUnits="userSpaceOnUse" width="24" height="20">
                    <rect width="24" height="20" fill="#9aa0a8" />
                    <path d="M0 20 L8 8 L16 20 Z" fill="#8a9098" opacity="0.4" />
                    <path d="M8 20 L16 5 L24 20 Z" fill="#7a8088" opacity="0.3" />
                    <path d="M12 8 L16 3 L20 8" fill="white" opacity="0.2" />
                  </pattern>
                  <pattern id="bg-forest" patternUnits="userSpaceOnUse" width="12" height="12">
                    <rect width="12" height="12" fill="#5a8a54" />
                    <circle cx="4" cy="4" r="2" fill="#4a7a44" opacity="0.5" />
                    <circle cx="10" cy="8" r="1.5" fill="#4a7a44" opacity="0.5" />
                  </pattern>
                  <pattern id="bg-tundra" patternUnits="userSpaceOnUse" width="16" height="16">
                    <rect width="16" height="16" fill="#d0dce4" />
                    <circle cx="4" cy="4" r="2" fill="#e0ecf4" opacity="0.5" />
                    <circle cx="12" cy="12" r="1.5" fill="#c0d0dc" opacity="0.4" />
                  </pattern>
                  <pattern id="bg-water" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#4a7ab0" />
                    <path d="M0 10 Q5 7 10 10 Q15 13 20 10" stroke="#5a8ac0" strokeWidth="0.8" fill="none" opacity="0.5" />
                    <path d="M0 16 Q5 13 10 16 Q15 19 20 16" stroke="#5a8ac0" strokeWidth="0.5" fill="none" opacity="0.3" />
                  </pattern>
                </defs>

                {/* Full background fill */}
                <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#c8bda0" />
                {/* Tundra — top strip */}
                <path d={`M 0 0 L ${BOARD_WIDTH} 0 L ${BOARD_WIDTH} 100 Q ${BOARD_WIDTH*0.7} 80 ${BOARD_WIDTH*0.4} 90 Q ${BOARD_WIDTH*0.2} 85 0 95 Z`} fill="url(#bg-tundra)" opacity="0.6" />
                {/* Steppe belt */}
                <path d={`M 60 100 Q ${BOARD_WIDTH*0.4} 80 ${BOARD_WIDTH*0.7} 110 Q ${BOARD_WIDTH*0.8} 160 ${BOARD_WIDTH*0.7} 200 Q ${BOARD_WIDTH*0.4} 220 100 200 Q 40 180 60 100 Z`} fill="url(#bg-steppe)" opacity="0.35" />
                {/* Forest west */}
                <path d="M 0 95 Q 60 85 120 110 Q 160 140 150 200 Q 120 250 70 260 Q 30 250 0 230 Z" fill="url(#bg-forest)" opacity="0.4" />
                {/* Desert central */}
                <path d={`M 200 230 Q 350 200 480 240 Q 520 300 480 350 Q 370 380 260 350 Q 190 310 200 230 Z`} fill="url(#bg-desert)" opacity="0.35" />
                {/* Gobi */}
                <path d={`M 520 170 Q 620 150 700 190 Q 730 240 710 290 Q 640 320 560 290 Q 500 250 520 170 Z`} fill="url(#bg-desert)" opacity="0.3" />
                {/* Tibet/Himalaya */}
                <path d={`M 340 310 Q 480 280 650 320 Q 720 370 690 430 Q 580 460 440 440 Q 320 420 310 360 Z`} fill="url(#bg-mountain)" opacity="0.45" />
                {/* Persia/Arabia */}
                <path d={`M 0 260 Q 100 240 200 280 Q 300 310 320 380 Q 300 460 200 500 Q 100 510 40 470 Q 0 420 0 360 Z`} fill="url(#bg-desert)" opacity="0.35" />
                {/* China farmland */}
                <path d={`M 680 200 Q 780 180 840 240 Q 870 320 840 400 Q 780 430 710 390 Q 660 330 670 260 Z`} fill="url(#bg-forest)" opacity="0.25" />
                {/* South China */}
                <path d={`M 700 400 Q 800 380 860 440 Q ${BOARD_WIDTH} 520 ${BOARD_WIDTH} 620 L 680 620 Q 660 510 680 430 Z`} fill="url(#bg-forest)" opacity="0.2" />
                {/* India */}
                <path d={`M 300 430 Q 450 400 560 460 Q 600 540 560 620 L 260 620 Q 250 530 280 460 Z`} fill="url(#bg-steppe)" opacity="0.25" />
                {/* East seas */}
                <path d={`M ${BOARD_WIDTH-60} 0 L ${BOARD_WIDTH} 0 L ${BOARD_WIDTH} 620 L ${BOARD_WIDTH-80} 620 Q ${BOARD_WIDTH-70} 400 ${BOARD_WIDTH-60} 200 Z`} fill="url(#bg-water)" opacity="0.4" />
                {/* South seas */}
                <path d={`M 0 480 Q 100 470 200 490 L 250 620 L 0 620 Z`} fill="url(#bg-water)" opacity="0.3" />

                <rect x={8} y={8} width={BOARD_WIDTH - 16} height={BOARD_HEIGHT - 16} fill="none" stroke="#8B4513" strokeWidth={3} />
                <rect x={16} y={16} width={BOARD_WIDTH - 32} height={BOARD_HEIGHT - 32} fill="none" stroke="#D2691E" strokeWidth={1} />

                <text x={BOARD_WIDTH / 2} y={35} textAnchor="middle" fontSize={18} fontWeight="bold" fill="#5D3A1A" className="font-display">MONGOLIEN VALTAKUNTA — EURAASIA 1206 AD</text>
                <text x={BOARD_WIDTH / 2} y={50} textAnchor="middle" fontSize={9} fill="#8B4513">Historiallisesti tarkka kartta · Genghis Khanin vallan alku</text>

                {/* Silk Road */}
                <path d={silkRoadSvgPath} fill="none" stroke="#DAA520" strokeWidth={3} strokeDasharray="8,4" opacity={0.6} />

                {/* Compass rose */}
                <g transform={`translate(${BOARD_WIDTH - 45}, 65)`}>
                  <circle cx={0} cy={0} r={16} fill="#FFF8E7" stroke="#8B4513" strokeWidth={1} />
                  <text x={0} y={-5} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#5D3A1A">P</text>
                  <text x={0} y={14} textAnchor="middle" fontSize={7} fill="#8B4513">E</text>
                  <text x={10} y={4} textAnchor="middle" fontSize={7} fill="#8B4513">I</text>
                  <text x={-10} y={4} textAnchor="middle" fontSize={7} fill="#8B4513">L</text>
                  <line x1={0} y1={-14} x2={0} y2={-3} stroke="#5D3A1A" strokeWidth={1.5} />
                </g>

                {tiles.map(tile => (
                  <HexTileComponent key={tile.id} tile={tile} size={HEX_SIZE} isSelected={selectedTile?.id === tile.id} isHovered={hoveredTile?.id === tile.id} onClick={() => setSelectedTile(tile)} onMouseEnter={() => setHoveredTile(tile)} onMouseLeave={() => setHoveredTile(null)} />
                ))}

                {/* Region labels */}
                {[
                  { label: 'VENÄJÄ', q: 1, r: 1.5, size: 8 },
                  { label: 'KIPČAKIT', q: 4.5, r: 2.5, size: 8 },
                  { label: 'KAUKASIA', q: 3, r: 4.5, size: 7 },
                  { label: 'KHWAREZMIA', q: 7, r: 4.5, size: 7 },
                  { label: 'PERSIA', q: 4, r: 6.5, size: 8 },
                  { label: 'KARA-KHITAI', q: 9.5, r: 3.5, size: 7 },
                  { label: 'MONGOLIA', q: 11, r: 1.5, size: 10 },
                  { label: 'XI XIA', q: 12, r: 4.5, size: 7 },
                  { label: 'JIN', q: 16, r: 2.5, size: 9 },
                  { label: 'SONG', q: 15, r: 6.5, size: 8 },
                  { label: 'INTIA', q: 8.5, r: 8.5, size: 8 },
                  { label: 'TIIBET', q: 11, r: 6.5, size: 7 },
                  { label: 'GOBI', q: 12.5, r: 3.5, size: 7 },
                  { label: 'SIPERIA', q: 7, r: 0.3, size: 8 },
                ].map(({ label, q, r, size }) => {
                  const { x, y } = hexToPixel(q, r);
                  return <text key={label} x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="bold" fill="#5D3A1A" opacity={0.5} className="pointer-events-none">{label}</text>;
                })}

                {/* Scale */}
                <g transform={`translate(40, ${BOARD_HEIGHT - 35})`}>
                  <line x1={0} y1={0} x2={80} y2={0} stroke="#5D3A1A" strokeWidth={2} />
                  <line x1={0} y1={-4} x2={0} y2={4} stroke="#5D3A1A" strokeWidth={2} />
                  <line x1={80} y1={-4} x2={80} y2={4} stroke="#5D3A1A" strokeWidth={2} />
                  <text x={40} y={-6} textAnchor="middle" fontSize={9} fill="#5D3A1A">≈ 1000 km</text>
                </g>

                <text x={BOARD_WIDTH / 2} y={BOARD_HEIGHT - 12} textAnchor="middle" fontSize={8} fill="#8B4513">© Mongolien Valtakunta — Strategialautapeli</text>
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Print version */}
      <div className="hidden print:block print:break-before-page">
        <div className="w-full text-center">
          <img src={gameBoardImage} alt="Mongolien Valtakunta - 1206 AD pelilauta" className="w-full h-auto max-h-screen object-contain" />
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg print:hidden">
        <h4 className="font-bold mb-2">📋 Tulostusohjeet:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Parhaat tulostusasetukset:</strong> Vaakasuunta (Landscape), A3 tai suurempi paperi</li>
          <li>Kartta kattaa alueen Euroopasta Koreaan ja Siperiasta Intiaan</li>
          <li>Suosittelemme laminointia tai pahville liimaamista kestävyyden vuoksi</li>
        </ul>
      </div>
    </div>
  );
};
