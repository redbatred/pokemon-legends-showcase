# V15 transformation artwork

Generated with OpenAI image generation from the existing Mewtwo and Lugia pose references. These are generated drawings, not hand-drawn frames or newly authored skeletal character rigs. Native Spine attachment animation plays the individual drawings.

- mewtwo-conversion.png: 4 × 4 sheet, sixteen stages of violet body-to-energy conversion.
- lugia-conversion.png: 4 × 4 sheet, sixteen stages of cyan wing/body-to-energy conversion.
- eye-sequence.png: eight Mewtwo and eight Lugia eye drawings, cropped through atlas regions.
- generation-prompts.json: generation briefs and reference paths.
- drawn-metadata.json: body alignment and stream outlet coordinates used by the renderer.

Capture plays forward; escape plays backward before blending to each live skeletal character's recovery animation. build_drawn_assets.py writes Spine JSON/atlas metadata without repainting the raster sheets. The existing thin stream atlas connects the drawn outlet to the ball mouth.
