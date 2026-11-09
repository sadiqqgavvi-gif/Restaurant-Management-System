import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { StudioEnv, pointer } from './shared';
import { useInView } from '../../hooks/useInView';

const damp = THREE.MathUtils.damp;
const smooth = THREE.MathUtils.smoothstep;

/**
 * A golden cloche that lifts off a plate as the user scrolls,
 * revealing a glowing dish. `progress` is a ref (0..1) driven by GSAP ScrollTrigger.
 */
function Cloche({ progress }) {
  const root = useRef(null);
  const lid = useRef(null);
  const glow = useRef(null);
  const light = useRef(null);

  const platePoints = useMemo(
    () => [[0, 0], [1.3, 0], [1.45, 0.06], [2.0, 0.2], [2.25, 0.28], [2.2, 0.31], [1.9, 0.24], [1.4, 0.13], [0, 0.1]].map(([x, y]) => new THREE.Vector2(x, y)),
    []
  );

  useFrame((state, dt) => {
    const p = progress.current;
    const lift = smooth(p, 0.04, 0.3);
    root.current.rotation.y += dt * 0.25;
    root.current.rotation.x = damp(root.current.rotation.x, 0.35 - pointer.y * 0.15, 3, dt);
    lid.current.position.y = damp(lid.current.position.y, 0.25 + lift * 2.4, 5, dt);
    lid.current.position.x = damp(lid.current.position.x, lift * 0.8, 5, dt);
    lid.current.rotation.z = damp(lid.current.rotation.z, -lift * 0.6, 5, dt);
    const s = damp(glow.current.scale.x, 0.3 + lift * 0.7, 4, dt);
    glow.current.scale.setScalar(s);
    light.current.intensity = damp(light.current.intensity, lift * 10, 4, dt);
  });

  return (
    <group ref={root} position={[0, -0.6, 0]}>
      <mesh receiveShadow>
        <latheGeometry args={[platePoints, 96]} />
        <meshPhysicalMaterial color="#1b1612" roughness={0.25} clearcoat={1} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.22, 0.03, 16, 128]} />
        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
      </mesh>

      <mesh ref={glow} position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.85, 64, 64]} />
        <MeshDistortMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={1.4} roughness={0.2} distort={0.45} speed={3} />
      </mesh>
      <pointLight ref={light} position={[0, 1, 0]} intensity={0} distance={6} color="#fbbf24" />

      <group ref={lid} position={[0, 0.25, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[1.65, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f5c76a" metalness={0.85} roughness={0.22} envMapIntensity={2.2} emissive="#7c2d12" emissiveIntensity={0.15} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.65, 0.05, 16, 128]} />
          <meshStandardMaterial color="#d97706" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.16, 32, 32]} />
          <meshStandardMaterial color="#fde68a" metalness={1} roughness={0.1} />
        </mesh>
      </group>
      <Sparkles count={40} scale={[4, 3, 4]} position={[0, 1.2, 0]} size={3} speed={0.6} color="#fde68a" />
    </group>
  );
}

export default function ClocheScene({ progress }) {
  const wrap = useRef(null);
  const inView = useInView(wrap);
  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas dpr={[1, 1.5]} frameloop={inView ? 'always' : 'never'} camera={{ position: [0, 3.2, 11.5], fov: 35 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[-5, 3, 4]} intensity={40} color="#fbbf24" />
        <spotLight position={[3, 8, 5]} angle={0.5} penumbra={1} intensity={50} color="#fff1db" />
        <Cloche progress={progress} />
        <StudioEnv />
      </Canvas>
    </div>
  );
}
