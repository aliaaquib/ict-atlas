/**
 * validate-content.mjs — ICT Atlas content integrity checks.
 *
 * Verifies: unique component ids, relationship graph integrity, quiz answer
 * validity, search contracts, tour/sim spotlight references, model part ids
 * in src/three/models.tsx match the content manifest (no silent mapping of a
 * component to an unrelated mesh), and exploded-view offset coverage.
 *
 * Run: npm run validate:content
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { COMPONENTS, componentById, searchComponents, sceneComponents } = await import('../src/data/components.ts');
const { validateQuizzes, QUIZZES } = await import('../src/data/quizzes.ts');
const { TOURS } = await import('../src/data/tours.ts');
const { SIMS } = await import('../src/data/sims.ts');

let checks = 0;
const ok = (cond, msg) => { checks++; assert.ok(cond, msg); };

// ---- ids unique, all verified -------------------------------------------
const ids = COMPONENTS.map((c) => c.id);
ok(new Set(ids).size === ids.length, 'duplicate component ids');
ok(COMPONENTS.every((c) => c.verified), 'every component must be human-verified');
ok(COMPONENTS.every((c) => c.name.trim() && c.description.trim() && c.function.trim()), 'name/description/function present');
ok(COMPONENTS.every((c) => c.selectable), 'every content component is selectable in 3D');
ok(sceneComponents('desktop').length >= 12, 'desktop scene coverage');
ok(sceneComponents('motherboard').length >= 12, 'motherboard scene coverage');

// ---- relationship graph ---------------------------------------------------
for (const c of COMPONENTS) {
  for (const r of c.related) ok(componentById.has(r), `${c.id}: related id ${r} does not exist`);
  ok(!c.related.includes(c.id), `${c.id}: self-related`);
}

// ---- quizzes -----------------------------------------------------------------
const quizErrors = validateQuizzes();
ok(quizErrors.length === 0, `quiz errors: ${quizErrors.join('; ')}`);
ok(QUIZZES.length >= 3, 'at least 3 quizzes');

// ---- tours --------------------------------------------------------------------
for (const t of TOURS) {
  ok(t.steps.length >= 3, `${t.id}: tour needs at least 3 stops`);
  for (const s of t.steps) {
    const c = componentById.get(s.componentId);
    ok(c, `${t.id}: unknown component ${s.componentId}`);
    ok(c.scene === t.scene, `${t.id}: step ${s.componentId} is in scene ${c.scene}, tour is ${t.scene}`);
    ok(s.narration.trim().length > 20, `${t.id}: narration too short`);
  }
}

// ---- simulations ---------------------------------------------------------------
for (const sim of SIMS) {
  ok(sim.steps.length >= 3, `${sim.id}: simulation needs at least 3 steps`);
  for (const st of sim.steps) {
    if (st.spotlight) {
      const c = componentById.get(st.spotlight);
      ok(c, `${sim.id}: unknown spotlight ${st.spotlight}`);
      if (st.scene) ok(c.scene === st.scene, `${sim.id}: spotlight ${st.spotlight} scene mismatch`);
    }
  }
}

// ---- model part ids match the manifest ------------------------------------------
const modelsSrc = readFileSync(join(root, 'src/three/models.tsx'), 'utf8');
const partIds = [...modelsSrc.matchAll(/<Part\s+id="([^"]+)"/g)].map((m) => m[1]);
ok(partIds.length > 0, 'no <Part> declarations found in models.tsx');
const decorative = new Set(['m-board']); // documented non-selectable context geometry
for (const pid of partIds) {
  if (decorative.has(pid)) continue;
  ok(componentById.has(pid), `model part "${pid}" has no content record — refusing silent unmapped mesh`);
}
const modelSet = new Set(partIds);
for (const c of COMPONENTS) {
  ok(modelSet.has(c.id), `content component "${c.id}" has no 3D part in models.tsx`);
}

// ---- exploded-view offsets ---------------------------------------------------------
const offsets = [...modelsSrc.matchAll(/explodeOffset=\{\[([^\]]+)\]\}/g)].map((m, i) => ({
  part: partIds[i],
  v: m[1].split(',').map(Number),
}));
ok(offsets.length === partIds.length, 'every <Part> declares an explodeOffset');
for (const o of offsets) {
  ok(o.v.length === 3 && o.v.every(Number.isFinite), `${o.part}: malformed explodeOffset`);
  const mag = Math.hypot(...o.v);
  if (o.part === 'd-case' || o.part === 'm-board') {
    ok(mag === 0, `${o.part}: anchor part must not move in exploded view`);
  } else {
    ok(mag > 0.05 && mag < 1.2, `${o.part}: explode offset magnitude ${mag.toFixed(2)} out of sane range`);
  }
}
// deterministic spread: no two non-anchor parts share an identical offset
const seen = new Map();
for (const o of offsets) {
  if (o.part === 'd-case' || o.part === 'm-board') continue;
  const key = o.v.map((n) => n.toFixed(3)).join(',');
  ok(!seen.has(key), `${o.part} shares an exploded offset with ${seen.get(key)} — parts would overlap`);
  seen.set(key, o.part);
}

// ---- search contracts ---------------------------------------------------------------
const find = (q, scene) => searchComponents(q, scene).map((c) => c.id);
ok(find('cpu', 'desktop')[0] === 'd-cpu', 'search "cpu" ranks CPU first');
ok(find('mobo', 'desktop').includes('d-motherboard'), 'alias "mobo" finds motherboard');
ok(find('ram').some((id) => id === 'd-ram' || id === 'm-dimm'), 'search "ram" finds RAM parts');
ok(find('nvme').includes('d-ssd') || find('nvme').includes('m-m2'), 'search "nvme" finds SSD parts');
ok(find('power').length >= 3, 'search "power" finds power components');
ok(find('usb', 'motherboard').includes('m-rear-io'), 'search "usb" finds rear I/O');
ok(find('storage').some((id) => id === 'd-ssd' || id === 'd-hdd'), 'search "storage" by function text');
ok(find('   ').length === 0, 'blank search returns nothing');
ok(find('zzz-no-such-part').length === 0, 'unknown term returns nothing');

console.log(`content: ${checks} checks passed — ${COMPONENTS.length} components, ${QUIZZES.length} quizzes, ${TOURS.length} tours, ${SIMS.length} simulations, ${partIds.length} model parts.`);
