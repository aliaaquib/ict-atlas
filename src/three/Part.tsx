import { useEffect, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAtlas, isPartVisible, REDUCED_MOTION } from '../state/store';
import { partGroups } from './registry';

const ACCENT = new THREE.Color('#2dd4bf');

interface PartProps {
  id: string;
  /** Base position of the part group. */
  position?: [number, number, number];
  /** Where the part moves in fully exploded view (deterministic offset). */
  explodeOffset?: [number, number, number];
  /** False for decorative context geometry (not clickable, no highlight). */
  selectable?: boolean;
  children: ReactNode;
  onHover?: (id: string | null) => void;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * One selectable component of a scene. Owns a THREE.Group whose children are
 * plain meshes with their own materials; selection highlight is applied by
 * traversing and tinting emissive (materials are per-mesh, never shared).
 */
export function Part({ id, position = [0, 0, 0], explodeOffset = [0, 0, 0], selectable = true, children, onHover }: PartProps) {
  const group = useRef<THREE.Group>(null);
  const amount = useRef(0);
  const selected = useAtlas((s) => s.selectedId === id);
  const visible = useAtlas((s) => isPartVisible(s.hiddenIds, s.isolate, s.selectedId, id));
  const explodeTarget = useAtlas((s) => s.explodeTarget);

  useEffect(() => {
    if (group.current) partGroups.set(id, group.current);
    return () => {
      if (partGroups.get(id) === group.current) partGroups.delete(id);
    };
  }, [id]);

  useEffect(() => {
    const g = group.current;
    if (!g || !selectable) return;
    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const mm = m as THREE.MeshStandardMaterial;
        if (mm && mm.emissive) {
          mm.emissive.copy(ACCENT);
          mm.emissiveIntensity = selected ? 0.38 : 0;
        }
      });
    });
  }, [selected, selectable]);

  useFrame((_, rawDt) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDt, 0.05);
    const target = visible ? explodeTarget : 0;
    amount.current = REDUCED_MOTION || Math.abs(amount.current - target) < 0.0005
      ? target
      : THREE.MathUtils.damp(amount.current, target, 5.5, dt);
    const e = easeInOut(THREE.MathUtils.clamp(amount.current, 0, 1));
    g.position.set(
      position[0] + explodeOffset[0] * e,
      position[1] + explodeOffset[1] * e,
      position[2] + explodeOffset[2] * e,
    );
    g.visible = visible;
  });

  return (
    <group
      ref={group}
      position={position}
      userData={{ partId: id, selectable }}
      onPointerOver={(e) => {
        if (!selectable || !visible) return;
        e.stopPropagation();
        onHover?.(id);
      }}
      onPointerOut={() => onHover?.(null)}
    >
      {children}
    </group>
  );
}
