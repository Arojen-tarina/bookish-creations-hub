import { useRef, useMemo, useState, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Province, FactionId, Army, PROVINCE_TERRAIN_INFO, FACTION_DATA_1206 } from '@/types/province';

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

// Map province center coords to 3D world space
const coordToWorld = (center: { x: number; y: number }): [number, number, number] => {
  const x = (center.x - 40) * 0.5;
  const z = (center.y - 35) * 0.5;
  return [x, 0, z];
};

// Terrain heights and colors
const TERRAIN_3D: Record<string, { height: number; color: string; emissive: string }> = {
  steppe:    { height: 0.05, color: '#a8b077', emissive: '#2a2c1e' },
  grassland: { height: 0.08, color: '#7cb342', emissive: '#1e2c10' },
  forest:    { height: 0.25, color: '#2d5a27', emissive: '#0a1a08' },
  mountain:  { height: 0.8,  color: '#8a8a8a', emissive: '#1a1a1a' },
  desert:    { height: 0.03, color: '#d4a574', emissive: '#3a2a1a' },
  taiga:     { height: 0.2,  color: '#1e3a1a', emissive: '#080f08' },
  tundra:    { height: 0.06, color: '#b8c4cc', emissive: '#2a2e32' },
  farmland:  { height: 0.1,  color: '#8bc34a', emissive: '#1e2c10' },
  hills:     { height: 0.4,  color: '#9e9e6e', emissive: '#262618' },
  marsh:     { height: 0.02, color: '#5d8a66', emissive: '#162218' },
};

// Hexagonal tile geometry
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

// Province hex tile component
const ProvinceTile = ({
  province,
  position,
  isSelected,
  isHighlighted,
  isAttackable,
  attackMode,
  factionColor,
  onClick,
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
    const extrudeSettings = {
      depth: height,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 1,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [height]);

  // Determine tile color
  const tileColor = useMemo(() => {
    if (isAttackable && attackMode) return '#ff2222';
    if (isAttackable) return '#ff6644';
    if (isHighlighted) return '#44ff44';
    if (isSelected) return '#ffcc00';
    if (factionColor) {
      // Blend faction color with terrain color
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

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Pulse animation for selected/highlighted
    if (isSelected || (isAttackable && attackMode)) {
      meshRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.05;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={hexGeometry}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={tileColor}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.4 : 0.2}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Faction ownership ring */}
      {factionColor && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height + 0.01, 0]}>
          <ringGeometry args={[HEX_RADIUS * 0.85, HEX_RADIUS * 0.95, 6]} />
          <meshStandardMaterial
            color={factionColor}
            emissive={factionColor}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Capital marker */}
      {province.isCapital && (
        <mesh position={[0, height + 0.3, 0]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={0.8}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Fort indicator */}
      {province.fortLevel > 0 && (
        <mesh position={[0.3, height + 0.15, 0.3]}>
          <boxGeometry args={[0.15, 0.3, 0.15]} />
          <meshStandardMaterial color="#666666" roughness={0.5} metalness={0.3} />
        </mesh>
      )}

      {/* Province name label */}
      <Billboard position={[0, height + 0.5, 0]}>
        <Text
          fontSize={0.15}
          color={isSelected ? '#ffcc00' : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {province.name.length > 12 ? province.name.slice(0, 10) + '…' : province.name}
        </Text>
      </Billboard>
    </group>
  );
};

// Army piece component
const ArmyPiece = ({
  army,
  position,
  isSelected,
  isPlayerArmy,
  onClick,
}: {
  army: Army;
  position: [number, number, number];
  isSelected: boolean;
  isPlayerArmy: boolean;
  onClick: () => void;
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
      {/* Base */}
      <mesh
        position={[0, 0.35, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial
          color={factionData.color}
          emissive={factionData.color}
          emissiveIntensity={isSelected ? 1 : 0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Main piece - cavalry (horse shape approximation) */}
      <mesh
        ref={meshRef}
        position={[0, 0.5, 0]}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
      >
        <coneGeometry args={[scale, scale * 2, army.cavalry > army.infantry ? 3 : 4]} />
        <meshStandardMaterial
          color={factionData.color}
          emissive={factionData.color}
          emissiveIntensity={isSelected ? 0.8 : 0.3}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Army strength label */}
      <Billboard position={[0, 0.9 + scale, 0]}>
        <Text
          fontSize={0.18}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
          fontWeight="bold"
        >
          {`🐴${army.cavalry} ⚔${army.infantry}`}
        </Text>
      </Billboard>

      {/* Selection glow ring */}
      {isSelected && (
        <mesh position={[0, 0.36, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.25, 0.35, 16]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  );
};

// Water plane
const WaterPlane = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.1 + Math.sin(clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[60, 40]} />
      <meshStandardMaterial
        color="#1a3a5c"
        transparent
        opacity={0.85}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  );
};

// Board base (wooden table look)
const BoardBase = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
    <planeGeometry args={[65, 45]} />
    <meshStandardMaterial
      color="#3d2b1f"
      roughness={0.9}
      metalness={0.05}
    />
  </mesh>
);

// Scene content
const GameScene = ({
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
}: GameBoard3DProps) => {
  // Group armies by province
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
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[-10, 8, -5]} intensity={0.3} color="#ff8844" />
      <hemisphereLight args={['#b1e1ff', '#3d2b1f', 0.3]} />

      {/* Sky */}
      <Stars radius={100} depth={50} count={1000} factor={3} />

      {/* Board base */}
      <BoardBase />
      <WaterPlane />

      {/* Province tiles */}
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

      {/* Army pieces */}
      {armies.map((army, index) => {
        const province = provinces.find(p => p.id === army.provinceId);
        if (!province) return null;

        const worldPos = coordToWorld(province.center);
        const armiesInProvince = armiesByProvince.get(army.provinceId) || [];
        const armyIndex = armiesInProvince.indexOf(army);
        // Offset multiple armies in same province
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

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={35}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        target={[3, 0, 0]}
      />
    </>
  );
};

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#f59e0b" wireframe />
  </mesh>
);

// Main component
export const GameBoard3D = (props: GameBoard3DProps) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden" style={{ minHeight: '500px' }}>
      <Canvas
        shadows
        camera={{
          position: [0, 20, 15],
          fov: 50,
          near: 0.1,
          far: 200,
        }}
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
