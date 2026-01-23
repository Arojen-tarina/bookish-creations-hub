import { useState, useCallback, useMemo, useRef, memo } from 'react';
import { Province, FactionId, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province';
import { ZoomIn, ZoomOut, Maximize2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CivilizationMapProps {
  provinces: Province[];
  selectedProvinceId: string | null;
  onProvinceClick: (provinceId: string) => void;
  playerFaction: FactionId;
  highlightedProvinces?: string[];
}

// Real-world inspired map bounds (Eurasia)
const MAP_CONFIG = {
  width: 1200,
  height: 700,
  // Coordinate system roughly matching real world
  lonMin: 20,  // Western edge (Eastern Europe)
  lonMax: 145, // Eastern edge (Pacific)
  latMin: 15,  // Southern edge (India/Arabia)
  latMax: 65,  // Northern edge (Siberia)
};

// Convert province center coordinates to map pixels
const coordToPixel = (center: { x: number; y: number }) => {
  // Map coordinates are in a simplified lon/lat-like system
  // x: roughly 5-75 maps to actual map positions
  // y: roughly 5-60 maps to actual map positions
  const x = ((center.x - 5) / 70) * MAP_CONFIG.width;
  const y = ((center.y - 5) / 55) * MAP_CONFIG.height;
  return { x, y };
};

// Water bodies - major seas, lakes, rivers
const WATER_BODIES = [
  // Caspian Sea
  { id: 'caspian', type: 'sea', path: 'M 240 360 Q 250 320 230 280 Q 210 320 220 360 Q 230 380 240 360 Z', name: 'Kaspianmeri' },
  // Aral Sea
  { id: 'aral', type: 'lake', path: 'M 300 280 Q 320 270 310 250 Q 290 260 300 280 Z', name: 'Araljärvi' },
  // Black Sea
  { id: 'black', type: 'sea', path: 'M 100 340 Q 160 320 200 340 Q 180 360 100 360 Q 80 350 100 340 Z', name: 'Mustameri' },
  // Lake Baikal
  { id: 'baikal', type: 'lake', path: 'M 780 120 Q 800 100 810 130 Q 790 150 780 120 Z', name: 'Baikaljärvi' },
  // Yellow Sea / Bohai
  { id: 'bohai', type: 'sea', path: 'M 900 320 Q 920 300 940 320 Q 920 350 900 340 Q 890 330 900 320 Z', name: 'Bohaimmeri' },
  // East China Sea
  { id: 'eastchina', type: 'sea', path: 'M 960 380 Q 1000 360 1020 400 Q 980 440 960 420 Q 950 400 960 380 Z', name: 'Itä-Kiinanmeri' },
  // South China Sea
  { id: 'southchina', type: 'sea', path: 'M 880 520 Q 920 500 960 540 Q 920 580 880 560 Q 860 540 880 520 Z', name: 'Etelä-Kiinanmeri' },
  // Pacific Ocean edge
  { id: 'pacific', type: 'ocean', path: 'M 1000 200 L 1200 200 L 1200 600 L 1000 600 Q 1050 400 1000 200 Z', name: 'Tyynimeri' },
  // Persian Gulf
  { id: 'persian', type: 'sea', path: 'M 280 540 Q 320 520 360 540 Q 340 560 280 560 Q 260 550 280 540 Z', name: 'Persianlahti' },
  // Indian Ocean edge
  { id: 'indian', type: 'ocean', path: 'M 200 620 L 500 620 L 500 700 L 200 700 Z', name: 'Intian valtameri' },
];

// Major rivers
const RIVERS = [
  // Volga
  { id: 'volga', path: 'M 180 100 Q 200 150 220 200 Q 240 250 220 300', name: 'Volga' },
  // Dnieper
  { id: 'dnieper', path: 'M 120 180 Q 130 220 120 280 Q 110 320 120 350', name: 'Dnepr' },
  // Amu Darya
  { id: 'amudarya', path: 'M 350 340 Q 330 310 310 280 Q 300 260 310 250', name: 'Amu-Darja' },
  // Syr Darya
  { id: 'syrdarya', path: 'M 400 300 Q 370 290 340 280 Q 320 270 310 250', name: 'Syr-Darja' },
  // Yellow River (Huang He)
  { id: 'huanghe', path: 'M 820 360 Q 780 340 740 360 Q 700 380 680 400', name: 'Keltainenjoki' },
  // Yangtze
  { id: 'yangtze', path: 'M 960 420 Q 900 440 840 460 Q 780 470 720 480', name: 'Jangtse' },
  // Irtysh
  { id: 'irtysh', path: 'M 420 240 Q 400 200 380 160 Q 360 120 340 100', name: 'Irtyš' },
  // Onon
  { id: 'onon', path: 'M 840 180 Q 860 160 880 140', name: 'Onon' },
];

// Mountain ranges
const MOUNTAINS = [
  // Himalayas
  { id: 'himalayas', path: 'M 500 480 Q 560 470 620 480 Q 680 475 720 490', name: 'Himalaja', height: 'high' },
  // Tian Shan
  { id: 'tianshan', path: 'M 420 320 Q 480 300 540 310', name: 'Tian Shan', height: 'high' },
  // Altai
  { id: 'altai', path: 'M 540 220 Q 580 200 620 220', name: 'Altai', height: 'medium' },
  // Urals
  { id: 'urals', path: 'M 260 80 Q 270 150 280 220 Q 290 280 280 340', name: 'Ural', height: 'medium' },
  // Caucasus
  { id: 'caucasus', path: 'M 180 360 Q 220 350 260 360', name: 'Kaukasus', height: 'high' },
  // Kunlun
  { id: 'kunlun', path: 'M 520 420 Q 580 410 640 420', name: 'Kunlun', height: 'high' },
  // Hindu Kush
  { id: 'hindukush', path: 'M 380 420 Q 420 400 460 420', name: 'Hindukuš', height: 'high' },
  // Great Khingan
  { id: 'khingan', path: 'M 880 200 Q 900 240 920 280', name: 'Suur-Hingan', height: 'medium' },
];

// Terrain texture patterns
const TerrainPatterns = memo(() => (
  <defs>
    {/* Steppe pattern */}
    <pattern id="steppe-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
      <rect width="20" height="20" fill="#a8b077" />
      <circle cx="5" cy="5" r="1" fill="#8fa058" opacity="0.5" />
      <circle cx="15" cy="15" r="1" fill="#8fa058" opacity="0.5" />
    </pattern>
    
    {/* Desert pattern */}
    <pattern id="desert-pattern" patternUnits="userSpaceOnUse" width="15" height="15">
      <rect width="15" height="15" fill="#d4a574" />
      <path d="M0 7.5 Q7.5 5 15 7.5" stroke="#c49860" strokeWidth="0.5" fill="none" opacity="0.6" />
    </pattern>
    
    {/* Forest pattern */}
    <pattern id="forest-pattern" patternUnits="userSpaceOnUse" width="12" height="12">
      <rect width="12" height="12" fill="#2d5a27" />
      <circle cx="4" cy="4" r="2" fill="#1e4420" opacity="0.6" />
      <circle cx="10" cy="8" r="1.5" fill="#1e4420" opacity="0.6" />
    </pattern>
    
    {/* Taiga pattern */}
    <pattern id="taiga-pattern" patternUnits="userSpaceOnUse" width="10" height="16">
      <rect width="10" height="16" fill="#1e3a1a" />
      <path d="M5 2 L3 6 L5 5 L7 6 Z" fill="#0f2a0f" opacity="0.6" />
      <path d="M5 10 L3 14 L5 13 L7 14 Z" fill="#0f2a0f" opacity="0.6" />
    </pattern>
    
    {/* Mountain pattern */}
    <pattern id="mountain-pattern" patternUnits="userSpaceOnUse" width="24" height="20">
      <rect width="24" height="20" fill="#6b7280" />
      <path d="M0 20 L8 8 L16 20 Z" fill="#5a6270" opacity="0.5" />
      <path d="M8 20 L16 5 L24 20 Z" fill="#4a5260" opacity="0.4" />
      <path d="M12 8 L16 3 L20 8" fill="white" opacity="0.3" />
    </pattern>
    
    {/* Farmland pattern */}
    <pattern id="farmland-pattern" patternUnits="userSpaceOnUse" width="16" height="16">
      <rect width="16" height="16" fill="#8bc34a" />
      <rect x="0" y="0" width="8" height="8" fill="#7cb342" opacity="0.5" />
      <rect x="8" y="8" width="8" height="8" fill="#7cb342" opacity="0.5" />
    </pattern>
    
    {/* Hills pattern */}
    <pattern id="hills-pattern" patternUnits="userSpaceOnUse" width="20" height="16">
      <rect width="20" height="16" fill="#9e9e6e" />
      <ellipse cx="6" cy="10" rx="5" ry="3" fill="#8e8e5e" opacity="0.5" />
      <ellipse cx="16" cy="8" rx="4" ry="2.5" fill="#8e8e5e" opacity="0.5" />
    </pattern>
    
    {/* Water gradient */}
    <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#2563eb" />
      <stop offset="100%" stopColor="#1e40af" />
    </linearGradient>
    
    {/* Ocean gradient */}
    <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#1e3a5f" />
      <stop offset="100%" stopColor="#0f1f3a" />
    </linearGradient>
    
    {/* River gradient */}
    <linearGradient id="river-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#3b82f6" />
      <stop offset="100%" stopColor="#60a5fa" />
    </linearGradient>
    
    {/* Snow caps */}
    <filter id="snow-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    
    {/* Province glow */}
    <filter id="province-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    {/* Silk Road glow */}
    <filter id="silk-road-glow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
));

TerrainPatterns.displayName = 'TerrainPatterns';

// Get terrain fill based on terrain type
const getTerrainFill = (terrain: Province['terrain']) => {
  const fills: Record<Province['terrain'], string> = {
    steppe: 'url(#steppe-pattern)',
    grassland: '#7cb342',
    forest: 'url(#forest-pattern)',
    mountain: 'url(#mountain-pattern)',
    desert: 'url(#desert-pattern)',
    taiga: 'url(#taiga-pattern)',
    tundra: '#b8c4cc',
    farmland: 'url(#farmland-pattern)',
    hills: 'url(#hills-pattern)',
    marsh: '#5d8a66',
  };
  return fills[terrain] || '#6b7280';
};

// Province hex tile component
interface ProvinceTileProps {
  province: Province;
  pixel: { x: number; y: number };
  isSelected: boolean;
  isHighlighted: boolean;
  isPlayerOwned: boolean;
  onClick: () => void;
  onHover: (province: Province | null) => void;
}

const ProvinceTile = memo(({
  province,
  pixel,
  isSelected,
  isHighlighted,
  isPlayerOwned,
  onClick,
  onHover,
}: ProvinceTileProps) => {
  const terrainInfo = PROVINCE_TERRAIN_INFO[province.terrain];
  const ownerColor = province.ownerId ? FACTION_DATA_1206[province.ownerId]?.color : null;
  
  // Hex size based on development
  const baseSize = 25 + province.developmentLevel * 3;
  
  // Generate hex points
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = pixel.x + baseSize * Math.cos(angle);
    const y = pixel.y + baseSize * Math.sin(angle);
    hexPoints.push(`${x},${y}`);
  }
  const hexPath = hexPoints.join(' ');
  
  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHover(province)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
      style={{ transition: 'all 0.15s ease' }}
    >
      {/* Terrain base */}
      <polygon
        points={hexPath}
        fill={getTerrainFill(province.terrain)}
        stroke={isSelected ? '#fbbf24' : isHighlighted ? '#22c55e' : '#374151'}
        strokeWidth={isSelected ? 3 : isHighlighted ? 2 : 1}
        opacity={0.9}
      />
      
      {/* Faction ownership overlay */}
      {ownerColor && (
        <polygon
          points={hexPath}
          fill={ownerColor}
          opacity={0.35}
          stroke={ownerColor}
          strokeWidth={1.5}
        />
      )}
      
      {/* Selection glow */}
      {isSelected && (
        <polygon
          points={hexPath}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={4}
          opacity={0.5}
          filter="url(#province-glow)"
          className="animate-pulse"
        />
      )}
      
      {/* Capital marker */}
      {province.isCapital && (
        <g>
          <circle
            cx={pixel.x}
            cy={pixel.y}
            r={8}
            fill="#fbbf24"
            stroke="#1f2937"
            strokeWidth={2}
          />
          <text
            x={pixel.x}
            y={pixel.y + 4}
            textAnchor="middle"
            fontSize={10}
            fill="#1f2937"
          >
            ★
          </text>
        </g>
      )}
      
      {/* Fort indicator */}
      {province.fortLevel > 0 && !province.isCapital && (
        <rect
          x={pixel.x - 6}
          y={pixel.y - 6}
          width={12}
          height={12}
          fill="#6b7280"
          stroke="#1f2937"
          strokeWidth={1}
          rx={2}
        />
      )}
      
      {/* Silk Road marker */}
      {province.hasSilkRoad && (
        <circle
          cx={pixel.x + baseSize * 0.5}
          cy={pixel.y - baseSize * 0.5}
          r={5}
          fill="#f59e0b"
          stroke="#1f2937"
          strokeWidth={1}
          filter="url(#silk-road-glow)"
        />
      )}
      
      {/* Trade good icon (small) */}
      {province.tradeGood && (
        <text
          x={pixel.x - baseSize * 0.5}
          y={pixel.y + baseSize * 0.5}
          fontSize={10}
          fill="white"
          style={{ textShadow: '0 0 3px black' }}
        >
          {TRADE_GOODS_INFO[province.tradeGood].emoji}
        </text>
      )}
    </g>
  );
});

ProvinceTile.displayName = 'ProvinceTile';

// Minimap component
const Minimap = memo(({
  provinces,
  viewBox,
  playerFaction,
  onNavigate,
}: {
  provinces: Province[];
  viewBox: { x: number; y: number; width: number; height: number };
  playerFaction: FactionId;
  onNavigate: (x: number, y: number) => void;
}) => {
  const minimapRef = useRef<SVGSVGElement>(null);
  
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!minimapRef.current) return;
    const rect = minimapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * MAP_CONFIG.width;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_CONFIG.height;
    onNavigate(x, y);
  };
  
  return (
    <div className="absolute bottom-4 left-4 w-56 h-36 bg-stone-900/95 border-2 border-amber-700/50 rounded-lg overflow-hidden shadow-2xl">
      <svg
        ref={minimapRef}
        viewBox={`0 0 ${MAP_CONFIG.width} ${MAP_CONFIG.height}`}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Ocean background */}
        <rect width={MAP_CONFIG.width} height={MAP_CONFIG.height} fill="#1e3a5f" />
        
        {/* Land mass approximate */}
        <ellipse cx={600} cy={350} rx={500} ry={280} fill="#3d4a3a" opacity={0.6} />
        
        {/* Province dots */}
        {provinces.map(province => {
          const pixel = coordToPixel(province.center);
          const color = province.ownerId 
            ? FACTION_DATA_1206[province.ownerId]?.color 
            : '#6b7280';
          
          return (
            <circle
              key={province.id}
              cx={pixel.x}
              cy={pixel.y}
              r={4}
              fill={color}
              stroke="#1f2937"
              strokeWidth={0.5}
            />
          );
        })}
        
        {/* Viewport indicator */}
        <rect
          x={viewBox.x}
          y={viewBox.y}
          width={viewBox.width}
          height={viewBox.height}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
        />
      </svg>
      
      <div className="absolute top-1 left-2 text-xs text-amber-200/80 font-bold flex items-center gap-1">
        <Compass className="w-3 h-3" />
        KARTTA
      </div>
    </div>
  );
});

Minimap.displayName = 'Minimap';

// Province tooltip
const ProvinceTooltip = memo(({
  province,
  position,
}: {
  province: Province;
  position: { x: number; y: number };
}) => {
  const terrainInfo = PROVINCE_TERRAIN_INFO[province.terrain];
  const tradeGood = province.tradeGood ? TRADE_GOODS_INFO[province.tradeGood] : null;
  const owner = province.ownerId ? FACTION_DATA_1206[province.ownerId] : null;
  
  return (
    <div
      className="absolute z-50 pointer-events-none bg-stone-900/95 border-2 border-amber-700/60 rounded-xl p-4 shadow-2xl min-w-[220px] backdrop-blur-sm"
      style={{
        left: position.x + 20,
        top: position.y + 20,
        transform: position.x > window.innerWidth - 280 ? 'translateX(-100%)' : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-700/30">
        <span className="text-xl">{terrainInfo.emoji}</span>
        <div>
          <span className="text-amber-100 font-bold text-lg">{province.name}</span>
          {province.isCapital && <span className="ml-2 text-amber-400">👑</span>}
        </div>
      </div>
      
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Omistaja:</span>
          <span className="font-medium" style={{ color: owner?.color || '#9ca3af' }}>
            {owner?.name || 'Riippumaton'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Maasto:</span>
          <span className="text-stone-200">{terrainInfo.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Verot:</span>
          <span className="text-yellow-400">💰 {province.baseTax}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Miesvoima:</span>
          <span className="text-blue-400">👥 {province.baseManpower}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Kehitys:</span>
          <span className="text-green-400">⭐ {province.developmentLevel}</span>
        </div>
        
        {province.fortLevel > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-stone-400">Linnoitus:</span>
            <span className="text-stone-300">🏯 Taso {province.fortLevel}</span>
          </div>
        )}
        
        {tradeGood && (
          <div className="flex justify-between items-center pt-1 border-t border-stone-700">
            <span className="text-stone-400">Kauppatavara:</span>
            <span className="text-orange-300">{tradeGood.emoji} {tradeGood.name}</span>
          </div>
        )}
        
        {province.hasSilkRoad && (
          <div className="text-amber-400 text-xs mt-2 flex items-center gap-1">
            <span>🛤️</span>
            <span>Silkkitien varrella</span>
          </div>
        )}
        
        {province.isCoastal && (
          <div className="text-blue-400 text-xs flex items-center gap-1">
            <span>⚓</span>
            <span>Rannikko</span>
          </div>
        )}
      </div>
    </div>
  );
});

ProvinceTooltip.displayName = 'ProvinceTooltip';

export const CivilizationMap = ({
  provinces,
  selectedProvinceId,
  onProvinceClick,
  playerFaction,
  highlightedProvinces = [],
}: CivilizationMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate viewBox
  const viewBox = useMemo(() => {
    const width = MAP_CONFIG.width / zoom;
    const height = MAP_CONFIG.height / zoom;
    const x = (MAP_CONFIG.width - width) / 2 - pan.x / zoom;
    const y = (MAP_CONFIG.height - height) / 2 - pan.y / zoom;
    return { x, y, width, height };
  }, [zoom, pan]);

  // Zoom controls
  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev * 1.4, 4)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev / 1.4, 0.5)), []);
  const handleResetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(4, prev * delta)));
  }, []);

  // Navigate from minimap
  const handleMinimapNavigate = useCallback((x: number, y: number) => {
    setPan({
      x: (MAP_CONFIG.width / 2 - x) * zoom,
      y: (MAP_CONFIG.height / 2 - y) * zoom,
    });
  }, [zoom]);

  // Province pixel positions
  const provincePixels = useMemo(() => {
    return provinces.map(p => ({
      province: p,
      pixel: coordToPixel(p.center),
    }));
  }, [provinces]);

  // Silk road connections
  const silkRoadConnections = useMemo(() => {
    const connections: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
    const silkRoadProvinces = provinces.filter(p => p.hasSilkRoad);
    
    silkRoadProvinces.forEach(province => {
      province.neighbors.forEach(neighborId => {
        const neighbor = provinces.find(p => p.id === neighborId);
        if (neighbor?.hasSilkRoad && province.id < neighborId) {
          connections.push({
            from: coordToPixel(province.center),
            to: coordToPixel(neighbor.center),
          });
        }
      });
    });
    
    return connections;
  }, [provinces]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{ background: 'linear-gradient(135deg, #0f1f3a 0%, #1e3a5f 50%, #0f1f3a 100%)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <TerrainPatterns />
        
        {/* Ocean background */}
        <rect
          x={-100}
          y={-100}
          width={MAP_CONFIG.width + 200}
          height={MAP_CONFIG.height + 200}
          fill="url(#ocean-gradient)"
        />
        
        {/* Water bodies */}
        {WATER_BODIES.map(water => (
          <path
            key={water.id}
            d={water.path}
            fill={water.type === 'ocean' ? 'url(#ocean-gradient)' : 'url(#water-gradient)'}
            opacity={water.type === 'lake' ? 0.8 : 1}
          />
        ))}
        
        {/* Rivers */}
        {RIVERS.map(river => (
          <path
            key={river.id}
            d={river.path}
            fill="none"
            stroke="url(#river-gradient)"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.7}
          />
        ))}
        
        {/* Mountain ranges (behind provinces) */}
        {MOUNTAINS.map(mountain => (
          <g key={mountain.id}>
            <path
              d={mountain.path}
              fill="none"
              stroke={mountain.height === 'high' ? '#9ca3af' : '#6b7280'}
              strokeWidth={mountain.height === 'high' ? 15 : 10}
              strokeLinecap="round"
              opacity={0.3}
            />
            {mountain.height === 'high' && (
              <path
                d={mountain.path}
                fill="none"
                stroke="white"
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.4}
                filter="url(#snow-glow)"
              />
            )}
          </g>
        ))}
        
        {/* Silk Road connections */}
        {silkRoadConnections.map((conn, i) => (
          <line
            key={`silk-${i}`}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="8,4"
            opacity={0.5}
            filter="url(#silk-road-glow)"
          />
        ))}
        
        {/* Province tiles */}
        {provincePixels.map(({ province, pixel }) => (
          <ProvinceTile
            key={province.id}
            province={province}
            pixel={pixel}
            isSelected={province.id === selectedProvinceId}
            isHighlighted={highlightedProvinces.includes(province.id)}
            isPlayerOwned={province.ownerId === playerFaction}
            onClick={() => onProvinceClick(province.id)}
            onHover={setHoveredProvince}
          />
        ))}
        
        {/* Province labels (when zoomed) */}
        {zoom > 1.3 && provincePixels.map(({ province, pixel }) => (
          <text
            key={`label-${province.id}`}
            x={pixel.x}
            y={pixel.y + 35 + province.developmentLevel * 3}
            textAnchor="middle"
            fontSize={10}
            fill="#e2e8f0"
            className="pointer-events-none select-none"
            style={{ 
              textShadow: '0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)',
              fontWeight: province.isCapital ? 'bold' : 'normal',
            }}
          >
            {province.name}
          </text>
        ))}
        
        {/* Water body labels (when zoomed) */}
        {zoom > 1.5 && WATER_BODIES.filter(w => w.type !== 'ocean').map(water => {
          // Extract center from path (rough approximation)
          const match = water.path.match(/M\s*([\d.]+)\s*([\d.]+)/);
          if (!match) return null;
          return (
            <text
              key={`water-label-${water.id}`}
              x={parseFloat(match[1]) + 20}
              y={parseFloat(match[2]) + 20}
              textAnchor="middle"
              fontSize={11}
              fill="#60a5fa"
              fontStyle="italic"
              className="pointer-events-none"
              opacity={0.8}
            >
              {water.name}
            </text>
          );
        })}
      </svg>
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-stone-900/90 border-amber-700/50 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-stone-900/90 border-amber-700/50 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="bg-stone-900/90 border-amber-700/50 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Minimap */}
      <Minimap
        provinces={provinces}
        viewBox={viewBox}
        playerFaction={playerFaction}
        onNavigate={handleMinimapNavigate}
      />
      
      {/* Tooltip */}
      {hoveredProvince && (
        <ProvinceTooltip
          province={hoveredProvince}
          position={mousePosition}
        />
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-stone-900/90 border border-amber-700/30 rounded-lg p-3 text-xs">
        <div className="text-amber-200 font-bold mb-2">Selite</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-stone-300">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#a8b077' }} />
            <span>Steppi</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#8bc34a' }} />
            <span>Viljelymaa</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#2d5a27' }} />
            <span>Metsä</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#6b7280' }} />
            <span>Vuoristo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: '#d4a574' }} />
            <span>Aavikko</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Vesistö</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-stone-700 flex gap-3">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">👑</span>
            <span>Pääkaupunki</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-400">🛤️</span>
            <span>Silkkitie</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivilizationMap;
