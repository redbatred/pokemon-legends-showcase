# Pack opening, controls and crowd validation

Implemented 2026-10-28. The tear uses localized tension, a travelling fracture, a curled reverse face and an occluding front lip. The card stack stays rigid and constant-sized until it clears the wrapper; the same stack then travels through the stadium camera transition. Research sources and their limits are recorded in `foil-tear-direction.md`. This is an art-directed approximation, not a material simulation or footage-matched Pokémon opening.

## Verification

- TypeScript compilation and all 101 tests across 29 files passed.
- Regression coverage includes unreleased seam continuity, rigid lower-wrapper geometry, crowd thresholds/gains, mute and loop ownership, reveal control bounds, and preserving the travelling layout through HUD/settings updates.
- Browser preview used an isolated in-memory fixture. User balances, collections and saved packs were not modified.
- Inspected partial rip, curled seam, extraction and clearance frames. Fixed the prematurely shrinking pack and detached foil sweeping across the header during this pass.
- Full pack-to-stadium travel completed at 390×780; reduced-motion travel also completed. No browser errors or warnings were recorded in the final preview check.
- Inspected control placement at 390×780, 360×540, 568×320 and 1280×720. Short landscape uses a horizontal pair above the tray. Very short portrait screens retain a smaller central card to reserve room for the large controls and card tray.
- A fresh code review found three layout/transition issues; all were corrected and the targeted follow-up review found no remaining substantive defects.

## Crowd behavior

Ordinary cards have no crowd sample. Small rare pulls receive a brief quiet response. Three progressively stronger levels use the sustained cheering loop, with tier selection based on rarity, card value and pack price. Top-tier reaction gain is lower than the previous uniform reaction. The next card stops the previous reaction; normal cards do not inherit the celebration loop.

## Audio and proof

The new tear and rustle are edited real CC0 wrapper Foley; see `foil-tear-audio.md` and `public/assets/audio-v9/provenance.json`. Decode, duration and scheduling were verified. No subjective listening assessment is claimed.

Local browser proof: `output/pack-extraction-final.png` and `output/reveal-controls-final.png` (ignored artifacts, not deployed).
