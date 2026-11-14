# V11 anime battle artwork

Original raster artwork was created with the built-in image_gen tool, then copied unchanged into this directory. Exact generation and cleanup prompts are in `prompts.json`. These are generated assets, not claims of hand-drawn production cels.

- `cave.png` / `portrait.png`: matte cel-style cave compositions.
- `jet.png`: continuous white/yellow/orange flame jet.
- `psychic.png`: isolated ward, ribbon, summon, impact, fire bloom and glint regions.
- `support.png`: water ripples, a suspended rock, Poké Ball and speed lines.
- `reward.png`: restrained card reveal rays with a transparent opening.
- `shadow.png`: reused V10 contact shadow.
- `vault.atlas`: metadata selecting existing pixels, including alpha-trimmed regions.
- `vault.json`: external Spine4.2 meshes and native animation timelines.

The generator authors geometry/timelines only, never image pixels. Active battle/background effects use external raster art through Spine. Solid Sprite panels and native Text form the Poké Ball transition UI. Existing Pokémon use their native skeletal3D rigs.
