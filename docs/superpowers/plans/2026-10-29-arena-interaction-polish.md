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
- 191 tests passed across 52 files; TypeScript and production Vite build succeeded.
- Browser QA in an isolated in-memory fixture: scissors, shared pack journey at 2.1 seconds, right-side centered reveal controls, special formation and skip-to-exact-value, desktop/phone/small-phone/compact layouts, Open All, collection-flight midpoint, settled results, card inspection and return.
- Review fixes: short results grids adapt column count; padded landscape frames use the compact layout; completion audio is deduplicated and also resolved after an interrupted resize.
- Production browser save was not opened or reset.
- Proof: output/arena-controls-polish-final.png and output/collection-arrival-final.png; precision follow-up output/arena-precision-final.png and output/results-precision-final.png.

## Precision and clarity follow-up
- Generalized the projected body anchor beyond Mewtwo. CPU-skinned checks for Charizard, Lugia and Blastoise place the chosen body anchor at x=0 and the lowest idle geometry at y=154. The asymmetric attack bounds remain separate from those presentation anchors.
- One transformed Poké Ball aperture now drives the release, conduit and formation source. Foreground shell pose follows the same clock; the conduit ends before the ball rolls clear. The body follows a direct centered path with species-colored native Spine crescents in front and behind it.
- Increased bounded canvas density, with a larger budget for paused detail panels; 1024 px Pokémon renders; higher-resolution text/money atlases and mipmapped full card textures.
- Total Win uses larger warm-white digits, a separate caption and restrained cyan brackets. Lifetime winnings remain visible in the result summary.
- Added curved, blurred emissive spill and a spectral sweep around the holographic wall without distorting its text.

## Final celebration steering
- Keep the celebration shade behind the world, preserving Pokémon brightness. Native Spine energy coronas surround the body, build with the entrance and pulse once as the count finishes, then settle into quiet glints. Reference: https://artforgame.artstation.com/projects/GawnQa and PearFiction Squealin' Riches win-tier presentation.
- Move Total Win into the header, with dedicated compact and short-phone placement. Hide the duplicate pack title during reveals; the arena display retains that information. Label Collection and History.
- Blend the entire results frame directly into browse underneath. Avoid clearing the WebGL backing store for layout-only changes. Verify midpoint and completion in the in-memory browser fixture.

- Review follow-up: block repeated keyboard activation during crossfade; reserve clearance between utility captions, branding and Total Win. The special-win backdrop holds half-strength cinematic focus until advance.


## Manual foil, library, and elemental follow-up

Latest user steering supersedes the former blue corona and sprite-plume direction.

- [x] Fill the left stadium-display corner; remove the two travelling horizontal blue light bands. Keep the curved wall geometry and fine phosphor texture.
- [x] Make the scissors clickable and drag the actual foil mesh. Preserve current perspective on gesture start and continue the same pose on release. Enforce one captured pointer and cancellation ownership.
- [x] Idle float for the waiting deck and revealed cards, with pointer-driven foil shine.
- [x] Redesign Collection as a high-resolution binder and History as sized records. History opens the complete pack as an arched hand; hover raises its draw order, touch selects before inspection, and amount fitting stays inside its reserved column.
- [x] Redesign Settings as a Pokégear drawer; align Auto Spin, Trainer Guide, and Card Details with the same hardware frame and faceted controls. Check 320×480 and 720×320 as well as normal phone/desktop.
- [x] Add distant, bounded bird flocks with independent held wing poses, glides, random intervals/directions, terrain occlusion, and reduced-motion handling.
- [x] Replace the rejected image-like elemental plumes with continuous stage-anchored Spine mesh flows. Rear flow belongs behind card/Pokémon; low front spill belongs in front. Keep the elemental scene alive until Next, including after skip-to-result.
- [x] Final integrated browser review, full tests and production build. Production save and audience preserved.
- Publication follows source preparation through the Sites workflow, then GitHub synchronization. Report hosting status from the native tool result.

Validation so far: actual mouse scissors click and partial drag both reach the waiting deck; native Spine parsing, pointer pose continuity, binder/history geometry, settings boundaries, bird lifecycle, and history fan checks pass. Browser checks cover binder filtering/paging, desktop and phone history hands, card inspection/back navigation, and desktop/small-phone/landscape Settings. New effects require a fresh visual check after the final stage-flow redesign.


## Final elemental and showcase validation

- Elemental bodies are neutral-material native Spine deform meshes. Fire uses short buoyant tongues, waist pinches and hot pockets; water uses translucent ballistic crests and droplets; electricity uses staggered forked strikes. Other types have material-specific fragments. The back layer is behind the card and actor; shallow front spill wraps the stage rim. Rise is capped away from the HUD, and the scene persists until Next, including after skip.
- Removed travelling blue bands from the curved stadium displays. Retained the fine phosphor texture and fitted wall geometry.
- Nested History/Card Details now have an explicit labelled Back control. Card Details returns to the same hand, then the hand returns to History. Reduced-motion hands no longer schedule continuous renders.
- Rotom's native reverse-wound cyan body halo was receiving an extra BackSide ink shell, covering the orange body and face. Excluded that existing hull from extra ink; arms/tail and other species retain outlines. Browser A/B verified the cause and corrected output. Audit covered 50 model files, 266 primitives, 170 materials and 245 embedded images, with no missing image references.
- The existing temporary first-card showcase override rotates a set-specific cast, prioritizing complete skeletal performances and keeping each card within its actual set. Rotation follows the previous showcased species so the 30-record history cap cannot stall it. Equal-value cards prefer the full-art or special edition, such as Mewtwo VSTAR over its ordinary holo. Normal draw logic, charges, card values, and prior saved results stay intact.
- Final verification: 241 tests in 60 files passed, production build succeeded, and git diff --check passed. Browser QA covered phone history inspection/back, corrected Rotom, Rayquaza/Giratina/Lugia model rendering, phone special reveal skip to the exact $45 amount, resize during held effects, and Next cleanup/transfer to Total Win. No new browser errors during this final pass.
- Current proofs: output/elemental-fire-win-final.png, output/elemental-stage-phone-final.png, output/history-back-phone-final.png, output/rotom-material-fixed.png, output/pokegear-settings-final.png.
