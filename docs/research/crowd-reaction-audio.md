# Crowd reaction audio — v8

Prepared 2026-10-28. Two cues use a real stereo crowd field recording. The original speed, pitch and stereo image remain intact; no generated crowd, music, added reverb or synthetic noise layer is used.

## Provenance and reuse

The source is [“Crowd Cheer” by FoolBoyMedia, Freesound #397434](https://freesound.org/people/FoolBoyMedia/sounds/397434/), published July 12, 2017. The creator describes a crowd celebrating a sporting win, captured with a Tascam DR-05. The primary provider lists **CC0 1.0**. Its linked [Creative Commons deed](https://creativecommons.org/publicdomain/zero/1.0/) permits copying, modification and commercial distribution without requesting permission or attribution. Attribution is retained here for provenance, without implying endorsement.

The downloaded input is the provider's public [HQ MP3 preview](https://cdn.freesound.org/previews/397/397434_4019029-hq.mp3), whose URL was extracted from the sound page's player markup. It decodes as **44.1 kHz stereo**, approximately **218 kb/s**, duration **20.405238 seconds**. The original WAV requires a Freesound login and was not downloaded. The delivered cues therefore retain a lossy source generation; encoding at 48 kHz does not create extra detail.

Pinned source SHA-256:

```text
b621e391cb850ff79d8c215faf295119e747340803429ffbb383b5eaf4a132d2
```

## Cues and playback

| Cue | Decoded length | Source selection | Suggested gain | Purpose |
|---|---:|---|---:|---|
| `crowdrise` | 1.900 s | 1.55–3.45 s | 0.30 | One brief reaction on the card reveal; 65 ms onset and 240 ms release fade. |
| `crowdcheer` | 6.000 s | 8.00–14.75 s | 0.18 | Low continuing applause under the reveal scene; 750 ms equal-power overlap creates a six-second period. |

`public/assets/audio-v8/cues.json` supplies the existing `{gain, files: {mp3, ogg}}` shape. Both encodings are stereo: MP3 at 192 kb/s and Opus in OGG at a nominal 128 kb/s. Opus in OGG follows the project's existing audio-v6 convention.

Play the rise once, then bring the continuing layer up over roughly 180–300 ms. The loop intentionally has no silent bookends: ramp it in and out with the scene's gain envelope, and stop it when the reveal ends. Use one continuing voice per scene, preserve the stereo image, and keep it quieter than Pokémon cries and attacks. The default gains produce approximate peak levels of −17.8 dBFS for the rise and −23.7 dBFS for the continuing layer before other application gain changes. These are starting mix values, not a calibrated final listening mix.

The loop crossfades the final 750 ms into the initial 750 ms with `cos(theta)` / `sin(theta)` weights, then follows with the original middle. The crossfade is rotated to the beginning, so the file wrap follows consecutive original samples. The resulting loop does not re-trigger the rise. Codec padding is represented by MP3 gapless metadata and OGG/Opus pre-skip; playback should loop the decoded six-second buffer, not the OGG container's 6.0065-second presentation duration.

## Preparation and verification

Run `python3 scripts/prepare-crowd-audio-v8.py`. The script uses Python's standard library, curl, FFmpeg and ffprobe. `ASSET_FFMPEG` and `ASSET_FFPROBE` can override the binaries. It downloads the public preview into a temporary cache, refuses changed source bytes, applies a 70 Hz high-pass and 8 kHz low-pass, trims and crossfades, normalizes using a four-times-oversampled peak measurement, encodes, and writes the manifest and provenance. It only writes `public/assets/audio-v8` plus its temporary cache. No app logic is modified.

| File | Bytes | Decoded duration | 4× oversampled peak | RMS | Wrap sample delta |
|---|---:|---:|---:|---:|---:|
| `crowdrise.mp3` | 47,252 | 1.900 s | −7.656 dBFS | −20.767 dBFS | −69.450 dBFS |
| `crowdrise.ogg` | 37,861 | 1.900 s | −7.316 dBFS | −20.517 dBFS | −57.965 dBFS |
| `crowdcheer.mp3` | 145,172 | 6.000 s | −9.094 dBFS | −25.230 dBFS | −46.433 dBFS |
| `crowdcheer.ogg` | 112,404 | 6.000 s | −8.834 dBFS | −24.967 dBFS | −50.573 dBFS |

The four media files total **342,689 bytes**. Finite-sample decoding with FFmpeg `-xerror`, durations, stereo format, and at least 6 dB of peak headroom are checked automatically. Full source and output SHA-256 values, encoder version, source selection, normalization and loop details are in `public/assets/audio-v8/provenance.json`. A repeated run with the installed encoder produced identical media hashes.

No human audition is claimed. Selection is supported by primary creator metadata, spectrogram and waveform inspection, with automated format, timing, headroom and boundary checks. The source is presented as a sports cheer rather than a music or commentary recording; absence of intelligible speech, prominent chant repetition and the final subjective blend still needs an actual listening check in the reveal scene. The recording contains natural crowd vocalizations and whistles. No original-source speech or music separation has been attempted.
