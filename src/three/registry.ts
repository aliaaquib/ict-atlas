import * as THREE from 'three';

/** Registry of live 3D part groups by part id. Used for picking and camera focus. */
export const partGroups = new Map<string, THREE.Object3D>();

/** Walk up from an object to find the owning part id (or null). */
export function findPartId(obj: THREE.Object3D | null): string | null {
  let o = obj;
  while (o) {
    if (o.userData && typeof o.userData.partId === 'string') return o.userData.partId as string;
    o = o.parent;
  }
  return null;
}

/** True when the object and every ancestor up to the scene root are visible. */
export function isChainVisible(obj: THREE.Object3D | null): boolean {
  let o = obj;
  while (o) {
    if (!o.visible) return false;
    o = o.parent;
  }
  return true;
}

/** World-space bounding box of a registered part. */
export function partBox(id: string): THREE.Box3 | null {
  const g = partGroups.get(id);
  if (!g) return null;
  const box = new THREE.Box3().setFromObject(g);
  return box.isEmpty() ? null : box;
}
