# Normal game: texts, card slots and the card's trip into its slot (v61)

Scope: the pack-opening screen only (not the bonus encounter, the pack-result modal or the arena win).

## Rule for this screen: light, few, no backing shapes

After a first pass that put ink plates behind captions and a framed, dark rack along the bottom, the feedback was that the screen had "too many things with backgrounds". The second pass follows these rules:

- Text over the painting gets its legibility from its own edge, not from a capsule: the battle font with an ink edge and a hard drop for display text, Nunito bold with a thin ink stroke for captions (`CanvasUI.display`, `CanvasUI.caption`).
- A shape is kept only where it is a control: **Open All** has a thin glass tab; **Next** is its two arrows, and the word under them is lettering only; the tray's scroll arrows have a faint cap.
- One readout per fact. The `n / 11` counter during single reveals is gone: the stadium board already shows `CARD n / 11` and the numbered slots show progress. It only appears while a group is being collected (`7 CARDS`).

## Texts

| Text | Role | Style | Entrance |
|---|---|---|---|
| Card name | display | battle font, cream, blue edge (gold edge on special cards) | stamped as the flip lands: 1.5× → 1× with a small back-out |
| Rarity · number | caption | Nunito bold 9 px, spaced, ink stroke | slides out from under the name a beat later |
| TOTAL WIN | caption | Nunito bold, spaced, gold, ink stroke | — |
| Pack name (sealed / browse) | display | battle font | — |
| OPEN ALL | control | caption on a thin glass tab | — |
| NEXT CARD / REVEAL CARD / COLLECT | control | caption under the arrows, no shape | — |

Fit by rule: the name is scaled to the caption width, the small print to the same room; neither can run past it.

Short landscape (for example 844×390) had the name and small print drawn on top of the stone's `+$` value. There is no room under the stone there, so the name now sits to the left of the value and the small print to its right, on the same line.

## Card slots (`traySlotArt.ts`)

- An empty slot is a shallow recess: a thin veil of ink that lets the floor read through, shaded at its top edge and lit along its foot, with a faint ball emblem and its number.
- Nothing is drawn under an empty slot. The value appears with the card, as lettering with its own ink edge.
- The waiting slot (the one for the card now on the stage) is lit: a bright rim, light pooled in the well and a short spill of light on its top edge, breathing. It stays lit until its card has landed and only then moves to the next slot (`CanvasUI.waitingSlot`).
- A filled slot holds the card slightly inset, with a contact shadow on the floor of the recess and a fine edge (gold on special cards).
- The slots are drawn into the tray's single canvas atlas, as before; the atlas gained a 6 px margin for shadows.

## The card's trip into its slot

`Stage.flyToTray` + `trayFlightPose` (in `openingUiMotion.ts`, tested):

1. The card lifts and tips forward before it goes anywhere.
2. It falls along an arc and arrives with speed, shrinking with distance.
3. A soft shadow travels on the ground under it: far and loose while the card is high, tight as it reaches the slot. The shadow's lifetime is tied to the card, so a skipped reveal leaves nothing behind.
4. On landing (`CanvasUI.seatCard`): the existing `land` cue, the slot flashes once, the card sinks slightly past its seat and comes back up into it, and the value stamps in under it. The light then moves to the next slot.

Open All uses the same move for every card in sequence.

## Checked

Stills at 540×720, 390×844, 800×571, 1280×720 and 844×390 (sealed, waiting, first and second card); a 30 fps crop of the trip into the slot at 540×720; eight presses of Next 150 ms apart (ends with cards 1–3 seated, no stray flights or shadows, the fourth slot lit); Open All to the end at 540×720 (all eleven seated).

Not checked: real-time feel, sound, reduced-motion and turbo paths on screen (code paths only), and before stills exist only for 540×720.

`tests/browser/ng-helpers.js` runs one review pass on `pack-flow-lab.html` (`&tag=name` names the stills).

## Not changed

The stadium board captions and the browse grid's pack names and price pills are as they were. The stage geometry (`gameLayout`) is untouched: the bonus collector and the win presentations are positioned from it, so the row the collector used to take in portrait is simply open floor once it moves.

## Second pass: amounts, HUD, packs, fit, performance

### Amounts (`MoneyReadout` meter style)

The play screen's amounts are battle-font digits baked once into a bitmap font (`BattleAmount`: ink edge, hard gold drop), one object per character:

- A small dollar sign hangs from the top line; the cents are smaller digits on the same baseline after a visible point, spaced so "00" cannot read as letters. Checked on `$0.90`, `$6.00`, `$10.00`, `$1,000.00`, `$1,800.90`.
- A digit that changes takes its own punch (squash and stretch, decaying in about 0.2 s).
- TOTAL WIN rolls like a meter when an award lands: the roll lasts 0.24–0.8 s depending on the award against the pack price, with `win-tick` rising in pitch on each step, a flash toward white and a final pulse sized by the award.
- Used for the wallet, TOTAL WIN, the stone's `+$` value, tray prices and the set price tags. Result screens and the arena win keep their own readouts. The flame filter is not used in this style.
- TOTAL WIN is larger everywhere (34–46 px by layout) and scales with the screen.

**Bonus award.** `CanvasUI.awardBonus(amount)` is an event on the play screen: `BONUS +$1,800.00` is stamped over the pedestal's three seats (`win-stamp`), held long enough to read, then thrown into TOTAL WIN, which takes it with the full roll (`win-final-1`). The ledger takes the amount at once, so nothing is lost if the screen changes mid-flight. On resume the starting total includes `save.active.bonus.amount`.

### HUD

- One button shape for every HUD control (`CanvasUI.keycap`): a rounded square with a drop, an inner light on its upper half, a rim and a bevel line. Cards, History, Turbo, Auto, Settings, Sound and the wallet's `+` all use it; the active state brightens it and keeps its pulse.
- Captions under buttons, WALLET · DEMO and LEGENDS share the caption style.
- On large desktops (≥1600×900) the header steps up in size: logo, buttons, wallet, total, tray.

### Packs (browse screen)

- Each set stands on the floor with a contact shadow. The chosen set is lifted and slightly larger, with a bar of light at its foot.
- Set names are display lettering fitted to the tile; the chosen one is gold. The ink edge now scales down at small sizes so the fill stays readable.
- Price tags are small tickets cut to the price (gold for the chosen set, red figures when the wallet cannot cover it), not bars across the tile.
- A bought pack leaves the shelf in shade (tinted) instead of fading it out.
- Choosing a different set makes the pack on the pedestal drop in, give a little and catch the light once (`Stage.setPack`).

### Fit

`gameLayout` changes (the bonus seats and win presentations read it):

- Portrait: the stage starts lower (the total closes the header), the row under it is shorter (name and small print only), and leftover height on tall, narrow screens is shared above and below the stage.
- Short but wide (for example 800×571): the stage starts in the header's free centre and TOTAL WIN moves there too, instead of leaving a dead band and putting the total between the caption and the tray.
- Large desktops: taller caption row and a larger tray (112 px slots).
- The card's name and small print scale with the screen but never past the room between the stage's front edge and the tray.
- Short layouts use the smaller logo so its caption clears the buttons.
- Tray thumbnails mark bonus cards with the game's bonus mark (`createShowdownBadge()`), not the flat blue circle.

### Performance

Measured as real milliseconds per stepped frame with the review helper (`&job=perf`), in a hidden pane while other captures and test runs were using the machine, so the steady numbers are noisy.

| | 540×720 before | after | 1280×720 before | after |
|---|---|---|---|---|
| First reveal, worst frame | 677 ms | 30 ms | 1,104 ms | 42 ms |
| Idle, card revealed (mean) | 5.9 ms | 17.0 ms | 11.1 ms | 27.6 ms |
| Card to slot (mean) | 6.4 ms | 16.7 ms | 10.8 ms | 32.6 ms |

- **Fixed:** the first reveal stalled for most of a second while the card's foil shader compiled on its first lit frame. `Stage.prepareFirstFrame` now compiles it under the boot cover on a thumbnail-sized mesh.
- **Steady frames:** the later, higher numbers were taken under heavier load and do not isolate this change. A breakdown in one session at 1280×720 shows where the time goes: script (tickers, layout, tweens) 0.9 ms per frame; drawing about 20 ms, of which the HUD layer is 2–3 ms and the painted stadium the rest. `build()` runs once per state change (3.4 ms), not per frame. The stadium scene is outside this pass.

`tests/browser/ng-helpers.js` now starts from the lab URL: `&tag=name` saves stills, `&job=perf` returns frame costs, `?browse=1` opens the lab with no active pack.

## UI correction pass (after "all yellow", misplaced amounts, Bonus Buy not matching)

- **Amounts sit where they are put.** The baked battle-font digits are not centred in their glyph cells: the body hangs 0.3 of a size below the anchor and leans 0.1 to the right. `MoneyReadout` now aligns and centres on the measured ink (`INK` in `MoneyReadout.ts`), so an amount's edge is on the given x and the middle of its digits on the given y. `inkWidth`/`digitHeight` let a caller cut a background to the figure. Every layout that had compensated by eye was re-set: wallet, TOTAL WIN, tray and pack prices.
- **Colour.** Gold is for winnings only (TOTAL WIN, the card's value, the result total). Balances, prices and names are white on a blue drop: `tone:'cool'` on `MoneyReadout` (a second baked font, `BattleAmountCool`), and white display lettering for set names, the card name and pack title.
- **Wallet.** Label and amount are right-aligned and end beside the + button, which shares the amount's centre line and the right edge of the buttons under it (`creditLayout`).
- **TOTAL WIN.** The label is the amount's own lettering at two fifths of its size, directly above it; the block ends clear of the card on every portrait screen (`totalWinLayout`, tested).
- **One button material** (`CanvasUI.slab`): a chamfered slab with thickness, a cast shadow, a lit upper half, a bright rim and a bevel line. Used by the Bonus Buy ticket, the OPEN ALL / NEXT CARD chips, price tags and every modal button. BUY PACK / OPEN is the pointed version of the same slab, with battle-font lettering and the pack's price on it.
- **Bonus Buy** is rebuilt in that material: ball emblem, BONUS BUY / LEGENDARY CAPTURE, and the demo quote in a recessed strip. It sits below the utility buttons' captions at every size (it overlapped them at 1920×1080).
- **Price tags** are cut to the price and the digits sit in their middle; the chosen set's tag is brighter, an unaffordable price is red.
- **Stadium board.** While the reveal controls are up the board's ticker stops and each bay's caption sits in the free part of the bay, clear of them (`StadiumDisplay.setKeepOut`); where the controls leave no room (phones, short landscape) the board shows its grid without lettering (`setBlank`). The chips under the controls are opaque.

Checked as stills: browse at 390×844, 800×797, 1280×720, 1920×1080; play at 390×844, 800×797, 844×390, 1280×720; the pack result at 800×797. Settings, Auto and history panels were not looked at after the button change.

## Panels pass (TOTAL WIN gap, every modal, red detailing kept)

- **TOTAL WIN.** The label no longer touches its amount: the `$` sign is levelled with the digit tops (`SIGN_TOP` in `MoneyReadout.ts`) and `totalWinLayout` puts a gap of `max(4, size × .14)` between the label's bottom and the top of the digits.
- **One panel for every modal** (`src/game/panelArt.ts`): `drawPanel` is a cut-corner slab with a contact shadow, a lit header, an ink outline and rim, a seam under the header and an optional footer ledge. `drawPlate` is the recessed row inside it; `drawBall` is the red-and-white Poké Ball. Settings (still named POKÉGEAR), Auto Spin, Trainer Guide, Collection, Pack History, Card Details and Pack Replay all use it, with battle-font titles, caption subtitles, slab buttons and tabs, and the designed money digits.
- **Red detailing is part of the design and stays.** Panels carry the red corner flash and a red key on the seam; primary and active controls carry a red stripe (`accent` on `CanvasUI.slab`: BUY PACK, NEXT CARD, START, the active tab, the selected price tag, Bonus Buy); BUY PACK, START and +1,000 credits carry a real red-and-white ball. Gold remains for winnings only. A restyle may reduce where a colour is used; it does not remove the other accents.
- **Short landscape** (844×390): Pack Replay shows the pack's total in the header beside Back (the lifted card covered it); Auto Spin's section labels sit clear of the header seam.

Checked as stills after this pass: all seven panels and the browse screen at 800×797, 390×844 and 844×390; TOTAL WIN on the play screen at 800×797. Not checked: the Auto Spin session and between-pack screens, the result modal's shell (still a rounded panel, not cut-corner), and anything at real speed.
