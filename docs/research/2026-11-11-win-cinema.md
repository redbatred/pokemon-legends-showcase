# Win cinematic V35

Motion references actually inspected as frame sequences:
- Kaupo Karindi / All41 Studios, WWE Legends BIG WIN: https://g3ko.artstation.com/projects/9mWvxa — continuous character performance, coordinated scene lighting, tier escalation, resolved return to the reels.
- Artforgame, Trees of Fortune win animation: https://artforgame.artstation.com/projects/GawnQa — staged construction and distinct tier emphasis.

No reference artwork or footage is used in the product.

BIG/MEGA now use native GLB skeletal clips, a perspective arena, camera dolly/orbit and vertical subject tracking, moving lights and spatial confetti. Existing authored 32-frame anime impact cels run through Spine. These are real skeletal 3D characters; they are not newly authored Spine character rigs.

The 6.12-second timeline reserves the opening for performance, introduces the award on impact, holds between four increasing count segments, and resolves on the exact total. First tap finishes the count; a later tap advances. Normal rewards settle once, only on transfer. Automatic play allows the complete count. Reduced motion skips to a held award.

The same cinematic is used for qualifying pack results with the highest-valued Pokémon as the lead. The collector HUD is occluded during the full-screen card win. The result uses global canvas coordinates rather than the inset result-modal coordinates.

Validation: TypeScript; 174 Vitest files / 863 tests; in-browser recording of an actual mock pack with Charizard BIG, Pidgeot MEGA, and the pack total. Audio is the live game mix, not added in editing. Backend/RTP unchanged.

## V37 — continuing attacks, tier choreography, separate pack total

The single-card presentation now has BIG (2×), MEGA (8×), EPIC (20×), and LEGENDARY (50×) presentation tiers. These labels do not alter outcomes or settlement. One shared timeline samples each native skeletal clip through anticipation, emission, strike and recovery, blending with an advancing idle. Count beats trigger additional attacks; the final strike holds its source pose for 95 ms before recovery. Higher tiers add a second count attack, wider camera travel, close charge shots, stronger final lighting/FX, and a stacked Legendary title. No extra payout is implied by a tier.

Pidgeot's visible wing meshes are skinned to LFeeler1/LFeeler2 and RFeeler1/RFeeler2, not LArm/LHand. V37 articulates the actual wing chains and projects gusts from skin-measured distal feather points. The existing GLB was inspected offline with native attack t=.39; the furthest skinned vertex from each wing root was converted into the distal bone's local space. Native takeoff displacement is restrained to 15% for airborne actors so repeated attacks remain framed. The source skeleton and imported native clips are retained; this is additional joint choreography, not a new Spine character asset.

Qualifying pack totals now use PackWinCinema: the actual collected cards fan in and contribute according to their values, then resolve into one total. This replaces the previous highest-value Pokémon replay. The existing tap-to-finish, then tap-to-advance behavior and once-only credit transfer remain.

Validation: production build; 176 Vitest files / 870 tests. New tests cover active count choreography, tier strength ordering, the final pose hold, monotonic exact totals and value-weighted card contributions. Browser recording includes BIG, MEGA, EPIC, LEGENDARY, and the separate pack award with live game audio. No new bitmap assets were generated for V37; existing Spine animation cels are reused.

## V38 — connected handoffs, clean cel edges, final-strike titles

The original reveal actor now yields to the cinematic actor while its card remains in place. Arena materials fade with the attack-driven scene transition; shared shader materials receive one reveal uniform and one alpha multiplication. The rectangular scene mask was removed. New 16-cel fire and wind sheets have padded cell edges, and a premultiplied-alpha matte filter removes low-alpha square residue. Asset prompts and provenance are in public/assets/win-cinema-v38.

Win labels arrive only on the final strike, with staggered letters. Amounts use independently carried digits and a staggered exact-value lock. The pack award lays out the actual cards on the same grid as the final summary, with individual positive-value contributions and a dedicated finishing burst. This replaces the fan-to-grid layout jump; zero-value energy cards remain visible without taking a count segment. Short packs no longer reserve eleven-card spacing.

Validation: production build; 178 Vitest files / 874 tests. Regression coverage includes shared shader injection, final-strike title timing, short-pack geometry and reveal-actor handoff. Frontend mock outcomes and settlement are unchanged.

## V39 — impact-linked amounts and exact-roster handoff

The award now starts after the native emergence completes, during charge. The source actor remains on stage until the attack fills the lens; the destination arena/actor appears under that transition. Source sockets are supplied by the actual reveal, avoiding an unanchored transition projectile. Each count burst follows a strike, with a final short burst arriving at the finisher. Complete glyphs replace clipped rolling digits.

Cinematics now receive the exact artwork key from the card identity. This preserves shiny, Tera/crown, regional, Gigantamax, origin and ensemble appearances instead of normalizing them to a base species name. Native runtime idle/attack aliases are supported. Attack samples are bounded to the native clip duration. Fire, wind, water, electric and psychic cel families have separate Spine playback; other elements route to the compatible motion family with their palette. New artwork and exact imagegen prompts are in public/assets/win-cinema-v39.

Pack totals now use a fullscreen card performance: each paying card comes forward, contributes its actual value, and returns to the hand. The final title and exact total land together. On advance, the same cards move into the results grid instead of switching layouts. Zero-value energy remains in the final hand without consuming a contribution beat.

Validation: 180 test files / 965 tests and production build passed. Browser roster audit rendered all 69 model variants at 390x844 and 1280x720, sampled three attack/recovery times, and verified finite nonempty projected attack sockets; no browser errors. This is a runtime compatibility check, not a claim that every pose received individual art-direction review. Actual gameplay recording separately reviews Charizard, Blastoise, Gigantamax Pikachu and Mewtwo.

## V40 — card-scored pack finale

The pack award now uses a dedicated strike timeline. Each positive card contributes only on its own impact; the subtotal holds between strikes. The last card's contribution finishes exactly on the shared final hand slam. Complete amount glyphs receive the actual pack beat rather than the unrelated Pokémon attack timestamps. New tests cover those holds, exact final totals and monotonic progression.

Cards use perspective mesh corners with pitch/yaw, animated print-preserving foil, and separate cast shadows. The whole hand compresses during anticipation, then releases into a staggered forward strike. The amount, title, pressure cels, backdrop punch and layered audio share that strike. The existing transition to exact summary slots is retained, as is tap-to-finish then tap-to-advance. No new bitmap assets were generated; the existing Spine electric/wind cels and card art are reused.

Reference context: the official Balatro FAQ describes cards as contributors to a hand's score (https://www.playbalatro.com/faq). This pass interprets that card-to-total causality through the game's existing Pokémon art; it does not introduce score multipliers or change payouts.

Validation: 180 test files / 967 tests; production build passed. A focused actual-game mock recording shows pack opening, scoring, final strike and return to results with live stereo audio.

V40 delivery: corrected the results-panel flash by keeping the cinematic backdrop opaque through the entrance. Rebuilt successfully and reran all 3 pack finale timing/layout tests after the fix (full suite before the opacity-only fix: 967 passing). Recorded a focused 17-second actual-game mock pack finale with live stereo audio; H.264/AAC phone export at 720×960, 60 fps, peak −3.2 dB. Private phone player updated to revision 13.
