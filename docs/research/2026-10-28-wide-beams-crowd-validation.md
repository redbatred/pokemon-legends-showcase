# Broad floodlight cones and ongoing crowd celebration

## Lighting direction

The previous per-bulb sprites used widths tied to a small fraction of stage width. Their axes met at essentially one point above the stage, so the visible bank read as a narrowing strip.

The new geometry uses a fixed 34–38 degree field angle: width = 2 × throw length × tan(angle / 2). Each source stays on its measured bulb. The cones expand linearly, overlap across separate left/right target areas, and fade beyond the receiver instead of ending in a pinched point. Target height now follows the stage surface. Source halos stay separate from the broad additive volumes. A final visual pass strengthened near-source scattering while keeping the wide receiver overlap soft.

Primary technical references consulted:

- [ETC: cone geometry and oblique target surfaces](https://support.etcconnect.com/ETC/Consoles/Augment3d/Why_Do_Beams_Still_Sometimes_Pass_Through_Objects_in_Approximated_Lighting)
- [ERCO: spot, flood, and wide-flood distributions](https://www.erco.com/en/knowledge/shop/precisely-illuminating-products/)

This is an art-directed 2.5D approximation, not a photometric simulation.

## Crowd and sound

Two new matching imagegen plates add bent-arm clapping and diagonal waving to the existing raised-arm cheer. Eight seating sections use staggered held-cel rhythms and brief blends. The three celebration poses keep cycling until the card is dismissed. Reduced motion holds one cheering frame. Runtime textures contain only the seating strip; architecture and stair aisles remain on the original fixed artwork. Only two meshes per section render, regardless of cel count.

Real sports-crowd recordings provide a brief quieter response on normal reveals and a larger swell plus a six-second continuing cheer on rare reveals. The continuing voice is owned by the displayed card; it pauses with the scene and stops on next card, collect, reset, mute, or destruction. Repeated special-attack impacts do not stack loops. Crowd ambience does not hold the music in its cinematic ducked state. See `crowd-reaction-audio.md` for CC0 source, encoding, and mix details.

## Verification

- TypeScript check and 94 tests across 26 files passed.
- Browser observed crowd motion and looping audio still active at 15.44 seconds and after a complete special reveal at 25.16 seconds.
- Pausing froze the same cel indices and audio playhead. Resuming continued playback; a following normal card returned all sections to seated pose and stopped the previous loop.
- Inspected the special reveal at 390 × 780 and desktop sizes, including a paused resize. No browser console warnings/errors in these flows.
- Independent review found no actionable defects in loop ownership, pause/mute lifecycle, texture-region UVs, fixed architecture, or warp retention.

Fixtures use in-memory saves only. No user collection or balance was modified. The generated clap plate is one pixel narrower than the other source plates; all are rendered into the same registered seating bounds. Tiny generative spectator-detail differences remain. No human audio audition is claimed.
