/**
 * BoardMapSVG.tsx — Lautapelikartan SVG-renderöinti
 *
 * Pyöreät provinssitokenit, fraktioväriset reunukset,
 * maastotekstuurit, katkoviivayhteydet ja selitelaatikot.
 * Vastaa Figma-referenssikuvaa (Aasian Kartta - 1200-luku).
 */
import { useState } from 'react';
import {
  BOARD_PROVINCES,
  BOARD_CONNECTIONS,
  BOARD_FACTIONS,
  BOARD_TERRAINS,
  type BoardProvince,
  type BoardFaction,
} from '@/data/boardMapData';

const SVG_W = 920;
const SVG_H = 480;
const R = 25; // province circle radius

// Terrain background regions (approximate polygons)
const TERRAIN_REGIONS = [
  { id: 'steppe_bg', d: 'M200,60 L530,50 L620,130 L500,200 L340,200 L200,170 Z', fill: '#d8cc8c', opacity: 0.25 },
  { id: 'forest_bg', d: 'M80,60 L220,60 L200,180 L80,200 Z', fill: '#4a7a4a', opacity: 0.18 },
  { id: 'desert_bg', d: 'M180,220 L380,200 L400,360 L250,380 L120,350 Z', fill: '#d4a870', opacity: 0.18 },
  { id: 'mountain_bg', d: 'M340,340 L480,340 L500,420 L350,430 Z', fill: '#8888a0', opacity: 0.18 },
  { id: 'china_bg', d: 'M560,120 L840,110 L830,340 L650,360 L540,300 Z', fill: '#c8a860', opacity: 0.15 },
];

const CrossedSwords = ({ x, y, scale = 0.65 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    {/* Left sword */}
    <line x1={-7} y1={8} x2={5} y2={-10} stroke="#5a3a20" strokeWidth={2.2} strokeLinecap="round" />
    <line x1={-3} y1={1} x2={3} y2={-2} stroke="#5a3a20" strokeWidth={1.8} strokeLinecap="round" />
    {/* Right sword */}
    <line x1={7} y1={8} x2={-5} y2={-10} stroke="#5a3a20" strokeWidth={2.2} strokeLinecap="round" />
    <line x1={3} y1={1} x2={-3} y2={-2} stroke="#5a3a20" strokeWidth={1.8} strokeLinecap="round" />
  </g>
);

const FortIcon = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-5} y={-3} width={10} height={8} fill="#556b2f" rx={1} />
    <rect x={-7} y={-6} width={3} height={5} fill="#556b2f" rx={0.5} />
    <rect x={4} y={-6} width={3} height={5} fill="#556b2f" rx={0.5} />
    <polygon points="-1,-6 1,-9 3,-6" fill="#c55a5a" />
  </g>
);

const ProvinceToken = ({
  province,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  province: BoardProvince;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const terrain = BOARD_TERRAINS[province.terrain];
  const faction = province.faction ? BOARD_FACTIONS[province.faction] : null;
  const borderColor = faction?.borderColor || '#8a7a6a';
  const borderWidth = province.isCapital ? 3.5 : 2.5;
  const hasTroops = province.cavalry > 0 || province.infantry > 0;

  return (
    <g
      transform={`translate(${province.x},${province.y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Faction glow ring */}
      {faction && (
        <circle
          r={R + 5}
          fill="none"
          stroke={faction.color}
          strokeWidth={1.5}
          opacity={isHovered ? 0.8 : 0.4}
        />
      )}

      {/* Main circle */}
      <circle
        r={R}
        fill={terrain.color}
        stroke={borderColor}
        strokeWidth={borderWidth}
        filter={isHovered ? 'url(#hover-glow)' : undefined}
      />

      {/* Capital star */}
      {province.isCapital && (
        <circle r={R + 1} fill="none" stroke="#ffd700" strokeWidth={1.5} strokeDasharray="4,3" />
      )}

      {/* Crossed swords */}
      {hasTroops && <CrossedSwords x={0} y={-3} />}

      {/* Cavalry number (left) */}
      {province.cavalry > 0 && (
        <g transform={`translate(${-10},${13})`}>
          <circle r={8} fill="#a0845c" stroke="#7a6040" strokeWidth={1} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="bold" fill="#fff">
            {province.cavalry}
          </text>
        </g>
      )}

      {/* Infantry number (right) */}
      {province.infantry > 0 && (
        <g transform={`translate(${10},${13})`}>
          <circle r={8} fill="#6a5040" stroke="#4a3a2a" strokeWidth={1} />
          <text textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="bold" fill="#fff">
            {province.infantry}
          </text>
        </g>
      )}

      {/* Fort icon */}
      {province.hasFort && <FortIcon x={R - 4} y={-R + 6} />}
    </g>
  );
};

export const BoardMapSVG = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto border-4 border-amber-800 rounded-lg"
        style={{ background: '#f0e4cc', minWidth: 700 }}
      >
        <defs>
          <filter id="hover-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Title */}
        <rect x={SVG_W / 2 - 140} y={5} width={280} height={30} rx={5} fill="#5a3a20" />
        <text x={SVG_W / 2} y={25} textAnchor="middle" fontSize={15} fontWeight="bold" fill="#f0e4cc" fontFamily="serif">
          Aasian Kartta – 1200-luku
        </text>

        {/* Terrain background regions */}
        {TERRAIN_REGIONS.map((r) => (
          <path key={r.id} d={r.d} fill={r.fill} opacity={r.opacity} />
        ))}

        {/* Connections (dashed lines) */}
        {BOARD_CONNECTIONS.map((conn, i) => {
          const from = BOARD_PROVINCES.find((p) => p.id === conn.from);
          const to = BOARD_PROVINCES.find((p) => p.id === conn.to);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#a08060"
              strokeWidth={1.2}
              strokeDasharray="5,4"
              opacity={0.5}
            />
          );
        })}

        {/* Province tokens */}
        {BOARD_PROVINCES.map((province) => (
          <ProvinceToken
            key={province.id}
            province={province}
            isHovered={hoveredId === province.id}
            onMouseEnter={() => setHoveredId(province.id)}
            onMouseLeave={() => setHoveredId(null)}
          />
        ))}

        {/* Province names */}
        {BOARD_PROVINCES.map((province) => (
          <text
            key={`label-${province.id}`}
            x={province.x}
            y={province.y - R - 6}
            textAnchor="middle"
            fontSize={7.5}
            fontWeight="600"
            fill="#3a2a1a"
            fontFamily="sans-serif"
          >
            {province.name}
          </text>
        ))}

        {/* === LEGEND: Terrain (bottom-left) === */}
        <g transform="translate(15, 370)">
          <rect x={0} y={0} width={105} height={100} rx={5} fill="#f5ecd4" stroke="#a08060" strokeWidth={1.5} />
          <text x={8} y={16} fontSize={9} fontWeight="bold" fill="#3a2a1a">Maasto:</text>
          {Object.entries(BOARD_TERRAINS).map(([key, t], i) => (
            <g key={key} transform={`translate(8, ${28 + i * 14})`}>
              <circle r={5} cx={5} cy={0} fill={t.color} stroke="#7a6a5a" strokeWidth={1} />
              <text x={16} y={3} fontSize={7.5} fill="#3a2a1a">{t.icon} {t.name}</text>
            </g>
          ))}
        </g>

        {/* === LEGEND: Factions (bottom-right) === */}
        <g transform={`translate(${SVG_W - 130}, 370)`}>
          <rect x={0} y={0} width={115} height={85} rx={5} fill="#f5ecd4" stroke="#a08060" strokeWidth={1.5} />
          <text x={8} y={16} fontSize={9} fontWeight="bold" fill="#3a2a1a">Heimot:</text>
          {Object.entries(BOARD_FACTIONS).map(([key, f], i) => (
            <g key={key} transform={`translate(8, ${28 + i * 14})`}>
              <circle r={5} cx={5} cy={0} fill="none" stroke={f.color} strokeWidth={2.5} />
              <text x={16} y={3} fontSize={7.5} fill="#3a2a1a">{f.name}</text>
            </g>
          ))}
        </g>

        {/* Tooltip */}
        {hoveredId && (() => {
          const p = BOARD_PROVINCES.find((pr) => pr.id === hoveredId);
          if (!p) return null;
          const terrain = BOARD_TERRAINS[p.terrain];
          const faction = p.faction ? BOARD_FACTIONS[p.faction] : null;
          const tx = Math.min(p.x + 35, SVG_W - 130);
          const ty = Math.max(p.y - 30, 10);
          return (
            <g transform={`translate(${tx},${ty})`}>
              <rect x={0} y={0} width={120} height={46} rx={4} fill="#fffbe8" stroke="#a08060" strokeWidth={1} opacity={0.95} />
              <text x={6} y={14} fontSize={8} fontWeight="bold" fill="#3a2a1a">{p.name}</text>
              <text x={6} y={26} fontSize={7} fill="#5a4a3a">{terrain.icon} {terrain.name} {faction ? `• ${faction.name}` : ''}</text>
              <text x={6} y={38} fontSize={7} fill="#5a4a3a">🐴 {p.cavalry}  ⚔ {p.infantry} {p.hasFort ? ' 🏰' : ''}{p.isCapital ? ' ⭐' : ''}</text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
};
