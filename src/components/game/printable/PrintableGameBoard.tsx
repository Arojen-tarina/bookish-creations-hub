import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer, ZoomIn, ZoomOut } from 'lucide-react';

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

// Generate hex grid for the game board
const generateHexGrid = (): HexTile[] => {
  const tiles: HexTile[] = [];
  
  // Board dimensions (approximately 15x12 hexes to fit 60x80cm at reasonable size)
  // Regions are laid out geographically
  
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
const HEX_SIZE = 45; // mm in print scale

// Convert axial coordinates to pixel position
const hexToPixel = (q: number, r: number) => {
  const x = HEX_SIZE * (3/2 * q);
  const y = HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x: x + 100, y: y + 80 }; // offset for margins
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
}

const HexTileComponent = ({ tile, size }: HexTileComponentProps) => {
  const { x, y } = hexToPixel(tile.q, tile.r);
  const colors = terrainColors[tile.terrain];
  const regionColor = regionColors[tile.region];
  
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Hex background */}
      <path
        d={hexPath(size)}
        fill={colors.fill}
        stroke={regionColor}
        strokeWidth={tile.isCapital ? 4 : 2}
        className="transition-all"
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
          className="font-display"
        >
          {tile.name}
        </text>
      )}
    </g>
  );
};

export const PrintableGameBoard = () => {
  const [zoom, setZoom] = useState(0.5);
  const tiles = generateHexGrid();
  
  // Board dimensions in mm for 60x80cm
  const BOARD_WIDTH = 800; // mm
  const BOARD_HEIGHT = 600; // mm

  const handlePrint = () => {
    window.print();
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
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.2, z - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(1, z + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
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
              {terrain === 'steppe' ? 'Steppi' :
               terrain === 'desert' ? 'Autiomaa' :
               terrain === 'mountain' ? 'Vuoristo' :
               terrain === 'forest' ? 'Metsä' :
               terrain === 'river' ? 'Jokilaakso' :
               'Kaupunki'}
            </span>
          </div>
        ))}
      </div>

      {/* Game Board */}
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
            <HexTileComponent key={tile.id} tile={tile} size={HEX_SIZE} />
          ))}

          {/* Region labels */}
          <text x={380} y={240} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>MONGOLIA</text>
          <text x={480} y={360} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>GOBI</text>
          <text x={600} y={280} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>KIINA</text>
          <text x={200} y={280} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>KESKI-AASIA</text>
          <text x={80} y={400} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>PERSIA</text>
          <text x={180} y={140} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>VENÄJÄ</text>
          <text x={300} y={480} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#5D3A1A" opacity={0.7}>INTIA</text>

          {/* Legend box - bottom right */}
          <g transform={`translate(${BOARD_WIDTH - 180}, ${BOARD_HEIGHT - 160})`}>
            <rect x={0} y={0} width={160} height={140} fill="#FFF8E7" stroke="#8B4513" strokeWidth={1} rx={4} />
            <text x={80} y={18} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#5D3A1A">SELITE</text>
            
            {/* Terrain legend items */}
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

            {/* Capital marker */}
            <circle cx={100} y={40} r={6} fill="#FFD700" stroke="#333" strokeWidth={1} />
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
