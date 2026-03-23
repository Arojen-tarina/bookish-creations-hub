import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, ZoomIn, ZoomOut, X, MapPin, Shield, Swords, Coins, Mountain, TreePine, Waves, Sun, Building2, Wheat, Image, Grid3X3 } from 'lucide-react';
import { BoardMapSVG } from './BoardMapSVG';
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

// ─── Apple-style soft terrain palette ────────────────────────────────
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

// Refined, muted terrain colors — Apple-style soft palette
const terrainColors: Record<string, { fill: string; stroke: string }> = {
  steppe:   { fill: '#C8CFA0', stroke: '#A8B580' },
  desert:   { fill: '#E8D5B8', stroke: '#CEBB9E' },
  mountain: { fill: '#B0B5BD', stroke: '#8E939B' },
  forest:   { fill: '#7BA676', stroke: '#5E8A59' },
  river:    { fill: '#A8C9A0', stroke: '#88B280' },
  city:     { fill: '#BDD4A8', stroke: '#9ABF8A' },
  tundra:   { fill: '#D8E2EA', stroke: '#B8C8D4' },
  sea:      { fill: '#8AACCC', stroke: '#6890B4' },
};

// Refined faction colors — softer, more harmonious
const regionColors: Record<string, string> = {
  'Mongolia':    '#D4A24C',  // warm gold
  'Jin':         '#C55A5A',  // soft red
  'Xi Xia':      '#6A9ECF',  // calm blue
  'Khwarezmia':  '#9A7DC7',  // muted purple
  'Kara-Khitai': '#5AADA0',  // sage teal
  'Kipchak':     '#D48AAA',  // dusty rose
  'Venäjä':      '#8896A8',  // slate
  'Persia':      '#5AA0A0',  // muted teal
  'Intia':       '#D08A6A',  // terracotta
  'Song':        '#6AB88A',  // sage green
  'Kaukasia':    '#A86090',  // mauve
};

// ─── Historically accurate regions (c. 1206) ──
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

// ─── Geographically accurate hex grid ────────────────────────────────
const generateHexGrid = (): HexTile[] => {
  const tiles: HexTile[] = [];

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

  const caucasus: Partial<HexTile>[] = [
    { q: 3, r: 4, terrain: 'mountain' },
    { q: 4, r: 4, terrain: 'city', name: 'Tbilisi', isCity: true, isCapital: true },
    { q: 2, r: 4, terrain: 'mountain' },
    { q: 3, r: 5, terrain: 'mountain' },
  ];
  caucasus.forEach((h, i) => tiles.push({ id: `cau-${i}`, region: 'Kaukasia', ...h } as HexTile));

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

  const seas: Partial<HexTile>[] = [
    { q: 2, r: 5, terrain: 'sea', name: 'Mustameri' },
    { q: 1, r: 5, terrain: 'sea' },
    { q: 2, r: 6, terrain: 'sea', name: 'Välimeri' },
    { q: 1, r: 6, terrain: 'sea' },
    { q: 0, r: 5, terrain: 'sea' },
    { q: 0, r: 6, terrain: 'sea' },
    { q: 5, r: 3, terrain: 'sea', name: 'Kaspianmeri' },
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
    { q: 6, r: 9, terrain: 'sea', name: 'Arabiameri' },
    { q: 7, r: 10, terrain: 'sea' },
    { q: 8, r: 10, terrain: 'sea' },
    { q: 5, r: 9, terrain: 'sea' },
    { q: 4, r: 8, terrain: 'sea' },
    { q: 5, r: 8, terrain: 'sea' },
  ];
  seas.forEach((h, i) => tiles.push({ id: `sea-${i}`, region: 'Persia', ...h } as HexTile));

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
    { q: 6, r: 1, terrain: 'forest' },
    { q: 7, r: 1, terrain: 'forest' },
  ];
  mongolia.forEach((h, i) => tiles.push({ id: `mng-${i}`, region: 'Mongolia', ...h } as HexTile));

  const xiXia: Partial<HexTile>[] = [
    { q: 12, r: 4, terrain: 'city', name: 'Zhongxing', isCity: true, isCapital: true },
    { q: 11, r: 4, terrain: 'desert' },
    { q: 13, r: 3, terrain: 'desert' },
    { q: 13, r: 4, terrain: 'mountain' },
    { q: 12, r: 5, terrain: 'desert', name: 'Gobi' },
    { q: 13, r: 5, terrain: 'desert' },
  ];
  xiXia.forEach((h, i) => tiles.push({ id: `xix-${i}`, region: 'Xi Xia', ...h } as HexTile));

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

  const fillers: Partial<HexTile>[] = [
    { q: 1, r: 7, terrain: 'desert' },
    { q: 2, r: 7, terrain: 'desert' },
    { q: 2, r: 8, terrain: 'desert' },
    { q: 3, r: 8, terrain: 'sea' },
    { q: 0, r: 7, terrain: 'sea' },
    { q: 0, r: 8, terrain: 'sea' },
    { q: 1, r: 8, terrain: 'sea' },
    { q: 8, r: 6, terrain: 'mountain' },
    { q: 9, r: 5, terrain: 'desert' },
    { q: 18, r: 1, terrain: 'forest' },
    { q: 18, r: 2, terrain: 'forest' },
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

// Silk Road trade route
const silkRoadPath = [
  { q: 3, r: 5 },
  { q: 5, r: 4 },
  { q: 6, r: 4 },
  { q: 7, r: 4 },
  { q: 8, r: 4 },
  { q: 9, r: 3 },
  { q: 11, r: 4 },
  { q: 12, r: 4 },
  { q: 14, r: 4 },
  { q: 15, r: 4 },
];

// ─── Apple-style hex tile ────────────────────────────────────────────
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

  const isActive = isSelected || isHovered;
  const strokeColor = isSelected ? '#FFFFFF' : isHovered ? regionColor : `${regionColor}88`;
  const strokeWidth = isSelected ? 3 : isHovered ? 2.5 : (tile.isCapital ? 2 : 1);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Soft shadow */}
      {isActive && (
        <path d={hexPath(size + 2)} fill="none" stroke={regionColor} strokeWidth={1} opacity={0.3} filter="url(#soft-glow)" />
      )}
      {/* Main hex */}
      <path
        d={hexPath(size)}
        fill={colors.fill}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="transition-all duration-300"
        style={{ filter: isActive ? 'brightness(1.08)' : undefined }}
      />
      {/* Terrain icon — subtle */}
      <path d={terrainIcons[tile.terrain]} fill="none" stroke={colors.stroke} strokeWidth={1.2} opacity={0.35} />

      {/* City marker — elegant circles */}
      {tile.isCity && (
        <>
          <circle cx={0} cy={0} r={tile.isCapital ? 9 : 5} fill={tile.isCapital ? '#D4A24C' : '#FFFFFF'} stroke={tile.isCapital ? '#B8882A' : '#999'} strokeWidth={1.2} opacity={0.9} />
          {tile.isCapital && <text x={0} y={3.5} textAnchor="middle" fontSize={9} fontWeight="600" fill="#5A3A10">★</text>}
        </>
      )}

      {/* Name label — clean, modern */}
      {tile.name && (
        <g className="pointer-events-none">
          <rect
            x={-tile.name.length * 2.8}
            y={size + 3}
            width={tile.name.length * 5.6}
            height={11}
            rx={3}
            fill="white"
            opacity={0.85}
          />
          <text x={0} y={size + 11} textAnchor="middle" fontSize={7.5} fontWeight="500" fill="#3A3A3C" letterSpacing="0.02em" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            {tile.name}
          </text>
        </g>
      )}
    </g>
  );
};

// ─── Info panel — frosted glass style ────────────────────────────────
const InfoPanel = ({ tile, onClose }: { tile: HexTile | null; onClose: () => void }) => {
  if (!tile) return null;
  const terrain = terrainInfo[tile.terrain];
  const region = regionInfo[tile.region];
  const TerrainIcon = terrain.icon;

  return (
    <div className="absolute top-4 right-4 w-80 z-50 print:hidden rounded-2xl overflow-hidden" style={{
      background: 'rgba(255, 255, 255, 0.88)',
      backdropFilter: 'blur(24px) saturate(1.5)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06)',
    }}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${regionColors[tile.region]}18` }}>
              <MapPin className="w-4 h-4" style={{ color: regionColors[tile.region] }} />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', color: '#1D1D1F' }}>
                {tile.name || `Heksi ${tile.q},${tile.r}`}
              </h3>
              <div className="flex gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${regionColors[tile.region]}15`, color: regionColors[tile.region] }}>
                  {tile.region}
                </span>
                {tile.isCapital && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#D4A24C18', color: '#B8882A' }}>★ Pääkaupunki</span>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors">
            <X className="w-3.5 h-3.5" style={{ color: '#86868B' }} />
          </button>
        </div>

        {/* Terrain info */}
        <div className="p-3.5 rounded-xl mb-3" style={{ backgroundColor: `${terrainColors[tile.terrain].fill}30` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: terrainColors[tile.terrain].stroke }}>
              <TerrainIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold" style={{ color: '#1D1D1F', fontFamily: '-apple-system, system-ui, sans-serif' }}>{terrain.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-xs" style={{ color: '#6E6E73' }}>
            <span>Liikkuminen</span><span className="font-medium" style={{ color: '#1D1D1F' }}>{terrain.movement}</span>
            <span>Taistelu</span><span className="font-medium" style={{ color: '#1D1D1F' }}>{terrain.combat}</span>
            <span>Resurssit</span><span className="font-medium" style={{ color: '#1D1D1F' }}>{terrain.resources}</span>
          </div>
          <p className="mt-2 text-[11px] italic" style={{ color: '#86868B' }}>{terrain.special}</p>
        </div>

        {/* Region info */}
        <div className="pt-3" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3.5 h-3.5 rounded-sm" style={{ backgroundColor: regionColors[tile.region] }} />
            <span className="text-sm font-semibold" style={{ color: '#1D1D1F', fontFamily: '-apple-system, system-ui, sans-serif' }}>{region.name}</span>
          </div>
          <p className="text-xs mb-2" style={{ color: '#6E6E73' }}>{region.description}</p>
          <div className="text-xs space-y-1" style={{ color: '#6E6E73' }}>
            <div className="flex justify-between"><span>Faktio</span><span className="font-medium" style={{ color: '#1D1D1F' }}>{region.faction}</span></div>
            {region.capital !== '-' && <div className="flex justify-between"><span>Pääkaupunki</span><span className="font-medium" style={{ color: '#1D1D1F' }}>{region.capital}</span></div>}
          </div>
          <div className="mt-2.5">
            <p className="text-[10px] uppercase tracking-wider font-medium mb-1.5" style={{ color: '#86868B' }}>Aluebonukset</p>
            <div className="flex flex-wrap gap-1">
              {region.bonuses.map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#34C75918', color: '#248A3D' }}>{b}</span>
              ))}
            </div>
          </div>
          <div className="mt-3 p-2.5 rounded-lg text-[11px] italic" style={{ backgroundColor: '#F5F5F7', color: '#6E6E73' }}>
            📜 {region.historicalNote}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────
export const PrintableGameBoard = () => {
  const [zoom, setZoom] = useState(1);
  const [selectedTile, setSelectedTile] = useState<HexTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<HexTile | null>(null);
  const [boardType, setBoardType] = useState<'image' | 'svg' | 'circular'>('circular');
  const tiles = generateHexGrid();

  const BOARD_WIDTH = 920;
  const BOARD_HEIGHT = 620;

  const handlePrint = () => { setSelectedTile(null); setTimeout(() => window.print(), 100); };

  const silkRoadSvgPath = silkRoadPath.map((p, i) => {
    const { x, y } = hexToPixel(p.q, p.r);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className="space-y-6">
      {/* Tab switcher — pill style */}
      <Tabs value={boardType} onValueChange={(v) => setBoardType(v as 'image' | 'svg' | 'circular')} className="print:hidden">
        <div className="flex justify-center">
          <TabsList className="h-10 p-1 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
            <TabsTrigger value="circular" className="gap-2 rounded-full px-5 text-sm data-[state=active]:shadow-sm" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
              <MapPin className="w-4 h-4" />Pelilauta
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2 rounded-full px-5 text-sm data-[state=active]:shadow-sm" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
              <Image className="w-4 h-4" />AI-generoitu kartta
            </TabsTrigger>
            <TabsTrigger value="svg" className="gap-2 rounded-full px-5 text-sm data-[state=active]:shadow-sm" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
              <Grid3X3 className="w-4 h-4" />Interaktiivinen heksilauta
            </TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Controls — minimal */}
      <div className="flex flex-wrap gap-3 items-center justify-center print:hidden">
        <Button onClick={handlePrint} variant="outline" className="gap-2 rounded-full px-5 h-9 text-sm border-border/50 hover:bg-muted/50" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
          <Printer className="w-4 h-4" />Tulosta
        </Button>
        <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}><ZoomOut className="w-3.5 h-3.5" /></Button>
          <span className="text-xs w-12 text-center font-medium tabular-nums" style={{ color: '#6E6E73' }}>{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setZoom(z => Math.min(2, z + 0.1))}><ZoomIn className="w-3.5 h-3.5" /></Button>
        </div>
        {boardType === 'svg' && (
          <span className="text-xs" style={{ color: '#86868B', fontFamily: '-apple-system, system-ui, sans-serif' }}>
            Klikkaa heksaa nähdäksesi tiedot
          </span>
        )}
      </div>

      {/* ═══════ AI Image Board ═══════ */}
      {boardType === 'image' && (
        <div className="space-y-4">
          <div className="relative overflow-auto rounded-2xl" style={{
            maxHeight: '80vh',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
          }}>
            {/* Subtle frame */}
            <div className="absolute inset-0 pointer-events-none z-10 rounded-2xl" style={{
              boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.08)',
            }} />

            <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: zoom > 1 ? `${100 * zoom}%` : '100%' }}>
              <img src={gameBoardImage} alt="Mongolien Valtakunta - 1206 AD pelilauta" className="w-full h-auto block" />

              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none" style={{ mixBlendMode: 'multiply' }}>
                <defs>
                  {/* Refined, subtle terrain patterns */}
                  <pattern id="img-steppe" patternUnits="userSpaceOnUse" width="30" height="20">
                    <rect width="30" height="20" fill="#C8CFA0" />
                    <path d="M0 12 Q4 8 8 12 Q12 16 16 12 Q20 8 24 12 Q28 16 30 12" stroke="#A8B580" strokeWidth="0.6" fill="none" opacity="0.4" />
                    <path d="M5 6 Q9 3 13 6 Q17 9 21 6" stroke="#B0BB88" strokeWidth="0.4" fill="none" opacity="0.3" />
                  </pattern>
                  <pattern id="img-desert" patternUnits="userSpaceOnUse" width="40" height="25">
                    <rect width="40" height="25" fill="#E8D5B8" />
                    <path d="M0 15 Q10 8 20 15 Q30 22 40 15" stroke="#D4C0A0" strokeWidth="0.7" fill="none" opacity="0.3" />
                    <path d="M5 20 Q15 14 25 20" stroke="#D4C0A0" strokeWidth="0.4" fill="none" opacity="0.2" />
                  </pattern>
                  <pattern id="img-forest" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#7BA676" />
                    <circle cx="5" cy="5" r="2.5" fill="#5E8A59" opacity="0.3" />
                    <circle cx="15" cy="12" r="2" fill="#5E8A59" opacity="0.25" />
                  </pattern>
                  <pattern id="img-taiga" patternUnits="userSpaceOnUse" width="24" height="20">
                    <rect width="24" height="20" fill="#6A9A64" />
                    <path d="M8 18 L8 10 L5 10 L8 4 L11 10 L8 10" fill="#5A8A54" opacity="0.3" />
                    <path d="M18 18 L18 12 L16 12 L18 7 L20 12 L18 12" fill="#5A8A54" opacity="0.25" />
                  </pattern>
                  <pattern id="img-mountain" patternUnits="userSpaceOnUse" width="30" height="24">
                    <rect width="30" height="24" fill="#B0B5BD" />
                    <path d="M0 24 L8 6 L16 24 Z" fill="#9AA0A8" opacity="0.3" />
                    <path d="M14 24 L22 4 L30 24 Z" fill="#8E939B" opacity="0.25" />
                    <path d="M6 10 L8 6 L10 10" fill="#E8ECF0" opacity="0.4" />
                    <path d="M20 8 L22 4 L24 8" fill="#E8ECF0" opacity="0.45" />
                  </pattern>
                  <pattern id="img-tundra" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#D8E2EA" />
                    <circle cx="5" cy="5" r="2.5" fill="#E4EDF4" opacity="0.4" />
                    <circle cx="15" cy="12" r="2" fill="#E4EDF4" opacity="0.3" />
                  </pattern>
                  <pattern id="img-farmland" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#A8C9A0" />
                    <rect x="0" y="0" width="9" height="9" fill="#B0D4A8" opacity="0.3" />
                    <rect x="10" y="10" width="10" height="10" fill="#90B488" opacity="0.25" />
                  </pattern>
                  <pattern id="img-water" patternUnits="userSpaceOnUse" width="24" height="16">
                    <rect width="24" height="16" fill="#8AACCC" />
                    <path d="M0 8 Q6 4 12 8 Q18 12 24 8" stroke="#A0C0D8" strokeWidth="0.6" fill="none" opacity="0.35" />
                    <path d="M0 13 Q6 10 12 13 Q18 16 24 13" stroke="#A0C0D8" strokeWidth="0.4" fill="none" opacity="0.2" />
                  </pattern>
                  <filter id="silk-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Soft warm wash */}
                <rect width="1000" height="700" fill="#EDE8DF" opacity="0.2" />

                {/* Tundra */}
                <path d="M 0 0 L 1000 0 L 1000 90 Q 800 70 600 80 Q 400 70 200 75 Q 100 65 0 70 Z" fill="url(#img-tundra)" opacity="0.4" />
                
                {/* Russian forests */}
                <path d="M 0 70 Q 30 60 80 75 Q 140 100 180 140 Q 210 200 200 260 Q 180 310 120 320 Q 60 310 20 290 Q 0 260 0 200 Z" fill="url(#img-forest)" opacity="0.3" />

                {/* Siberian taiga */}
                <path d="M 120 55 Q 300 40 500 55 Q 650 50 780 80 Q 800 110 750 140 Q 650 150 500 130 Q 350 115 220 100 Q 140 90 120 75 Z" fill="url(#img-taiga)" opacity="0.35" />

                {/* East Siberia */}
                <path d="M 750 60 Q 830 50 900 70 Q 930 100 920 140 Q 880 160 830 150 Q 770 130 750 100 Z" fill="url(#img-taiga)" opacity="0.3" />

                {/* Kipchak steppe */}
                <path d="M 100 200 Q 180 175 300 190 Q 400 210 430 250 Q 420 300 340 310 Q 220 300 130 270 Q 90 240 100 200 Z" fill="url(#img-steppe)" opacity="0.3" />

                {/* Mongolian steppe */}
                <path d="M 520 90 Q 650 70 800 110 Q 850 160 840 230 Q 800 270 700 260 Q 590 240 530 190 Q 510 140 520 90 Z" fill="url(#img-steppe)" opacity="0.35" />

                {/* Kara-Khitai */}
                <path d="M 400 150 Q 520 130 590 170 Q 600 220 550 250 Q 460 260 400 230 Q 380 190 400 150 Z" fill="url(#img-steppe)" opacity="0.3" />

                {/* Gobi */}
                <path d="M 600 210 Q 740 190 810 250 Q 830 310 800 360 Q 710 380 620 340 Q 570 290 600 210 Z" fill="url(#img-desert)" opacity="0.4" />

                {/* Taklamakan */}
                <path d="M 440 250 Q 530 230 590 270 Q 600 320 560 350 Q 480 360 430 330 Q 410 290 440 250 Z" fill="url(#img-desert)" opacity="0.35" />

                {/* Central Asia desert */}
                <path d="M 240 250 Q 370 220 450 270 Q 480 330 450 380 Q 360 410 270 380 Q 220 330 240 250 Z" fill="url(#img-desert)" opacity="0.3" />

                {/* Persia */}
                <path d="M 80 330 Q 200 290 300 350 Q 330 420 300 490 Q 200 530 100 490 Q 50 430 80 330 Z" fill="url(#img-desert)" opacity="0.3" />

                {/* Arabia */}
                <path d="M 0 400 Q 60 370 130 400 Q 160 450 140 510 Q 80 540 30 520 Q 0 480 0 430 Z" fill="url(#img-desert)" opacity="0.35" />

                {/* Khwarezm farmland */}
                <path d="M 310 240 Q 400 220 440 265 Q 445 310 400 340 Q 330 345 300 310 Q 290 275 310 240 Z" fill="url(#img-farmland)" opacity="0.22" />

                {/* Mesopotamia */}
                <path d="M 160 330 Q 210 310 240 340 Q 240 380 210 400 Q 170 400 155 370 Z" fill="url(#img-farmland)" opacity="0.22" />

                {/* Tibet */}
                <path d="M 380 360 Q 560 330 720 380 Q 760 440 730 510 Q 600 550 450 520 Q 370 470 380 360 Z" fill="url(#img-mountain)" opacity="0.4" />

                {/* Altai */}
                <path d="M 490 110 Q 550 90 590 130 Q 600 180 570 200 Q 510 200 490 170 Q 480 140 490 110 Z" fill="url(#img-mountain)" opacity="0.35" />

                {/* Caucasus */}
                <path d="M 170 270 Q 240 260 290 290 Q 290 330 250 350 Q 190 350 170 320 Q 160 295 170 270 Z" fill="url(#img-mountain)" opacity="0.3" />

                {/* Tien Shan */}
                <path d="M 420 220 Q 480 200 520 230 Q 520 270 490 285 Q 440 285 420 260 Z" fill="url(#img-mountain)" opacity="0.3" />

                {/* Ural */}
                <path d="M 260 50 Q 270 40 280 50 Q 290 100 285 160 Q 280 200 270 230 Q 260 220 255 170 Q 250 100 260 50 Z" fill="url(#img-mountain)" opacity="0.28" />

                {/* Jin farmland */}
                <path d="M 790 180 Q 890 160 930 220 Q 945 310 920 380 Q 850 400 790 360 Q 760 290 780 220 Z" fill="url(#img-farmland)" opacity="0.25" />

                {/* Song forests */}
                <path d="M 800 380 Q 880 350 940 410 Q 970 500 950 590 Q 880 630 810 590 Q 770 510 790 430 Z" fill="url(#img-forest)" opacity="0.22" />
                <path d="M 830 410 Q 890 390 920 440 Q 930 500 910 550 Q 860 560 840 520 Q 820 470 830 410 Z" fill="url(#img-farmland)" opacity="0.18" />

                {/* India */}
                <path d="M 350 460 Q 500 430 600 500 Q 630 580 600 660 Q 500 700 380 670 Q 320 590 350 460 Z" fill="url(#img-farmland)" opacity="0.22" />
                <path d="M 420 530 Q 520 510 570 560 Q 580 620 540 660 Q 460 670 420 630 Q 400 580 420 530 Z" fill="url(#img-forest)" opacity="0.28" />

                {/* Hindukush */}
                <path d="M 360 380 Q 440 360 500 400 Q 500 450 460 480 Q 380 480 350 440 Q 340 410 360 380 Z" fill="url(#img-mountain)" opacity="0.32" />

                {/* Korean forests */}
                <path d="M 900 180 Q 930 170 945 200 Q 950 250 935 280 Q 910 285 900 260 Q 890 220 900 180 Z" fill="url(#img-forest)" opacity="0.22" />

                {/* Manchuria */}
                <path d="M 830 120 Q 890 100 920 140 Q 930 180 910 210 Q 870 220 840 200 Q 820 170 830 120 Z" fill="url(#img-forest)" opacity="0.25" />

                {/* === WATER — soft blue === */}
                <path d="M 940 0 L 1000 0 L 1000 700 L 920 700 Q 945 500 955 300 Q 950 150 940 0 Z" fill="url(#img-water)" opacity="0.4" />
                <path d="M 0 580 Q 200 560 400 630 Q 350 700 100 700 L 0 700 Z" fill="url(#img-water)" opacity="0.3" />
                <path d="M 130 260 Q 160 250 180 265 Q 185 285 170 295 Q 145 295 130 280 Z" fill="url(#img-water)" opacity="0.45" />
                <path d="M 210 280 Q 235 270 250 295 Q 255 340 240 370 Q 215 375 200 350 Q 195 310 210 280 Z" fill="url(#img-water)" opacity="0.45" />
                <path d="M 310 225 Q 330 218 340 235 Q 342 260 325 268 Q 308 262 305 245 Z" fill="url(#img-water)" opacity="0.45" />
                <path d="M 688 75 Q 702 65 712 78 Q 718 100 708 115 Q 695 110 688 98 Z" fill="url(#img-water)" opacity="0.5" />
                <path d="M 180 430 Q 210 420 230 440 Q 230 470 210 480 Q 185 475 178 455 Z" fill="url(#img-water)" opacity="0.4" />
                <path d="M 280 600 Q 400 580 500 620 Q 500 700 350 700 Q 250 700 250 650 Z" fill="url(#img-water)" opacity="0.25" />

                {/* === SILK ROAD — elegant golden line === */}
                <path
                  d="M 900 290 Q 870 280 840 300 Q 800 310 760 300 Q 720 280 680 270 Q 640 260 600 270 Q 560 280 520 260 Q 480 240 440 250 Q 400 260 370 270 Q 340 275 310 265 Q 280 255 250 270 Q 230 280 210 310 Q 190 330 170 350 Q 150 365 130 370"
                  fill="none" stroke="#C8A850" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.5" filter="url(#silk-glow)" strokeLinecap="round"
                />
                <path
                  d="M 600 270 Q 570 240 540 220 Q 510 200 480 190 Q 450 180 420 185 Q 390 190 360 210 Q 340 225 320 235"
                  fill="none" stroke="#C8A850" strokeWidth="1.8" strokeDasharray="6,4" opacity="0.35" filter="url(#silk-glow)" strokeLinecap="round"
                />
                <path
                  d="M 370 270 Q 380 310 400 350 Q 410 380 420 410"
                  fill="none" stroke="#C8A850" strokeWidth="1.8" strokeDasharray="6,4" opacity="0.3" filter="url(#silk-glow)" strokeLinecap="round"
                />

                {/* === RIVERS — soft, thin lines === */}
                <path d="M 760 250 Q 800 230 830 260 Q 850 290 870 280 Q 890 270 900 290" fill="none" stroke="#7AA4C8" strokeWidth="1.4" opacity="0.3" strokeLinecap="round" />
                <path d="M 720 360 Q 780 340 820 370 Q 860 390 900 380 Q 930 400 950 420" fill="none" stroke="#7AA4C8" strokeWidth="1.6" opacity="0.28" strokeLinecap="round" />
                <path d="M 320 240 Q 340 260 360 250 Q 380 240 400 260 Q 420 280 430 270" fill="none" stroke="#7AA4C8" strokeWidth="1.2" opacity="0.28" strokeLinecap="round" />
                <path d="M 330 220 Q 370 210 410 220 Q 450 230 470 240" fill="none" stroke="#7AA4C8" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
                <path d="M 160 150 Q 180 200 200 240 Q 210 270 220 290" fill="none" stroke="#7AA4C8" strokeWidth="1.2" opacity="0.28" strokeLinecap="round" />
                <path d="M 100 160 Q 110 200 120 240 Q 125 260 130 270" fill="none" stroke="#7AA4C8" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
                <path d="M 150 180 Q 155 210 150 240 Q 145 260 140 270" fill="none" stroke="#7AA4C8" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
                <path d="M 680 130 Q 700 140 720 135 Q 740 130 760 140" fill="none" stroke="#7AA4C8" strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />
                <path d="M 700 150 Q 730 155 760 150 Q 790 145 810 155" fill="none" stroke="#7AA4C8" strokeWidth="0.7" opacity="0.2" strokeLinecap="round" />
                <path d="M 430 400 Q 420 440 410 470 Q 400 500 390 540 Q 385 570 380 600" fill="none" stroke="#7AA4C8" strokeWidth="1.2" opacity="0.25" strokeLinecap="round" />
                <path d="M 480 440 Q 500 460 520 470 Q 550 480 580 490 Q 600 495 620 500" fill="none" stroke="#7AA4C8" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
                <path d="M 200 310 Q 190 340 180 370 Q 175 400 170 430 Q 168 450 170 465" fill="none" stroke="#7AA4C8" strokeWidth="1" opacity="0.25" strokeLinecap="round" />
                <path d="M 215 315 Q 205 345 200 375 Q 195 410 192 440 Q 190 460 192 475" fill="none" stroke="#7AA4C8" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
                <path d="M 460 30 Q 470 60 475 100 Q 480 140 478 180" fill="none" stroke="#7AA4C8" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
                <path d="M 430 50 Q 445 80 455 120 Q 465 160 470 190" fill="none" stroke="#7AA4C8" strokeWidth="0.8" opacity="0.18" strokeLinecap="round" />
                <path d="M 560 25 Q 570 55 575 95 Q 580 130 578 170" fill="none" stroke="#7AA4C8" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
                <path d="M 680 20 Q 690 50 695 90 Q 698 120 695 150" fill="none" stroke="#7AA4C8" strokeWidth="0.8" opacity="0.18" strokeLinecap="round" />
                <path d="M 480 270 Q 510 285 540 290 Q 570 292 590 285" fill="none" stroke="#7AA4C8" strokeWidth="0.7" opacity="0.18" strokeLinecap="round" />

                {/* === MOUNTAIN PEAKS — minimal, elegant === */}
                {[
                  [520, 410], [550, 420], [580, 415], [610, 425], [640, 418],
                  [500, 430], [530, 440], [560, 435], [590, 445], [620, 440],
                  [480, 420], [660, 430], [540, 450],
                ].map(([cx, cy], i) => (
                  <g key={`peak-h-${i}`} opacity="0.28">
                    <path d={`M ${cx-5} ${cy+3} L ${cx} ${cy-5} L ${cx+5} ${cy+3} Z`} fill="#9AA0A8" />
                    <path d={`M ${cx-1.5} ${cy-2.5} L ${cx} ${cy-5} L ${cx+1.5} ${cy-2.5}`} fill="#E8ECF4" />
                  </g>
                ))}
                {[
                  [520, 135], [540, 145], [555, 155], [530, 160], [510, 150],
                ].map(([cx, cy], i) => (
                  <g key={`peak-a-${i}`} opacity="0.25">
                    <path d={`M ${cx-4} ${cy+3} L ${cx} ${cy-4} L ${cx+4} ${cy+3} Z`} fill="#9AA0A8" />
                    <path d={`M ${cx-1} ${cy-2} L ${cx} ${cy-4} L ${cx+1} ${cy-2}`} fill="#E8ECF4" />
                  </g>
                ))}
                {[
                  [200, 285], [220, 295], [240, 305], [230, 290], [260, 315],
                ].map(([cx, cy], i) => (
                  <g key={`peak-c-${i}`} opacity="0.22">
                    <path d={`M ${cx-3} ${cy+2} L ${cx} ${cy-3} L ${cx+3} ${cy+2} Z`} fill="#9AA0A8" />
                    <path d={`M ${cx-0.8} ${cy-1.5} L ${cx} ${cy-3} L ${cx+0.8} ${cy-1.5}`} fill="#E8ECF4" />
                  </g>
                ))}
                {[
                  [440, 240], [460, 250], [480, 255], [500, 248], [470, 265],
                ].map(([cx, cy], i) => (
                  <g key={`peak-t-${i}`} opacity="0.22">
                    <path d={`M ${cx-3} ${cy+2} L ${cx} ${cy-4} L ${cx+3} ${cy+2} Z`} fill="#9AA0A8" />
                    <path d={`M ${cx-0.8} ${cy-2} L ${cx} ${cy-4} L ${cx+0.8} ${cy-2}`} fill="#E8ECF4" />
                  </g>
                ))}
                {[
                  [390, 390], [410, 400], [430, 395], [400, 410],
                ].map(([cx, cy], i) => (
                  <g key={`peak-hk-${i}`} opacity="0.2">
                    <path d={`M ${cx-3} ${cy+2} L ${cx} ${cy-4} L ${cx+3} ${cy+2} Z`} fill="#9AA0A8" />
                    <path d={`M ${cx-0.8} ${cy-2} L ${cx} ${cy-4} L ${cx+0.8} ${cy-2}`} fill="#E8ECF4" />
                  </g>
                ))}
                {[
                  [268, 80], [270, 110], [272, 140], [271, 170],
                ].map(([cx, cy], i) => (
                  <g key={`peak-u-${i}`} opacity="0.15">
                    <path d={`M ${cx-2.5} ${cy+2} L ${cx} ${cy-2.5} L ${cx+2.5} ${cy+2} Z`} fill="#A0A5AD" />
                    <path d={`M ${cx-0.6} ${cy-1} L ${cx} ${cy-2.5} L ${cx+0.6} ${cy-1}`} fill="#E8ECF4" />
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Interactive Hex Board ═══════ */}
      {boardType === 'svg' && (
        <>
          {/* Region legend — pill badges */}
          <div className="flex flex-wrap gap-2 justify-center p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <span className="text-xs font-semibold mr-2" style={{ color: '#86868B', fontFamily: '-apple-system, system-ui, sans-serif' }}>Valtakunnat:</span>
            {Object.entries(regionColors).map(([region, color]) => (
              <div key={region} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}12`, border: `1px solid ${color}30` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium" style={{ color: '#3A3A3C', fontFamily: '-apple-system, system-ui, sans-serif' }}>{region}</span>
              </div>
            ))}
          </div>

          {/* Terrain legend */}
          <div className="flex flex-wrap gap-2 justify-center p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
            <span className="text-xs font-semibold mr-2" style={{ color: '#86868B', fontFamily: '-apple-system, system-ui, sans-serif' }}>Maastot:</span>
            {Object.entries(terrainColors).map(([terrain, colors]) => (
              <div key={terrain} className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.fill}20` }}>
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }} />
                <span className="text-[10px] font-medium" style={{ color: '#6E6E73', fontFamily: '-apple-system, system-ui, sans-serif' }}>{terrainInfo[terrain]?.name || terrain}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#C8A85010' }}>
              <div className="w-5 h-0" style={{ borderTop: '2px dashed #C8A850' }} />
              <span className="text-[10px] font-medium" style={{ color: '#6E6E73' }}>Silkkitie</span>
            </div>
          </div>

          <div className="relative">
            <InfoPanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
            <div className="overflow-auto rounded-2xl" style={{
              maxHeight: '80vh',
              backgroundColor: '#F0EBE2',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
            }}>
              <svg viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} style={{ width: zoom === 1 ? '100%' : `${BOARD_WIDTH * zoom}px`, minWidth: `${BOARD_WIDTH}px`, height: 'auto' }}>
                <defs>
                  <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  {/* Subtle background patterns */}
                  <pattern id="bg-steppe" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#DDD8C8" />
                    <circle cx="5" cy="5" r="1" fill="#C8C4B0" opacity="0.3" />
                    <circle cx="15" cy="15" r="1" fill="#C8C4B0" opacity="0.3" />
                  </pattern>
                  <pattern id="bg-desert" patternUnits="userSpaceOnUse" width="15" height="15">
                    <rect width="15" height="15" fill="#E8E0D0" />
                    <path d="M0 7 Q7 4 15 7" stroke="#D4CCBC" strokeWidth="0.4" fill="none" opacity="0.3" />
                  </pattern>
                  <pattern id="bg-mountain" patternUnits="userSpaceOnUse" width="24" height="20">
                    <rect width="24" height="20" fill="#D0CCC4" />
                    <path d="M0 20 L8 8 L16 20 Z" fill="#C0BCB4" opacity="0.25" />
                    <path d="M8 20 L16 5 L24 20 Z" fill="#B8B4AC" opacity="0.2" />
                  </pattern>
                  <pattern id="bg-forest" patternUnits="userSpaceOnUse" width="12" height="12">
                    <rect width="12" height="12" fill="#C4CCBC" />
                    <circle cx="4" cy="4" r="2" fill="#B0B8A8" opacity="0.3" />
                    <circle cx="10" cy="8" r="1.5" fill="#B0B8A8" opacity="0.3" />
                  </pattern>
                  <pattern id="bg-tundra" patternUnits="userSpaceOnUse" width="16" height="16">
                    <rect width="16" height="16" fill="#E0E4E8" />
                    <circle cx="4" cy="4" r="2" fill="#EAF0F4" opacity="0.4" />
                    <circle cx="12" cy="12" r="1.5" fill="#D4DCE4" opacity="0.3" />
                  </pattern>
                  <pattern id="bg-water" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#B0C8DC" />
                    <path d="M0 10 Q5 7 10 10 Q15 13 20 10" stroke="#C0D4E4" strokeWidth="0.5" fill="none" opacity="0.3" />
                  </pattern>
                </defs>

                {/* Clean background */}
                <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#EDE8DF" />
                {/* Tundra top */}
                <path d={`M 0 0 L ${BOARD_WIDTH} 0 L ${BOARD_WIDTH} 100 Q ${BOARD_WIDTH*0.7} 80 ${BOARD_WIDTH*0.4} 90 Q ${BOARD_WIDTH*0.2} 85 0 95 Z`} fill="url(#bg-tundra)" opacity="0.5" />
                {/* Steppe */}
                <path d={`M 60 100 Q ${BOARD_WIDTH*0.4} 80 ${BOARD_WIDTH*0.7} 110 Q ${BOARD_WIDTH*0.8} 160 ${BOARD_WIDTH*0.7} 200 Q ${BOARD_WIDTH*0.4} 220 100 200 Q 40 180 60 100 Z`} fill="url(#bg-steppe)" opacity="0.3" />
                {/* Forest west */}
                <path d="M 0 95 Q 60 85 120 110 Q 160 140 150 200 Q 120 250 70 260 Q 30 250 0 230 Z" fill="url(#bg-forest)" opacity="0.35" />
                {/* Desert */}
                <path d={`M 200 230 Q 350 200 480 240 Q 520 300 480 350 Q 370 380 260 350 Q 190 310 200 230 Z`} fill="url(#bg-desert)" opacity="0.3" />
                {/* Gobi */}
                <path d={`M 520 170 Q 620 150 700 190 Q 730 240 710 290 Q 640 320 560 290 Q 500 250 520 170 Z`} fill="url(#bg-desert)" opacity="0.25" />
                {/* Tibet */}
                <path d={`M 340 310 Q 480 280 650 320 Q 720 370 690 430 Q 580 460 440 440 Q 320 420 310 360 Z`} fill="url(#bg-mountain)" opacity="0.35" />
                {/* Persia */}
                <path d={`M 0 260 Q 100 240 200 280 Q 300 310 320 380 Q 300 460 200 500 Q 100 510 40 470 Q 0 420 0 360 Z`} fill="url(#bg-desert)" opacity="0.3" />
                {/* China */}
                <path d={`M 680 200 Q 780 180 840 240 Q 870 320 840 400 Q 780 430 710 390 Q 660 330 670 260 Z`} fill="url(#bg-forest)" opacity="0.2" />
                {/* South China */}
                <path d={`M 700 400 Q 800 380 860 440 Q ${BOARD_WIDTH} 520 ${BOARD_WIDTH} 620 L 680 620 Q 660 510 680 430 Z`} fill="url(#bg-forest)" opacity="0.18" />
                {/* India */}
                <path d={`M 300 430 Q 450 400 560 460 Q 600 540 560 620 L 260 620 Q 250 530 280 460 Z`} fill="url(#bg-steppe)" opacity="0.2" />
                {/* Seas */}
                <path d={`M ${BOARD_WIDTH-60} 0 L ${BOARD_WIDTH} 0 L ${BOARD_WIDTH} 620 L ${BOARD_WIDTH-80} 620 Q ${BOARD_WIDTH-70} 400 ${BOARD_WIDTH-60} 200 Z`} fill="url(#bg-water)" opacity="0.35" />
                <path d={`M 0 480 Q 100 470 200 490 L 250 620 L 0 620 Z`} fill="url(#bg-water)" opacity="0.25" />

                {/* Subtle border */}
                <rect x={8} y={8} width={BOARD_WIDTH - 16} height={BOARD_HEIGHT - 16} fill="none" stroke="#C8BDA8" strokeWidth={1.5} rx={8} />

                {/* Title — clean, modern */}
                <text x={BOARD_WIDTH / 2} y={32} textAnchor="middle" fontSize={16} fontWeight="600" fill="#3A3A3C" letterSpacing="0.04em" style={{ fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif' }}>
                  MONGOLIEN VALTAKUNTA — EURAASIA 1206
                </text>
                <text x={BOARD_WIDTH / 2} y={46} textAnchor="middle" fontSize={8} fill="#86868B" letterSpacing="0.06em" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
                  Historiallisesti tarkka kartta · Genghis Khanin vallan alku
                </text>

                {/* Silk Road */}
                <path d={silkRoadSvgPath} fill="none" stroke="#C8A850" strokeWidth={2.5} strokeDasharray="6,3" opacity={0.45} />

                {/* Compass — minimal circle */}
                <g transform={`translate(${BOARD_WIDTH - 42}, 62)`}>
                  <circle cx={0} cy={0} r={14} fill="white" stroke="#C8BDA8" strokeWidth={0.8} opacity={0.9} />
                  <text x={0} y={-3} textAnchor="middle" fontSize={7} fontWeight="600" fill="#3A3A3C" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>N</text>
                  <text x={0} y={12} textAnchor="middle" fontSize={5.5} fill="#86868B">S</text>
                  <text x={8} y={4} textAnchor="middle" fontSize={5.5} fill="#86868B">E</text>
                  <text x={-8} y={4} textAnchor="middle" fontSize={5.5} fill="#86868B">W</text>
                  <line x1={0} y1={-12} x2={0} y2={-5} stroke="#3A3A3C" strokeWidth={1.2} />
                </g>

                {tiles.map(tile => (
                  <HexTileComponent key={tile.id} tile={tile} size={HEX_SIZE} isSelected={selectedTile?.id === tile.id} isHovered={hoveredTile?.id === tile.id} onClick={() => setSelectedTile(tile)} onMouseEnter={() => setHoveredTile(tile)} onMouseLeave={() => setHoveredTile(null)} />
                ))}

                {/* Region labels — light, modern */}
                {[
                  { label: 'VENÄJÄ', q: 1, r: 1.5, size: 7 },
                  { label: 'KIPČAKIT', q: 4.5, r: 2.5, size: 7 },
                  { label: 'KAUKASIA', q: 3, r: 4.5, size: 6 },
                  { label: 'KHWAREZMIA', q: 7, r: 4.5, size: 6 },
                  { label: 'PERSIA', q: 4, r: 6.5, size: 7 },
                  { label: 'KARA-KHITAI', q: 9.5, r: 3.5, size: 6 },
                  { label: 'MONGOLIA', q: 11, r: 1.5, size: 9 },
                  { label: 'XI XIA', q: 12, r: 4.5, size: 6 },
                  { label: 'JIN', q: 16, r: 2.5, size: 8 },
                  { label: 'SONG', q: 15, r: 6.5, size: 7 },
                  { label: 'INTIA', q: 8.5, r: 8.5, size: 7 },
                  { label: 'TIIBET', q: 11, r: 6.5, size: 6 },
                  { label: 'GOBI', q: 12.5, r: 3.5, size: 6 },
                  { label: 'SIPERIA', q: 7, r: 0.3, size: 7 },
                ].map(({ label, q, r, size }) => {
                  const { x, y } = hexToPixel(q, r);
                  return (
                    <text key={label} x={x} y={y} textAnchor="middle" fontSize={size} fontWeight="600" fill="#86868B" opacity={0.6} letterSpacing="0.08em" className="pointer-events-none" style={{ fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif' }}>
                      {label}
                    </text>
                  );
                })}

                {/* Scale */}
                <g transform={`translate(40, ${BOARD_HEIGHT - 32})`}>
                  <line x1={0} y1={0} x2={80} y2={0} stroke="#C8BDA8" strokeWidth={1.5} />
                  <line x1={0} y1={-3} x2={0} y2={3} stroke="#C8BDA8" strokeWidth={1.5} />
                  <line x1={80} y1={-3} x2={80} y2={3} stroke="#C8BDA8" strokeWidth={1.5} />
                  <text x={40} y={-6} textAnchor="middle" fontSize={8} fill="#86868B" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>≈ 1000 km</text>
                </g>

                <text x={BOARD_WIDTH / 2} y={BOARD_HEIGHT - 10} textAnchor="middle" fontSize={7} fill="#C8BDA8" style={{ fontFamily: '-apple-system, system-ui, sans-serif' }}>
                  Mongolien Valtakunta — Strategialautapeli
                </text>
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

      {/* Print instructions — clean card */}
      <div className="p-5 rounded-xl print:hidden" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)' }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: '#3A3A3C', fontFamily: '-apple-system, system-ui, sans-serif' }}>Tulostusohjeet</h4>
        <ul className="text-xs space-y-1" style={{ color: '#6E6E73', fontFamily: '-apple-system, system-ui, sans-serif' }}>
          <li>• Parhaat tulostusasetukset: Vaakasuunta (Landscape), A3 tai suurempi paperi</li>
          <li>• Kartta kattaa alueen Euroopasta Koreaan ja Siperiasta Intiaan</li>
          <li>• Suosittelemme laminointia tai pahville liimaamista kestävyyden vuoksi</li>
        </ul>
      </div>
    </div>
  );
};
