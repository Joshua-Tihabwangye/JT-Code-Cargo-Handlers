"use client";

import {
  Component,
  Suspense,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { ResponsiveSceneConfig, SceneProps } from "./types";

const ORANGE = "#f97316";
const ICE = "#f8fafc";
const BLUE = "#38bdf8";
const DARK = "#071019";

interface SceneErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface SceneErrorBoundaryState {
  failed: boolean;
}

class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("JT-Code Cargo 3D scene unavailable; using fallback.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}

function useResponsiveScene(): ResponsiveSceneConfig {
  const [config, setConfig] = useState<ResponsiveSceneConfig>({
    isMobile: true,
    particleCount: 90,
    maxDpr: 1.25,
    shadows: false,
    parallaxStrength: 0,
  });

  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const updateConfig = () => {
      const mobile = query.matches;
      const lowPower = (navigator.hardwareConcurrency ?? 4) <= 4;
      setConfig({
        isMobile: mobile,
        particleCount: mobile || lowPower ? 90 : 190,
        maxDpr: mobile ? 1.25 : 1.75,
        shadows: !mobile && !lowPower,
        parallaxStrength: mobile ? 0 : 0.22,
      });
    };
    const frame = window.requestAnimationFrame(updateConfig);
    query.addEventListener("change", updateConfig);
    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener("change", updateConfig);
    };
  }, []);

  return config;
}

function SceneFallback() {
  return (
    <div className="scene-fallback" role="img" aria-label="Abstract cargo route grid">
      <div className="scene-fallback__horizon" />
      <div className="scene-fallback__route" />
      <p>VESSEL · PORT · TRANSIT · WAREHOUSE</p>
    </div>
  );
}

function LowPolyWater() {
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = -0.43 + Math.sin(clock.elapsedTime * 0.65) * 0.035;
    }
  });

  return (
    <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[-5, -0.43, 0]}>
      <planeGeometry args={[22, 22, 16, 16]} />
      <meshStandardMaterial
        color="#071b29"
        roughness={0.7}
        metalness={0.28}
        wireframe
        transparent
        opacity={0.68}
      />
    </mesh>
  );
}

export function CargoShip() {
  const shipRef = useRef<THREE.Group>(null);
  const containersRef = useRef<THREE.InstancedMesh>(null);
  const containerPositions = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    for (let row = 0; row < 2; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        positions.push([-1.8 + column * 1.18, 1.04 + row * 0.68, row === 0 ? -0.45 : 0.45]);
      }
    }
    return positions;
  }, []);

  useEffect(() => {
    const mesh = containersRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const palette = [ICE, "#64748b", "#334155", BLUE];
    containerPositions.forEach((position, index) => {
      matrix.setPosition(position[0], position[1], position[2]);
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, new THREE.Color(palette[index % palette.length]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [containerPositions]);

  useFrame(({ clock }) => {
    if (shipRef.current) {
      shipRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.48) * 0.012;
      shipRef.current.position.y = Math.sin(clock.elapsedTime * 0.62) * 0.025;
    }
  });

  return (
    <group ref={shipRef} position={[-5.1, 0, 0]}>
      <mesh position={[0, 0.15, 0]} scale={[1, 1, 1.05]}>
        <boxGeometry args={[7.1, 0.8, 2.45]} />
        <meshStandardMaterial color="#111c26" roughness={0.42} metalness={0.58} />
      </mesh>
      <mesh position={[-2.6, 0.74, 0]}>
        <boxGeometry args={[1.25, 1.25, 2]} />
        <meshStandardMaterial color={ICE} roughness={0.62} />
      </mesh>
      <mesh position={[-2.94, 1.55, 0]}>
        <boxGeometry args={[0.25, 0.8, 0.35]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} />
      </mesh>
      <instancedMesh ref={containersRef} args={[undefined, undefined, containerPositions.length]}>
        <boxGeometry args={[1.02, 0.55, 0.72]} />
        <meshStandardMaterial roughness={0.55} metalness={0.22} />
      </instancedMesh>
      <mesh position={[3.15, 0.22, 0]} rotation={[0, 0, -0.38]}>
        <boxGeometry args={[1.4, 0.65, 2.32]} />
        <meshStandardMaterial color="#0c151f" metalness={0.62} roughness={0.36} />
      </mesh>
    </group>
  );
}

interface HarborCraneProps {
  progressRef: SceneProps["progressRef"];
}

export function HarborCrane({ progressRef }: HarborCraneProps) {
  const trolleyRef = useRef<THREE.Group>(null);
  const cableRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const p = progressRef.current;
    const transfer = THREE.MathUtils.smoothstep(p, 0.27, 0.4);
    const returnAmount = THREE.MathUtils.smoothstep(p, 0.48, 0.58);
    const trolleyX = THREE.MathUtils.lerp(-3.3, 2.7, transfer - returnAmount * 0.72);
    if (trolleyRef.current) trolleyRef.current.position.x = trolleyX;
    if (cableRef.current) {
      const lift = THREE.MathUtils.smoothstep(p, 0.17, 0.28);
      const lower = THREE.MathUtils.smoothstep(p, 0.4, 0.49);
      const cableLength = THREE.MathUtils.lerp(5.4, 1.15, lift - lower);
      cableRef.current.scale.y = cableLength;
      cableRef.current.position.y = -cableLength / 2;
    }
  });

  return (
    <group position={[-1.1, 0, 0]}>
      <mesh position={[0, 3.7, 0]}>
        <boxGeometry args={[0.55, 7.4, 0.65]} />
        <meshStandardMaterial color="#293849" metalness={0.72} roughness={0.34} />
      </mesh>
      <mesh position={[0.35, 7.2, 0]}>
        <boxGeometry args={[8.7, 0.35, 0.45]} />
        <meshStandardMaterial color={ORANGE} metalness={0.62} roughness={0.36} />
      </mesh>
      <mesh position={[-0.8, 4.2, 0]} rotation={[0, 0, -0.53]}>
        <boxGeometry args={[0.24, 6.2, 0.28]} />
        <meshStandardMaterial color="#263547" metalness={0.68} />
      </mesh>
      <mesh position={[0.8, 4.2, 0]} rotation={[0, 0, 0.53]}>
        <boxGeometry args={[0.24, 6.2, 0.28]} />
        <meshStandardMaterial color="#263547" metalness={0.68} />
      </mesh>
      <group ref={trolleyRef} position={[-3.3, 6.95, 0]}>
        <mesh>
          <boxGeometry args={[0.76, 0.48, 0.7]} />
          <meshStandardMaterial color={ICE} roughness={0.42} />
        </mesh>
        <mesh ref={cableRef} position={[0, -2.7, 0]}>
          <cylinderGeometry args={[0.026, 0.026, 1, 8]} />
          <meshBasicMaterial color="#cbd5e1" />
        </mesh>
      </group>
    </group>
  );
}

export const CargoContainer = forwardRef<THREE.Group>(function CargoContainer(_, ref) {
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[2.2, 1.4, 1.25]} />
        <meshStandardMaterial color={ORANGE} metalness={0.34} roughness={0.48} />
      </mesh>
      {[-0.82, -0.42, 0, 0.42, 0.82].map((x) => (
        <mesh key={x} position={[x, 0, 0.631]}>
          <boxGeometry args={[0.045, 1.15, 0.035]} />
          <meshBasicMaterial color="#9a3412" />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.655]}>
        <boxGeometry args={[0.66, 0.23, 0.035]} />
        <meshBasicMaterial color="#fff7ed" />
      </mesh>
    </group>
  );
});

interface CargoTruckProps {
  progressRef: SceneProps["progressRef"];
}

export function CargoTruck({ progressRef }: CargoTruckProps) {
  const truckRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const travel = THREE.MathUtils.smoothstep(progressRef.current, 0.49, 0.76);
    if (truckRef.current) truckRef.current.position.x = THREE.MathUtils.lerp(1.65, 12.3, travel);
    if (wheelsRef.current) wheelsRef.current.rotation.z = -travel * 24;
  });

  return (
    <group ref={truckRef} position={[1.65, 0.35, 0]}>
      <mesh position={[-1.55, 0.9, 0]}>
        <boxGeometry args={[1.6, 1.65, 1.72]} />
        <meshStandardMaterial color={ICE} metalness={0.2} roughness={0.48} />
      </mesh>
      <mesh position={[-1.7, 1.22, 0.87]}>
        <boxGeometry args={[0.85, 0.55, 0.03]} />
        <meshBasicMaterial color="#082f49" />
      </mesh>
      <mesh position={[0.65, 0.5, 0]}>
        <boxGeometry args={[3.5, 0.28, 1.65]} />
        <meshStandardMaterial color="#26384b" metalness={0.66} roughness={0.36} />
      </mesh>
      <mesh position={[-1.5, 0.63, 0.88]}>
        <boxGeometry args={[0.8, 0.16, 0.03]} />
        <meshBasicMaterial color={ORANGE} />
      </mesh>
      <group ref={wheelsRef}>
        {[-1.5, 0.9].flatMap((x) =>
          [-0.9, 0.9].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.48, 0.48, 0.22, 18]} />
              <meshStandardMaterial color="#05080b" roughness={0.82} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}

interface LoadingBayProps {
  progressRef: SceneProps["progressRef"];
}

export function LoadingBay({ progressRef }: LoadingBayProps) {
  const doorRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const open = THREE.MathUtils.smoothstep(progressRef.current, 0.77, 0.86);
    if (doorRef.current) doorRef.current.position.y = 2.35 + open * 3.5;
  });

  return (
    <group position={[-3.02, 0, 0]}>
      <mesh position={[0, 2.25, 0.05]}>
        <boxGeometry args={[0.18, 4.6, 3.9]} />
        <meshStandardMaterial color="#020617" roughness={0.86} />
      </mesh>
      <mesh ref={doorRef} position={[-0.12, 2.35, 0.05]}>
        <boxGeometry args={[0.14, 4.2, 3.55]} />
        <meshStandardMaterial color="#526276" metalness={0.58} roughness={0.42} />
      </mesh>
      <pointLight position={[-1.2, 2.1, 0]} color={BLUE} intensity={2.2} distance={7} />
    </group>
  );
}

interface WarehouseProps {
  progressRef: SceneProps["progressRef"];
}

export function Warehouse({ progressRef }: WarehouseProps) {
  return (
    <group position={[16.2, 0, 0]}>
      <mesh position={[0, 3.4, 0]}>
        <boxGeometry args={[6.2, 6.8, 9]} />
        <meshStandardMaterial color="#182536" metalness={0.3} roughness={0.67} />
      </mesh>
      <mesh position={[0, 6.87, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[6.5, 0.24, 9.3]} />
        <meshStandardMaterial color="#2c3f55" metalness={0.56} />
      </mesh>
      <LoadingBay progressRef={progressRef} />
      {[-2.1, 0, 2.1].map((z) => (
        <mesh key={z} position={[-3.11, 5.7, z]}>
          <boxGeometry args={[0.08, 0.38, 1.25]} />
          <meshBasicMaterial color={z === 0 ? ORANGE : BLUE} />
        </mesh>
      ))}
    </group>
  );
}

interface ScanBeamProps {
  progressRef: SceneProps["progressRef"];
}

export function ScanBeam({ progressRef }: ScanBeamProps) {
  const beamRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const active = THREE.MathUtils.smoothstep(progressRef.current, 0.86, 0.93);
    if (beamRef.current) {
      beamRef.current.visible = active > 0.02;
      beamRef.current.position.z = -2.7 + ((clock.elapsedTime * 1.8) % 2.6);
    }
    if (materialRef.current) materialRef.current.opacity = active * 0.34;
  });

  return (
    <mesh ref={beamRef} position={[13.4, 2.3, -2.7]}>
      <boxGeometry args={[0.08, 3.6, 3.1]} />
      <meshBasicMaterial
        ref={materialRef}
        color={BLUE}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface ParticleSystemProps {
  count: number;
}

export function ParticleSystem({ count }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const seed = index * 12.9898;
      const wave = Math.sin(seed) * 43758.5453;
      const fract = wave - Math.floor(wave);
      values[index * 3] = fract * 29 - 9;
      values[index * 3 + 1] = 0.7 + ((index * 1.73) % 8.2);
      values[index * 3 + 2] = Math.sin(index * 2.17) * 6.5;
    }
    return values;
  }, [count]);

  useFrame(({ clock }) => {
    if (pointsRef.current) pointsRef.current.rotation.y = clock.elapsedTime * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#94a3b8" size={0.035} transparent opacity={0.44} depthWrite={false} />
    </points>
  );
}

interface SceneContentsProps extends SceneProps {
  config: ResponsiveSceneConfig;
}

function SceneContents({ progressRef, reducedMotion, config }: SceneContentsProps) {
  const containerRef = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const p = reducedMotion ? 0 : progressRef.current;
    const craneLift = THREE.MathUtils.smoothstep(p, 0.17, 0.28);
    const craneTransfer = THREE.MathUtils.smoothstep(p, 0.28, 0.4);
    const craneLower = THREE.MathUtils.smoothstep(p, 0.4, 0.5);
    const truckTravel = THREE.MathUtils.smoothstep(p, 0.5, 0.76);
    const warehouseLoad = THREE.MathUtils.smoothstep(p, 0.82, 0.93);

    if (containerRef.current) {
      let x = -4.4;
      let y = 1.48 + craneLift * 4.75;
      let z = 0;
      if (craneTransfer > 0) {
        x = THREE.MathUtils.lerp(-4.4, 1.65, craneTransfer);
        y += Math.sin(craneTransfer * Math.PI) * 0.26;
        containerRef.current.rotation.z = Math.sin(craneTransfer * Math.PI * 2) * 0.035;
      }
      if (craneLower > 0) y = THREE.MathUtils.lerp(6.23, 2.03, craneLower);
      if (truckTravel > 0) x = THREE.MathUtils.lerp(1.65, 12.3, truckTravel);
      if (warehouseLoad > 0) {
        x = THREE.MathUtils.lerp(12.3, 13.55, warehouseLoad);
        z = THREE.MathUtils.lerp(0, -2.3, warehouseLoad);
      }
      containerRef.current.position.set(x, y, z);
    }

    const zone2 = THREE.MathUtils.smoothstep(p, 0.2, 0.45);
    const zone3 = THREE.MathUtils.smoothstep(p, 0.48, 0.72);
    const zone4 = THREE.MathUtils.smoothstep(p, 0.73, 0.96);
    const desiredX = 6.8 + zone2 * 0.7 + zone3 * 6.8 + zone4 * 2.4;
    const desiredY = 6.3 - zone2 * 0.8 - zone3 * 1.4 + zone4 * 0.2;
    const desiredZ = 13.2 - zone2 * 0.8 - zone3 * 2.9 + zone4 * 1.1;
    const parallaxX = state.pointer.x * config.parallaxStrength;
    const parallaxY = state.pointer.y * config.parallaxStrength * 0.7;

    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      desiredX + parallaxX,
      2.5,
      delta,
    );
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      desiredY + parallaxY,
      2.5,
      delta,
    );
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, desiredZ, 2.5, delta);

    target.set(
      THREE.MathUtils.lerp(-1.2, 13.7, THREE.MathUtils.smoothstep(p, 0.38, 0.88)),
      p > 0.75 ? 2.2 : 1.9,
      p > 0.82 ? -0.7 : 0,
    );
    state.camera.lookAt(target);
  });

  return (
    <>
      <color attach="background" args={[DARK]} />
      <fog attach="fog" args={[DARK, 12, config.isMobile ? 34 : 46]} />
      <ambientLight intensity={0.5} color="#b8d6ed" />
      <directionalLight
        position={[5, 11, 7]}
        color={ICE}
        intensity={2.1}
        castShadow={config.shadows}
        shadow-mapSize={[768, 768]}
      />
      <pointLight position={[-4, 5, 4]} color={ORANGE} intensity={5} distance={16} />
      <pointLight position={[13, 5, -2]} color={BLUE} intensity={4} distance={15} />

      <LowPolyWater />
      <CargoShip />
      <HarborCrane progressRef={progressRef} />
      <CargoContainer ref={containerRef} />
      <CargoTruck progressRef={progressRef} />
      <Warehouse progressRef={progressRef} />
      <ScanBeam progressRef={progressRef} />
      <ParticleSystem count={config.particleCount} />

      <mesh position={[6.4, -0.15, 0]} receiveShadow={config.shadows}>
        <boxGeometry args={[17.5, 0.3, 5.2]} />
        <meshStandardMaterial color="#101a24" roughness={0.88} />
      </mesh>
      <gridHelper position={[8, 0.015, 0]} args={[24, 24, BLUE, "#172a3a"]} />
      <mesh position={[-0.25, -0.02, 0]} receiveShadow={config.shadows}>
        <boxGeometry args={[3.5, 0.42, 7.8]} />
        <meshStandardMaterial color="#17212b" roughness={0.83} />
      </mesh>
      {config.shadows ? (
        <ContactShadows position={[7, 0.03, 0]} opacity={0.4} scale={28} blur={2.5} far={10} />
      ) : null}
    </>
  );
}

export function CargoScene({ progressRef, reducedMotion }: SceneProps) {
  const config = useResponsiveScene();
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setWebglAvailable(supportsWebGL()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (webglAvailable === false) return <SceneFallback />;
  if (webglAvailable === null) return <div className="scene-loading" aria-hidden="true" />;

  return (
    <SceneErrorBoundary fallback={<SceneFallback />}>
      <Canvas
        dpr={[1, config.maxDpr]}
        camera={{ position: [6.8, 6.3, 13.2], fov: config.isMobile ? 52 : 44, near: 0.1, far: 80 }}
        shadows={config.shadows}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: !config.isMobile, alpha: false, powerPreference: "high-performance" }}
        aria-label="Animated 3D cargo journey from ship to warehouse"
      >
        <Suspense fallback={null}>
          <SceneContents progressRef={progressRef} reducedMotion={reducedMotion} config={config} />
        </Suspense>
      </Canvas>
    </SceneErrorBoundary>
  );
}
