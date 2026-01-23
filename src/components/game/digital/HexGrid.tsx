import { HexTile, Unit, FactionId, TERRAIN_INFO, FACTIONS, UNIT_INFO } from '@/types/game';
import { cn } from '@/lib/utils';

interface HexGridProps {
  hexes: HexTile[];
  units: Unit[];
  selectedHexId: string | null;
  availableMoves: string[];
  onHexClick: (hexId: string) => void;
  playerFaction: FactionId;
}

// Hex dimensions
const HEX_SIZE = 40;
const HEX_HEIGHT = HEX_SIZE * 2;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_VERT = HEX_HEIGHT * 0.75;

// Convert axial coordinates to pixel position
const axialToPixel = (q: number, r: number): { x: number; y: number } => {
  const x = HEX_WIDTH * (q + r / 2);
  const y = HEX_VERT * r;
  return { x, y };
};

// Generate hex polygon points
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
  isSelected: boolean;
  isAvailableMove: boolean;
  onClick: () => void;
  playerFaction: FactionId;
}

const HexCell = ({ hex, unitsOnHex, isSelected, isAvailableMove, onClick, playerFaction }: HexCellProps) => {
  const { x, y } = axialToPixel(hex.q, hex.r);
  const terrainInfo = TERRAIN_INFO[hex.terrain];
  
  // Determine fill color based on ownership and state
  let fillColor = '#374151'; // default gray
  
  if (hex.ownerId) {
    fillColor = FACTIONS[hex.ownerId].color;
  }
  
  const strokeColor = isSelected 
    ? '#fbbf24' 
    : isAvailableMove 
    ? '#22c55e' 
    : hex.ownerId 
    ? FACTIONS[hex.ownerId].color 
    : '#6b7280';
  
  const strokeWidth = isSelected || isAvailableMove ? 3 : 1.5;
  
  // Group units by type for display
  const unitCounts = unitsOnHex.reduce((acc, unit) => {
    acc[unit.type] = (acc[unit.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <g 
      transform={`translate(${x}, ${y})`} 
      onClick={onClick}
      className="cursor-pointer transition-all hover:opacity-80"
    >
      {/* Hex background */}
      <polygon
        points={getHexPoints()}
        fill={hex.ownerId ? `${fillColor}33` : '#1f293755'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        className="transition-all"
      />
      
      {/* Available move indicator */}
      {isAvailableMove && (
        <polygon
          points={getHexPoints()}
          fill="#22c55e33"
          stroke="#22c55e"
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      )}
      
      {/* Terrain emoji */}
      <text
        x={0}
        y={hex.hasCity ? -12 : 0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={hex.hasCity ? 14 : 18}
        className="pointer-events-none select-none"
      >
        {terrainInfo.emoji}
      </text>
      
      {/* City indicator */}
      {hex.hasCity && (
        <text
          x={0}
          y={6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={16}
          className="pointer-events-none select-none"
        >
          🏰
        </text>
      )}
      
      {/* Units display */}
      {unitsOnHex.length > 0 && (
        <g transform="translate(0, 22)">
          <rect
            x={-20}
            y={-10}
            width={40}
            height={18}
            rx={4}
            fill={FACTIONS[unitsOnHex[0].factionId].color}
            fillOpacity={0.9}
          />
          <text
            x={0}
            y={2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="white"
            fontWeight="bold"
            className="pointer-events-none select-none"
          >
            {Object.entries(unitCounts).map(([type, count]) => 
              `${UNIT_INFO[type as keyof typeof UNIT_INFO].emoji}${count}`
            ).join('')}
          </text>
        </g>
      )}
      
      {/* Trade route indicator */}
      {hex.hasTradeRoute && !hex.hasCity && (
        <text
          x={20}
          y={-15}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          className="pointer-events-none select-none"
        >
          🛤️
        </text>
      )}
    </g>
  );
};

export const HexGrid = ({ hexes, units, selectedHexId, availableMoves, onHexClick, playerFaction }: HexGridProps) => {
  // Calculate bounds for SVG viewBox
  const positions = hexes.map(hex => axialToPixel(hex.q, hex.r));
  const minX = Math.min(...positions.map(p => p.x)) - HEX_WIDTH;
  const maxX = Math.max(...positions.map(p => p.x)) + HEX_WIDTH;
  const minY = Math.min(...positions.map(p => p.y)) - HEX_HEIGHT;
  const maxY = Math.max(...positions.map(p => p.y)) + HEX_HEIGHT;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  return (
    <div className="w-full overflow-auto bg-gradient-to-br from-amber-950/30 to-background rounded-lg border-2 border-amber-700/50 p-4">
      <svg
        viewBox={`${minX} ${minY} ${width} ${height}`}
        className="w-full h-auto min-h-[400px] max-h-[600px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid background pattern */}
        <defs>
          <pattern id="grid-pattern" patternUnits="userSpaceOnUse" width={HEX_WIDTH} height={HEX_VERT * 2}>
            <path
              d={`M 0,${HEX_VERT} L ${HEX_WIDTH / 2},0 L ${HEX_WIDTH},${HEX_VERT} L ${HEX_WIDTH / 2},${HEX_VERT * 2} Z`}
              fill="none"
              stroke="#ffffff08"
            />
          </pattern>
        </defs>
        <rect x={minX} y={minY} width={width} height={height} fill="url(#grid-pattern)" />
        
        {hexes.map(hex => {
          const unitsOnHex = units.filter(u => u.hexId === hex.id);
          const isSelected = hex.id === selectedHexId;
          const isAvailableMove = availableMoves.includes(hex.id);
          
          return (
            <HexCell
              key={hex.id}
              hex={hex}
              unitsOnHex={unitsOnHex}
              isSelected={isSelected}
              isAvailableMove={isAvailableMove}
              onClick={() => onHexClick(hex.id)}
              playerFaction={playerFaction}
            />
          );
        })}
      </svg>
    </div>
  );
};
