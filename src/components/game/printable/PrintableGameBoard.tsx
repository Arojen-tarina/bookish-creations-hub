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
            {/* Title overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="px-6 py-2 rounded-lg" style={{ backgroundColor: 'rgba(93, 58, 26, 0.85)' }}>
                <h3 className="text-center font-display font-bold text-amber-100 text-lg tracking-wide">MONGOLIEN VALTAKUNTA — EURAASIA 1206 AD</h3>
                <p className="text-center text-amber-200/70 text-xs">Historiallisesti tarkka kartta · Genghis Khanin vallan alku</p>
              </div>
            </div>
            {/* Legend overlay */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
              <div className="px-4 py-3 rounded-lg text-xs space-y-1" style={{ backgroundColor: 'rgba(245, 230, 200, 0.9)' }}>
                <p className="font-bold text-amber-900 text-sm mb-1">Valtakunnat</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                  {Object.entries(regionColors).slice(0, 8).map(([region, color]) => (
                    <div key={region} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                      <span style={{ color: '#5D3A1A' }}>{region}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Terrain legend overlay */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
              <div className="px-4 py-3 rounded-lg text-xs space-y-1" style={{ backgroundColor: 'rgba(245, 230, 200, 0.9)' }}>
                <p className="font-bold text-amber-900 text-sm mb-1">Maastotyypit</p>
                <div className="grid grid-cols-1 gap-y-0.5">
                  {[
                    { name: 'Aro / Steppe', color: '#a8b077' },
                    { name: 'Autiomaa', color: '#d4a574' },
                    { name: 'Metsä / Taiga', color: '#2d6a27' },
                    { name: 'Vuoristo', color: '#7a7f88' },
                    { name: 'Tundra', color: '#b8c4cc' },
                    { name: 'Viljelymaa', color: '#7cb342' },
                    { name: 'Meri / Järvi', color: '#3b6fa0' },
                  ].map(t => (
                    <div key={t.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: t.color }} />
                      <span style={{ color: '#5D3A1A' }}>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Compass overlay */}
            <div className="absolute top-4 right-4 z-20 pointer-events-none">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,248,231,0.9)', border: '2px solid #8B4513' }}>
                <span className="text-amber-900 font-bold text-sm">N ↑</span>
              </div>
            </div>

            {/* Base image */}
            <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: zoom > 1 ? `${100 * zoom}%` : '100%' }}>
              <img src={gameBoardImage} alt="Mongolien Valtakunta - 1206 AD pelilauta" className="w-full h-auto block" />
              
              {/* SVG terrain overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none">
                <defs>
                  {/* Steppe - waving grass lines */}
                  <pattern id="img-steppe" patternUnits="userSpaceOnUse" width="30" height="20">
                    <rect width="30" height="20" fill="#a8b077" />
                    <path d="M0 12 Q4 8 8 12 Q12 16 16 12 Q20 8 24 12 Q28 16 30 12" stroke="#8a9a5a" strokeWidth="0.8" fill="none" />
                    <path d="M5 6 Q9 3 13 6 Q17 9 21 6 Q25 3 29 6" stroke="#9aaa6a" strokeWidth="0.5" fill="none" opacity="0.6" />
                    <line x1="7" y1="10" x2="7" y2="16" stroke="#7a8a4a" strokeWidth="0.4" opacity="0.5" />
                    <line x1="15" y1="9" x2="15" y2="15" stroke="#7a8a4a" strokeWidth="0.4" opacity="0.5" />
                    <line x1="23" y1="10" x2="23" y2="16" stroke="#7a8a4a" strokeWidth="0.4" opacity="0.5" />
                  </pattern>
                  {/* Desert - sand dunes */}
                  <pattern id="img-desert" patternUnits="userSpaceOnUse" width="40" height="25">
                    <rect width="40" height="25" fill="#d4a574" />
                    <path d="M0 15 Q10 8 20 15 Q30 22 40 15" stroke="#c49060" strokeWidth="1" fill="none" opacity="0.5" />
                    <path d="M5 20 Q15 14 25 20 Q35 26 40 20" stroke="#c49060" strokeWidth="0.6" fill="none" opacity="0.3" />
                    <circle cx="10" cy="6" r="0.8" fill="#c8985c" opacity="0.4" />
                    <circle cx="30" cy="10" r="0.5" fill="#c8985c" opacity="0.3" />
                  </pattern>
                  {/* Forest - trees */}
                  <pattern id="img-forest" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#2d6a27" />
                    <path d="M5 18 L5 12 L2 12 L5 7 L3 7 L5 3 L7 7 L5.5 7 L8 12 L5 12" fill="#1e5a1a" opacity="0.6" />
                    <path d="M14 18 L14 13 L11 13 L14 8 L12 8 L14 4 L16 8 L14.5 8 L17 13 L14 13" fill="#1e5a1a" opacity="0.5" />
                    <circle cx="5" cy="5" r="3" fill="#246a20" opacity="0.3" />
                    <circle cx="15" cy="7" r="2.5" fill="#246a20" opacity="0.25" />
                  </pattern>
                  {/* Taiga - sparse conifers */}
                  <pattern id="img-taiga" patternUnits="userSpaceOnUse" width="24" height="20">
                    <rect width="24" height="20" fill="#3a7a34" />
                    <path d="M8 18 L8 10 L5 10 L8 4 L11 10 L8 10" fill="#2a5a24" opacity="0.5" />
                    <path d="M18 18 L18 12 L16 12 L18 7 L20 12 L18 12" fill="#2a5a24" opacity="0.4" />
                    <rect x="7.5" y="14" width="1" height="4" fill="#5a3a1a" opacity="0.3" />
                    <rect x="17.5" y="14" width="1" height="4" fill="#5a3a1a" opacity="0.3" />
                  </pattern>
                  {/* Mountain - peaks */}
                  <pattern id="img-mountain" patternUnits="userSpaceOnUse" width="30" height="24">
                    <rect width="30" height="24" fill="#7a7f88" />
                    <path d="M0 24 L8 6 L16 24 Z" fill="#6a6f78" opacity="0.5" />
                    <path d="M14 24 L22 4 L30 24 Z" fill="#5a5f68" opacity="0.4" />
                    <path d="M6 10 L8 6 L10 10" fill="#e8e8f0" opacity="0.5" />
                    <path d="M20 8 L22 4 L24 8" fill="#e8e8f0" opacity="0.6" />
                    <path d="M3 18 L8 8 L13 18" fill="none" stroke="#9a9fa8" strokeWidth="0.4" opacity="0.3" />
                  </pattern>
                  {/* Tundra - snow patches */}
                  <pattern id="img-tundra" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#c0ccd4" />
                    <circle cx="5" cy="5" r="3" fill="#d8e4ec" opacity="0.5" />
                    <circle cx="15" cy="12" r="2.5" fill="#d8e4ec" opacity="0.4" />
                    <circle cx="10" cy="18" r="1.5" fill="#e0ecf4" opacity="0.3" />
                    <path d="M2 14 L4 14 M3 13 L3 15" stroke="#e8f0f8" strokeWidth="0.5" opacity="0.4" />
                    <path d="M16 4 L18 4 M17 3 L17 5" stroke="#e8f0f8" strokeWidth="0.5" opacity="0.4" />
                  </pattern>
                  {/* Farmland - fields */}
                  <pattern id="img-farmland" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#7cb342" />
                    <rect x="0" y="0" width="9" height="9" fill="#8cc44a" opacity="0.5" />
                    <rect x="10" y="10" width="10" height="10" fill="#6ca332" opacity="0.4" />
                    <line x1="0" y1="5" x2="20" y2="5" stroke="#6aa030" strokeWidth="0.4" opacity="0.3" />
                    <line x1="0" y1="15" x2="20" y2="15" stroke="#6aa030" strokeWidth="0.4" opacity="0.3" />
                    <line x1="5" y1="0" x2="5" y2="20" stroke="#6aa030" strokeWidth="0.3" opacity="0.2" />
                    <line x1="15" y1="0" x2="15" y2="20" stroke="#6aa030" strokeWidth="0.3" opacity="0.2" />
                  </pattern>
                  {/* Water */}
                  <pattern id="img-water" patternUnits="userSpaceOnUse" width="24" height="16">
                    <rect width="24" height="16" fill="#3b6fa0" />
                    <path d="M0 8 Q6 4 12 8 Q18 12 24 8" stroke="#5a8ac0" strokeWidth="0.8" fill="none" opacity="0.5" />
                    <path d="M0 13 Q6 10 12 13 Q18 16 24 13" stroke="#5a8ac0" strokeWidth="0.5" fill="none" opacity="0.3" />
                    <path d="M4 4 Q8 2 12 4 Q16 6 20 4" stroke="#4a7ab0" strokeWidth="0.4" fill="none" opacity="0.3" />
                  </pattern>
                </defs>

                {/* === TERRAIN REGIONS === */}
                {/* Coordinates are approximate % of the image: x/1000, y/700 */}

                {/* Siperian tundra — pohjoisreunat */}
                <path d="M 0 0 L 1000 0 L 1000 80 Q 800 60 600 75 Q 400 65 200 70 Q 100 60 0 65 Z" fill="url(#img-tundra)" opacity="0.35" />
                
                {/* Venäjän metsät — luoteinen */}
                <path d="M 0 65 Q 50 55 120 80 Q 180 110 200 160 Q 200 240 160 280 Q 100 300 50 280 Q 0 250 0 200 Z" fill="url(#img-forest)" opacity="0.35" />

                {/* Siperian taiga — pohjoinen keskikaista */}
                <path d="M 200 50 Q 400 40 600 60 Q 700 55 750 80 Q 720 120 650 130 Q 500 110 350 100 Q 250 90 200 70 Z" fill="url(#img-taiga)" opacity="0.3" />

                {/* Kipčakkien aro — Mustanmeren pohjoispuoli */}
                <path d="M 120 200 Q 200 180 320 200 Q 380 220 400 250 Q 360 290 280 280 Q 180 270 120 240 Z" fill="url(#img-steppe)" opacity="0.35" />

                {/* Mongolian aro — keskellä itä */}
                <path d="M 550 100 Q 700 80 800 120 Q 830 170 810 220 Q 750 250 650 230 Q 560 200 540 150 Z" fill="url(#img-steppe)" opacity="0.4" />

                {/* Kara-Khitain aro */}
                <path d="M 430 160 Q 530 140 580 180 Q 570 230 510 240 Q 440 230 420 200 Z" fill="url(#img-steppe)" opacity="0.3" />

                {/* Gobin autiomaa */}
                <path d="M 620 220 Q 730 200 790 250 Q 800 300 760 330 Q 680 340 620 310 Q 590 270 620 220 Z" fill="url(#img-desert)" opacity="0.4" />

                {/* Keski-Aasian autiomaa (Karakum, Kyzylkum) */}
                <path d="M 260 260 Q 380 230 460 280 Q 490 330 460 370 Q 380 400 290 370 Q 240 330 260 260 Z" fill="url(#img-desert)" opacity="0.4" />

                {/* Persia / Arabian autiomaa */}
                <path d="M 100 350 Q 200 310 280 370 Q 300 430 260 480 Q 180 510 100 470 Q 60 420 100 350 Z" fill="url(#img-desert)" opacity="0.35" />

                {/* Khwarezmin viljelymaat (Samarkand, Bukhara) */}
                <path d="M 330 250 Q 400 230 430 270 Q 430 310 390 330 Q 340 330 320 300 Z" fill="url(#img-farmland)" opacity="0.3" />

                {/* Tiibetin vuoristo / Himalaja */}
                <path d="M 420 380 Q 560 350 700 400 Q 730 450 700 500 Q 580 520 460 490 Q 400 450 420 380 Z" fill="url(#img-mountain)" opacity="0.45" />

                {/* Altai-vuoret */}
                <path d="M 500 120 Q 550 100 580 130 Q 580 170 550 180 Q 510 175 500 150 Z" fill="url(#img-mountain)" opacity="0.35" />

                {/* Kaukasuksen vuoret */}
                <path d="M 180 280 Q 240 270 280 300 Q 270 330 230 340 Q 190 330 180 310 Z" fill="url(#img-mountain)" opacity="0.35" />

                {/* Jin / Pohjois-Kiinan viljelymaat */}
                <path d="M 800 200 Q 880 180 920 230 Q 930 300 900 360 Q 840 380 800 340 Q 770 280 790 230 Z" fill="url(#img-farmland)" opacity="0.35" />

                {/* Song / Etelä-Kiinan metsät ja viljelymaat */}
                <path d="M 810 370 Q 880 350 930 400 Q 960 480 940 560 Q 880 600 820 560 Q 780 490 800 420 Z" fill="url(#img-forest)" opacity="0.25" />
                <path d="M 830 400 Q 880 380 910 420 Q 920 470 900 510 Q 860 520 840 490 Q 820 450 830 400 Z" fill="url(#img-farmland)" opacity="0.2" />

                {/* Intian viljelymaat */}
                <path d="M 380 470 Q 500 440 580 500 Q 600 560 570 620 Q 480 660 400 630 Q 350 570 380 470 Z" fill="url(#img-farmland)" opacity="0.25" />

                {/* Kashmir / Intian vuoristot */}
                <path d="M 380 400 Q 440 380 480 420 Q 470 460 430 470 Q 380 460 370 430 Z" fill="url(#img-mountain)" opacity="0.3" />

                {/* Itäinen meri / Tyynimeri */}
                <path d="M 940 0 L 1000 0 L 1000 700 L 930 700 Q 950 500 960 300 Q 955 150 940 0 Z" fill="url(#img-water)" opacity="0.4" />

                {/* Eteläinen merivyöhyke */}
                <path d="M 0 550 Q 200 530 400 600 Q 300 680 100 700 L 0 700 Z" fill="url(#img-water)" opacity="0.25" />

                {/* Kaspianmeri */}
                <path d="M 210 290 Q 230 280 245 300 Q 245 340 230 360 Q 210 360 200 340 Q 195 310 210 290 Z" fill="url(#img-water)" opacity="0.45" />

                {/* Araljärvi */}
                <path d="M 310 230 Q 325 225 335 240 Q 335 260 320 265 Q 305 260 305 245 Z" fill="url(#img-water)" opacity="0.45" />

                {/* Baikaljärvi */}
                <path d="M 690 80 Q 700 70 710 80 Q 715 100 705 110 Q 695 105 690 95 Z" fill="url(#img-water)" opacity="0.5" />

                {/* Geographic labels */}
                <text x="120" y="140" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1a3a10" opacity="0.35" fontStyle="italic">Taiga</text>
                <text x="700" y="180" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#5a6a30" opacity="0.3" fontStyle="italic">Steppe</text>
                <text x="700" y="290" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#8a6a40" opacity="0.35" fontStyle="italic">Gobi</text>
                <text x="370" y="310" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#8a6a40" opacity="0.35" fontStyle="italic">Karakum</text>
                <text x="560" y="450" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#5a5a68" opacity="0.35" fontStyle="italic">Himalaja</text>
                <text x="150" y="420" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#8a6a40" opacity="0.3" fontStyle="italic">Arabia</text>
                <text x="500" y="70" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#3a5a34" opacity="0.3" fontStyle="italic">Siperia</text>
              </svg>
            </div>
          </div>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg print:hidden">
            <p className="font-medium mb-1">🗺️ AI-generoitu kartta maastokerrostuksella</p>
            <p>Kartta kattaa Euraasian vuonna 1206. Maastotyypit on esitetty kuvioituna kerroksena kuvan päällä.</p>
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
