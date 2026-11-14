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

## Second round: the card's shine, the big-win scene and the first special pack

8. **The card's foil was a filter**, so every lit card interrupted the frame the same way the board glow did, and in the
   big-win scene, where the card is at its largest, it was most of the frame. It is now part of the card mesh's own shader
   (`foil.ts`: `createCardFoil`, `setCardFoil`): the lighting is the filter's, line for line, with the card's own corners as
   its coordinates where the filter used the card's bounding box. Compared with the filter on the same frame: mean
   difference 0.24/255 at rest and 0.42/255 with the foil at full strength, sweeping and tilted; side by side they cannot
   be told apart. One foil can light several meshes (the plain card, the special reveal's card, each special card on the
   Open All board); each keeps its own picture. Card meshes are created unbatched (`cardMesh`), because the renderer only
   re-checks whether a mesh is batched on a frame where nothing else changed, and a card that gained its foil on a busy
   frame could go on being drawn without it. Reveal frame, GPU: 11 → 7 ms, with no interruption left in the main pass.
9. **The 3D Pokémon went through a 2D canvas on its way into the 2D scene**: drawn by the shared 3D renderer, copied into a
   1024×1024 2D canvas, and that canvas uploaded, every frame. The upload of a megapixel of GPU-backed canvas cost 8–10 ms.
   It is now copied straight from the 3D canvas into the model's own texture (`PokemonModel.render`), as the arena already
   was. This is what held the big-win scene near 30 fps.
10. **Frame pacing.** Pixi's 60 fps cap compares whole milliseconds and carries the remainder, so on a 120 Hz screen one
    late frame was followed by a 25 ms gap and then an 8 ms one. `OpeningStage` now gates frames from the one actually
    drawn (`FRAME_GATE_MS`), so a late frame costs one refresh and the pace is even again.
11. **The first special reveal's one-time work** is done under the boot cover instead of on the frame the pack is bought:
    the painted ball rig (about 50 ms), the soft light sprites and the Tera Pokémon's reflection environment (about 40 ms).

| Scene | Before the whole pass | Now |
| --- | --- | --- |
| Card reveals, plain pack | 66 fps, 17 freezes over 50 ms | 119 fps, worst frame 33 ms, no long frames |
| Big-win scene (Mega) | frames of 15–23 ms with 58–83 ms hitches | never under 60 fps; 95 % of frames within 17.5 ms, none over 26 ms |
| Big-win scene (Legendary) | same | never under 60 fps; one 50 ms frame |
| Open All | not measured | 104 fps, 95 % of frames within 16.7 ms |

## Third round: the wait after tapping Bonus Buy

Reported as "takes ages on some phones". It was the network, and nothing was shown while it ran.

- The encounter is a page of its own, loaded on the tap. It downloaded 42 MB: three uncompressed WAV scores (15.7 MB), PNG
  atlases, and game assets the game itself had not needed yet. On a phone connection that is most of a minute.
- It asked for its files in ten stages, one after the other, so each stage also paid a round trip before the next began;
  the voice lines and verdict sounds were fetched only after the tap that starts the encounter.
- The game showed nothing while this happened. The controls went inert and the screen stayed as it was.

What changed:

1. **Smaller files, same content.** Art is lossless WebP (`cwebp -lossless -exact`), music is FLAC. Every image decodes to
   the same RGBA bytes as its PNG and every score to the same samples as its WAV (compared with `ffmpeg`, 16 images and
   5 scores, no mismatch). `scripts/pack-bonus-assets.mjs` does the conversion and rewrites `ship.json`. Each score's WAV
   still ships, and is fetched only if `decodeAudioData` rejects the FLAC.
2. **Fetched ahead.** 1.2 s after the game is on screen, `BonusPrefetch` fetches the chosen legendary's files into the
   browser's HTTP cache, three at a time at low priority: the built page's scripts, the files in `ship.json` for that
   legendary, and the game assets the scene also loads (`sharedFiles`). Nothing is decoded or kept in memory. It is skipped
   on a data-saver or 2G connection, and starts nothing new once the encounter itself begins loading.
3. **One stage instead of ten.** `scene.ts` starts every download at the top of the module and awaits each where it is first
   used. The guide's voice takes and the verdict cues download with the scene and are decoded when sound starts. The guide
   still waits for its ink cel (`createAnimeGuide(celsReady)`), the one real ordering between loaders.
4. **The tap is answered.** If the scene is not ready within 140 ms, `BonusLoader` covers the game: the boot screen's ball,
   ring and meter, with progress read from the scene (`window.captureLoad.progress`, the share of its downloads settled).
   Its motion is CSS transforms on whole elements, so it keeps moving while the scene's start-up holds the main thread.
   For a bought preview the idle game is paused underneath. A scene that is already loaded never shows it.

Measured in headless Chrome (real GPU, a fresh profile per run so the disk cache starts empty), production builds served
through `tests/browser/slow-server.mjs` at 9 Mbit/s with 100 ms added to every response, phone-sized viewport, driven by
`tests/browser/bonus-tap-probe.mjs` (tap = the Bonus Buy control):

| | old build | new build |
|---|---|---|
| downloaded for the encounter | 42.3 MB | 23.6 MB cold; 0.06 MB after the background fetch |
| tap to loader | never | 0.2 s |
| tap to scene, background fetch finished (CPU 1x / 4x slower) | n/a | 1.6 s / 2.5 s |
| tap to scene, tapped the instant the game appears (CPU 4x slower) | 40.1 s, nothing shown | 21.6 s, with progress |

The background fetch takes 23 s on that connection (23.5 MB). A tap during it finds part of the files on the device.
The test server is HTTP/1.1, so the 80 revalidation requests of the warm case queue six at a time and account for about
1.3 s of its 1.6 s; a host that serves HTTP/2 answers them together.

Not done: the encounter is not started in the background. Booting it means a second WebGL context, a few hundred MB of
textures and a second or two of main-thread work, which would stutter the game being played and risks a phone discarding
the tab. Only its files are fetched ahead.

The cost: every visit now downloads the encounter (about 24 MB) in the background, whether or not it is opened.

## Tried and withdrawn

Drawing the card's foil ahead of the frame the same way as the board glow. It drew the card at the wrong place and size
(the card left its shadow on the way to the tray) and was removed the same hour. The foil became part of the card's shader
instead (point 8).

## Still there

- Buying a pack that holds a special Pokémon, measured again after point 11 with three different Pokémon loaded for the
  first time (Pidgeot ex, Ninetales, Charizard ex): no frame over 60 ms for two of them and one 62 ms frame for the third
  (the screen rebuilding on the click). The 160-216 ms freezes were the one-time work now done at boot, not the model.
- The big-win scene holds 60 fps on this machine but not 120: about 12–16 ms of GPU time per frame while both the 3D
  Pokémon and the arena are on screen.
- None of this was measured on a phone. The causes are the same there (tile-based GPU, one main thread), but every number
  here is from the laptop.

## Tools (lab only)

- `tests/browser/pacing-probe.js`: real frame pacing per phase and long frames with their scripts, on the dev page.
- `tests/browser/gpu-probe.js`: GPU time per frame (timer queries), draw calls, framebuffer switches, uploads.
- `tests/browser/perf-profile.js` with `pack-flow-lab.html?real=1` on the lab server: a sampled CPU profile of a whole pack.
  The lab server sends `Document-Policy: js-profiling` for this.
- `tests/browser/slow-server.mjs` and `tests/browser/bonus-tap-probe.mjs`: a production build on a throttled connection, and
  the time from tapping Bonus Buy to the encounter in a real Chrome with an empty cache and a slowed CPU.
- A change that claims to draw the same picture is checked by rendering both ways with the ticker stopped and comparing the
  pixels. The board glow differs by at most 2/255 on 0.0004 % of values; the tray strip by rounding on a handful of pixels
  (`CanvasUI.trayDirect` paints it the old way for that comparison).
