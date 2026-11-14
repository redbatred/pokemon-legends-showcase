# Pokémon Legends

The complete, editable game project for [redbatred/pokemon-legends-showcase](https://github.com/redbatred/pokemon-legends-showcase). This repository contains the source code, local assets, tests, and build configuration. It is no longer a compiled-files-only mirror.

[Play the showcase](https://pokemon-legends-showcase.vercel.app/)

## Develop

Use Node.js 22.12 or newer and npm.

```sh
git clone https://github.com/redbatred/pokemon-legends-showcase.git
cd pokemon-legends-showcase
npm ci
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5174/).

```sh
npm test
npm run build
npm run preview
```

No backend, API keys, or environment secrets are needed. Credits and collections are stored locally in the browser; credits have no cash value.

## Project layout

- `src/` — editable TypeScript, canvas UI, game logic, animation, and tests.
- `public/assets/` — cards, packs, stadium artwork, Spine rigs, Pokémon models, fonts, and audio.
- `tests/browser/` — interactive browser QA fixtures, served by the dev server.
- `scripts/` — asset preparation and deployment helpers.
- `docs/` — design notes, research, and verification records.
- `ASSET-SOURCES.md` — asset sources and provenance.
- `vercel.json` and `.github/workflows/pages.yml` — deployment configuration.

The frontend uses PixiJS, Spine, GSAP, XState, Three.js, and IndexedDB. There is no React layer. Individual reveals, simultaneous Open All, Turbo, Auto Spin, session results, collection, and history are implemented in the source.

## Legendary capture bonus

Three bonus Poké Balls anywhere among the reward cards of one pack unlock the bonus. With cards revealed one at a time it opens as soon as the third ball lands in the collector, and the pack resumes at the same card afterwards; with Open All it follows that reveal. The three balls seat in the receiver tray, an ink transition and an eye close-up introduce the legendary (Lugia or Mewtwo) in its cavern, and the player presses **Throw**. The Pokémon turns to energy and is drawn into the ball; three checks lead to **Caught!** or a break-out, with Team Rocket's voiced comments along the way. A catch reveals the reward card, its 180× multiplier and a counted total.

The outcome is a 50/50 mock decided before the throw (throw timing never changes it). A catch in a pack's own bonus pays that pack: the legendary's multiplier of the pack price joins the pack total and reaches the wallet when the pack settles. The **Bonus Buy** ticket opens the encounter directly as a preview and pays nothing. Append `?outcome=capture` or `?outcome=escape`, and `?legendary=mewtwo`, to force a case from the URL; the cheats panel does the same from inside the game.

The encounter scene is the standalone page in `output/capture-motion-v25/`, embedded over the game by `Game.openShowdown` (`src/game/bonusEncounter.ts`). It ships with the game: `vite.config.ts` builds the page as a second entry and copies the art and sound it fetches at run time, which are named in `output/capture-motion-v25/ship.json`. A new file the scene loads by URL must be added to that list (and committed), or the live bonus will miss it. The rest of `output/` is local scratch and stays ignored.

The scene is loaded when it is first needed, and it is a large download (about 26 MB), so three things keep the first Bonus Buy from waiting on the network. Its art ships as lossless WebP and its music as FLAC (the same pixels and samples in about half the bytes; each score's WAV stays beside it for a browser that cannot decode FLAC): after adding or changing bonus art or music, run `node scripts/pack-bonus-assets.mjs`, which converts new files, points the atlases at the WebP pages and rewrites `ship.json` (needs `cwebp` and `ffmpeg`). Once the game is on screen it fetches those files into the browser's cache in the background (`src/game/bonusPrefetch.ts`; skipped on a data-saver or 2G connection), so opening the encounter reads them from the device. And if the encounter still has to load when it is asked for, a loader with real progress appears at once (`src/game/BonusLoader.ts`). A game asset the scene loads from `/assets/` belongs in `sharedFiles` in `bonusPrefetch.ts`; a test checks the scene's code against that list. Notes: `docs/animation/2026-11-14-capture-bonus.md`. The earlier Charizard-vs-Mewtwo vault (`src/game/showdown/LegendaryShowdown.ts` and its scene) is no longer opened by the game.

## Demo cheats

**Settings → Cheats** chooses what the next pack holds, for showing the game. Nothing is faked: the pack is dealt with the chosen outcome, saved, revealed and paid by the normal rules (`src/game/cheats.ts`), on demo credits. The choices stay until changed or reset; reloading the page clears them.

- **Pokémon win**: Random, Normal (no special Pokémon), Special, or a Big / Mega / Epic / Legendary win on the first card. The first card is one of the set's showcase Pokémon and is valued inside that win's band (4×, 12×, 30×, 160× the pack price).
- **End screen total**: the least the pack pays in all, at the end screen's own thresholds (Big 10×, Mega 50×, Epic 100×, Legendary 150×). The first card carries the amount, so a large total also plays a large Pokémon win.
- **Bonus game**: Random, Off, Caught or Escaped. Caught and Escaped put the three bonus balls in the pack and fix how the throw ends; they also apply to Bonus Buy.
- **Legendary**: Lugia or Mewtwo in the bonus.

**Open pack** in the panel buys the selected pack with those choices. The end screen and the Pokémon wins use different scales (a 30× Epic Pokémon win ends on a Big Win screen); use both rows to show a particular end screen.

## Deployment

Pushing to `main` updates the connected Vercel showcase. Vercel runs `npm ci` and `npm run build`, then serves `dist/`. Commit source changes; do not commit `dist/` or replace this repository with compiled files.

The GitHub Actions workflow also runs the tests and builds the existing GitHub Pages showcase using `npm run build:pages`. That command handles the `/pokemon-legends-showcase/` asset prefix. `release.json` in each deployment identifies its source commit.

The earlier source and compiled-showcase Git histories are retained. Collaborators with Write access can clone, edit, and push the complete project here.
