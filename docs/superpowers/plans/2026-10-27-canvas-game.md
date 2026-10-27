# Canvas-native game implementation

1. Capture baseline frame pacing and isolate CSS compositing (done: ~18fps baseline vs ~28fps without CSS animation/filter layers; same browser viewport).
2. Add bounded renderer resolution and skip unchanged geometry; reduce perspective subdivisions; remove live blur passes. Test render budget and pagination bounds.
3. Move painted arena/platform/light/particles into one Pixi scene. Stage pauses behind game screens; static UI is rendered only when needed.
4. Implement canvas HUD, pack rack, collection binder, settings/history, card viewer and results. Hidden DOM controls mirror canvas hit targets solely for accessibility.
5. Replace website markup/styles with a viewport host; vanilla TypeScript keeps persistent game state and event orchestration, with React removed from dependencies and the lockfile.
6. Test flows, responsive screen bounds, inspect frame-time samples, review, build and publish the existing private Site.

7. Replace gothic scenery with generated Pokémon anime stadium and platform, bundle Nunito/OFL, improve pack shelf and credit counters, coalesce idle UI draws, fix compact landscape layouts.
