# Pack flow and automatic play implementation plan

Goal: explicit first-card reveal, all ten sets visible, Turbo and bounded Auto Spin, quieter modern sound.
Architecture: retain Pixi UI and XState opening machine. Add awaiting state after tearing, a small deterministic Auto Spin session, a responsive pack grid, and per-scene Turbo speed. Keep OS motion preference separate from Turbo. No backend, no real-money changes.

User specification: six numbered requests in chat on 2026-10-29.

- [x] Opening flow: machine waits in awaiting after tear. NEXT reveals index 0; ALL collects every card. Prevent duplicate inputs. Tests for both routes and final collection.
- [x] Auto Spin: counts 5/10/15/20/30/50/75/100; individual/all mode; explicit Start, progress and immediate Stop. Count settled pack IDs once, pause for menus/hidden tab, stop on failures or insufficient balance. Never restore auto purchasing after reload. Unit and integration tests with fake timers/storage.
- [x] UI: remove pack carousel; all ten packs fit at desktop, landscape and phone sizes; selected pack stays centered. Persistent Turbo and Auto controls, aligned modal with counts and reveal mode. Disable manual play and pack switches during auto.
- [x] Turbo: independent speed setting, faster tear/card/tray motion and skip long Pokémon cinematics. Maintain reduced-motion OS preference internally. Persist Turbo, Sound, Low graphics.
- [x] Sound: replace retro UI/card cues with short sample-based tactile sounds, no applause loop, subdued vocal reactions, cooldown for repeated inputs and rapid collection.
- [x] Verify tests, build, browser manual/auto/phone/layout paths with an in-memory save. Publish existing public Site and push same source to GitHub.

Review focus: Stop during an async purchase; hidden/modal scheduling; large counts versus history's 30-entry cap; no first reveal in manual or Open All; small phone grid and control hit areas; settings migration and Turbo toggled mid-animation.

Implementation decisions: Auto Spin uses a Start button so selecting a mode/count never spends credits accidentally. Stop cancels future actions immediately and leaves any already purchased pack available manually. Each pack is charged once as it starts; no auto top-up. Muted settings and existing saves are preserved.


Validation before publication: 40 test files,153 tests pass; TypeScript and Vite production build pass (existing bundle-size advisory). Browser fixtures use injected in-memory persistence. Verified all ten packs and native targets in phone/desktop layouts; manual tear remains awaiting; automatic Open All completes exactly five packs; individual mode advances cards and Stop returns manual control. Short landscape568×320 Auto Spin has no overlap. No physical iPhone audition or human sound audition claimed. Nine sample-derived cues were decoded and checked for finite samples/headroom.

Fresh review fixes: restore awaiting after a failed first Open All load, and separate count/mode/Start hit areas in short landscape. Added regression checks for both. Also reject a purchase if a separate tab has already reserved a pack. Turbo migrates the old saved reduced-motion switch while retaining the OS reduced-motion preference internally. Publication follows the existing Sites/GitHub workflow.
