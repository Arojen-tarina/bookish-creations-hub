/**
 * GeoProvinceMap.tsx — GeoJSON-pohjainen provinssikartta (d3-geo)
 *
 * SVG-kartta Mercator-projektiolla. Näyttää provinssit monikulmioina
 * väritettynä omistajan/maaston mukaan. Tukee zoom/pan, armeijanäkymä,
 * hyökkäyskohteet ja Silkkitien reitti.
 */
import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { geoMercator, geoPath, GeoPath, GeoPermissibleObjects } from 'd3-geo';
import { Province, FactionId, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province';
import { EURASIA_1206_GEOJSON, ProvinceProperties, PROVINCE_ADJACENCY_GRAPH } from '@/data/eurasia-1206.geojson';
import { ZoomIn, ZoomOut, Maximize2, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Feature, Polygon } from 'geojson';

interface GeoProvinceMapProps {
  provinces: Province[];
  selectedProvinceId: string | null;
  onProvinceClick: (provinceId: string) => void;
  playerFaction: FactionId;
  highlightedProvinces?: string[];
}

// Map projection settings
const MAP_CENTER: [number, number] = [80, 40]; // Central Asia
const MAP_SCALE = 280;

// Province polygon component
const ProvincePolygon = memo(({
  feature,
  provinceState,
  path,
  isSelected,
  isHighlighted,
  isPlayerOwned,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  feature: Feature<Polygon, ProvinceProperties>;
  provinceState: Province | undefined;
  path: GeoPath<unknown, GeoPermissibleObjects>;
  isSelected: boolean;
  isHighlighted: boolean;
  isPlayerOwned: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const props = feature.properties;
  const terrainInfo = PROVINCE_TERRAIN_INFO[props.terrain];
  
  // Get current owner from game state or fall back to default
  const currentOwner = provinceState?.ownerId || props.ownerId;
  const ownerColor = currentOwner ? FACTION_DATA_1206[currentOwner]?.color : null;
  
  // Determine fill color
  let fillColor = terrainInfo?.color || '#4a5568';
  if (currentOwner) {
    fillColor = ownerColor || fillColor;
  }
  
  // Stroke styling
  let strokeColor = '#1f2937';
  let strokeWidth = 0.5;
  
  if (isSelected) {
    strokeColor = '#fbbf24';
    strokeWidth = 2;
  } else if (isHighlighted) {
    strokeColor = '#22c55e';
    strokeWidth = 1.5;
  } else if (currentOwner) {
    strokeColor = '#374151';
    strokeWidth = 0.7;
  }
  
  const pathD = path(feature) || '';
  
  return (
    <g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer"
    >
      {/* Province shape */}
      <path
        d={pathD}
        fill={fillColor}
        fillOpacity={currentOwner ? 0.75 : 0.5}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="transition-all duration-150 hover:brightness-110"
      />
      
      {/* Selection glow */}
      {isSelected && (
        <path
          d={pathD}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={3}
          strokeOpacity={0.4}
          className="animate-pulse"
        />
      )}
      
      {/* Capital marker */}
      {props.isCapital && (
        <circle
          cx={path.centroid(feature)[0]}
          cy={path.centroid(feature)[1]}
          r={4}
          fill="#fbbf24"
          stroke="#1f2937"
          strokeWidth={1}
        />
      )}
      
      {/* Fort indicator */}
      {(provinceState?.fortLevel || props.fortLevel) > 0 && (
        <rect
          x={path.centroid(feature)[0] - 3}
          y={path.centroid(feature)[1] + 5}
          width={6}
          height={6}
          fill="#6b7280"
          stroke="#1f2937"
          strokeWidth={0.5}
        />
      )}
      
      {/* Silk Road indicator */}
      {props.hasSilkRoad && (
        <circle
          cx={path.centroid(feature)[0] + 8}
          cy={path.centroid(feature)[1] - 8}
          r={3}
          fill="#f59e0b"
          fillOpacity={0.9}
        />
      )}
    </g>
  );
});

ProvincePolygon.displayName = 'ProvincePolygon';

// Tooltip component
const ProvinceTooltip = ({
  feature,
  provinceState,
  position,
}: {
  feature: Feature<Polygon, ProvinceProperties>;
  provinceState: Province | undefined;
  position: { x: number; y: number };
}) => {
  const props = feature.properties;
  const terrainInfo = PROVINCE_TERRAIN_INFO[props.terrain];
  const tradeGood = props.tradeGood ? TRADE_GOODS_INFO[props.tradeGood] : null;
  const currentOwner = provinceState?.ownerId || props.ownerId;
  const owner = currentOwner ? FACTION_DATA_1206[currentOwner] : null;
  
  return (
    <div
      className="absolute z-50 pointer-events-none bg-stone-900/95 border border-amber-700/50 rounded-lg p-3 shadow-2xl min-w-[200px] max-w-[280px]"
      style={{
        left: Math.min(position.x + 15, window.innerWidth - 300),
        top: Math.min(position.y + 15, window.innerHeight - 200),
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{terrainInfo?.emoji || '🏔️'}</span>
        <span className="text-amber-100 font-bold">{props.name}</span>
        {props.isCapital && <span className="text-amber-400">👑</span>}
      </div>
      
      <div className="space-y-1 text-sm text-stone-300">
        <div className="flex justify-between">
          <span>Omistaja:</span>
          <span style={{ color: owner?.color || '#9ca3af' }}>
            {owner?.name || 'Neutraali'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Maasto:</span>
          <span>{terrainInfo?.name || props.terrain}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Verot:</span>
          <span>💰 {provinceState?.baseTax || props.baseTax}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Miesvoima:</span>
          <span>👥 {provinceState?.baseManpower || props.baseManpower}</span>
        </div>
        
        {(provinceState?.fortLevel || props.fortLevel) > 0 && (
          <div className="flex justify-between">
            <span>Linnoitus:</span>
            <span>🏯 Taso {provinceState?.fortLevel || props.fortLevel}</span>
          </div>
        )}
        
        {tradeGood && (
          <div className="flex justify-between">
            <span>Kauppatavara:</span>
            <span>{tradeGood.emoji} {tradeGood.name}</span>
          </div>
        )}
        
        {props.hasSilkRoad && (
          <div className="text-amber-400 text-xs mt-1">
            🛤️ Silkkitien varrella
          </div>
        )}
        
        {(provinceState?.unrest || 0) > 0 && (
          <div className="text-red-400 text-xs mt-1">
            ⚠️ Levottomuus: {provinceState?.unrest}%
          </div>
        )}
      </div>
    </div>
  );
};

// Minimap component
const Minimap = ({
  provinces,
  path,
  viewTransform,
  playerFaction,
  onNavigate,
}: {
  provinces: Province[];
  path: GeoPath<unknown, GeoPermissibleObjects>;
  viewTransform: { x: number; y: number; scale: number };
  playerFaction: FactionId;
  onNavigate: (x: number, y: number) => void;
}) => {
  const minimapRef = useRef<SVGSVGElement>(null);
  
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!minimapRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 800;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 500;
    
    onNavigate(-x * viewTransform.scale, -y * viewTransform.scale);
  };
  
  return (
    <div className="absolute bottom-4 left-4 w-48 h-32 bg-stone-900/90 border border-amber-700/30 rounded-lg overflow-hidden shadow-xl">
      <svg
        ref={minimapRef}
        viewBox="0 0 800 500"
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      >
        {/* Background */}
        <rect width="800" height="500" fill="#1e293b" />
        
        {/* Provinces (simplified) */}
        {EURASIA_1206_GEOJSON.features.map(feature => {
          const provinceState = provinces.find(p => p.id === feature.properties.id);
          const ownerId = provinceState?.ownerId || feature.properties.ownerId;
          const color = ownerId 
            ? FACTION_DATA_1206[ownerId]?.color 
            : '#475569';
          
          return (
            <path
              key={feature.properties.id}
              d={path(feature) || ''}
              fill={color}
              fillOpacity={0.7}
              stroke="#374151"
              strokeWidth={0.3}
            />
          );
        })}
        
        {/* Viewport indicator */}
        <rect
          x={400 - (200 / viewTransform.scale) + viewTransform.x / viewTransform.scale}
          y={250 - (125 / viewTransform.scale) + viewTransform.y / viewTransform.scale}
          width={400 / viewTransform.scale}
          height={250 / viewTransform.scale}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
        />
      </svg>
      
      <div className="absolute top-1 left-1 text-[8px] text-amber-200/60 font-bold uppercase tracking-wider">
        Kartta
      </div>
    </div>
  );
};

export const GeoProvinceMap = ({
  provinces,
  selectedProvinceId,
  onProvinceClick,
  playerFaction,
  highlightedProvinces = [],
}: GeoProvinceMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState<Feature<Polygon, ProvinceProperties> | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Create projection and path generator
  const { projection, path } = useMemo(() => {
    const proj = geoMercator()
      .center(MAP_CENTER)
      .scale(MAP_SCALE * transform.scale)
      .translate([
        dimensions.width / 2 + transform.x,
        dimensions.height / 2 + transform.y,
      ]);
    
    const pathGen = geoPath(proj);
    
    return { projection: proj, path: pathGen };
  }, [dimensions, transform]);
  
  // Zoom controls
  const handleZoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.5, 5) }));
  };
  
  const handleZoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.5, 0.3) }));
  };
  
  const handleResetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };
  
  const handleCenterOnCapital = () => {
    const playerFactionData = FACTION_DATA_1206[playerFaction];
    const capitalFeature = EURASIA_1206_GEOJSON.features.find(
      f => f.properties.isCapital && f.properties.ownerId === playerFaction
    );
    
    if (capitalFeature) {
      const centroid = path.centroid(capitalFeature);
      setTransform(prev => ({
        ...prev,
        x: dimensions.width / 2 - centroid[0],
        y: dimensions.height / 2 - centroid[1],
      }));
    }
  };
  
  // Pan handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  }, [transform]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(5, prev.scale * delta)),
    }));
  }, []);
  
  // Navigate from minimap
  const handleMinimapNavigate = useCallback((x: number, y: number) => {
    setTransform(prev => ({ ...prev, x, y }));
  }, []);
  
  // Get province state by ID
  const getProvinceState = useCallback((id: string): Province | undefined => {
    return provinces.find(p => p.id === id);
  }, [provinces]);
  
  // Draw Silk Road connections
  const silkRoadPaths = useMemo(() => {
    const lines: JSX.Element[] = [];
    
    EURASIA_1206_GEOJSON.features
      .filter(f => f.properties.hasSilkRoad)
      .forEach(feature => {
        const neighbors = PROVINCE_ADJACENCY_GRAPH[feature.properties.id] || [];
        neighbors.forEach(neighborId => {
          const neighborFeature = EURASIA_1206_GEOJSON.features.find(
            f => f.properties.id === neighborId && f.properties.hasSilkRoad
          );
          
          if (neighborFeature && feature.properties.id < neighborId) {
            const start = path.centroid(feature);
            const end = path.centroid(neighborFeature);
            
            if (start && end && !isNaN(start[0]) && !isNaN(end[0])) {
              lines.push(
                <line
                  key={`silk-${feature.properties.id}-${neighborId}`}
                  x1={start[0]}
                  y1={start[1]}
                  x2={end[0]}
                  y2={end[1]}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeOpacity={0.4}
                  strokeDasharray="6,3"
                />
              );
            }
          }
        });
      });
    
    return lines;
  }, [path]);
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Main Map SVG */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Definitions */}
        <defs>
          <filter id="province-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Ocean gradient */}
          <linearGradient id="ocean-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="50%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        
        {/* Ocean background */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="url(#ocean-gradient)"
        />
        
        {/* Grid lines (for reference) */}
        {transform.scale > 0.8 && (
          <g opacity={0.1}>
            {Array.from({ length: 20 }, (_, i) => {
              const lon = 30 + i * 10;
              const [x] = projection([lon, 40]) || [0];
              return (
                <line
                  key={`lon-${lon}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={dimensions.height}
                  stroke="#fbbf24"
                  strokeWidth={0.5}
                />
              );
            })}
          </g>
        )}
        
        {/* Silk Road connections */}
        <g opacity={0.6}>{silkRoadPaths}</g>
        
        {/* Province polygons */}
        <g filter="url(#province-glow)">
          {EURASIA_1206_GEOJSON.features.map(feature => {
            const provinceState = getProvinceState(feature.properties.id);
            
            return (
              <ProvincePolygon
                key={feature.properties.id}
                feature={feature}
                provinceState={provinceState}
                path={path}
                isSelected={feature.properties.id === selectedProvinceId}
                isHighlighted={highlightedProvinces.includes(feature.properties.id)}
                isPlayerOwned={
                  (provinceState?.ownerId || feature.properties.ownerId) === playerFaction
                }
                onClick={() => onProvinceClick(feature.properties.id)}
                onMouseEnter={() => setHoveredFeature(feature)}
                onMouseLeave={() => setHoveredFeature(null)}
              />
            );
          })}
        </g>
        
        {/* Province labels (when zoomed in) */}
        {transform.scale > 1.2 && EURASIA_1206_GEOJSON.features.map(feature => {
          const centroid = path.centroid(feature);
          if (!centroid || isNaN(centroid[0])) return null;
          
          return (
            <text
              key={`label-${feature.properties.id}`}
              x={centroid[0]}
              y={centroid[1] + 15}
              textAnchor="middle"
              fontSize={10 / transform.scale + 6}
              fill="#e2e8f0"
              fillOpacity={0.9}
              className="pointer-events-none select-none"
              style={{ 
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.5)',
                fontWeight: 500,
              }}
            >
              {feature.properties.name}
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
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleCenterOnCapital}
          className="bg-stone-900/80 border-amber-700/30 text-amber-200 hover:bg-stone-800 hover:border-amber-600"
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Zoom level indicator */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/80 border border-amber-700/30 rounded text-amber-200 text-sm">
        {Math.round(transform.scale * 100)}%
      </div>
      
      {/* Minimap */}
      <Minimap
        provinces={provinces}
        path={path}
        viewTransform={transform}
        playerFaction={playerFaction}
        onNavigate={handleMinimapNavigate}
      />
      
      {/* Tooltip */}
      {hoveredFeature && (
        <ProvinceTooltip
          feature={hoveredFeature}
          provinceState={getProvinceState(hoveredFeature.properties.id)}
          position={mousePosition}
        />
      )}
    </div>
  );
};
