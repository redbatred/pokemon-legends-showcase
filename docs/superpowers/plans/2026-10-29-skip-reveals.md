# Reveal skipping and canvas controls

User request: one card/Next click completes the current reveal, including a special Pokémon and the exact big-win amount; the next click advances. Remove gray/white floodlight backplates. Improve pack-label spacing and Turbo/Auto Spin layout.

Keep Pixi/Spine and existing assets, native model animation, browser-local demo state, automatic play and all ten visible packs.

- [x] Add a per-reveal completion owner that can finish both the flip and Pokémon timeline, suppress skipped audio/event callbacks, preserve the previous card's tray handoff, and handle clicks during asynchronous loading. First click finishes; subsequent Next advances. Keep Next enabled during revealing and make the stack/card tappable.
- [x] Give SpineReveal an explicit settled pose: punctured card, grounded/floating idle Pokémon, no ball/transient effects. Snap award count/banner to the exact value without depositing it until Next.
- [x] Trace the stadium boxes to their compositing source and fix the light tower silhouette/lens rendering without moving measured bulb positions.
- [x] Restyle the utilities as paired Pokédex-like controls: blue metal/cyan lens palette, Nunito labels, deliberate icon/label/status columns, 44px+ touch targets, desktop side placement and one aligned phone row. Reserve separate pack artwork/name/price bands, wrap names legibly and center amounts.
- [x] Tests for skip-before-ready, two-stage completion, no queued sounds, exact held reward, responsive control intersections; browser normal/special/phone checks using in-memory save. Fresh final review found no actionable important issues.

Release target: existing Sites production deployment and GitHub main; showcase wrapper stays unchanged.

Palette: deep blue #103F6B, blue #247BC1, cyan #9AEEFF, ice #F3FBFF, muted blue #A3C2D9. Preserve the existing anime scene; no extra text or panel backgrounds around packs.


Verification so far: 160 tests pass; TypeScript/Vite production build passes. In-memory browser fixture verifies a special skip leaves Charizard visible, ball hidden, exact 4500-cent award and zero total; card clicks advance and skip the next normal reveal with the previous 4500 cents transferred once. Desktop 1280×780, phone 390×780, small phone 320×568 and landscape 568×320 checked visually. All ten pack choices remain visible. The real browser save was not reset or used for purchases.

Ruling: preserve original lamp faces and measured bulb centers, replace only their pale side panels/supports with narrow shaded blue trusses in the existing layered compositor. This keeps lighting geometry and animated foliage aligned without regenerating the scene.
