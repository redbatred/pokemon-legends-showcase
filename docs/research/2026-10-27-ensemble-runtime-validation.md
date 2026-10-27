# Ensemble performance and holographic card validation

The roster now contains 50 textured skeletal models with idle, entrance and attack actions. Twenty-eight use source-native attacks; 22 use explicitly authored joint choreography (five previous display-only rigs and 17 previously absent models). Source animation preservation, skin transfers, CPU pose measurements, emitter calibration and hashes are documented in `pokemon-ensemble-animation-audit.md` and `remaining-species-assets.md`.

The runtime samples entrance and attack source poses from the same GSAP scene clock, including slow frames, then completes recovery before blending into idle. Fifty species have explicit recorded-move routing across 43 cues. Twenty-seven new MP3/OGG pairs retain quiet gain, measured attack offsets and owned pause/cancel/mute envelopes. The audio source, gain and waveform limits are in `ensemble-audio.md`; professional listening-room evaluation was not performed.

Holographic foil uses angle-dependent diffraction, specular streaks and fine glints with highp fragment precision. Horizontal and vertical tilt affect the main card, punctured special card and enlarged inspector. Print protection preserves lower text readability. The inspector only requests frames while its pointer animation settles; closing it removes its listeners/tween/filter. Low graphics omits main/special filters; reduced motion holds still.

Verification:

- Full roster browser pose audit: 50 species, zero load failures, zero clipped texture poses across idle, entrance, attack and recovery after Mewtwo's camera correction. Mewtwo uses dense fitting and a fixed idle-waist horizontal anchor; responsive actor fitting keeps its larger desktop silhouette within narrow viewports.
- Browser spot checks exercised Blastoise's cannons, Scizor's articulated pincer, Tyranitar's floor-origin Earthquake, Rayquaza's body/attack and Mewtwo's psychic action. The foil inspector visibly tilts and shifts its rainbow reflections while retaining readable card text.
- Regression coverage includes every artwork species' actual GLB skin/action/hash/cue, all 50 sound routes, Earthquake invariance under emitter movement, timeline sampling, audio seeking and mute/pause ownership.
- Independent runtime review found four issues (floor origin, entrance clock, mobile shader precision, low-mode filter), all corrected and re-reviewed. Browser testing also caught and corrected a shader uniform-precision link error before publication.
- Existing production build chunk-size advisory remains for the lazy-loaded canvas/3D engines. Models are loaded per reveal, not all 50 together; the roster-wide browser audit is a separate ignored development fixture.

User localhost and hosted saves were preserved. Development fixtures use an in-memory save and are excluded from production.
