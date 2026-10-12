import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useAtlas, REDUCED_MOTION } from '../state/store';
import { componentById } from '../data/components';
import { partGroups, partBox, findPartId, isChainVisible } from './registry';
import { PointerTap } from './pointerTap';
import { DesktopPC, MotherboardLab } from './models';

type V3 = [number, number, number];

const OVERVIEWS: Record<'desktop' | 'motherboard', { target: V3; position: V3 }> = {
  desktop: { target: [0.02, 0.22, -0.06], position: [0.98, 0.74, 1.28] },
  motherboard: { target: [0, 0.02, 0], position: [0.02, 0.55, 0.34] },
};

function v3(a: V3): THREE.Vector3 {
  return new THREE.Vector3(a[0], a[1], a[2]);
}

const DEBUG = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

/** Smooth, interruptible camera animation (selection focus, goals, overview). */
function CameraRig() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void } | null;
  const cameraGoal = useAtlas((s) => s.cameraGoal);
  const clearCamera = useAtlas((s) => s.clearCamera);
  const selectedId = useAtlas((s) => s.selectedId);
  const focusKey = useAtlas((s) => s.focusKey);
  const resetKey = useAtlas((s) => s.resetKey);
  const mode = useAtlas((s) => s.mode);
  const explodeTarget = useAtlas((s) => s.explodeTarget);
  const anim = useRef<{ target: THREE.Vector3; pos: THREE.Vector3 } | null>(null);
  const lastOverview = useRef('');

  const flyTo = useCallback((target: THREE.Vector3, pos: THREE.Vector3) => {
    if (REDUCED_MOTION) {
      if (controls) {
        controls.target.copy(target);
        camera.position.copy(pos);
        controls.update();
      }
      anim.current = null;
      return;
    }
    if (DEBUG) {
      (window as unknown as { __cameraIdle: boolean }).__cameraIdle = false;
    }
    anim.current = { target: target.clone(), pos: pos.clone() };
  }, [camera, controls]);

  // User input cancels any in-flight animation.
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      anim.current = null;
      clearCamera();
    };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls, clearCamera]);

  // Overview on mode change / reset.
  useEffect(() => {
    const key = `${mode}:${resetKey}`;
    if (key === lastOverview.current) return;
    lastOverview.current = key;
    const scene = mode === 'motherboard' ? 'motherboard' : 'desktop';
    const o = OVERVIEWS[scene];
    flyTo(v3(o.target), v3(o.position));
  }, [mode, resetKey, flyTo]);

  // Focus the selected part.
  useEffect(() => {
    if (!selectedId || focusKey === 0 || !controls) return;
    const box = partBox(selectedId);
    if (!box) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    const dist = Math.max(size * 1.7, 0.32);
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(0.6, 0.45, 0.75);
    dir.normalize();
    flyTo(center, center.clone().addScaledVector(dir, dist));
  }, [selectedId, focusKey, controls, camera, flyTo]);

  // Explicit camera goals (tours, sims).
  useEffect(() => {
    if (!cameraGoal || !controls) return;
    const target = v3(cameraGoal.target);
    const dir = cameraGoal.direction
      ? v3(cameraGoal.direction).normalize()
      : camera.position.clone().sub(controls.target).normalize();
    const dist = cameraGoal.distance ?? camera.position.distanceTo(controls.target);
    flyTo(target, target.clone().addScaledVector(dir, dist));
  }, [cameraGoal, controls, camera, flyTo]);

  // Exploded view: deterministically widen the framing so the spread stays
  // in view; collapsing returns to the overview. Never compounds, never fires
  // on mount (the overview effect owns the initial flight), and never on mode
  // changes (the overview effect owns those too).
  const explodeSeen = useRef({ v: useAtlas.getState().explodeTarget, mode: useAtlas.getState().mode });
  useEffect(() => {
    if (!controls) return;
    const prev = explodeSeen.current;
    explodeSeen.current = { v: explodeTarget, mode };
    if (explodeTarget === prev.v || mode !== prev.mode) return;
    const scene = mode === 'motherboard' ? 'motherboard' : 'desktop';
    const o = OVERVIEWS[scene];
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(0.55, 0.42, 0.72);
    dir.normalize();
    const baseDist = v3(o.position).distanceTo(v3(o.target));
    const dist = baseDist * (1 + 0.85 * explodeTarget);
    flyTo(v3(o.target), v3(o.target).clone().addScaledVector(dir, dist));
  }, [explodeTarget, controls, camera, flyTo, mode]);

  useFrame((_, rawDt) => {
    const a = anim.current;
    if (!a || !controls) return;
    const dt = Math.min(rawDt, 0.05);
    const k = 1 - Math.exp(-5.5 * dt);
    controls.target.lerp(a.target, k);
    camera.position.lerp(a.pos, k);
    if (controls.target.distanceTo(a.target) < 0.002 && camera.position.distanceTo(a.pos) < 0.002) {
      anim.current = null;
      if (DEBUG) (window as unknown as { __cameraIdle: boolean }).__cameraIdle = true;
    }
    controls.update();
  });

  return null;
}

/** Canvas-level tap detection + raycast picking (mirrors Human Atlas). */
function TapSelect() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const select = useAtlas((s) => s.select);
  const tap = useRef(new PointerTap());

  useEffect(() => {
    const el = gl.domElement;
    const ray = new THREE.Raycaster();
    const ptr = new THREE.Vector2();
    const down = (e: PointerEvent) => tap.current.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 14 : 6);
    const move = (e: PointerEvent) => tap.current.move(e.pointerId, e.clientX, e.clientY);
    const cancel = (e: PointerEvent) => tap.current.cancel(e.pointerId);
    const up = (e: PointerEvent) => {
      if (!tap.current.up(e.pointerId, e.clientX, e.clientY)) return;
      const rect = el.getBoundingClientRect();
      ptr.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects([...partGroups.values()], true);
      for (const h of hits) {
        const id = findPartId(h.object);
        const group = id ? partGroups.get(id) : undefined;
        if (id && group && group.userData.selectable !== false && isChainVisible(group)) {
          select(id);
          return;
        }
      }
      select(null);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
    };
  }, [gl, camera, select]);

  return null;
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, -0.001, -0.05]} receiveShadow>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color="#161e29" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, 0.0005, -0.05]}>
        <ringGeometry args={[0.85, 0.858, 96]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/** Test-only bridge: project a part's bbox center to screen coords (?debug=1). */
function DebugBridge() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('debug') !== '1') return;
    (window as unknown as { __cameraIdle: boolean }).__cameraIdle = true;
    (window as unknown as { __ictAtlas: unknown }).__ictAtlas = {
      projectPart: (id: string) => {
        const box = partBox(id);
        if (!box) return null;
        const c = box.getCenter(new THREE.Vector3()).project(camera);
        return { x: ((c.x + 1) / 2) * size.width, y: ((1 - c.y) / 2) * size.height };
      },
      partIds: () => [...partGroups.keys()],
      /** Test-only: run the same picking logic as TapSelect at a screen point. */
      pickAt: (x: number, y: number) => {
        const ray = new THREE.Raycaster();
        const ptr = new THREE.Vector2();
        ptr.set((x / size.width) * 2 - 1, -((y / size.height) * 2 - 1));
        ray.setFromCamera(ptr, camera);
        const hits = ray.intersectObjects([...partGroups.values()], true);
        return hits.slice(0, 5).map((h) => {
          let o: THREE.Object3D | null = h.object;
          while (o && !(o.userData && typeof o.userData.partId === 'string')) o = o.parent;
          return { part: o?.userData.partId ?? null, distance: +h.distance.toFixed(3), point: h.point.toArray().map((n) => +n.toFixed(3)) };
        });
      },
      cameraPos: () => camera.position.toArray().map((n) => +n.toFixed(3)),
    };
  }, [camera, size]);
  return null;
}

export function SceneView() {
  const mode = useAtlas((s) => s.mode);
  const rotate = useAtlas((s) => s.rotate);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const scene: 'desktop' | 'motherboard' = mode === 'motherboard' ? 'motherboard' : 'desktop';

  const onHover = useCallback((id: string | null) => setHovered(id), []);

  return (
    <div
      className="scene relative h-full w-full overflow-hidden"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouse({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
    >
      <Canvas
        dpr={typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 700 ? 1.5 : Math.min(window.devicePixelRatio || 1, 2)}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 38, near: 0.01, far: 60 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            setError('The 3D session was paused by your device. Reload the page to continue.');
          });
        }}
        aria-label="Interactive 3D computer explorer. Drag to orbit, scroll or pinch to zoom, tap a component to inspect it."
      >
        <color attach="background" args={['#0b0f14']} />
        <hemisphereLight args={['#e2e8f0', '#1a2230', 1.5]} />
        <directionalLight position={[-1.5, 2.5, 1.8]} intensity={3.1} color="#fffaf0" />
        <directionalLight position={[1.8, 1.2, -1.6]} intensity={1.6} color="#bae6fd" />
        <directionalLight position={[1.6, 0.9, 2.2]} intensity={1.15} color="#e0f2fe" />
        <Ground />
        {scene === 'desktop' ? <DesktopPC onHover={onHover} /> : <MotherboardLab onHover={onHover} />}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.09}
          minDistance={0.12}
          maxDistance={6}
          maxPolarAngle={Math.PI * 0.55}
          autoRotate={rotate}
          autoRotateSpeed={0.8}
          target={OVERVIEWS[scene].target as unknown as THREE.Vector3}
        />
        <CameraRig />
        <TapSelect />
        <DebugBridge />
      </Canvas>

      {hovered && componentById.get(hovered) && (
        <div
          className="part-hover"
          role="tooltip"
          style={{
            left: Math.max(8, Math.min(mouse.x + 14, 320)),
            top: Math.max(8, Math.min(mouse.y + 16, 400)),
          }}
        >
          {componentById.get(hovered)!.name}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 p-6">
          <div className="max-w-sm rounded-xl border border-red-400/40 bg-[#141a22] p-5 text-sm">
            <p className="font-semibold text-red-300">3D viewer error</p>
            <p className="mt-2 text-slate-300">{error}</p>
            <button
              className="mt-4 rounded-lg bg-teal-400 px-4 py-2 font-medium text-slate-950"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
