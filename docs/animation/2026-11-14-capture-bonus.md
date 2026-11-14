# Capture bonus in the game (v61)

The bonus is the legendary capture built in `output/capture-motion-v25/` (the ball-throw encounter with the Tidal Cavern scene, the Throw button and the Team Rocket voiced comments). Its logic, scene and voices are unchanged. What changed on 2026-11-14:

## It now runs inside the game

Before, only the walkthrough harness (`tests/browser/combined-walkthrough-v43.html`) joined the pack and the encounter; the game itself still opened the old Charizard-vs-Mewtwo vault at the end of the pack. `Game.ts` now does what the harness did:

- The third bonus ball landing in the collector (`legendary-bonus-ready`) opens the encounter right there, mid-pack: 0.65 s beat → the three balls seat in the receiver tray (`ShowdownSymbolsView.transferToReceiver`) → the encounter starts with the frozen pack as its entry backdrop → ink transition, eye sequence, cavern, Throw, checks, verdict, reward → ink transition back → the pack resumes at the same card.
- If a win is being presented on that card, the encounter waits for it to be collected first.
- If the rest of the pack is opened at once (Open All), the third ball lands during that reveal, so the encounter follows it at the end of the pack.
- The encounter page is embedded in an iframe over the game (`src/game/bonusEncounter.ts` holds the path and the `captureDemo` interface). It is authored at 3:4, so it takes the largest 3:4 box that fits and the rest of the screen is shaded.
- The game's sound setting mutes the encounter too (`captureDemo.setMuted`). Game audio is paused while it plays, as in the harness.
- The Bonus Buy ticket opens the same encounter directly. `?outcome=capture|escape` and `?legendary=lugia|mewtwo` on the game URL force a case.
- The vault (`src/game/showdown/LegendaryShowdown.ts` and its scene) is no longer opened by anything.

The encounter still lives in `output/`, which git ignores and the production build does not include. It works on the dev server; shipping it needs the folder moved into the tracked source and added to the build.

## Improvements inside the encounter

Added without touching its clock or positions (`output/capture-motion-v25/lightLayer.ts`, hooked at the end of `scene.ts`'s `sample`). No ring or circle sprites: an impact is a point of light with a flare drawn through it, a floor takes a kick of light along it, a lock is a pillar and stars.

- **Arrival:** the legendary's landing throws light and dust along the floor.
- **Throw:** a streak hangs behind the ball along its path and it sheds motes; contact is one hard highlight with a flare through it, lines of force behind and sparks.
- **Drawn in:** light converges on the open mouth and a stream runs from the body into it while the native conversion plays; the lid shutting flares.
- **Checks:** the cavern falls away into a pool of light around the ball. Each shake flashes the button red and scuffs light along the floor on the side the ball rocks to; light gathers on the ball in the held beat.
- **Verdict:** caught — a gold pillar stands on the ball, a flare crosses it and three stars pop off in turn. Broke out — shards of the Pokémon's light fly from the seam.
- **Reward:** the card rises on a column of light and turns over into slow rays that stay behind it and warm to gold as the count climbs; its edges keep glinting. Each milestone puts a flare across the amount and throws coins from behind it; the last one floods the screen and throws the most.
- **Win name:** a battle-font tier ladder above the amount (BIG WIN → MEGA WIN → EPIC WIN → LEGENDARY WIN) stamps on the count's own milestones and replaces the small "Capture reward" caption and the red paper banner.
- **Card back:** the back image had white outside its rounded border, which showed as a white square while the card rose and turned. It is now cut to the card's shape once, when the scene loads.

### Design revamp (same logic and content)

- **Typography:** display text is the battle font with an ink edge and a hard drop, as on the game's win titles: the eye-sequence name, the scene name, the commentary line (each new line stamps in), the Throw button, the verdict (stamped lettering with a shine, no paper plate), the card header and the 180× tag. Nunito stays for small captions and the speech bubbles.
- **Amount:** battle-font digits, cream warming to gold through the tiers, with a wide glow under them that heats as the count climbs. The flame filter on the digits is gone.
- **The ball is 3D:** the flat ball art is replaced by the game's toon-shaded 3D Poké Ball (`PokeBall3D`, rendered at 512 px), driven by the old rig's transform. It tumbles in flight, hinges open toward the Pokémon with the energy passing behind its front lip, and rocks on the floor with its latch pulsing red.
- **Sound:** the new cue set now covers every beat (appearance, throw, hit, energy pull, lid, landing, three shakes, held breath, lock or break-out, card, multiplier, tiers, final, exit) and the scene's older effects track is turned down to sit under it. Music and voices are untouched.

### Second pass on the ball, the bursts and the rivals' portraits

- **Ball finish:** the 3D ball has a lacquer layer (a hard-edged highlight, a second small one and a cool rim) on both halves of the shell (`createBallParts` in `src/game/PokeBall3D.ts`, so the special-pull ball in the main game has it too). It is drawn a fifth larger while open and its interior is lit harder while it draws the Pokémon in.
- **Drawn bursts replaced:** the spiky hit cel, the gold ring on the lock and the ink burst on a break-out are no longer drawn (`contactImpact`, `ballImpact`). The hit is now one white frame, a flare through the point of contact, lines of force thrown past the Pokémon and a second smaller pulse a beat later; the lock adds gold rays behind the pillar and light along the floor; the break-out adds rays and a floor kick to the shards.
- **Commentary:** "A DIRECT HIT!" now lands with the hit instead of at the throw.
- **Rivals' portraits:** the sprite sheet's drawings overlapped their cells, so each lower cell showed the shirt of the drawing above it at its top edge. `assets/rocket-cels-v34.png` was cleaned by removing, from every cell, pixels that belong to a neighbouring drawing (the original is kept as `rocket-cels-v34.orig.png`). The scene name in the top-left corner now gives way while a portrait is shown there.
- **Review tool:** `captureDemo.film({from,to,every,cols,scale,branch,crop})` steps the scene's clock without sound and returns a contact sheet, so the encounter can be checked in seconds instead of by a real-time run.

### Third pass: pull-in and break-out, ball performance, the room, fast taps

- **Pull-in:** the drawn current and pull strokes are no longer shown. The body lights from within, strands of that light are torn off toward the ball, light converges on the open mouth with a stream between them, and the last of it goes in with a gulp of light. The body's own flow animation is unchanged.
- **Break-out:** the stream runs the other way from the seam, strands fly to where the Pokémon stood, and it flares and kicks light along the floor as it takes shape.
- **Leaving after an escape:** the drawn smoke cloud is replaced. The Pokémon gathers, then goes up and out as a streak of its own light, with a column of light and rising strands (it is gone before the rig hides it).
- **Ball performance:** on top of the rig's path the 3D ball shivers and swells while it draws the Pokémon in, snaps flat as the lid shuts, tumbles as it falls, squashes on each landing, rocks harder on each shake, crouches and springs on a lock, and is thrown back by a break-out.
- **The room:** `cavernAtmosphere.ts` adds air behind the Pokémon — shafts of light from the roof, glints running on the water, mist over the shore, dust drifting through the light. It is a function of time (never restarts) and it answers the beats: the shafts and the water brighten on a hit, the lid, a landing and the verdict.
- **3D ball safety net:** if the browser cannot give the ball a graphics context, the scene logs a warning and the original drawn ball takes over for the session, so the bonus never fails over it.
- **Fast taps (`Game.ts`):** from the moment the card carrying the third bonus ball starts to reveal until the encounter has played, Next and Open All are ignored (bounded at 8 s so a ball that never lands cannot hold the pack), auto spin waits, and taps in the 0.45 s after the encounter hands back are ignored. If a panel is open when the ball lands, the encounter waits for it to close. Covered by two tests in `Game.auto.test.ts`.

### Fourth pass: the Pokémon going into and out of the ball

The light-strand version of the pull-in read as a white blur. It is replaced by one connected effect, the same for both encounters:

- **Energy body (`energyBody.ts`):** a shader redraws the Pokémon's own sprite, every frame, as energy: its shape and a trace of its shading filled with the encounter's energy colour (blue for Lugia, violet for Mewtwo), a white-hot outline, and bands of brighter light running through it toward the ball (away from it on a break-out). A blurred copy haloes it. Because it uses the body's live texture it follows the pose and the flow into the ball.
- **Beam (`energyBeam.ts`):** a ribbon mesh between the ball's mouth and the Pokémon: a scrolling body of light, a white core, two strands wound round it that pass in front and behind, and knots of light travelling along it. It shoots out of the mouth at story t 6.25, takes hold at 6.4 (the body turns to energy from there), stays while the body is drawn in, and snaps back into the mouth as the lid shuts.
- **Around it (`lightLayer.ts`):** lines of suction race in from the edges of the frame, dust is dragged along the floor toward the ball, the cavern darkens around the pull, and the camera pushes in with a tremor that grows with it.
- **Break-out:** the same beam runs backwards out of the burst ball, the energy body grows out along it, and when it lets go of the light it sheds it in every direction, stamps the floor, and stands as itself. The air is thrown outward first.
- **Mewtwo** has no body-flow of its own, so its energy body shrinks along the beam into the mouth and grows back out of the ball; its drawn conversion art is no longer shown.
- The pools of dark now lift just before a flash, so a flash never lights their edge into a ring.

### Fifth pass: the three checks, any screen shape, frame cost, and the win being paid

- **The three checks, redesigned.** Three lights hang over the ball, one per check. Each rattle is three hits (left, right, left) on the rig's own rhythm: the trapped energy bursts out of the seam on the side the ball is thrown to (in the encounter's energy colour, the same that went in), lines of force jump off the shell on the main hit, the floor is scuffed, the shell glows, a light comes on with a stamp, the pool of dark tightens, and the lens steps closer and kicks. In the held breath all three lights pulse faster and the seam flickers. Caught: the lights turn gold and drop into the latch as the lock flashes. Broke out: they go red and are thrown off.
- **Any screen shape.** Embedded in the game, the scene no longer sits in a fixed 3:4 box: it is given the screen's aspect when it loads and sizes its canvas to it (720 wide and up to 1560 tall for phones; 720 tall and 1040–1680 wide for landscape). Everything is laid out from `w` and `h`. `Game.loadBonus` reloads the scene if the screen has turned. Filmed at 720×1558 and 1512×720 as well as 720×960.
- **Frame cost.** `captureDemo.cost({from,to})` measures milliseconds per frame with the GPU forced to finish. Whenever the Pokémon was on screen a frame cost 14–17 ms, because its 3D render was copied to a 2D canvas and then uploaded. It is now uploaded straight from its own canvas: before the throw 16.9 → 3.3 ms, throw and hit 15.3 → 4.4, pull-in 13.8 → 7.2, break-out 10.7 → 7.4 (medians, 720×960, this machine). The checks (4.6) and the count (6.7) were already inside a 60 fps frame.
- **The win is paid.** A catch in a pack's own bonus now pays that pack: `awardBonus` in `model.ts` attaches `{name,image,multiplier,amount}` to the opening, `settleOpening` includes it in the pack's total and the wallet, and a pack that had already settled (Open All) is paid the difference at once. The scene is loaded with the pack's price as its stake (`&bet=`), so the figure shown is the figure paid. The Bonus Buy preview still pays nothing and costs nothing.
- **Fix:** the ball's front lip could stay on screen after an escape and show at the start of the next encounter; a hidden ball now hides its lip.

### Team Rocket's lines

They are rivals, not helpers, so each recorded line now plays where it reads as one (`voiceBank.ts`, `guideCue.ts`):

- **Entrance** (new, the first 2.5 s of the throw wait): "Team Rocket on the scene!", "Put the plan into action!", "Get ready!"
- **Daring the throw:** "Come on! Show some guts!", "You'd better be ready for this!", "Surrender now, or prepare to fight!"
- **Jeering during the shakes:** "Prepare for trouble!", "Make it double!", "Watch and learn!"
- **Gloating over an escape** and **losing their temper over a catch** are unchanged.

Only the sixteen existing recordings are used; no new lines were recorded or generated.

In the pack, each bonus card's stamp lands with a point of light, its ball trails light to the collector, and the three landings step up in pitch ("One more to go!" at two).

## Checked

Contact sheets through the real game on the dev server: Lugia caught (hit, shakes, lock, card rise and flip, count, final) after the last changes, and the return to the same card. Mewtwo escaped was last run before the ring-free light and the voice line changes. Not reviewed at real speed and nothing was listened to.

## Reward: card and numbers

One author for the whole reward (`cardReveal.ts`); the general light layer steps back there (`lightSwitch.reward=false`). Logic, values and the shared clock (`WIN_STAGES`, `timing.ts`) are unchanged. Everything is drawn in one system (`rewardKit.ts`): the receiver tray's cel-shaded shapes with an ink outline, Poké Ball red / cream / steel blue / gold, battle lettering for display text, Nunito for captions. No rings, discs or flames.

**Verdict (`ballVerdict.ts`).** A struck plate drops in large, lands at 0.09 s with one flare along its length, rings out once and holds; its sub-line slides out from under it on a cream tag. Red with a gold rim for CAUGHT!, cold steel for BROKE FREE!. The catch is stamped above the ball. The break-out keeps off the Pokémon while it takes its shape back: a lower third under its feet in the tall frame (the commentary line is hidden for that beat), up beside it in the wide one. Same clearing times as before (0.5 s / 1.3 s).

**The room.** Not a flat dim. The cavern stays faintly visible through the middle and falls away at the edges; shafts of light come down onto the card; slow rays turn behind it; the tray stands on a lit floor with the tier's light pooled under it. When the lens pushes in, the room moves less than the reward and the near coins more.

**Card (`cardMotion.ts`, `cardReveal.ts`).** A real perspective quad with visible paper edges.
1. It leaves the ball lying back on the ball's column of light and stands up as it rises.
2. It hangs: light builds behind it and along its edges, and it trembles.
3. It winds a little the wrong way, then commits to one turn with a push toward the lens.
4. The face lands and is held for four frames, lit white.
5. One hard highlight crosses the foil, and the card settles into a slow sway that the foil follows.
6. From then on it answers every lock (`cardLock`): a pulse on BIG, a lift with a tilt from MEGA, a hop that throws light across the foil from EPIC. Its glow grows with the tier and sparkles walk its edges from MEGA up.

**Multiplier → bet → total (`rewardMotion.ts`, `rewardCounter.ts`).**
1. `180×` is stamped on the card's face as a red, gold-rimmed badge.
2. The prize tray rises: a red shoulder carrying the bet chip and an empty socket, a cream body that is nearly all reel window, a steel ledge. The digits in the window are the largest thing on the lower half (about 100 px tall at 720×960, up from 67).
3. A gold `×180` token leaves the badge, arcs across dragging light and seats in the socket on the frame the count starts.
4. The total counts on drums: digits roll like an odometer and low places spin when it climbs fast.
5. Each lock is a slam: the places that were still turning stop one after another, left to right, each with its own overshoot and flash; the tray jumps and shakes sideways; a hairline of light crosses the row; the tray's edge lights in the tier's colour; coins leave from the tray's ends and stay on its ledge.

**Escalation.** Every lock is bigger than the last across the whole screen, so the tier can be read from a thumbnail:

| Lock | Plate | Room | Shafts | Card | Coins | Lens push |
|---|---|---|---|---|---|---|
| 1 | BIG WIN | blue | 2 | pulse | 4 | 1.2% |
| 2 | MEGA WIN | red | 3 | lift and tilt | 8 | 2% |
| 3 | EPIC WIN | violet | 4 | hop, foil sweep, sparkles | 14 | 3% |
| 4 | EPIC WIN | brighter violet, larger rays | 5 | bigger hop | 22 | 4.2% |
| 5 | LEGENDARY WIN | gold takeover | — | gold-lit, second hero | rain | 8.5%, held |

**Wind-up (4.10 → 5.30 s).** The room drains: it darkens, the rays pull in tight, the shafts narrow and brighten, streaks of the room's light run in to the card and the tray, the tray trembles and tightens, and from 4.78 s the low drums spin.

**LEGENDARY takeover (5.30 s).**
1. Four frames of hit-stop and one white frame.
2. The tray drops out of frame. Its gold plate launches up and breaks into the title: LEGENDARY WIN in gold battle lettering, one letter at a time, each arriving large and hitting.
3. The total leaves its window and lands hero-sized under the title (about 160 px tall in the tall frame, 175 px in the wide one), each digit slamming in turn.
4. Gold rays fill the room, the frame's edges glow gold, the card swings once with a hard foil flare and wears sparkles, and coins rain with depth: small ones far behind everything, large ones down the outer edges in front, never across the title or total.
5. The hero layout holds for about 1.6 s (the rival's remark starts at 7.37 s after face-up, not 6.05), with a band of light crossing the title.
6. At 6.9 s the award goes home: the title shrinks back to the plate, the total returns to its window as the tray rises. The reward then steps aside for the rival's remark; the gold rays and the coin rain carry on behind it until the fade.

**Sound** follows the same causes from `cardReveal.ts`: `flip`, `cap-card`, `cap-mult`, `win-stamp` when the token seats, rising `win-tick`s while a stage counts, `win-rung-N` + `win-coins-1` (+ `slam` from EPIC) per lock, `charge` under the wind-up, then `win-final-4` + `win-coins-3`, `win-stamp` for the title, `slam` for the total and `win-coins-2` as the rain starts. Nothing plays when the clock is scrubbed.

**Reserved places (no overlap).** Tall frame, top to bottom: name → tab → card with its badge → tier plate on the tray's top edge → tray (chip, socket, window) → ledge with coins → BONUS AWARDED → MOCK REWARD. Wide frame: card left, tray right. In the hero layout: card, title, total, BONUS AWARDED, MOCK REWARD, with the tray out of frame; the two captions are hidden while they move between layouts. The amount fits by scaling the whole row; chip, token, plate and tag text scale to their plates.

**Tests** (`rewardShow.test.ts`, plus the existing card and reward tests, 66 in the folder): the card's one turn and held landing; the token docking on the frame the count starts; plate turns; odometer rules; staggered digit slams; tier order for power, coins and the card's reaction; the wind-up; the takeover's order and return; letter slams; rain lanes; coin paths; the verdict stamp.

Checked as stills only, through `captureDemo.film` on the scene's own clock, for Lugia and Mewtwo at 720×960 and 1280×720. Not watched at real speed, sound not listened to, and not re-run through the embedded game after this change.

## In-pack bonus ball

What a bonus ball does before the encounter: landing on its card, travelling to its seat, and the hand-off of all three to the receiver. Code: `src/game/showdown/BonusSymbolArtwork.ts` (mark and landing), `bonusBallMotion.ts` (poses, tested), `ShowdownSymbolsView.ts` (seats, flight, hand-off), `showdownSymbolsLayout.ts` (where the seats go, tested).

- **The ball is the game's 3D ball.** Every bonus ball in the pack is `PokeBall3D`: live while it moves, one shared still render while it rests. The Spine capture ball and seal frames are no longer loaded (`CaptureSealFrames.ts` is unused).
- **Landing on the card.** The ball comes down out of the lens onto the card's lower right, large and tumbling, with light dragged behind it. Contact holds for three frames, then: one hard squash and a short rock, a flash that prints the mark under it, and a bar of light and sparks across the card face (cut to the card's outline). Just before it is carried off, its latch glints once.
- **The mark.** An enamel capsule with a gold edge and a bevel, `BONUS` in the battle font, and a well holding the ball's impression in gold line. It stays on the card in the tray flight, the open-all grid and the result grid.
- **Leaving the card.** The ball lifts off its mark (the impression stays), rises toward the lens (it more than doubles in size at the top of the arc), tumbles, and comes down into its seat with one streak of light along the path behind it.
- **The seats.** No panel, no label, no row of their own. Three steel-collared wells are set into the pedestal's front lip, right of the `+$` plate, under the corner of the card where the ball lands. They are not drawn at all until this pack's first bonus ball strikes its card; then they push out of the lip one after another. They are drawn under the cards, as part of the scene. A seated ball squashes, the seat dips with it and stays lit (cyan; all three turn gold at 3/3). At 2/3 the empty seat pulses slowly.
- **The count is a moment.** `1/3`, `2/3 · ONE MORE!`, `3/3!` stamps beside the seats in the battle font and is gone in about a second. Each landing plays a step higher (`cap-ready` at rising rates); the third adds a short gold column.
- **Other layouts.** Short landscape (caption lies over the lip): the seats continue the tray's row past its last slot, or sit beside the caption when the tray fills the width. While the rest of the pack is laid out over the pedestal (Open All), the seats slide to the floor between the two controls, and each ball still drops onto its own card and flies from there.
- **Hand-off.** The three balls leave their seats in turn, rise, and drop into the receiver tray's holes with weight: the tray dips under each one, the hole lights gold, a flare crosses it. `LEGENDARY ENCOUNTER` stamps in the battle font. Timing is unchanged (≈2.1 s), so the game's hand-over to the encounter is unaffected.
- **Interruptions.** Any ball still in the air is brought home silently before a hand-off starts or the seats are hidden; a blocked stage hides balls in flight and their light; a second hand-off or a new pack ends the first cleanly; reduced motion ends every step in its final state at once.

Not possible without `Stage.ts`: the card itself does not flex or recoil when the ball lands (the mark is a child of the card, so it can only light it), and the seats cannot follow the pedestal during a special reveal's camera move, so they fade out with the lens instead.
