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

## Deployment

Pushing to `main` updates the connected Vercel showcase. Vercel runs `npm ci` and `npm run build`, then serves `dist/`. Commit source changes; do not commit `dist/` or replace this repository with compiled files.

The GitHub Actions workflow also runs the tests and builds the existing GitHub Pages showcase using `npm run build:pages`. That command handles the `/pokemon-legends-showcase/` asset prefix. `release.json` in each deployment identifies its source commit.

The earlier source and compiled-showcase Git histories are retained. Collaborators with Write access can clone, edit, and push the complete project here.
