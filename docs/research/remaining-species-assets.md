# Remaining species animated assets

The 17 artwork species absent from the original 33-model manifest now have textured, skinned GLBs with authored skeletal motion. All three `ensemble_*` clips are newly authored for this project. They are not native game animation clips.

## Source audit

The pinned [06wj animated gallery](https://github.com/06wj/pokemon/tree/00d96f7f18894055e7f1db44fa0df6462e5e4c8a) only supplies species 1–151. All 17 missing species lie outside that set.

All 17 regular GLBs and ten relevant alternate forms from [pokemon-party/3d-pokemon](https://github.com/pokemon-party/3d-pokemon/tree/429de1288cea0d43f5b4f56305d2276e94239d65) were downloaded and inspected. They contain zero animation clips. Twelve regular models retain usable source skeletons. Breloom, Cinderace, Cleffa, Forretress, and Suicune have no source skin in that collection.

Those five use anatomical skeletons and skin weights from the corresponding [Pokémon HOME GLBs](https://github.com/Lilothestitch16/Pokemon-HOME-GLB-Models/tree/27703273836f38f0e185976d955b1fbfb15448af). The HOME exports have rigs but no textures; the implementation therefore preserves the textured pokemon-party mesh and transfers the HOME skin in matched rest space. Each vertex blends the eight nearest donor surface samples, keeps the four strongest bone weights, and normalizes them. This is an authored rig transfer, not an untouched native skin. The original geometry positions, normals, UVs, indices, and encoded source textures remain identical.

Breloom's source is a fan-art model with a tilted presentation, local Z-up coordinates, and world units thousands of times larger than the other sources. A static parent transform restores +Y up/+Z forward and a 1.4-unit height before the rig transfer. Original mesh buffers and original node transforms remain unchanged below that wrapper.

## Animation contract

- `ensemble_idle`: 2.4 seconds, eased breathing/head motion and secondary tails, ears, mane, fins, or ribbons.
- `ensemble_enter`: 0.72 seconds at speed 1, anatomical brace/settle using joints.
- `ensemble_attack`: 2 seconds at speed 1, species-specific windup, release and recovery.
- Charge ends at 0.76 seconds, sustained emission ends at 1.35, effect tail ends at 1.50, and recovery finishes at 2.00.
- Entrance end, idle start, attack start and attack end share the same authored rest pose within measured floating-point tolerance.
- Animation uses actual source joints, not image bending, morph target warping, or animated whole-model transforms.

Cinderace lifts its right thigh, folds its knee and strikes with its foot. Kyogre flares its pectoral fins and opens its jaw. Forretress opens upper/lower shell joints independently and braces its four cannon appendages. Gardevoir raises both arms from a lowered rest pose. Giratina braces six legs and moves its neck and wing tendrils. Rayquaza carries a curved tail wave with neck/jaw release. The JSON records each species' authored motion description.

## Delivered assets

| Species | Rig | Moving attack joints | GLB bytes |
| --- | --- | ---: | ---: |
| Arceus | Original source rig | 18 | 466,264 |
| Breloom | Transferred HOME rig | 17 | 538,784 |
| Cinderace | Transferred HOME rig | 44 | 900,332 |
| Cleffa | Transferred HOME rig | 10 | 145,272 |
| Forretress | Transferred HOME rig | 28 | 284,300 |
| Gardevoir | Original source rig | 20 | 454,232 |
| Genesect | Original source rig | 13 | 432,784 |
| Giratina | Original source rig | 81 | 857,988 |
| Kyogre | Original source rig | 12 | 546,396 |
| Paldean Clodsire | Original source rig | 21 | 443,704 |
| Raikou | Original source rig | 36 | 553,488 |
| Rayquaza | Original source rig | 25 | 447,344 |
| Rotom | Original source rig | 13 | 211,028 |
| Suicune | Transferred HOME rig | 71 | 962,580 |
| Sylveon | Original source rig | 56 | 612,324 |
| Trevenant | Original source rig | 20 | 624,376 |
| Tyranitar | Original source rig | 18 | 450,112 |

All 17 GLBs total **8,931,308 bytes**. The files are under `public/assets/pokemon-3d/`; this task did not edit the shared manifests. The integrator receives `remaining-species-assets.json` with `manifest`, `provenance`, and `powerCues` fragments.

## Validation and limitations

`verify-remaining-species.mjs` reopened all 17 outputs with glTF-Transform, compared geometry buffer hashes and exact encoded texture hashes to the acquired sources, checked moving skeletal channels, and evaluated 19 CPU-skinned poses per species across idle, entrance, windup, release and recovery. All sampled bounds are finite, and every attack produces measurable vertex motion. Endpoint vertex RMS differs from idle by less than 1e-6 of the maximum model dimension.

Effect attachment points are measured from weighted source mesh vertices at the release pose and transformed into named bone-local coordinates. Forretress follows native cannon axes; other forward vectors are authored toward +Z at release and subsequently follow the animated joint. These are geometric effect sockets and authored timings, not official move-event metadata. Runtime must capture projectile origins only at release when `attachment` is `capture-at-release`.

The [CPU pose contact sheet](remaining-species-poses.png) was inspected for all 17 species, with an additional pass on the five rig transfers and Breloom after orientation correction. The renderer is an approximate software projection; it does not validate browser shader transparency, all continuous-time intersections, or final stage camera/effect presentation. Browser integration remains the Site owner's verification step.

Source URL, pinned revision, source SHA-256, output SHA-256, source clip list (empty), authorship, rig-transfer method, calibrated sockets, and per-pose bounds are preserved in the JSON. Acquired sources are gitignored under `source-assets/pokemon-3d-remaining/`.

## Reproduction

Use an existing tools directory containing glTF-Transform 4.3.0 and draco3dgltf 1.5.7, plus the workspace Three.js package:

```sh
POKEMON_ASSET_TOOLS=/tmp/pokemon-gltf-opt-tools node scripts/prepare-remaining-species.mjs
POKEMON_ASSET_TOOLS=/tmp/pokemon-gltf-opt-tools node scripts/verify-remaining-species.mjs
```

The preparation step replaces only these 17 GLBs and their research fragment. The verification step fills bounds, sockets and checks in that fragment. Source acquisition JSON and pinned binary downloads are required in the gitignored source directory.
