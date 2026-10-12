/**
 * smoke.mjs — headless-Chromium smoke tests for the production build.
 *
 * Serves dist/ with `vite preview`, then checks: page loads without console
 * errors, WebGL canvas renders, tap-select picks a real part (via the
 * ?debug=1 projection bridge), search finds components, the explode slider
 * moves, mode switching works, and key viewports render.
 *
 * Run: npm run smoke   (builds first)
 *
 * Testing limitation (honest): real mobile hardware / multitouch not tested;
 * viewports are emulated in headless Chromium only.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const shots = join(root, 'scripts', 'smoke-shots');
mkdirSync(shots, { recursive: true });

const { chromium } = await import('playwright-core');
const exeCandidates = [
  `${process.env.HOME}/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`,
  `${process.env.HOME}/.cache/ms-playwright/chromium_headless_shell-1243/chrome-linux/headless_shell`,
];
const { existsSync } = await import('node:fs');
const executablePath = exeCandidates.find(existsSync);
assert.ok(executablePath, 'no cached playwright chromium found');

async function serve() {
  // Clear any stale preview server from an earlier run.
  try { spawn('pkill', ['-f', '[v]ite preview']); } catch { /* ignore */ }
  await new Promise((r) => setTimeout(r, 800));
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], { cwd: root, stdio: 'pipe' });
    const timer = setTimeout(() => reject(new Error('preview server did not start')), 20000);
    p.stdout.on('data', (d) => {
      if (String(d).includes('4173')) { clearTimeout(timer); resolve(p); }
    });
    p.stderr.on('data', () => {});
    p.on('exit', () => reject(new Error('preview server exited')));
  });
}

const results = [];
const check = (name, fn) => {
  return Promise.resolve()
    .then(fn)
    .then(() => { results.push(['ok', name]); console.log(`  ✓ ${name}`); })
    .catch((e) => { results.push(['fail', name, e.message]); console.log(`  ✗ ${name}: ${e.message}`); });
};

console.log('ICT Atlas smoke tests (headless Chromium, production build)');
const server = await serve();
const browser = await chromium.launch({ executablePath, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));

  await check('page loads, canvas present', async () => {
    await page.goto('http://localhost:4173/?debug=1', { waitUntil: 'networkidle' });
    await page.waitForSelector('canvas', { timeout: 15000 });
    await page.waitForFunction(() => window.__cameraIdle === true, null, { timeout: 30000 });
  });

  // Software rendering is slow: always wait for camera flights to finish
  // before projecting parts or clicking.
  const settle = () => page.waitForFunction(() => window.__cameraIdle === true, null, { timeout: 30000 });

  await check('all model parts registered in the live scene', async () => {
    const ids = await page.evaluate(() => window.__ictAtlas.partIds());
    assert.ok(ids.length >= 15, `expected >=15 desktop parts, got ${ids.length}`);
    assert.ok(ids.includes('d-cpu') && ids.includes('d-monitor'), 'desktop parts present');
  });

  // React controlled inputs need the native value setter to fire onChange.
  const setRange = () => page.evaluate(() => {
    const s = document.querySelector('input[type="range"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(s, '100');
    s.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const unsetRange = () => page.evaluate(() => {
    const s = document.querySelector('input[type="range"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(s, '0');
    s.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await check('tap-select respects occlusion, then picks the CPU', async () => {
    // The side panel covers the interior: clicking the CPU's position first
    // must select the panel (correct occlusion behavior), not the CPU.
    await settle();
    const pt = await page.evaluate(() => window.__ictAtlas.projectPart('d-cpu'));
    assert.ok(pt, 'could not project d-cpu');
    await page.mouse.click(pt.x, pt.y);
    await settle();
    let heading = await page.locator('aside[aria-label="Component details"] h2').textContent();
    assert.ok(heading && heading.includes('Side panel'), `expected Side panel, got "${heading}"`);
    // Hide the panel via the browser eye toggle, then click through to the CPU.
    await page.locator('aside[aria-label="Component explorer"]').getByRole('button', { name: 'Hide Side panel' }).click();
    await settle();
    const pt2 = await page.evaluate(() => window.__ictAtlas.projectPart('d-cpu'));
    await page.mouse.click(pt2.x, pt2.y);
    await settle();
    heading = await page.locator('aside[aria-label="Component details"] h2').textContent();
    assert.ok(heading && heading.includes('CPU'), `detail panel shows "${heading}"`);
  });

  await check('search finds RAM by alias', async () => {
    await page.locator('input[aria-label="Search components"]').fill('ram');
    await page.waitForTimeout(400);
    const text = await page.locator('aside[aria-label="Component explorer"]').textContent();
    assert.ok(text.includes('RAM (memory modules)'), 'RAM in search results');
    await page.locator('input[aria-label="Search components"]').fill('');
  });

  await check('explode slider spreads the model', async () => {
    await settle();
    const before = await page.evaluate(() => window.__ictAtlas.projectPart('d-cpu-cooler'));
    await setRange();
    await settle();
    await page.waitForTimeout(2000); // let the eased part motion finish
    const after = await page.evaluate(() => window.__ictAtlas.projectPart('d-cpu-cooler'));
    const moved = Math.hypot(after.x - before.x, after.y - before.y);
    assert.ok(moved > 12, `cooler moved only ${moved.toFixed(0)}px when exploded`);
    await page.screenshot({ path: join(shots, 'desktop-exploded-1440x900.png') });
    await unsetRange();
    await settle();
  });

  await check('motherboard lab mode renders', async () => {
    await page.getByRole('button', { name: 'Motherboard Lab' }).click();
    await settle();
    const ids = await page.evaluate(() => window.__ictAtlas.partIds());
    assert.ok(ids.includes('m-cpu-socket') && ids.includes('m-dimm'), 'motherboard parts present');
    const pt = await page.evaluate(() => window.__ictAtlas.projectPart('m-cmos'));
    await page.mouse.click(pt.x, pt.y);
    await settle();
    const heading = await page.locator('aside[aria-label="Component details"] h2').textContent();
    assert.ok(heading && heading.toLowerCase().includes('cmos'), `detail panel shows "${heading}"`);
    await page.screenshot({ path: join(shots, 'motherboard-1440x900.png') });
  });

  await check('software lab lists simulations and quizzes', async () => {
    await page.getByRole('button', { name: 'Software Lab' }).click();
    await page.waitForTimeout(800);
    const text = await page.locator('aside[aria-label="Software lab"]').textContent();
    assert.ok(text.includes('The boot sequence') && text.includes('RAM vs storage'), 'simulations listed');
    await page.getByRole('button', { name: 'Quizzes' }).click();
    await page.waitForTimeout(400);
    const qtext = await page.locator('aside[aria-label="Software lab"]').textContent();
    assert.ok(qtext.includes('Hardware vs software'), 'quizzes listed');
    await page.screenshot({ path: join(shots, 'software-lab-1440x900.png') });
  });

  await check('desktop hero screenshot', async () => {
    await page.getByRole('button', { name: 'Desktop Explorer' }).click();
    await settle();
    await page.screenshot({ path: join(shots, 'desktop-1440x900.png') });
  });

  // ---- mobile viewport ----
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  mob.on('console', (m) => { if (m.type() === 'error') errors.push('[mobile] ' + m.text()); });
  mob.on('pageerror', (e) => errors.push('[mobile] ' + String(e)));
  await check('mobile 390x844 renders with panel buttons', async () => {
    await mob.goto('http://localhost:4173/?debug=1', { waitUntil: 'networkidle' });
    await mob.waitForSelector('canvas', { timeout: 15000 });
    await mob.waitForTimeout(2500);
    assert.ok(await mob.getByRole('button', { name: 'Parts' }).isVisible(), 'Parts button visible');
    await mob.getByRole('button', { name: 'Parts' }).click();
    await mob.waitForTimeout(600);
    const sheet = await mob.getByRole('dialog').locator('input[aria-label="Search components"]').isVisible();
    assert.ok(sheet, 'parts bottom sheet opens');
    await mob.screenshot({ path: join(shots, 'mobile-390x844.png') });
  });

  await check('no console errors or page errors', async () => {
    assert.deepEqual(errors, [], errors.slice(0, 5).join('\n'));
  });
} finally {
  await browser.close();
  server.kill();
}

const failed = results.filter((r) => r[0] === 'fail');
console.log(`\n${results.length - failed.length}/${results.length} smoke checks passed. Screenshots in scripts/smoke-shots/.`);
if (failed.length) process.exit(1);
