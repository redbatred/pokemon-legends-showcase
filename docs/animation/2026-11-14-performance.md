# Performance pass: stutters, frame cost and the bonus frame

Measured on the development machine (Apple M3 Pro, 120 Hz display, canvas 1790×1860 with 4× multisampling) in the real
game, with real frames. Nothing here lowers resolution, removes an effect or shortens an animation.

## What was wrong, in order of how much it hurt

1. **The bonus scene never stopped rendering.** Its page is loaded ahead of time and kept, hidden, between encounters, and
   its loop sampled and rendered the whole scene every frame regardless. After the first bonus (or the first pack holding
   three balls, or one Bonus Buy) a second game ran behind the first for the rest of the session. It now draws only while an
   encounter is playing (`output/capture-motion-v25/scene.ts`, `loop`).
2. **The main game kept redrawing under the bonus.** While the encounter covered it, anything animating on GSAP asked the
   paused stage to redraw, up to 120 times a second, at full size. `OpeningStage.setCovered` drops those redraws. Together
   with (1) the bonus went from about 45 fps to the display's full 120.
3. **Every 3D Poké Ball recompiled its shaders.** A ball that was finished disposed its materials; three.js then deletes the
   shader program, and the next ball (one lands on a card, flies, sits in the tray, opens in the reveal) linked it again on a
   visible frame: 230–350 ms each time. Finished balls now hand their parts to a pool (`PokeBall3D.ts`), and the programs for
   both passes are compiled under the boot cover (`warmPokeBall`). The clipped pass is drawn first so the shared renderer is
   left in its unclipped state, which is what the next Pokémon is compiled for.
4. **The card tray was repainted about a dozen times per rebuild of the screen.** The strip is one painted canvas; every
   rebuild made a new one, painted all eleven slots, and then painted them all again once for each card image whose
   (already cached) thumbnail promise resolved. With eight cards down that blocked for 70–80 ms on every reveal. The strip
   now survives rebuilds, is repainted only when what it shows has changed, and each slot is painted once into a small canvas
   of its own and afterwards copied (`CanvasUI.rack`, `trayAtlas`, `traySlots`). Rebuild to next frame: 70–83 ms → 5–9 ms.
5. **Two small blurs cost a quarter of every frame.** A filter met in the middle of the scene makes the renderer leave the
   screen's framebuffer and come back; on tile-based GPUs (every iPhone, every Apple-silicon Mac) each round trip stores and
   reloads the whole multisampled screen. The stadium board's glow was two such filters. Both glow meshes now sit outside
   the scene under one blur and are drawn into a texture before the frame's main pass (`StadiumDisplay.drawGlow`, run by
   `frameHooks`). GPU time per frame: browse 5.7 → 1.6 ms, reveal 14.9 → 11 ms.
6. **Canvas uploads through the slow path.** A GPU-backed 2D canvas has to be synchronised across contexts when it is
   uploaded as a texture (twelve 512×128 canvases in one frame: 100–160 ms of GPU time). Every canvas the game paints and
   then uploads is now kept in ordinary memory (`canvasUploads.ts`, and `willReadFrequently` on the game's own canvases).
7. `money()` built an `Intl.NumberFormat` on every call, while amounts count every frame. One formatter now.

## The bonus frame

On a screen wider than 1320 px the embedded scene was 60 px or more off centre, with a bar on the left and its right edge
cut off: the standalone page's centred column was still in effect inside the frame. Embedded, the stage is now pinned to the
frame's four edges (`index.html`). Also: the wide layout grows taller for screens between 1.15:1 and 1.44:1 instead of
letterboxing (4:3 tablets), a frame within two pixels of the screen is the screen (no one-pixel line of the game at an
edge), and the scene's page takes no zoom gestures, so a fast double tap on Throw cannot zoom the game.

## The bonus amount and TOTAL WIN

The catch's amount was added to the running total the moment it was awarded, so any rebuild of the screen in the next
second and a half started the count before the flying amount arrived. The total now learns of it when it lands
(`RewardTransfers.bonus`/`endBonus`; logged in the live game: the total holds for 1.4 s, then counts from the landing).

## Numbers (same machine, same packs, before → after)

| Phase | Before | After |
| --- | --- | --- |
| Cards, plain pack | 66 fps, 25 frames over 34 ms, 17 over 50 ms | 118 fps, none over 34 ms |
| Cards, Mega win + three bonus balls | 58 fps, 33 over 34 ms, 4 over 100 ms | 87 fps, 12 over 34 ms, none over 100 ms |
| Tear | 82 fps, worst 213 ms | 113 fps, worst 42 ms |
| Bonus, before the throw | 46 fps | 120 fps |
| Bonus, after the throw | 44 fps | 117 fps, worst 41 ms |
| Cards after the bonus | 52 fps | 116 fps |

## Tried and withdrawn

Drawing the card's foil ahead of the frame the same way as the board glow. It drew the card at the wrong place and size
(the card left its shadow on the way to the tray) and was removed the same hour. The foil is still a mid-frame filter and
costs about 2.6 ms of each reveal frame.

## Still there

- Buying a pack that holds a special Pokémon: one freeze of about 160 ms while its model is parsed (three.js, one task),
  and 50–95 ms warm-up steps after it.
- The big-win arena runs near 30 fps: the whole 3D scene is copied into the 2D renderer's context every frame.
- The reveal frame is still about 11 ms of GPU time on this machine: the foil filter and 4× multisampling over 3.3 megapixels.
- None of this was measured on a phone. The causes are the same there (tile-based GPU, one main thread), but the numbers
  above are from the laptop.

## Tools (lab only)

- `tests/browser/pacing-probe.js`: real frame pacing per phase and long frames with their scripts, on the dev page.
- `tests/browser/gpu-probe.js`: GPU time per frame (timer queries), draw calls, framebuffer switches, uploads.
- `tests/browser/perf-profile.js` with `pack-flow-lab.html?real=1` on the lab server: a sampled CPU profile of a whole pack.
  The lab server sends `Document-Policy: js-profiling` for this.
- A change that claims to draw the same picture is checked by rendering both ways with the ticker stopped and comparing the
  pixels. The board glow differs by at most 2/255 on 0.0004 % of values; the tray strip by rounding on a handful of pixels
  (`CanvasUI.trayDirect` paints it the old way for that comparison).
