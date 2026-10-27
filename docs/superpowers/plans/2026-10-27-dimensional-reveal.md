# Dimensional reveal implementation plan

> **For agentic workers:** Execute the already requested changes in place, retaining the existing Pixi game and Sites checkout.

**Goal:** A distant, spherical Poké Ball passes through a small opening in the card artwork and releases an articulated Pokémon; visible colored stage light, grounded perspective, stronger normal reveals, and pack-to-pack arrow navigation.

**Architecture:** Keep Pixi/Spine 4.2. Project a shaded ball along a depth curve, with card occlusion before the local impact. Retain the complete card perimeter and typography. Rig Pokémon anatomy with weighted skeletal meshes. Separate horizontal stage emission from upright beams so perspective correction does not flatten light.

**Spec:** User request in this chat, 2026-10-27.

## Constraints and review focus
- No React/backend, no balance or odds changes. Keep temporary guaranteed first special.
- Honor reduced motion; pause behind menus and when hidden; release generated resources.
- Impact stays within artwork, including after resize. Card collected to tray has an intact perimeter.
- Lighting changes must be visible in actual rendered frames, not only numeric color state; chassis/white paint remain neutral.
- Floor and light source share one projection. Normal reveals hand off to the exact tray position without flashes.
- Drag/swipe/keyboard pack navigation remains available without a scrollbar.

## Tasks
- [x] Replace SpineReveal vertical split with artwork puncture, depth flight, occlusion, rebound and articulated Pokémon release; validate screenshots through animation phases.
- [x] Build weighted anatomical Spine meshes and entrance/idle animation; validate weights and distinct joint movement.
- [x] Fix light update order/color saturation, add visible rim and upward colored glow; flatten stage into floor perspective and test two contrasting hues.
- [x] Improve normal reveal timing and depth; replace rail belt/scrollbar with animated small chevrons between pack holders.
- [x] Run tests/build, review desktop/mobile/reduced motion and collection flows, publish exact build and leave preview ready to test.

Verification: 32 tests pass, production build passes, reviewer found no actionable defects. Desktop QA checked puncture/occlusion frames, ordinary card handoff, and contrasting pink/yellow lighting. Mobile QA also verified the articulated reveal, aligned stage, reveal-all flight and settlement. Private publication uses the verified build.
