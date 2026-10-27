# Anime release, power performance and audio

Implement the user's requested improvement to the existing reveal; preserve canvas UI, local demo accounting, guaranteed first special and the local picture puncture.

- Flight retains distance/depth, then opens in midair with a hinge snap instead of several toy-like bounces. Light bursts from the ball; a luminous silhouette resolves into the actual animated character, lands, gathers power and attacks once before settling.
- Add a deliberate Spine charge/attack/recovery animation, with species-specific elemental effects anchored to head/hands/body. Use bounded cel effects and distinguish fire, water, lightning, leaves, ice, psychic/fairy, dark, metal, ground and wind/dragon.
- Replace the six old procedural sounds. Preload proper cues and all supported Pokémon cries; record real sources. Game cries remain explicitly identified as game recordings, never as anime dialogue. A community ball-opening clip must retain its uncertain provenance.
- Cue throw, impact, opening, materialization, cry, charge, attack, landing, UI and payout at animation events. Bound voice overlap, normalize levels, and respect mute, hidden pages, menu pause, reduced motion and cleanup.
- Verify data coverage, audio lifecycle, Spine animation evaluation, builds and actual rendered sequence phases. Publish through Sites to the same private audience.

Ruling: use the classic red-white ball and white-blue release as the visual direction because no specific episode/shot was supplied. This is a newly authored homage in the game renderer, not a claim of pixel-exact studio animation.


Implementation notes: completed the 4-second depth/hinge/materialization/charge/attack/recovery sequence; Charizard uses a separate jaw and mouth-interior attachment, and Pikachu has individual ear/hand/tail joints. Effects have bounded geometry and anatomical origins; audio uses local MP3/OGG samples with documented provenance. Game cries are not anime voice performances. Other Pokémon retain restrained single-view anatomy profiles, not full studio turnaround rigs.

Validation: source build; audio mute/pause/skip/overlap/load regression checks; all 50 rig/profile evaluations; rendered release/silhouette/attack/recovery; full game next-card transition; scoped independent code review. Corrected both review findings (muted audio wait and reduced-motion stale cry). Browser playback loaded all 11 required Charizard samples and observed peak 5 simultaneous voices. No console errors in the inspected sequences. Mobile framing is checked at 390×780, a browser viewport check rather than a physical-device benchmark.
