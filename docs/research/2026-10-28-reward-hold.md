# Hold rewards until advancing

Awards now have separate presentation and transfer clocks. The count-up and native Spine entrance can finish while the card is held indefinitely; the transfer clock starts only when Next, Collect, or Reveal all advances the opening. Arrival still credits the presentation ledger exactly once. Reduced motion follows the same accounting timing, with a static award and an immediate transfer on advance. The persisted balance and lifetime winnings still settle through the existing model at pack completion.

The banner queues a native Spine idle animation after its entrance. Wings and the plaque move subtly, while the effects rig loops sparse glints. Entrance particles and impact audio do not replay during the hold. Resizing and opening/closing Settings preserve the pending award.

The first action reads Buy pack (including its disabled purchase state). Once the pack is sealed, it reads Open. The label fits the existing compact button without adding a price.

Validation:
- New regressions failed on the old timed settlement/fade, then passed with explicit release.
- 37 test files / 136 tests passed. TypeScript and production build passed, with the existing large-chunk advisory.
- In-memory browser QA held a $45.00 big win beyond 90 seconds with banner alpha 1, both Spine rigs present, idle animation running, and total still $0.00.
- Settings and phone resizing left the award held. Next transferred exactly $45.00; the following $0.25 award stayed pending until advance.
- Reveal all finished at $47.25 with no pending flights or duplicate credits.
- Phone purchase controls verified as Buy pack → disabled Buy pack → Open after purchase.
