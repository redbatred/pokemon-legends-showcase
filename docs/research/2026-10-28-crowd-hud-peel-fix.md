# Crowd, reward placement and pack peel correction

The previous audio-tier change also gated the audience animation at tier 2. Common cards and many rare cards therefore held the seated frame, including low-value Pokémon preview reveals. Visual audience intensity is now independent of audio gain: ordinary cards use staggered seated applause, rares cycle cheering poses, and Pokémon performances get the full celebration. Energy remains still. Existing sound tiers are unchanged.

The reward uses the measured center of the front stone in the platform artwork (u=.5, v=.817). Money glyph bounds are vertically centered there, and width is limited to the stone. Name and rarity sit below the platform with a reserved desktop caption area; compact landscape retains its left caption rail. The credit panel has separate label, balance and button regions, including a narrower compact variant.

The foil now releases from the right corner, rolls around a cylindrical cross-section, and flicks outward to the right. Only the turned underside receives silver shading. Unbroken seam vertices remain joined, and the rigid extraction/camera transition from the previous update is preserved.

Validation:

- Reproduced the quiet-crowd regression in a failing scene test, then verified the fix.
- TypeScript and 104 tests across 30 files passed.
- Browser: high-value Charizard reveal showed changing audience poses and a playing cheer loop at 20 seconds; next ordinary card stopped the loop while retaining quiet movement.
- Browser: reward, captions and credit panel inspected at 1280×720, 390×780, 360×540 and 568×320. A nine-pixel compact-header overlap was found and corrected.
- Large balance of $9,876,543.21 fitted in the isolated in-memory fixture. No user save, balance or collection was changed.
- Foil curl and extraction frames inspected at 1.04 and 1.48 seconds. Complete opening travel checked after the direction change.
- Fresh read-only review found no additional substantive defects after the compact-header correction.
