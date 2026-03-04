import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, ZoomIn, ZoomOut, X, MapPin, Shield, Swords, Coins, Mountain, TreePine, Waves, Sun, Building2, Wheat, Image, Grid3X3 } from 'lucide-react';
import gameBoardImage from '@/assets/game-board-map.png';

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

const terrainColors: Record<string, { fill: string; stroke: string }> = {
  steppe:   { fill: '#C4B896', stroke: '#A69B70' },
  desert:   { fill: '#E8D4A8', stroke: '#D4BC7A' },
  mountain: { fill: '#8B7355', stroke: '#6B5344' },
  forest:   { fill: '#4A7C59', stroke: '#3A6249' },
  river:    { fill: '#7FB3D3', stroke: '#5A9BC4' },
  city:     { fill: '#D4A574', stroke: '#B8864A' },
  tundra:   { fill: '#B8C8C0', stroke: '#8FA898' },
  sea:      { fill: '#5B92B8', stroke: '#3D7CA3' },
};

// ─── Historically accurate regions (c. 1206) ────────────────────────
const regionInfo: Record<string, RegionInfo> = {
  'Mongolia': {
    name: 'Mongolian Steppi',
    description: 'Keski-Aasian sydän. Genghis Khan yhdisti mongoliheimot vuonna 1206 ja perusti Mongolien valtakunnan.',
    capital: 'Karakorum',
    faction: 'Mongoli-imperiumi',
    bonuses: ['Ratsuväki +1 liike', 'Hevosten tuotanto ×2', 'Nomadibonus'],
    historicalNote: 'Vuonna 1206 Temüjin sai arvonimen Genghis Khan kurultaissa Onon-joen varrella.'
  },
  'Jin': {
    name: 'Jin-dynastia (金朝)',
    description: 'Juršen-kansan hallitsema Pohjois-Kiinan valtakunta. Rikas mutta sisäisesti heikentynyt.',
    capital: 'Zhongdu (Peking)',
    faction: 'Jin-dynastia',
    bonuses: ['Teknologia +1', 'Muuri: puolustus +2', 'Runsaat resurssit'],
    historicalNote: 'Jin hallitsi Pohjois-Kiinaa 1115–1234. Pääkaupunki Zhongdu (nykyinen Peking) vallattiin 1215.'
  },
  'Xi Xia': {
    name: 'Xi Xia -kuningaskunta (西夏)',
    description: 'Tangut-kansan buddhalainen valtakunta Kiinan luoteisosassa, Silkkitien varrella.',
    capital: 'Zhongxing',
    faction: 'Xi Xia',
    bonuses: ['Silkkitie +1 kultaa', 'Puolustusetu', 'Kauppiaat'],
    historicalNote: 'Genghis Khanin ensimmäinen suuri valloituskohde. Xi Xia tuhottiin 1227.'
  },
  'Khwarezmia': {
    name: 'Khwarezmin šaahinvaltakunta',
    description: 'Voimakas islamilainen valtakunta Keski-Aasiassa. Hallitsi Silkkitien kauppakaupunkeja.',
    capital: 'Samarkand',
    faction: 'Khwarezmit',
    bonuses: ['Kauppa +2 kultaa', 'Silkkitien hallinta', 'Diplomaattinen vaikutus'],
    historicalNote: 'Šaahi Muhammad II loukkasi mongoleja teloittamalla kauppalähetystön 1218, mikä johti tuhoisaan valloitussotaan.'
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
    description: 'Kumaani-kipčakkien hallitsema laaja steppivyöhyke Mustanmeren pohjoispuolelta Aral-järvelle.',
    capital: 'Sarai (myöh.)',
    faction: 'Kumaaniliitto',
    bonuses: ['Ratsuväki +1', 'Laaja alue', 'Nomadien verkostot'],
    historicalNote: 'Kipčakit olivat mongolilaisten sukulaiskansaa. Alueesta tuli myöhemmin Kultaisen ordan ydin.'
  },
  'Venäjä': {
    name: 'Kiovan Rusin ruhtinaskunnat',
    description: 'Hajanainen slaavilaisten ruhtinaskuntien kokoelma. Sisäiset riidat heikensivät puolustusta.',
    capital: 'Kiev',
    faction: 'Kiovan Rus',
    bonuses: ['Talvibonus +2', 'Metsätaistelu +1', 'Sitkeä puolustus'],
    historicalNote: 'Mongoliarmeija murskasi venäläis-kumaaniliiton Kalka-joen taistelussa 1223.'
  },
  'Persia': {
    name: 'Abbasidien kalifaatti',
    description: 'Islamilaisen maailman henkinen keskus Bagdadissa. Sotilaallisesti heikko mutta kulttuurisesti rikas.',
    capital: 'Bagdad',
    faction: 'Abbasidi-kalifaatti',
    bonuses: ['Kulttuuri +2', 'Tiede +1', 'Vauras talous'],
    historicalNote: 'Bagdad tuhottiin 1258 Hülegün johdolla. Kaliffi teloitettiin ja kirjasto tuhottiin.'
  },
  'Intia': {
    name: 'Delhin sulttaanikunta',
    description: 'Pohjois-Intian islamilainen valtakunta. Vuoristopassit suojelivat hyökkäyksiltä.',
    capital: 'Delhi',
    faction: 'Delhi-sultantti',
    bonuses: ['Puolustus +2', 'Elefantit', 'Rikkaat kaupungit'],
    historicalNote: 'Mongolit hyökkäsivät Intiaan useaan otteeseen 1200-luvulla mutta eivät koskaan valloittaneet Delhiä.'
  },
  'Song': {
    name: 'Etelä-Songin dynastia (南宋)',
    description: 'Maailman rikkain ja edistynein valtakunta. Jangtsejoki oli luonnollinen puolustuseste.',
    capital: 'Hangzhou (Lin\'an)',
    faction: 'Song-dynastia',
    bonuses: ['Teknologia +2', 'Laivasto', 'Rikkain talous'],
    historicalNote: 'Song kesti mongolien hyökkäykset 40 vuotta (1235–1279). Ruuti ja kompassi keksittiin täällä.'
  },
  'Kaukasia': {
    name: 'Kaukasian kuningaskunnat',
    description: 'Georgian ja Armenian kristityt kuningaskunnat vuoristoisella alueella.',
    capital: 'Tbilisi',
    faction: 'Georgian kuningaskunta',
    bonuses: ['Vuoristopuolustus +2', 'Kristilliset liittolaiset', 'Kauppareitit'],
    historicalNote: 'Georgia oli alueellinen suurvalta kuningatar Tamarin (1184–1213) aikana.'
  },
};

const regionColors: Record<string, string> = {
  'Mongolia':    '#FFD700',
  'Jin':         '#DC143C',
  'Xi Xia':      '#FF8C00',
  'Khwarezmia':  '#9370DB',
  'Kara-Khitai': '#DB7093',
  'Kipchak':     '#F4A460',
  'Venäjä':      '#4169E1',
  'Persia':      '#20B2AA',
  'Intia':       '#FF6347',
  'Song':        '#228B22',
  'Kaukasia':    '#C71585',
};

// ─── Geographically accurate hex grid ────────────────────────────────
// Grid: q=0–18 (West→East, ~40°E to 130°E), r=0–12 (North→South, ~55°N to 20°N)
// Approximate mapping: 1 hex ≈ 500km

const generateHexGrid = (): HexTile[] => {
  const tiles: HexTile[] = [];

  // ── Venäjä / Kiovan Rus (northwest) ──
  const russia: Partial<HexTile>[] = [
    { q: 1, r: 1, terrain: 'forest', name: 'Novgorod', isCity: true },
    { q: 2, r: 1, terrain: 'forest' },
    { q: 3, r: 1, terrain: 'forest' },
    { q: 1, r: 2, terrain: 'forest' },
    { q: 2, r: 2, terrain: 'city', name: 'Kiev', isCity: true, isCapital: true },
    { q: 3, r: 2, terrain: 'forest' },
    { q: 0, r: 2, terrain: 'forest' },
    { q: 1, r: 3, terrain: 'forest' },
    { q: 0, r: 1, terrain: 'tundra' },
    { q: 0, r: 0, terrain: 'tundra' },
    { q: 1, r: 0, terrain: 'tundra' },
    { q: 2, r: 0, terrain: 'tundra' },
  ];
  russia.forEach((h, i) => tiles.push({ id: `rus-${i}`, region: 'Venäjä', ...h } as HexTile));

  // ── Kipchak Steppe (Pontic-Caspian) ──
  const kipchak: Partial<HexTile>[] = [
    { q: 4, r: 1, terrain: 'steppe' },
    { q: 5, r: 1, terrain: 'steppe' },
    { q: 4, r: 2, terrain: 'steppe' },
    { q: 5, r: 2, terrain: 'steppe' },
    { q: 6, r: 2, terrain: 'steppe' },
    { q: 3, r: 3, terrain: 'steppe' },
    { q: 4, r: 3, terrain: 'steppe' },
    { q: 5, r: 3, terrain: 'steppe' },
    { q: 6, r: 3, terrain: 'steppe' },
    { q: 7, r: 2, terrain: 'steppe' },
    { q: 7, r: 3, terrain: 'steppe' },
  ];
  kipchak.forEach((h, i) => tiles.push({ id: `kip-${i}`, region: 'Kipchak', ...h } as HexTile));

  // ── Kaukasia (between Black Sea & Caspian) ──
  const caucasus: Partial<HexTile>[] = [
    { q: 3, r: 4, terrain: 'mountain' },
    { q: 4, r: 4, terrain: 'city', name: 'Tbilisi', isCity: true, isCapital: true },
    { q: 2, r: 3, terrain: 'mountain' },
  ];
  caucasus.forEach((h, i) => tiles.push({ id: `cau-${i}`, region: 'Kaukasia', ...h } as HexTile));

  // ── Khwarezmia (Central Asia / Transoxiana) ──
  const khwarezm: Partial<HexTile>[] = [
    { q: 6, r: 4, terrain: 'city', name: 'Urgench', isCity: true, isCapital: true },
    { q: 7, r: 4, terrain: 'city', name: 'Bukhara', isCity: true },
    { q: 8, r: 4, terrain: 'city', name: 'Samarkand', isCity: true },
    { q: 5, r: 4, terrain: 'steppe' },
    { q: 7, r: 5, terrain: 'steppe' },
    { q: 8, r: 5, terrain: 'mountain' },
    { q: 6, r: 5, terrain: 'desert' },
    { q: 5, r: 5, terrain: 'desert' },
  ];
  khwarezm.forEach((h, i) => tiles.push({ id: `khw-${i}`, region: 'Khwarezmia', ...h } as HexTile));

  // ── Persia / Abbasidi (southwest) ──
  const persia: Partial<HexTile>[] = [
    { q: 4, r: 5, terrain: 'desert' },
    { q: 3, r: 5, terrain: 'city', name: 'Bagdad', isCity: true, isCapital: true },
    { q: 4, r: 6, terrain: 'desert' },
    { q: 3, r: 6, terrain: 'desert' },
    { q: 5, r: 6, terrain: 'mountain', name: 'Zagros' },
    { q: 2, r: 4, terrain: 'sea' }, // Black Sea
    { q: 2, r: 5, terrain: 'sea' }, // Mediterranean
    { q: 6, r: 6, terrain: 'city', name: 'Isfahan', isCity: true },
  ];
  persia.forEach((h, i) => tiles.push({ id: `per-${i}`, region: 'Persia', ...h } as HexTile));

  // ── Kara-Khitai (between Khwarezm and Mongolia) ──
  const karaKhitai: Partial<HexTile>[] = [
    { q: 9, r: 3, terrain: 'steppe', name: 'Balasagun', isCity: true, isCapital: true },
    { q: 10, r: 3, terrain: 'steppe' },
    { q: 9, r: 4, terrain: 'steppe' },
    { q: 10, r: 4, terrain: 'mountain', name: 'Tien Shan' },
    { q: 8, r: 3, terrain: 'steppe' },
  ];
  karaKhitai.forEach((h, i) => tiles.push({ id: `kkh-${i}`, region: 'Kara-Khitai', ...h } as HexTile));

  // ── Mongolia (center) ──
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
    // Northern forests (Siberia edge)
    { q: 10, r: 0, terrain: 'tundra' },
    { q: 11, r: 0, terrain: 'tundra' },
    { q: 12, r: 0, terrain: 'tundra' },
    { q: 13, r: 0, terrain: 'forest' },
  ];
  mongolia.forEach((h, i) => tiles.push({ id: `mng-${i}`, region: 'Mongolia', ...h } as HexTile));

  // ── Xi Xia (between Mongolia and Jin, northwest China) ──
  const xiXia: Partial<HexTile>[] = [
    { q: 12, r: 4, terrain: 'city', name: 'Zhongxing', isCity: true, isCapital: true },
    { q: 11, r: 4, terrain: 'desert' },
    { q: 13, r: 3, terrain: 'desert' },
    { q: 13, r: 4, terrain: 'mountain' },
  ];
  xiXia.forEach((h, i) => tiles.push({ id: `xix-${i}`, region: 'Xi Xia', ...h } as HexTile));

  // ── Gobi Desert (between Mongolia and China) ──
  // Absorbed into Xi Xia / Mongolia terrain

  // ── Jin Dynasty (northeast China) ──
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
    // Manchuria
    { q: 17, r: 1, terrain: 'forest' },
    { q: 17, r: 2, terrain: 'forest' },
  ];
  jin.forEach((h, i) => tiles.push({ id: `jin-${i}`, region: 'Jin', ...h } as HexTile));

  // ── Song Dynasty (south China) ──
  const song: Partial<HexTile>[] = [
    { q: 15, r: 5, terrain: 'city', name: 'Lin\'an', isCity: true, isCapital: true },
    { q: 16, r: 5, terrain: 'river', name: 'Jangtse' },
    { q: 14, r: 5, terrain: 'river' },
    { q: 14, r: 6, terrain: 'mountain' },
    { q: 15, r: 6, terrain: 'river' },
    { q: 16, r: 6, terrain: 'river' },
    { q: 17, r: 3, terrain: 'sea' }, // East China Sea
    { q: 17, r: 4, terrain: 'sea' },
    { q: 17, r: 5, terrain: 'sea' },
  ];
  song.forEach((h, i) => tiles.push({ id: `sng-${i}`, region: 'Song', ...h } as HexTile));

  // ── Intia / Delhi (south) ──
  const india: Partial<HexTile>[] = [
    { q: 8, r: 7, terrain: 'city', name: 'Delhi', isCity: true, isCapital: true },
    { q: 7, r: 6, terrain: 'mountain', name: 'Hindukuš' },
    { q: 8, r: 6, terrain: 'mountain', name: 'Khyber' },
    { q: 9, r: 6, terrain: 'mountain' },
    { q: 9, r: 5, terrain: 'mountain', name: 'Himalaja' },
    { q: 7, r: 7, terrain: 'river', name: 'Indus' },
    { q: 9, r: 7, terrain: 'river', name: 'Ganges' },
    { q: 10, r: 5, terrain: 'mountain' },
    { q: 10, r: 6, terrain: 'mountain' },
    { q: 11, r: 5, terrain: 'mountain', name: 'Tibet' },
    { q: 12, r: 5, terrain: 'mountain' },
    { q: 13, r: 5, terrain: 'mountain' },
  ];
  india.forEach((h, i) => tiles.push({ id: `ind-${i}`, region: 'Intia', ...h } as HexTile));

  return tiles;
};

// ─── Rendering ──────────────────────────────────────────────────────
const HEX_SIZE = 38;

const hexToPixel = (q: number, r: number) => {
  const x = HEX_SIZE * (3 / 2 * q);
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
  return { x: x + 80, y: y + 70 };
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

  const BOARD_WIDTH = 1100;
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
          <div className="overflow-auto border-4 border-amber-700 rounded-lg bg-amber-50" style={{ maxHeight: '80vh' }}>
            <img src={gameBoardImage} alt="Mongolien Valtakunta - 1206 AD pelilauta" className="w-full h-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: zoom > 1 ? `${100 * zoom}%` : '100%' }} />
          </div>
          <div className="text-sm text-muted-foreground bg-green-100 border border-green-300 p-4 rounded-lg print:hidden">
            <p className="font-medium text-green-800 mb-2">✅ AI-Generoitu korkearesoluutiokartta</p>
            <p className="text-green-700">Kartta kattaa Euraasian vuonna 1206 — mongolien vallan alku.</p>
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
            <div className="overflow-auto border-4 border-amber-700 rounded-lg bg-amber-50 print:hidden" style={{ maxHeight: '80vh' }}>
              <svg viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} style={{ width: `${BOARD_WIDTH * zoom}px`, height: `${BOARD_HEIGHT * zoom}px` }}>
                <defs>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#F5E6C8" />
                <rect x={8} y={8} width={BOARD_WIDTH - 16} height={BOARD_HEIGHT - 16} fill="none" stroke="#8B4513" strokeWidth={3} />
                <rect x={16} y={16} width={BOARD_WIDTH - 32} height={BOARD_HEIGHT - 32} fill="none" stroke="#D2691E" strokeWidth={1} />

                <text x={BOARD_WIDTH / 2} y={40} textAnchor="middle" fontSize={24} fontWeight="bold" fill="#5D3A1A" className="font-display">MONGOLIEN VALTAKUNTA — EURAASIA 1206 AD</text>
                <text x={BOARD_WIDTH / 2} y={58} textAnchor="middle" fontSize={11} fill="#8B4513">Historiallisesti tarkka kartta · Genghis Khanin vallan alku</text>

                {/* Silk Road */}
                <path d={silkRoadSvgPath} fill="none" stroke="#DAA520" strokeWidth={3} strokeDasharray="8,4" opacity={0.6} />

                {/* Compass rose */}
                <g transform={`translate(${BOARD_WIDTH - 60}, 80)`}>
                  <circle cx={0} cy={0} r={20} fill="#FFF8E7" stroke="#8B4513" strokeWidth={1} />
                  <text x={0} y={-8} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#5D3A1A">P</text>
                  <text x={0} y={18} textAnchor="middle" fontSize={8} fill="#8B4513">E</text>
                  <text x={12} y={5} textAnchor="middle" fontSize={8} fill="#8B4513">I</text>
                  <text x={-12} y={5} textAnchor="middle" fontSize={8} fill="#8B4513">L</text>
                  <line x1={0} y1={-18} x2={0} y2={-4} stroke="#5D3A1A" strokeWidth={2} />
                </g>

                {tiles.map(tile => (
                  <HexTileComponent key={tile.id} tile={tile} size={HEX_SIZE} isSelected={selectedTile?.id === tile.id} isHovered={hoveredTile?.id === tile.id} onClick={() => setSelectedTile(tile)} onMouseEnter={() => setHoveredTile(tile)} onMouseLeave={() => setHoveredTile(null)} />
                ))}

                {/* Region labels */}
                {[
                  { label: 'VENÄJÄ', q: 1.5, r: 1.5, size: 11 },
                  { label: 'KIPČAKIT', q: 5, r: 2, size: 10 },
                  { label: 'KAUKASIA', q: 3.5, r: 3.5, size: 8 },
                  { label: 'KHWAREZMIA', q: 7, r: 4.5, size: 10 },
                  { label: 'PERSIA', q: 3.5, r: 5.5, size: 10 },
                  { label: 'KARA-KHITAI', q: 9.5, r: 3.5, size: 9 },
                  { label: 'MONGOLIA', q: 11, r: 1.5, size: 13 },
                  { label: 'XI XIA', q: 12, r: 3.5, size: 9 },
                  { label: 'JIN', q: 15.5, r: 2.5, size: 12 },
                  { label: 'SONG', q: 15, r: 5.5, size: 11 },
                  { label: 'INTIA', q: 8.5, r: 6.5, size: 10 },
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
