import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Province, FactionId, Army, FACTION_DATA_1206 } from '@/types/province';

interface GameBoard3DProps {
  provinces: Province[];
  armies: Army[];
  selectedProvinceId: string | null;
  selectedArmyId: string | null;
  onProvinceClick: (provinceId: string) => void;
  onArmyClick: (armyId: string) => void;
  playerFaction: FactionId;
  highlightedProvinces?: string[];
  attackableProvinces?: string[];
  attackModeActive?: boolean;
}

const coordToWorld = (center: { x: number; y: number }): [number, number, number] => {
  const x = (center.x - 40) * 0.5;
  const z = (center.y - 35) * 0.5;
  return [x, 0, z];
};

// Terrain config with procedural texture params
const TERRAIN_3D: Record<string, {
  height: number;
  color: string;
  emissive: string;
  roughness: number;
  metalness: number;
  detailColor: string;
}> = {
  steppe:    { height: 0.05, color: '#a8b077', emissive: '#2a2c1e', roughness: 0.85, metalness: 0.0, detailColor: '#8a9358' },
  grassland: { height: 0.08, color: '#7cb342', emissive: '#1e2c10', roughness: 0.8,  metalness: 0.0, detailColor: '#5a8a2e' },
  forest:    { height: 0.25, color: '#2d5a27', emissive: '#0a1a08', roughness: 0.9,  metalness: 0.0, detailColor: '#1a3a18' },
  mountain:  { height: 0.8,  color: '#7a7a7a', emissive: '#1a1a1a', roughness: 0.95, metalness: 0.1, detailColor: '#e0e8f0' },
  desert:    { height: 0.03, color: '#d4a574', emissive: '#3a2a1a', roughness: 0.95, metalness: 0.0, detailColor: '#c49460' },
  taiga:     { height: 0.2,  color: '#1e3a1a', emissive: '#080f08', roughness: 0.9,  metalness: 0.0, detailColor: '#0f2a0f' },
  tundra:    { height: 0.06, color: '#c8d4dc', emissive: '#2a2e32', roughness: 0.7,  metalness: 0.05, detailColor: '#e8f0f8' },
  farmland:  { height: 0.1,  color: '#8bc34a', emissive: '#1e2c10', roughness: 0.85, metalness: 0.0, detailColor: '#6a9a30' },
  hills:     { height: 0.4,  color: '#9e9e6e', emissive: '#262618', roughness: 0.88, metalness: 0.05, detailColor: '#7a7a50' },
  marsh:     { height: 0.02, color: '#5d8a66', emissive: '#162218', roughness: 0.6,  metalness: 0.1, detailColor: '#3a6a4a' },
};

const HEX_RADIUS = 0.7;

const createHexShape = (radius: number): THREE.Shape => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
};

// Procedural canvas texture generator
const createTerrainTexture = (terrainType: string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const terrain = TERRAIN_3D[terrainType] || TERRAIN_3D.steppe;

  // Base fill
  ctx.fillStyle = terrain.color;
  ctx.fillRect(0, 0, 128, 128);

  switch (terrainType) {
    case 'steppe':
    case 'grassland':
      // Grass blades
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        ctx.strokeStyle = i % 3 === 0 ? terrain.detailColor : '#9aaa60';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 3 - Math.random() * 4);
        ctx.stroke();
      }
      break;

    case 'desert':
      // Sand dunes
      for (let i = 0; i < 8; i++) {
        const y = 10 + Math.random() * 108;
        ctx.strokeStyle = terrain.detailColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 128; x += 8) {
          ctx.quadraticCurveTo(x + 4, y + Math.sin(x * 0.1) * 4, x + 8, y);
        }
        ctx.stroke();
      }
      // Sand dots
      for (let i = 0; i < 100; i++) {
        ctx.fillStyle = `rgba(200, 160, 100, ${Math.random() * 0.3})`;
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
      }
      break;

    case 'mountain':
      // Mountain peaks with snow caps
      for (let i = 0; i < 6; i++) {
        const cx = 20 + Math.random() * 88;
        const cy = 40 + Math.random() * 60;
        const h = 20 + Math.random() * 25;
        // Dark mountain body
        ctx.fillStyle = '#5a5a5a';
        ctx.beginPath();
        ctx.moveTo(cx - h * 0.6, cy);
        ctx.lineTo(cx, cy - h);
        ctx.lineTo(cx + h * 0.6, cy);
        ctx.closePath();
        ctx.fill();
        // Snow cap
        ctx.fillStyle = '#e8f0f8';
        ctx.beginPath();
        ctx.moveTo(cx - h * 0.15, cy - h * 0.65);
        ctx.lineTo(cx, cy - h);
        ctx.lineTo(cx + h * 0.15, cy - h * 0.65);
        ctx.closePath();
        ctx.fill();
      }
      break;

    case 'forest':
    case 'taiga':
      // Tree canopy circles
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const r = 3 + Math.random() * 5;
        const shade = terrainType === 'taiga' ? '#0f2a0f' : '#1a4a1a';
        ctx.fillStyle = shade;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        // Lighter highlight
        ctx.fillStyle = terrainType === 'taiga' ? '#1e3a1a' : '#2d5a27';
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'tundra':
      // Snow patches
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        ctx.fillStyle = `rgba(240, 248, 255, ${0.3 + Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 4 + Math.random() * 6, 2 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      // Frost crystals
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = '#d0e0f0';
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
      }
      break;

    case 'farmland':
      // Field rows
      for (let i = 0; i < 16; i++) {
        const y = i * 8;
        ctx.fillStyle = i % 2 === 0 ? '#7aaa38' : '#6a9a30';
        ctx.fillRect(0, y, 128, 8);
      }
      // Crop dots
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = '#98c44e';
        ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
      }
      break;

    case 'hills':
      // Rolling hills
      for (let i = 0; i < 5; i++) {
        const cx = Math.random() * 128;
        const cy = 50 + Math.random() * 50;
        ctx.fillStyle = terrain.detailColor;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 20 + Math.random() * 15, 10 + Math.random() * 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'marsh':
      // Water patches
      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = `rgba(59, 130, 246, ${0.15 + Math.random() * 0.2})`;
        ctx.beginPath();
        ctx.ellipse(Math.random() * 128, Math.random() * 128, 5 + Math.random() * 8, 3 + Math.random() * 4, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      // Reeds
      for (let i = 0; i < 30; i++) {
        ctx.strokeStyle = '#4a7a54';
        ctx.lineWidth = 0.8;
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 2, y - 5 - Math.random() * 4);
        ctx.stroke();
      }
      break;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
};

// Cache textures
const textureCache = new Map<string, THREE.CanvasTexture>();
const getTerrainTexture = (terrainType: string): THREE.CanvasTexture => {
  if (!textureCache.has(terrainType)) {
    textureCache.set(terrainType, createTerrainTexture(terrainType));
  }
  return textureCache.get(terrainType)!;
};

// Forest trees on top of hex
const ForestDecoration = ({ position, height, count, terrainType }: { position: [number, number, number]; height: number; count: number; terrainType: string }) => {
  const trees = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * HEX_RADIUS * 0.6;
      arr.push({
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        scale: 0.06 + Math.random() * 0.06,
        h: 0.15 + Math.random() * 0.15,
      });
    }
    return arr;
  }, [count]);

  const treeColor = terrainType === 'taiga' ? '#0f2a0f' : '#1a4a1a';
  const trunkColor = '#3d2b1f';

  return (
    <group position={[position[0], height, position[2]]}>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]}>
          {/* Trunk */}
          <mesh position={[0, t.h * 0.3, 0]}>
            <cylinderGeometry args={[t.scale * 0.3, t.scale * 0.4, t.h * 0.4, 4]} />
            <meshStandardMaterial color={trunkColor} roughness={0.95} />
          </mesh>
          {/* Canopy */}
          <mesh position={[0, t.h * 0.7, 0]}>
            <coneGeometry args={[t.scale, t.h, terrainType === 'taiga' ? 4 : 6]} />
            <meshStandardMaterial color={treeColor} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Snow cap on mountains
const SnowCap = ({ position, height }: { position: [number, number, number]; height: number }) => (
  <mesh position={[position[0], height + 0.02, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[HEX_RADIUS * 0.4, 6]} />
    <meshStandardMaterial color="#e8f0f8" emissive="#c0d0e0" emissiveIntensity={0.3} roughness={0.3} metalness={0.1} />
  </mesh>
);

// Province hex tile
const ProvinceTile = ({
  province, position, isSelected, isHighlighted, isAttackable, attackMode, factionColor, onClick,
}: {
  province: Province;
  position: [number, number, number];
  isSelected: boolean;
  isHighlighted: boolean;
  isAttackable: boolean;
  attackMode: boolean;
  factionColor: string | null;
  onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const terrain = TERRAIN_3D[province.terrain] || TERRAIN_3D.steppe;
  const height = terrain.height + province.fortLevel * 0.1 + province.developmentLevel * 0.03;

  const hexGeometry = useMemo(() => {
    const shape = createHexShape(HEX_RADIUS);
    return new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    });
  }, [height]);

  const texture = useMemo(() => getTerrainTexture(province.terrain), [province.terrain]);

  const tileColor = useMemo(() => {
    if (isAttackable && attackMode) return '#ff2222';
    if (isAttackable) return '#ff6644';
    if (isHighlighted) return '#44ff44';
    if (isSelected) return '#ffcc00';
    if (factionColor) {
      const fc = new THREE.Color(factionColor);
      const tc = new THREE.Color(terrain.color);
      return fc.lerp(tc, 0.5).getStyle();
    }
    return terrain.color;
  }, [isSelected, isHighlighted, isAttackable, attackMode, factionColor, terrain.color]);

  const emissiveColor = useMemo(() => {
    if (isAttackable && attackMode) return '#880000';
    if (isHighlighted) return '#004400';
    if (isSelected) return '#443300';
    if (hovered) return '#222222';
    return terrain.emissive;
  }, [isSelected, isHighlighted, isAttackable, attackMode, hovered, terrain.emissive]);

  useFrame(() => {
    if (!meshRef.current) return;
    if (isSelected || (isAttackable && attackMode)) {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.05;
    }
  });

  const showTrees = province.terrain === 'forest' || province.terrain === 'taiga';
  const showSnow = province.terrain === 'mountain' || province.terrain === 'tundra';

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={hexGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={tileColor}
          map={texture}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          roughness={terrain.roughness}
          metalness={terrain.metalness}
        />
      </mesh>

      {/* Trees */}
      {showTrees && (
        <ForestDecoration
          position={position}
          height={height}
          count={province.terrain === 'taiga' ? 6 : 8}
          terrainType={province.terrain}
        />
      )}

      {/* Snow cap */}
      {showSnow && <SnowCap position={[0, 0, 0]} height={height} />}

      {/* Faction ring */}
      {factionColor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height + 0.01, 0]}>
          <ringGeometry args={[HEX_RADIUS * 0.85, HEX_RADIUS * 0.95, 6]} />
          <meshStandardMaterial color={factionColor} emissive={factionColor} emissiveIntensity={0.5} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Capital */}
      {province.isCapital && (
        <mesh position={[0, height + 0.3, 0]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.8} metalness={0.8} roughness={0.2} />
        </mesh>
      )}

      {/* Fort */}
      {province.fortLevel > 0 && (
        <group position={[0.3, height, 0.3]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.12, 0.2, 0.12]} />
            <meshStandardMaterial color="#555555" roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[0.16, 0.04, 0.16]} />
            <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.3} />
          </mesh>
        </group>
      )}

      {/* Label */}
      <Billboard position={[0, height + 0.5, 0]}>
        <Text fontSize={0.15} color={isSelected ? '#ffcc00' : '#ffffff'} anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          {province.name.length > 12 ? province.name.slice(0, 10) + '…' : province.name}
        </Text>
      </Billboard>
    </group>
  );
};

// Army piece
const ArmyPiece = ({ army, position, isSelected, onClick }: {
  army: Army; position: [number, number, number]; isSelected: boolean; isPlayerArmy: boolean; onClick: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const factionData = FACTION_DATA_1206[army.ownerId];
  const totalUnits = army.cavalry + army.infantry + army.siege;
  const scale = 0.1 + Math.min(totalUnits / 50, 0.3);

  useFrame(() => {
    if (!meshRef.current) return;
    if (isSelected) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + 0.5 + Math.sin(Date.now() * 0.004) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color={factionData.color} emissive={factionData.color} emissiveIntensity={isSelected ? 1 : 0.3} transparent opacity={0.8} />
      </mesh>
      <mesh ref={meshRef} position={[0, 0.5, 0]} onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onClick(); }} castShadow>
        <coneGeometry args={[scale, scale * 2, army.cavalry > army.infantry ? 3 : 4]} />
        <meshStandardMaterial color={factionData.color} emissive={factionData.color} emissiveIntensity={isSelected ? 0.8 : 0.3} metalness={0.4} roughness={0.3} />
      </mesh>
      <Billboard position={[0, 0.9 + scale, 0]}>
        <Text fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000000" fontWeight="bold">
          {`🐴${army.cavalry} ⚔${army.infantry}`}
        </Text>
      </Billboard>
      {isSelected && (
        <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.35, 16]} />
          <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={1} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

// Animated water with waves
const AnimatedWater = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // Water texture with animated waves
  const waterTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    // Deep ocean base
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#0f2847');
    grad.addColorStop(0.5, '#1a3a5c');
    grad.addColorStop(1, '#0f2847');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    // Wave patterns
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(60, 130, 200, ${0.1 + Math.random() * 0.15})`;
      ctx.lineWidth = 1 + Math.random();
      ctx.beginPath();
      const y = Math.random() * 256;
      for (let x = 0; x < 256; x += 4) {
        ctx.lineTo(x, y + Math.sin(x * 0.05 + i) * 3);
      }
      ctx.stroke();
    }
    // Foam specks
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(180, 220, 255, ${Math.random() * 0.15})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.1 + Math.sin(clock.elapsedTime * 0.5) * 0.02;
    }
    if (waterTexture) {
      waterTexture.offset.x = Math.sin(clock.elapsedTime * 0.1) * 0.05;
      waterTexture.offset.y = clock.elapsedTime * 0.01;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[60, 40, 32, 32]} />
      <meshStandardMaterial
        ref={matRef}
        map={waterTexture}
        color="#1a3a5c"
        transparent
        opacity={0.9}
        roughness={0.05}
        metalness={0.4}
      />
    </mesh>
  );
};

// Board base with wood grain texture
const BoardBase = () => {
  const woodTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#3d2b1f';
    ctx.fillRect(0, 0, 256, 256);
    // Wood grain lines
    for (let i = 0; i < 30; i++) {
      ctx.strokeStyle = `rgba(60, 40, 25, ${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 0.5 + Math.random();
      ctx.beginPath();
      const y = Math.random() * 256;
      for (let x = 0; x < 256; x += 2) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i * 0.5) * 3);
      }
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    return tex;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
      <planeGeometry args={[65, 45]} />
      <meshStandardMaterial map={woodTexture} color="#3d2b1f" roughness={0.9} metalness={0.05} />
    </mesh>
  );
};

// Scene content
const GameScene = ({
  provinces, armies, selectedProvinceId, selectedArmyId, onProvinceClick, onArmyClick, playerFaction,
  highlightedProvinces = [], attackableProvinces = [], attackModeActive = false,
}: GameBoard3DProps) => {
  const armiesByProvince = useMemo(() => {
    const map = new Map<string, Army[]>();
    armies.forEach(army => {
      const existing = map.get(army.provinceId) || [];
      existing.push(army);
      map.set(army.provinceId, existing);
    });
    return map;
  }, [armies]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 15, 5]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-25} shadow-camera-right={25} shadow-camera-top={25} shadow-camera-bottom={-25} />
      <pointLight position={[-10, 8, -5]} intensity={0.3} color="#ff8844" />
      <hemisphereLight args={['#b1e1ff', '#3d2b1f', 0.3]} />
      <Stars radius={100} depth={50} count={1000} factor={3} />

      <BoardBase />
      <AnimatedWater />

      {provinces.map(province => {
        const worldPos = coordToWorld(province.center);
        const factionColor = province.ownerId ? FACTION_DATA_1206[province.ownerId]?.color || null : null;
        return (
          <ProvinceTile
            key={province.id}
            province={province}
            position={worldPos}
            isSelected={selectedProvinceId === province.id}
            isHighlighted={highlightedProvinces.includes(province.id)}
            isAttackable={attackableProvinces.includes(province.id)}
            attackMode={attackModeActive}
            factionColor={factionColor}
            onClick={() => onProvinceClick(province.id)}
          />
        );
      })}

      {armies.map((army) => {
        const province = provinces.find(p => p.id === army.provinceId);
        if (!province) return null;
        const worldPos = coordToWorld(province.center);
        const armiesInProvince = armiesByProvince.get(army.provinceId) || [];
        const armyIndex = armiesInProvince.indexOf(army);
        const offset = armyIndex * 0.4;
        return (
          <ArmyPiece
            key={army.id}
            army={army}
            position={[worldPos[0] + offset, worldPos[1], worldPos[2] + 0.3]}
            isSelected={selectedArmyId === army.id}
            isPlayerArmy={army.ownerId === playerFaction}
            onClick={() => onArmyClick(army.id)}
          />
        );
      })}

      <OrbitControls makeDefault enablePan enableZoom enableRotate minDistance={5} maxDistance={35} minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} target={[3, 0, 0]} />
    </>
  );
};

const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#f59e0b" wireframe />
  </mesh>
);

export const GameBoard3D = (props: GameBoard3DProps) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
      <Canvas
        shadows
        camera={{ position: [0, 20, 15], fov: 50, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a1a' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <GameScene {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};
