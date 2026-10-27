# Stadium reveal: reference and implementation direction

Research date: 2026-10-28. Read-only review of app/assets; this document is the only added file. Animation recommendations below are original design judgments. Reference timestamps are observed stills from the official video, not a frame-by-frame timing analysis.

## Primary reference

[Pokémon: Twilight Wings, episode 7, “Sky” — official Pokémon Japan upload](https://www.youtube.com/watch?v=CoKUvLrPluU), linked directly from the [official series site](https://www.pokemon.co.jp/ex/hakumei_no_tsubasa/). The official channel's verified status, video title and footage were inspected in the browser.

| Observed point | Visual evidence | Adaptation for this game |
| --- | --- | --- |
| [5:55](https://www.youtube.com/watch?v=CoKUvLrPluU&t=355s) | Rear trainer silhouette sits below five bright overhead light cores; dark roof structure and two crowd tiers make the stadium legible. | Keep architecture steady. Use two or three narrow light cones with bright sources and broad faint spill, reserving open center space for the ball and creature. |
| [6:47](https://www.youtube.com/watch?v=CoKUvLrPluU&t=407s) | A quiet spectator close-up: hand to chest, wide eyes, sparse bright particles, simple blue background. | One short reaction beat is enough. A brief crowd silhouette lift or delayed wave of raised arms reads better than constant crowd motion. |
| [7:14](https://www.youtube.com/watch?v=CoKUvLrPluU&t=434s) | Large white attack shapes dominate the foreground; an irregular wedge preserves the crowd tiers, while the creature stays readable in the lower right. | Let an attack exceed the creature bounds, but preserve a strip of arena context and the face/attack origin. Use a directional wipe/smear rather than a screen-wide white flash. |
| [7:34](https://www.youtube.com/watch?v=CoKUvLrPluU&t=454s) | Dragapult fills a diagonal foreground composition. Smaller projectiles trail into depth; long curved trails explain their trajectories; flares stay localized. | Use one clear attack vector, a strong anticipation pose and a few long coherent trails. Add localized rim light at the emission point, not random particles everywhere. |

The [official director/assistant-director interview](https://www.pokemon.co.jp/ex/hakumei_no_tsubasa/interview_04/) supplies unusually useful intent: Shingo Yamashita describes how a Pokémon's apparent scale came from music combined with its cry, and says episode 7 aims to recreate the feeling of witnessing the stadium battle in person. He also discusses using image composition, cuts, color, sunlight and music to distinguish emotional contexts. **Inference for this game:** briefly reduce the crowd bed before the latch, then give the release/cry room; use crowd response after the creature pose lands. More particles are unlikely to add as much perceived scale as that sound-and-pose sequence.

## Baseline discontinuities (before this pass)

- `src/game/ballPhysics.ts:3–14`: Position is continuous at card contact `(0, -98)`, but velocity is not. For `skyY=-500`, the incoming projected velocity is approximately `(-564.8, +1771.8)` px/s; landing begins at `(+132.1, +155.5)` px/s. Loss of energy is reasonable at a puncture, but the immediate lateral reversal and 91% downward speed reduction make it read as a new animation segment. Carry the incoming screen tangent for roughly 35–60 ms through the hole, then bend into the gravity fall, or design the approach from the opposite side so outgoing lateral momentum is consistent.
- `ballPhysics.ts:13–14`: Rebound velocity `-145`, gravity `1050` means a peak only `10.01px` above floor and `0.276s` total flight. Floor impact velocity is about `871px/s`, so the vertical restitution is only `0.166`. A 25–38px rebound (roughly `v=-230` to `-282` at the same gravity) would be more readable while remaining restrained. Prefer deriving the rebound from incoming velocity and an explicit restitution constant.
- `SpineReveal.ts:47,59,63`: Lid opening at `hit+0.78s` precedes the rebound's second floor contact at `hit+0.806s`. The ball is still 3.44px airborne and descending when it opens. After a stronger rebound, this mismatch becomes worse. Derive `open` from the actual settled time, then reserve 80–120 ms for latch/anticipation. An apex opening is also coherent, but must be an intentional airborne release with different shadow and sound staging.
- `SpineReveal.ts:59`, `PokeballRig.ts` `ready` animation: Floor contact immediately changes the animated sphere to `spin0`, while the root rotation continues from approximately `.597` radians back to zero through the rebound. Decelerate spin before the final contact and align the texture's seam/button to the lid's closed pose before switching attachments. The current opening rig has useful hinge depth sorting and 111°→104° overshoot; keep that mechanical finish.
- `SpineReveal.ts:58`: Scale changes `.72→.62` during the fall independently of the projected flight. If the ball is coming through the card toward the viewer, shrinking suggests it is retreating. Hold scale after the puncture or drive it from a continued depth state, then apply a brief contact squash separately.
- `SpineReveal.ts:30,62,97`: The initial shadow appears near `(18,219)` although the landing ball is near `(70,174)`; it switches to following the creature only after release. Give the ball its own floor shadow tied to floor position and altitude. Tighten/darken it approaching contact and widen/fade it at the bounce apex.
- `Stage.ts:403` uses the same `scene.impact()` cue for card puncture and creature attack. Distinct cues would make cause/effect readable: card = sharp local tear; floor = grounded squash/dust; release = ascending light; attack = directional recoil and delayed crowd response.

## Suggested beat structure

These are proposed game timings, not timings measured from the anime.

1. **Distant approach, 1.0–1.25s:** tiny sharp ball against the upper arena; keep initial perspective growth slow, then accelerate the final quarter. Let lights converge slightly during the approach. A thin trail should follow the actual velocity vector.
2. **Card puncture, 35–60ms emphasis:** one ink/silhouette or desaturated impact drawing held for 1–2 frames at a 30fps animation cadence (33–67ms), with a local radial tear and a brief positional hold. Avoid alternating full-screen black/white or repeated flashing. Clear the center immediately after the hit so the ball remains trackable.
3. **Through-card carry, then fall, about 0.4–0.55s:** retain the tangent before gravity dominates. Align the ball shadow below its floor position. Debris travels outward once and falls; it should not accompany the ball like a glow cloud.
4. **One rebound, about 0.32–0.42s:** quick contact squash (about 45ms), larger readable apex, smaller second contact and spin settle. No long oscillation tail.
5. **Latch and lid, 0.10s then 0.25s:** after settling, button light appears first, then the lid hinge exposes the inner shell. Release light should begin from the opening, follow the creature's emergence path and only then brighten its silhouette.
6. **Creature recognition, 0.18–0.28s clear pose:** let face and body silhouette read after color resolves. Give species-specific heavy landing or hover. Delay crowd reaction roughly 80–140ms after the pose lands.
7. **Attack:** narrow the lights and reduce background exposure during anticipation; use one strong release vector with a 35–60ms attack drawing/hold, a fast main action, then a longer recovery. Keep head/eyes and attack origin readable. Peak crowd and lamp response follows the attack instead of anticipating it.

## Highest value implementation order

1. Fix tangent continuity, derive bounce/open timing, align spin-to-lid pose and ball shadow.
2. Give card impact, floor contact, release and attack distinct cue envelopes.
3. Add localized 1–2-frame impact treatment and one delayed crowd reaction; keep existing reduced-motion path static and skip the impact treatment there.
4. Add two directional stadium light cones and a restrained crowd row animation. Do not warp the masonry or scatter independent bright pulses across the audience.

Verification limits: source code and selected official video stills were inspected. No continuous playback timing, audio listening, or in-app animation QA was performed in this research subtask.
