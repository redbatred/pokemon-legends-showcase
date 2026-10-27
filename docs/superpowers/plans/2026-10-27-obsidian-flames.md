# Obsidian Flames Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver a polished playable frontend with authentic Obsidian Flames artwork and responsive 2.5D animation.
**Architecture:** React provides accessible UI and discrete state. Pixi/GSAP render independently of React's component lifecycle. XState governs opening, with IndexedDB recovery and integer-cent demo accounting.
**Tech Stack:** React 19, TypeScript, Vite, PixiJS 8, GSAP 3, XState 5, Howler 2, IndexedDB/idb.
**Spec:** docs/superpowers/specs/2026-10-27-obsidian-flames-design.md

## Global Constraints
- One Obsidian Flames pack, 25 real reward cards, 10 reward slots plus one non-reward Energy.
- $10 demo pack, $100 initial demo balance; no payments and no claimed RTP.
- React never stores frame animation state; use Pixi ticker, shader uniforms and GSAP objects.
- Assets served locally, sources documented. Static frontend, private preview.

## Review Focus
- Duplicate opening/settlement input must not duplicate money or records.
- Refresh in a paid opening recovers the same results without another debit.
- Missing/bad persistence must degrade visibly; no silent false save claim.
- Rapid reveal/skip clicks cannot overlap transitions or lose settlement.
- Mobile, keyboard and reduced motion retain the complete playable flow.

### Task 1: Demo transaction model and assets
Files: src/game/model.ts, src/game/model.test.ts, src/game/storage.ts, src/game/machine.ts, public/assets, ASSET-SOURCES.md.
Interfaces: Card, Opening, Save; createOpening(save,cards,rng), settleOpening(save), validateSave(value), newSave().
- [x] Test missing behavior: 11 cards, zero Energy, debit once, insufficient balance, idempotent settlement and recovery validation.
- [x] Implement integer-cents model and test invariants.
- [x] Download curated real art and trace every source.

### Task 2: Playable stage
Files: src/game/Stage.ts, src/game/foil.ts, src/game/audio.ts, src/components/GameStage.tsx.
Interfaces: Stage mount/destroy, showPack, tear, reveal, inspect; callbacks for ready, tear and animation completion.
- [x] Implement projected pack, gesture tear, split wrapper, card reveal, foil shader and particle pool.
- [x] Connect XState to real animations with guarded inputs; keep monetary changes outside animation callbacks.
- [x] Add sound and settings, cleanup, capped rendering and hidden-page pause.

### Task 3: Full interface and verification
Files: src/App.tsx, src/styles.css, src/main.tsx, README.md.
- [x] Build set page, responsive stage, reveal rail, result, collection, inspect dialog and settings.
- [x] Verify core suite and production build; inspect desktop/mobile actual browser and finish full flow.
- [x] Independent whole-project review; repair important findings.
- [ ] Package/publish private Site and show result.

## Execution ledger
- User explicitly requested start building; proceed without a further planning gate.
- Workspace is new and empty, not an existing Git checkout; implementation stays in this isolated project directory.
- Spine deferred: there are no prepared rigs, and 2.5D card animation needs no runtime skeletons.

- Verification: eight unit tests pass; sequential 11-card flow, reload recovery, credit addition mid-reveal, reduced-motion reveal-all, and 390px mobile rendering checked in IAB.
- Independent review found clone-triggered duplicate reveals and stale-tab settlement. Fixed stable reveal keys/cancelled callbacks and opening-ID settlement; new regression test observed failing before fix.
- Browser preview uses port 5174 because 5173 belongs to another process.

## Completed scope corrections

User removed the editorial/marketing layout in favour of a full game canvas below the header, ten priced pack types below it, sharper real imagery, and more physical wrapper animation. Implemented these changes and extended rules to Base Set's nine rewards plus two Energy.

User then rejected the generated cave and required Pokémon anime art direction with the stage appearing only after tearing. Replaced the cave with original SVG scenery and real high-resolution Sugimori Pokémon art. The selection scene has no platform. The reveal scene uses layered cel-shaded mountains/clouds, flame motion, energy particles and a Poké Ball platform. Archived rejected art outside public.

Validation: ten unit tests pass; production build and browser checks performed. Reviewer found one remaining stale-tab credit-update edge; added transaction guard to preserve local reveal state when another tab changes the active opening.


## Final user direction

Replaced vector-only art with generated anime paintings for the arena and separate transparent mechanical platform. No characters in scenery, no orange UI. Added composed spotlight/mist/star/energy layers, stage activation, refined fold/turn/travel/departure timelines, clipped card-back corners and animated money counters. Sources for motion implementation: https://gsap.com/docs/v3/GSAP/Timeline/ and https://pixijs.download/release/docs/scene.MeshPlane.html; Pokémon TCG Pocket official presentation reviewed at https://tcgpocket.pokemon.com/en-us/.

Private source upload initially exceeded the Git request size limit. Importing unchanged native-resolution image objects in bounded commits avoids lowering image quality; final source helper still verifies/builds/packages the exact final commit.
