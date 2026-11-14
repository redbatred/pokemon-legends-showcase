# Showdown symbols and pacing implementation plan

> **For agentic workers:** Use test-driven development for behavior and verify the complete visible flow.

**Goal:** Three symbols in one mock pack visibly qualify for Showdown; deliver a shorter, smoother battle and updated phone-accessible video.

**Architecture:** Store the symbol positions in the opening before reveal. A presentation layer marks qualifying cards and collects three indicators before a short Poké Ball assembly transition. The battle retains its outcome fixtures and existing arena but uses a 12-second shared timeline and continuous character motion.

**Tech Stack:** TypeScript, Pixi, Spine, GSAP, Three.js, Vitest; existing private Sites video page.

**Spec:** User-approved design in chat: three symbols anywhere in one pack; no accumulation across packs; third symbol connects to existing arena shutters; three attacks and reward in 12–14 seconds; frontend mock outcomes only.

## Constraints
- Preserve existing uncommitted feature work and existing branch.
- No backend, RTP or real wallet changes. Mock qualification must exist before reveal.
- No manufactured near misses or misleading skill/payout interaction.
- Maintain reduced motion, skip, pause, return, responsive layouts.

## Review focus
- Group reveal and single reveal collect each symbol exactly once.
- Fewer than three symbols never enter Showdown; progress resets for a new pack.
- Reloaded active packs keep assigned symbols; no replay from history triggers.
- Finish and skip award the same total; no sounds after cancellation.
- Mobile placement remains legible and capture includes the actual trigger.

## Tasks
1. Add qualification model and tests: immutable assigned positions, distinct valid card positions, count visible symbols and qualification. Integrate stored mock opening metadata with Game and visible card/tray markers. Test before implementation.
2. Shorten battle to 12–14 seconds, remove counterattack, centralize timeline messages, smooth pose transitions/render cadence. Verify snapshot, pause/skip and choreography tests.
3. Animate third-symbol confirmation in existing blue/cyan stadium style before arena shutters. Verify manual/group paths and return on desktop/mobile.
4. Run complete tests and build, inspect changes, record actual gameplay and publish replacement video to the existing owner-private Site.

## Progress
- Plan accepted by prior explicit user instruction to implement. No additional design approval required.
- Existing codex/legendary-rift working branch retained because the feature is already in progress here.
- Completed symbol metadata, distinct-position validation, visible single/group badges, tray/result markers, per-pack meter, and native Pixi qualification animation.
- Completed 13-second battle with shared timing, no counterattack, actual charge scheduling, and continuous battle actor rendering.
- Review fixed reset retaining stale pending bonuses and late loading audio after closing. Added regression coverage; automatic qualifying packs stop further purchases.
- Final verification: 83 test files / 539 tests passed; production build passed (existing bundle-size warnings); git diff check passed.
- Browser QA: 1280x720 desktop and 390x844 portrait; non-qualifying pack, armed qualifying pack, single/group reveals, three-symbol qualification, full normal-speed battle, 180x result and return. Meter moved away from card and toolbar after visual inspection.
- Native canvas video captured; idle-only edits preserve normal-speed animations. Publishing the replacement to the existing private video Site.
- Completed: updated 45.7-second H.264 / 60fps walkthrough deployed successfully to the existing owner-private Site. Source version d9a6d83ee64d9e84b06d53a32498dd76a87c3c66; deployment appgdep_6af1d2f588e08191b506df157ee0c8f8.
