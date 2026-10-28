# Crowd playback and flexible foil follow-up

The user reported absent crowd sound after visual reactions were separated from audio. Investigation found three issues: ordinary cards deliberately selected silence; normalized recordings were attenuated again to very low playback levels (the old low tier averaged approximately −47 dBFS); and a crowd request made while muted or loading was marked handled without recovery. The live tab also showed the muted-speaker icon. The user's saved mute preference remains respected.

One reveal tier now selects both body language and sound: energy is silent, common/uncommon cards use small-group applause, rares use stronger applause, special reveals use stadium cheering, and exceptional-value cards get the strongest reaction. The v10 recordings are genuine CC0 field recordings, documented in `audible-crowd-audio-v10.md`. Runtime onset/loop gains are 0.44/0.16, 0.54/0.24, 0.66/0.34 and 0.80/0.46. These are direct effective gains, not multiplied by manifest gains.

The current card retains ownership of its continuing crowd loop through mute and audio loading. Unmuting starts the ongoing loop without replaying an old reveal impact. Loading callbacks are generation-guarded and removed on disposal; next card, reset and reveal teardown cancel the old crowd. Hidden tabs and modal pauses retain their pause behavior.

The foil now bows along its released length, twists across its width and changes its projected depth while curling. Once detached it flexes under a diminishing flutter envelope. A small pack recoil and a second restrained wrapper rustle mark the final release. The unbroken seam still remains joined. The lift is bounded near the original pack top to keep clear of its title.

Verification evidence:

- Two new audio regressions failed before the fix: enabling sound after reveal, and loading the loop after the reveal event. Both pass after the fix, including stale-card cancellation.
- In-memory browser fixture connected a Web Audio analyser to the actual crowd voice gain nodes. Common applause loop measured about −35.2 dBFS at gain0.16; a big-win loop measured −24.9 dBFS at gain0.46. Observed onset-window maxima differed from approximately −28.7 to −19.3 dBFS. These are signal measurements, not a subjective listening assessment.
- Browser mute/unmute during a common-card hold restored its ongoing applause. The revised pack opening completed through the stadium and reveal.
- Mobile foil inspection caught title interference; reducing the lift removed it. A geometry regression bounds the attached foil and verifies that flight deformation is nonrigid.
- Fresh read-only review found no substantive ownership, pause, loading, or cleanup defects. Audio assets were independently decoded/measured and reproduced byte-for-byte by the preparation script.
- Testing uses disposable in-memory state; user balances, collection and saves were not changed.
