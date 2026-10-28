# Foil tear and extraction direction

Research/inspection: 2026-10-28. Source inspected: `src/game/Stage.ts`, `src/game/CanvasScene.ts`, `src/game/packTexture.ts`, and the existing `public/assets/pack.webp`. No app implementation changed. The choreography below is an art-directed approximation, not a material simulation. No real booster-opening video was watched; do not describe it as motion captured or matched to filmed Pokémon packaging.

## Physical evidence to preserve

Aluminium/polymer laminate fracture experiments show deformation concentrated ahead of the crack tip, with thinning preceding failure. This supports a localized pinch/crease and a moving fracture front, rather than uniform elastic stretching of the wrapper. The study concerns packaging laminates, not a verified Pokémon wrapper composition. [Ståhle, Andreasson, Kao-Walter: Fracture of a Thin Laminated Foil, 2014](https://lucris.lub.lu.se/ws/portalfiles/portal/67249876/Manus_ECF20v2.pdf).

Tetra Pak researchers identify large deformation, geometry, adhesion and progressive damage as essential to credible opening simulation; their models were compared against recorded physical openings. Use that as the reason to preserve attached material and the opening silhouette. It does not prescribe the timings below. [Andreasson and Jönsson: Advancements in package opening simulations, 2014](https://bth.diva-portal.org/smash/get/diva2%3A834129/FULLTEXT01.pdf).

A flexible-packaging patent explicitly separates a tear-initiation area from subsequent directional propagation. Its scored film is not evidence that Pokémon boosters have a scored seam. The useful visual distinction is resistance before initiation, then a travelling tear. [US7862869B2, description around lines 250–263](https://patents.google.com/patent/US7862869B2/en).

## Current breaks in continuity

- `Stage.ts:321`: the whole `topGroup` starts moving at 0.25 s while the crack is only just starting. Unbroken material separates across the entire width. Keep unfractured top/body seam vertices coincident until the crack reaches them.
- `Stage.ts:248–254`: the angled `PerspectiveMesh` becomes two flat planes immediately. Seed both planes from the same captured projection/pose, or smoothly neutralize the pack before switching.
- `Stage.ts:288`: deterministic alternating jaggedness is applied along the whole edge as `rip` grows. Store one shared irregular cut profile and expose it only behind the crack tip. A few unequal kinks read better than repeated saw teeth.
- `Stage.ts:323–332`: strip disappearance, wrapper drop, stadium arrival, and stack enlargement overlap. This weakens the causal order. Keep the wrapper visible until the rigid stack clears it; begin travel afterward.
- The mouth is a silver polygon plus a dark stroke. Add a distinct back lip, dark cavity, front lip and small contact shadows so the card passes *between* surfaces.

## Recommended 2.6-second sequence

Times and distances are proposed starting values in the existing 230×421 pack coordinates.

| Time | Visible action | Implementation constraint |
| --- | --- | --- |
| 0.00–0.24 s | Top-left pinch draws out 5–9 px; opposite shoulder holds. Two diagonal creases converge on the pinch. Pack body moves 2–3 px in reaction. | No gap yet. Deformation decays into the upper 60–90 px. Preserve lower artwork proportions. |
| 0.24–0.36 s | A small 8–15 px split pops at the corner; torn underside catches a narrow silver highlight. | Distinct initiation sound/event. The rest of the seam remains closed. |
| 0.36–0.90 s | Crack advances left to right, briefly resisting around 35%, then finishing briskly. Torn strip rolls up and left *behind* the crack. | Unbroken columns share identical boundary positions. Use a localized deformation envelope near the tip. Keep the final 8–12 px attached as a hinge. |
| 0.90–1.16 s | Attached strip curls backward; the front lip bows down 15–24 px and the rear lip lifts 4–8 px, exposing a shallow dark mouth. | Side seams remain joined. Silver appears on the rolled inner surface and broken edge, not as a flat grey rectangle. |
| 1.10–1.78 s | Rigid card stack rises 65–85 px as wrapper slides down 230–260 px. First a thin top edge, then the card back, then its lower corners clear the lip. | Stack scale stays fixed at its packed size. Front wrapper occludes it until physically clear. Give stacked edges 0.5–1 px offsets and only slight fanning. |
| 1.78–2.60 s | Empty wrapper, still carrying its curled flap, crumples and falls. The same stack travels toward the stadium and grows through the camera move, then settles. | Trigger `scene.arrive()` on clearance. Match final stack pose to the first reveal card without alpha swapping or a position snap. |

## Mesh and shading approach

Keep the existing Pixi/GSAP stack. The current 33-column meshes are enough; adding a physics engine or new raster asset is unnecessary.

Use a shared seam function `edge(u)` and crack progress `tip`. For `u > tip`, both material halves use the same boundary point. For `u < tip`, increase separation with distance behind the tip. Keep both meshes in one local space during tearing; do not translate an entire half until it is detached. A retained corner hinge prevents the flap reading as an independent flying sticker.

Model the curled strip with 5–8 rows along its bend and a cylindrical cross-section. Compute front/back-facing sections from the local bend angle. Draw the printed texture on the outer face and a subdued metalized inner face with narrow, moving highlights on the reverse. The existing pack image already contains strong photographed highlights; keep additional shading restrained and tied to fold orientation.

Render order around the mouth: rear shell/back lip → dark cavity → rigid cards → front shell/front lip → curled strip and edge glint. Keep the card's lower edge occluded through extraction instead of fading the stack in. A thin shadow follows the front lip onto the card and shrinks as clearance increases.

Drive audio from the same phase/progress values: muted crinkle during tension, short onset snap, irregular ripping ticks while the tip advances, soft wrapper crackle as it collapses, then a light card-slide/settle. Do not run a continuous rip after the crack stops.

## Visual acceptance checks

Inspect freeze frames at 10%, 35%, 65%, 90% and full clearance: the unbroken seam must stay closed; silver must belong to a turning surface; the cards must remain rigid and constant-sized inside the wrapper; the front lip must occlude cards correctly; and the final travelling stack must become the reveal stack in the same pose. Check tilted starts and portrait layout. Reduced motion should preserve these states with short transitions, without camera travel or recoil.
