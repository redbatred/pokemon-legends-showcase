# Canvas-native game revision

User explicitly requires all visible UI—including collection, settings and card inspection—to live inside the game canvas, and reports significant lag. Preserve the real assets, generated Pokémon anime League stadium, pack prices, opening flow and persistence.

Implement one Pixi renderer for the stage, scenery, HUD, pack rack, collection binder, result board, settings and card viewer. Vanilla TypeScript remains the discrete orchestration layer; remove React entirely; no visible website header, DOM modal or CSS scenery. The game fills its viewport and scales its internal layout for desktop and portrait. Menus occupy the same logical game screen. Modal masks stay inside the canvas. Hidden accessibility controls mirror the current screen and focus a visible canvas highlight.

Performance: first capture frame-time evidence. Remove full-screen CSS filters/blur/animated compositing; scene sprites use the single WebGL renderer. Reuse static geometry and textures. Stop stage motion behind menus. Lower perspective subdivision where projective mapping gives identical output, cap renderer pixels, skip unchanged mesh projections, use a static cached background and small sprite effects. Collection renders a bounded page rather than all card textures simultaneously. Apply a bounded render-pixel budget without altering card source resolution.

Design: integrated blue/silver game HUD, emblem controls, a transparent floating pack selector with larger artwork and bitmap price badges, centered physical pack. Collection becomes a full-screen binder with tabs, page controls, progress and card slots. Inspection is a canvas overlay with fit/full-size and pan. Opening and results retain clear demo-credit values, keyboard controls and local saves.

Validation: accounting/state tests plus pagination/adaptive-budget rules; browser navigation across pack selection, collection, viewer, settings, opening and results; compare frame samples using the same browser viewport and scene; verify no visible DOM modals or out-of-game UI remains.

Latest user revision: replace gothic artwork with clean Pokémon anime stadium and separate cel-shaded platform; retain no Pokémon characters, no orange UI. Use Nunito and cached bitmap glyphs for larger credit amounts; count up reveal/result values, add light/particle reveal accents and payout sparks. Simplify menus with rounded blue device-like panels, keep all controls inside viewport, use two columns on compact landscape. Clear focus and card-edge graphics between states.

Final rail/HUD revision: larger square tiles (200px desktop / 190px portrait), draggable mouse/touch rail with elastic edges, momentum and snapping, wheel and keyboard arrow-button alternatives. No full-width header bar or navigation tabs. Float the Pokémon logo, keep a compact credit capsule, and use custom circular binder/history/gear/sound canvas icons at the scene edges.
