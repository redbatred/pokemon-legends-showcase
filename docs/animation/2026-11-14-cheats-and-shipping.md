# Demo cheats and shipping the capture bonus

## Cheats (Settings → Cheats)

A presenter's panel that chooses what the next pack holds. It changes only the deal; the pack is then saved, revealed and paid by the game's own rules, so the Pokémon win, the bonus and the end screen are the real ones.

- Logic: `src/game/cheats.ts` (`createCheatOpening`, tested against every shipped set in `cheats.test.ts`). With nothing chosen it is exactly the ordinary opening.
- **Pokémon win** puts one of the set's showcase Pokémon on the first card (the existing `createPreviewOpening` path) and values it inside the chosen tier of `winTier`: Big 4×, Mega 12×, Epic 30×, Legendary 160× the pack price. Special keeps the card's own value, capped under 2×. Normal swaps any special card for an ordinary one.
- **End screen total** raises the first card until the pack pays at least the tier's threshold from `PACK_TIERS` (10 / 50 / 100 / 150×). It is a floor; a bigger Pokémon win is not cut down.
- **Bonus game**: Off deals no bonus balls; Caught / Escaped deal all three (cards 2, 5 and 8 of ten) and fix the throw. **Legendary** picks Lugia or Mewtwo; the scene is reloaded when it changes. Both also apply to Bonus Buy. `?outcome=` and `?legendary=` still work when the panel is on Random.
- The choices live in memory (`PokemonGame.cheats`): they stay until changed or reset and are gone after a reload. The Settings key reads CHEATS · ON while any are set.
- Panel: `CanvasUI.cheatsMenu`, laid out by `cheatsLayout` (strips of chips on wide panels, wrapped rows on phones; tested from 320×480 to 1920×1080). It uses the shared cut-corner panel and the same chips as Auto Spin.

Known mismatch, left as it is: Pokémon wins are tiered at 2 / 8 / 20 / 50× and the end screen at 10 / 50 / 100 / 150×, so an Epic Pokémon win (30×) ends on a Big Win screen. The two rows exist so either can be shown.

## The bonus scene now ships

The scene in `output/capture-motion-v25/` was git-ignored and absent from the build, so the bonus only worked on a developer's machine.

- `vite.config.ts` builds its `index.html` as a second entry and copies the files it fetches at run time, named in `output/capture-motion-v25/ship.json` (67 files, 54 MB; a test checks the list against the atlases and the voice bank).
- `.gitignore` now ignores `output/*` except that folder; its `videos/`, `review/` and `recordings/` stay local.
- `BONUS_SCENE` follows the site's base path, and `scripts/prepare-deployment.mjs` rebases the scene's own `/output/…` URLs for the GitHub Pages build.

Checked: a Legendary win + caught Mewtwo pack and a Normal + escaped Lugia pack through the game in the lab; a Mega win + caught Lugia pack through the production build served locally, driven by the game's own controls, with every scene file answering 200.
