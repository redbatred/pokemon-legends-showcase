# Living stadium v3 artwork

Generated with OpenAI built-in `image_gen` using `../pokemon-anime-arena-v2.png` as a style and palette reference. Original generated PNGs were copied unmodified into this directory. The base stadium artwork was not edited.

## Assets and inspection

- `trees-atlas.png`: 1536 × 1024 RGBA; five clusters in a three-over-two arrangement; 2,563,538 bytes.
- `clouds-atlas.png`: 1536 × 1024 RGBA; four cloud banks in a two-by-two arrangement; 1,696,274 bytes.
- `atlas-regions.json`: measured content bounds and disjoint extraction cells for runtime use.

The leaf clusters match the base's bright lime/olive highlights, medium green and cool teal-blue shadows, softly painted anime detail, and daylight. Clouds match its white sunlit tops and pale blue undersides. There are no characters, text, stadium elements, or orange accents in these new layers. Generated full tree silhouettes include a little more visible branching than requested; hide the bottom behind the stadium as intended.

Read-only PNG alpha inspection verified genuine transparency: 672,214 tree-atlas pixels and 891,595 cloud-atlas pixels are fully transparent. Both outputs retain faint colored haze at low alpha around the main silhouettes. Exact content bounds in the manifest use alpha >=32 to exclude that haze. Runtime extraction should remove or smoothly suppress low-alpha haze and preserve antialiased object edges. The tree gutters are narrower than requested (16px / 9px on the upper row, 2px on the lower row at alpha 32), so use the disjoint extraction cells; do not add padding across a neighbor. The artwork itself is usable without a new generation pass.

Native output is 1536 × 1024 despite the requested higher resolution. No local image editing, cropping, masking, downloading, or source-code changes were performed.

## Sources

- Trees: `/Users/redjonmezani/.codex/generated_images/01a17d94-ea43-7850-8cb9-3439947e7242/exec-4e3f964f-33d0-45d6-a8ad-d7bb1ae9680d.png`
- Clouds: `/Users/redjonmezani/.codex/generated_images/01a17d94-ea43-7850-8cb9-3439947e7242/exec-e925df51-0cab-442c-8cfe-28de61f4b334.png`

## Exact tree prompt

Use case: stylized-concept. Asset type: high-resolution transparent animation atlas, five separate illustrated tree canopy clusters for a Pokémon TV-anime stadium background.
INPUT IMAGE 1 IS STYLE AND PALETTE REFERENCE ONLY. Do not reproduce or change the stadium image. Create a NEW transparent asset sheet containing ONLY FIVE standalone deciduous leafy tree clusters, all visible and entirely separate. Match the original background trees' exact anime-painting language: delicate softly painted little leaf clumps, irregular natural edge shapes, lime-yellow-green highlights, olive and medium leaf green midtones, cool teal/blue-green shadow patches with no black areas, soft atmospheric foliage detail and restrained broken dark-green edge accents. Focus and finish must match the reference's trees immediately behind the stadium, not hyper-sharp foreground botanical illustration. Bright clear daylight from upper left. Slightly more resolved foliage detail but identical palette, painting technique, contrast, and soft hand-painted linework.
Composition: a clean two-row atlas on a 3:2 landscape canvas, ideally 2048x1365 or greater. EXACTLY THREE separate clusters in the top row and EXACTLY TWO separate clusters in the bottom row. Provide generous fully transparent gutters between every cluster, and at least 5% transparent canvas margins on every edge. Use each cell generously while preserving separation. Each tree cluster consists of one broad leafy crown or 2-3 overlapping crowns as a single coherent silhouette; vary the five silhouettes so each is natural and distinctive: rounded and compact; taller narrow with rounded peaks; wide gently asymmetric; multi-crown with rising right edge; gently spreading dome. No fir/conifer shapes. Show only SHORT small stems at the bottom because lower tree portions will be hidden behind the stadium. No long trunks, no ground, no grass strip, no cast ground shadows.
Actual transparent alpha background, including gaps inside foliage where appropriate. No sky, no stadium, no mountains, no scene, no opaque rectangular background, no checkerboard texture, no labels, no numbers, no text, no watermark. No people, no Pokémon, no objects, no orange or autumn foliage. Do not add dramatic lighting, thick black outlines, photographic texture, realistic 3D rendering, neon foliage, or dark black shadows. Hand-painted high-quality production animation art matching the supplied reference.

## Exact cloud prompt

Use case: stylized-concept. Asset type: high-resolution transparent animation atlas of four separate wide cumulus cloud banks for a Pokémon TV-anime stadium sky.
INPUT IMAGE 1 IS STYLE, COLOR, AND FOCUS REFERENCE ONLY. Do not reproduce or modify the stadium image. Make a NEW transparent asset sheet containing ONLY FOUR isolated cloud banks, EXACTLY TWO in the top row and TWO in the bottom row. Each cloud bank should be a complete wide horizontal cloud group with its own distinctive silhouette. Keep generous fully transparent gutters between every cloud bank and generous transparent margins at all canvas edges. Landscape canvas approximately 3:2, ideally 2048x1365 or higher. Each individual bank is much wider than tall and remains fully visible with no cropping.
Precisely match the beautiful hand-painted clouds in the supplied reference: softly brushed classic Pokémon television-anime production background painting, brilliant cool-white sunlit billows on top, very pale blue and subtle pale lavender undersides, clear rounded cumulus forms with small soft organic scallops and modest watercolor-like internal brush transitions. Bright clear daytime lighting from upper left. High quality refined individual cloud forms, not airbrushed blurry blobs. The same apparent painted focus as the reference sky, with gentle edge softness but legible shape. Vary density and silhouette: one broad tall billowing bank; one long low loose bank with a few small disconnected puffs belonging to that bank; one medium group with tall peak at left; one airy broad group with high peak at right. Distinct silhouette for each, naturally irregular, consistent scale and rendering style.
Genuine transparent alpha around the clouds with delicate semitransparent feathering at some thin edges. No blue sky rectangle and no colored backdrop. Undersides remain pale and luminous, not dark gray. No ground, no mountains, no stadium, no trees, no scene, no text, no labels, no numbers, no checkerboard pattern, no watermark, no objects, no people, no Pokémon, no orange. No photographic rendering, no 3D rendering, no vector outline, no thick dark contour, no generic blur. Finished matching anime cloud sprites only.

