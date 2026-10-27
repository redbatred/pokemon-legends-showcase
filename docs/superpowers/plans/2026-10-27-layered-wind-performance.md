# Layered stadium wind and native Pokémon performance

User direction: high-quality moving clouds and trees, nearer trees behind the stands matching the source illustration, leaves, and substantially better Pokémon motion/sounds.

- Keep the original stadium/mountains. Separate connected sky pixels at runtime and composite painted transparent cloud layers behind the terrain; drift cloud banks in one direction at two depths. Preserve the original floodlight towers/rim as foreground occlusion.
- Add eight groves from five matching illustrated tree clusters. Anchor roots, let upper branches follow shared slow gusts with delayed finer motion, and let small leaves drift behind the stadium rim. Freeze decorative motion for reduced motion and lower geometry updates on low graphics.
- Finish genuine skeletal action recovery instead of cutting immediately to idle. Use a bounded faster recovery tail and a gentle idle crossfade. Render active skeletons more frequently when frame budget permits.
- Restore Charizard's source-native upright `happy` clip for the temporary first-card big win, with measured mouth position and fire window. Keep the earlier native clips and all geometry.
- Use genuine Hydro Pump, Water Pulse and Psystrike samples for their appropriate species, with source offsets/pre-roll. Remove the universal Pokémon charge sound, align cries with body anticipation, and fade attack sound envelopes with the scene clock so pause/mute/cancel remain synchronized. Preserve quieter mix levels.
- Verify source meshes/animations, mask exclusions and branch root anchors, attack/recovery timing, audio lifecycle and desktop/mobile rendering. Publish the exact tested version to the same private Site.
