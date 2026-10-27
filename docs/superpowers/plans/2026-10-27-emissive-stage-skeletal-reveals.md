# Emissive stage and skeletal reveals

The user rejected colored stage paint, white orbiting drops, a flat bending Pokémon illustration, and the ball's eased float. Keep the current canvas UI, art, demo saves and 2.5D presentation.

- Illuminate the entire white Poké Ball emblem, with near-white cores, wider colored bloom, a feathered upward light volume, and light reflected on the lower card. Preserve chassis/shadow color. Lower arena ambient exposure during anticipation so emitted light is readable.
- Replace idle reveal particles with finite, cue-driven cel effects: rising tapered strokes, a single radial impact fan and short lightning-like accents, followed by a foil edge glint. Reduced motion omits the transient effects.
- Project a parabolic throw through depth. After card contact, carry the ball downward under gravity, lose energy on one rebound, then open a hemisphere around its rear hinge. Use depth-sorted lid frames in Spine so the inner shell becomes visible.
- Use genuine skinned GLB models and their recorded clips. A deferred Three renderer produces a transparent portrait for the existing Pixi scene, at 30 portrait frames/sec and reduced resolution in low quality. Toon materials and outline shells match the illustrated arena. Spine continues to own the ball and stage rig.
- Attach powers to projected animated head/jaw/torso bones, including suffixed/capitalized names. Charizard's sampled jaw motion determines its power timing. Other mapped attacks use clip-relative timing.
- Asset coverage: 33 genuinely animated models, 28 with mapped attacks and 5 with one display animation. The 17 without available motion retain intact illustration artwork; do not stretch the art or claim unsupported anatomy. Provenance and known limitations are recorded with the assets.
- Bound GPU use to a shared renderer; release unique geometries, materials, textures and skeleton bone textures. Invalidate late loads on teardown and let active Draco decoding finish before releasing workers.
- Verify physical path endpoints/rebound, light selection and cleanup lifecycles, inspect the actual desktop/mobile canvas, audit the nine alternate models visually, then publish the same owner-private Site.
