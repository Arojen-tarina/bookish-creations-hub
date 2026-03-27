/**
 * CivilizationMap.tsx — Sivilisaatiokartta (täysi SVG-versio)
 * 
 * Pelin pääkarttanäkymä, joka piirtää koko Euraasian vuonna 1206.
 * Sisältää:
 * - Maastoalueet (steppejä, aavikkoja, vuoristoja, metsiä, taigatä, tundraa)
 * - Vesistöt (Kaspianmeri, Baikaljärvi, Mustameri jne.)
 * - Joet (Volga, Jangtse, Silkkitie jne.)
 * - Vuoristoketjut lumisine huippuineen (Himalaja, Ural, Altai)
 * - Provinssiheksagonit värikoodattuina omistajan ja maaston mukaan
 * - Armeijaikoni ja hyökkäyskohteiden korostus
 * - Zoom, panorointi ja minikartta
 *
 * Tämä on raskaampi mutta visuaalisesti rikkaampi vaihtoehto ProvinceMap-komponentille.
 */
import { useState, useCallback, useMemo, useRef, memo, useEffect } from 'react';
import { Province, FactionId, Army, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO, FACTION_DATA_1206 } from '@/types/province';
import { ZoomIn, ZoomOut, Maximize2, Compass, Sword, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CivilizationMapProps {
  provinces: Province[];
  armies: Army[];
  selectedProvinceId: string | null;
  selectedArmyId: string | null;
  onProvinceClick: (provinceId: string) => void;
  onArmyClick: (armyId: string) => void;
  playerFaction: FactionId;
  highlightedProvinces?: string[];
  attackableProvinces?: string[]; // NEW: provinces with enemy armies
  attackModeActive?: boolean; // When true, emphasize attack targets
  movingArmyId?: string | null;
  movingToProvinceId?: string | null;
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

// Terrain regions - large geographic areas with specific terrain types
const TERRAIN_REGIONS = [
  // EURASIA LANDMASS BASE
  { id: 'eurasia-base', path: 'M 50 100 Q 100 80 200 90 Q 350 70 500 100 Q 700 80 900 120 Q 1000 180 950 300 Q 980 400 920 500 Q 850 580 700 560 Q 500 600 350 550 Q 200 580 100 500 Q 50 400 80 300 Q 40 200 50 100 Z', terrain: 'grassland' },
  
  // SIBERIA - Taiga belt
  { id: 'siberia-taiga', path: 'M 280 60 Q 400 40 550 50 Q 700 45 820 70 Q 900 90 850 140 Q 750 130 600 120 Q 450 100 300 120 Q 250 100 280 60 Z', terrain: 'taiga' },
  
  // SIBERIA TUNDRA - Far north
  { id: 'siberia-tundra', path: 'M 350 20 Q 500 10 650 15 Q 780 25 850 50 Q 800 70 650 55 Q 500 40 380 55 Q 320 45 350 20 Z', terrain: 'tundra' },
  
  // RUSSIAN FORESTS
  { id: 'russia-forest', path: 'M 80 120 Q 150 100 220 130 Q 260 160 240 220 Q 200 260 140 250 Q 80 230 60 180 Q 50 140 80 120 Z', terrain: 'forest' },
  
  // MONGOLIAN STEPPE
  { id: 'mongol-steppe', path: 'M 550 160 Q 650 140 750 160 Q 850 180 880 220 Q 860 280 780 290 Q 680 300 600 270 Q 520 250 500 200 Q 510 170 550 160 Z', terrain: 'steppe' },
  
  // KIPCHAK STEPPE
  { id: 'kipchak-steppe', path: 'M 150 240 Q 220 220 300 240 Q 380 260 400 310 Q 360 350 280 340 Q 200 330 140 300 Q 120 270 150 240 Z', terrain: 'steppe' },
  
  // CENTRAL ASIA STEPPE
  { id: 'central-steppe', path: 'M 400 240 Q 480 220 550 250 Q 600 280 580 330 Q 520 360 450 340 Q 380 320 370 280 Q 370 250 400 240 Z', terrain: 'steppe' },
  
  // GOBI DESERT
  { id: 'gobi-desert', path: 'M 680 280 Q 760 260 840 290 Q 880 330 860 380 Q 800 400 720 380 Q 660 350 660 310 Q 660 290 680 280 Z', terrain: 'desert' },
  
  // TAKLAMAKAN DESERT
  { id: 'taklamakan', path: 'M 500 340 Q 580 320 650 350 Q 680 400 640 440 Q 560 460 500 420 Q 460 380 480 350 Q 490 340 500 340 Z', terrain: 'desert' },
  
  // KHWAREZM DESERT
  { id: 'khwarezm-desert', path: 'M 300 280 Q 360 260 400 290 Q 420 340 380 380 Q 320 400 280 360 Q 260 320 280 290 Q 290 280 300 280 Z', terrain: 'desert' },
  
  // PERSIA DESERT
  { id: 'persia-desert', path: 'M 280 400 Q 340 380 400 420 Q 430 480 380 530 Q 300 550 260 500 Q 230 450 260 410 Q 270 400 280 400 Z', terrain: 'desert' },
  
  // ARABIAN DESERT
  { id: 'arabian-desert', path: 'M 200 480 Q 260 460 300 500 Q 320 560 280 600 Q 200 620 160 570 Q 140 520 180 490 Q 190 480 200 480 Z', terrain: 'desert' },
  
  // CHINESE FARMLANDS - North
  { id: 'china-farmland-north', path: 'M 820 300 Q 880 280 930 320 Q 960 380 920 420 Q 860 440 800 410 Q 760 370 780 330 Q 800 310 820 300 Z', terrain: 'farmland' },
  
  // CHINESE FARMLANDS - South
  { id: 'china-farmland-south', path: 'M 840 440 Q 900 420 950 460 Q 980 520 940 570 Q 880 600 820 560 Q 780 510 800 460 Q 820 440 840 440 Z', terrain: 'farmland' },
  
  // SICHUAN HILLS
  { id: 'sichuan-hills', path: 'M 720 440 Q 780 420 820 460 Q 840 520 800 560 Q 740 580 700 540 Q 680 490 700 450 Q 710 440 720 440 Z', terrain: 'hills' },
  
  // TIBET MOUNTAINS
  { id: 'tibet-mountains', path: 'M 540 420 Q 620 400 700 440 Q 740 500 700 550 Q 620 580 540 540 Q 480 500 500 450 Q 520 420 540 420 Z', terrain: 'mountain' },
  
  // HIMALAYA MOUNTAINS
  { id: 'himalaya', path: 'M 480 500 Q 560 480 640 510 Q 700 540 720 580 Q 660 620 560 600 Q 480 580 460 540 Q 460 510 480 500 Z', terrain: 'mountain' },
  
  // HINDU KUSH MOUNTAINS
  { id: 'hindukush-region', path: 'M 380 380 Q 440 360 500 400 Q 520 460 480 500 Q 420 520 380 480 Q 340 440 360 400 Q 370 380 380 380 Z', terrain: 'mountain' },
  
  // TIAN SHAN MOUNTAINS
  { id: 'tianshan-region', path: 'M 440 280 Q 520 260 600 300 Q 630 360 590 400 Q 520 420 460 380 Q 420 340 430 300 Q 435 280 440 280 Z', terrain: 'mountain' },
  
  // ALTAI MOUNTAINS
  { id: 'altai-region', path: 'M 520 180 Q 580 160 640 200 Q 670 250 640 290 Q 580 310 530 270 Q 490 230 500 190 Q 510 180 520 180 Z', terrain: 'mountain' },
  
  // URAL MOUNTAINS
  { id: 'ural-region', path: 'M 260 100 Q 290 80 310 120 Q 320 200 300 280 Q 280 340 260 300 Q 240 220 250 150 Q 255 110 260 100 Z', terrain: 'mountain' },
  
  // CAUCASUS MOUNTAINS
  { id: 'caucasus-region', path: 'M 160 340 Q 220 320 280 350 Q 300 400 260 430 Q 200 450 160 410 Q 130 370 150 350 Q 155 340 160 340 Z', terrain: 'mountain' },
  
  // TRANSOXIANA FARMLAND
  { id: 'transoxiana', path: 'M 340 300 Q 400 280 450 320 Q 470 370 430 410 Q 370 430 320 390 Q 290 350 310 310 Q 325 300 340 300 Z', terrain: 'farmland' },
  
  // PERSIA HILLS
  { id: 'persia-hills', path: 'M 220 380 Q 280 360 320 400 Q 340 460 300 500 Q 240 520 200 480 Q 170 430 190 390 Q 205 380 220 380 Z', terrain: 'hills' },
  
  // MANCHURIA FOREST
  { id: 'manchuria-forest', path: 'M 880 160 Q 940 140 980 180 Q 1000 240 960 280 Q 900 300 860 260 Q 840 210 860 170 Q 870 160 880 160 Z', terrain: 'forest' },
  
  // KOREA HILLS
  { id: 'korea-hills', path: 'M 960 280 Q 1000 260 1020 300 Q 1030 360 1000 400 Q 960 420 940 380 Q 930 330 940 290 Q 950 280 960 280 Z', terrain: 'hills' },
  
  // YUNNAN HILLS
  { id: 'yunnan-hills', path: 'M 700 520 Q 760 500 800 540 Q 820 600 780 640 Q 720 660 680 620 Q 660 570 680 530 Q 690 520 700 520 Z', terrain: 'hills' },
  
  // INDIA FARMLAND (edge)
  { id: 'india-farmland', path: 'M 400 520 Q 480 500 540 560 Q 560 620 520 680 Q 440 700 380 650 Q 340 590 370 540 Q 385 520 400 520 Z', terrain: 'farmland' },
  
  // MARSH areas
  { id: 'volga-marsh', path: 'M 200 260 Q 240 250 260 290 Q 250 330 210 320 Q 180 300 190 270 Q 195 260 200 260 Z', terrain: 'marsh' },
];

// Water bodies - major seas, lakes, rivers
const WATER_BODIES = [
  // Caspian Sea - larger
  { id: 'caspian', type: 'sea', path: 'M 230 300 Q 260 260 250 200 Q 230 240 200 300 Q 180 360 200 400 Q 230 420 250 380 Q 270 340 230 300 Z', name: 'Kaspianmeri' },
  // Aral Sea
  { id: 'aral', type: 'lake', path: 'M 320 260 Q 360 240 350 200 Q 310 210 300 250 Q 310 270 320 260 Z', name: 'Araljärvi' },
  // Black Sea - larger
  { id: 'black', type: 'sea', path: 'M 60 320 Q 120 290 180 310 Q 220 340 200 380 Q 140 400 80 380 Q 40 360 60 320 Z', name: 'Mustameri' },
  // Lake Baikal - larger
  { id: 'baikal', type: 'lake', path: 'M 760 100 Q 800 70 830 100 Q 850 150 820 180 Q 780 170 760 130 Q 750 110 760 100 Z', name: 'Baikaljärvi' },
  // Yellow Sea / Bohai - larger
  { id: 'bohai', type: 'sea', path: 'M 920 280 Q 970 260 1000 300 Q 1020 360 980 400 Q 930 420 900 380 Q 880 330 920 280 Z', name: 'Bohaimmeri' },
  // East China Sea
  { id: 'eastchina', type: 'sea', path: 'M 960 400 Q 1020 380 1060 440 Q 1080 520 1020 560 Q 960 580 940 520 Q 930 460 960 400 Z', name: 'Itä-Kiinanmeri' },
  // South China Sea
  { id: 'southchina', type: 'sea', path: 'M 860 560 Q 920 540 980 600 Q 1000 680 940 720 Q 860 740 820 680 Q 800 620 860 560 Z', name: 'Etelä-Kiinanmeri' },
  // Pacific Ocean edge
  { id: 'pacific', type: 'ocean', path: 'M 1040 100 L 1200 100 L 1200 700 L 1040 700 Q 1100 500 1080 300 Q 1060 200 1040 100 Z', name: 'Tyynimeri' },
  // Persian Gulf - larger
  { id: 'persian', type: 'sea', path: 'M 240 500 Q 300 480 360 520 Q 400 580 360 620 Q 280 640 240 600 Q 200 560 240 500 Z', name: 'Persianlahti' },
  // Indian Ocean edge
  { id: 'indian', type: 'ocean', path: 'M 100 620 L 600 680 Q 700 700 800 700 L 800 750 L 100 750 Z', name: 'Intian valtameri' },
  // Mediterranean edge
  { id: 'mediterranean', type: 'ocean', path: 'M 0 300 L 60 320 Q 40 380 0 400 L 0 300 Z', name: 'Välimeri' },
  // Baltic Sea edge
  { id: 'baltic', type: 'sea', path: 'M 0 150 Q 40 140 60 180 Q 40 220 0 230 L 0 150 Z', name: 'Itämeri' },
  // Sea of Japan
  { id: 'japan-sea', type: 'sea', path: 'M 1000 200 Q 1040 180 1060 240 Q 1050 300 1020 280 Q 990 250 1000 200 Z', name: 'Japanin meri' },
];

// Major rivers - more detailed
const RIVERS = [
  // Volga - longer
  { id: 'volga', path: 'M 220 80 Q 240 120 250 180 Q 260 250 240 320 Q 230 380 250 400', name: 'Volga' },
  // Dnieper
  { id: 'dnieper', path: 'M 100 140 Q 120 180 110 240 Q 100 300 80 350', name: 'Dnepr' },
  // Don
  { id: 'don', path: 'M 180 180 Q 170 220 160 280 Q 140 320 120 360', name: 'Don' },
  // Amu Darya - longer
  { id: 'amudarya', path: 'M 440 380 Q 400 350 360 300 Q 340 260 330 220', name: 'Amu-Darja' },
  // Syr Darya - longer
  { id: 'syrdarya', path: 'M 500 320 Q 450 300 400 270 Q 360 250 340 220', name: 'Syr-Darja' },
  // Yellow River (Huang He) - longer
  { id: 'huanghe', path: 'M 880 350 Q 840 330 780 350 Q 720 380 680 360 Q 640 340 620 380', name: 'Keltainenjoki' },
  // Yangtze - longer
  { id: 'yangtze', path: 'M 960 500 Q 900 480 840 500 Q 780 520 720 510 Q 660 500 620 530', name: 'Jangtse' },
  // Irtysh - longer
  { id: 'irtysh', path: 'M 480 260 Q 440 220 400 160 Q 380 120 360 80', name: 'Irtyš' },
  // Ob
  { id: 'ob', path: 'M 380 60 Q 400 100 420 160 Q 440 220 460 260', name: 'Ob' },
  // Yenisei
  { id: 'yenisei', path: 'M 560 50 Q 580 100 600 160 Q 620 220 640 260', name: 'Jenisei' },
  // Lena
  { id: 'lena', path: 'M 720 40 Q 740 80 760 140 Q 780 200 800 250', name: 'Lena' },
  // Amur
  { id: 'amur', path: 'M 860 180 Q 900 200 940 240 Q 970 270 1000 280', name: 'Amur' },
  // Indus
  { id: 'indus', path: 'M 440 440 Q 420 500 400 560 Q 380 620 360 680', name: 'Indus' },
  // Ganges
  { id: 'ganges', path: 'M 560 560 Q 520 580 480 600 Q 440 620 400 640', name: 'Ganges' },
  // Tigris/Euphrates
  { id: 'tigris', path: 'M 220 400 Q 240 450 260 500 Q 280 550 300 600', name: 'Tigris' },
];

// Mountain ranges - more detailed paths
const MOUNTAINS = [
  // Himalayas - extended
  { id: 'himalayas', path: 'M 440 520 Q 520 500 600 520 Q 680 510 740 540 Q 780 560 760 580', name: 'Himalaja', height: 'high' },
  // Tian Shan - extended
  { id: 'tianshan', path: 'M 400 300 Q 480 280 560 310 Q 620 330 660 360', name: 'Tian Shan', height: 'high' },
  // Altai - extended
  { id: 'altai', path: 'M 500 200 Q 560 180 620 210 Q 680 240 700 280', name: 'Altai', height: 'medium' },
  // Urals - full range
  { id: 'urals', path: 'M 270 60 Q 280 120 290 180 Q 300 250 290 320 Q 280 380 270 420', name: 'Ural', height: 'medium' },
  // Caucasus - extended
  { id: 'caucasus', path: 'M 160 360 Q 200 340 250 360 Q 300 380 320 400', name: 'Kaukasus', height: 'high' },
  // Kunlun - extended
  { id: 'kunlun', path: 'M 480 440 Q 560 420 640 450 Q 700 470 720 500', name: 'Kunlun', height: 'high' },
  // Hindu Kush - extended
  { id: 'hindukush', path: 'M 360 420 Q 420 400 480 440 Q 520 470 540 500', name: 'Hindukuš', height: 'high' },
  // Karakoram
  { id: 'karakoram', path: 'M 420 460 Q 460 440 500 470 Q 530 500 550 530', name: 'Karakoram', height: 'high' },
  // Great Khingan
  { id: 'khingan', path: 'M 860 180 Q 880 220 900 270 Q 920 320 940 360', name: 'Suur-Hingan', height: 'medium' },
  // Sayan
  { id: 'sayan', path: 'M 620 140 Q 680 120 740 150 Q 780 180 800 220', name: 'Sajan', height: 'medium' },
  // Stanovoy
  { id: 'stanovoy', path: 'M 800 100 Q 860 90 920 120 Q 960 150 980 190', name: 'Stanovoi', height: 'medium' },
  // Zagros
  { id: 'zagros', path: 'M 200 420 Q 240 440 280 480 Q 320 520 340 560', name: 'Zagros', height: 'medium' },
  // Elburz
  { id: 'elburz', path: 'M 240 380 Q 280 360 320 390 Q 360 420 380 450', name: 'Elburz', height: 'medium' },
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
    
    {/* Grassland pattern */}
    <pattern id="grassland-pattern" patternUnits="userSpaceOnUse" width="18" height="18">
      <rect width="18" height="18" fill="#7cb342" />
      <circle cx="4" cy="4" r="1.5" fill="#6aa52e" opacity="0.5" />
      <circle cx="14" cy="10" r="1" fill="#6aa52e" opacity="0.5" />
      <circle cx="8" cy="16" r="1.2" fill="#6aa52e" opacity="0.5" />
    </pattern>
    
    {/* Tundra pattern */}
    <pattern id="tundra-pattern" patternUnits="userSpaceOnUse" width="16" height="16">
      <rect width="16" height="16" fill="#b8c4cc" />
      <circle cx="4" cy="4" r="2" fill="#d1dce4" opacity="0.4" />
      <circle cx="12" cy="12" r="1.5" fill="#9eb0bc" opacity="0.4" />
    </pattern>
    
    {/* Marsh pattern */}
    <pattern id="marsh-pattern" patternUnits="userSpaceOnUse" width="14" height="14">
      <rect width="14" height="14" fill="#5d8a66" />
      <path d="M2 7 Q7 4 12 7" stroke="#4a7354" strokeWidth="1" fill="none" opacity="0.6" />
      <circle cx="4" cy="10" r="1" fill="#3b82f6" opacity="0.4" />
      <circle cx="10" cy="4" r="0.8" fill="#3b82f6" opacity="0.4" />
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
    
    {/* Neutral territory pattern (diagonal stripes) */}
    <pattern id="neutral-pattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
      <rect width="8" height="8" fill="transparent" />
      <line x1="0" y1="4" x2="8" y2="4" stroke="#4b5563" strokeWidth="2" opacity="0.5" />
    </pattern>
    
    {/* Faction border glow */}
    <filter id="border-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    
    {/* Attack target glow - red pulsing */}
    <filter id="attack-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feFlood floodColor="#ef4444" floodOpacity="0.8" result="red"/>
      <feComposite in="red" in2="coloredBlur" operator="in" result="coloredGlow"/>
      <feMerge>
        <feMergeNode in="coloredGlow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    {/* Attack arrow marker */}
    <marker id="attack-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
    </marker>
  </defs>
));

TerrainPatterns.displayName = 'TerrainPatterns';

// Get terrain fill based on terrain type
const getTerrainFill = (terrain: Province['terrain'] | string) => {
  const fills: Record<string, string> = {
    steppe: 'url(#steppe-pattern)',
    grassland: 'url(#grassland-pattern)',
    forest: 'url(#forest-pattern)',
    mountain: 'url(#mountain-pattern)',
    desert: 'url(#desert-pattern)',
    taiga: 'url(#taiga-pattern)',
    tundra: 'url(#tundra-pattern)',
    farmland: 'url(#farmland-pattern)',
    hills: 'url(#hills-pattern)',
    marsh: 'url(#marsh-pattern)',
  };
  return fills[terrain] || '#6b7280';
};

// Get terrain region fill
const getTerrainRegionFill = (terrain: string) => {
  return getTerrainFill(terrain);
};

// Province hex tile component
interface ProvinceTileProps {
  province: Province;
  pixel: { x: number; y: number };
  isSelected: boolean;
  isHighlighted: boolean;
  isAttackable: boolean; // NEW: enemy province that can be attacked
  isAttackModeActive: boolean; // When true, emphasize attack targets more
  isPlayerOwned: boolean;
  isNeutral: boolean;
  onClick: () => void;
  onHover: (province: Province | null) => void;
}

const ProvinceTile = memo(({
  province,
  pixel,
  isSelected,
  isHighlighted,
  isAttackable,
  isAttackModeActive,
  isPlayerOwned,
  isNeutral,
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
  
  // Determine stroke color based on state
  const getStrokeStyle = () => {
    if (isSelected) return { color: '#fbbf24', width: 3 };
    if (isAttackable) return { color: '#ef4444', width: 3 }; // Red for attack
    if (isHighlighted) return { color: '#22c55e', width: 2 }; // Green for move
    if (isNeutral) return { color: '#4b5563', width: 1 };
    return { color: '#374151', width: 1 };
  };
  
  const strokeStyle = getStrokeStyle();
  
  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHover(province)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
      style={{ transition: 'all 0.15s ease' }}
    >
      {/* Attack target pulsing ring - enhanced when attack mode active */}
      {isAttackable && (
        <polygon
          points={hexPath}
          fill={isAttackModeActive ? 'rgba(239, 68, 68, 0.3)' : 'none'}
          stroke="#ef4444"
          strokeWidth={isAttackModeActive ? 8 : 5}
          opacity={isAttackModeActive ? 1 : 0.6}
          filter="url(#attack-glow)"
          className="animate-pulse"
        />
      )}
      
      {/* Extra intense glow when attack mode active */}
      {isAttackable && isAttackModeActive && (
        <polygon
          points={hexPath}
          fill="none"
          stroke="#ff0000"
          strokeWidth={12}
          opacity={0.3}
          filter="url(#attack-glow)"
        />
      )}
      
      {/* Move target glow */}
      {isHighlighted && !isAttackable && (
        <polygon
          points={hexPath}
          fill="none"
          stroke="#22c55e"
          strokeWidth={4}
          opacity={0.5}
          filter="url(#province-glow)"
        />
      )}
      
      {/* Terrain base */}
      <polygon
        points={hexPath}
        fill={getTerrainFill(province.terrain)}
        stroke={strokeStyle.color}
        strokeWidth={strokeStyle.width}
        opacity={isNeutral ? 0.7 : 0.9}
      />
      
      {/* Faction ownership overlay */}
      {ownerColor && (
        <polygon
          points={hexPath}
          fill={ownerColor}
          opacity={0.4}
          stroke={ownerColor}
          strokeWidth={2}
        />
      )}
      
      {/* Neutral territory pattern (stripes) */}
      {isNeutral && (
        <polygon
          points={hexPath}
          fill="url(#neutral-pattern)"
          opacity={0.3}
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
            r={10}
            fill="#fbbf24"
            stroke="#1f2937"
            strokeWidth={2}
          />
          <text
            x={pixel.x}
            y={pixel.y + 4}
            textAnchor="middle"
            fontSize={12}
            fill="#1f2937"
          >
            ★
          </text>
        </g>
      )}
      
      {/* Fort indicator */}
      {province.fortLevel > 0 && !province.isCapital && (
        <g>
          <rect
            x={pixel.x - 7}
            y={pixel.y - 7}
            width={14}
            height={14}
            fill="#6b7280"
            stroke="#1f2937"
            strokeWidth={1}
            rx={2}
          />
          <text
            x={pixel.x}
            y={pixel.y + 4}
            textAnchor="middle"
            fontSize={10}
            fill="white"
          >
            {province.fortLevel}
          </text>
        </g>
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
  armies,
  selectedProvinceId,
  selectedArmyId,
  onProvinceClick,
  onArmyClick,
  playerFaction,
  highlightedProvinces = [],
  attackableProvinces = [],
  attackModeActive = false,
  movingArmyId,
  movingToProvinceId,
}: CivilizationMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredProvince, setHoveredProvince] = useState<Province | null>(null);
  const [hoveredArmy, setHoveredArmy] = useState<Army | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [animatingArmy, setAnimatingArmy] = useState<{ armyId: string; fromPixel: { x: number; y: number }; toPixel: { x: number; y: number }; progress: number } | null>(null);

  // Animate army movement
  useEffect(() => {
    if (movingArmyId && movingToProvinceId) {
      const army = armies.find(a => a.id === movingArmyId);
      const fromProvince = provinces.find(p => p.id === army?.provinceId);
      const toProvince = provinces.find(p => p.id === movingToProvinceId);
      
      if (army && fromProvince && toProvince) {
        const fromPixel = coordToPixel(fromProvince.center);
        const toPixel = coordToPixel(toProvince.center);
        
        setAnimatingArmy({ armyId: movingArmyId, fromPixel, toPixel, progress: 0 });
        
        const startTime = Date.now();
        const duration = 500; // 500ms animation
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          setAnimatingArmy(prev => prev ? { ...prev, progress } : null);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setTimeout(() => setAnimatingArmy(null), 100);
          }
        };
        
        requestAnimationFrame(animate);
      }
    }
  }, [movingArmyId, movingToProvinceId]);

  // Group armies by province
  const armiesByProvince = useMemo(() => {
    const grouped: Record<string, Army[]> = {};
    armies.forEach(army => {
      if (!grouped[army.provinceId]) {
        grouped[army.provinceId] = [];
      }
      grouped[army.provinceId].push(army);
    });
    return grouped;
  }, [armies]);

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

  // Faction borders - lines between provinces of different factions
  const factionBorders = useMemo(() => {
    const borders: { 
      from: { x: number; y: number }; 
      to: { x: number; y: number }; 
      color1: string;
      color2: string;
    }[] = [];
    
    provinces.forEach(province => {
      const pixel = coordToPixel(province.center);
      
      province.neighbors.forEach(neighborId => {
        const neighbor = provinces.find(p => p.id === neighborId);
        if (!neighbor || province.id >= neighborId) return; // Avoid duplicates
        
        // Only draw border if different factions
        if (province.ownerId !== neighbor.ownerId) {
          const neighborPixel = coordToPixel(neighbor.center);
          
          // Calculate midpoint for border
          const midX = (pixel.x + neighborPixel.x) / 2;
          const midY = (pixel.y + neighborPixel.y) / 2;
          
          // Calculate perpendicular direction
          const dx = neighborPixel.x - pixel.x;
          const dy = neighborPixel.y - pixel.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const perpX = -dy / len * 20;
          const perpY = dx / len * 20;
          
          borders.push({
            from: { x: midX - perpX, y: midY - perpY },
            to: { x: midX + perpX, y: midY + perpY },
            color1: province.ownerId ? FACTION_DATA_1206[province.ownerId]?.color || '#6b7280' : '#6b7280',
            color2: neighbor.ownerId ? FACTION_DATA_1206[neighbor.ownerId]?.color || '#6b7280' : '#6b7280',
          });
        }
      });
    });
    
    return borders;
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
        
        {/* TERRAIN REGIONS - Continental landmass with different terrain types */}
        {TERRAIN_REGIONS.map(region => (
          <path
            key={region.id}
            d={region.path}
            fill={getTerrainRegionFill(region.terrain)}
            opacity={0.85}
            stroke="#374151"
            strokeWidth={0.5}
            strokeOpacity={0.3}
          />
        ))}
        
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
        
        {/* Faction borders */}
        {factionBorders.map((border, i) => (
          <line
            key={`border-${i}`}
            x1={border.from.x}
            y1={border.from.y}
            x2={border.to.x}
            y2={border.to.y}
            stroke="#1f2937"
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.8}
          />
        ))}
        
        {/* Province tiles */}
        {provincePixels.map(({ province, pixel }) => (
          <ProvinceTile
            key={province.id}
            province={province}
            pixel={pixel}
            isSelected={province.id === selectedProvinceId}
            isHighlighted={highlightedProvinces.includes(province.id) && !attackableProvinces.includes(province.id)}
            isAttackable={attackableProvinces.includes(province.id)}
            isAttackModeActive={attackModeActive}
            isPlayerOwned={province.ownerId === playerFaction}
            isNeutral={province.ownerId === null}
            onClick={() => onProvinceClick(province.id)}
            onHover={setHoveredProvince}
          />
        ))}
        
        {/* Army markers */}
        {provincePixels.map(({ province, pixel }) => {
          const provincesArmies = armiesByProvince[province.id] || [];
          if (provincesArmies.length === 0) return null;
          
          return provincesArmies.map((army, armyIndex) => {
            const ownerColor = FACTION_DATA_1206[army.ownerId]?.color || '#888';
            const isSelected = army.id === selectedArmyId;
            const isPlayerArmy = army.ownerId === playerFaction;
            const totalUnits = army.cavalry + army.infantry;
            
            // Offset multiple armies in same province
            const offsetX = armyIndex * 15 - (provincesArmies.length - 1) * 7.5;
            const armyX = pixel.x + offsetX;
            const armyY = pixel.y - 20; // Position above province center
            
            // Check if this army is animating
            if (animatingArmy && animatingArmy.armyId === army.id) {
              const { fromPixel, toPixel, progress } = animatingArmy;
              const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
              const animX = fromPixel.x + (toPixel.x - fromPixel.x) * easeProgress;
              const animY = fromPixel.y - 20 + ((toPixel.y - 20) - (fromPixel.y - 20)) * easeProgress;
              
              return (
                <g key={army.id} className="pointer-events-none">
                  {/* Movement trail */}
                  <line
                    x1={fromPixel.x}
                    y1={fromPixel.y - 20}
                    x2={animX}
                    y2={animY}
                    stroke={ownerColor}
                    strokeWidth={2}
                    strokeDasharray="4,2"
                    opacity={0.5}
                  />
                  {/* Dust cloud effect */}
                  <circle cx={animX - 10} cy={animY + 5} r={4 + progress * 3} fill="#a78b5f" opacity={0.3 - progress * 0.3} />
                  <circle cx={animX - 5} cy={animY + 8} r={3 + progress * 2} fill="#a78b5f" opacity={0.2 - progress * 0.2} />
                  {/* Army marker */}
                  <g transform={`translate(${animX}, ${animY})`}>
                    <circle r={16} fill={ownerColor} stroke="#1f2937" strokeWidth={2} />
                    <Sword x={-8} y={-8} width={16} height={16} className="text-white" />
                    <text x={0} y={24} textAnchor="middle" fontSize={10} fill="white" style={{ textShadow: '0 0 3px black' }}>
                      {totalUnits}
                    </text>
                  </g>
                </g>
              );
            }
            
            return (
              <g 
                key={army.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onArmyClick(army.id);
                }}
                onMouseEnter={() => setHoveredArmy(army)}
                onMouseLeave={() => setHoveredArmy(null)}
                className="cursor-pointer"
                style={{ transition: 'transform 0.2s ease' }}
              >
                {/* Outer glow for visibility */}
                <circle
                  cx={armyX}
                  cy={armyY}
                  r={22}
                  fill={ownerColor}
                  opacity={0.25}
                />
                
                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={armyX}
                    cy={armyY}
                    r={24}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    className="animate-pulse"
                    opacity={0.9}
                  />
                )}
                
                {/* Army background - larger */}
                <circle
                  cx={armyX}
                  cy={armyY}
                  r={17}
                  fill={ownerColor}
                  stroke={isSelected ? '#fbbf24' : isPlayerArmy ? '#fbbf24' : '#1f2937'}
                  strokeWidth={isSelected ? 3 : isPlayerArmy ? 2.5 : 2}
                  filter={isSelected ? 'url(#province-glow)' : undefined}
                />
                
                {/* Army emoji icon - always visible */}
                <text
                  x={armyX}
                  y={armyY + 5}
                  textAnchor="middle"
                  fontSize={16}
                  className="pointer-events-none select-none"
                >
                  {army.cavalry > army.infantry ? '🐴' : '⚔️'}
                </text>
                
                {/* Unit count badge - always visible */}
                <rect
                  x={armyX - 16}
                  y={armyY + 16}
                  width={32}
                  height={14}
                  rx={7}
                  fill="rgba(0,0,0,0.85)"
                  stroke={ownerColor}
                  strokeWidth={1.5}
                />
                <text
                  x={armyX}
                  y={armyY + 26}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none select-none"
                >
                  {`${army.cavalry}🐴 ${army.infantry}⚔`}
                </text>
                
                {/* Movement indicator */}
                {isPlayerArmy && army.movementLeft > 0 && (
                  <circle
                    cx={armyX + 14}
                    cy={armyY - 14}
                    r={6}
                    fill="#22c55e"
                    stroke="#1f2937"
                    strokeWidth={1.5}
                  />
                )}
                
                {/* No movement left indicator */}
                {isPlayerArmy && army.movementLeft === 0 && (
                  <circle
                    cx={armyX + 14}
                    cy={armyY - 14}
                    r={6}
                    fill="#ef4444"
                    stroke="#1f2937"
                    strokeWidth={1.5}
                  />
                )}
              </g>
            );
          });
        })}
        
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
      
      {/* Province Tooltip */}
      {hoveredProvince && !hoveredArmy && (
        <ProvinceTooltip
          province={hoveredProvince}
          position={mousePosition}
        />
      )}
      
      {/* Army Tooltip */}
      {hoveredArmy && (
        <div
          className="absolute z-50 pointer-events-none bg-stone-900/95 border-2 border-amber-700/60 rounded-xl p-4 shadow-2xl min-w-[200px] backdrop-blur-sm"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y + 20,
            transform: mousePosition.x > window.innerWidth - 250 ? 'translateX(-100%)' : undefined,
          }}
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-700/30">
            <Sword className="w-5 h-5 text-red-400" />
            <div>
              <span className="text-amber-100 font-bold">Armeija</span>
              <span 
                className="ml-2 text-sm" 
                style={{ color: FACTION_DATA_1206[hoveredArmy.ownerId]?.color }}
              >
                {FACTION_DATA_1206[hoveredArmy.ownerId]?.name}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-stone-400 flex items-center gap-1">🐴 Ratsuväki:</span>
              <span className="text-amber-200 font-mono">{hoveredArmy.cavalry}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400 flex items-center gap-1">⚔️ Jalkaväki:</span>
              <span className="text-blue-200 font-mono">{hoveredArmy.infantry}</span>
            </div>
            {hoveredArmy.siege > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-stone-400">🏯 Piiritys:</span>
                <span className="text-stone-200 font-mono">{hoveredArmy.siege}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-stone-700">
              <span className="text-stone-400">Moraali:</span>
              <span className={`font-mono ${hoveredArmy.morale > 60 ? 'text-green-400' : hoveredArmy.morale > 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {hoveredArmy.morale}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Liike jäljellä:</span>
              <span className={`font-mono ${hoveredArmy.movementLeft > 0 ? 'text-green-400' : 'text-stone-500'}`}>
                {hoveredArmy.movementLeft}
              </span>
            </div>
            {hoveredArmy.leaderBonus > 0 && (
              <div className="text-amber-400 text-xs mt-2 flex items-center gap-1">
                <span>👑</span>
                <span>Johtajabonus: +{Math.round(hoveredArmy.leaderBonus * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-stone-900/95 border border-amber-700/40 rounded-lg p-3 text-xs max-w-[280px]">
        <div className="text-amber-200 font-bold mb-2">Valtakunnat</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-stone-300 mb-3">
          {Object.values(FACTION_DATA_1206).map(faction => (
            <div key={faction.id} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: faction.color }} />
              <span className="truncate">{faction.name.split(' ')[0]}</span>
            </div>
          ))}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded border border-dashed border-stone-500" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #4b5563 2px, #4b5563 4px)' }} />
            <span>Riippumaton</span>
          </div>
        </div>
        
        <div className="text-amber-200 font-bold mb-2 pt-2 border-t border-stone-700">Maasto</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-stone-300">
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
        <div className="mt-2 pt-2 border-t border-stone-700 flex flex-wrap gap-3">
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
