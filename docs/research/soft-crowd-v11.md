# Short vocal crowd reactions — v11

Prepared on 2026-10-28 for ordinary and rare card wins. These are two short one-shot vocal reactions with soft ends, using a source described as people making “Oooh” sounds. Neither cue uses the v10 applause recording or a continuing stadium loop.

## Source and license

[“Crowd Oooh.wav” — deleted_user_2104797, Freesound #324890](https://freesound.org/people/deleted_user_2104797/sounds/324890/) was published on 2015-10-14. The primary page describes a crowd making three “Oooh” reactions and lists [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). The provider’s public [HQ MP3 preview](https://cdn.freesound.org/previews/324/324890_2104797-hq.mp3) is the pinned input: mono, 48 kHz, approximately 170 kb/s, with a container duration of 16.186729 seconds. The original WAV was not downloaded. The delivered files therefore retain a lossy source generation.

The preparation script refuses source bytes that do not match this SHA-256:

```text
2cb0c4c6801f45bf4beddbfd9ba97fcc616d981e0ebdcd76ac22e776694ed833  324890_2104797-hq.mp3
```

## Playback

| Cue | Recording interval | Decoded duration | Suggested effective gain | Use |
|---|---|---:|---:|---|
| `crowdreact` | 12.40–14.05 s, third reaction | 1.650 s | 0.20 | Brief response for a common / ordinary card |
| `crowdreactrare` | 6.45–8.35 s, second reaction | 1.900 s | 0.30 | Slightly longer response for a rare card |

Both are one shots; play once per card entry and never loop them. The two cues have the same asset RMS target; the rare cue is distinguished by a separate recording excerpt, a longer duration and the modest gain difference. Gains in `public/assets/audio-v11/cues.json` are suggestions for **one effective playback gain**, before intentional cry ducking. If runtime supplies a gain directly, it should use that gain rather than multiply these values again.

At the suggested gains, the MP3 RMS is approximately −35.42 dBFS for `crowdreact` and −31.90 dBFS for `crowdreactrare`. These conservative starting levels are intended to sit beneath the card’s principal sounds. Final balance depends on the game mix and listening volume.

## Reproduction and verification

Run:

```sh
python3 scripts/prepare-crowd-audio-v11.py
```

Requires Python 3, curl, FFmpeg and ffprobe. `ASSET_FFMPEG` and `ASSET_FFPROBE` can override binary locations. It writes only `public/assets/audio-v11` and a system-temporary cache.

The source receives a 100 Hz high-pass and 7 kHz low-pass, then the two separate excerpts are selected. Both receive a 120 ms sine attack and 500 ms sine release. Static gain targets −21 dBFS RMS with a −4 dBFS pre-encoding 4× peak ceiling; neither excerpt needs the peak ceiling to reduce its normalization gain. There is no added crowd layer, artificial reverb, compression, looping, pitch shift or speed change.

Delivery is 48 kHz mono, 160 kb/s MP3 plus nominal 96 kb/s Opus in an OGG container. The script validates finite decoding, intended sample rate/channel count, decoded duration within 4 ms, RMS between −22 and −20 dBFS, 4× oversampled peak at or below −3 dBFS and a quiet first/last millisecond (at or below −45 dBFS peak). The Opus container duration includes 6.5 ms of pre-skip; the decoded duration is the intended playback length.

| File | Bytes | Decoded duration | 4× peak estimate | RMS | First/last 1 ms peak |
|---|---:|---:|---:|---:|---:|
| `crowdreact.mp3` | 34,100 | 1.650 s | −6.571 dBFS | −21.445 dBFS | −56.626 dBFS |
| `crowdreact.ogg` | 19,374 | 1.650 s | −6.242 dBFS | −21.000 dBFS | −57.127 dBFS |
| `crowdreactrare.mp3` | 39,380 | 1.900 s | −7.587 dBFS | −21.445 dBFS | −56.604 dBFS |
| `crowdreactrare.ogg` | 23,753 | 1.900 s | −7.171 dBFS | −20.988 dBFS | −56.202 dBFS |

The four audio files total 116,607 bytes. A second preparation run reproduced all six output files byte-for-byte with the installed encoder. Full source and output hashes, processing parameters and encoder version are recorded in `public/assets/audio-v11/provenance.json`.

No human audition is claimed. Source choice is based on the creator’s description of vocalizations and the measured waveform envelope. The selected recording is not described as applause, and no applause source is mixed into these cues. Numerical checks cannot establish the absence of every incidental background sound or judge the perceived emotion; listening in the final card scene remains the subjective check.
