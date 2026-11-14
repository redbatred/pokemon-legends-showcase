# Legendary Showdown implementation

User approved replacing the rejected Rift with a Legendary Showdown. Frontend mock outcomes only. The quality priority is readable, authored battle choreography with Spine effects that originate at the Pokémon and cause visible impacts/reward reveals.

## Design
Charizard, left, fights Mewtwo, right, in the existing stadium. Both use native skeletal character animations with opposing camera angles. Three successful strikes break three guard segments. A psychic counterattack between strikes supplies an actual exchange. Every reward appears at impact, holds for recognition, then transfers into the total. The final break compresses the legendary's glow into an authentic Mewtwo reward card, which flips and remains visible with the result. No capsule grid or portal.

Palette: stadium blues, warm fire (#ff743e / #fff0ae), psychic violet (#bca0ff), restrained gold rewards (#ffe1a0). Nunito matches the main game. Large readable character silhouettes; a quiet lower HUD with one primary action. Portrait uses diagonal depth staging, landscape uses a broad face-off. No looping decorative bursts.

Buy preview and mock third-manual-pack discovery remain, with renamed UI. All totals are fixture data. No backend, balance writes, new probabilities, or publishing. Default sequence lasts 29 seconds. Pause, skip, speed, sound, reduced motion, keyboard trapping, hidden-tab pause, and cleanup are required.

## Tasks
- [x] Pure battle timeline, impacts/awards, layout and projectile motion; tests first.
- [x] Opposing model cameras, original Spine mesh/slot effects, battle scene, final card reveal.
- [x] Replace Rift UI/integration, remove rejected feature source, document new preview.
- [x] Full tests/build, desktop/mobile browser QA, independent review and fixes.

## Review focus
Native animation clocks must advance; effects must reach their targets at impact; audio envelopes must be audible and stop on skip; late loads must dispose after close; resize must preserve time; both entry paths and return must remain functional.

## Rulings
The user's request authorizes this replacement and execution; no additional approval round. Existing branch retains prior edits until the replacement has been verified. Reuse authentic assets already in the repository; effect art is locally authored canvas/Spine geometry, not generated images.

## Theme and spatial revision
User rejected the first overlay's generic dark/gold styling and disconnected staging. Use the actual main-game CanvasScene (living stadium, crowd, LED boards, stage lights, existing battle-platform artwork). Match CanvasUI's Nunito, blue panels (#12344f/#226e9d), cyan outlines (#a8d5e9), white labels (#f3fbff), and chamfered primary controls. Fighter feet are platform coordinates; test both points against the top ellipse at desktop and mobile sizes. Keep preview controls in a compact disclosure.

Bookend activation and return with a sampled Poké Ball shutter. Capture the exact originating canvas before hiding it. Close the shutters, hold fully opaque while required assets load, then open onto a settling arena camera. On exit, close over the bonus, switch back to the saved original frame beneath the closed shutters, and uncover before restoring live game controls. Reduced motion uses a short crossfade. Closing during loading must remain cancellable; all RAF, captured-texture, and scene resources must be disposed.
