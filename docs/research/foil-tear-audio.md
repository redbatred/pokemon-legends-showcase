# Pack wrapper Foley

Prepared and verified 2026-10-28. Assets only; animation/audio wiring is outside this change.

## Recording and rights

The source is [SFX_STICKERRIPPER_candyWrapper_20.wav by MrFossy](https://freesound.org/people/MrFossy/sounds/590195/), published 2021-10-04. The creator describes recording a plastic candy wrapper peeled away from adhesive contact film using a Rode NT1 and Universal Audio Arrow. The primary page identifies it as **CC0**, with permission to modify and distribute. [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

This is real plastic-wrapper peel Foley. It is not a recording of a Pokémon booster opening, nor proof of the exact sound of its sealed laminate. There is no Master Ball steam, synthesized noise, added tonal effect, music or speech layer.

The reproducible input is the provider's [HQ MP3 preview](https://cdn.freesound.org/previews/590/590195_129727-hq.mp3), not the login-only original WAV. Input SHA-256: `7166e92f3f01bcc191be61c7703c52fbd1922271d96ec57a03a9947e8737c7bd`. The script rejects a different input hash.

## Cues and synchronization

| Cue | Decoded length | Gain | Suggested animation trigger |
| --- | --- | --- | --- |
| `packrustle` | 0.250 s | 0.18 | 0.00 s, once during the initial pinch/tension |
| `packtear` | 1.000 s | 0.30 | 0.24 s, once when the corner fractures |

`packtear` uses source 0.025–0.905 s, slowed to 0.88× with pitch preserved. Recorded irregular crackles continue through the travelling tear. The strongest final cluster falls at cue time 0.65–0.85 s (animation 0.89–1.09 s), then releases into the fold and ends by animation 1.24 s. Avoid a second snap over this cluster. `packrustle` is a small 0.38–0.63 s excerpt from the same wrapper, with softer edges and lower level; it is an edited preparation texture, not a separately recorded grip action.

Filtering removes low rumble and limits the upper band. Compression and look-ahead limiting restrain narrow crackle peaks while bringing up the quieter texture. The final 100 ms of the tear and 60 ms of the rustle fade out. No looping, reverb, reversed sound, added layers, or pitch shift.

Both cues are mono 48 kHz, supplied as 160 kb/s MP3 and 96 kb/s VBR Opus in Ogg. Combined audio payload: about 49 KB. Paths and gains are in `public/assets/audio-v9/cues.json`; exact recipe, hashes and measurements are in `public/assets/audio-v9/provenance.json`.

## Verification and limits

Run `python3 scripts/prepare-pack-audio-v9.py` to rebuild. It requires Python 3, curl, ffmpeg and ffprobe and writes only `public/assets/audio-v9` plus a temporary cache.

Both formats decode to finite samples, with exact 1.000/0.250 s decoded lengths. Four-times-oversampled peak estimates are −5.85/−5.43 dBFS for the tear and −10.40/−9.93 dBFS for the rustle (MP3/Opus). Tear RMS is approximately −25 dBFS before application gain. Spectra show irregular broadband transients and a short decay, without a sustained tonal bed. Inspected MP3 end samples are below −69 dBFS.

No human audition or in-browser synchronization check is claimed. Source descriptions/license, spectra, level envelopes, finite decoding, lengths, codec details, headroom and hashes were checked. The final perceived sound and timing still need to be assessed in the running sequence.
