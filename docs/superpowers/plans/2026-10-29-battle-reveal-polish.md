# Battle reveal polish implementation plan

> Implement inline with superpowers:executing-plans; one fresh review at the end.

**Goal:** Put useful controls by the player's hand, make the card tray browseable, and give opening/reveals a richer Pokémon anime rhythm.
**Architecture:** Preserve Pixi canvas UI, actual Spine rigs, Three Pokémon animation and browser-local saves. Add bounded input/motion helpers; music owns two looping tracks with a cancellable crossfade. Use the existing first-click-finish/second-click-next completion owner for every new effect.
**Spec:** Latest user request in this conversation, following the published skip-reveals change. Existing authorization covers implementation and publication.

## Constraints and decisions
- No odds/result changes, backend, React, or real-money integration. The occasional shake is presentation only (~20% of normal reveals), at most 0.65s, disabled in Turbo/reduced motion and always skippable.
- Keep all ten packs visible. Scroll only the opened-card tray; unrevealed slots show a question mark, landed cards show their face.
- Next becomes a hollow glowing chevron on the left of the stage, mirrored below the stage on narrow phones. All stays on the right. Header utilities move below collection/history on wide layouts and retain an aligned phone row.
- Battle track is a genuine anime instrumental from the user's licensed catalog; retain source provenance. Quiet crossfade begins at wrapper opening and returns to lobby on returning to pack selection. Mute, hidden tabs and late loads must not restart stale tracks.
- Retain exact awards and held big-win graphics. Slower count ends around 2s; skipping still displays the exact value immediately.

## Tasks and verification
- [x] Header/Next layout: update utilityLayout, rendering, modalLayout and CanvasUI. Test left-side positioning, intersections, hit targets and banner geometry at desktop/phone/landscape sizes. Inspect in browser.
- [x] Tray input: add a bounded drag/momentum controller with clamp/resize/drag-vs-tap tests. Wire pointer and wheel capture on the canvas host, preserve flight targets, update inspection hit boxes after scrolling, and draw question-mark slots without card backs.
- [x] Music: source new battle and flight/release assets with reproducible script/provenance. Add scene selection and guarded crossfades to audio.ts; test rapid switches, late loads, mute/hidden and resumed playback. Game drives scene from phase.
- [x] Suspense/award timing: test normal suspense eligibility, no consecutive teases, Turbo bypass and duration limits. Extend special counter timeline and test held/skip/transfer behavior.
- [x] Ball effects: native Spine flight/release rig with tapered ribbons and rays; curved sampled trail follows the ballistic flight. Tie flight audio and release burst to the same scene clock. Test native rig parsing, finite geometry and clean final/skip state.
- [x] Full tests/build; browser phone/desktop swipe, Next, normal/special skip, music state and modal checks with in-memory saves. Fresh review.
- Publication: prepared for the existing public Site and GitHub main; deploy and verify this exact source commit after packaging.

Review focus: stale audio fades; drag opening the wrong card; tray resize during a flight; header/total/Next collisions; skipped release leaving emitters or a partially counted award.

## Verification evidence
- `npm test`: 45 files, 170 tests passed. `npm run build`: TypeScript and Vite pass; existing bundle-size advisory only. Final entry: `index-B26kIbdc.js`.
- Browser: desktop 1280×780, portrait 390×780, compact 568×320; current controls and tray visually checked. Phone drag and interrupted momentum preserve card inspection. Fast skip recenters the current slot after manual scrolling.
- Frozen ball release → Next immediately reaches the final Pokémon pose and exact $45 award, with ball/effects removed. The second Next advances normally. A normal suspense reveal also remained skippable.
- Music scene selection and flight/release playback checked through the fixture; audio files decode and have measured onset, peak and loop-seam checks. No human listening evaluation claimed.
- Fresh review found interrupted tray scrolling could lose inspection targets and repeated music fades could jump volume. Both fixed; regression tests and browser interruption check passed.
- Native Spine 4.2 flight/release rigs parse and run with finite transforms; release slots finish invisible. The physical flight remains in view at desktop/phone sizes.
- Browser QA uses in-memory saves only. Existing production save remains untouched.
