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
- One Pixi canvas renders the entire game: HUD, draggable floating pack rail, binder, settings/history, card inspection and results. No React runtime or components. Invisible semantic controls provide keyboard and screen-reader access to the same canvas controls.
- A Pokémon anime stadium with blue-and-white stands, hand-painted clouds, green hills and Poké Ball emblems. Its separate cel-shaded platform appears after tearing. Cloud drift, canopy wind, and subtle daylight shafts animate independently of the pinned stadium. A separate Spine rig owns LED cores, bloom, fixtures, and upward beams; the full white Poké Ball emblem now emits light while chassis shadows retain their original colors. Light spills upward onto the card, with a brief reduction in ambient exposure during anticipation. The platform is flattened to match the stadium floor, with a contact shadow and independently upright light shafts.
- Deforming wrapper tear, curled seal and foil interior; sliding stack, perspective flips, spring landing and rarity-sensitive light/particle bursts. On advance, the previous card shrinks along a curved path into its exact slot in the larger auto-follow card strip. Stage-light color comes from the card’s saturated artwork, sampled once and cached, with gray content removed so colored emission remains visible. Sound is optional.
- Large floating pack selections are linked by small animated light chevrons, with no docking belt or scrollbar. Mouse/touch dragging has elastic edges, momentum and snapping, with wheel and keyboard-button alternatives. The logo floats over the scene; circular binder/history/settings/sound icons replace the header bar and tabs. Money floats directly over the stage with cached bitmap glyphs, animated credit counts and payout sparkles; no per-frame text rasterization.
- Special cards charge with rising light and escalating shake, then reveal with a finite cel impact fan. No idle white particles surround revealed cards. The shaded Poké Ball follows a projected ballistic arc, punctures the artwork, falls under gravity, rebounds once, and opens a depth-sorted hemisphere lid in Spine.
- Pokémon use actual skinned GLB models and recorded clips with toon shading and outlines. 33 species have animated models; 28 include mapped attacks, and 5 have display motion only. The 17 without available clips retain clean, undeformed artwork. Powers follow projected animated jaw/head/torso bones. Charizard's jaw-opening curve informs the attack cue. Model coverage and source limitations are in `public/assets/pokemon-3d/provenance.json`.
- Modern packs contain ten rewards plus one zero-value Energy. Base Set contains nine rewards plus two Energy. Results are fixed/saved before animation and credited once when collected.
- Browser-local persistence, unfinished pack recovery, collection/duplicate counts, large fitted card inspection, export, opening history, free credits, sound, reduced motion and low graphics.

## Temporary animation preview

`GUARANTEED_FIRST_SPECIAL` in `src/game/previewOpening.ts` is currently **true**, as requested for testing. Every newly created pack starts with its highest-value supported Pokémon; Obsidian Flames starts with Charizard ex. The saved `previewSpecial` marker enables its first-card animation even when the current illustrative card value is below the pack cost. Card values, reward counts, debit and settlement rules are unchanged. Existing paid openings are not rewritten. Set the flag to false to restore ordinary random draws for new packs.

## Rendering

Vanilla TypeScript coordinates XState and IndexedDB. PixiJS owns all visible UI and the render loop; GSAP owns animation timelines. A lazy-loaded Three renderer draws skeletal Pokémon into transparent Pixi portraits at 30 portrait frames/sec (640px, or 384px in low graphics); it adds no website/DOM game layer. Spine owns the ball and stage-light rigs. The shared portrait renderer, skeleton bone textures and late asset loads have explicit teardown paths. Menus pause the scene and opening timeline, including reveals whose images finish loading while a menu is open. Static screens redraw only after interaction, loading or a short UI animation; redraw requests are coalesced.

The game targets 60fps. Renderer resolution is capped at 1.5× density and a 1.7-million-pixel budget (1× / 950,000 pixels in low graphics). Card source resolution is unchanged. Perspective meshes skip unchanged projections. Scenery uses sprites and pre-rendered light textures rather than live CSS blur/filter layers. Collection pages and thumbnail memory are bounded; full-resolution scans load for inspection/reveal. Hidden tabs pause rendering.

Opt-in `?perf=1` displays actual game ticker rate separately from browser animation-frame cadence. On this session's 1280×720 IAB viewport, the old DOM/CSS version measured about 18 browser animation frames/sec (p95 50.2ms); the new canvas version measured approximately 58–60 game frames/sec, browser cadence 120/sec, p95 about 9.3ms, with no >33.5ms browser frames in the sampled windows. Results are device-specific, not a universal performance guarantee.

## Assets and rules

[ASSET-SOURCES.md](ASSET-SOURCES.md) records sources. Modern scans are native 733/734×1024, Base Set 600×825. The anime background is 1672×941 and the transparent platform 1774×887. [Artwork prompts and provenance](public/assets/stage/ANIME-STAGE-ART.md) document built-in image generation. All assets are served locally. Nunito is bundled under its SIL Open Font License; Sampled interaction/reveal sounds and quiet anime background music have separate provenance in `public/assets/audio-v2` and `public/assets/audio-v3`. Music ducks under cinematic cues and respects mute/visibility. Source images and rejected versions are retained outside the deployed bundle where applicable.

The supplied PDF references a separate 250-card pool and payout weights that were not provided. This demo uses curated genuine cards and illustrative values/weights. It does not reproduce physical booster odds or claim verified 94.5% RTP. Credits have no cash value; no payments, withdrawal or backend is implemented.

## Verification

53 automated tests cover debit/settlement idempotency, pack prices, reward counts, Energy, recovery, invalid saves, insufficient funds, stale-tab settlement, state-machine gating, renderer pixel budgets, collection pagination and responsive stage bounds, drag momentum, snap limits and edge resistance, card-flight landing bounds and artwork-color extraction, audio pause/ducking, full-emblem light masking, ball trajectory/rebound, and delayed model teardown. Browser checks cover desktop/portrait/landscape UI, pause/resume, collection/inspection, repeated reveals, payout, settings and pack selection. Production build includes an expected Pixi vendor size advisory (~178 kB gzip).

## Source

- `src/main.ts`, `src/game/Game.ts`: bootstrap, discrete game orchestration and accessibility bridge.
- `src/game/CanvasUI.ts`: all game screens, pack selector and bitmap credit animations.
- `src/game/CanvasScene.ts`, `Stage.ts`: anime environment, pack/card meshes, effects and renderer lifecycle.
- `src/game/model.ts`, `storage.ts`, `machine.ts`: demo economy and persistence.
- `public/assets`: local imagery, font and sound.
