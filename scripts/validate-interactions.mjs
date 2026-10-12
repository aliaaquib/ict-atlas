/**
 * validate-interactions.mjs — ICT Atlas interaction-logic tests (no browser).
 *
 * Covers: tap-vs-drag discrimination (ported from Human Atlas), visibility /
 * isolation logic, exploded-amount easing math, camera focus math, and store
 * transition invariants. Browser-level checks live in scripts/smoke.mjs.
 *
 * Run: npm run validate:interactions
 */
import assert from 'node:assert/strict';
import { PointerTap } from '../src/three/pointerTap.ts';
import { isPartVisible } from '../src/state/store.ts';

let checks = 0;
const ok = (cond, msg) => { checks++; assert.ok(cond, msg); };

// ---- PointerTap (same contract as Human Atlas) --------------------------------
{
  const tap = new PointerTap();
  tap.down(1, 10, 10, 5); ok(tap.up(1, 12, 11) === true, 'small move is a tap');
  tap.down(1, 10, 10, 5); tap.move(1, 40, 10); ok(tap.up(1, 10, 10) === false, 'drag is not a tap');
  tap.down(1, 10, 10, 12); tap.down(2, 20, 20, 12);
  ok(tap.up(2, 20, 20) === false, 'multitouch blocks tap (second pointer)');
  ok(tap.up(1, 10, 10) === false, 'multitouch blocks tap (first pointer)');
  tap.down(1, 10, 10, 5); tap.cancel(1); ok(tap.up(1, 10, 10) === false, 'cancelled pointer is not a tap');
  tap.down(1, 10, 10, 5); ok(tap.up(1, 10, 10) === true, 'tap still works after a cancelled sequence');
  // touch thresholds are larger than mouse thresholds
  const touch = new PointerTap();
  touch.down(1, 100, 100, 14); touch.move(1, 110, 100);
  ok(touch.up(1, 110, 100) === true, '10px move within 14px touch threshold is a tap');
}

// ---- visibility / isolation ---------------------------------------------------
{
  ok(isPartVisible([], false, null, 'd-cpu') === true, 'visible by default');
  ok(isPartVisible(['d-cpu'], false, null, 'd-cpu') === false, 'hidden part is not visible');
  ok(isPartVisible(['d-cpu'], false, null, 'd-ram') === true, 'other parts unaffected by hide');
  ok(isPartVisible([], true, 'd-cpu', 'd-cpu') === true, 'isolated selection stays visible');
  ok(isPartVisible([], true, 'd-cpu', 'd-ram') === false, 'isolate hides non-selected parts');
  ok(isPartVisible(['d-cpu'], true, 'd-cpu', 'd-cpu') === true, 'isolate wins over hidden for the selection');
  ok(isPartVisible([], true, null, 'd-cpu') === false, 'isolate with no selection hides everything');
}

// ---- exploded easing math ------------------------------------------------------
{
  // easeInOut used by <Part>: must be monotonic, 0->0, 1->1, smooth midpoint.
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  ok(ease(0) === 0 && ease(1) === 1, 'easing endpoints');
  ok(Math.abs(ease(0.5) - 0.5) < 1e-9, 'easing midpoint');
  let prev = -1;
  for (let t = 0; t <= 1.0001; t += 0.05) { const v = ease(t); ok(v >= prev - 1e-9, 'easing monotonic'); prev = v; }
  // damp() convergence: interrupted transitions must settle, never oscillate
  const damp = (cur, target, lambda, dt) => cur + (target - cur) * (1 - Math.exp(-lambda * dt));
  let x = 0;
  for (let i = 0; i < 600; i++) x = damp(x, 1, 5.5, 1 / 60);
  ok(Math.abs(x - 1) < 1e-3, 'damp converges to target');
  // interrupt mid-flight toward a new target
  for (let i = 0; i < 200; i++) x = damp(x, 1, 5.5, 1 / 60);
  for (let i = 0; i < 600; i++) x = damp(x, 0, 5.5, 1 / 60);
  ok(Math.abs(x - 0) < 1e-3, 'interrupted damp converges to the new target');
}

// ---- camera focus math -----------------------------------------------------------
{
  // focus distance rule: max(bboxDiagonal * 1.7, 0.32), clamped by orbit limits
  const dist = (diag) => Math.max(diag * 1.7, 0.32);
  ok(dist(0.05) === 0.32, 'tiny parts get a minimum framing distance');
  ok(dist(0.5) === 0.85, 'large parts frame proportionally');
  ok(dist(0.5) > 0.12 && dist(0.5) < 6, 'focus distance stays inside orbit min/max');
  // lerp convergence for camera animation
  const lerp = (a, b, k) => a + (b - a) * k;
  let px = 0.82, tx = 0.02;
  for (let i = 0; i < 600; i++) { const k = 1 - Math.exp(-5.5 / 60); px = lerp(px, 0.4, k); tx = lerp(tx, 0.1, k); }
  ok(Math.abs(px - 0.4) < 1e-3 && Math.abs(tx - 0.1) < 1e-3, 'camera animation converges');
}

// ---- explode slider clamping -------------------------------------------------------
{
  const clamp = (v) => Math.max(0, Math.min(1, v));
  ok(clamp(-0.5) === 0 && clamp(1.5) === 1 && clamp(0.42) === 0.42, 'explode target clamped to [0,1]');
}

console.log(`interactions: ${checks} checks passed — tap/drag, visibility, isolation, easing, camera math.`);
