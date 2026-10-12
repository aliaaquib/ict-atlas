/**
 * ICT Atlas — procedural 3D asset library.
 *
 * ASSET DECISION (documented per spec §3): all models are generated in code
 * from Three.js primitives rather than downloaded. This gives:
 *  - stable, meaningful mesh/part IDs for selection and validation
 *  - deterministic exploded-view offsets
 *  - no third-party licensing risk and ~0 KB asset downloads
 *  - crisp, clearly-labelled educational geometry (no static images)
 *
 * If higher-fidelity GLB assets are ever sourced, each <Part> maps 1:1 to a
 * GLB node by id and the content model (src/data) is untouched.
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import { Part } from './Part';

type V3 = [number, number, number];

function std(color: string, roughness = 0.62, metalness = 0.08) {
  return <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />;
}

/** Small cooling fan: ring + hub + blades, facing +axis direction. */
function Fan({ position, radius, axis = 'z', color = '#1f2937' }: { position: V3; radius: number; axis?: 'x' | 'z'; color?: string }) {
  const blades = [0, 1, 2, 3, 4].map((i) => {
    const a = (i / 5) * Math.PI * 2;
    return (
      <mesh key={i} position={[Math.cos(a) * radius * 0.52, Math.sin(a) * radius * 0.52, 0]} rotation={[0, 0, a + 0.5]}>
        <boxGeometry args={[radius * 0.42, radius * 0.2, 0.004]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>
    );
  });
  const ring = axis === 'z'
    ? <torusGeometry args={[radius, radius * 0.09, 10, 32]} />
    : <torusGeometry args={[radius, radius * 0.09, 10, 32]} />;
  return (
    <group position={position} rotation={axis === 'x' ? [0, Math.PI / 2, 0] : [0, 0, 0]}>
      <mesh>{ring}<meshStandardMaterial color={color} roughness={0.7} /></mesh>
      <mesh><cylinderGeometry args={[radius * 0.28, radius * 0.28, 0.012, 20]} /><meshStandardMaterial color="#111827" roughness={0.6} /></mesh>
      {blades}
    </group>
  );
}

function Cable({ from, to, sag = 0.05, color = '#dc2626' }: { from: V3; to: V3; sag?: number; color?: string }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5); mid.y -= sag;
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    return new THREE.TubeGeometry(curve, 20, 0.006, 8, false);
  }, [from, to, sag]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

// ============================================================================
// DESKTOP SCENE
// Tower: x in [-0.46,-0.24], y in [0,0.5], z in [-0.28,0.18]. Front faces +z.
// Side panel (+x face) is removable. Motherboard stands on the -x inner wall.
// ============================================================================

export function DesktopPC({ onHover }: { onHover: (id: string | null) => void }) {
  return (
    <group>
      {/* ---------------- Case frame (stays put in exploded view) ---------------- */}
      <Part id="d-case" selectable onHover={onHover} explodeOffset={[0, 0, 0]}>
        {/* back, top, bottom, front, inner wall */}
        <mesh position={[-0.35, 0.25, -0.275]}>{std('#39445a', 0.5, 0.35)}<boxGeometry args={[0.22, 0.5, 0.012]} /></mesh>
        <mesh position={[-0.35, 0.494, -0.05]}>{std('#39445a', 0.5, 0.35)}<boxGeometry args={[0.22, 0.012, 0.46]} /></mesh>
        <mesh position={[-0.35, 0.006, -0.05]}>{std('#39445a', 0.5, 0.35)}<boxGeometry args={[0.22, 0.012, 0.46]} /></mesh>
        <mesh position={[-0.35, 0.25, 0.174]}>{std('#273142', 0.55, 0.25)}<boxGeometry args={[0.22, 0.5, 0.012]} /></mesh>
        <mesh position={[-0.454, 0.25, -0.05]}>{std('#39445a', 0.5, 0.35)}<boxGeometry args={[0.012, 0.5, 0.46]} /></mesh>
        {/* feet */}
        {[[-0.43, -0.2], [-0.27, -0.2], [-0.43, 0.1], [-0.27, 0.1]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.012, z]}>{std('#0b0f14', 0.8)}<boxGeometry args={[0.03, 0.025, 0.03]} /></mesh>
        ))}
        {/* front power button */}
        <mesh position={[-0.35, 0.42, 0.182]}>{std('#2dd4bf', 0.4)}<cylinderGeometry args={[0.012, 0.012, 0.008, 20]} /></mesh>
      </Part>

      {/* ---------------- Removable side panel ---------------- */}
      <Part id="d-side-panel" onHover={onHover} explodeOffset={[0.55, 0.02, 0]}>
        <mesh position={[-0.234, 0.25, -0.05]}>{std('#3b475e', 0.42, 0.45)}<boxGeometry args={[0.008, 0.46, 0.44]} /></mesh>
        {/* vent slits */}
        {[0.14, 0.18, 0.22].map((y, i) => (
          <mesh key={i} position={[-0.2295, y, -0.05]}>{std('#141a23', 0.7)}<boxGeometry args={[0.002, 0.018, 0.30]} /></mesh>
        ))}
        <mesh position={[-0.2295, 0.40, -0.05]}>{std('#2dd4bf', 0.5)}<boxGeometry args={[0.002, 0.008, 0.20]} /></mesh>
      </Part>

      {/* ---------------- Motherboard (simplified) ---------------- */}
      <Part id="d-motherboard" onHover={onHover} explodeOffset={[-0.14, 0, 0]}>
        <mesh position={[-0.44, 0.24, -0.08]}>{std('#0f5132', 0.6)}<boxGeometry args={[0.008, 0.34, 0.28]} /></mesh>
        {/* chipset + rear IO hints */}
        <mesh position={[-0.432, 0.13, -0.16]}>{std('#9ca3af', 0.5, 0.5)}<boxGeometry args={[0.012, 0.05, 0.05]} /></mesh>
        <mesh position={[-0.432, 0.36, -0.19]}>{std('#6b7280', 0.5, 0.6)}<boxGeometry args={[0.012, 0.06, 0.08]} /></mesh>
      </Part>

      {/* ---------------- CPU ---------------- */}
      <Part id="d-cpu" onHover={onHover} explodeOffset={[0.30, 0.04, 0]}>
        <mesh position={[-0.428, 0.30, -0.08]}>{std('#cbd5e1', 0.35, 0.85)}<boxGeometry args={[0.012, 0.055, 0.055]} /></mesh>
        <mesh position={[-0.421, 0.30, -0.08]}>{std('#1e293b', 0.5)}<boxGeometry args={[0.004, 0.032, 0.032]} /></mesh>
      </Part>

      {/* ---------------- CPU cooler ---------------- */}
      <Part id="d-cpu-cooler" onHover={onHover} explodeOffset={[0.38, 0.14, 0]}>
        <mesh position={[-0.375, 0.335, -0.08]}>{std('#9ca3af', 0.45, 0.7)}<boxGeometry args={[0.085, 0.075, 0.095]} /></mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.375, 0.305 + i * 0.02, -0.08]}>{std('#6b7280', 0.5, 0.7)}<boxGeometry args={[0.088, 0.004, 0.098]} /></mesh>
        ))}
        <Fan position={[-0.328, 0.335, -0.08]} radius={0.042} axis="x" />
      </Part>

      {/* ---------------- RAM ---------------- */}
      <Part id="d-ram" onHover={onHover} explodeOffset={[0.32, -0.04, 0.02]}>
        {[0.005, 0.032].map((z, i) => (
          <group key={i}>
            <mesh position={[-0.428, 0.315, -0.08 + 0.10 + z]}>{std('#14532d', 0.6)}<boxGeometry args={[0.009, 0.045, 0.008]} /></mesh>
            <mesh position={[-0.428, 0.315, -0.08 + 0.10 + z]}>{std('#14532d', 0.6)}<boxGeometry args={[0.009, 0.045, 0.008]} /></mesh>
            {/* stick: vertical card */}
            <mesh position={[-0.424, 0.335, 0.02 + i * 0.027 - 0.0135]}>{std('#166534', 0.55)}<boxGeometry args={[0.006, 0.035, 0.115]} /></mesh>
            {[0, 1, 2, 3].map((c) => (
              <mesh key={c} position={[-0.4205, 0.335, -0.028 + i * 0.027 + c * 0.026]}>{std('#111827', 0.5)}<boxGeometry args={[0.002, 0.018, 0.02]} /></mesh>
            ))}
            <mesh position={[-0.424, 0.355, 0.02 + i * 0.027 - 0.0135]}>{std('#22c55e', 0.4)}<boxGeometry args={[0.0065, 0.006, 0.115]} /></mesh>
          </group>
        ))}
      </Part>

      {/* ---------------- Graphics card ---------------- */}
      <Part id="d-gpu" onHover={onHover} explodeOffset={[0.34, -0.16, 0]}>
        <mesh position={[-0.40, 0.155, -0.06]}>{std('#111827', 0.45, 0.3)}<boxGeometry args={[0.05, 0.032, 0.26]} /></mesh>
        <mesh position={[-0.40, 0.155, -0.06]}>{std('#0ea5e9', 0.4)}<boxGeometry args={[0.052, 0.008, 0.26]} /></mesh>
        <Fan position={[-0.373, 0.155, -0.125]} radius={0.027} axis="x" />
        <Fan position={[-0.373, 0.155, 0.005]} radius={0.027} axis="x" />
        <mesh position={[-0.40, 0.175, -0.185]}>{std('#6b7280', 0.5, 0.6)}<boxGeometry args={[0.02, 0.07, 0.01]} /></mesh>
      </Part>

      {/* ---------------- PSU ---------------- */}
      <Part id="d-psu" onHover={onHover} explodeOffset={[-0.04, -0.22, -0.18]}>
        <mesh position={[-0.35, 0.06, -0.19]}>{std('#0b0f14', 0.6, 0.3)}<boxGeometry args={[0.15, 0.095, 0.15]} /></mesh>
        <Fan position={[-0.35, 0.06, -0.112]} radius={0.035} />
        <mesh position={[-0.272, 0.06, -0.19]}>{std('#374151', 0.6)}<boxGeometry args={[0.004, 0.03, 0.05]} /></mesh>
      </Part>

      {/* ---------------- SSD (M.2) ---------------- */}
      <Part id="d-ssd" onHover={onHover} explodeOffset={[0.24, 0.10, 0]}>
        <mesh position={[-0.428, 0.215, -0.02]}>{std('#0b0f14', 0.5)}<boxGeometry args={[0.008, 0.013, 0.08]} /></mesh>
        <mesh position={[-0.4235, 0.215, -0.02]}>{std('#1f2937', 0.5)}<boxGeometry args={[0.002, 0.008, 0.02]} /></mesh>
      </Part>

      {/* ---------------- HDD ---------------- */}
      <Part id="d-hdd" onHover={onHover} explodeOffset={[0.08, -0.04, 0.38]}>
        <mesh position={[-0.35, 0.125, 0.075]}>{std('#9ca3af', 0.35, 0.8)}<boxGeometry args={[0.10, 0.028, 0.148]} /></mesh>
        <mesh position={[-0.35, 0.14, 0.075]}>{std('#e5e7eb', 0.3, 0.85)}<boxGeometry args={[0.08, 0.002, 0.11]} /></mesh>
      </Part>

      {/* ---------------- Case fans ---------------- */}
      <Part id="d-case-fans" onHover={onHover} explodeOffset={[0, 0.22, 0]}>
        <Fan position={[-0.35, 0.30, 0.16]} radius={0.058} />
        <Fan position={[-0.35, 0.32, -0.26]} radius={0.058} />
      </Part>

      {/* ---------------- Cables ---------------- */}
      <Part id="d-cables" onHover={onHover} explodeOffset={[0.48, 0.08, 0]}>
        <Cable from={[-0.33, 0.10, -0.16]} to={[-0.425, 0.24, 0.03]} color="#dc2626" />
        <Cable from={[-0.33, 0.10, -0.18]} to={[-0.41, 0.375, -0.12]} sag={0.03} color="#f59e0b" />
        <Cable from={[-0.33, 0.09, -0.15]} to={[-0.385, 0.17, -0.12]} sag={0.06} color="#3b82f6" />
        <Cable from={[-0.42, 0.16, 0.02]} to={[-0.36, 0.125, 0.06]} sag={0.02} color="#e5e7eb" />
      </Part>

      {/* ---------------- Peripherals ---------------- */}
      <Part id="d-monitor" onHover={onHover} explodeOffset={[0.18, 0.18, -0.28]}>
        <mesh position={[0.48, 0.36, -0.38]}>{std('#0b0f14', 0.4, 0.3)}<boxGeometry args={[0.58, 0.35, 0.025]} /></mesh>
        <mesh position={[0.48, 0.36, -0.366]}>{std('#0e7490', 0.25, 0.1)}<boxGeometry args={[0.54, 0.31, 0.004]} />
          <meshStandardMaterial color="#164e63" roughness={0.25} metalness={0.1} emissive="#2dd4bf" emissiveIntensity={0.12} />
        </mesh>
        <mesh position={[0.48, 0.10, -0.38]}>{std('#39445a', 0.6)}<boxGeometry args={[0.05, 0.20, 0.04]} /></mesh>
        <mesh position={[0.48, 0.012, -0.36]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.24, 0.024, 0.16]} /></mesh>
      </Part>

      <Part id="d-keyboard" onHover={onHover} explodeOffset={[0, 0.28, 0.18]}>
        <mesh position={[0.48, 0.018, 0.06]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.40, 0.022, 0.15]} /></mesh>
        {[0, 1, 2, 3, 4].map((r) => (
          <group key={r}>
            {Array.from({ length: 14 }).map((_, c) => (
              <mesh key={c} position={[0.315 + c * 0.0255, 0.032, 0.005 + r * 0.026]}>
                {std('#374151', 0.65)}<boxGeometry args={[0.021, 0.012, 0.021]} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0.48, 0.032, 0.109]}>{std('#374151', 0.65)}<boxGeometry args={[0.16, 0.012, 0.021]} /></mesh>
      </Part>

      <Part id="d-mouse" onHover={onHover} explodeOffset={[0.32, 0.22, 0.12]}>
        <mesh position={[0.76, 0.028, 0.06]} scale={[1, 0.62, 1.5]}>{std('#1f2937', 0.55)}<sphereGeometry args={[0.035, 24, 18]} /></mesh>
        <mesh position={[0.76, 0.048, 0.028]}>{std('#4b5563', 0.6)}<boxGeometry args={[0.008, 0.014, 0.02]} /></mesh>
      </Part>
    </group>
  );
}

// ============================================================================
// MOTHERBOARD LAB
// Board lies flat: 0.32 (x) x 0.26 (z), top surface y = 0.02. Rear I/O at -z.
// ============================================================================

const BOARD_Y = 0.02;

export function MotherboardLab({ onHover }: { onHover: (id: string | null) => void }) {
  return (
    <group>
      {/* decorative PCB base (not selectable) */}
      <Part id="m-board" selectable={false} explodeOffset={[0, 0, 0]}>
        <mesh position={[0, 0.012, 0]}>{std('#0b3b2e', 0.62)}<boxGeometry args={[0.32, 0.016, 0.26]} /></mesh>
        {/* traces */}
        {[-0.09, -0.03, 0.05].map((z, i) => (
          <mesh key={i} position={[0.02, 0.0205, z]}>{std('#10b981', 0.5)}<boxGeometry args={[0.22, 0.0012, 0.004]} /></mesh>
        ))}
        {[[-0.14, -0.11], [0.14, -0.11], [-0.14, 0.11], [0.14, 0.11]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.0205, z]}>{std('#d1d5db', 0.4, 0.7)}<cylinderGeometry args={[0.006, 0.006, 0.003, 16]} /></mesh>
        ))}
      </Part>

      <Part id="m-cpu-socket" onHover={onHover} explodeOffset={[0, 0.20, 0]}>
        <mesh position={[-0.07, BOARD_Y + 0.004, -0.03]}>{std('#e5e7eb', 0.5)}<boxGeometry args={[0.078, 0.008, 0.078]} /></mesh>
        <mesh position={[-0.07, BOARD_Y + 0.009, -0.03]}>{std('#1e293b', 0.55)}<boxGeometry args={[0.06, 0.004, 0.06]} /></mesh>
        <mesh position={[-0.07, BOARD_Y + 0.012, -0.03]}>{std('#cbd5e1', 0.35, 0.85)}<boxGeometry args={[0.045, 0.004, 0.045]} /></mesh>
        <mesh position={[-0.028, BOARD_Y + 0.006, -0.03]}>{std('#9ca3af', 0.4, 0.7)}<boxGeometry args={[0.004, 0.006, 0.05]} /></mesh>
      </Part>

      <Part id="m-dimm" onHover={onHover} explodeOffset={[0.06, 0.24, 0]}>
        {[0.015, 0.028, 0.041, 0.054].map((x, i) => (
          <group key={i}>
            <mesh position={[x, BOARD_Y + 0.005, 0.0]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.007, 0.01, 0.135]} /></mesh>
            <mesh position={[x, BOARD_Y + 0.011, 0.0]}>{std('#166534', 0.55)}<boxGeometry args={[0.005, 0.028, 0.125]} /></mesh>
            {[0, 1, 2].map((c) => (
              <mesh key={c} position={[x + 0.0035, BOARD_Y + 0.011, -0.04 + c * 0.04]}>{std('#111827', 0.5)}<boxGeometry args={[0.0015, 0.014, 0.03]} /></mesh>
            ))}
          </group>
        ))}
      </Part>

      <Part id="m-pcie" onHover={onHover} explodeOffset={[-0.06, 0.18, 0.06]}>
        {[0.062, 0.092].map((z, i) => (
          <group key={i}>
            <mesh position={[-0.05, BOARD_Y + 0.004, z]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.105, 0.008, 0.013]} /></mesh>
            <mesh position={[-0.05, BOARD_Y + 0.009, z]}>{std('#0ea5e9', 0.45)}<boxGeometry args={[0.10, 0.003, 0.008]} /></mesh>
          </group>
        ))}
      </Part>

      <Part id="m-m2" onHover={onHover} explodeOffset={[0.03, 0.28, -0.05]}>
        <mesh position={[0.02, BOARD_Y + 0.003, -0.095]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.024, 0.006, 0.085]} /></mesh>
        <mesh position={[0.02, BOARD_Y + 0.008, -0.095]}>{std('#0b0f14', 0.5)}<boxGeometry args={[0.02, 0.005, 0.078]} /></mesh>
        <mesh position={[0.02, BOARD_Y + 0.013, -0.095]}>{std('#9ca3af', 0.4, 0.7)}<boxGeometry args={[0.024, 0.004, 0.082]} /></mesh>
      </Part>

      <Part id="m-sata" onHover={onHover} explodeOffset={[0.09, 0.22, 0.05]}>
        {[0.055, 0.075].map((z, i) => (
          <mesh key={i} position={[0.105, BOARD_Y + 0.005, z]}>{std('#e5e7eb', 0.55)}<boxGeometry args={[0.015, 0.01, 0.009]} /></mesh>
        ))}
      </Part>

      <Part id="m-chipset" onHover={onHover} explodeOffset={[0.04, 0.20, 0.03]}>
        <mesh position={[0.062, BOARD_Y + 0.003, -0.028]}>{std('#1e293b', 0.55)}<boxGeometry args={[0.042, 0.006, 0.042]} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0.062, BOARD_Y + 0.012, -0.044 + i * 0.008]}>{std('#9ca3af', 0.45, 0.7)}<boxGeometry args={[0.04, 0.012, 0.003]} /></mesh>
        ))}
      </Part>

      <Part id="m-vrm" onHover={onHover} explodeOffset={[-0.09, 0.22, 0]}>
        {[-0.075, -0.06, -0.045, -0.03, -0.015, 0.0].map((z, i) => (
          <group key={i}>
            <mesh position={[-0.118, BOARD_Y + 0.004, z]}>{std('#374151', 0.5, 0.4)}<boxGeometry args={[0.011, 0.008, 0.011]} /></mesh>
            <mesh position={[-0.118, BOARD_Y + 0.010, z]}>{std('#9ca3af', 0.45, 0.7)}<boxGeometry args={[0.011, 0.006, 0.011]} /></mesh>
          </group>
        ))}
      </Part>

      <Part id="m-cmos" onHover={onHover} explodeOffset={[-0.03, 0.30, 0.06]}>
        <mesh position={[-0.02, BOARD_Y + 0.003, 0.105]}>{std('#d1d5db', 0.3, 0.9)}<cylinderGeometry args={[0.011, 0.011, 0.005, 24]} /></mesh>
        <mesh position={[-0.02, BOARD_Y + 0.006, 0.105]}>{std('#9ca3af', 0.4, 0.8)}<cylinderGeometry args={[0.007, 0.007, 0.002, 24]} /></mesh>
      </Part>

      <Part id="m-bios" onHover={onHover} explodeOffset={[0.08, 0.26, -0.04]}>
        <mesh position={[0.095, BOARD_Y + 0.003, -0.062]}>{std('#0b0f14', 0.5)}<boxGeometry args={[0.017, 0.006, 0.009]} /></mesh>
        <mesh position={[0.095, BOARD_Y + 0.007, -0.062]}>{std('#f8fafc', 0.6)}<boxGeometry args={[0.008, 0.001, 0.004]} /></mesh>
      </Part>

      <Part id="m-atx-power" onHover={onHover} explodeOffset={[0.12, 0.22, 0]}>
        <mesh position={[0.142, BOARD_Y + 0.007, -0.03]}>{std('#f8fafc', 0.55)}<boxGeometry args={[0.024, 0.014, 0.062]} /></mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0.142, BOARD_Y + 0.015, -0.055 + i * 0.0105]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.018, 0.002, 0.007]} /></mesh>
        ))}
      </Part>

      <Part id="m-cpu-power" onHover={onHover} explodeOffset={[-0.05, 0.28, -0.07]}>
        <mesh position={[-0.07, BOARD_Y + 0.006, -0.10]}>{std('#f8fafc', 0.55)}<boxGeometry args={[0.022, 0.012, 0.032]} /></mesh>
      </Part>

      <Part id="m-rear-io" onHover={onHover} explodeOffset={[0, 0.16, -0.12]}>
        <mesh position={[-0.02, BOARD_Y + 0.015, -0.128]}>{std('#9ca3af', 0.35, 0.8)}<boxGeometry args={[0.17, 0.03, 0.005]} /></mesh>
        {[-0.075, -0.045, -0.015].map((x, i) => (
          <mesh key={i} position={[x, BOARD_Y + 0.012, -0.124]}>{std('#1d4ed8', 0.5)}<boxGeometry args={[0.02, 0.012, 0.006]} /></mesh>
        ))}
        <mesh position={[0.025, BOARD_Y + 0.012, -0.124]}>{std('#0b0f14', 0.5)}<boxGeometry args={[0.024, 0.014, 0.006]} /></mesh>
        {[0.055, 0.075].map((x, i) => (
          <mesh key={i} position={[x, BOARD_Y + 0.010, -0.124]}>{std('#16a34a', 0.5)}<boxGeometry args={[0.012, 0.008, 0.006]} /></mesh>
        ))}
      </Part>

      <Part id="m-fan-headers" onHover={onHover} explodeOffset={[0, 0.26, 0.09]}>
        {[[-0.115, 0.095], [0.125, 0.095]].map(([x, z], i) => (
          <mesh key={i} position={[x, BOARD_Y + 0.004, z]}>{std('#f8fafc', 0.55)}<boxGeometry args={[0.013, 0.008, 0.009]} /></mesh>
        ))}
      </Part>

      <Part id="m-front-panel" onHover={onHover} explodeOffset={[0.05, 0.24, 0.09]}>
        <mesh position={[0.06, BOARD_Y + 0.003, 0.118]}>{std('#1f2937', 0.6)}<boxGeometry args={[0.022, 0.006, 0.012]} /></mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0.052 + i * 0.004, BOARD_Y + 0.008, 0.118]}>{std('#d1d5db', 0.4, 0.8)}<cylinderGeometry args={[0.0012, 0.0012, 0.006, 8]} /></mesh>
        ))}
      </Part>
    </group>
  );
}
