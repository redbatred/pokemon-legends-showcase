# Arena interaction polish implementation plan

> Implement inline with superpowers:executing-plans. One fresh whole-change review before publication.

**Goal:** Clear, close stage actions; a physical Spine cutting cue; continuous ball-to-Pokémon emergence; timely rewards; a curved stadium information display.
**Architecture:** Existing Pixi canvas, native Spine 4.2 animation, skeletal Pokémon models, GSAP timing, and in-memory/browser saves remain. Shared pure geometry owns responsive bounds and choreography. Stadium panels use the existing background projection, including floor warp and travel zoom.
**Spec:** Latest user request and attached stadium-strip screenshot in this chat. Earlier left-side Next request is superseded: Next belongs on the right, beside the platform, without a circular backing.

## Decisions and constraints
- Use the established navy/cyan/yellow Pokémon palette and Nunito. Icons get independent local paths, no overlapping command geometry. Align icon and label within measured padded button content.
- Desktop Next is a large luminous right chevron beside the platform, Open All opposite; phone Next is on the lower right, All lower left. Total follows Next on desktop, remains centered on phone.
- Animated scissors use separate front/back blades around the pack's actual projected top seal. Deep navy plus yellow cutting marks stay legible on light/dark foil; the cue fades on leave and disappears when tearing begins.
- Pokémon formation follows the ball aperture, travels forward while expanding, and changes from a luminous silhouette to the actual model. A foreground lower shell occludes the initial emergence, then clears once the body leaves the aperture. Spine arcs, ribbons and rays follow the forming body rather than a static burst. Skip lands on the exact finished pose and amount, without residual effects.
- Normal awards start at face reveal; special awards start as the Pokémon takes form, not after its full attack. Existing count speed, transfer-on-Next and ledger semantics stay intact.
- Two curved screen surfaces precisely fill the blue wall bays on each side of the central entrance, behind cards, crowd and platform. Short phase-specific messages crossfade; idle screens show a Pokémon League motif. No outcome information before it is revealed.
- No production save resets, backend, odds changes, dependencies or generated raster replacements. Existing publishing authorization and public audience persist. This is a continuation in the existing Sites checkout; source helper owns final commit/push.

## Tasks
- [x] Responsive controls: update rendering/utility/modal geometry, redraw icons and button internals; tests for right-side Next, gaps, hit bounds and mobile layout; browser checks.
- [x] Pack scissors: native Spine blade/handle rig and projection helper; animate hover/drag and split blades around wrapper; test physical seam containment and finite native rig animation.
- [x] Emergence: pure pose/timing helper, shell occlusion and Spine release rig; test continuity, cue ordering and cleanup; browser freeze checkpoints and skip.
- [x] Stadium displays: normalized wall geometry, curved meshes, timed content and seamless transitions; test boundaries, projection and no premature reward messages; verify screenshot alignment across sizes.
- [x] Full tests/build, fresh review, desktop/mobile browser QA. Publication follows through the existing Sites source helper, then GitHub synchronization and deployed asset verification.

## Review focus
- Resize while an effect/award is active; reward geometry must stay clear of new controls.
- Rapid hover/leave and tear; no scissors survive into the card scene.
- Skip mid-emergence; shell, rig and white silhouette must clear immediately.
- Hidden/blocked/reduced modes; no continuing effect or leaking message animation.
- Screen projection must share background travel zoom and floor warp exactly.

## Follow-up steering incorporated
- Next now tracks card center vertically; matching downward chevrons replace Open All's circular backing. Both pulse in their direction of travel. Narrow/tall and compact layouts have explicit clearance checks.
- Pack rack disappearance, center-out question-mark tray arrival, and reveal controls share the physical opening clock.
- Pokémon scale uses visible idle body height and bounds the complete attack envelope.
- The stadium uses separately traced edge geometry with subpixel bleed; UV-space emissive rails and holographic scans bend with the wall, rather than a rectangular post-process.
- Scissors are smaller, muted blue, use opposed cutting edges and separate mirrored handles, and pivot around the same seam between front/back pack layers.
- Pack results use a smaller, raised translucent frame. The existing tray locations and total position are captured before settlement redraw. Eleven cards and the unchanged total fly into their result slots together, then a timed collection cue completes the animation. Auto play keeps its fast loop.

## Review findings addressed
- Board updates now include selected pack identity.
- Next shrinks only at widths below 360 px to clear the card on narrow tall screens.
- Compact toolbar moved into the top row to clear Open All.
- Short-phone result plaque and total now have separate, readable bands.

## Final validation
- 186 tests passed across 51 files; TypeScript and production Vite build succeeded.
- Browser QA in an isolated in-memory fixture: scissors, shared pack journey at 2.1 seconds, right-side centered reveal controls, special formation and skip-to-exact-value, desktop/phone/small-phone/compact layouts, Open All, collection-flight midpoint, settled results, card inspection and return.
- Review fixes: short results grids adapt column count; padded landscape frames use the compact layout; completion audio is deduplicated and also resolved after an interrupted resize.
- Production browser save was not opened or reset.
- Proof: output/arena-controls-polish-final.png and output/collection-arrival-final.png.
