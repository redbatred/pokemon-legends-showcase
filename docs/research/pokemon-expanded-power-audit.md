# Expanded Pokémon reveal audit

Research date: 2026-10-27. This pass inspected all 33 shipped model mappings, the 17 documented illustration fallbacks, and 70 CPU-skinned attack poses across ten additional actors. It adds ten measured entries to `public/assets/pokemon-3d/power-cues.json`; the earlier four entries are unchanged. No GLB, runtime TypeScript, dependencies, or source animation data were modified.

## Coverage and actual limits

All 33 GLBs contain genuine skeleton animation and every mapped clip exists. Twenty-eight models have a distinct mapped attack. Espeon, Glaceon, Leafeon, Umbreon and Scizor each have one generically named authored clip but **no verified attack mapping**. Do not present those clips as measured attacks or force a new attack time onto them. Their existing motion can support a restrained presentation aura, clearly distinct from an attack.

The 17 illustration-only actors remain Arceus, Breloom, Cinderace, Cleffa, Forretress, Gardevoir, Genesect, Giratina, Kyogre, Paldean Clodsire, Raikou, Rayquaza, Rotom, Suicune, Sylveon, Trevenant and Tyranitar. Prior source candidates had skeletons but zero animation clips. This pass did not replace them with static GLBs or synthesize motion. In particular, **Rayquaza has no shipped animated rig**, so there is no valid skeletal mouth socket or action clock to add. Retain intact artwork until a genuine animated source is available.

`pokemon-expanded-model-audit.json` records all 33 mappings, retained clip durations and moving-joint counts, the five unverified attack cases, all 17 fallbacks, and cue validation results.

## Ten added anatomical cues

All times in this table are source clip seconds. Playback speed and seek are in the JSON. These are measured pose-compatible effect recommendations, not official named-move event tracks.

| Actor | Effect form | Attached anatomy | Release → effect end | Concrete correction |
|---|---|---|---|---|
| Mewtwo | `psychic-palm-wave` | `left_hand` | 2.02 → 3.05 | Source first jabs with the right hand near 1.67, then holds the left palm forward around 2.0–3.2. Use that palm instead of the torso. |
| Lugia | `aeroblast` | `head_14`, native tooth landmarks | 0.70 → 1.22 | The ranged clip opens its beak and pitches its head. Use a mouth-directed compressed-air beam, rather than the generic wind-blade ring. |
| Gyarados | `hydro-pump` | `head`, upper jaw/teeth center | 0.62 → 1.42 | Native lower-jaw rotation peaks at 0.60. Its head-local forward direction is mainly **+X**, so a universal +Z direction is wrong. |
| Dragonite | `hyper-beam` | `head`, snout/jaw socket | 1.78 → 2.50 | Follow the pitched snout with a finite straight light beam. Jaw opening peaks at 1.717. Avoid a flame-shaped blue plume. |
| Gengar | `shadow-ball` | `head`, open-mouth tooth center | 1.10 → 1.80 | Native jaw opens strongly from 0.983–2.267. Launch a compact orb from the mouth and detach it; chest-orbiting particles obscure the expression. |
| Alakazam | `spoon-psychic-wave` | `LFeelerA` / `RFeelerA` | 0.80 → 1.55 | Actual spoons levitate away from the hands. Two spoon-bowl emitters follow the real props. |
| Venusaur | `petal-burst` | `center_feeler`, yellow flower crown | 0.58 → 1.18 | The burst belongs at the flower during its jump/thrust flourish, not at the face. |
| Vaporeon | `water-pulse` | `head`, upper/lower lip center | 0.63 → 0.86 | Default firing at 1.665 misses the open mouth; its useful opening is 0.60–0.833. Use a short pulse. |
| Mew | `psychic-sphere` | `spine_02`, chest midpoint | 1.32 → 2.15 | The native attack tumbles in the air. A body-centered psychic pulse fits better than a mouth beam or a fixed screen-space halo. |
| Eevee | `swift-stars` | `head`, snout | 1.20 → 1.80 | Native jaw is effectively static while the forepaw flourishes. A short star volley is more specific than the current wind blades. |

### Geometry evidence

- **Mewtwo:** Palm position is measured from its three first finger joints. The palm normal is calculated from their native plane; it is not assumed to be a bone's +Z axis.
- **Lugia:** Mouth center uses all six upper/lower tooth landmarks. Forward follows the head toward its upper-front teeth. Native local scale is retained.
- **Gyarados:** The upper-jaw and tooth landmarks produce tip `[0.847187, 0.000002, 0.074033]` and forward `[1.546674, 0.000002, 0.100832]` in head space. This is a particularly strong counterexample to treating all imported bone axes as the same.
- **Alakazam:** Texture/skin inspection found 81 silver spoon vertices per side attached to `LFeelerA` / `RFeelerA`. `LFeelerD` / `RFeelerD` are different anatomy and must not be used as spoon emitters. Bowl centers use the farthest 40% of spoon vertices from their attachment bone. Offsets around 35 are correct in this rig's centimeter-scale local units; do not shrink them into world-meter units before multiplying by the bone matrix.
- **Venusaur:** All 184 yellow flower-crown vertices attach to `center_feeler`. The native centroid gives local socket `[0.433157, -0.000155, -0.013595]`, well above the joint origin itself. Using the bone origin alone would bury the effect in the flower's stem.
- Other mouth sockets are native jaw, tooth, or lip landmark averages with small explicitly documented offsets. They are practical attachment approximations, not a claim that the models contain official VFX locator nodes.

## Runtime integration notes

The new entries conform to the current `MoveRig` fields. Their `bone` keys are **lowercase**, matching `PokemonModel`'s cached pose map; `sourceBone` preserves original capitalization for auditing. The four previous entries are preserved.

The current VFX still chooses its shape using type-based `powerProfiles`. Consequently, the new `form` values require owner-side routing to achieve the named visual behavior. Metadata alone corrects origins and timings; it does not make the current `wind` branch render Aeroblast or Swift. Each new entry includes `requiresMoveFormRouting: true` to make that integration requirement explicit.

Suggested form routing:

- Directed streams: Lugia's compressed white/cyan air beam, Gyarados's blue water jet, Dragonite's bright gold/white light beam. Preserve model-space direction and foreshortening.
- Detached projectiles: Gengar's violet shadow orb and Eevee's short gold star volley. Capture origin/direction at birth; avoid dragging existing projectiles with later body motion.
- Local or directed waves: Mewtwo palm wave, Alakazam spoon wave, Mew's body sphere. Keep the actor's face readable rather than filling a large common orbit with sparks.
- Local flower burst: Venusaur petal spray, using the crown socket with brief green/pink petals. The supplied attack is a jump/thrust, so avoid inventing a long Solar Beam charge that the body animation does not support.
- Short water pulse: Vaporeon. Its `.75` playback rate lets the measured `.23` source-second emission window last `.307` wall seconds, respecting the current `.30` minimum effect duration without keeping the jet on a closed mouth.

The five models without verified attack clips should not receive these timed attack envelopes. Their idle presentation must not masquerade as a measured attack. The same distinction applies to 17 illustration fallbacks: no fake body bending or claimed skeletal motion.

## Framing and timing audit

The revised `PokemonModel` already fits idle plus 13 samples of the active attack interval and caches matrices with the rendered frame. Those changes address the earlier idle-only clipping and pose/effect cadence mismatch. This pass does **not** claim those defects remain unchanged.

New cue endpoints alter the fitted interval automatically. Owner QA should specifically check the elevated Alakazam spoons, Venusaur's jumping flower, Mew's long swinging tail, and Lugia's wing spread. Keep the fitted camera fixed during an action. For airborne Mew, Lugia, Gyarados and flying Dragonite poses, shadows should remain below the body rather than reading as planted feet.

The temporary 70-pose contact sheet (`/tmp/pokemon-power-expanded/attack-poses.png`) uses the old idle-only camera only as an anatomy comparison; its cropped extremes are **not** evidence that the revised runtime camera still crops them. Final browser rendering with the new form routing belongs to the integrating owner.

For the ten newly measured actors, 60Hz bone sampling identified release windows; it does not establish a continuous-time mathematical error bound. Existing generic attack files were not renamed to claim official move identities. Alakazam's source action explicitly contains `ba20_buturi01`, so its psychic effect remains an adaptation of that supplied action.

## Primary references

- [Official Mewtwo UNITE article](https://unite.pokemon.com/en-au/news/celebrate-pokemon-unites-2nd-anniversary-with-mega-mewtwo-x/) describes directed psychic waves for Psystrike. The held-palm selection comes from the shipped model, not that page.
- [Official Pokémon GO Lugia article](https://pokemongo.com/news/apex-reveal) identifies Aeroblast and its variants with Lugia. Beam shape/timing is an authored interpretation of the ranged clip.
- [Official Dragonite UNITE article](https://unite.pokemon.com/en-us/news/dragonite-dances-its-way-into-pokemon-unite/) describes charging and releasing a straight Hyper Beam.
- [Official Gengar Pokkén move chart](https://assets.pokemon.com/assets/cms2/pdf/video-game/pokken/Gengar_Chart_EN.pdf) lists Shadow Ball. Mouth placement is derived from this model's open-mouth action.
- [Official Alakazam Pokédex](https://sg.portal-pokemon.com/pokedex/0065/) associates its spoons with psychic powers; both actual spoon meshes were measured.
- [Official Venusaur page](https://unite.pokemon.com/en-us/pokemon/venusaur/) and [official move update](https://unite.pokemon.com/en-us/news/pokemon-unite-patch-10-27-2022/) support plant attacks and Petal Dance. The proposed flower burst is not labelled as an exact reproduction of either game animation.
- [Official Vaporeon Pokédex](https://sg.portal-pokemon.com/pokedex/0134/) and [official Gyarados Pokédex](https://www.pokemon.com/uk/pokedex/gyarados) support the water-type interpretation. The short water pulse and jet recommendations do not assert official named-move event metadata.
- [Official Mew page](https://unite.pokemon.com/en-us/pokemon/mew/) supports a floating, psychic presentation. The small sphere is an authored effect interpretation.
- [Official Espeon/Eevee article](https://unite.pokemon.com/en-us/news/espeon-unleashes-its-power-in-pokemon-unite/) specifically describes Eevee Swift as star-shaped rays. It also describes Espeon's powers, but that does not establish an attack clip in our single-clip Espeon asset.

Pinned native model URLs, source action names and current GLB SHA-256 hashes are recorded in each new cue and in the existing provenance. The distributions are [06wj/pokemon](https://github.com/06wj/pokemon) and [pokemon-party/3d-pokemon](https://github.com/pokemon-party/3d-pokemon). No replacement downloads were necessary.

## Validation

Validated all 33 mapped idle/attack names against actual GLB animation tables and preserved moving-joint statistics. Validated all 14 cue entries against actual GLB hashes, source clip durations and bone names. At seek, release, midpoint and effect-end poses, every emitter tip/forward pair transforms to finite world points with a nonzero direction. The ten additions supply 11 new emitters; original four cue entries remain structurally identical to their pre-pass values. No GPU/browser claim is made for the not-yet-routed effect forms.
