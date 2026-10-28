# Audible recorded crowd cues — v10

Prepared and source licenses rechecked on 2026-10-28. Four cues give low cards a short, distinct clap and reserve the sports roar for valuable cards. The two applause cues use a different recording from the two sports cues. This task changes assets and their preparation script only.

## Primary sources and reuse

- [Small Crowd Clapping 2 — snakebarney, Freesound #138114](https://freesound.org/people/snakebarney/sounds/138114/), published 2011-12-16. The creator describes a small group applauding in a room. The primary page lists **CC0 1.0**. Its [public HQ preview](https://cdn.freesound.org/previews/138/138114_1572282-hq.mp3) is 48 kHz mono MP3, approximately 195 kb/s, and decodes to 9.466667 seconds. The original AIFF was not downloaded.
- [Crowd Cheer — FoolBoyMedia, Freesound #397434](https://freesound.org/people/FoolBoyMedia/sounds/397434/), published 2017-07-12. The creator describes a sporting victory recorded with a Tascam DR-05. The primary page lists **CC0 1.0**. Its [public HQ preview](https://cdn.freesound.org/previews/397/397434_4019029-hq.mp3) is the same pinned input used for audio-v8: 44.1 kHz stereo MP3, approximately 218 kb/s. The original WAV was not downloaded.

Both primary pages link to the [CC0 1.0 deed](https://creativecommons.org/publicdomain/zero/1.0/), which permits modification and commercial distribution without permission or attribution. Attribution is retained here to document provenance. The derived encodings retain a lossy source generation; 48 kHz delivery does not restore original detail.

Pinned input SHA-256 values:

```text
4df0ccceb5204350a45f88cba4db351266f1afb492b25ef06e7ebd6d95ec5f0d  138114_1572282-hq.mp3
b621e391cb850ff79d8c215faf295119e747340803429ffbb383b5eaf4a132d2  397434_4019029-hq.mp3
```

## Cue use and mix

| Cue | Source interval | Decoded length | Channel layout | Suggested effective gain | Use |
|---|---|---:|---|---:|---|
| `crowdsmall` | Small-group applause 0.95–2.55 s | 1.600 s | Mono | 0.55 | Brief light clap for a common or low-value card; one shot. |
| `crowdapplause` | Small-group applause 1.60–4.95 s | 3.000 s | Mono | 0.60 | Moderate continuing applause for a rare card; 350 ms loop crossfade. |
| `crowdrise` | Sports crowd 1.55–3.45 s | 1.900 s | Stereo | 0.75 | High-card celebration onset; one shot. |
| `crowdcheer` | Sports crowd 8.00–14.75 s | 6.000 s | Stereo | 0.65 | Sustained high-card stadium roar; 750 ms loop crossfade. |

The suggested gains in `public/assets/audio-v10/cues.json` are **one effective playback gain**, before intentional cry ducking. Do not multiply them by the old `crowdMix` values. The existing `playCrowdReaction` implementation supplies explicit gains directly to `start`, bypassing the manifest gain, so importing this manifest alone cannot fix the quiet runtime mix.

At these effective gains the MP3 average levels are approximately −24.35 dBFS for the short clap, −23.38 dBFS for applause, −20.96 dBFS for the sports rise, and −22.26 dBFS for the roar. In contrast, audio-v8 at the old maximum gains of 0.25 and 0.105 yields approximately −32.81 dBFS rise and −44.81 dBFS continuing roar. The 0.048 low-tier rise yields approximately −47.14 dBFS. The asset change raises sports rise RMS by 2.31 dB and roar RMS by 6.71 dB; the playback gain change is the larger part of the audibility correction.

Ramp loop voices in over roughly 120–240 ms and stop them with their card scene. Use the short clap once on low-card entry; do not repeatedly retrigger it while the same card remains visible. One sustained crowd voice per scene is sufficient. If using a sports onset and roar together, introduce the roar beneath the onset, then retain it as the ongoing layer. Loop the decoded 3- or 6-second buffer; the OGG/Opus container durations include 6.5 ms of pre-skip and are not the intended loop period. These are starting mix recommendations, not a calibrated listening result.

## Preparation

Run `python3 scripts/prepare-crowd-audio-v10.py`. Requirements are Python 3, curl, FFmpeg, and ffprobe; `ASSET_FFMPEG` and `ASSET_FFPROBE` can override binary locations. The script only writes `public/assets/audio-v10` and its temporary download/processing cache. It refuses input bytes that do not match the pinned hashes.

Applause receives an 80 Hz high-pass and 11.5 kHz low-pass. The sports source retains v8's 70 Hz high-pass and 8 kHz low-pass. Excerpts retain their pitch and speed. One-shot cues have short sine onset/release fades. Loops use an equal-power tail-to-head crossfade, rotated so the wrap follows adjacent source samples.

Edited PCM is normalized to −18.2 dBFS RMS. A 4× oversampled, 1 ms lookahead limiter caps exceptional close-clap peaks at −3 dBFS only where necessary; the sports rise does not need limiting. There is no general compressor, denoiser, source separation, pitch shift, synthesized crowd, music layer, or artificial reverb. Loop limiting processes three repeats and retains the middle period, preserving a periodic envelope. Each completed loop is phase-rotated to a naturally low-amplitude sample pair within its first 350 ms, reducing codec-boundary discontinuity without adding a fade or silent gap.

Mono applause is encoded as 160 kb/s MP3 and nominal 96 kb/s Opus in OGG. Stereo sports cues use 192 kb/s MP3 and nominal 128 kb/s Opus. Both delivery formats use 48 kHz. Full source metadata, processing parameters, loop phase, encoder version, SHA-256 hashes and measurements are in `public/assets/audio-v10/provenance.json`.

## Delivered measurements

| File | Bytes | Decoded duration | 4× peak estimate | RMS | Integrated loudness | Wrap sample delta |
|---|---:|---:|---:|---:|---:|---:|
| `crowdsmall.mp3` | 33,140 | 1.600 s | −3.403 dBFS | −19.157 dBFS | −17.2 LUFS | −74.076 dBFS |
| `crowdsmall.ogg` | 22,443 | 1.600 s | −2.699 dBFS | −18.687 dBFS | −16.7 LUFS | −70.768 dBFS |
| `crowdapplause.mp3` | 60,980 | 3.000 s | −3.408 dBFS | −18.941 dBFS | −17.4 LUFS | −49.923 dBFS |
| `crowdapplause.ogg` | 40,275 | 3.000 s | −2.690 dBFS | −18.499 dBFS | −16.9 LUFS | −48.279 dBFS |
| `crowdrise.mp3` | 47,252 | 1.900 s | −5.407 dBFS | −18.457 dBFS | −14.3 LUFS | −66.998 dBFS |
| `crowdrise.ogg` | 37,886 | 1.900 s | −4.979 dBFS | −18.186 dBFS | −14.0 LUFS | −55.664 dBFS |
| `crowdcheer.mp3` | 145,172 | 6.000 s | −2.989 dBFS | −18.520 dBFS | −14.3 LUFS | −43.218 dBFS |
| `crowdcheer.ogg` | 113,254 | 6.000 s | −2.595 dBFS | −18.254 dBFS | −14.0 LUFS | −46.416 dBFS |

The eight media files total 500,402 bytes. The preparation command checks finite decoding, intended sample rate/channels, exact decoded duration within 4 ms, delivered RMS between −19.25 and −17 dBFS, and 4× oversampled peaks at or below −2 dBFS. A second full preparation run reproduced all ten output files, including both JSON files, byte-for-byte with the installed encoder. LUFS and RMS differ because of spectral weighting and channel layout; these assets use the RMS target. Measured short-clip integrated loudness is reported for transparency rather than used to imply broadcast compliance.

No human audition is claimed. Verification uses the primary creator/license descriptions, source waveform inspection, and automated decoding, envelope, loudness, headroom, boundary and hash measurements. The source descriptions identify applause and sports cheering, not musical performances. No added music is present; the absence of incidental intelligible speech or background music in the original recordings has not been verified by listening. Natural vocalizations and whistles can remain in the sports recording. Final balance and subjective loop quality should be judged in the reveal scene with sound enabled.
