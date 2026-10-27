# Arena controls and reveal polish

Implement the user's requested refinement in the existing Pixi canvas. Preserve saves, demo accounting, guaranteed special previews, pack selection, Spine assets and reduced-motion settings.

- Give the platform explicit perspective and bounding geometry. Reserve its front edge, rather than placing rewards over the stage. Put reveal information and game-shaped actions to the sides on wide screens; use a single reward/action row below the arena on phones. Move utility controls into compact pairs/rows away from the hero.
- Use a carved/capsule Open action, circular chevron Next control, and a smaller card-stack Reveal All control, with press/hover feedback and consistent accessibility targets. No prices duplicated on Open.
- Restore platform depth at moderate perspective; isolate the central Poké Ball ring as an emissive mask, keep chassis/shadows unchanged, and project softer light upward from that center. Remove floor ripple effects. Neutralize only the original emitter paint so center and strip lighting can visibly charge from dim to bright.
- Add bounded, rarity-aware card reveal effects: edge sweep, directional flecks and a larger starburst for special cards. Clean up effects before the next reveal and respect pause/reduced/low settings.
- Enlarge the card's local puncture, add irregular fibers/flaps, a pressure ring and debris; retain connected card borders/text. Refine the ball's approach, deceleration, latch glow, hinge and exit.
- Special cards get 1.3 seconds of rising colored light and increasingly strong shaking on the card back, followed by a sharp face-reveal impact. Reduced motion skips anticipation, including when enabled during loading or the lead-in.
- Add a quiet Pokémon Center anime instrumental loop, unlocked by user interaction, paused on mute/hidden tabs, and ducked beneath cinematic cues. Record community-source provenance and technical verification.
- Improve sound hierarchy with distinct rare and normal reveal cues, quieter repeated credit ticks, brief navigation cues, and ducked cinematic layers under the cry. Keep sound provenance accurate.
- Check geometry across desktop, portrait and short landscape; test audio/lighting lifecycle; inspect the real canvas in browser; run build and relevant suite; review and publish the same private Site.

Design decisions made here: blue/silver/cyan game hardware and white light cores; wide layouts use side controls and narrow layouts use a compact control row. Effects stay local to cards/stage, avoiding full-screen flashes.
