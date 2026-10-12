# ICT Atlas

**An interactive 3D explorer for Cambridge ICT students — desktop computers, motherboard anatomy, and software simulations.**

ICT Atlas is a frontend-only React + Three.js application. Students orbit, zoom, and tap a realistic 3D desktop computer; open a detailed motherboard lab; run guided tours; play with software simulations (boot sequence, input→process→output, RAM vs storage, software layers, hardware/software dependencies); and test themselves with quizzes.

## Quick start

```bash
npm ci
npm run dev        # local dev server
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## Validation

```bash
npm run check                  # tsc --noEmit
npm run validate:content       # 396 checks: content integrity, model/content id parity, search contracts, quiz validity
npm run validate:interactions  # 44 checks: tap-vs-drag, visibility/isolation, easing, camera math
npm run smoke                  # builds, then 10 headless-Chromium checks against the production build
```

`npm run smoke` needs the cached Playwright Chromium (`~/.cache/ms-playwright`); it serves `dist/` with `vite preview`, verifies page load with zero console errors, raycast tap-selection (including occlusion behavior), search, the explode slider, mode switching, and renders at 1440×900 and 390×844. Screenshots land in `scripts/smoke-shots/`.

**Testing limitations (honest):** real mobile hardware and multitouch were not tested — viewports are emulated in headless Chromium only. Performance was measured on SwiftShader software rendering (worst case); no dedicated GPU profiling was done.

## Architecture

```
src/
  data/          Educational content, separate from scene code
    components.ts  29 component records: id, name, aliases, category,
                   description, function, examples, related[], syllabus tags
    tours.ts       Guided tours (ordered spotlights + narration)
    quizzes.ts     Choice / ordering / true-false questions with explanations
    sims.ts        Simulation step scripts + 3D spotlight references
  state/store.ts   Zustand store: mode, selection, visibility, isolate, explode,
                   camera goals, tours, lab tabs  (mirrors Human Atlas SceneState)
  three/
    models.tsx     Procedural 3D asset library (all geometry generated in code)
    Part.tsx       Selectable part primitive: registration, highlight, exploded
                   animation, visibility — one <Part> per component id
    SceneView.tsx  R3F canvas, lights, CameraRig (smooth interruptible flights),
                   TapSelect (tap-vs-drag + raycast picking), hover tooltips
    registry.ts    Live part-group registry for picking + camera focus
    pointerTap.ts  Tap-vs-drag discriminator (ported from Human Atlas, MIT)
  ui/              TopBar, ComponentBrowser, DetailPanel, SimPanel, QuizPanel,
                   TourBar, App shell (desktop panels + mobile bottom sheets)
scripts/
  validate-content.mjs       manifest/content/model parity, search + quiz contracts
  validate-interactions.mjs  interaction-logic unit checks (no browser)
  smoke.mjs                  headless-Chromium end-to-end checks + screenshots
```

### What was reused from Human Atlas (MIT, © 2026 ashemag)

Studied at https://github.com/aliaaquib/human-atlas. Reused architectural ideas, not assets:

- **Data-driven part model** — mesh id → content record mapping.
- **`PointerTap`** — tap-vs-drag discrimination, ported verbatim (`src/three/pointerTap.ts`).
- **Scene state shape** — `{explode, visible, selected, isolate, view, rotate, reset}` adapted to a Zustand store.
- **Validation strategy** — node scripts asserting manifest integrity, search/inspection contracts, and interaction math.
- **Camera framing** — fit-distance from bounds; deterministic exploded offsets; smooth interruptible flights.

Divergences: React Three Fiber instead of raw three.js (component-per-part maps naturally at our ~30-part scale, so GPU-batched visibility textures were unnecessary); procedural models instead of downloaded anatomy data; shelf-packed explosion replaced by per-part deterministic offsets (validated for uniqueness and sane magnitudes).

No Human Atlas code (beyond the MIT-licensed PointerTap class), models, or anatomical assets were copied into this project.

### 3D asset pipeline decision

Per the build spec §3, external models (Sketchfab et al.) were evaluated and **rejected in favor of procedural geometry generated in code** (`src/three/models.tsx`):

- Stable, meaningful part IDs with zero licensing risk and ~0 KB downloads.
- Deterministic exploded-view offsets, verified by `validate-content.mjs`.
- Crisp, clearly-labeled educational geometry — no static images standing in for 3D.

If higher-fidelity GLB assets are ever sourced, each `<Part id="…">` maps 1:1 to a GLB node and `src/data/*` is untouched. See `public/ATTRIBUTION.md`.

## Deployment (Vercel)

The project is static-hosting ready:

1. `npm ci && npm run build` produces `dist/`.
2. `vercel.json` sets framework `vite`, build `npm run build`, output `dist`, plus an SPA rewrite fallback.
3. No environment variables, no backend, no API keys. Fonts are self-hosted in `public/fonts` (OFL 1.1) — the app makes zero external requests, so the core experience works offline once loaded.

To deploy: connect the repo to Vercel (or run `vercel --prod`). No public deployment has been made from this workspace.

## Known limitations & follow-ups

- Models are stylized/educational, not engineering-accurate CAD. The motherboard layout is plausible and representative, not a specific board.
- Bundle is ~1.24 MB (340 KB gzip), dominated by three.js. Acceptable for the target (school laptops on broadband); code-splitting the 3D view is a future win.
- Real-device mobile performance and multitouch not tested (see above).
- Syllabus tags reference Cambridge IGCSE ICT 0417 topic areas for study guidance; this project is not endorsed by Cambridge.
- Quiz/simulation content is human-written and validator-checked, but not yet reviewed by a classroom teacher.

## License

Application code is original work by the ICT Atlas author. Fonts: SIL Open Font License 1.1 (see `public/ATTRIBUTION.md`). Human Atlas reference: MIT © 2026 ashemag.
