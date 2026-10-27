# Native upright Charizard performance

The current Charizard big-win action selects the source `happy` clip (`pm0006_00_00_00550_glad01.gfbanm`) rather than the head-diving `attack`. This is a genuine source celebration with an authored flame overlay; it is not newly discovered official Flamethrower animation metadata. Earlier audit documents describe the previous attack mapping and are historical.

The 5.875-second clip was restored from the already archived source by appending its exact animation accessor bytes to the optimized GLB. The previous binary payload, geometry, materials, textures, 132 nodes, four skins, and existing `idle`/`attack` animations remain unchanged. The shipped GLB is 3,978,892 bytes (323,436 bytes added). All 381 new animation channels match the source input/output arrays exactly. No texture reduction, body-motion synthesis, or additional animation resampling was used. Full hashes and checks are in `charizard-upright-celebration-proof.json` and the current asset provenance.

## Timing and mouth origin

Use `happy`: seek 1.8, speed 1.3, powerAt 2.6, sustainEnd 3.55, end 3.85. Continue the source motion to recoveryEnd 5.875 at recoverySpeed 1.8, then crossfade to idle. This gives approximately 0.615 seconds of anticipation, 0.962 seconds of emission, and 1.125 seconds of native recovery. `recoverAt=5.55` is retained only as a legacy blend-ready marker, not the full clip end.

At 60 Hz, the open-jaw plateau is about 31.04 degrees and the >=80% opening window is 2.2167–4.3833 source seconds. During the selected 2.60–3.85 emission window, the source head-to-nose axis points 27.28–40.25 degrees above the world horizontal. The mouth socket was measured in `head` local coordinates at 3.5 seconds from the four upper/lower lip bones. The socket approximates a moving mouth center; secondary jaw movement remains genuine. `powerPeakAt=3.5` names a representative upright plateau pose, not a unique maximum.

The existing roughly +22-degree camera yaw can retain a frontal heroic view for this upright action; +30–35 degrees is a modest alternative to make the projected flame direction more lateral. This is an authored presentation recommendation, not source metadata. Camera fitting should cover the full active and recovery interval.

## Related renderer findings

Before the recovery change, the actor switched to idle shortly after the power effect ended, cutting substantial native motion. For Blastoise, approximately 4.30–4.45 source seconds reaches a substantially settled pose (native end 5.4583). For Greninja, approximately 1.80–2.0167 source seconds preserves its throwing recovery. Avoid treating effect end as animation end.

Camera yaw around -10 to -15 degrees and elevation around 4 degrees improves visibility of both Blastoise nozzle axes compared with the shared +22-degree view. Greninja yaw around +50–55 degrees and elevation around 3 degrees gives the throwing hand a clearer lateral trajectory. These recommendations derive from projected native poses, and should be judged in the actual game camera. Derive framing and effect projection from the same camera basis.

Ground shadows should follow projected pelvis/waist position and calibrated foot support rather than a fixed screen ellipse or the minimum of the entire tail/wing mesh. Keep grounded Charizard and Blastoise distinct from hovering actors; Greninja's native crouch and weight shift should inform shadow placement without synthetic skeleton bending.

## Sources and verification

- [Pinned source Charizard GLB](https://raw.githubusercontent.com/06wj/pokemon/00d96f7f18894055e7f1db44fa0df6462e5e4c8a/public/models/006/model.glb); archived source hash and repository identity are preserved in asset provenance. The repository is a community distributor, not a claim of official asset publication.
- [Three.js AnimationAction](https://threejs.org/docs/pages/AnimationAction.html) documents clip time, playback rate and crossfading.
- [Three.js OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html) and [Object3D](https://threejs.org/docs/pages/Object3D.html) describe camera projection and object transforms used by the runtime.

No shared runtime TypeScript, dependency, other model GLB, or publication configuration was changed by this asset update.
