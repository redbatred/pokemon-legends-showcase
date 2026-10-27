#!/usr/bin/env python3
"""Build seven compact, sample-derived UI/reveal cues in audio-v3 only.

Requires Python 3, curl, ffmpeg and ffprobe. No Python packages are needed.
Reuses the CC0 source cache from fetch-reveal-audio.py, downloading only missing
Kenney archives. Each ingredient is edited from a source sample; no oscillators,
noise generators, loops, game cries, or community-uploaded Pokémon effects are
used. Run from any directory: python3 scripts/polish-audio.py
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
import zipfile


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/audio-v3"
CACHE = Path(os.environ.get("REVEAL_AUDIO_SOURCE_CACHE", str(Path(tempfile.gettempdir()) / "pokemon-reveal-audio-sources")))
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE = 48000
TARGET_DBFS = -6.0

LIBRARIES = {
    "rpg": ("https://kenney.nl/assets/rpg-audio", "https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip"),
    "impact": ("https://kenney.nl/assets/impact-sounds", "https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip"),
    "scifi": ("https://kenney.nl/assets/sci-fi-sounds", "https://kenney.nl/media/pages/assets/sci-fi-sounds/6b296f9ecf-1677589334/kenney_sci-fi-sounds.zip"),
    "interface": ("https://kenney.nl/assets/interface-sounds", "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip"),
    "casino": ("https://kenney.nl/assets/casino-audio", "https://kenney.nl/media/pages/assets/casino-audio/2472606a04-1721639069/kenney_casino-audio.zip"),
}


def layer(file, start, length, rate=1, gain=1, delay=0, filters="", purpose=""):
    return dict(file=file, start=start, length=length, rate=rate, gain=gain, delay=delay, filters=filters, purpose=purpose)


# Gain is relative to a -12 dBFS peak for each processed ingredient, making the
# relationship intentional even when the original recording levels differ.
# Delays are milliseconds; trims are in source seconds; rate changes pitch/speed.
RECIPES = {
    "ui": {
        "duration": .18, "playbackGain": .18,
        "intent": "Soft, dry physical selection tick with the chip's initial silence removed.",
        "layers": [layer("casino/Audio/chip-lay-1.ogg", .039, .126, .86, filters="highpass=f=170,lowpass=f=5800,afade=t=in:d=0.002,afade=t=out:st=0.075:d=0.071", purpose="One softened chip contact; no pitched confirmation tone")],
    },
    "latch": {
        "duration": .25, "playbackGain": .34,
        "intent": "Compact mechanical button release, retaining the natural metallic spring decay.",
        "layers": [layer("rpg/Audio/metalLatch.ogg", .022, .239, 1.02, filters="highpass=f=135,lowpass=f=7300,afade=t=in:d=0.002,afade=t=out:st=0.14:d=0.094", purpose="Actual latch transient, trimmed to respond immediately")],
    },
    "normal": {
        "duration": .50, "playbackGain": .34,
        "intent": "A crisp paper flick resolves into a small polished glint instead of a long reveal wash.",
        "layers": [
            layer("casino/Audio/card-slide-4.ogg", .025, .255, 1.05, filters="highpass=f=180,lowpass=f=8500,afade=t=in:d=0.003,afade=t=out:st=0.16:d=0.082", purpose="Tactile paper movement with its friction and flick preserved"),
            layer("interface/Audio/glass_001.ogg", 0, .276, .92, .16, 172, "highpass=f=900,lowpass=f=8200,afade=t=in:d=0.004,afade=t=out:st=0.19:d=0.11", "Quiet bright payoff, deliberately below the paper transient"),
        ],
    },
    "rare": {
        "duration": 1.00, "playbackGain": .40,
        "intent": "A brief rising glint opens into a bell-like sparkle with a soft, finite stereo tail.",
        "layers": [
            layer("interface/Audio/glass_004.ogg", .015, .285, 1.25, .25, 0, "areverse,highpass=f=850,lowpass=f=7500,afade=t=in:d=0.065,afade=t=out:st=0.19:d=0.038", "Reversed glass pre-swell gives the rare reveal a short anticipation"),
            layer("impact/Audio/impactBell_heavy_003.ogg", 0, .654, 1.15, 1, 185, "highpass=f=420,lowpass=f=9500,afade=t=in:d=0.002,afade=t=out:st=0.40:d=0.169", "One resonant metallic strike anchors the reveal"),
            layer("interface/Audio/glass_004.ogg", 0, .692, 1.42, .20, 245, "highpass=f=1300,lowpass=f=9800,aecho=0.8:0.8:43|79:0.13|0.07,afade=t=in:d=0.006,afade=t=out:st=0.38:d=0.187", "Higher glass reflection and two very low reflections add sparkle without a chord stack"),
        ],
    },
    "stage": {
        "duration": .70, "playbackGain": .16,
        "intent": "Restrained low activation sweep with a smooth crest and no explosive impact.",
        "layers": [layer("scifi/Audio/forceField_000.ogg", .04, .52, .84, filters="areverse,highpass=f=105,lowpass=f=1650,afade=t=in:d=0.13,afade=t=out:st=0.35:d=0.269", purpose="One filtered, reversed source sweep with the original noisy highs removed")],
    },
    "land": {
        "duration": .20, "playbackGain": .22,
        "intent": "Dry, short card contact that settles without another reveal accent.",
        "layers": [layer("casino/Audio/card-place-2.ogg", .18, .20, 1.04, filters="highpass=f=130,lowpass=f=6300,afade=t=in:d=0.002,afade=t=out:st=0.08:d=0.112", purpose="Isolated final card contact; earlier handling sounds removed")],
    },
    "credit": {
        "duration": .16, "playbackGain": .12,
        "intent": "A quiet single coin tick suitable for repeated balance updates.",
        "layers": [layer("rpg/Audio/handleCoins.ogg", .145, .092, 1.08, filters="highpass=f=850,lowpass=f=7100,afade=t=in:d=0.002,afade=t=out:st=0.033:d=0.052", purpose="Only the principal coin contact is retained; the long rattle and confirmation beep are removed")],
    },
}


def run(args):
    result = subprocess.run(args, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors="replace"))
    return result.stdout


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def prepare_sources():
    CACHE.mkdir(parents=True, exist_ok=True)
    for library, (_, url) in LIBRARIES.items():
        required = [CACHE / part["file"] for recipe in RECIPES.values() for part in recipe["layers"] if part["file"].startswith(library + "/")]
        if all(path.is_file() for path in required):
            continue
        archive = CACHE / f"{library}.zip"
        if not archive.exists():
            pending = archive.with_suffix(".zip.download")
            run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "90", url, "-o", str(pending)])
            pending.replace(archive)
        destination = CACHE / library
        with zipfile.ZipFile(archive) as package:
            for item in package.infolist():
                if not (destination / item.filename).resolve().is_relative_to(destination.resolve()):
                    raise ValueError("Unsafe archive member")
            package.extractall(destination)
        if not all(path.is_file() for path in required):
            raise ValueError(f"Missing source in {library} archive")


def decode(path, rate=RATE):
    raw = run([FFMPEG, "-v", "error", "-xerror", "-i", str(path), "-vn", "-f", "f32le", "-ac", "2", "-ar", str(rate), "-"])
    samples = array.array("f")
    samples.frombytes(raw)
    if not samples or not all(math.isfinite(x) for x in samples):
        raise ValueError(f"Empty or non-finite decoded audio: {path}")
    return samples


def db(value):
    return round(20 * math.log10(max(value, 1e-9)), 3)


def measure(path):
    samples = decode(path)
    # Four-times oversampling also checks intersample headroom after codec decode.
    oversampled = decode(path, RATE * 4)
    return {
        "decodedDuration": round(len(samples) / (RATE * 2), 6),
        "peakDbfs": db(max(map(abs, samples))),
        "oversampledPeakDbfs": db(max(map(abs, oversampled))),
        "rmsDbfs": db(math.sqrt(sum(x * x for x in samples) / len(samples))),
        "firstSampleDbfs": db(max(abs(samples[0]), abs(samples[1]))),
        "lastSampleDbfs": db(max(abs(samples[-1]), abs(samples[-2]))),
    }


def probe(path):
    data = json.loads(run([FFPROBE, "-v", "error", "-show_entries", "format=duration:stream=codec_name,sample_rate,channels", "-of", "json", str(path)]))
    return {"containerDuration": round(float(data["format"]["duration"]), 6), **data["streams"][0]}


def source_note(file):
    library, member = file.split("/", 1)
    page, archive = LIBRARIES[library]
    return {"file": file, "archiveMember": member, "page": page, "archive": archive, "creator": "Kenney", "license": "CC0-1.0", "sha256": sha256(CACHE / file)}


def build(name, recipe, working):
    ingredients = []
    layer_processing = []
    for index, part in enumerate(recipe["layers"]):
        path = working / f"{name}-{index}.wav"
        chain = f"atrim=start={part['start']}:duration={part['length']},asetpts=PTS-STARTPTS,aresample={RATE},asetrate={RATE * part['rate']:.0f},aresample={RATE},aformat=channel_layouts=stereo"
        if part["filters"]:
            chain += "," + part["filters"]
        run([FFMPEG, "-v", "error", "-y", "-i", str(CACHE / part["file"]), "-af", chain, "-c:a", "pcm_f32le", str(path)])
        peak = max(map(abs, decode(path)))
        if peak < 1e-5:
            raise ValueError(f"Ingredient is silent: {name}/{index}")
        gain = 10 ** (-12 / 20) / peak * part["gain"]
        ingredients.append((path, gain, part["delay"]))
        layer_processing.append({**part, "processedPeakDbfs": db(peak), "appliedLinearGain": round(gain, 9)})

    command = [FFMPEG, "-v", "error", "-y"]
    filters = []
    for index, (path, gain, delay) in enumerate(ingredients):
        command += ["-i", str(path)]
        filters.append(f"[{index}:a]volume={gain:.12f},adelay={delay}|{delay}[a{index}]")
    duration = recipe["duration"]
    filters.append("".join(f"[a{i}]" for i in range(len(ingredients))) + f"amix=inputs={len(ingredients)}:normalize=0,apad=pad_dur={duration},atrim=duration={duration},highpass=f=35,afade=t=in:d=0.002,afade=t=out:st={duration-.035:.6f}:d=0.035[mix]")
    mix = working / f"{name}-mix.wav"
    run(command + ["-filter_complex", ";".join(filters), "-map", "[mix]", "-c:a", "pcm_f32le", str(mix)])
    raw_peak = max(map(abs, decode(mix, RATE * 4)))
    base_gain = 10 ** (TARGET_DBFS / 20) / raw_peak
    files = {}
    for ext, codec, rate in [("mp3", ["-c:a", "libmp3lame", "-b:a", "192k"], 44100), ("ogg", ["-c:a", "libopus", "-b:a", "128k", "-vbr", "on"], 48000)]:
        destination = OUT / f"{name}.{ext}"
        gain = base_gain
        for attempt in range(3):
            run([FFMPEG, "-v", "error", "-y", "-i", str(mix), "-map_metadata", "-1", "-af", f"volume={gain:.12f}", "-ar", str(rate), "-ac", "2", *codec, str(destination)])
            measured = measure(destination)
            # Use the same tolerance as the final acceptance gate. Opus can
            # change transient quantization nonlinearly after a tiny gain edit;
            # re-encoding an already passing peak can push it outside the gate.
            if abs(measured["oversampledPeakDbfs"] - TARGET_DBFS) <= .30:
                break
            gain *= 10 ** ((TARGET_DBFS - measured["oversampledPeakDbfs"]) / 20)
        if not -6.3 <= measured["oversampledPeakDbfs"] <= -5.7:
            raise ValueError(f"Headroom outside target: {destination} {measured}")
        if abs(measured["decodedDuration"] - duration) > .003:
            raise ValueError(f"Decoded duration mismatch: {destination} {measured}")
        if measured["lastSampleDbfs"] > -60:
            raise ValueError(f"Tail does not settle cleanly: {destination} {measured}")
        files[ext] = {"path": "/" + str(destination.relative_to(ROOT / "public")), **probe(destination), **measured, "sha256": sha256(destination), "bytes": destination.stat().st_size, "masteringGain": round(gain, 9)}
    print(f"{name:7s} {duration:.2f}s | " + " | ".join(f"{ext} peak {info['oversampledPeakDbfs']:.2f} dBFS" for ext, info in files.items()), flush=True)
    return {
        "intent": recipe["intent"],
        "files": files,
        "sources": [source_note(file) for file in dict.fromkeys(part["file"] for part in recipe["layers"])],
        "processing": {"duration": duration, "layers": layer_processing, "mixPeakBeforeMasteringDbfs": db(raw_peak), "mastering": "48 kHz float mixing; ingredient peaks aligned before relative balancing; sample-specific trim, EQ, pitch/speed and fades; final 2 ms attack/35 ms tail; four-times-oversampled decoded peak aligned to -6 dBFS independently per codec. No limiting or clipping."},
        "recommendedPlaybackGain": recipe["playbackGain"],
    }


def main():
    prepare_sources()
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="pokemon-audio-v3-") as folder:
        effects = {name: build(name, recipe, Path(folder)) for name, recipe in RECIPES.items()}
    provenance = {
        "description": "Seven compact sample-derived interaction and reveal cues. Newly edited source excerpts and timed layers; these are not volume-only copies of audio-v2.",
        "sourcePolicy": "Only existing Kenney CC0 source libraries. No game cries, community Pokémon recordings, oscillator beeps, generated noise, or music.",
        "reproduce": "python3 scripts/polish-audio.py (Python 3, curl, ffmpeg and ffprobe; optional REVEAL_AUDIO_SOURCE_CACHE, ASSET_FFMPEG, ASSET_FFPROBE). Source cache is outside the deployed assets; missing archives are fetched from documented URLs.",
        "encoder": run([FFMPEG, "-version"]).decode().splitlines()[0],
        "formats": "Stereo MP3 at 192 kbps / 44.1 kHz, and OGG Opus at 128 kbps / 48 kHz. Container durations may include codec delay; decodedDuration is the audible buffer length.",
        "verification": "All 14 files decoded with ffmpeg -xerror. Finite PCM, decoded duration within 3 ms, four-times-oversampled peak between -6.3 and -5.7 dBFS, final sample below -60 dBFS, and SHA-256 checked during generation.",
        "limitations": "Technical decode, timing, envelope and headroom checks are automated; no human listening review is claimed. Lossy encoding bytes can vary between ffmpeg versions. Recommended playback gains maintain quiet interaction cues; -6 dBFS file peaks alone do not equal perceived loudness.",
        "effects": effects,
    }
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(f"Verified {len(effects) * 2} files; total audio bytes: {sum(info['bytes'] for effect in effects.values() for info in effect['files'].values())}")


if __name__ == "__main__":
    main()
