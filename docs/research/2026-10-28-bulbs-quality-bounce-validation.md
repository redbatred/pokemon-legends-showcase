# Bulb lighting, Pokémon surface detail, and ball contact

## Implementation

- Measured all 42 bulbs in the stadium artwork, then projected each emitter through the same background camera and floor warp. Each bulb owns a lens, halo, and feathered additive shaft. One shared atlas avoids per-bulb blur filters. Low graphics retains bulb alignment; reduced motion stops the sweep.
- Preserved existing normal maps and normal strength during toon-material conversion. Generated normals only for source geometry that lacked them (Lugia and Greninja). Expanded body outlines beyond the old `body` name heuristic while excluding known facial and emissive parts. Original geometry, UVs, texture filtering, skinning, and animation clips remain intact.
- Slightly increased hero framing within the existing presentation bounds, improved directional contrast, and lengthened the entrance recognition hold. Refined crystal facets, water-jet highlights, flame reach, electric pulse, energy orbs, and shuriken facets.
- Added two preloaded PCM ground-contact cues derived from the pinned Pokémon GO source documented in `ball-bounce-audio.md`. The physics landing plan now supplies the first bounce, second contact, latch, and opening times. Card puncture uses a separate impact. Pause and stop remain owned by the reveal sequence.

## Verification

- TypeScript build check and 91 tests across 26 files passed after the final source edits.
- Browser pose audit rendered idle, entrance, attack, and recovery for all 50 species: zero failures and zero clipped poses.
- Inspected Lugia surface lighting, Greninja low-graphics attack on a 390 × 780 game canvas, and paused resize back to desktop. No console warnings or errors in these checks.
- Inspected all measured emitters at desktop scale and reduced motion. Bulb centers stay on the artwork; beam edges soften and fade toward the stage.
- An isolated QA fixture observed actual Howler `play` events. First bounce floor gap: 1.31 local pixels; second contact: 0.32 local pixels. The latter is the intentional nominal-radius rounding. This is a visual synchronization check, not a measurement of device audio-output latency.
- Audio assets: each 160 ms PCM WAV, strong onset 1.604 ms, provenance hashes verified. No claim of human listening assessment.
- Independent read-only review found no actionable defects in projection, resource ownership, material conversion, animation compatibility, or contact scheduling.

QA fixtures and screenshots live in ignored `output/`. User saves were never altered. This improves rendering of the existing model assets; it does not claim higher-poly replacement models.
