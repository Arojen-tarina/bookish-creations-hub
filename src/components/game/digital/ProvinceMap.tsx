/**
 * ProvinceMap.tsx — Kuvitettu pelilautakartta
 * 
 * Käyttää kuvitettua lautapelikuvaa taustana ja renderöi provinssit
 * interaktiivisina pelinappuloina laudan päälle.
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import { Province, FactionId, Army, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import gameBoardImg from '@/assets/game-board.jpg';

const BOARD_SIZE = 100;

export interface ProvinceMapProps {
  provinces: Province[];
  armies: Army[];
  selectedProvinceId: string | null;
  selectedArmyId?: string | null;
  onProvinceClick: (provinceId: string) => void;
  onArmyClick?: (armyId: string) => void;
  playerFaction: FactionId;
  highlightedProvinces?: string[];
  showArmies?: boolean;
  isMinimap?: boolean;
}

const TOKEN_RADIUS = 2.2;

const ProvinceToken = ({
  province,
  isSelected,
  isHighlighted,
  isPlayerOwned,
  onClick,
  onHover,
}: {
  province: Province;
  isSelected: boolean;
  isHighlighted: boolean;
  isPlayerOwned: boolean;
  onClick: () => void;
  onHover: (p: Province | null) => void;
}) => {
  const ownerColor = province.ownerId ? FACTION_DATA_1206[province.ownerId]?.color : '#888';
  const r = TOKEN_RADIUS + (province.isCapital ? 0.5 : 0);

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHover(province)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
    >
      {/* Shadow */}
      <circle
        cx={province.center.x + 0.3}
        cy={province.center.y + 0.3}
        r={r}
        fill="rgba(0,0,0,0.4)"
      />

      {/* Token base */}
      <circle
        cx={province.center.x}
        cy={province.center.y}
        r={r}
        fill={ownerColor}
        stroke={isSelected ? '#fbbf24' : isHighlighted ? '#22c55e' : '#1a1a1a'}
        strokeWidth={isSelected ? 0.6 : 0.3}
        opacity={0.9}
      />

      {/* Inner detail */}
      <circle
        cx={province.center.x}
        cy={province.center.y}
        r={r * 0.6}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={0.15}
      />

      {/* Selection pulse */}
      {isSelected && (
        <circle
          cx={province.center.x}
          cy={province.center.y}
          r={r + 0.8}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={0.25}
          opacity={0.7}
          className="animate-pulse"
        />
      )}

      {/* Capital crown */}
      {province.isCapital && (
        <text
          x={province.center.x}
          y={province.center.y + 0.5}
          textAnchor="middle"
          fontSize={2}
          className="pointer-events-none select-none"
        >
          👑
        </text>
      )}

      {/* Garrison indicator */}
      {province.garrison > 0 && !province.isCapital && (
        <text
          x={province.center.x}
          y={province.center.y + 0.6}
          textAnchor="middle"
          fontSize={1.6}
          fill="#fff"
          fontWeight="bold"
          className="pointer-events-none select-none"
          style={{ textShadow: '0 0 2px rgba(0,0,0,0.8)' }}
        >
          ⚔
        </text>
      )}

      {/* Fort marker */}
      {province.fortLevel > 0 && (
        <rect
          x={province.center.x + r * 0.5}
          y={province.center.y - r * 0.9}
          width={1.2}
          height={1.2}
          rx={0.15}
          fill="#4a5568"
          stroke="#1a1a1a"
          strokeWidth={0.1}
        />
      )}

      {/* Silk Road marker */}
      {province.hasSilkRoad && (
        <circle
          cx={province.center.x + r * 0.6}
          cy={province.center.y + r * 0.6}
          r={0.5}
          fill="#f59e0b"
          stroke="#92400e"
          strokeWidth={0.1}
        />
      )}
    </g>
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
      className="absolute z-50 pointer-events-none bg-stone-900/95 border-2 border-amber-700/60 rounded-lg p-3 shadow-2xl min-w-[220px]"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        transform: position.x > window.innerWidth - 260 ? 'translateX(-110%)' : undefined,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{terrainInfo.emoji}</span>
        <span className="text-amber-100 font-bold text-sm">{province.name}</span>
        {province.isCapital && <span className="text-amber-400">👑</span>}
      </div>
      <div className="space-y-1 text-xs text-stone-300">
        <div className="flex justify-between">
          <span>Omistaja:</span>
          <span style={{ color: owner?.color }}>{owner?.name || 'Neutraali'}</span>
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
          <div className="text-amber-400 text-xs mt-1">🛤️ Silkkitien varrella</div>
        )}
        {province.unrest > 0 && (
          <div className="text-red-400 text-xs mt-1">⚠️ Levottomuus: {province.unrest}%</div>
        )}
      </div>
    </div>
  );
};

// Minimap
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
  const ref = useRef<SVGSVGElement>(null);
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * BOARD_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * BOARD_SIZE;
    onNavigate(x, y);
  };

  return (
    <div className="absolute bottom-4 left-4 w-40 h-40 bg-stone-900/90 border-2 border-amber-700/40 rounded-lg overflow-hidden shadow-xl">
      <svg ref={ref} viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`} className="w-full h-full cursor-pointer" onClick={handleClick}>
        <image href={gameBoardImg} x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} />
        {provinces.map(p => (
          <circle
            key={p.id}
            cx={p.center.x}
            cy={p.center.y}
            r={1.2}
            fill={p.ownerId ? FACTION_DATA_1206[p.ownerId]?.color : '#666'}
            fillOpacity={0.9}
          />
        ))}
        <rect
          x={viewBox.x} y={viewBox.y}
          width={viewBox.width} height={viewBox.height}
          fill="none" stroke="#fbbf24" strokeWidth={0.8}
        />
      </svg>
      <div className="absolute top-1 left-1 text-[8px] text-amber-200/60 font-bold">KARTTA</div>
    </div>
  );
};

export const ProvinceMap = ({
  provinces,
  armies,
  selectedProvinceId,
  selectedArmyId,
  onProvinceClick,
  onArmyClick,
  playerFaction,
  highlightedProvinces = [],
  isMinimap = false,
}: ProvinceMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const defaultView = { x: 0, y: 0, width: BOARD_SIZE, height: BOARD_SIZE };

  const viewBox = useMemo(() => {
    const w = defaultView.width / zoom;
    const h = defaultView.height / zoom;
    const x = (BOARD_SIZE - w) / 2 - pan.x / zoom;
    const y = (BOARD_SIZE - h) / 2 - pan.y / zoom;
    return { x, y, width: w, height: h };
  }, [zoom, pan]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.4, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.4, 0.8));
  const handleResetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.8, Math.min(4, prev * delta)));
  }, []);

  const handleMinimapNavigate = useCallback((x: number, y: number) => {
    setPan({
      x: (BOARD_SIZE / 2 - x) * zoom,
      y: (BOARD_SIZE / 2 - y) * zoom,
    });
  }, [zoom]);

  // Silk road connections
  const silkRoadLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const silkProvinces = provinces.filter(p => p.hasSilkRoad);
    for (const prov of silkProvinces) {
      for (const nId of prov.neighbors) {
        const neighbor = provinces.find(p => p.id === nId);
        if (neighbor?.hasSilkRoad && prov.id < nId) {
          lines.push({
            x1: prov.center.x, y1: prov.center.y,
            x2: neighbor.center.x, y2: neighbor.center.y,
          });
        }
      }
    }
    return lines;
  }, [provinces]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseDown={isMinimap ? undefined : handleMouseDown}
      onMouseMove={isMinimap ? undefined : handleMouseMove}
      onMouseUp={isMinimap ? undefined : handleMouseUp}
      onMouseLeave={isMinimap ? undefined : handleMouseUp}
      onWheel={isMinimap ? undefined : handleWheel}
      style={{
        background: '#1a1a2e',
        ...(isMinimap ? {} : {
          border: '6px solid #5c4a32',
          borderImage: 'linear-gradient(135deg, #8b6914, #c9a227, #8b6914, #5c3a1e) 1',
        }),
      }}
    >
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-full"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Board image */}
        <image
          href={gameBoardImg}
          x={0} y={0}
          width={BOARD_SIZE} height={BOARD_SIZE}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Silk Road routes */}
        {silkRoadLines.map((l, i) => (
          <line
            key={`silk-${i}`}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#c9342b"
            strokeWidth={0.5}
            strokeOpacity={0.7}
            strokeDasharray="1.2,0.6"
          />
        ))}

        {/* Province tokens */}
        {provinces.map(province => (
          <ProvinceToken
            key={province.id}
            province={province}
            isSelected={province.id === selectedProvinceId}
            isHighlighted={highlightedProvinces.includes(province.id)}
            isPlayerOwned={province.ownerId === playerFaction}
            onClick={() => onProvinceClick(province.id)}
            onHover={setHoveredProvince}
          />
        ))}

        {/* Army markers */}
        {!isMinimap && armies.map(army => {
          const province = provinces.find(p => p.id === army.provinceId);
          if (!province) return null;
          const ownerColor = FACTION_DATA_1206[army.ownerId]?.color || '#888';
          const isSelected = army.id === selectedArmyId;
          const isPlayer = army.ownerId === playerFaction;
          // Offset if multiple armies in same province
          const sameProvArmies = armies.filter(a => a.provinceId === army.provinceId);
          const idx = sameProvArmies.indexOf(army);
          const offsetX = idx * 3.5 - (sameProvArmies.length - 1) * 1.75;
          const ax = province.center.x + offsetX;
          const ay = province.center.y - 3.5;

          return (
            <g
              key={army.id}
              onClick={(e) => { e.stopPropagation(); onArmyClick?.(army.id); }}
              className="cursor-pointer"
            >
              {/* Glow */}
              <circle cx={ax} cy={ay} r={2.8} fill={ownerColor} opacity={0.3} />
              {/* Selection ring */}
              {isSelected && (
                <circle cx={ax} cy={ay} r={3.2} fill="none" stroke="#fbbf24" strokeWidth={0.4} className="animate-pulse" />
              )}
              {/* Body */}
              <circle
                cx={ax} cy={ay} r={2.2}
                fill={ownerColor}
                stroke={isSelected ? '#fbbf24' : isPlayer ? '#fbbf24' : '#1a1a1a'}
                strokeWidth={isSelected ? 0.5 : 0.25}
              />
              {/* Icon */}
              <text x={ax} y={ay + 0.7} textAnchor="middle" fontSize={2.2} className="pointer-events-none select-none">
                {army.cavalry > army.infantry ? '🐴' : '⚔️'}
              </text>
              {/* Unit count badge */}
              <rect x={ax - 2.5} y={ay + 2.5} width={5} height={1.8} rx={0.9} fill="rgba(0,0,0,0.85)" stroke={ownerColor} strokeWidth={0.15} />
              <text x={ax} y={ay + 3.8} textAnchor="middle" fontSize={1} fontWeight="bold" fill="white" className="pointer-events-none select-none">
                {army.cavalry + army.infantry}
              </text>
              {/* Movement dot */}
              {isPlayer && (
                <circle cx={ax + 1.8} cy={ay - 1.8} r={0.7} fill={army.movementLeft > 0 ? '#22c55e' : '#ef4444'} stroke="#1a1a1a" strokeWidth={0.15} />
              )}
            </g>
          );
        })}

        {/* Province labels when zoomed */}
        {zoom > 1.5 && provinces.map(province => (
          <text
            key={`label-${province.id}`}
            x={province.center.x}
            y={province.center.y + 4}
            textAnchor="middle"
            fontSize={1.4}
            fill="#f5e6c8"
            fontWeight="bold"
            className="pointer-events-none select-none"
            style={{ textShadow: '0 0 3px rgba(0,0,0,0.9)' }}
          >
            {province.name}
          </text>
        ))}
      </svg>

      {/* Zoom controls */}
      {!isMinimap && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}
            className="bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}
            className="bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleResetView}
            className="bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Minimap */}
      {!isMinimap && (
        <Minimap
          provinces={provinces}
          viewBox={viewBox}
          playerFaction={playerFaction}
          onNavigate={handleMinimapNavigate}
        />
      )}

      {/* Tooltip */}
      {!isMinimap && hoveredProvince && (
        <ProvinceTooltip province={hoveredProvince} position={mousePosition} />
      )}

      {/* Info bar */}
      {!isMinimap && (
        <div className="absolute top-4 left-4 bg-stone-900/85 border-2 border-amber-700/40 rounded-lg px-4 py-2 text-sm text-amber-200/90">
          <span className="font-bold">Vuosi 1206</span>
          <span className="mx-2">•</span>
          <span>{provinces.filter(p => p.ownerId === playerFaction).length} provinssia</span>
        </div>
      )}
    </div>
  );
};
