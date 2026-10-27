# Pokémon Legends frontend specification

User approved React, PixiJS, GSAP, XState, Howler and IndexedDB, authentic online artwork, 2.5D motion, and frontend-only implementation. Source: Downloads/Pokemon_Legends.pdf.

## Current direction

The Pokémon Legends header and two tabs sit above the game itself. No marketing headings, explanatory sidebars or promotional copy in the main play area. Ten priced pack types appear in the bottom selector. A clean dark-indigo selection scene holds the unopened pack. Only after the wrapper tears do cards enter the illustrated Pokémon arena.

The final user direction requests generated, intricate Pokémon anime atmosphere, no Pokémon characters in the scenery, and no orange interface accents. The environment and separate transparent platform are high-resolution generated anime paintings. CSS composites moving light beams, mist, stars and energy effects, with platform activation timed to card arrival. Buttons and pack selections use indigo, cyan and silver. Earlier cave, vector-only scenery and character-bearing designs are superseded.

Card-back corners are masked at native resolution. The wrapper folds to expose silver material, tears in stages under tension, and falls away. Cards travel onto the stage, turn with perspective and a visible thin edge, then depart toward the collection strip. Money counts up through DOM animations rather than React frame updates.

## Flow and rules

Select pack → reserve/save results and debit selected price → drag or button to tear → anime-scene entrance and card reveals → settle once → collection and result. Modern packs contain ten rewards plus one Energy; Base Set has nine plus two Energy. All Energy is zero value. Reload resumes a reserved opening without another debit. Credits, values and weights are illustrative, with no real-money operation or verified RTP claim.

Ten sets with 25 actual cards each include every PDF featured reference. Modern image sources are native 1024px tall. Full-size inspection and high-resolution shader render targets preserve small print. No synthesized card art or upscaling.

## Animation architecture

Pixi owns mutable frame state and perspective meshes. GSAP animates wrapper deformation, torn seam, curl, wrapper drop, card flip and light sweep. React only changes on discrete flow events. CSS/SVG owns ambient anime layers; hidden scene animations pause. Reduced motion and low graphics are available, plus keyboard alternatives and accessible DOM results.

## Validation

Accounting and state-machine tests, ten-pack metadata/image integrity, resume/idempotency, drag/button opening, completion, collection, full-size inspection, responsive layout and browser console checks. Native source dimensions and provenance are recorded separately.
