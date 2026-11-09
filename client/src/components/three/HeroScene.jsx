import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, ContactShadows, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { StudioEnv, pointer } from './shared';
import { useInView } from '../../hooks/useInView';

const damp = THREE.MathUtils.damp;

// Floating "ingredients" orbiting the central dish.
const INGREDIENTS = [
  { type: 'tomato', color: '#ef4444' },
  { type: 'tomato', color: '#dc2626' },
  { type: 'herb', color: '#65a30d' },
  { type: 'herb', color: '#84cc16' },
  { type: 'herb', color: '#4d7c0f' },
  { type: 'ring', color: '#fb923c' },
  { type: 'ring', color: '#fde68a' },
  { type: 'gold', color: '#fbbf24' },
  { type: 'gold', color: '#f59e0b' },
  { type: 'gold', color: '#fcd34d' },
  { type: 'chili', color: '#b91c1c' },
  { type: 'chili', color: '#ea580c' },
  { type: 'pearl', color: '#f5ede1' },
  { type: 'pearl', color: '#fef3c7' },
];

function Ingredient({ type, color, position, scale, rotation }) {
  const ref = useRef(null);
  const spin = useMemo(() => (Math.random() - 0.5) * 0.8, []);
  const floatSpeed = useMemo(() => 1.5 + Math.random(), []);
  useFrame((_, dt) => {
    ref.current.rotation.x += dt * spin;
    ref.current.rotation.y += dt * spin * 0.7;
  });

  let geometry;
  let material = <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} />;
  switch (type) {
    case 'tomato':
      geometry = <sphereGeometry args={[0.32, 48, 48]} />;
      break;
    case 'herb':
      geometry = <icosahedronGeometry args={[0.26, 0]} />;
      material = <meshStandardMaterial color={color} roughness={0.6} flatShading />;
      break;
    case 'ring':
      geometry = <torusGeometry args={[0.26, 0.09, 24, 64]} />;
      break;
    case 'gold':
      geometry = <octahedronGeometry args={[0.18, 0]} />;
      material = <meshStandardMaterial color={color} metalness={1} roughness={0.15} />;
      break;
    case 'chili':
      geometry = <capsuleGeometry args={[0.1, 0.5, 8, 24]} />;
      break;
    default:
      geometry = <sphereGeometry args={[0.14, 32, 32]} />;
      material = <meshPhysicalMaterial color={color} roughness={0.05} clearcoat={1} />;
  }

  return (
    <Float speed={floatSpeed} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh ref={ref} position={position} scale={scale} rotation={rotation}>
        {geometry}
        {material}
      </mesh>
    </Float>
  );
}

function Plate() {
  // Lathe profile → a realistic shallow fine-dining plate.
  const points = useMemo(
    () =>
      [
        [0, 0], [1.1, 0], [1.25, 0.04], [1.3, 0.1], [1.75, 0.22], [2.05, 0.3], [2.1, 0.34], [2.05, 0.36], [1.7, 0.27], [1.28, 0.16], [0, 0.12],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );
  return (
    <mesh>
      <latheGeometry args={[points, 96]} />
      <meshPhysicalMaterial color="#f5ede1" roughness={0.18} clearcoat={1} clearcoatRoughness={0.05} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Dish() {
  const group = useRef(null);
  const ringA = useRef(null);
  const ringB = useRef(null);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const scroll = Math.min(window.scrollY / window.innerHeight, 1.5);
    const g = group.current;
    g.rotation.y = damp(g.rotation.y, pointer.x * 0.5 + scroll * 1.6, 3, dt);
    g.rotation.x = damp(g.rotation.x, 0.45 - pointer.y * 0.25 + scroll * 0.4, 3, dt);
    g.position.y = damp(g.position.y, -0.2 + scroll * 1.2, 4, dt);
    g.position.x = damp(g.position.x, pointer.x * 0.25, 3, dt);
    const s = 1 - scroll * 0.25;
    g.scale.setScalar(damp(g.scale.x, s, 4, dt));
    ringA.current.rotation.z = t * 0.35;
    ringB.current.rotation.z = -t * 0.25;
  });

  return (
    <group ref={group}>
      <Plate />
      {/* The "ember" — a molten glossy centrepiece */}
      <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.72, 64, 64]} />
          <MeshDistortMaterial color="#ea580c" emissive="#7c2d12" emissiveIntensity={0.6} roughness={0.12} metalness={0.2} distort={0.38} speed={2.2} />
        </mesh>
      </Float>
      <pointLight position={[0, 0.9, 0]} intensity={6} distance={4} color="#fb923c" />
      {/* Orbiting golden rings */}
      <group rotation={[Math.PI / 2.3, 0, 0]} position={[0, 0.85, 0]}>
        <mesh ref={ringA}>
          <torusGeometry args={[1.35, 0.018, 16, 160]} />
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
        </mesh>
      </group>
      <group rotation={[Math.PI / 1.8, 0.5, 0]} position={[0, 0.85, 0]}>
        <mesh ref={ringB}>
          <torusGeometry args={[1.65, 0.01, 16, 160]} />
          <meshStandardMaterial color="#fde68a" metalness={1} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function Ingredients() {
  const group = useRef(null);
  const items = useMemo(
    () =>
      INGREDIENTS.map((it, i) => {
        const angle = (i / INGREDIENTS.length) * Math.PI * 2;
        const radius = 2.6 + Math.random() * 1.6;
        return {
          ...it,
          position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 3.2, Math.sin(angle) * radius * 0.6 - 0.5],
          scale: 0.7 + Math.random() * 0.7,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        };
      }),
    []
  );
  useFrame((state, dt) => {
    const g = group.current;
    g.rotation.y += dt * 0.08;
    g.rotation.x = damp(g.rotation.x, pointer.y * 0.15, 2, dt);
  });
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Ingredient key={i} {...it} />
      ))}
    </group>
  );
}

export default function HeroScene() {
  // Start at a moderate pixel ratio and lower it automatically if the device struggles.
  const [dpr, setDpr] = useState(1.5);
  const wrap = useRef(null);
  const inView = useInView(wrap, '0px');
  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={dpr}
        frameloop={inView ? 'always' : 'never'}
        camera={{ position: [0, 1.2, 7.5], fov: 38 }}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
        <ambientLight intensity={0.25} />
        <spotLight position={[4, 8, 4]} angle={0.4} penumbra={1} intensity={60} color="#fff1db" />
        <pointLight position={[-6, -2, -2]} intensity={25} color="#f97316" />
        <Dish />
        <Ingredients />
        <Sparkles count={50} scale={[10, 6, 6]} size={2.5} speed={0.4} color="#fbbf24" opacity={0.8} />
        <ContactShadows position={[0, -1.6, 0]} opacity={0.45} scale={12} blur={2.4} far={4} resolution={256} frames={1} color="#000" />
        <StudioEnv />
      </Canvas>
    </div>
  );
}
