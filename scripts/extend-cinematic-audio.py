#!/usr/bin/env python3
"""Extend audio-v3 with suspense, slam, a shorter ball release and anime BGM.

Run after polish-audio.py. Requires the same Python/ffmpeg/curl dependencies.
Pokémon soundtrack/effect reuse is based on the user's stated Pokémon license;
the download mirrors are community uploads, not rights-holder delivery sources.
"""

import array
import importlib.util
import json
import math
from pathlib import Path
import sys
import tempfile
from urllib.parse import quote


sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("polish", Path(__file__).with_name("polish-audio.py"))
P = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(P)

TRACK_MEMBER = "Pocket Monsters TV Anime Orchestral Arrangements/09 Pokémon Center（１９９７－１９９８｜Ｍ７７Ａ）.mp3"
MUSIC_URL = "https://archive.org/download/16-battle-vs-trainer1997-1998m56b/" + quote(TRACK_MEMBER)
MUSIC_FILE = "pokemon-center-m77a.mp3"
MUSIC_SHA = "0613e3c012b7c851c1d3b0876a984540973d02d7cb20f92a073a49c788dcba19"
RELEASE_URL = "https://www.myinstants.com/media/sounds/pokeball_sound_effects_mp3cut_1.mp3"
NEW_RECIPES = {
    "suspense": {
        "duration": 1.30, "playbackGain": .32,
        "intent": "A rising, increasingly bright rumble accompanies the special card's shake and cuts into the reveal impact.",
        "layers": [
            P.layer("scifi/Audio/lowFrequency_explosion_000.ogg", .07, 1.43, 1.14, 1, 0, "areverse,highpass=f=70,lowpass=f=2200,afade=t=in:d=0.30,afade=t=out:st=1.17:d=0.084", "Reversed recorded energy tail provides a sustained low rise, with no synthesized tone"),
            P.layer("scifi/Audio/forceField_003.ogg", .04, .72, 1.10, .35, 570, "areverse,highpass=f=650,lowpass=f=6500,afade=t=in:d=0.28,afade=t=out:st=0.60:d=0.055", "A late bright rise increases tension as the card shake accelerates"),
        ],
    },
    "slam": {
        "duration": .35, "playbackGain": .48,
        "intent": "An immediate compact impact with a bright metallic sparkle, timed to the special card's face reveal.",
        "layers": [
            P.layer("impact/Audio/impactPunch_heavy_003.ogg", .008, .31, .97, 1, 0, "highpass=f=55,lowpass=f=6500,afade=t=in:d=0.001,afade=t=out:st=0.17:d=0.15", "Short physical punch, with the onset aligned to the BAM frame"),
            P.layer("impact/Audio/impactGlass_light_002.ogg", 0, .207, 1.10, .40, 8, "highpass=f=1600,lowpass=f=10000,afade=t=in:d=0.001,afade=t=out:st=0.11:d=0.079", "One high glass tick adds sparkle without a long musical sting"),
        ],
    },
    "release": {
        "duration": 1.10, "playbackGain": .38,
        "intent": "The existing Pokémon-associated ball-opening sample with a tighter, cleaner tail.",
        "layers": [P.layer("pokeball-open.mp3", .54, 1.10, filters="highpass=f=80,lowpass=f=8000,afade=t=in:d=0.004,afade=t=out:st=0.67:d=0.43", purpose="Original opening transient retained; long hiss tail shortened with a smooth decay")],
    },
}


def fetch(url, filename, expected_sha=None):
    target = P.CACHE / filename
    if not target.exists():
        pending = target.with_suffix(target.suffix + ".download")
        P.run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "180", url, "-o", str(pending)])
        pending.replace(target)
    if expected_sha and P.sha256(target) != expected_sha:
        raise ValueError(f"Source hash changed; inspect replacement before use: {target}")
    return target


def build_ambience(working):
    source = fetch(MUSIC_URL, MUSIC_FILE, MUSIC_SHA)
    # The 62.5-second CD cue contains two approximately 27.825-second statements
    # and a fade. Keep the first complete statement, then blend an extra 240 ms
    # of its next statement into its head. The loop keeps the original tempo.
    start, period, crossfade = .50, 27.825, .240
    trimmed = working / "ambience-phrase.wav"
    P.run([P.FFMPEG, "-v", "error", "-y", "-i", str(source), "-af", f"atrim=start={start}:duration={period+crossfade},asetpts=PTS-STARTPTS,highpass=f=45,lowpass=f=12000", "-ar", str(P.RATE), "-ac", "2", "-c:a", "pcm_f32le", str(trimmed)])
    samples = P.decode(trimmed)
    length, overlap = round(period * P.RATE) * 2, round(crossfade * P.RATE) * 2
    if len(samples) < length + overlap:
        raise ValueError("Music phrase is shorter than its intended loop")
    loop = array.array("f", samples[:length])
    for frame in range(overlap // 2):
        t = frame / (overlap // 2 - 1)
        incoming = math.sin(t * math.pi / 2) ** 2
        for channel in (0, 1):
            index = frame * 2 + channel
            loop[index] = samples[length + index] * (1 - incoming) + samples[index] * incoming
    # Two statements give a 55.65-second buffer, reducing audible restart and
    # retaining a small download. App-level gain should fade in and duck for SFX.
    loop.extend(loop)
    raw = working / "ambience-loop.f32"
    raw.write_bytes(loop.tobytes())
    mix = working / "ambience-loop.wav"
    P.run([P.FFMPEG, "-v", "error", "-y", "-f", "f32le", "-ar", str(P.RATE), "-ac", "2", "-i", str(raw), "-c:a", "pcm_f32le", str(mix)])
    duration = period * 2
    target_db = -12.0
    gain = 10 ** (target_db / 20) / max(map(abs, P.decode(mix, P.RATE * 4)))
    files = {}
    for ext, codec, rate in [("mp3", ["-c:a", "libmp3lame", "-b:a", "192k"], 44100), ("ogg", ["-c:a", "libopus", "-b:a", "128k", "-vbr", "on"], 48000)]:
        destination = P.OUT / f"ambience.{ext}"
        codec_gain = gain
        for attempt in range(3):
            P.run([P.FFMPEG, "-v", "error", "-y", "-i", str(mix), "-map_metadata", "-1", "-af", f"volume={codec_gain:.12f}", "-ar", str(rate), "-ac", "2", *codec, str(destination)])
            measured = P.measure(destination)
            if abs(measured["oversampledPeakDbfs"] - target_db) <= .18:
                break
            codec_gain *= 10 ** ((target_db - measured["oversampledPeakDbfs"]) / 20)
        if not -12.3 <= measured["oversampledPeakDbfs"] <= -11.7 or abs(measured["decodedDuration"] - duration) > .003:
            raise ValueError(f"Music verification failed: {measured}")
        # A music loop intentionally ends at a continuous waveform, not silence.
        decoded = P.decode(destination)
        seam_step = max(abs(decoded[c] - decoded[-2+c]) for c in (0, 1))
        files[ext] = {"path": "/" + str(destination.relative_to(P.ROOT / "public")), **P.probe(destination), **measured, "wrapSampleStepDbfs": P.db(seam_step), "sha256": P.sha256(destination), "bytes": destination.stat().st_size}
    print(f"ambience {duration:.2f}s | " + " | ".join(f"{ext} peak {f['oversampledPeakDbfs']:.2f} dBFS" for ext, f in files.items()), flush=True)
    return {
        "title": "Pokémon Center (1997–1998 M77A)",
        "files": files,
        "source": {
            "file": MUSIC_FILE, "url": MUSIC_URL, "page": "https://archive.org/details/16-battle-vs-trainer1997-1998m56b", "sha256": P.sha256(source),
            "track": "Disc 1, track 9", "album": "TV Anime Pocket Monsters Original Soundtrack Best 1997-2010", "catalog": "ZMCP-5452", "releaseDate": "2010-09-08", "label": "Pikachu Records / Media Factory", "arranger": "Shinji Miyazaki", "originalThemeComposer": "Junichi Masuda",
            "verification": "Archive filename, embedded ID3 title/artist/album/publisher/year/track, and 62.5-second duration agree with the published disc 1 track 9 listing. The album identifies this as the orchestral anime BGM arrangement. This is not the older Sound Anime Collection track with appended scene dialogue.",
            "metadataReferences": ["https://www.pocketmonsters.net/cd/view/203", "https://www.pocketmonsters.net/content/CD_Comparison", "https://www.cdjapan.co.jp/product/ZMCP-5452", "https://musicbrainz.org/release/2013bd12-5f76-4f06-877d-859f1dbccf9b"],
            "rights": "Copyrighted Pokémon anime soundtrack, reused under the user's stated Pokémon license. Internet Archive is a community mirror, not the rights holder. Uploader authority and chain of custody have not been independently verified; no CC0/open-license claim is made for this track.",
        },
        "processing": {"sourceStart": start, "phrasePeriod": period, "crossfadeSeconds": crossfade, "duration": duration, "loopsWithinBuffer": 2, "method": "First instrumental phrase with a 240 ms complementary sine-squared circular crossfade from the next phrase into its head; duplicated twice; gentle 45 Hz high-pass / 12 kHz low-pass; original pitch and tempo retained; decoded oversampled peak normalized to -12 dBFS. No vocals, generated music, or extra instrumentation were added."},
        "recommendedPlaybackGain": .16,
        "playback": "Loop the decoded buffer; fade the music bus in/out over 0.7 seconds and duck during ball/card reveals. At gain .16, music peak is around -28 dBFS before the master bus.",
        "limitations": "Album/track identity and technical audio are verified from metadata; no human listening or vocal-detection review is claimed. The crossfade is technically continuous but its musical seam has not been auditioned. The source is a community MP3 rather than an authenticated lossless master.",
    }


def main():
    provenance_path = P.OUT / "provenance.json"
    if not provenance_path.exists():
        raise SystemExit("Run python3 scripts/polish-audio.py first")
    provenance = json.loads(provenance_path.read_text())
    P.prepare_sources()
    fetch(RELEASE_URL, "pokeball-open.mp3")
    original_note = P.source_note

    def source_note(file):
        if file == "pokeball-open.mp3":
            return {"file": file, "url": RELEASE_URL, "page": "https://www.myinstants.com/en/instant/pokeball-open/", "creator": "Community uploader nauth; original producer/episode unverified", "sha256": P.sha256(P.CACHE / file), "license": "Pokémon-associated effect reused under user's stated license; community provenance unverified", "derivation": "Same original source used by audio-v2/release; edited from the cached source, not transcoded from audio-v2."}
        return original_note(file)

    P.source_note = source_note
    with tempfile.TemporaryDirectory(prefix="pokemon-cinematic-audio-") as folder:
        working = Path(folder)
        provenance["effects"].update({name: P.build(name, recipe, working) for name, recipe in NEW_RECIPES.items()})
        provenance["backgroundMusic"] = build_ambience(working)
    provenance["description"] = "Ten compact interaction/reveal cues plus a quiet instrumental Pokémon anime BGM loop. Existing seven polished cues remain; suspense, slam and a tighter ball release support the special-card charge-and-impact sequence."
    provenance["sourcePolicy"] = "Original seven cues plus suspense/slam use Kenney CC0 source samples. Ball release and the actual anime soundtrack use community-hosted Pokémon audio under the user's stated license, with source uncertainty recorded individually. No oscillator beeps or generic replacement music."
    provenance["reproduce"] = "Run python3 scripts/polish-audio.py then python3 scripts/extend-cinematic-audio.py. Requires Python 3, curl, ffmpeg and ffprobe; optional REVEAL_AUDIO_SOURCE_CACHE, ASSET_FFMPEG, ASSET_FFPROBE. Missing files download from recorded public URLs; music source SHA-256 is pinned."
    provenance["verification"] = "All 22 MP3/OGG files decode with ffmpeg -xerror, finite PCM and decoded durations within 3 ms. Ten effect pairs have oversampled peaks near -6 dBFS and clean tails. Music pair peaks near -12 dBFS and preserves a continuous loop boundary; all output SHA-256 hashes recorded."
    provenance["limitations"] = "Automated decode/timing/headroom checks are complete; no human listening review is claimed. Source and musical-seam limitations for the community Pokémon music/effect are recorded in their entries. Lossy bytes may vary between encoder versions."
    provenance_path.write_text(json.dumps(provenance, indent=2) + "\n")
    print("Cinematic extension complete: suspense, slam, release and ambience in MP3/OGG.")


if __name__ == "__main__":
    main()
