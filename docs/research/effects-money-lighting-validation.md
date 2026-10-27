# Attack, audio, winnings and lighting refinement

The first four measured attack performances now use source-bone sockets and release windows from `power-cues.json`. The Three mixer and effect clock follow the same GSAP clock, with a real mixer regression covering crossfade advancement through a stalled frame. Emission matrices are cached with the rendered pose. Fire/water streams retain recent emission positions instead of rotating the entire plume with the latest head pose. Greninja captures its projectile launch once. The fixed camera fits projected, CPU-skinned idle and attack poses; actor placement aligns the idle ground with the stage.

Other supported actors retain their genuine clips where available and use anatomical head/body anchors with elemental treatment. This is authored game VFX informed by official move descriptions and the supplied clips, not studio anime animation or official move-event tracks. Art-only fallbacks remain intact illustrations.

All 28 runtime effects now use the documented Pokémon GO game-derived samples in `audio-v4`, from the pinned PokeMiners extraction repository. Cries remain the existing genuine game cries; the quiet background music is unchanged. The sound set uses unpitched edits, controlled levels and decays. Each completed payout triggers one reward sound; count-up frames do not fire reward ticks. Automated decode/provenance checks are documented in the asset files; no human listening claim is made.

Money widgets fit measured glyph widths, separate currency/decimals from the main digits, and persist the actually displayed value and remaining animation time across canvas rebuilds. Rapid card landings retarget the running count. Wallet, individual wins, pack totals, history and final payout use the same component. Compact values are used only for very narrow card thumbnails; headline totals remain exact cents.

`totalWon` is a backward-compatible optional save field. New saves track all settled winnings independently of the 30-row history. Legacy saves seed it from retained completed history; entries already discarded by previous versions cannot be reconstructed. Adding demo credits does not count as a win, and repeated settlement is idempotent. No user save was edited during development.

The stage chassis and shadows retain their original colors. Colored emitter cores, a narrow bright filament and additive colored bloom are separate layers. The source hotspot and broad pool are reduced; wide beams keep the card hue instead of mixing toward white. Card spill is also lower.
