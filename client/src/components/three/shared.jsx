import { Environment, Lightformer } from '@react-three/drei';

// Global pointer (−1..1) tracked on window so canvases react even when UI overlays them.
export const pointer = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });
}

/** Studio lighting built from Lightformers — no HDR files to download. */
export function StudioEnv() {
  return (
    <Environment resolution={256} frames={1}>
      <group rotation={[-Math.PI / 3, 0, 1]}>
        <Lightformer form="circle" intensity={4} color="#fde68a" position={[0, 5, -9]} scale={2} />
        <Lightformer form="circle" intensity={2} color="#fb923c" position={[-5, 1, -1]} scale={2} />
        <Lightformer form="circle" intensity={2} color="#ffffff" position={[-5, -1, -1]} scale={2} />
        <Lightformer form="ring" intensity={3} color="#f59e0b" position={[10, 1, 0]} scale={8} />
        <Lightformer form="rect" intensity={1.5} color="#fff7ed" position={[0, 0, 10]} scale={[10, 2, 1]} />
      </group>
    </Environment>
  );
}
