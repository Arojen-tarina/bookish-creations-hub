import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Province, FactionId, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province';
import { ZoomIn, ZoomOut, Maximize2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProvinceMapProps {
  provinces: Province[];
  selectedProvinceId: string | null;
  onProvinceClick: (provinceId: string) => void;
  playerFaction: FactionId;
  highlightedProvinces?: string[];
  showArmies?: boolean;
}

// Map bounds for Eurasia (simplified view)
const MAP_BOUNDS = {
  minX: 5,
  maxX: 75,
  minY: 5,
  maxY: 60,
};

const MAP_WIDTH = MAP_BOUNDS.maxX - MAP_BOUNDS.minX;
const MAP_HEIGHT = MAP_BOUNDS.maxY - MAP_BOUNDS.minY;

// Calculate province polygon from center point (simplified hexagonal approximation)
const getProvincePolygon = (center: { x: number; y: number }, size: number = 2): string => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = center.x + size * Math.cos(angle);
    const y = center.y + size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

interface ProvincePolygonProps {
  province: Province;
  isSelected: boolean;
  isHighlighted: boolean;
  isPlayerOwned: boolean;
  onClick: () => void;
  onHover: (province: Province | null) => void;
}

const ProvincePolygon = ({
  province,
  isSelected,
  isHighlighted,
  isPlayerOwned,
  onClick,
  onHover,
}: ProvincePolygonProps) => {
  const terrainInfo = PROVINCE_TERRAIN_INFO[province.terrain];
  const ownerColor = province.ownerId ? FACTION_DATA_1206[province.ownerId]?.color : null;
  
  // Determine province size based on development
  const size = 1.5 + province.developmentLevel * 0.2;
  const polygon = getProvincePolygon(province.center, size);
  
  // Determine fill color
  let fillColor = terrainInfo.color;
  if (province.ownerId) {
    fillColor = ownerColor || fillColor;
  }
  
  // Stroke styling
  let strokeColor = '#374151';
  let strokeWidth = 0.15;
  
  if (isSelected) {
    strokeColor = '#fbbf24';
    strokeWidth = 0.4;
  } else if (isHighlighted) {
    strokeColor = '#22c55e';
    strokeWidth = 0.3;
  } else if (province.ownerId) {
    strokeColor = ownerColor || strokeColor;
    strokeWidth = 0.2;
  }
  
  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHover(province)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer transition-all duration-150"
    >
      {/* Province polygon */}
      <polygon
        points={polygon}
        fill={fillColor}
        fillOpacity={province.ownerId ? 0.7 : 0.5}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="transition-all duration-150 hover:brightness-110"
      />
      
      {/* Selection glow */}
      {isSelected && (
        <polygon
          points={polygon}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={0.6}
          strokeOpacity={0.5}
          className="animate-pulse"
        />
      )}
      
      {/* Capital marker */}
      {province.isCapital && (
        <circle
          cx={province.center.x}
          cy={province.center.y}
          r={0.5}
          fill="#fbbf24"
          stroke="#1f2937"
          strokeWidth={0.1}
        />
      )}
      
      {/* Fort indicator */}
      {province.fortLevel > 0 && (
        <rect
          x={province.center.x - 0.3}
          y={province.center.y - 0.3}
          width={0.6}
          height={0.6}
          fill="#6b7280"
          stroke="#1f2937"
          strokeWidth={0.05}
        />
      )}
      
      {/* Silk Road indicator */}
      {province.hasSilkRoad && (
        <circle
          cx={province.center.x + 0.8}
          cy={province.center.y - 0.8}
          r={0.3}
          fill="#f59e0b"
          fillOpacity={0.8}
        />
      )}
    </g>
  );
};

// Minimap component
const Minimap = ({
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
    const x = ((e.clientX - rect.left) / rect.width) * MAP_WIDTH + MAP_BOUNDS.minX;
    const y = ((e.clientY - rect.top) / rect.height) * MAP_HEIGHT + MAP_BOUNDS.minY;
    
    onNavigate(x, y);
  };
  
  return (
    <div className="absolute bottom-4 left-4 w-48 h-32 bg-stone-900/90 border border-amber-700/30 rounded-lg overflow-hidden shadow-xl">
      <svg
        ref={minimapRef}
        viewBox={`${MAP_BOUNDS.minX} ${MAP_BOUNDS.minY} ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Background */}
        <rect
          x={MAP_BOUNDS.minX}
          y={MAP_BOUNDS.minY}
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          fill="#1e293b"
        />
        
        {/* Provinces (simplified) */}
        {provinces.map(province => {
          const color = province.ownerId 
            ? FACTION_DATA_1206[province.ownerId]?.color 
            : '#475569';
          
          return (
            <circle
              key={province.id}
              cx={province.center.x}
              cy={province.center.y}
              r={0.8}
              fill={color}
              fillOpacity={0.8}
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
          strokeWidth={0.5}
        />
      </svg>
      
      <div className="absolute top-1 left-1 text-[8px] text-amber-200/60 font-bold">
        KARTTA
      </div>
    </div>
  );
};

// Tooltip component
const ProvinceTooltip = ({
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
      className="absolute z-50 pointer-events-none bg-stone-900/95 border border-amber-700/50 rounded-lg p-3 shadow-2xl min-w-[200px]"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        transform: position.x > window.innerWidth - 250 ? 'translateX(-100%)' : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{terrainInfo.emoji}</span>
        <span className="text-amber-100 font-bold">{province.name}</span>
        {province.isCapital && <span className="text-amber-400">👑</span>}
      </div>
      
      <div className="space-y-1 text-sm text-stone-300">
        <div className="flex justify-between">
          <span>Omistaja:</span>
          <span style={{ color: owner?.color }}>
            {owner?.name || 'Neutraali'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Maasto:</span>
          <span>{terrainInfo.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Verot:</span>
          <span>💰 {province.baseTax}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Miesvoima:</span>
          <span>👥 {province.baseManpower}</span>
        </div>
        
        {province.fortLevel > 0 && (
          <div className="flex justify-between">
            <span>Linnoitus:</span>
            <span>🏯 Taso {province.fortLevel}</span>
          </div>
        )}
        
        {tradeGood && (
          <div className="flex justify-between">
            <span>Kauppatavara:</span>
            <span>{tradeGood.emoji} {tradeGood.name}</span>
          </div>
        )}
        
        {province.hasSilkRoad && (
          <div className="text-amber-400 text-xs mt-1">
            🛤️ Silkkitien varrella
          </div>
        )}
        
        {province.unrest > 0 && (
          <div className="text-red-400 text-xs mt-1">
            ⚠️ Levottomuus: {province.unrest}%
          </div>
        )}
      </div>
    </div>
  );
};

export const ProvinceMap = ({
  provinces,
  selectedProvinceId,
  onProvinceClick,
  playerFaction,
  highlightedProvinces = [],
}: ProvinceMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate viewBox based on zoom and pan
  const viewBox = useMemo(() => {
    const baseWidth = MAP_WIDTH;
    const baseHeight = MAP_HEIGHT;
    const width = baseWidth / zoom;
    const height = baseHeight / zoom;
    const x = MAP_BOUNDS.minX + (baseWidth - width) / 2 - pan.x / zoom;
    const y = MAP_BOUNDS.minY + (baseHeight - height) / 2 - pan.y / zoom;
    
    return { x, y, width, height };
  }, [zoom, pan]);

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev * delta)));
  }, []);

  // Navigate from minimap
  const handleMinimapNavigate = useCallback((x: number, y: number) => {
    const centerX = MAP_BOUNDS.minX + MAP_WIDTH / 2;
    const centerY = MAP_BOUNDS.minY + MAP_HEIGHT / 2;
    setPan({
      x: (centerX - x) * zoom,
      y: (centerY - y) * zoom,
    });
  }, [zoom]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Map SVG */}
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Definitions */}
        <defs>
          <filter id="map-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ocean/background */}
        <rect
          x={MAP_BOUNDS.minX - 5}
          y={MAP_BOUNDS.minY - 5}
          width={MAP_WIDTH + 10}
          height={MAP_HEIGHT + 10}
          fill="#1e3a5f"
        />
        
        {/* Province connections (roads) */}
        {provinces.filter(p => p.hasSilkRoad).map(province => (
          province.neighbors
            .filter(nId => provinces.find(p => p.id === nId)?.hasSilkRoad)
            .map(neighborId => {
              const neighbor = provinces.find(p => p.id === neighborId);
              if (!neighbor || province.id > neighborId) return null;
              
              return (
                <line
                  key={`${province.id}-${neighborId}`}
                  x1={province.center.x}
                  y1={province.center.y}
                  x2={neighbor.center.x}
                  y2={neighbor.center.y}
                  stroke="#f59e0b"
                  strokeWidth={0.2}
                  strokeOpacity={0.4}
                  strokeDasharray="0.5,0.3"
                />
              );
            })
        ))}
        
        {/* Province polygons */}
        <g filter="url(#map-glow)">
          {provinces.map(province => (
            <ProvincePolygon
              key={province.id}
              province={province}
              isSelected={province.id === selectedProvinceId}
              isHighlighted={highlightedProvinces.includes(province.id)}
              isPlayerOwned={province.ownerId === playerFaction}
              onClick={() => onProvinceClick(province.id)}
              onHover={setHoveredProvince}
            />
          ))}
        </g>
        
        {/* Province labels (only when zoomed in) */}
        {zoom > 1.5 && provinces.map(province => (
          <text
            key={`label-${province.id}`}
            x={province.center.x}
            y={province.center.y + 2.5}
            textAnchor="middle"
            fontSize={0.8}
            fill="#e2e8f0"
            fillOpacity={0.8}
            className="pointer-events-none select-none"
            style={{ textShadow: '0 0 2px rgba(0,0,0,0.8)' }}
          >
            {province.name}
          </text>
        ))}
      </svg>
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800"
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
      
      {/* Province tooltip */}
      {hoveredProvince && (
        <ProvinceTooltip
          province={hoveredProvince}
          position={mousePosition}
        />
      )}
      
      {/* Map info */}
      <div className="absolute top-4 left-4 bg-stone-900/80 border border-amber-700/30 rounded-lg px-3 py-2 text-sm text-amber-200/80">
        <span className="font-bold">Vuosi 1206</span>
        <span className="mx-2">•</span>
        <span>{provinces.filter(p => p.ownerId === playerFaction).length} provinssia</span>
      </div>
    </div>
  );
};
