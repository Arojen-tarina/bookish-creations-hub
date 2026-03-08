/**
 * TabletopBoard.tsx — Heksipohjainen pelilauta (vanha versio)
 *
 * SVG-pelilauta heksakenttinä maastoväreillä, yksiköillä ja rakennuksilla.
 * Tukee zoom/pan ja klikkaustoiminnot. Käytetään MongolianGame-komponentissa.
 */
import { HexTile, Unit, Building, FactionId, TERRAIN_INFO, FACTIONS, UNIT_INFO, BUILDING_INFO } from '@/types/game';

interface TabletopBoardProps {
  hexes: HexTile[];
  units: Unit[];
  buildings: Building[];
  selectedHexId: string | null;
  availableMoves: string[];
  onHexClick: (hexId: string) => void;
  playerFaction: FactionId;
  cameraAngle: number;
}

const HEX_SIZE = 50;
const HEX_HEIGHT = HEX_SIZE * 2;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_VERT = HEX_HEIGHT * 0.75;

const axialToPixel = (q: number, r: number): { x: number; y: number } => {
  const x = HEX_WIDTH * (q + r / 2);
  const y = HEX_VERT * r;
  return { x, y };
};

const getHexPoints = (): string => {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30;
    const angleRad = (Math.PI / 180) * angleDeg;
    const x = HEX_SIZE * Math.cos(angleRad);
    const y = HEX_SIZE * Math.sin(angleRad);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
};

interface HexCellProps {
  hex: HexTile;
  unitsOnHex: Unit[];
  buildingsOnHex: Building[];
  isSelected: boolean;
  isAvailableMove: boolean;
  onClick: () => void;
  playerFaction: FactionId;
}

const HexCell = ({ hex, unitsOnHex, buildingsOnHex, isSelected, isAvailableMove, onClick, playerFaction }: HexCellProps) => {
  const { x, y } = axialToPixel(hex.q, hex.r);
  const terrainInfo = TERRAIN_INFO[hex.terrain];
  
  const isOwned = hex.ownerId !== null;
  const isPlayerOwned = hex.ownerId === playerFaction;
  const ownerColor = hex.ownerId ? FACTIONS[hex.ownerId].color : '#4b5563';
  
  // Group units by faction for display
  const unitsByFaction = unitsOnHex.reduce((acc, unit) => {
    if (!acc[unit.factionId]) acc[unit.factionId] = [];
    acc[unit.factionId].push(unit);
    return acc;
  }, {} as Record<string, Unit[]>);
  
  return (
    <g 
      transform={`translate(${x}, ${y})`} 
      onClick={onClick}
      className="cursor-pointer transition-all duration-200"
      style={{ filter: isSelected ? 'brightness(1.3)' : 'none' }}
    >
      {/* Hex shadow for 3D effect */}
      <polygon
        points={getHexPoints()}
        fill="rgba(0,0,0,0.3)"
        transform="translate(3, 4)"
      />
      
      {/* Main hex with terrain color */}
      <polygon
        points={getHexPoints()}
        fill={terrainInfo.color}
        stroke={isSelected ? '#fbbf24' : isAvailableMove ? '#22c55e' : isOwned ? ownerColor : '#374151'}
        strokeWidth={isSelected ? 4 : isAvailableMove ? 3 : 2}
        className="transition-all duration-200"
      />
      
      {/* Ownership border glow */}
      {isOwned && (
        <polygon
          points={getHexPoints()}
          fill="none"
          stroke={ownerColor}
          strokeWidth={6}
          strokeOpacity={0.4}
          className="animate-pulse"
          style={{ animationDuration: '3s' }}
        />
      )}
      
      {/* Available move highlight */}
      {isAvailableMove && (
        <>
          <polygon
            points={getHexPoints()}
            fill="rgba(34, 197, 94, 0.3)"
            className="animate-pulse"
          />
          <polygon
            points={getHexPoints()}
            fill="none"
            stroke="#22c55e"
            strokeWidth={3}
            strokeDasharray="8,4"
            className="animate-pulse"
          />
        </>
      )}
      
      {/* Terrain texture overlay */}
      <polygon
        points={getHexPoints()}
        fill="url(#noise)"
        opacity={0.1}
      />
      
      {/* City/Fortress 3D building */}
      {hex.hasCity && (
        <g transform="translate(0, -5)">
          <rect x={-12} y={-8} width={24} height={16} fill="#78716c" rx={2} />
          <rect x={-10} y={-12} width={8} height={8} fill="#57534e" rx={1} />
          <rect x={2} y={-10} width={6} height={6} fill="#57534e" rx={1} />
          <polygon points="-6,-12 -6,-18 2,-15" fill="#44403c" />
          <text x={0} y={4} textAnchor="middle" fontSize={10} fill="white">🏰</text>
        </g>
      )}
      
      {/* Buildings */}
      {buildingsOnHex.map((building, idx) => (
        <g key={building.id} transform={`translate(${-20 + idx * 15}, 15)`}>
          <circle cx={0} cy={0} r={10} fill={ownerColor} opacity={0.8} />
          <text x={0} y={4} textAnchor="middle" fontSize={12}>
            {BUILDING_INFO[building.type].emoji}
          </text>
        </g>
      ))}
      
      {/* Terrain emoji */}
      {!hex.hasCity && (
        <text
          x={0}
          y={unitsOnHex.length > 0 ? -15 : 5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={hex.hasTradeRoute ? 14 : 20}
          className="pointer-events-none select-none"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
        >
          {terrainInfo.emoji}
        </text>
      )}
      
      {/* Trade route indicator */}
      {hex.hasTradeRoute && !hex.hasCity && (
        <text
          x={18}
          y={-18}
          textAnchor="middle"
          fontSize={10}
          className="pointer-events-none"
        >
          🛤️
        </text>
      )}
      
      {/* Units - displayed as game pieces */}
      {Object.entries(unitsByFaction).map(([factionId, factionUnits], factionIdx) => {
        const factionColor = FACTIONS[factionId as FactionId].color;
        const totalUnits = factionUnits.length;
        
        return (
          <g key={factionId} transform={`translate(${factionIdx * 20 - 10}, ${hex.hasCity ? 15 : 10})`}>
            {/* Base/pedestal for units */}
            <ellipse cx={0} cy={12} rx={14} ry={5} fill="rgba(0,0,0,0.3)" />
            
            {/* Unit stack */}
            <g transform="translate(0, 0)">
              {/* Unit body */}
              <circle cx={0} cy={0} r={12} fill={factionColor} stroke="#1f2937" strokeWidth={2} />
              
              {/* Unit symbol */}
              <text
                x={0}
                y={4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fill="white"
                fontWeight="bold"
                className="pointer-events-none select-none"
              >
                {factionUnits.some(u => u.type === 'leader') ? '👑' : 
                 factionUnits.some(u => u.type === 'cavalry') ? '🐎' : '⚔️'}
              </text>
              
              {/* Unit count badge */}
              {totalUnits > 1 && (
                <g transform="translate(10, -10)">
                  <circle cx={0} cy={0} r={8} fill="#1f2937" stroke={factionColor} strokeWidth={1} />
                  <text
                    x={0}
                    y={3}
                    textAnchor="middle"
                    fontSize={10}
                    fill="white"
                    fontWeight="bold"
                  >
                    {totalUnits}
                  </text>
                </g>
              )}
            </g>
          </g>
        );
      })}
      
      {/* Fortress indicator */}
      {hex.hasFortress && (
        <g transform="translate(-20, -20)">
          <text fontSize={14}>🏯</text>
        </g>
      )}
      
      {/* Coordinates (debug) - hidden in production */}
      {/* <text x={0} y={30} textAnchor="middle" fontSize={8} fill="#666">{hex.q},{hex.r}</text> */}
    </g>
  );
};

export const TabletopBoard = ({ 
  hexes, 
  units, 
  buildings,
  selectedHexId, 
  availableMoves, 
  onHexClick, 
  playerFaction,
  cameraAngle,
}: TabletopBoardProps) => {
  // Calculate bounds
  const positions = hexes.map(hex => axialToPixel(hex.q, hex.r));
  const minX = Math.min(...positions.map(p => p.x)) - HEX_WIDTH * 1.5;
  const maxX = Math.max(...positions.map(p => p.x)) + HEX_WIDTH * 1.5;
  const minY = Math.min(...positions.map(p => p.y)) - HEX_HEIGHT * 1.5;
  const maxY = Math.max(...positions.map(p => p.y)) + HEX_HEIGHT * 1.5;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  return (
    <div 
      className="relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl shadow-2xl"
      style={{
        perspective: '1400px',
        perspectiveOrigin: 'center 25%',
      }}
    >
      {/* Deep table surface with premium wood texture */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, rgba(139, 90, 43, 0.2) 0%, transparent 50%),
            linear-gradient(180deg, #1a0f08 0%, #0d0704 50%, #050302 100%)
          `,
        }}
      />
      
      {/* Animated ambient glow */}
      <div 
        className="absolute inset-0 opacity-40 rounded-2xl animate-pulse"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(251, 191, 36, 0.05) 0%, transparent 70%)`,
          animationDuration: '4s',
        }}
      />
      
      {/* Wood grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-15 rounded-2xl"
        style={{
          backgroundImage: `
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(139, 90, 43, 0.4) 1px, rgba(139, 90, 43, 0.4) 2px),
            repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(100, 60, 30, 0.1) 20px, rgba(100, 60, 30, 0.1) 21px)
          `,
        }}
      />
      
      {/* Board container with enhanced 3D transform */}
      <div
        className="relative h-full p-4 lg:p-8 transition-transform duration-700 ease-out"
        style={{
          transform: `rotateX(50deg) rotateZ(${cameraAngle}deg) scale(0.9)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Green felt gaming mat with stitched border effect */}
        <div 
          className="absolute inset-2 lg:inset-4 rounded-xl"
          style={{
            background: `
              radial-gradient(ellipse at 50% 30%, #1e4d2e 0%, #0f2318 60%, #0a1810 100%)
            `,
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.6), 
              inset 0 2px 15px rgba(255,255,255,0.08),
              inset 0 -2px 10px rgba(0,0,0,0.3),
              0 0 0 3px rgba(139, 90, 43, 0.3)
            `,
            transform: 'translateZ(-8px)',
          }}
        />
        
        {/* Felt texture */}
        <div 
          className="absolute inset-2 lg:inset-4 rounded-xl opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            transform: 'translateZ(-7px)',
          }}
        />
        
        {/* SVG board */}
        <svg
          viewBox={`${minX} ${minY} ${width} ${height}`}
          className="relative z-10 w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ 
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
            transform: 'translateZ(5px)',
            minHeight: '300px',
          }}
        >
          {/* Definitions */}
          <defs>
            {/* Noise pattern for texture */}
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            
            {/* Enhanced glow effect */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Drop shadow */}
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4"/>
            </filter>
            
            {/* Selection pulse animation */}
            <filter id="selectPulse">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Render hexes */}
          {hexes.map(hex => {
            const unitsOnHex = units.filter(u => u.hexId === hex.id);
            const buildingsOnHex = buildings.filter(b => b.hexId === hex.id);
            const isSelected = hex.id === selectedHexId;
            const isAvailableMove = availableMoves.includes(hex.id);
            
            return (
              <HexCell
                key={hex.id}
                hex={hex}
                unitsOnHex={unitsOnHex}
                buildingsOnHex={buildingsOnHex}
                isSelected={isSelected}
                isAvailableMove={isAvailableMove}
                onClick={() => onHexClick(hex.id)}
                playerFaction={playerFaction}
              />
            );
          })}
        </svg>
      </div>
      
      {/* Premium ambient lighting effects */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: `
            radial-gradient(ellipse at 50% -20%, rgba(255, 200, 100, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 100%, rgba(180, 83, 9, 0.05) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 100%, rgba(180, 83, 9, 0.05) 0%, transparent 40%)
          `,
        }}
      />
      
      {/* Premium edge vignette */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          boxShadow: `
            inset 0 0 100px rgba(0,0,0,0.7),
            inset 0 0 200px rgba(0,0,0,0.3)
          `,
        }}
      />
      
      {/* Subtle border glow */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          boxShadow: '0 0 40px rgba(251, 191, 36, 0.1)',
        }}
      />
    </div>
  );
};
