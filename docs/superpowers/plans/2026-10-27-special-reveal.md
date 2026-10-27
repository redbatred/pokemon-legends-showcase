# Special reveal and game presentation implementation plan

**Goal:** Add the requested Spine-powered big-win sequence and improve carousel, modal, lighting, and card-transfer presentation.

**Architecture:** Keep the existing Pixi canvas and state machine. A lazy-loaded special-reveal renderer owns Spine rigs and torn card layers; the opening stage owns timing and pause/resume. CanvasUI owns modal animations and the carousel track. Accounting and random outcomes remain unchanged.

**Tech stack:** TypeScript, Pixi 8, GSAP, XState, official Spine Pixi 8 runtime. User confirmed a Spine Editor license in this chat.

**Spec:** Latest user requests in this chat; no React, all UI inside the canvas, Pokémon anime styling, no orange UI, preserve current pack sizes.

- [x] Remove the card landing opacity flash; strengthen local hover perspective on wrappers.
- [x] Replace individual connector lines with a continuous carousel docking strip and scroll-position indicator.
- [x] Add a compact settings side drawer and animated Pokémon-style modal shells.
- [x] Build native-resolution stage emission masks; recolor long light strips and illuminate upward from the center circle.
- [x] Add a Spine Poké Ball rig, official Pokémon artwork rig, vertical card tear, impact, emergence, and persistent torn-card state. Trigger only for qualifying value and supported species.
- [x] Verify a forced visual QA example without altering production odds, plus normal next-card and reveal-all flows, settings pause/resume, narrow layouts, and reduced motion.
- [x] Run unit tests and production build; obtain a focused code review.

**Publication target:** Package the verified source and publish to the existing owner-private Site using the Sites workflow. Deployment status is recorded in the task handoff.

**Review focus:** No early crediting; cancelled async effects cannot resurrect after reset; modal transitions do not leave stale targets; large-win effects pause behind menus; all transient textures/Spine instances are released.

**Asset limitation:** Artwork rigs use genuine whole Pokémon artwork with restrained mesh/breathing motion, not studio-authored articulated character animation. Keep this distinction explicit in the handoff.

**Final QA:** 22 unit tests passed; production build passed. Verified the Spine reveal, normal card transfer, all-card cascade before results, exact $47.25 fixture settlement to $147.25, reduced-motion pause, portrait 360×540 settings, and landscape 844×430 settings. Rack artwork uses one Canvas2D atlas texture to prevent mesh-batch UV corruption; queued flights capture their origin after launch initialization.
