# Crowd cheer frames v2

Created 2026-10-28 for the stadium crowd's continuing cheer loop. Source implementation baseline supplied by the parent task: `124c01d4b59923367f034dbf7b346e22f8ac0c36`.

## Assets and provenance

Exactly two additional held-pose plates were generated using the built-in `image_gen.imagegen` tool in edit mode, one call per asset. No CLI/API fallback was used. Both calls used `transparent_background: false` and the same two reference paths:

1. Exact edit target: `public/assets/stage/crowd-v1/celebrating.png`
2. Supporting crowd continuity reference: `public/assets/stage/crowd-v1/anticipating.png`

Both local inputs were inspected using `view_image` before generation. Both final tool outputs were visually inspected inline. The tool-output PNGs were copied byte-for-byte into the project. No resizing, repainting, alpha processing, compositing or other post-generation image edit was performed.

| Pose | Project asset | Actual dimensions |
| --- | --- | --- |
| Bent-arm clapping cheer | `public/assets/stage/crowd-v2/cheer-clap.png` | **1671 × 941** |
| Diagonal waving cheer | `public/assets/stage/crowd-v2/cheer-wave.png` | 1672 × 941 |

The requested size for both was 1672 × 941. The built-in tool returned the clap plate one pixel narrower than requested. This original output is intentionally retained without postediting. The wave plate matches the requested dimensions exactly.

Original tool outputs:

- Clap: `/Users/redjonmezani/.codex/generated_images/01a17fcf-6b4b-7393-9f6e-d2b6d13c425f/exec-d53330aa-1ed0-41ae-8fa4-d5c2790260db.png`
- Wave: `/Users/redjonmezani/.codex/generated_images/01a17fcf-6b4b-7393-9f6e-d2b6d13c425f/exec-2a078da8-26be-49b5-8f94-003a1d1c4713.png`

Project root: `/Users/redjonmezani/Documents/TRANSSIB/Pokémon Legends`.

SHA-256:

```text
8e63896bf4d6bbfe6b4cc9e1d456bc0b950856732d93eb6f7c9a7a8c9527a412  cheer-clap.png
a751d88b549049d8f48b78a385915024a31039135c48e16dfa365fe8bfcbbb63  cheer-wave.png
```

## Exact clap prompt

```text
Use case: precise-object-edit
Asset type: one full-frame held-pose cel for a looping anime stadium crowd animation, CHEER CLAP variant.
Input images: Image 1 is the exact edit target (celebrating.png); Image 2 is the same crowd in its anticipating pose, only a supporting continuity reference.
Primary request: Change ONLY the arm/hand poses of the existing tiny human spectators in Image 1 into a joyful clapping cheer pose. Most arms are now bent at the elbows with hands brought together near chest, face or just above head height; a minority keep one bent fist lifted. Make this a clearly different held pose from Image 1's many straight raised arms while preserving the crowd itself. Crisp still animation frame, no motion blur.
Strict continuity: retain the SAME crowd people, head positions, hair colors, skin colors, shirt colors, tiny scale, seated torso anchors and seat locations as Image 1. Keep each person proportionate to these very distant rows. Do not replace or redesign the crowd. Keep all stair aisles empty and railings visible. Only forearms and hands change position.
Style: exact same polished hand-painted Pokémon television-anime stadium background, tiny cel-shaded human audience, fine ink lines and bright summer daylight.
Camera and composition: pixel-registered to Image 1, exactly its 1672 × 941 canvas and panoramic view; preserve all geometry, horizon, camera height, scale, perspective, framing and edges without crop or zoom.
Preserve unchanged: stadium architecture, seating geometry, aisle steps, railings, walls, doors, existing Poké Ball wall emblems, light towers, trees, mountains, sky, clouds, arena surface, white court lines, lighting and color. Everything outside crowd bodies stays fixed. Arena floor stays completely empty.
Avoid: Pokémon or creatures, new/removed spectators, changed clothing/head positions, oversized hands, enlarged foreground people, banners, flags, added symbols, text, logos, watermark, motion blur, new background, camera movement.
```

## Exact wave prompt

```text
Use case: precise-object-edit
Asset type: one full-frame held-pose cel for a looping anime stadium crowd animation, CHEER WAVE variant.
Input images: Image 1 is the exact edit target (celebrating.png); Image 2 is the same crowd in its anticipating pose, only a supporting continuity reference.
Primary request: Change ONLY the arm/hand cheer poses of the existing tiny human spectators in Image 1 into an alternate exuberant waving held pose. Their arms swing diagonally toward the opposite side compared with their existing cheers: many bent forearms lean toward screen-left, while scattered others lift one open hand or wave toward screen-right. Add only a very slight opposite shoulder lean with heads still anchored to their exact existing positions. Distinct relaxed waving silhouettes with proportionate tiny hands, no motion blur.
Strict continuity: retain the SAME spectators, SAME head positions, SAME hair colors, SAME skin colors, SAME shirt colors, SAME seated torso anchors and SAME seat positions as Image 1. Do not replace the crowd. Crowd scale stays exactly as small and distant as the source image, receding to tiny heads toward the central stand. Keep all stair aisles empty and railings visible.
Style: exact same polished hand-painted Pokémon television-anime stadium background, tiny cel-shaded human audience, fine ink lines and bright summer daylight.
Camera and composition: pixel-registered to Image 1, exactly its 1672 × 941 canvas and panoramic view; preserve all geometry, horizon, camera height, scale, perspective, framing and edges without crop or zoom.
Preserve unchanged: all stadium architecture, seat rows, steps, rails, walls, doors, existing Poké Ball wall emblems, light towers, trees, mountains, sky, clouds, arena surface, white court markings, lighting and color. Everything outside crowd bodies stays fixed. Floor completely empty.
Avoid: Pokémon or creatures, new/removed spectators, changed clothing or moved heads, oversized hands, enlarged foreground people, banners, flags, added symbols, text, logos, watermarks, motion blur, new background, camera movement.
```

## Visual assessment and limitations

The two plates retain the original panoramic composition, curved crowded seating band, small distant human proportions, empty stair aisles, blue walls, floodlights, mountain and cloud arrangement, and empty arena floor. The clap plate visibly reduces many straight-arm cheers into bent-arm gestures, especially in the nearer left and right seating blocks. The wave plate uses diagonal raised-arm shapes and varied arm directions. At far-stand scale, hands are too small for individual claps or waves to be unambiguous. No added Pokémon, foreground spectator, banner, flag, text or watermark is visible.

These are generative pose variants rather than mechanically registered animation cels. Individual hair, face, hand and clothing details can vary. Per-person identity and exact head positions are not guaranteed or exhaustively verified. Painted background texture differences can also remain, even though the prompts explicitly required invariance. The clap output's one-pixel width discrepancy additionally precludes a claim of exact source pixel registration.

Use both plates only inside the existing crowd seating clips while retaining the fixed stadium background, with aisle and architecture masking unchanged. Matching their rendered box size absorbs the one-pixel intrinsic width discrepancy for display, but it does not make the source pixels identical. Avoid alternating the whole opaque backgrounds because unrelated scene textures could shimmer.

Verification used `sips` for actual pixel dimensions, `shasum -a 256` for hashes and successful `cmp` checks against both original tool outputs. No numerical pixel-difference comparison or animation playback validation was performed in this bounded asset task. Only these two PNG assets and this provenance document were added; no app/code, Git, native Sites or browser operation was performed.

