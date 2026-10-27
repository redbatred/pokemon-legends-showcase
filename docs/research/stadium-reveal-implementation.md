# Stadium reveal implementation

2026-10-28. Frontend-only canvas update; persistent saves and pack outcomes are unchanged.

## Staging

- Two built-in imagegen crowd drawings are cropped into eight seating sections. Stairways and stadium walls remain from the original illustration. The pack transition fills the stands behind the diagonal light sweep. Big reveals and attacks change the crowd to a held cheering drawing with a short stagger across sections, then return to anticipation.
- Feathered floodlight cones originate at the two painted lamp banks. Their focus and brightness follow charge, card impact and attack cues. Background exposure retains visible crowd tiers during special reveals.
- Grounded species use a floor coordinate derived from the responsive platform layout. Their shared actor/effect container sits slightly in front of the card; flyers retain clearance. The card's idle bob is suppressed while a character is present.
- The ball keeps its incoming lateral direction after puncturing the artwork. Gravity, restitution and the stage floor determine its contact, rebound and opening time. The ball keeps its apparent size after card contact. Spin resolves into the front-facing shell through the rebound, followed by the latch and lid. Ball and character have separate floor shadows.
- Move-colored directional lighting illuminates the moving 3D character normals. Short cel pressure accents accompany the anatomical attack origin; ground attacks throw shaded stone fragments from the contact plane.

## Verification

- 84 automated tests across 24 files passed, including crowd arrival/pose envelopes, spotlight cues, responsive floor placement and ball contact/rebound timing.
- TypeScript and the production Vite build passed. Existing canvas/3D chunk-size warnings remain; models continue to load per reveal.
- Browser QA used an isolated, in-memory fixture: pack travel and its midpoint, filled/cheering stands, Eevee grounding, ball lid opening, Tyranitar's ground attack, Lugia's mobile flight/attack, normal card reveal, low graphics and reduced motion.
- Paused phone-to-desktop resize was checked during the open-ball release. The ball, shadows, latch, release drawing, crowd and lamp origins remain aligned. Browser warning/error logs were empty in the checked flows.
- Independent runtime review found two resize issues and a follower-refresh issue; all were fixed and re-reviewed. No save data was modified by QA.

Art prompts and files: [stadium-crowd-assets.md](stadium-crowd-assets.md).
Official anime references and the original staging study: [stadium-sequence-direction.md](stadium-sequence-direction.md).
