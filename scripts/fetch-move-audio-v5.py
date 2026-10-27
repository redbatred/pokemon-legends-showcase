#!/usr/bin/env python3
"""Build three full-envelope, genuine Pokémon GO moves in audio-v5 only.

Run: python3 scripts/fetch-move-audio-v5.py
Requires Python 3, curl, ffmpeg and ffprobe. Source hashes and Git blob IDs are
pinned. Only three small source WAVs download. No earlier asset is rewritten.
"""

import array
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/audio-v5"
CACHE = Path(tempfile.gettempdir()) / "pokemon-genuine-audio-sources"
REPOSITORY = "https://github.com/PokeMiners/pogo_assets"
COMMIT = "c2a686eb08ace6e890d8fe3d2134c76988db87b5"
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE = 48000
TARGET = -6
GUARD = .020

RECIPES = {
    "hydropump": {
        "file": "056-0_hydro_pump.wav", "label": "Hydro Pump", "species": ["blastoise", "gyarados"],
        "sha256": "08b0acac603cfa655bfcea3ae1670ed1a80de2d09cac66aa7f6a0241da5ded29",
        "gitBlobSha1": "f238952575d801aee6673bd63376951583694928", "gain": .32,
        "timing": {"startOffset": 0, "preRoll": .24, "releaseAt": .24, "activeEnd": 2.70, "naturalTailStart": 2.80, "strongest20msWindowAt": .96,
                   "notes": "The original water onset grows over its first ~350 ms. Begin at anticipation, release the jet 240 ms later, sustain through ~2.7 s, then let the existing decaying tail finish."},
    },
    "waterpulse": {
        "file": "352-0_water_pulse.wav", "label": "Water Pulse", "species": ["vaporeon"],
        "sha256": "798fbe0dc86431cac900077590e49a6c36883e9329d80bfe91b20e5640202566",
        "gitBlobSha1": "5fde159e73597728812c1426be7a361ed965f75d", "gain": .28,
        "timing": {"startOffset": 0, "preRoll": .08, "releaseAt": .08, "secondaryPulseAt": 1.30, "activeEnd": 2.10, "naturalTailStart": 2.25, "strongest20msWindowAt": 1.56,
                   "notes": "Keep the initial pulse and the stronger second pulse around 1.3–1.6 s. Suitable for an expanding wave with a second ring; do not restart the recording per ring."},
    },
    "psystrike": {
        "file": "540-0_psystrike.wav", "label": "Psystrike", "species": ["mewtwo"],
        "sha256": "af5b81120674e2f316ad04673c19053c44b078cbdb5d9ac082585cf644706978",
        "gitBlobSha1": "550f45e2c7eb3f731ffc17ce9e5faabcf5dfe479", "gain": .28,
        "timing": {"startOffset": 2.78, "preRoll": .04, "releaseAt": 2.82, "activeEnd": 3.80, "naturalTailStart": 3.85, "strongest20msWindowAt": 3.60,
                   "fullSequenceAlternative": {"startOffset": 0, "preRoll": 2.82, "releaseAt": 2.82},
                   "notes": "The source has two distinct phrases, with a low-energy gap immediately before the second onset at 2.80 s. Default playback seeks to 2.78 s and reveals 40 ms later. Alternatively play the entire recording with 2.82 s anticipation. The phase interpretation is editorial, not verified game-engine event metadata. Use only for Mewtwo; do not map to every psychic species."},
    },
}


def run(args):
    result = subprocess.run(args, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors="replace"))
    return result.stdout


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_url(path):
    return f"https://raw.githubusercontent.com/PokeMiners/pogo_assets/{COMMIT}/" + quote(path)


def probe(path):
    data = json.loads(run([FFPROBE, "-v", "error", "-show_entries", "format=duration:stream=codec_name,sample_rate,channels", "-of", "json", str(path)]))
    return {"duration": round(float(data["format"]["duration"]), 6), **data["streams"][0]}


def decode(path, rate=RATE):
    samples = array.array("f")
    samples.frombytes(run([FFMPEG, "-v", "error", "-xerror", "-i", str(path), "-vn", "-f", "f32le", "-ac", "1", "-ar", str(rate), "-"]))
    if not samples or not all(math.isfinite(v) for v in samples):
        raise ValueError(f"Invalid decoded PCM: {path}")
    return samples


def db(value):
    return round(20 * math.log10(max(value, 1e-9)), 3)


def metrics(path):
    samples = decode(path)
    return {"decodedDuration": round(len(samples) / RATE, 6), "peakDbfs": db(max(map(abs, samples))),
            "oversampledPeakDbfs": db(max(map(abs, decode(path, RATE * 4)))),
            "rmsDbfs": db(math.sqrt(sum(v*v for v in samples) / len(samples))),
            "lastSampleDbfs": db(abs(samples[-1]))}


def build(name, recipe, working):
    relative = "Sounds/Pokemon Moves/" + recipe["file"]
    source = CACHE / relative
    source.parent.mkdir(parents=True, exist_ok=True)
    if not source.exists():
        pending = source.with_suffix(".download")
        run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "90", source_url(relative), "-o", str(pending)])
        pending.replace(source)
    data = source.read_bytes()
    blob = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()
    if digest(source) != recipe["sha256"] or blob != recipe["gitBlobSha1"]:
        raise ValueError(f"Pinned source mismatch: {source}")
    original = probe(source)
    source_duration = len(decode(source)) / RATE
    duration = source_duration + GUARD
    edited = working / (name + ".wav")
    # Keep the entire source envelope and pitch. The only fade is on the very
    # quiet final 60 ms, followed by a silent Opus frame to avoid a codec edge.
    filters = f"highpass=f=35,afade=t=in:d=0.002,afade=t=out:st={source_duration-.060:.9f}:d=0.060,apad=pad_dur={GUARD},atrim=duration={duration:.9f}"
    run([FFMPEG, "-v", "error", "-y", "-i", str(source), "-af", filters, "-ar", str(RATE), "-ac", "1", "-c:a", "pcm_f32le", str(edited)])
    scale = 10 ** (TARGET / 20) / max(map(abs, decode(edited, RATE * 4)))
    files = {}
    for extension, codec, rate in [("mp3", ["-c:a", "libmp3lame", "-b:a", "160k"], 44100), ("ogg", ["-c:a", "libopus", "-b:a", "96k", "-vbr", "on"], 48000)]:
        destination = OUT / f"{name}.{extension}"
        gain = scale
        for attempt in range(4):
            run([FFMPEG, "-v", "error", "-y", "-i", str(edited), "-map_metadata", "-1", "-af", f"volume={gain:.12f}", "-ar", str(rate), "-ac", "1", *codec, str(destination)])
            measured = metrics(destination)
            if abs(measured["oversampledPeakDbfs"] - TARGET) <= .35:
                break
            gain *= 10 ** ((TARGET - measured["oversampledPeakDbfs"]) / 20)
        if abs(measured["oversampledPeakDbfs"] - TARGET) > .4:
            raise ValueError(f"Peak target failed: {destination} {measured}")
        if abs(measured["decodedDuration"] - duration) > .003 or measured["lastSampleDbfs"] > -65:
            raise ValueError(f"Duration/tail check failed: {destination} {measured}")
        files[extension] = {"path": "/" + str(destination.relative_to(ROOT / "public")), **probe(destination), **measured, "bytes": destination.stat().st_size, "sha256": digest(destination)}
    timing = {**recipe["timing"], "playbackDuration": round(duration - recipe["timing"]["startOffset"], 6), "earlyStopFade": .18,
              "basis": "20 ms and 100 ms RMS envelope analysis; release alignment is an editorial recommendation, not an official animation event timestamp or a human audition."}
    print(f"{name}: {duration:.3f}s, default playback {timing['playbackDuration']:.3f}s, peak " + " / ".join(f"{ext} {item['oversampledPeakDbfs']:.2f}dBFS" for ext, item in files.items()), flush=True)
    return {"sourceSound": recipe["label"], "species": recipe["species"], "files": files,
            "source": {"path": relative, "url": source_url(relative), "page": f"{REPOSITORY}/blob/{COMMIT}/" + quote(relative), **original, "bytes": len(data), "sha256": digest(source), "gitBlobSha1": blob},
            "processing": {"sourceStart": 0, "sourceDurationKept": source_duration, "duration": round(duration, 6), "attackFade": .002, "decay": .060, "silentTail": GUARD, "dcRemovalHz": 35, "targetPeakDbfs": TARGET, "pitchChange": 0,
                           "method": "Whole original source retained at original speed and pitch. 35 Hz DC removal, 2 ms edge fade, last 60 ms of the already quiet natural tail faded, and 20 ms silent codec guard. Original mono channel count retained; no layers, synthesized tones, added reverb, sustain deletion or time stretching. Resampling is for codec compatibility only."},
            "recommendedPlaybackGain": recipe["gain"], "runtimePokemonMultiplier": .5, "effectivePlaybackGain": recipe["gain"]*.5, "timing": timing}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="pokemon-audio-v5-") as temp:
        effects = {name: build(name, recipe, Path(temp)) for name, recipe in RECIPES.items()}
    provenance = {
        "description": "Three exact Pokémon GO move recordings with their natural envelopes retained. No duplicate generic charge files added.",
        "repository": {"url": REPOSITORY, "commit": COMMIT, "readme": f"{REPOSITORY}/blob/{COMMIT}/README.md", "claim": "PokeMiners identifies these as mined Pokémon GO files, unmodified by the repository, and attributes their copyright to The Pokémon Company and Niantic.", "verification": "Each source SHA-256 and Git blob SHA-1 is pinned in the script and checked before encoding. Blob identifiers were compared with the source repository tree."},
        "rights": "Used under the user's stated Pokémon license. The source is a public datamining repository, not a rights-holder delivery service. No open-license assertion, login, DRM bypass or region bypass.",
        "reproduce": "python3 scripts/fetch-move-audio-v5.py; requires Python 3, curl, ffmpeg and ffprobe. Optional ASSET_FFMPEG and ASSET_FFPROBE. Downloads only three pinned WAVs and writes only audio-v5.",
        "mixing": "Manifest gain is BEFORE the existing 0.5 Pokémon-effects multiplier. Effective gains are 0.16 Hydro Pump, 0.14 Water Pulse, 0.14 Psystrike. Preserve that multiplier; do not compensate for the longer envelope by increasing volume. Spatialize the mono voice in runtime. One voice per move; no repeated ring/particle triggers. Fade a scene-owned voice for 180 ms if a shorter visual ends early.",
        "selection": "Hydro Pump replaces Water Gun for Blastoise and Gyarados; Water Pulse replaces Water Gun for Vaporeon; Psystrike is specific to Mewtwo. No separate named electric/fire/psychic preparation clips were found. Charge Beam and Flame Charge exist as different moves, but were deliberately not repurposed as universal species charges. Use a matching move's own onset; reserve Solar Beam for an actual Solar Beam sequence.",
        "limitations": "All three original recordings are mono 11.025 kHz. Resampling does not add source detail. Source filenames identify moves; source-to-species routing is a creative integration choice. No human audition or retail gameplay comparison is claimed. Timing landmarks come from waveform energy, not from official engine event metadata. The second Psystrike phrase may be sought independently for a compact release, without exporting a duplicate asset.",
        "validation": "Each output decodes using ffmpeg -xerror, has finite samples, duration within 3 ms of expected, four-times-oversampled peak within 0.4 dB of -6 dBFS and final sample below -65 dBFS. Output and original hashes recorded. Full audio-v5 folder must remain below 500000 bytes.",
        "effects": effects,
    }
    manifest = {name: {"files": {ext: f["path"] for ext, f in item["files"].items()}, "duration": item["processing"]["duration"], "decay": item["processing"]["decay"], "peakDbfs": TARGET, "gain": item["recommendedPlaybackGain"], "pokemonMultiplier": .5, "sourceSound": item["sourceSound"], "species": item["species"], "timing": item["timing"]} for name, item in effects.items()}
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    (OUT / "cues.json").write_text(json.dumps(manifest, indent=2) + "\n")
    total = sum(p.stat().st_size for p in OUT.rglob("*") if p.is_file())
    if total > 500000:
        raise ValueError(f"Asset budget exceeded: {total} bytes")
    print(f"Verified six encoded files. Entire audio-v5 folder: {total} bytes.")


if __name__ == "__main__":
    main()
