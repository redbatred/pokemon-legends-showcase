# Pokémon Legends frontend specification

User approved React, PixiJS, GSAP, XState, Howler and IndexedDB, authentic online artwork, 2.5D motion, and frontend-only implementation. Source: Downloads/Pokemon_Legends.pdf.

## Current direction

The Pokémon Legends header and two tabs sit above the game itself. No marketing headings, explanatory sidebars or promotional copy in the main play area. Ten priced pack types appear in the bottom selector. A clean dark-indigo selection scene holds the unopened pack. Only after the wrapper tears do cards enter the illustrated Pokémon arena.

The latest user correction explicitly rejects hyperrealistic/generated scenery. The final environment is code-drawn, cel-shaded SVG, official Sugimori Charizard/Charmander art, drifting clouds, outlined mountains, animated flames/embers and a Poké Ball platform. The rejected generated cave is archived outside public assets.

## Flow and rules

Select pack → reserve/save results and debit selected price → drag or button to tear → anime-scene entrance and card reveals → settle once → collection and result. Modern packs contain ten rewards plus one Energy; Base Set has nine plus two Energy. All Energy is zero value. Reload resumes a reserved opening without another debit. Credits, values and weights are illustrative, with no real-money operation or verified RTP claim.

Ten sets with 25 actual cards each include every PDF featured reference. Modern image sources are native 1024px tall. Full-size inspection and high-resolution shader render targets preserve small print. No synthesized card art or upscaling.

## Animation architecture

Pixi owns mutable frame state and perspective meshes. GSAP animates wrapper deformation, torn seam, curl, wrapper drop, card flip and light sweep. React only changes on discrete flow events. CSS/SVG owns ambient anime layers; hidden scene animations pause. Reduced motion and low graphics are available, plus keyboard alternatives and accessible DOM results.

## Validation

Accounting and state-machine tests, ten-pack metadata/image integrity, resume/idempotency, drag/button opening, completion, collection, full-size inspection, responsive layout and browser console checks. Native source dimensions and provenance are recorded separately.
