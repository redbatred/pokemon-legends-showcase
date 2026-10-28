# Pack touch handling and reveal depth

Pack accessibility buttons previously forwarded only pointerdown to the canvas rail. The canvas owned move/up/cancel listeners, so a touch sequence whose implicit capture stayed on the button never completed. Physical clicks were intentionally ignored by the button's click handler to prevent duplicate selections, leaving no fallback. The browser regression reproduced missed selection, missed scrolling, and an uncleared drag before the fix.

The canvas and DOM buttons now finish gestures on their stable shared host. That host requests capture; bubbling also handles a touch that remains on its button. Pointer identity and capture-loss cleanup prevent cancelled or secondary touches from changing selection. Sub-threshold finger movement leaves the rail still; releases outside the viewport cannot select a pack.

The game surface disables native WebKit tap highlighting, text selection, and touch callouts. Transparent hit buttons explicitly have no background or native appearance and reserve touch gestures for the game. Hover feedback is mouse-only. Keyboard and assistive clicks remain available.

At card impact the ball is inserted below the Pokémon actors, above the ground shadows and card. Flight depth remains behind the card until impact.

## Verification

- `npm test`: 37 files, 132 tests passed.
- `npm run build`: TypeScript and production build passed; existing large-bundle advisory remains.
- `tests/browser/touch-controls.html` exercises real game controls with an in-memory save. Run using the Vite server. It deliberately dispatches touch move/up on the originating button to check implicit-capture routing; synthetic capture is stubbed only inside the fixture.
- Before fix: tap, swipe, release cleanup and native highlight checks failed. After fix: all passed at 390px phone size. Actual browser clicks also select packs after scrolling.
- No physical iPhone was connected; this is a browser regression for the touch event path, not an on-device Safari result.

References: [Pointer Events](https://www.w3.org/TR/pointerevents4/), [Apple Safari tap highlighting](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/AdjustingtheTextSize/AdjustingtheTextSize.html).
