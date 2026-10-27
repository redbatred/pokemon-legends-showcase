# Pokémon Legends

Frontend-only Pokémon pack opening with genuine card/pack images and a 2.5D animated canvas.

## Run

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Development preview: http://localhost:5174/.

## Game

- Ten packs at the supplied PDF prices ($10–$1,000 demo credits), 25 genuine scans per set, including all 30 featured references from the brief.
- One Pixi canvas renders the entire game: HUD, floating pack selector, binder, settings/history, card inspection and results. No React runtime or components. Invisible semantic controls provide keyboard and screen-reader access to the same canvas controls.
- A Pokémon anime stadium with blue-and-white stands, hand-painted clouds, green hills and Poké Ball emblems. Its separate cel-shaded platform appears after tearing. Slow environment drift, moving lights, socket glows and expanding reveal pulses share the same renderer.
- Deforming wrapper tear, curled seal and foil interior; sliding stack, perspective flips, spring landing and rarity-sensitive light/particle bursts. Sound is optional.
- Larger pack artwork and price badges float over a transparent bottom fade. Money uses cached bitmap glyphs, animated credit counts and a short payout sparkle sequence; no per-frame text rasterization.
- Modern packs contain ten rewards plus one zero-value Energy. Base Set contains nine rewards plus two Energy. Results are fixed/saved before animation and credited once when collected.
- Browser-local persistence, unfinished pack recovery, collection/duplicate counts, native-size inspection with pan, export, opening history, free credits, sound, reduced motion and low graphics.

## Rendering

Vanilla TypeScript coordinates XState and IndexedDB. PixiJS owns all visible UI and the render loop; GSAP owns animation timelines. Menus pause the scene and opening timeline, including reveals whose images finish loading while a menu is open. Static screens redraw only after interaction, loading or a short UI animation; redraw requests are coalesced.

The game targets 60fps. Renderer resolution is capped at 1.5× density and a 1.7-million-pixel budget (1× / 950,000 pixels in low graphics). Card source resolution is unchanged. Perspective meshes skip unchanged projections. Scenery uses sprites and pre-rendered light textures rather than live CSS blur/filter layers. Collection pages and thumbnail memory are bounded; full-resolution scans load for inspection/reveal. Hidden tabs pause rendering.

Opt-in `?perf=1` displays actual game ticker rate separately from browser animation-frame cadence. On this session's 1280×720 IAB viewport, the old DOM/CSS version measured about 18 browser animation frames/sec (p95 50.2ms); the new canvas version measured approximately 58–60 game frames/sec, browser cadence 120/sec, p95 about 9.3ms, with no >33.5ms browser frames in the sampled windows. Results are device-specific, not a universal performance guarantee.

## Assets and rules

[ASSET-SOURCES.md](ASSET-SOURCES.md) records sources. Modern scans are native 733/734×1024, Base Set 600×825. The anime background is 1672×941 and the transparent platform 1774×887. [Artwork prompts and provenance](public/assets/stage/ANIME-STAGE-ART.md) document built-in image generation. All assets are served locally. Nunito is bundled under its SIL Open Font License; UI sounds are original synthesized effects. Source images and rejected versions are retained outside the deployed bundle where applicable.

The supplied PDF references a separate 250-card pool and payout weights that were not provided. This demo uses curated genuine cards and illustrative values/weights. It does not reproduce physical booster odds or claim verified 94.5% RTP. Credits have no cash value; no payments, withdrawal or backend is implemented.

## Verification

14 automated tests cover debit/settlement idempotency, pack prices, reward counts, Energy, recovery, invalid saves, insufficient funds, stale-tab settlement, state-machine gating, renderer pixel budgets, collection pagination and responsive stage bounds. Browser checks cover desktop/portrait/landscape UI, pause/resume, collection/inspection, repeated reveals, payout, settings and pack selection. Production build includes an expected Pixi vendor size advisory (~178 kB gzip).

## Source

- `src/main.ts`, `src/game/Game.ts`: bootstrap, discrete game orchestration and accessibility bridge.
- `src/game/CanvasUI.ts`: all game screens, pack selector and bitmap credit animations.
- `src/game/CanvasScene.ts`, `Stage.ts`: anime environment, pack/card meshes, effects and renderer lifecycle.
- `src/game/model.ts`, `storage.ts`, `machine.ts`: demo economy and persistence.
- `public/assets`: local imagery, font and sound.
