# Pokémon rendering quality audit

Read-only asset and renderer audit, 2026-10-28. No application files, source models, rig data, browser state, or hosting state were changed. Recommendations below require visual integration review.

## Confirmed losses

1. **Normal maps are discarded.** `PokemonModel.ts` replaces every imported material with `MeshToonMaterial`, preserving color/emission but omitting `normalMap`, `normalScale`, and `normalMapType`. The shipped GLB JSON contains normal textures in **54 material slots across 18 species**, including Mewtwo, Charizard, Blastoise, Pikachu, Gengar, and the three legendary birds. Mewtwo and Charizard image statistics confirm actual blue tangent-space normal textures, not placeholder color maps. The installed Three.js toon material supports these properties. Preserve the loaded `normalScale`, including its Y sign: this version of `GLTFLoader.assignFinalMaterial()` flips the Y scale for derivative tangents.

2. **Lugia and Greninja have no geometry normals.** All seven Lugia and all ten Greninja primitives omit `NORMAL`; their source materials are `KHR_materials_unlit`. GLTFLoader sets `flatShading` when normals are missing, but the toon conversion discards that flag as well as the unlit distinction. The outline shader also assumes a normal attribute. For the intended lit presentation, call `geometry.computeVertexNormals()` only for geometries missing normals before material conversion and outline creation. This adds an attribute without modifying positions, indices, skin weights, or animation. Shared-index/UV seams may remain; inspect these two models specifically. Alternatively, preserve the source unlit materials, but that gives them a different lighting response.

3. **Outline coverage depends on names rather than geometry.** `/body/i` skips all outlines on Arceus, Breloom, Gardevoir, Genesect, Giratina, Kyogre, Raikou, Rayquaza, Rotom, Scizor, Sylveon, and Tyranitar. Their body material names include `Material #…`, `PaletteMaterial…`, and `Wing`. Use an explicit per-species silhouette policy or opaque geometry classification with eye/mouth/fire/translucent exclusions. Avoid blindly outlining every transparent layer. Keep native-normal extrusion before skinning; the existing scale-invariance test protects this important behavior.

4. **Lighting consumes highlight headroom.** The baseline is hemisphere 1.15, white key 1.65, cyan directional 0.7, plus an attack directional up to 1.65, under `NoToneMapping`. The current four-step gradient also returns nonzero irradiance for back-facing surfaces. This can reduce sculptural contrast and clip light colors during attacks. The supposed rim at `(1,-1,3)` is predominantly in front of the default camera, so it is often another fill. This is a shader/code inference, not a measured screenshot finding.

5. **The source fire response is reduced deliberately.** Charizard's material has `KHR_materials_emissive_strength` 11.4097; conversion clamps it to 1.5. Restoring 11.4 under `NoToneMapping` would clip the flame. Keep a controlled emissive treatment instead of treating the original strength as automatically correct for this stage.

## What is already preserved

- All 50 archived originals exist locally. The recorded optimization audits preserve geometry/skin data, dimensions, and decoded texture pixels. Original 33 sources were optimized mostly through animation-key reduction and lossless texture encoding; additional 17 retain source geometry/textures. There is no evidence that reverting the shipped assets improves mesh or texture quality.
- Current meshes range from **1,822 to 12,664 triangles**. Mewtwo has 9,986 and Charizard 6,000. Replacing or subdividing these meshes would introduce substantially more rig/UV work than the confirmed material fixes.
- No shipped primitive contains `COLOR_0`, and no material has an occlusion texture. Forwarding `vertexColors`/AO properties is sensible compatibility work but does not recover detail on the current collection.
- 39 models explicitly use linear magnification and trilinear minification; ten use normal glTF sampler defaults. **Breloom alone uses nearest sampling, correctly for its 32×4 palette image. Do not override every texture to linear.**
- Several older sources use 128×256/256×256 body/eye images (Espeon, Glaceon, Leafeon, Scizor, Umbreon). Their archived originals have the same image sizes. Upscaling would not add detail. The locally available HOME donors are untextured and are not drop-in higher-fidelity replacements.

## Practical implementation order

1. Restore normal-map properties, generate missing normals for Lugia/Greninja, and preserve `flatShading`/`vertexColors` deliberately. Leave rigs, clips, UVs, and source image color spaces unchanged.
2. Start lighting review at hemisphere **0.65–0.75**, key **1.5–1.65**, rear rim **0.35–0.45**, and attack light cap **0.8–1.0**. Position and target key/rim relative to the fitted model center and camera basis. Keep `NoToneMapping` initially to isolate the material/lighting change. If highlights still clip, compare `NeutralToneMapping` with exposure near 1 in a separate visual pass. These values are review starting points, not validated final art direction.
3. Retain the tested normal-extruded outline, initially width **0.0013–0.0018 × native geometry span** rather than 0.002 if added coverage makes the result heavy. Use explicit coverage/exclusions and inspect facial details, wings, and translucent meshes.
4. Keep the full entrance/attack framing envelope. Do not simply shrink the orthographic span: that can clip native attacks. The full animated envelope has 10% padding and is fitted into a square, so broad tails/wings can make the torso appear small. Increase species presentation span modestly (430 → **460–480**, while retaining `fitPresentation`) or use per-species presentation scales after comparing idle body occupancy with attack extrema. Preserve projected foot anchoring and effect projection.
5. Match rendering resolution to actual screen coverage. Current model textures are **704² normal / 384² low**; the stage separately caps renderer resolution to 1.5 and a 1.7M-pixel budget. Most 430-unit actors do not need a blanket 1024² target. A **768² normal / 512² low ceiling only when projected size warrants it**, with an **896² ceiling for the largest hero**, is a reasonable bounded experiment. Keep low-mode 24Hz and current adaptive 30/60Hz behavior until measured GPU/canvas-copy costs justify changing them. The Three canvas → 2D canvas → Pixi texture copy/upload remains an explicit per-frame cost.

The highest-confidence quality change is recovering existing normal information; asset replacement, global texture filtering changes, and indiscriminate resolution increases are not supported by this audit.

## Outline eligibility follow-up

The installed GLTFLoader creates one Three.js mesh per glTF primitive, so mixed glTF materials are separate single-material Three children today. For future material arrays, require **every** material to pass; the present `.some()` rule can ink excluded portions if a future mesh uses geometry groups. A safe default eligibility rule is: normal attribute exists; opaque; opacity at least 0.98; no alpha test; no emissive map; neither mesh nor material name matches `eye|mouth|tongue|teeth|fire|flame|glow|effect`. Do not exclude `Wing`: Scizor's main 3,104-vertex body uses that material name.

For generic source names, the following conservative exclusions keep small facial layers uninked. Raw skin-weight inspection confirms the listed small parts are head/jaw weighted except Rotom's whole-body waist rig. These exclusions are presentation choices, not source semantic labels:

| Species | Exclude additional source materials |
| --- | --- |
| Arceus | `Material #23` |
| Breloom | `PaletteMaterial002`, `PaletteMaterial003` |
| Gardevoir | `Material #61`, `Material #64` |
| Genesect | `Material #257`; also omit `Material #258` drive cartridges conservatively |
| Giratina | `Material #218` |
| Kyogre | `Material_35`; its three `Kyogre_Glow` meshes are already excluded by BLEND |
| Raikou | `Material #27` |
| Rayquaza | `Material #35` |
| Rotom | `Material #11` |
| Sylveon | `Material #10`, `Material #12` |
| Tyranitar | `Material #218` |

Avoid a generic vertex-count threshold: Rotom's 52-vertex bottom is a legitimate silhouette part using the same body material as its larger body, arms, and tail. Evaluate eligibility against original material names or preserve `mat.name` during toon conversion.
