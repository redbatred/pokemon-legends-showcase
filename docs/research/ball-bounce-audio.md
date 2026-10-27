# Poké Ball floor contacts: audio v7

The floor bounce now has two dedicated, independently schedulable PCM cues. Both use the initial contact from the authentic Pokémon GO `se_go_ball_ground.wav` recording. `ballsettle` is the same excerpt reduced by 6 dB, not a separately recorded or officially labeled second bounce.

## Delivery and timing

| Cue | File | Duration | Strong onset¹ | Sample peak | True peak, 4× | Playback gain |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| First floor contact | `/assets/audio-v7/ballbounce.wav` | 160 ms | 1.604167 ms | 8.937500 ms | −4.500228 dBTP | 0.38 |
| Second floor contact | `/assets/audio-v7/ballsettle.wav` | 160 ms | 1.604167 ms | 8.937500 ms | −10.499976 dBTP | 0.38 |

¹ Strong onset is the first sample reaching −20 dB relative to that file's peak. Both reach −40 dB relative to peak at 1.270833 ms. The first file crosses −60 dBFS at 0.958333 ms; the softer file crosses it at 1.104167 ms. The four-times-oversampled peak occurs at 8.942708 ms in both files.

Use `public/assets/audio-v7/cues.json`. Start `ballbounce` at `BALL_HIT + landing.contact` and `ballsettle` at `BALL_HIT + landing.settled`, with zero source offset and zero pre-roll. The waveform's 1.6 ms attack belongs to the contact sound; its 9 ms peak is not a 9 ms silent delay. Keep these events separate from card settling and the older `land` sound. Preload both cues before the reveal and use the same pauseable scene clock as the ball. PCM eliminates encoder priming, lossy pre-echo, and codec skip-sample differences; output-device and browser latency still depend on the playback system.

At gain 0.38, the two isolated per-channel peaks are approximately −12.90 and −18.90 dBFS. The softer file already contains the 6 dB reduction, so applying an additional 0.5 gain to it would double that reduction. Both files are 48 kHz, 16-bit, dual-mono WAV, 30,764 bytes each. Resampling preserves the source's actual limited bandwidth; it does not create detail.

## What was wrong with v4

There is no substantial silent lead-in in the existing v4 assets. Per-channel decoded measurements, with no amplitude-changing downmix:

| Existing asset | First −40 dBFS sample | Main peak time | True peak, 4× |
| --- | ---: | ---: | ---: |
| `impact.mp3` | 1.3125 ms | 8.9375 ms | −6.263 dBFS |
| `impact.ogg` | 1.3125 ms | 8.9375 ms | −5.988 dBFS |
| `land.mp3` | 1.4375 ms | 8.9375 ms | −9.267 dBFS |
| `land.ogg` | 1.4375 ms | 8.9375 ms | −9.024 dBFS |

The recipe describes `land` as an artistic reuse for card settling. It crops the original to 260 ms, fades from 150–240 ms, and adds a 20 ms silent tail. Using its 0.15 base gain with the observed 0.62 event multiplier produces a gain of 0.093 and an MP3 peak near −29.90 dBFS. That is about 17 dB below the new first-contact recommendation. Low gain and a generic card event weaken the floor bounce; any substantial visible/audio timing mismatch must be corrected in event scheduling rather than by trimming nonexistent leading silence.

The original is 870.748299 ms long. Its strongest contact begins immediately and decays into a trough around 150–160 ms. Measured energy rises again around 180–220 ms, 270–310 ms, and 480–600 ms. Those later swells are waveform observations, not verified game-engine contact metadata. Retaining the whole recording would introduce accents that are not independently synchronized to the visible ball. The v4 520 ms `impact` excerpt also retains multiple later swells.

## Editing decisions

The v7 excerpt preserves source time 0–155 ms. A 0.5 ms edge fade suppresses negligible starting residue while leaving the original main attack intact. A 17 ms half-cosine fade runs from 138–155 ms in the natural decay trough before the next swell. Five milliseconds of digital silence finish the file. No equalization, compressor, pitch change, time stretching, generated sound, extra layer, or added reverb is used.

Four-times-oversampled normalization targets −4.5 dBTP for the first cue and −10.5 dBTP for the second. The 4.5 dB first-cue headroom accommodates playback and mixing without baking clipping into the asset. The two outputs are nearly exact 6 dB-scaled copies, subject only to final 16-bit rounding. Dedicated WAV files are small enough that compressed delivery offers little practical benefit for these timing-sensitive transients.

## Source and provenance

Source: [PokeMiners Pokémon GO ground-contact recording](https://github.com/PokeMiners/pogo_assets/blob/c2a686eb08ace6e890d8fe3d2134c76988db87b5/Sounds/Encounter/se_go_ball_ground.wav), with a [pinned raw download](https://raw.githubusercontent.com/PokeMiners/pogo_assets/c2a686eb08ace6e890d8fe3d2134c76988db87b5/Sounds/Encounter/se_go_ball_ground.wav).

- Repository commit: `c2a686eb08ace6e890d8fe3d2134c76988db87b5`
- Source format: mono, 11,025 Hz, 16-bit PCM, 9,600 frames
- Source SHA-256: `42ee9eb7e175c16ea628760b1d45cf981c04beb737c57a267c7cf667a143781e`
- Source Git blob SHA-1: `71e38d704c8c7b45a7d124b300a914e5c7785381`
- `ballbounce.wav` SHA-256: `a27042b5c84f3e518674971f26cb6825e05e398275f6ee0988f82b25d38a4bb9`
- `ballsettle.wav` SHA-256: `984f8c2a419294c8dec5b5cd17e3d1c41424dd6f6b99ad81ac6b0c2deaa4eaa1`

The source bytes were already present in the existing pinned-source cache and were verified against both hashes before preparation. The script downloads the same pinned file when the cache is absent. This is copyrighted game audio reused under the user's stated Pokémon license, not an open-license claim. No Pokémon voice or unrelated sound was synthesized or substituted.

## Reproduction and verification

Run from the repository:

```sh
python3 scripts/prepare-ball-bounce-v7.py
```

Requires Python 3, `curl`, and `ffmpeg`; set `ASSET_FFMPEG` to override the binary. It writes only `public/assets/audio-v7`, including `cues.json` and detailed `provenance.json`. It leaves all v4–v6 assets and application code untouched.

The preparation command validates the pinned source SHA-256 and Git blob hash, decodes both final WAVs with `ffmpeg -xerror`, rejects non-finite PCM, checks 4× true-peak error within 0.03 dB, checks the strong onset within 5 ms, checks exact 160 ms duration, and verifies at least 5 ms of terminal digital silence. Repeating the command produced identical output-file SHA-256 hashes. These are asset-level measurements; no human listening review or browser synchronization test is claimed by this asset task.
