/**
 * ProvinceMap.tsx — Kuvitettu pelilautakartta
 * 
 * Käyttää kuvitettua lautapelikuvaa taustana ja renderöi provinssit
 * interaktiivisina pelinappuloina laudan päälle.
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import { Province, FactionId, Army, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province.ts';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
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
const HEX_SPREAD = 1.12;
const projectPoint = (x: number, y: number) => ({
  x: 50 + (x - 50) * HEX_SPREAD,
  y: 50 + (y - 50) * HEX_SPREAD,
});

// Coordinate Grid Component
const CoordinateGrid = ({ showGrid }: { showGrid: boolean }) => {
  if (!showGrid) return null;

  const gridInterval = 10;
  const gridLines: JSX.Element[] = [];
  
  // Vertical lines (X axis)
  for (let x = 0; x <= BOARD_SIZE; x += gridInterval) {
    gridLines.push(
      <line
        key={`vline-${x}`}
        x1={x} y1={0} x2={x} y2={BOARD_SIZE}
        stroke="#4a5568"
        strokeWidth={0.15}
        opacity={x % 20 === 0 ? 0.4 : 0.25}
        pointerEvents="none"
      />
    );
  }

  // Horizontal lines (Y axis)
  for (let y = 0; y <= BOARD_SIZE; y += gridInterval) {
    gridLines.push(
      <line
        key={`hline-${y}`}
        x1={0} y1={y} x2={BOARD_SIZE} y2={y}
        stroke="#4a5568"
        strokeWidth={0.15}
        opacity={y % 20 === 0 ? 0.4 : 0.25}
        pointerEvents="none"
      />
    );
  }

  // X axis labels (bottom)
  for (let x = 0; x <= BOARD_SIZE; x += 20) {
    gridLines.push(
      <text
        key={`xlabel-${x}`}
        x={x} y={BOARD_SIZE + 2}
        textAnchor="middle"
        fontSize={1.8}
        fill="#c9a227"
        fontWeight="bold"
        opacity={0.6}
        pointerEvents="none"
        className="select-none"
      >
        {x}
      </text>
    );
  }

  // Y axis labels (left)
  for (let y = 0; y <= BOARD_SIZE; y += 20) {
    gridLines.push(
      <text
        key={`ylabel-${y}`}
        x={-2} y={y + 0.6}
        textAnchor="end"
        fontSize={1.8}
        fill="#c9a227"
        fontWeight="bold"
        opacity={0.6}
        pointerEvents="none"
        className="select-none"
      >
        {y}
      </text>
    );
  }

  // Axis lines
  gridLines.push(
    <line
      key="x-axis"
      x1={0} y1={BOARD_SIZE} x2={BOARD_SIZE} y2={BOARD_SIZE}
      stroke="#8b6914"
      strokeWidth={0.3}
      opacity={0.6}
      pointerEvents="none"
    />
  );
  gridLines.push(
    <line
      key="y-axis"
      x1={0} y1={0} x2={0} y2={BOARD_SIZE}
      stroke="#8b6914"
      strokeWidth={0.3}
      opacity={0.6}
      pointerEvents="none"
    />
  );

  return <g>{gridLines}</g>;
};

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
  const center = projectPoint(province.center.x, province.center.y);

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHover(province)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
    >
      {/* Shadow */}
      <circle
        cx={center.x + 0.3}
        cy={center.y + 0.3}
        r={r}
        fill="rgba(0,0,0,0.4)"
      />

      {/* Token base */}
      <circle
        cx={center.x}
        cy={center.y}
        r={r}
        fill={ownerColor}
        stroke={isSelected ? '#fbbf24' : isHighlighted ? '#22c55e' : '#1a1a1a'}
        strokeWidth={isSelected ? 0.6 : 0.3}
        opacity={0.9}
      />

      {/* Inner detail */}
      <circle
        cx={center.x}
        cy={center.y}
        r={r * 0.6}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={0.15}
      />

      {/* Selection pulse */}
      {isSelected && (
        <circle
          cx={center.x}
          cy={center.y}
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
          x={center.x}
          y={center.y + 0.5}
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
          x={center.x}
          y={center.y + 0.6}
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
          x={center.x + r * 0.5}
          y={center.y - r * 0.9}
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
          cx={center.x + r * 0.6}
          cy={center.y + r * 0.6}
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
          <div className="text-amber-400 text-xs mt-1">🛤️ Silkkitien varrella (+2 💰/vuoro)</div>
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
  const [showCoordinateGrid, setShowCoordinateGrid] = useState(false);

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

  // Convert SVG coordinates to board coordinates
  const getboardCoordinates = useCallback((x: number, y: number): { x: number; y: number } | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const svgX = ((x - rect.left) / rect.width) * viewBox.width + viewBox.x;
    const svgY = ((y - rect.top) / rect.height) * viewBox.height + viewBox.y;
    return {
      x: Math.round(svgX * 10) / 10,
      y: Math.round(svgY * 10) / 10,
    };
  }, [viewBox]);

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

  // All neighbor connections (deduplicated)
  const neighborLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; isSilkRoad: boolean }[] = [];
    for (const prov of provinces) {
      for (const nId of prov.neighbors) {
        if (prov.id < nId) {
          const neighbor = provinces.find(p => p.id === nId);
          if (neighbor) {
            const from = projectPoint(prov.center.x, prov.center.y);
            const to = projectPoint(neighbor.center.x, neighbor.center.y);
            const isSilk = prov.hasSilkRoad && neighbor.hasSilkRoad;
            lines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, isSilkRoad: isSilk });
          }
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

        {/* Coordinate Grid */}
        <CoordinateGrid showGrid={showCoordinateGrid} />
        {neighborLines.map((l, i) => (
          <line
            key={`conn-${i}`}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.isSilkRoad ? '#c9342b' : '#8b3a3a'}
            strokeWidth={l.isSilkRoad ? 0.5 : 0.35}
            strokeOpacity={l.isSilkRoad ? 0.7 : 0.5}
            strokeDasharray={l.isSilkRoad ? '1.2,0.6' : '0.8,0.5'}
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

        {/* Army markers — compact badges attached to province tokens */}
        {!isMinimap && (() => {
          // Group armies by province
          const armiesByProvince: Record<string, Army[]> = {};
          armies.forEach(army => {
            if (!armiesByProvince[army.provinceId]) armiesByProvince[army.provinceId] = [];
            armiesByProvince[army.provinceId].push(army);
          });

          return Object.entries(armiesByProvince).map(([provinceId, provArmies]) => {
            const province = provinces.find(p => p.id === provinceId);
            if (!province) return null;
            const center = projectPoint(province.center.x, province.center.y);
            const r = TOKEN_RADIUS + (province.isCapital ? 0.5 : 0);

            // Separate player and enemy armies
            const playerArmies = provArmies.filter(a => a.ownerId === playerFaction);
            const enemyArmies = provArmies.filter(a => a.ownerId !== playerFaction);

            const badges: JSX.Element[] = [];

            // Render a compact army badge
            const renderBadge = (
              armyGroup: Army[],
              isPlayer: boolean,
              offsetAngle: number,
            ) => {
              if (armyGroup.length === 0) return;
              const totalUnits = armyGroup.reduce((s, a) => s + a.cavalry + a.infantry, 0);
              const totalCav = armyGroup.reduce((s, a) => s + a.cavalry, 0);
              const totalInf = armyGroup.reduce((s, a) => s + a.infantry, 0);
              const hasMovement = armyGroup.some(a => a.movementLeft > 0);
              const anySelected = armyGroup.some(a => a.id === selectedArmyId);
              const mainArmy = armyGroup[0];
              const ownerColor = FACTION_DATA_1206[mainArmy.ownerId]?.color || '#888';

              // Position badge at edge of token — pill shape for unit breakdown
              const rad = (offsetAngle * Math.PI) / 180;
              const pillH = 1.6;
              const pillW = totalCav > 0 && totalInf > 0 ? 5.5 : 3.8;
              const dist = r + pillH + 0.1;
              const bx = center.x + Math.cos(rad) * dist;
              const by = center.y + Math.sin(rad) * dist;

              badges.push(
                <g
                  key={`badge-${provinceId}-${isPlayer ? 'p' : 'e'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onArmyClick) {
                      const currentIdx = armyGroup.findIndex(a => a.id === selectedArmyId);
                      const nextIdx = (currentIdx + 1) % armyGroup.length;
                      onArmyClick(armyGroup[nextIdx].id);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {/* Selection glow */}
                  {anySelected && (
                    <rect
                      x={bx - pillW / 2 - 0.4} y={by - pillH / 2 - 0.4}
                      width={pillW + 0.8} height={pillH + 0.8}
                      rx={pillH / 2 + 0.4}
                      fill="none" stroke="#fbbf24" strokeWidth={0.25} className="animate-pulse"
                    />
                  )}

                  {/* Pill background */}
                  <rect
                    x={bx - pillW / 2} y={by - pillH / 2}
                    width={pillW} height={pillH}
                    rx={pillH / 2}
                    fill={ownerColor}
                    stroke={anySelected ? '#fbbf24' : '#1a1a1a'}
                    strokeWidth={anySelected ? 0.3 : 0.15}
                  />

                  {/* Unit breakdown: 🐴 N ⚔ N */}
                  {totalCav > 0 && totalInf > 0 ? (
                    <>
                      <text x={bx - 1.6} y={by + 0.5} textAnchor="middle" fontSize={1.1} className="pointer-events-none select-none">🐴</text>
                      <text x={bx - 0.4} y={by + 0.45} textAnchor="middle" fontSize={1.1} fontWeight="bold" fill="white" className="pointer-events-none select-none">{totalCav}</text>
                      <text x={bx + 0.9} y={by + 0.5} textAnchor="middle" fontSize={1.1} className="pointer-events-none select-none">⚔</text>
                      <text x={bx + 2.0} y={by + 0.45} textAnchor="middle" fontSize={1.1} fontWeight="bold" fill="white" className="pointer-events-none select-none">{totalInf}</text>
                    </>
                  ) : totalCav > 0 ? (
                    <>
                      <text x={bx - 0.7} y={by + 0.5} textAnchor="middle" fontSize={1.2} className="pointer-events-none select-none">🐴</text>
                      <text x={bx + 0.7} y={by + 0.45} textAnchor="middle" fontSize={1.2} fontWeight="bold" fill="white" className="pointer-events-none select-none">{totalCav}</text>
                    </>
                  ) : (
                    <>
                      <text x={bx - 0.7} y={by + 0.5} textAnchor="middle" fontSize={1.2} className="pointer-events-none select-none">⚔</text>
                      <text x={bx + 0.7} y={by + 0.45} textAnchor="middle" fontSize={1.2} fontWeight="bold" fill="white" className="pointer-events-none select-none">{totalInf}</text>
                    </>
                  )}

                  {/* Movement indicator for player */}
                  {isPlayer && (
                    <circle
                      cx={bx + pillW / 2 - 0.3}
                      cy={by - pillH / 2 + 0.3}
                      r={0.35}
                      fill={hasMovement ? '#22c55e' : '#ef4444'}
                      stroke="#1a1a1a"
                      strokeWidth={0.1}
                    />
                  )}

                  {/* Stack indicator */}
                  {armyGroup.length > 1 && (
                    <text
                      x={bx - pillW / 2 + 0.5}
                      y={by - pillH / 2 + 0.1}
                      textAnchor="middle"
                      fontSize={0.8}
                      fill="#fbbf24"
                      fontWeight="bold"
                      className="pointer-events-none select-none"
                    >
                      ×{armyGroup.length}
                    </text>
                  )}
                </g>,
              );
            };

            // Place player armies bottom-right, enemy top-left
            renderBadge(playerArmies, true, 315);   // bottom-right
            renderBadge(enemyArmies, false, 135);    // top-left

            return <g key={`armies-${provinceId}`}>{badges}</g>;
          });
        })()}

        {/* Province labels when zoomed */}
        {zoom > 1.5 && provinces.map(province => {
          const center = projectPoint(province.center.x, province.center.y);
          return (
            <text
              key={`label-${province.id}`}
              x={center.x}
              y={center.y + 4}
              textAnchor="middle"
              fontSize={1.4}
              fill="#f5e6c8"
              fontWeight="bold"
              className="pointer-events-none select-none"
              style={{ textShadow: '0 0 3px rgba(0,0,0,0.9)' }}
            >
              {province.name}
            </text>
          );
        })}
      </svg>

      {/* Zoom controls */}
      {!isMinimap && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomIn}
            className="bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800"
            title="Zoom in">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomOut}
            className="bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800"
            title="Zoom out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleResetView}
            className="bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800"
            title="Reset view">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setShowCoordinateGrid(!showCoordinateGrid)}
            className={`bg-stone-900/80 border-amber-700/40 text-amber-200 hover:bg-stone-800 ${showCoordinateGrid ? 'bg-amber-900/80 border-amber-600' : ''}`}
            title="Toggle coordinate grid"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 100 4 2 2 0 000-4zm0 0a2 2 0 100-4 2 2 0 000 4zm6-8a2 2 0 100 4 2 2 0 000-4zm0 0a2 2 0 100-4 2 2 0 000 4zm6 6a2 2 0 100 4 2 2 0 000-4zm0 0a2 2 0 100-4 2 2 0 000-4z" />
            </svg>
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
          {showCoordinateGrid && (() => {
            const coords = getboardCoordinates(mousePosition.x, mousePosition.y);
            return coords ? (
              <>
                <span className="mx-2">•</span>
                <span className="text-amber-400 font-mono">X: {coords.x.toFixed(1)}, Y: {coords.y.toFixed(1)}</span>
              </>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
