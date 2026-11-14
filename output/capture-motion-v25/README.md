# Legendary Capture V25

Preview: http://localhost:5174/tests/browser/legendary-capture-v25.html?pokemon=lugia

Lugia now keeps its actual native skinned GLB body throughout conversion. A reversible view-space transport field moves the same surface from outer limbs toward the ball. The material carries a moving blue energy front before travel; its original skin, shading and skeletal pose remain until that front passes. There is no Lugia conversion-drawing swap or opacity cutaway. Mewtwo retains its previous conversion path.

The ball uses a rear shell, recessed dark well, foreground lower rim and foreground lid. The flow target is below the well's visible opening, so its final section is occluded inside the shell. Escape uses the same target and reversed field. This is layered depth in the 2D composited stage, not a full volumetric ball simulation.

The final reward was redesigned after studying Balatro and Pokémon TCG Pocket. The card owns one anticipation/flip/recoil event and an angle-dependent foil finish. Its fixed 180× contribution appears on the card; a compact paper reward tray separately tallies the $10 × 180 = $1,800 mock award. No screen border or repeated card pulse is driven by the count. The previously generated water and wind frame sheets remain as rejected experiment provenance, but are no longer loaded by this scene.

Design references:
- [Balatro official guide](https://www.playbalatro.com/faq): cards and Jokers have identifiable scoring contributions. Our interpretation is to show this single bonus card's fixed contribution clearly rather than inventing a combo chain.
- [LocalThunk development timeline](https://localthunk.com/blog/balatro-timeline-3aarh): score effects were chosen to fit the actual scoring mechanic. The final design uses one card impulse and localized tally feedback.
- [Pokémon TCG Pocket official card guide](https://www.pokemon.com/uk/strategy/a-guide-to-collecting-cards-and-using-wonder-picks-in-pokemon-trading-card-game-pocket): special presentation belongs to the collectible's artwork. We apply the existing original foil shader directly to the card.
- [Marvel Snap card finishes](https://marvelsnap.com/fntyspltlglpg/): card appearance is treated as a persistent finish, supporting the decision to retain a subtle foil treatment after the reveal.

The palette follows the game: navy ink #18394b, cream paper #f3eedb, Poké Ball red #b72e42, and settled reward green #1e5c4d. Nunito is retained for continuity with the actual game. The card is the central object, the contribution is attached to it, and the reward panel is subordinate. There is one anticipation, one reveal impulse, and one settled result.

`compose-music.swift` composes an original 160 BPM instrumental using Apple's local DLS instruments: strings, brass, picked bass, organ and percussion. No Pokémon soundtrack or borrowed melody is used. `mix-score.py` combines it with the existing Foley, ducks it for the ball checks, and schedules a card flip impact, quiet counting ticks and localized tally confirmations against the same presentation clock. The cue manifest is in `audio/cue-manifest-v25.json`.

The reward beat lasts 8.05 seconds; the capture and escape transformations retain their prior 1.9/1.8-second timing. Escape does not inherit the longer win timing. The preview canvas now explicitly matches the portrait/wide aspect ratio selected by its renderer, preventing distorted creatures and cards at intermediate viewport widths.

The pack's individual bonus reveals, HUD-to-socket transfer, entry eye transition, and return to the unfinished pack remain connected through the walkthrough harness. This remains frontend-only demonstration work; it has not replaced the main game's older vault. Mock outcomes only; throw timing does not change the result.

Verification: 790 tests passed, followed by 18 focused tests after the depth correction, main TypeScript build passed, and the standalone scene passed strict TypeScript checking. Live capture and escape recordings include actual browser audio. Generated frame artwork is used as transparent raster assets; build code creates Spine metadata and does not paint VFX with Pixi Graphics.

Latest visual correction: the complete ball now stays in front of the creature throughout flight, impact and resistance. Only the absorption interval separates its layers. A new four-cel inked current connects the native transformed chest to the recessed opening, while the native body keeps its texture and dark contour longer. Art prompts and source paths are recorded in `assets/sharp-art-manifest.json`.

## Connected entrance and result revision

The same red/cream Poké Ball shutter and authored Spine latch now cover both scene handoffs. The eye sequence has 2.45 seconds of presentation time, with a narrowed hold, glint and named reveal; the camera pulls back from Lugia’s entrance. The encounter advertises its conditional 180×/$1,800 mock capture reward. The three checks have an extra 0.45-second shared suspense hold. A single Caught/Broke free stamp follows the actual ball result. Escape never plays the success seal.

Music is now a separate persistent 24-second instrumental loop. It begins with the pack, survives the throw wait without restarting, and gently ducks for checks before fading on return. Only timed Foley pauses at the throw gate. Live capture audio has no silence below −45 dB for 0.1 seconds during the encounter, with a −2.4 dBFS true peak before delivery normalization.

Normal bonus cards have an angled red ink stamp at (74,170) in normalized card space, with a ball at (40,170), matching the HUD flight origin. BONUS text is positioned inside that stamp. One drop/impact/recoil settles permanently; only actual bonus cards receive it.

Validation: 796 tests passed; then 147 focused tests passed after the final origin/entrance adjustment. Main and strict standalone TypeScript checks passed. Both branches recorded in the browser with stereo audio.

## V26 — exclusive shots and drawn ink transitions

The V25 red/cream shutters are removed. New transparent, inked animation cels run through Spine. `choreography.ts` owns exclusive entry shots: 5.15–6.4 transition, 6.4–7.5 eye, then arrival. The eye gets 2.2 seconds of presentation time. Exit hides the scene switch under full ink coverage before revealing the original pack. Tests cover every 120 Hz sample and the exact boundaries.

New eight-cel lock and eight-cel breakout effects follow one shared suspense hold. Physical recoil and a mechanical snap / outward crack occur before their written verdicts. The success verdict clears before the card starts; the escape verdict clears before the footer returns. No success seal plays on escape. Music stays continuous and ducks modestly during the eye and final held check; no additional fake check or skill mechanic was introduced.

Reference study: Official Pokémon Legends: Arceus gameplay preview (https://www.youtube.com/watch?v=sMQNqvtpb18), Wild Pokémon chapter, distinguishes the physical capture/escape feedback from the following HUD state. The animator’s anticipation/action/reaction breakdown in Game Developer June/July 2010 pp.17–18 (https://media.gdcvault.com/GD_Mag_Archives/GDM_JuneJuly_2010.pdf) supports exclusive readable beats. Play’n GO’s SoundStage article (https://www.playngo.com/post/soundstage-game-audio) describes event-responsive audio intensity. These are design references, not claims that particular timing guarantees player engagement. The linked TOKYO Scarlet/Violet film was private and was not used as viewed evidence.

Validation: 799 tests passed; strict standalone and main TypeScript checks passed. V26 phone video includes actual pack play, capture and escape with browser audio.


## V27 — continuous creature motion and cinematic arrival

Preview: http://localhost:5174/tests/browser/legendary-capture-v27.html?pokemon=lugia

Fixed two concrete continuity problems: the idle phase switched between local story time and global browser uptime during the throw gate, and the hit began from a fixed idle pose. The gate now accumulates its hold continuously; the same phase is used before, during and after the press, and the hit blends from the live pose. A regression test failed on the old hold behavior and now passes. The escaped Lugia proceeds from the final reconstituted pose into a roar before recovering.

Removed the legacy ball-containing effect from both impact and the card handoff; it was rendering a second Poké Ball over the actual shell. The ball is now a single physical object throughout those beats.

Lugia has a 2.2-second bank-and-brake entrance using native articulated wings, body yaw/roll, head tracking, tail follow-through and a moving camera. A new 16-drawing eye performance and separate 16-cel lock/breakout effects are sequenced through Spine. Generated assets and exact built-in image_gen prompts are recorded in `assets/generation-v27.json`; native character motion remains skeletal 3D, not a Spine character rig. Audio retiming includes the longer approach and matched wing-pressure cues.

Validation: 800 tests passed, main TypeScript and strict standalone scene checks passed. Final browser recordings with live stereo audio are in `recordings/v27`; phone delivery is `videos/legendary-capture-v27-delivery.mp4`. V25/V26 final movies remain retained; their superseded V26 recording/encoding intermediates were removed to allow packaging within available disk space.


## V28 — continuous pose handoffs and reward cadence

Preview: http://localhost:5174/tests/browser/legendary-capture-v28.html?pokemon=lugia

The source Lugia loop closes cleanly; the old entrance retiming stopped each half-stroke. `arrivalPhase` now carries two complete cycles through a continuously decelerating phase and meets idle at unit speed. `SkeletalContinuity` applies a short quaternion/position/scale blend on the continuous presentation clock, including the throw wait. Repaints do not advance it, and seeks reset it. Both creature adapters use this layer.

The capture latch has a stronger seat/rebound and a low mechanical thud, with a short pre-impact audio dip. The award tray has larger individually animated digits, two staggered punches at each milestone, escalating accents and a gold final hold. The fixed card multiplier remains settled; no extra payout mechanic is implied.

Reuse: `encounter.ts` owns rig selection, source model and native clip selectors, card, colors, smoke placement, bet and multiplier. `encounterActor.ts` selects a compatible adapter. The reward timeline scales to any configured multiplier (regressions cover 42× and 500×). To add a Pokémon, provide its model, card, eye/conversion artwork and profile; a new skeleton topology needs a new bone/clip adapter. Arbitrary GLBs are not plug-and-play. Shared capture timing, pose smoothing, ball, transitions and reward logic need no duplication.

Reference: official Balatro launch trailer (Playstack, https://www.youtube.com/watch?v=2n9pkiuSZLU) and LocalThunk’s development timeline informed the legible score emphasis and localized card/score feedback. The presentation retains this game’s typography and palette.

Validation: 804 tests passed; main TypeScript and strict standalone checks passed. Both branches recorded with browser audio in `recordings/v28`; phone delivery in `videos/legendary-capture-v28-delivery.mp4`. Full previous local delivery movies remain; hosted V20/V22/V23 history copies were compressed to fit the existing Site asset limit.

Publication note: V28 is live at https://legendary-showdown-video-rjm-1109.[account].chatgpt.site/capture-v28 (source 5a2ff92a211b2cbf731d443c5316366e924ac39b). Superseded V27 raw WebM recordings were removed during low-disk packaging; its full delivery MP4 and chapter data remain. V28 raw takes and full delivery are retained.


## V29 — reward cadence and reusable score display

The count now accelerates into each milestone, holds the exact subtotal, and lands two score impulses 160 ms apart. The final 120× subtotal holds longer before the last count. Its score compresses during anticipation and lands a larger, separately tuned punch; individual digits follow in reading order. Existing drawn gold impact cels run through Spine behind the total and clear before the settled hold. A stamped Legendary win label replaces the ordinary reward heading only after the exact configured award is reached. The card does not bounce with each amount stage.

The flat reward tray is removed. The configured bet and bonus sit in blue/red score chips, with a larger cream-to-gold total and an ink shadow. Counting ticks accelerate, milestone accents deepen, and a short music dip precedes the low final hit. The final award never overshoots or introduces a new multiplier.

rewardCounter.ts takes only {bet,multiplier}; rewardMotion.ts owns deterministic timing independent of Pokémon identity. createCardReveal also accepts a supplied profile. Existing tests cover 42× and 500× awards, monotonic totals, held milestones and backward scrubbing; new tests verify anticipation and the stronger final impulse.

807 tests and both main/standalone TypeScript checks passed. V29 video focuses on the complete trigger → capture → revised reward flow, with live browser sound. V28's finished video retains the alternate escape demonstration. Previous finished delivery movies remain locally; superseded V28 raw recording intermediates were cleared for local packaging space.

V29 packaging note: final H.264/AAC delivery and chapters are retained. The temporary raw V29 take and older V22/V23 per-branch encoding intermediates were removed after export verification to fit local disk limits. Their finished delivery movies remain. Hosted V19 was compacted; its full local delivery remains.

Published V29: https://legendary-showdown-video-rjm-1109.[account].chatgpt.site/capture-v29 — source 155f77d68e9dc4aeb48b21be57c1cf3a06fa6cd6. Phone export: 53.34 seconds, 720×960 H.264 at 60 fps, stereo AAC 48 kHz, −16.9 LUFS and −1.1 dBFS true peak. Hosted V18/V19 history copies were compacted to fit the expanded archive limit; their full local delivery movies remain.
