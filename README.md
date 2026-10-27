# Pokémon Legends

Frontend-only Pokémon pack opening with authentic imagery and 2.5D animation.

## Run

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Use the Local URL printed by Vite. The development preview for this session uses port 5174.

## Implemented

- Ten selectable packs at the supplied PDF prices ($10–$1,000 demo credits), with 25 genuine card scans per set. All 30 featured references from the brief are included.
- A dedicated selection scene. After the wrapper tears, cards enter an anime-style scene drawn in SVG with official Charizard and Charmander artwork, layered clouds, fire, embers and a Poké Ball platform. No generated background is used.
- Deforming wrapper meshes, progressively torn edges, a curled seal, foil interior and sliding card stack. Pointer drag and a keyboard-accessible tear button share the opening sequence.
- Perspective card flips, pointer tilt and restrained holographic effects. Card text is protected from glare. Filters inherit display resolution; the inspector has a native-size view.
- Ten rewards plus one zero-value Energy for modern packs; nine rewards plus two Energy for Base Set. Results are fixed and saved before animation; settlement credits their total exactly once.
- Collection, duplicate counts, inspection, export, history, free credits, sound, reduced motion and low graphics. IndexedDB restores unfinished openings after refresh.

## Rendering

React owns menus and discrete game events. PixiJS owns the render loop, geometry and shader uniforms; GSAP owns animation timelines. No per-frame React state updates. XState gates opening events. The renderer targets 60fps and uses up to 2× display resolution (1× in low graphics), pauses when hidden, and stops on results. Actual frame rate depends on the device.

## Assets and rules

[ASSET-SOURCES.md](ASSET-SOURCES.md) records source URLs. Modern scans are native 733/734×1024; Base Set scans are source-native 600×825. Character art is native 2356×2356 and 932×932. Images are stored locally. Refresh with `node scripts/fetch-assets.mjs`; original downloads are preserved in ignored `source-assets/`, outside the deployed bundle. UI sounds are original synthesized effects. Typography uses Google Fonts with system fallbacks.

The supplied PDF references a separate 250-card pool and payout weights that were not provided. This implementation uses curated genuine cards and illustrative values/weights. It does not reproduce physical booster odds or claim a verified 94.5% RTP. Credits have no cash value; no payments, withdrawal or backend is implemented.

## Verification

Ten automated tests cover debit and settlement idempotency, selected-pack price, reward counts, Energy value, recovery, invalid saves, insufficient funds, stale-tab settlement and state-machine gating. Browser QA covers selection, drag/button opening, sequential reveal, reveal-all, reload recovery, credits, collection, native-size inspection and desktop/mobile layouts. TypeScript and production build pass. Pixi's vendor chunk has a size advisory (about 174 kB gzip).

## Source

- `src/App.tsx`: game UI and orchestration.
- `src/components/AnimeScene.tsx`: layered anime environment and selection backdrop.
- `src/game/Stage.ts`, `foil.ts`, `audio.ts`: canvas animation, shader and sound.
- `src/game/model.ts`, `storage.ts`, `machine.ts`: demo economy and persistence.
- `public/assets`: served imagery and sound.
