# Attached foil, continuous card travel, and shared arena scale

The peel previously reached full separation and had an independent translation/rotation track. The new tear stops at 88% and retains a left corner as a material hinge. Seal and body share their unbroken seam coordinates, including mouth opening and crumpling. The flap curls across its width, folds down around the retained corner, and leaves with its parent wrapper. The silver reverse remains tied to surface orientation.

Card extraction and stadium travel use a shared clock. Two Hermite segments meet at wrapper clearance with the same upward velocity. The deck cannot enlarge or fan inside the wrapper; backs fan briefly after clearance. The actual front PerspectiveMesh transfers into the first reveal with matching transforms. Pointer tilt and idle bob fade in after transfer rather than changing the arrival pose in one frame. Reset and teardown dispose any untransferred mesh.

The responsive stage defect came from independent sizing: platform width followed viewport width while the card followed available height. Opening layout now fits one composition (840-unit platform, 435-unit card height, 32-unit floor gap) to both available dimensions. Platform art, light rig, card, reward stone and Pokémon floor derive from that fit. Browse retains its existing pack framing; the opening camera interpolates to the shared arena framing.

Verification:

- A retained-hinge regression failed before the geometry change, then passed with open/crumpled wrapper states.
- A responsive proportion regression failed before the layout change. Eleven viewport sizes now preserve platform/card ratio and local floor gap, while respecting top HUD space.
- Motion tests cover rigid extraction, matching clearance velocity, gentle arrival, post-clearance fan, and same-object transfer preserving all four screen-space corners.
- Full suite: 31 files, 112 tests passed. TypeScript build checks passed.
- In-memory browser QA inspected the partial tear, retained fold, extraction, clearance and flight. Desktop and mobile opening reported the same front mesh reused and no leftover wrapper. Following-card reveal, reduced-motion opening, and pack-to-special Pokémon entrance completed.
- Visual resizing covered 1440×600, 390×780, and 568×320; platform/card proportions and reserved controls remained aligned.
- Fresh read-only review found no actionable issues in the tear, handoff, cleanup or responsive sizing changes.

QA fixtures are ignored local files and use disposable memory state. User save data and audio preferences were not modified.
