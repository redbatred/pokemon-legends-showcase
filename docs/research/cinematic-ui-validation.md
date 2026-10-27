# Cinematic reveals and canvas UI — 2026-10-27

## Changes

- The stadium dims through suspense and the Pokémon attack, with an edge vignette and restrained elemental speed lines behind the actor. The stage is dimmed independently; emissive rings remain visible. The background returns after the move.
- Pokémon move cues and cries play at half the previous gain. Five exact Pokémon GO move cues were added, with source hashes and reproducible extraction metadata in `public/assets/audio-v4/provenance.json`.
- Fourteen species now use measured clip timing and skeletal effect origins, including ten newly audited species. Swift, Shadow Ball, psychic waves, a psychic sphere, Petal Blizzard, Hyper Beam and Aeroblast have distinct effect forms. These are authored interpretations of genuine skeletal clips, not claims of official anime choreography. Species without a supplied attack retain their existing fallback.
- Current-card value is centered beneath the card, with its own reserved width. Buttons stay clear of the amount on mobile. Existing persistent lifetime winnings/accounting is retained.
- Centered Pokédex panel frames, consistent headers, aligned touch targets, compact landscape card rows, and a responsive side settings drawer replace the prior edge-to-edge desktop panels.
- The first special is prepared while the wrapper opens. The outgoing stack and incoming first card now share a position and scale; stage activation and speed lines run during travel.

## Validation

- 65 tests across 18 files pass; TypeScript and production build pass. Vite reports the existing large lazy-loaded renderer chunks.
- Added regression coverage for reduced-motion toggling before the suspense callback, quieter attack/cry gains, expanded move routing, panel boundaries and reward clearance.
- Independent review checked prepared-special ownership/cancellation and modal hit/focus coordinate translation. Its reduced-motion callback-order issue was fixed and reproduced in a real-GSAP regression test.
- Browser QA used 127.0.0.1 or in-memory fixtures, preserving user localhost and hosted saves. Checked desktop, 390px and 320px portrait layouts, and 568×320 landscape. Verified settings, collection, results and history spacing; hit regions remain inside the canvas.
- Full opening, special reveal, next-card transition and reveal-all/settlement exercised. Desktop preview held roughly 58–59 game FPS with no console errors in the checked flow. This is a local observation, not a mobile performance guarantee.
- Audited all 33 supplied model mappings and all 14 cue records for source clips, bones, timing and finite projected vectors. Visually inspected Charizard, Mewtwo, Lugia, Venusaur and Alakazam in the cinematic preview. See the expanded power audit for source and measurement details.
