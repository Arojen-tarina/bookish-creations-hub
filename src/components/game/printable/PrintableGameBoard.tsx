import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, ZoomIn, ZoomOut, X, MapPin, Shield, Swords, Coins, Mountain, TreePine, Waves, Sun, Building2, Wheat } from 'lucide-react';

// Region definitions with hex positions and terrain
interface HexTile {
  id: string;
  q: number; // axial coordinate
  r: number; // axial coordinate
  region: string;
  terrain: 'steppe' | 'desert' | 'mountain' | 'forest' | 'river' | 'city';
  name?: string;
  isCity?: boolean;
  isCapital?: boolean;
}

// Terrain info for the info panel
interface TerrainInfo {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  movement: string;
  combat: string;
  resources: string;
  special: string;
}

const terrainInfo: Record<string, TerrainInfo> = {
  steppe: {
    name: 'Steppialue',
    icon: Sun,
    movement: 'Nopea liikkuminen (+1)',
    combat: 'Ratsuväki +2 hyökkäys',
    resources: 'Hevoset, Karja',
    special: 'Mongolit saavat lisäbonuksen'
  },
  desert: {
    name: 'Autiomaa',
    icon: Waves,
    movement: 'Hidas liikkuminen (-1)',
    combat: 'Ei taisteluetuja',
    resources: 'Kauppareitit',
    special: 'Vaatii ylimääräistä ruokaa'
  },
  mountain: {
    name: 'Vuoristo',
    icon: Mountain,
    movement: 'Erittäin hidas (-2)',
    combat: 'Puolustaja +3',
    resources: 'Malmit, Kiviaines',
    special: 'Estää ratsuväen hyökkäyksen'
  },
  forest: {
    name: 'Metsäalue',
    icon: TreePine,
    movement: 'Normaali liikkuminen',
    combat: 'Jalkaväki +1, Ratsuväki -1',
    resources: 'Puu, Turkikset',
    special: 'Venäläiset saavat lisäbonuksen'
  },
  river: {
    name: 'Jokilaakso',
    icon: Wheat,
    movement: 'Normaali liikkuminen',
    combat: 'Puolustaja +1 joelta hyökätessä',
    resources: 'Ruoka, Kauppa',
    special: 'Kaupungit tuottavat +1 kultaa'
  },
  city: {
    name: 'Kaupunkialue',
    icon: Building2,
    movement: 'Normaali liikkuminen',
    combat: 'Linnoitus +3 puolustus',
    resources: 'Kulta, Käsityöläiset',
    special: 'Voidaan piirittää'
  },
};

// Region info for the info panel
interface RegionInfo {
  name: string;
  description: string;
  capital: string;
  faction: string;
  bonuses: string[];
}

const regionInfo: Record<string, RegionInfo> = {
  'Mongolia': {
    name: 'Mongolian Steppi',
    description: 'Laajat ruohomaat ja pelin sydän. Genghis Khanin synnyinmaa.',
    capital: 'Karakorum',
    faction: 'Mongoli-heimo',
    bonuses: ['Ratsuväki +1 liike', 'Hevosten tuotanto x2', 'Nomadibonus']
  },
  'Gobi': {
    name: 'Gobin Autiomaa',
    description: 'Ankara aavikko Mongolian ja Kiinan välissä. Strateginen este.',
    capital: '-',
    faction: 'Ei hallitsijaa',
    bonuses: ['Puolustusetu', 'Kauppareitit', 'Suojaa hyökkäyksiltä']
  },
  'Kiina': {
    name: 'Kiinan Valtakunta',
    description: 'Rikas ja linnoitettu itäinen valtakunta. Teknologian keskus.',
    capital: 'Zhongdu',
    faction: 'Jin-dynastia',
    bonuses: ['Teknologia +1', 'Linnoitukset vahvempia', 'Runsaat resurssit']
  },
  'Keski-Aasia': {
    name: 'Keski-Aasian Kaupunkivaltiot',
    description: 'Silkkitien sydän. Rikkaat kauppakaupungit.',
    capital: 'Samarkand',
    faction: 'Khwarezmit',
    bonuses: ['Kauppa +2 kultaa', 'Silkkitien hallinta', 'Diplomaattinen vaikutus']
  },
  'Persia': {
    name: 'Persialainen Valtakunta',
    description: 'Muinainen sivistys ja kulttuurikeskus.',
    capital: 'Bagdad',
    faction: 'Abbasidi-kalifaatti',
    bonuses: ['Kulttuuri +1', 'Tiede +1', 'Vauras talous']
  },
  'Venäjä': {
    name: 'Venäjän Ruhtinaskunnat',
    description: 'Pohjoisen metsien hallitsijat ja kauppaverkostot.',
    capital: 'Kiev',
    faction: 'Kiovan Rus',
    bonuses: ['Talvibonus +2', 'Metsätaistelu +1', 'Sitkeä puolustus']
  },
  'Intia': {
    name: 'Intian Vuoristopassit',
    description: 'Eteläinen rikkaus ja linnoitetut vuoristosolat.',
    capital: 'Delhi',
    faction: 'Delhi-sultantti',
    bonuses: ['Puolustus +2', 'Elefantit', 'Rikkaat kaupungit']
  },
};

// Generate hex grid for the game board
const generateHexGrid = (): HexTile[] => {
  const tiles: HexTile[] = [];
  
  // Mongolia Steppe - Center
  const mongoliaHexes = [
    { q: 6, r: 4, terrain: 'steppe' as const, name: 'Karakorum', isCity: true, isCapital: true },
    { q: 7, r: 4, terrain: 'steppe' as const },
    { q: 8, r: 4, terrain: 'steppe' as const },
    { q: 5, r: 5, terrain: 'steppe' as const },
    { q: 6, r: 5, terrain: 'steppe' as const },
    { q: 7, r: 5, terrain: 'steppe' as const },
    { q: 8, r: 5, terrain: 'steppe' as const },
    { q: 5, r: 6, terrain: 'steppe' as const },
    { q: 6, r: 6, terrain: 'steppe' as const },
    { q: 7, r: 6, terrain: 'steppe' as const },
    { q: 6, r: 3, terrain: 'steppe' as const },
    { q: 7, r: 3, terrain: 'steppe' as const },
  ];
  mongoliaHexes.forEach((h, i) => tiles.push({ ...h, id: `mng-${i}`, region: 'Mongolia' }));

  // Gobi Desert - South of Mongolia
  const gobiHexes = [
    { q: 7, r: 7, terrain: 'desert' as const },
    { q: 8, r: 7, terrain: 'desert' as const },
    { q: 9, r: 7, terrain: 'desert' as const },
    { q: 7, r: 8, terrain: 'desert' as const },
    { q: 8, r: 8, terrain: 'desert' as const },
    { q: 9, r: 8, terrain: 'desert' as const },
    { q: 8, r: 6, terrain: 'desert' as const },
    { q: 9, r: 6, terrain: 'desert' as const },
  ];
  gobiHexes.forEach((h, i) => tiles.push({ ...h, id: `gob-${i}`, region: 'Gobi' }));

  // China - East
  const chinaHexes = [
    { q: 10, r: 5, terrain: 'river' as const, name: 'Zhongdu', isCity: true, isCapital: true },
    { q: 11, r: 5, terrain: 'river' as const },
    { q: 12, r: 5, terrain: 'river' as const },
    { q: 10, r: 6, terrain: 'river' as const },
    { q: 11, r: 6, terrain: 'city' as const, name: 'Kaifeng', isCity: true },
    { q: 12, r: 6, terrain: 'river' as const },
    { q: 10, r: 7, terrain: 'mountain' as const },
    { q: 11, r: 7, terrain: 'river' as const },
    { q: 12, r: 7, terrain: 'river' as const },
    { q: 10, r: 8, terrain: 'river' as const },
    { q: 11, r: 8, terrain: 'river' as const },
    { q: 10, r: 4, terrain: 'forest' as const },
    { q: 11, r: 4, terrain: 'forest' as const },
    { q: 9, r: 5, terrain: 'steppe' as const },
  ];
  chinaHexes.forEach((h, i) => tiles.push({ ...h, id: `chn-${i}`, region: 'Kiina' }));

  // Central Asia - West of Mongolia
  const centralAsiaHexes = [
    { q: 3, r: 5, terrain: 'city' as const, name: 'Samarkand', isCity: true, isCapital: true },
    { q: 4, r: 5, terrain: 'steppe' as const },
    { q: 2, r: 6, terrain: 'city' as const, name: 'Bukhara', isCity: true },
    { q: 3, r: 6, terrain: 'steppe' as const },
    { q: 4, r: 6, terrain: 'steppe' as const },
    { q: 2, r: 7, terrain: 'desert' as const },
    { q: 3, r: 7, terrain: 'steppe' as const },
    { q: 4, r: 7, terrain: 'steppe' as const },
    { q: 3, r: 4, terrain: 'steppe' as const },
    { q: 4, r: 4, terrain: 'steppe' as const },
    { q: 5, r: 4, terrain: 'steppe' as const },
  ];
  centralAsiaHexes.forEach((h, i) => tiles.push({ ...h, id: `cas-${i}`, region: 'Keski-Aasia' }));

  // Persia - Southwest
  const persiaHexes = [
    { q: 1, r: 7, terrain: 'city' as const, name: 'Bagdad', isCity: true, isCapital: true },
    { q: 0, r: 8, terrain: 'desert' as const },
    { q: 1, r: 8, terrain: 'river' as const },
    { q: 2, r: 8, terrain: 'desert' as const },
    { q: 0, r: 9, terrain: 'desert' as const },
    { q: 1, r: 9, terrain: 'city' as const, name: 'Isfahan', isCity: true },
    { q: 2, r: 9, terrain: 'mountain' as const },
    { q: 1, r: 10, terrain: 'desert' as const },
    { q: 2, r: 10, terrain: 'mountain' as const },
  ];
  persiaHexes.forEach((h, i) => tiles.push({ ...h, id: `per-${i}`, region: 'Persia' }));

  // Russia - North
  const russiaHexes = [
    { q: 2, r: 2, terrain: 'forest' as const, name: 'Novgorod', isCity: true },
    { q: 3, r: 2, terrain: 'forest' as const },
    { q: 4, r: 2, terrain: 'forest' as const },
    { q: 1, r: 3, terrain: 'forest' as const },
    { q: 2, r: 3, terrain: 'city' as const, name: 'Kiev', isCity: true, isCapital: true },
    { q: 3, r: 3, terrain: 'forest' as const },
    { q: 4, r: 3, terrain: 'steppe' as const },
    { q: 5, r: 3, terrain: 'steppe' as const },
    { q: 1, r: 4, terrain: 'forest' as const },
    { q: 2, r: 4, terrain: 'forest' as const },
    { q: 5, r: 2, terrain: 'forest' as const },
    { q: 6, r: 2, terrain: 'steppe' as const },
  ];
  russiaHexes.forEach((h, i) => tiles.push({ ...h, id: `rus-${i}`, region: 'Venäjä' }));

  // India passes - South
  const indiaHexes = [
    { q: 4, r: 9, terrain: 'mountain' as const, name: 'Khyber', isCity: true },
    { q: 5, r: 9, terrain: 'mountain' as const },
    { q: 6, r: 9, terrain: 'mountain' as const },
    { q: 4, r: 10, terrain: 'mountain' as const },
    { q: 5, r: 10, terrain: 'city' as const, name: 'Delhi', isCity: true, isCapital: true },
    { q: 6, r: 10, terrain: 'river' as const },
    { q: 5, r: 8, terrain: 'mountain' as const },
    { q: 6, r: 8, terrain: 'mountain' as const },
    { q: 3, r: 9, terrain: 'mountain' as const },
  ];
  indiaHexes.forEach((h, i) => tiles.push({ ...h, id: `ind-${i}`, region: 'Intia' }));

  return tiles;
};

// Hex dimensions for 60x80cm board with ~80 hexes
const HEX_SIZE = 45;

// Convert axial coordinates to pixel position
const hexToPixel = (q: number, r: number) => {
  const x = HEX_SIZE * (3/2 * q);
  const y = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x: x + 100, y: y + 80 };
};

// Generate hex path
const hexPath = (size: number) => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    points.push(`${size * Math.cos(angle)},${size * Math.sin(angle)}`);
  }
  return `M ${points.join(' L ')} Z`;
};

// Terrain colors
const terrainColors: Record<string, { fill: string; stroke: string }> = {
  steppe: { fill: '#C4B896', stroke: '#A69B70' },
  desert: { fill: '#E8D4A8', stroke: '#D4BC7A' },
  mountain: { fill: '#8B7355', stroke: '#6B5344' },
  forest: { fill: '#4A7C59', stroke: '#3A6249' },
  river: { fill: '#7FB3D3', stroke: '#5A9BC4' },
  city: { fill: '#D4A574', stroke: '#B8864A' },
};

// Region colors (for borders)
const regionColors: Record<string, string> = {
  'Mongolia': '#FFD700',
  'Gobi': '#F4A460',
  'Kiina': '#DC143C',
  'Keski-Aasia': '#9370DB',
  'Persia': '#20B2AA',
  'Venäjä': '#4169E1',
  'Intia': '#FF6347',
};

// Terrain icons (SVG paths)
const terrainIcons: Record<string, string> = {
  steppe: 'M-8,-2 Q-4,-6 0,-2 Q4,-6 8,-2 M-6,2 Q-2,-2 2,2 Q6,-2 10,2',
  desert: 'M-8,4 Q-4,0 0,4 Q4,0 8,4 M-6,-2 L-4,-4 L-2,-2 M2,-2 L4,-4 L6,-2',
  mountain: 'M-10,6 L-4,-6 L2,6 M-2,6 L4,-4 L10,6',
  forest: 'M0,-8 L-6,4 L6,4 Z M-8,4 L-8,8 M0,4 L0,8 M8,4 L8,8',
  river: 'M-8,0 Q-4,-4 0,0 Q4,4 8,0',
  city: 'M-6,6 L-6,-2 L0,-6 L6,-2 L6,6 M-2,6 L-2,2 L2,2 L2,6',
};

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
  const highlightWidth = isSelected ? 5 : isHovered ? 4 : (tile.isCapital ? 4 : 2);
  const glowFilter = isSelected || isHovered ? 'url(#glow)' : undefined;
  
  return (
    <g 
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Hex background */}
      <path
        d={hexPath(size)}
        fill={colors.fill}
        stroke={highlightStroke}
        strokeWidth={highlightWidth}
        filter={glowFilter}
        className="transition-all duration-200"
      />
      
      {/* Terrain pattern */}
      <path
        d={terrainIcons[tile.terrain]}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1.5}
        opacity={0.6}
      />
      
      {/* City marker */}
      {tile.isCity && (
        <>
          <circle
            cx={0}
            cy={0}
            r={tile.isCapital ? 12 : 8}
            fill={tile.isCapital ? '#FFD700' : '#FFFFFF'}
            stroke="#333"
            strokeWidth={2}
          />
          {tile.isCapital && (
            <text
              x={0}
              y={4}
              textAnchor="middle"
              fontSize={12}
              fontWeight="bold"
              fill="#333"
            >
              ★
            </text>
          )}
        </>
      )}
      
      {/* City/Location name */}
      {tile.name && (
        <text
          x={0}
          y={size + 12}
          textAnchor="middle"
          fontSize={10}
          fontWeight="bold"
          fill="#333"
          className="font-display pointer-events-none"
        >
          {tile.name}
        </text>
      )}
    </g>
  );
};

// Info Panel Component
interface InfoPanelProps {
  tile: HexTile | null;
  onClose: () => void;
}

const InfoPanel = ({ tile, onClose }: InfoPanelProps) => {
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
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-1">
          <span 
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: `${regionColors[tile.region]}33`, color: regionColors[tile.region] }}
          >
            {tile.region}
          </span>
          {tile.isCapital && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 font-medium">
              ★ Pääkaupunki
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Terrain Info */}
        <div className="p-3 rounded-lg" style={{ backgroundColor: terrainColors[tile.terrain].fill + '40' }}>
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <div 
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: terrainColors[tile.terrain].stroke }}
            >
              <TerrainIcon className="w-3 h-3 text-white" />
            </div>
            {terrain.name}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Liikkuminen:</span>
            </div>
            <div>{terrain.movement}</div>
            <div className="flex items-center gap-1">
              <Swords className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Taistelu:</span>
            </div>
            <div>{terrain.combat}</div>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Resurssit:</span>
            </div>
            <div>{terrain.resources}</div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground italic">{terrain.special}</p>
        </div>

        {/* Region Info */}
        <div className="border-t pt-3">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: regionColors[tile.region] }} />
            {region.name}
          </h4>
          <p className="text-xs text-muted-foreground mb-2">{region.description}</p>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Faktio:</span>
              <span className="font-medium">{region.faction}</span>
            </div>
            {region.capital !== '-' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pääkaupunki:</span>
                <span className="font-medium">{region.capital}</span>
              </div>
            )}
          </div>
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Aluebonukset:</p>
            <ul className="text-xs space-y-0.5">
              {region.bonuses.map((bonus, i) => (
                <li key={i} className="flex items-center gap-1">
                  <span className="text-green-600">+</span> {bonus}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const PrintableGameBoard = () => {
  const [zoom, setZoom] = useState(0.6);
  const [selectedTile, setSelectedTile] = useState<HexTile | null>(null);
  const [hoveredTile, setHoveredTile] = useState<HexTile | null>(null);
  const tiles = generateHexGrid();
  
  const BOARD_WIDTH = 800;
  const BOARD_HEIGHT = 600;

  const handlePrint = () => {
    setSelectedTile(null);
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Controls - hidden in print */}
      <div className="flex flex-wrap gap-4 items-center print:hidden">
        <Button onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          Tulosta Pelilauta (60×80cm)
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1.2, z + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-sm text-muted-foreground">
          💡 Klikkaa heksaa nähdäksesi aluetiedot
        </span>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 p-4 bg-muted rounded-lg print:hidden">
        <h4 className="col-span-full font-display font-bold mb-2">Alueet:</h4>
        {Object.entries(regionColors).map(([region, color]) => (
          <div key={region} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded border-2" 
              style={{ borderColor: color, backgroundColor: `${color}33` }}
            />
            <span className="text-sm">{region}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 p-4 bg-muted rounded-lg print:hidden">
        <h4 className="col-span-full font-display font-bold mb-2">Maastotyypit:</h4>
        {Object.entries(terrainColors).map(([terrain, colors]) => (
          <div key={terrain} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: colors.fill, border: `1px solid ${colors.stroke}` }}
            />
            <span className="text-sm capitalize">
              {terrainInfo[terrain]?.name || terrain}
            </span>
          </div>
        ))}
      </div>

      {/* Game Board with Info Panel */}
      <div className="relative">
        <InfoPanel tile={selectedTile} onClose={() => setSelectedTile(null)} />
        
        <div 
          className="overflow-auto border-4 border-amber-700 rounded-lg bg-amber-50"
          style={{ maxHeight: '70vh' }}
        >
          <svg
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            style={{ 
              width: `${BOARD_WIDTH * zoom}px`, 
              height: `${BOARD_HEIGHT * zoom}px`,
              minWidth: '100%'
            }}
            className="print:w-full print:h-auto"
          >
            {/* Glow filter for selection */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Background */}
            <rect width={BOARD_WIDTH} height={BOARD_HEIGHT} fill="#F5E6C8" />
            
            {/* Decorative border */}
            <rect
              x={10}
              y={10}
              width={BOARD_WIDTH - 20}
              height={BOARD_HEIGHT - 20}
              fill="none"
              stroke="#8B4513"
              strokeWidth={4}
            />
            <rect
              x={20}
              y={20}
              width={BOARD_WIDTH - 40}
              height={BOARD_HEIGHT - 40}
              fill="none"
              stroke="#D2691E"
              strokeWidth={2}
            />

            {/* Title */}
            <text
              x={BOARD_WIDTH / 2}
              y={45}
              textAnchor="middle"
              fontSize={28}
              fontWeight="bold"
              fill="#5D3A1A"
              className="font-display"
            >
              MONGOLIEN VALTAKUNTA
            </text>
            <text
              x={BOARD_WIDTH / 2}
              y={65}
              textAnchor="middle"
              fontSize={14}
              fill="#8B4513"
            >
              Aasian Steppi — 1200-luku
            </text>

            {/* Hex tiles */}
            {tiles.map(tile => (
              <HexTileComponent 
                key={tile.id} 
                tile={tile} 
                size={HEX_SIZE}
                isSelected={selectedTile?.id === tile.id}
                isHovered={hoveredTile?.id === tile.id}
                onClick={() => setSelectedTile(tile)}
                onMouseEnter={() => setHoveredTile(tile)}
                onMouseLeave={() => setHoveredTile(null)}
              />
            ))}

            {/* Region labels */}
            <text x={380} y={240} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">MONGOLIA</text>
            <text x={480} y={360} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">GOBI</text>
            <text x={600} y={280} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">KIINA</text>
            <text x={200} y={280} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">KESKI-AASIA</text>
            <text x={80} y={400} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">PERSIA</text>
            <text x={180} y={140} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">VENÄJÄ</text>
            <text x={300} y={480} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7} className="pointer-events-none">INTIA</text>

            {/* Legend box - bottom right */}
            <g transform={`translate(${BOARD_WIDTH - 180}, ${BOARD_HEIGHT - 160})`}>
              <rect x={0} y={0} width={160} height={140} fill="#FFF8E7" stroke="#8B4513" strokeWidth={1} rx={4} />
              <text x={80} y={18} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#5D3A1A">SELITE</text>
              
              {[
                { terrain: 'steppe', label: 'Steppi', y: 35 },
                { terrain: 'desert', label: 'Autiomaa', y: 52 },
                { terrain: 'mountain', label: 'Vuoristo', y: 69 },
                { terrain: 'forest', label: 'Metsä', y: 86 },
                { terrain: 'river', label: 'Jokilaakso', y: 103 },
                { terrain: 'city', label: 'Kaupunki', y: 120 },
              ].map(item => (
                <g key={item.terrain}>
                  <rect
                    x={10}
                    y={item.y - 8}
                    width={14}
                    height={14}
                    fill={terrainColors[item.terrain].fill}
                    stroke={terrainColors[item.terrain].stroke}
                    strokeWidth={1}
                  />
                  <text x={32} y={item.y + 3} fontSize={9} fill="#5D3A1A">{item.label}</text>
                </g>
              ))}

              <circle cx={100} cy={40} r={6} fill="#FFD700" stroke="#333" strokeWidth={1} />
              <text x={100} y={42} textAnchor="middle" fontSize={8} fill="#333">★</text>
              <text x={115} y={42} fontSize={9} fill="#5D3A1A">Pääkaupunki</text>
            </g>

            {/* Scale indicator */}
            <g transform={`translate(40, ${BOARD_HEIGHT - 40})`}>
              <line x1={0} y1={0} x2={100} y2={0} stroke="#5D3A1A" strokeWidth={2} />
              <line x1={0} y1={-5} x2={0} y2={5} stroke="#5D3A1A" strokeWidth={2} />
              <line x1={100} y1={-5} x2={100} y2={5} stroke="#5D3A1A" strokeWidth={2} />
              <text x={50} y={-8} textAnchor="middle" fontSize={10} fill="#5D3A1A">≈ 500 km</text>
            </g>

            {/* Copyright */}
            <text x={BOARD_WIDTH / 2} y={BOARD_HEIGHT - 15} textAnchor="middle" fontSize={8} fill="#8B4513">
              © Mongolien Valtakunta — Strategialautapeli
            </text>
          </svg>
        </div>
      </div>

      {/* Print instructions */}
      <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg print:hidden">
        <h4 className="font-bold mb-2">📋 Tulostusohjeet (60×80cm pelilauta):</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Tulosta A0-kokoiselle paperille tai useammalle A3-arkille</li>
          <li>Valitse "Sovita sivulle" tulostusasetuksista</li>
          <li>Suosittelemme laminointia tai pahville liimaamista kestävyyden vuoksi</li>
          <li>Vaaleammat värit toimivat paremmin pelinappuloiden näkyvyyteen</li>
        </ul>
      </div>
    </div>
  );
};
