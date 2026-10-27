# Stadium crowd plates

Created 2026-10-28 for the existing stadium background. Source baseline supplied by the parent task: `b6bab0`.

## Assets and generation mode

The two assets were produced with the built-in `image_gen.imagegen` tool in edit mode, using `referenced_image_paths` and `transparent_background: false`. No CLI/API fallback was used. Both generated PNGs were copied byte-for-byte into the project; no resizing, repainting, alpha processing, compositing, or other image editing was applied after generation.

| Role | Project path | Dimensions |
| --- | --- | --- |
| Source stadium | `public/assets/stage/pokemon-anime-arena-v2.png` | 1672 × 941 |
| Anticipating pose, frame A | `public/assets/stage/crowd-v1/anticipating.png` | 1672 × 941 |
| Celebrating pose, frame B | `public/assets/stage/crowd-v1/celebrating.png` | 1672 × 941 |

Frame A used the source stadium as its edit target. Frame B used the generated frame A as its edit target. The source image was inspected using `view_image` before editing; both generated tool outputs were inspected visually inline.

## Tool output references

- Frame A tool output: `/Users/redjonmezani/.codex/generated_images/01a17fa3-bead-7430-b4c8-88a8998870a9/exec-30b0795b-a8eb-47f9-9779-2bf5c8f0a79c.png`
- Frame B tool output: `/Users/redjonmezani/.codex/generated_images/01a17fa3-bead-7430-b4c8-88a8998870a9/exec-3c352090-9b45-4cbd-9c68-df11d3b36091.png`
- Project root: `/Users/redjonmezani/Documents/TRANSSIB/Pokémon Legends`

SHA-256:

```text
78858671db2a7de8ad07c44742849fb4a1eba5050a1eb02664123c6851842969  pokemon-anime-arena-v2.png
ea0ba15ac76745bcfc3f9e21fd261ab403e4af219308023c217d80e71e97454c  anticipating.png
0a1d8d6966daa1fc8a8d4204038d1b74a641de1d9c45e88726e76361b6ca10d7  celebrating.png
```

## Exact frame A prompt

```text
Use case: precise-object-edit
Asset type: a single static full-frame game background plate, frame A of a matching two-pose anime stadium crowd.
Input image: the supplied 1672 × 941 PNG is the exact edit target, not just an inspiration.
Primary request: Fill all of the existing blue stadium seating sections with a dense audience of small human anime spectators in a quiet, anticipatory held pose, attentively watching the empty arena. Each person is seated in an existing seat. Add only these spectators.
Style/medium: polished hand-painted Pokémon television-anime stadium background, clean fine ink contours, restrained cel shadows, painterly environment, bright summer daylight. Match the supplied image faithfully.
Composition/framing: preserve exactly the original 16:9 panoramic view, original camera height, focal length, horizon, perspective, framing and every stadium edge. The crowd occupies ONLY the curved blue seating band: closest figures at the far left and far right are still very small; figures recede to tiny heads and shoulders toward the central far stand. Keep scale believable for this very wide distant stadium shot. The six stair aisles remain empty and legible.
Spectators: many distinct tiny human heads and clothed upper bodies, plausible orderly seated rows, varied skin tones, natural black/brown/blond hair, modest varied shirts in restrained reds, blues, greens, yellows and creams. Balanced visual diversity, no single focal character. Most arms lowered or resting, naturally varied quiet attentive poses. Face details only where scale supports them.
Strict invariants: retain the original stadium architecture, seating geometry, aisles, railings, walls, doors, existing Poké Ball wall emblems, light towers, trees, mountains, sky, clouds, arena surface, white floor markings, lighting, color and image registration exactly. Everything outside the seat rows is unchanged. Keep the entire arena floor clear and unchanged. Preserve the original aspect ratio and use the source's 1672 × 941 dimensions if possible.
Avoid: Pokémon or other creatures; people on the arena floor; enlarged foreground people; empty crowd sections; banners, flags, new symbols, text, logos or watermarks; photorealism, 3D rendering, blurry noise-like crowds, exaggerated gestures, celebratory raised hands; camera movement or crop.
```

## Exact frame B prompt

```text
Use case: precise-object-edit
Asset type: frame B of a two-frame hand-painted anime stadium crowd animation; one full-frame background plate.
Input image: the supplied anticipating crowd stadium image is the exact frame A edit target.
Primary request: Change ONLY the poses of the existing tiny seated human spectators from quietly anticipating to a joyful cheering held pose. Lift their arms in celebration. Use two-arm and one-arm cheers across the crowd, with naturally varied small hand and forearm positions. This is a crisp still anime animation frame, no motion blur.
Strict continuity: retain the SAME individual spectators, SAME head positions, SAME hair colors, SAME skin colors, SAME shirt colors and SAME seat locations as frame A. Do not regenerate a different crowd. Their faces can show tiny happy expressions. Keep their torsos, seating and silhouettes anchored in their original rows. Raised arms remain proportionate and small, consistent with these distant figures. Maintain empty stair aisles and rails.
Style/medium: exact same polished painted Pokémon anime background and fine cel-shaded human crowd as frame A. Same clear daylight and color treatment.
Camera and composition: pixel-registered to the supplied frame A; no camera shift, resizing, crop, zoom, new perspective or changed horizon. Original wide 1672 × 941 dimensions and aspect ratio, if possible.
Preserve exactly: all stadium geometry, architecture, seats, aisle steps, rails, walls, doors, original Poké Ball wall emblems, floodlights, trees, mountains, sky, cloud shapes, arena surface and white court markings. The floor stays completely empty. Pixels outside the crowd must remain unchanged.
Avoid: new or removed spectators; different crowd clothing palettes; oversized hands or people; people on the floor; Pokémon or creatures; banners, flags, text, new logos, symbols, watermarks; moving or redrawing the stadium or environment; motion blur.
```

## Visual verification and limitations

Both plates retain the source's exact dimensions and wide camera composition. The crowd fills the curved seating sections with many small distinct human heads and clothed bodies, receding toward the middle stand. The stair aisles remain clear. Frame A uses predominantly lowered arms; frame B visibly raises arms throughout the crowd. The empty arena floor, wall emblems, stadium silhouette, mountains, sky and floodlight positions are visually consistent. No added Pokémon, banner, text, or oversized foreground spectator is visible.

These are generative plates, not guaranteed pixel-identical animation cels. Although the prompt requests identical spectator identities and unmodified non-crowd pixels, subtle crowd-detail and painted-background texture differences remain. Tiny hand/head/clothing details can vary between poses; per-person identity has not been verified. The architecture aligns visually but pixel-perfect registration has not been proven. The intended integration should keep the original stadium background fixed and reveal these plates only within the seating strips, with aisles and solid architecture excluded. Do not alternate the full opaque backgrounds at runtime, because unrelated texture changes could shimmer.

Verification used `sips` for dimensions, SHA-256 hashes and byte comparisons against the original generated outputs. A read-only attempt to calculate regional pixel-difference statistics using Python was unavailable because Pillow is not installed; no dependencies were installed and no numerical pixel-equality claim is made. This task made no app, Git, Sites, or publishing changes.

