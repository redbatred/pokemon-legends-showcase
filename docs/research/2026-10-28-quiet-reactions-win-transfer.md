# Quiet crowd reactions and card-to-total winnings

Lower reveal tiers now use two short recorded vocal reactions from the CC0 source documented in `soft-crowd-v11.md`. Common/uncommon and ordinary rare cards play a single faded response at effective gains 0.20 and 0.30. They do not start an applause bed or replay on unmute. Higher special-win tiers retain their existing stadium cheer. All prior pause, stale-load and mute ownership rules remain.

The pack's cumulative total is now labelled TOTAL WIN above Next on desktop. Portrait/touch layouts place it centrally between Reveal All and Next; compact landscape places it above the side controls to preserve the short play area. The old tray-corner total was removed. Short desktop controls reserve enough vertical room for the new amount.

Each card award counts for 270ms, holds for 120ms, compresses for 100ms and travels in 300ms. The amount squashes into a bright comet with a tapered cyan/white tail, then reforms at the total. A launch sound and a scene-owned arrival sound are triggered by the same animation clock. The total counts up only on arrival with a stronger scale punch and short angular accents. Special, big and epic tiers add a cel-painted Pokémon crest, live title and larger reward; big/epic wording requires at least 2x/8x pack cost. Card captions are temporarily hidden beneath the crest to avoid overlap. A persistent canvas layer survives HUD rebuilds and computes its endpoints from the current responsive layout. Scene pauses freeze the flight. Reduced motion applies the amount directly.

A separate presentation ledger deduplicates indices within an opening; it does not modify demo credits or settlement. Quick Next accelerates any old reward before the next appears, and cannot credit an amount twice. Reveal All accelerates an existing flight to finish visibly, while each newly collected card adds its value once. New openings clear obsolete effects and ledger entries.

Validation:
- 34 test files / 121 tests pass, including flight endpoint continuity, exactly-once accounting, responsive destination bounds, reduced/reset handling and immediate Reveal All preserving a visible arrival.
- TypeScript compilation passed.
- Browser in-memory fixture: quick Next ended at 50 cents for two 25-cent cards, with no pending effects. Reveal All ended at 250 cents for ten reward cards and zero-valued energy.
- Paused flight held at 0.87 seconds with total still zero; resizing from phone to desktop preserved the pending reward and resuming continued its progress.
- Browser Web Audio meter observed the common `crowdreact` voice at gain 0.20 and then no crowd voice after it ended; no applause loop was active.
- Mobile total was visually checked between the two action buttons with card captions and tray clear of it. Desktop placement was checked above Next.
- Final Charizard special reveal was checked at 1280×720 and 390×780: the crest, live amount and controls fit, with the card captions hidden during the celebration. Proof images are retained in ignored `output/special-win-desktop-final.png` and `output/special-win-mobile-final.png`.
- Fresh review identified early collection cancelling the flight; the implementation now accelerates it and targeted integration tests verify credit only on arrival. Follow-up review found no further issue.

QA used ignored in-memory fixture files, without changing user saves or sound preferences. Card hover now uses a bounded card-local target, eases out beyond the edge, ignores touch hover, and stays disabled through reveal choreography. Inspector pointer coordinates use the logical canvas dimensions and redundant idle tweens are skipped. Main card hover was visually checked inside/outside its bounds. Subjective listening is not claimed; recorded-source provenance and delivered audio measurements are in the asset document.
