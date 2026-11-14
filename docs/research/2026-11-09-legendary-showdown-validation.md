# Legendary Showdown validation

Replaces the rejected Rift implementation. Existing branch: `codex/legendary-rift` (branch name retained; Rift source removed).

## Implementation
- Native animated Charizard and Mewtwo models, framed from opposing camera angles.
- Authored Spine 4.2 flame meshes with deformation tracks, finite psychic orbit/projectile tracks, impact burst/shard/smoke tracks, existing Spine summon and card material frame.
- One 29-second presentation clock. Three guard breaks reveal awards; banking follows the readable reveal hold. Counterattack travels from Mewtwo to Charizard. Final Mewtwo VSTAR card flips into view.
- Classic fixture 50×; Legendary fixture 180×. Entry price is illustrative. No bonus wallet mutations or backend calls.
- Manual third-pack discovery and an explicit next-pack demonstration. Discovery waits behind panels instead of being consumed prematurely.
- Pause/resume, 2× speed, skip, replay, sound, reduced motion, keyboard focus containment, hidden-document pause, destruction and late-load cleanup.
- Required final card artwork gates entry. Optional model failures use existing original artwork. Enabling sound after a muted load preloads both Pokémon cues.

## Automated checks
- `npm test`: 81 files, 528 tests pass.
- `npm run build`: passes. Existing large chunk warnings remain (Pixi/model bundles).
- `git diff --check`: passes.
- Independent source review found three defects (sound preload, required reward asset failure, deferred discovery); all addressed. The discovery race has a regression test.

## Browser inspection
- Desktop 1440×900; portrait 390×844; compact 320×568.
- Isolated bonus entry, guard/reward progression, pause, skip, classic 50× and legendary 180× finals, replay, reduced motion and responsive card presentation.
- Frame inspection of authored Spine flame impact and psychic projectile through `tests/browser/showdown-effects.html`.
- Integrated main-game bonus entry and next-pack discovery path.
- Screenshots retained under ignored `output/legendary-showdown/`.

The preview is for presentation review. Production math and purchase rules remain outside this frontend prototype.

## Theme / arena revision
The first visual treatment was rejected by the user. The revised feature reuses CanvasScene directly: animated crowd, wall ribbons, lighting, original blue battle platform and background. UI colors, Nunito lettering, outlined panels, Pokémon logo and chamfered controls follow CanvasUI. Fighter coordinates are checked inside the platform surface ellipse at all four tested viewports.

A frozen origin texture now links both ends of the feature to the actual game frame. Poké Ball shutters close before asset loading starts, remain opaque while required assets load, and open with a small arena camera settle. Returning reverses the shutter and restores the origin screen before enabling its controls. Reduced motion uses a short opacity transition. Dedicated tests cover asset gating and switching only while fully covered.

Final revision checks: 528 tests and production build pass. Independent review fixes include locking the active fixture, retaining touch cancellation during load, and preserving shutter coverage when entry is reversed. Browser-verified main-game entry/return and cancellation before loading; desktop and portrait platform contact inspected.

## Three-symbol revision
- Replaced session pack-count trigger with three distinct stored symbol positions in one pack. Armed demo outcomes are assigned before reveal.
- Single/group card badges and per-pack meter; third-symbol qualification confirms before arena travel.
- Battle shortened to 13 seconds; impacts 3.0 / 5.8 / 8.6, card reveal 10.1. Counterattack removed.
- Battle performers use actual charge duration and distinct attack identity. Native actors use consistent battle rendering rather than switching 24/30/60 fps.
- Revised build: 83 files / 539 tests passing; production build and diff check pass. Reset/pending bonus and close-during-load audio regressions covered.
- Desktop1280x720 and portrait390x844 visually checked; meter moved to the right sky area on desktop and above the card tray on phones.
- Native canvas capture replaces the former screenshot-loop capture. Output targets60fps; battle and transitions retain normal timing, with only idle pauses between clicks trimmed.

## Impact and win presentation revision
- Additive Mewtwo joint recoil (spine, neck, arms, tail) with exact quaternion restoration after every render; stronger final hit and controlled recovery.
- New authored Spine guard-break plates, chips, sparks and segmented shock rings. Guard cracks, floor shockwaves and final windup camera push share the battle clock.
- Fragments converge on the reward card, followed by a finite reveal burst and exact payout count-up. Legendary fixture remains 180×; classic remains 50×.
- Arrival/return shutters use faceted blue plates and cyan seams, respecting existing coverage/load gates.
- 85 files / 546 tests pass; production build and diff check pass. Independent integration review found no important new issue.
- Desktop native 60 fps recording verified through completed return; portrait 390×844 reward and skip verified visually. Final 19.45-second H.264 clip retained under output/legendary-showdown/legendary-showdown-v3.mp4.

## Transition, interface and stray-light correction
- Reproduced diagonal guard rays caused by implicit Graphics arc connections to the world origin. Real Graphics bounds regression failed before explicit moveTo and passes after.
- Native flame tongue bounds stay inside the collision plane. Beam stops at the stationary shield, travels on one axis and collapses from mouth to guard instead of following recoil.
- Authored Spine mechanical seal, plates, orbit ribbons, intake/release trails and latch sparks. Ambient motion continues during loading. Annular blades avoid the observed partial-cutout flash. Existing load/cancel gates retained.
- Revised HUD, phone hierarchy, coordinated UI entrances, reduced motion and focus. Short-landscape two-column footer keeps the platform visible. Paused skip resumes the stadium.
- 87 files / 553 tests pass; TypeScript, production build and diff check pass. Browser verified 390×844,320×568,844×390 and1280×720; classic50× reduced-motion skip and legendary180× full sequence.
- Native22-second H.264 includes incoming/outgoing transitions. Silent canvas capture excludes DOM controls; separate UI screenshots supplied on playback page.

## Game presentation and native Spine ceremony revision
- New notched Bonus Buy ticket and entry CTA show 100× selected pack price (default $1,000), clearly marked demo. No wallet mutation.
- Compact Pokémon dialogue and 2×2 presentation command pad replace the full blue footer. Speed, pause, skip and options remain honest presentation controls.
- Portrait fighters share platform depth and opposite positions; complete foot/contact areas stay within the platform ellipse. Regression tested at 320×568,390×844,430×932.
- Native Spine 4.2 split-shell Poké Ball entrances, three faceted psychic guard segments, and finite gold reward coronation (frame rails, corners, laurel and crest). Collision plane tested against beam endpoint; summon starts continuously from the preview pose.
- Win title clears the crest; fighter status cards hide during reward reveal. Existing card-rim shimmer remains an ambient loop after the finite coronation clears.
- Review caught replay crowd/light state leakage; resetPresentation now clears effects while preserving loaded arena/active state, with a failing-before/passing-after regression.
- Browser inspected 320×568,390×844,844×390 and1280×720. Completed a recorded full arrival, battle, reward and outgoing transition with no browser errors.
- 563 tests pass; TypeScript, production build and diff check pass (existing bundle-size warning). Native silent H.264 capture and clean UI screenshots in output/legendary-showdown/v5.

## Depth, psychic membrane and card-fitting correction
- Reproduced desktop depth discrepancy: player y455, boss y407; previous regression only enforced portrait proximity. Both now share y442 and mirrored x positions on every breakpoint. Five new tests failed before fix and pass after.
- Bonus Buy emblem now has an isolated Graphics path with explicit semicircle start, red/white enamel and a blue-violet ticket. Prevents the shared-path stray-fill artifact.
- Native Spine psychic membrane replaces all guard slabs. Three curved charge arcs and light nodes disappear on hits; the final break releases curved energy. Beam collision remains fixed to membrane's leading edge.
- Reward effects are now children of prizeRoot, inherit card zoom/position, and wait until its flip completes. Actual 312×435 print dimensions determine the silver-violet rim and edge-following glints. Removed oversized crown, laurels, separate gold frame and radial backdrop spokes.
- Visual QA:1280×720,390×844 and320×568; checked feet/shadows, membrane visibility, new icon, and card-edge fit. Full walkthrough includes both transitions and mock180× result.
- 568 tests pass, production build passes (existing chunk-size warning), diff check passes. Native recording and UI proof retained in output/legendary-showdown/v6.

## Psychic energy and impact revision
- Native Spine surface currents and orbiting particles give the membrane continuous energy flow. Hits compress a shared membrane bone; its leading edge remains fixed at x=-100, regression tested at full and reduced motion.
- New finite Spine contact ripples travel away from the hit across the membrane, with a brief violet core flash. Seek/reset and endpoint cleanup covered.
- Final breakup contracts the field into a concentrated core before an expanding double shock ring, curved energy ribbons and motes. Collapse-before-release regression failed before implementation and passes after.
- Card entrance delayed within the existing13-second timeline, leaving a short settling beat between burst and reveal. Existing card-local foil effects retained.
- 571 tests pass; production build and diff check pass. Phone390×844 and desktop1280×720 inspected, with new native video in output/legendary-showdown/v7.


## V8 — Psychic Vault narrative and sound

- Replaced the stadium bonus backdrop with a responsive recessed vault chamber, crystal pylons and a shared combat deck. Existing Spine actors and barrier deformation remain in use.
- Added a visible sealed card from entry. Three hits break seals and award no intermediate money; only the revealed card exposes the round’s one mock multiplier (50×/180×). Mewtwo animates psychic defense and channels toward the sealed card.
- Entry states the objective, three-symbol route, optional 100× base-bet buy, and demo-only price. Result states multiplier × base bet = payout; the card is the same reward, not an extra collectible payout.
- Six deterministic authored stereo sound cues cover chamber entry, buildup, light/heavy hits, final inward pull/rupture and reward. Existing Howler mute/pause/visibility/voice cleanup applies. Lobby music is suppressed inside the vault.
- Full verification: 90 test files, 584 tests passed; production build passed (existing large-chunk advisory remains). Six viewport geometry tests include 320×568 and 390×844. Browser checked entry, native defense, phone result, pause, skip and return; no console errors observed.
- Recorded the actual canvas plus Howler master bus without microphone access. V8 export: 1280×796 H.264/60 fps with stereo AAC, 22.015 s, 5.7 MB. Audio measured mean −27.4 dBFS and peak −6.5 dBFS; no clipping. Captions explain the demo because the canvas capture does not include DOM controls; full-interface screenshots accompany the video.
- Native capture, timeline, encoded MP4 and screenshots are in output/legendary-showdown/v8/. Mock outcomes and balances remain frontend-only.


## V9 — Animated containment chamber, distinct attacks and full trigger video

- Added native Spine chamber machinery (segmented rotating hatch rings, independent crystal fragments and light shafts), native card containment rails, and three individually consumed Poké Ball-style seal emblems.
- Moved the held card behind Mewtwo inside one shared ward. Persistent psychic links attach to remaining seals; guardian attack/defense motion and the stationary collision edge share the sampled encounter clock. Card geometry is covered at 320×568, 390×844, compact landscape and desktop.
- Replaced the repeated fire effect with distinct native Spine Flamethrower, five-pronged Fire Blast and Blast Burn clips. Fire meshes, lobes and embers seek deterministically and end after .76 s; release-to-impact remains .42 s.
- The actual held card travels out of the opened enclosure to the reward position, grows and flips. Enlarged final card and warm foil edge treatment; explicit arithmetic now reads 180 × $10 = $1,800.
- Fixed silent reward seeking triggering audio and stale foil uniforms on replay/reduced motion. Added regression coverage.
- Validation: 94 test files / 607 tests passed; production build passed with existing large-chunk advisory. Browser inspected desktop effects, 390×844 and 320×568 gameplay/controls, pause/resume, final reward and return. No console errors in the checked app session.
- Full video uses an armed mock pack through the normal UI: individually revealed badges at cards 2, 5 and 8, remaining cards, symbol assembly, entry transition, 13-second vault sequence and return to pack results. It preserves all gameplay timing; two idle gaps between tool clicks were removed.
- Export: output/legendary-showdown/v9/legendary-vault-v9.mp4, 47.524 s, H.264 1280×796 60fps, stereo AAC. Actual Howler master bus captured without microphone; +4 dB phone playback gain, measured final mean −26.5 dBFS, peak −2.3 dBFS, no clipping. Captions explain the canvas recording; full clean phone UI screenshots are provided separately.


## V10 — External artwork, Spine meshes and coherent chamber depth

- Replaced active bonus code-painted effect textures and Graphics art with generated PNG artwork, a multi-page external atlas, and external Spine4.2 skeleton/meshes. The chamber uses separate landscape/portrait paintings. Plain solid Sprite fades and native Text remain UI/compositing. Existing Pokémon retain their native skeletal3D animation.
- Added moving fire texture meshes with a continuous hot core, a shorter psychic ward aligned to the character lane, native impact deformation, an inward collapse/outward break, and a rigid card-sized opening in the reveal aura. Outer reveal wisps animate independently, preserving the rectangular card edge.
- Charizard arrives through a physical Poké Ball and materialization plume; Mewtwo materializes beside the card. The centered entry card moves continuously into its guarded position. Three authored psychic links connect native hand coordinates to the exact remaining seal locations.
- Contact shadows use external raster artwork; both Pokémon stay on one floor lane. Scene placement aligns the same authored image floor coordinate to their feet, including portrait layouts. Increased phone actor scale conservatively to keep wings/tails visible.
- Replaced the outgoing/incoming code-drawn iris with chamber artwork shutters and Spine vapor. Reduced motion uses stationary shutters with opacity fades. Failed transition-art loading retains the matte fallback; pending effect loading is cancelled safely on disposal.
- Validation:96 test files/631 tests passed. Production build passed with the existing chunk-size advisory. Final transition fixes separately passed TypeScript and focused transition/cancellation tests. Desktop1280×720 and phone390×844 inspected; native capture reported no console errors. Additional geometry checks cover320×568 and compact landscape.
- Actual UI recording includes one armed pack, all three symbol reveals, pack completion/assembly, entry transition,13-second battle, reward and return transition. Removed three idle intervals between automation actions; retained all animations at normal speed. The canvas recording omits DOM controls, so clean phone UI screenshots accompany it.
- Export:`output/legendary-showdown/v10/legendary-vault-v10.mp4`,45.107seconds,1280×796,H.26460fps,stereoAAC48kHz,18,025,089bytes. Actual Howler audio bus capture; no microphone. Final audio mean−26.3dBFS,peak−2.8dBFS, no clipping. Payout/trigger fixtures remain frontend-only.

## V11 — Closer anime battle, animated cave and Poké Ball wipe

- Replaced glossy palace/chamber textures with separate matte cel-style cave compositions. Active background water strips and five independent floating rock meshes use external Spine clips; rock phase stays continuous when seals change and freezes during pause.
- Combat fighters render approximately50% larger than V10 through larger native actor scale, a shorter world frame and a close camera. Phone positions widen to maintain a visible mouth-to-ward firing gap; close framing can crop outer wing/tail tips. Both feet/shadows still share one depth lane. Reward camera restores full-card framing; reduced-motion camera remains static.
- Replaced chamber shutters with red-and-white Poké Ball panels, a cel Poké Ball sprite and native Spine speed lines. Original game/bonus handoff still occurs behind the fully covered midpoint. No new procedural raster art or Pixi Graphics artwork was introduced.
- Continuous cel flame jets replace photographic fire and disconnected curls. Jet thickness is constrained by travel distance, fixing the early vertical-sheet appearance. Contact holds affect only visual/native pose sampling; outcome, cue and interaction clocks continue. Stronger articulated recoil, a brief white/violet impact, contracting ward and outward psychic ribbons finish the last seal.
- Removed excessive reward curls and guard wisps. Three small round Poké Ball seals identify the protected card, and the reveal uses restrained straight rays around its exact rectangle. Existing Pokémon remain native skeletal3D models; effects and animated background layers use Spine4.2.
- Required artwork now includes both fighter portraits, preventing invisible-actor starts on failed loading. Existing portrait fallbacks cover unavailable3D models. Review fixes and regression tests cover reduced motion, rock-clock continuity and pause.
- Validation:97 test files/642 tests passed. Final production build passed (existing large-chunk advisory). Desktop1280×720 and phone390×844 inspected, including actual phone UI, pause/resume, firing gap, result and return. No browser console errors during the final native capture. Geometry tests also cover smaller phones and compact landscape.
- Final video:`output/legendary-showdown/v11/legendary-vault-v11.mp4`,45.162seconds,1280×796,H.26460fps,stereoAAC48kHz,19,279,507bytes. Full normal pack/three symbols/transition/13-second encounter/result/return recorded through the UI. One idle gap removed; native gameplay/animations retained at actual speed. Captions for the break and payout follow observed UI events. Canvas recording omits DOM controls; phone screenshots accompany it.
- Sound is the real Howler master bus, with4dB export gain; final mean−26.3dBFS,peak−3.0dBFS,no clipping. No microphone. Mock bonus outcomes and backend scope remain unchanged.
- Raster originals and exact built-in image_gen prompts are retained in `public/assets/showdown-v11/` and `prompts.json`. Atlas metadata selects/alpha-trims original pixels without painting new assets in code.
