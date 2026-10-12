# Attribution

## 3D models

All 3D geometry in ICT Atlas is **generated procedurally in code** (`src/three/models.tsx`). No third-party 3D models, textures, or images are used or redistributed. There is nothing to attribute for the models themselves.

## Fonts (self-hosted, no external requests)

- **Inter** — Copyright (c) Rasmus Andersson. SIL Open Font License 1.1.
- **Space Grotesk** — Copyright (c) Florian Karsten. SIL Open Font License 1.1.

WOFF2 files (latin subset) live in `public/fonts/`. License texts: https://scripts.sil.org/OFL

## Reference architecture

**Human Atlas** — https://github.com/aliaaquib/human-atlas — MIT License, Copyright (c) 2026 ashemag.

Studied as the technical reference for the 3D explorer architecture (part data model, tap-vs-drag interaction, exploded-view approach, validation strategy). The `PointerTap` class in `src/three/pointerTap.ts` is ported from Human Atlas's `app/pointer-tap.ts` under its MIT license. No Human Atlas code beyond that class, and no Human Atlas models, data, or assets, are included in this project.

## Dependencies

Third-party npm dependencies (three, React, @react-three/fiber, @react-three/drei, zustand, Tailwind CSS, Vite, TypeScript, playwright-core) remain subject to their respective licenses; see `package.json` and each package's license file.
