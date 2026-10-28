#!/usr/bin/env python3
"""Build two short, recorded CC0 vocal crowd reactions.

Run: python3 scripts/prepare-crowd-audio-v11.py
Requires Python 3, curl, FFmpeg and ffprobe. Only writes audio-v11 and a
system-temporary cache. Source downloads must match the pinned SHA-256.
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

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/audio-v11"
CACHE = Path(tempfile.gettempdir()) / "pokemon-crowd-audio-v11"
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE = 48000
SOURCE = {
    "title": "Crowd Oooh.wav",
    "creator": "deleted_user_2104797",
    "page": "https://freesound.org/people/deleted_user_2104797/sounds/324890/",
    "previewUrl": "https://cdn.freesound.org/previews/324/324890_2104797-hq.mp3",
    "sha256": "2cb0c4c6801f45bf4beddbfd9ba97fcc616d981e0ebdcd76ac22e776694ed833",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "publishedDate": "2015-10-14",
    "description": "A crowd of people going \"Oooh\" three times.",
    "sourceFormat": "Provider HQ MP3 preview; 48 kHz mono, approximately 170 kb/s. Original WAV not downloaded.",
}
RECIPES = {
    "crowdreact": {"start": 12.4, "duration": 1.65, "fadeIn": .12,
                   "fadeOut": .50, "rmsTarget": -21.0, "gain": .20},
    "crowdreactrare": {"start": 6.45, "duration": 1.9, "fadeIn": .12,
                       "fadeOut": .50, "rmsTarget": -21.0, "gain": .30},
}
FILTERS = "highpass=f=100:p=2,lowpass=f=7000:p=2"


def run(args):
    return subprocess.run(args, check=True, capture_output=True)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def floats(data):
    result = array.array("f")
    result.frombytes(data)
    if os.sys.byteorder != "little":
        result.byteswap()
    if not result or not all(math.isfinite(x) for x in result):
        raise ValueError("Missing or nonfinite samples")
    return result


def write_float(path, samples):
    data = array.array("f", samples)
    if os.sys.byteorder != "little":
        data.byteswap()
    path.write_bytes(data.tobytes())


def db(value):
    return 20 * math.log10(max(1e-12, value))


def rms(samples):
    return math.sqrt(sum(x * x for x in samples) / len(samples))


def decode(path, rate=RATE, raw=False, filters=None):
    inputs = ["-f", "f32le", "-ar", str(RATE), "-ac", "1"] if raw else []
    effects = ["-af", filters] if filters else []
    return floats(run([FFMPEG, "-v", "error", "-xerror", *inputs, "-i", str(path),
                       *effects, "-ar", str(rate), "-ac", "1", "-f", "f32le", "-"]).stdout)


def excerpt(source, recipe):
    start = round(recipe["start"] * RATE)
    length = round(recipe["duration"] * RATE)
    result = array.array("f", source[start:start + length])
    if len(result) != length:
        raise ValueError("Source shorter than requested excerpt")
    attack, release = (round(recipe[key] * RATE) for key in ("fadeIn", "fadeOut"))
    for frame in range(length):
        envelope = 1.0
        if frame < attack:
            envelope *= math.sin(frame / (attack - 1) * math.pi / 2)
        if frame >= length - release:
            envelope *= math.sin((length - 1 - frame) / (release - 1) * math.pi / 2)
        result[frame] *= envelope
    return result


def prepare(samples, recipe, pcm):
    # Static gain preserves the vocal dynamics. Leave extra codec headroom;
    # no compression, synthetic layer, pitch shift, time stretch or looping.
    write_float(pcm, samples)
    original_peak = max(abs(x) for x in decode(pcm, RATE * 4, raw=True))
    normalization = 10 ** (recipe["rmsTarget"] / 20) / rms(samples)
    peak_gain = 10 ** (-4.0 / 20) / original_peak
    scalar = min(normalization, peak_gain)
    samples = array.array("f", (x * scalar for x in samples))
    write_float(pcm, samples)
    return {"staticGainDb": round(db(scalar), 6),
            "peakCapReducedGain": peak_gain < normalization,
            "pcmRmsDbfs": round(db(rms(samples)), 3)}


def inspect(path, duration):
    data = decode(path)
    peak = db(max(abs(x) for x in decode(path, RATE * 4)))
    measured_rms = db(rms(data))
    decoded_duration = len(data) / RATE
    probe = json.loads(run([FFPROBE, "-v", "error", "-show_entries",
        "stream=codec_name,sample_rate,channels:format=duration,bit_rate", "-of", "json", str(path)]).stdout)
    if abs(decoded_duration - duration) >= .004:
        raise ValueError(f"Unexpected duration: {path}: {decoded_duration}")
    if peak > -3.0:
        raise ValueError(f"Insufficient delivered headroom: {path}: {peak}")
    if not -22.0 <= measured_rms <= -20.0:
        raise ValueError(f"Unexpected delivered RMS: {path}: {measured_rms}")
    if probe["streams"][0]["channels"] != 1 or int(probe["streams"][0]["sample_rate"]) != RATE:
        raise ValueError(f"Unexpected audio format: {path}")
    # Fade endpoints should stay quiet after lossy encoding as well.
    endpoint_peak = db(max(abs(x) for x in data[:48] + data[-48:]))
    if endpoint_peak > -45:
        raise ValueError(f"Unexpected fade endpoint: {path}: {endpoint_peak}")
    return {"sha256": sha(path), "bytes": path.stat().st_size,
            "decodedDuration": round(decoded_duration, 9), "peak4xDbfs": round(peak, 3),
            "rmsDbfs": round(measured_rms, 3), "endpoint1msPeakDbfs": round(endpoint_peak, 3),
            "probe": probe}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    CACHE.mkdir(parents=True, exist_ok=True)
    source_path = CACHE / SOURCE["previewUrl"].rsplit("/", 1)[-1]
    if not source_path.exists():
        run(["curl", "--fail", "--silent", "--show-error", "--location",
             SOURCE["previewUrl"], "-o", str(source_path)])
    if sha(source_path) != SOURCE["sha256"]:
        raise ValueError("Source changed: reverify provider and license before updating the pinned hash")
    source = decode(source_path, filters=FILTERS)
    cues, verified = {}, {}
    for name, recipe in RECIPES.items():
        pcm = CACHE / f"{name}.f32le"
        levels = prepare(excerpt(source, recipe), recipe, pcm)
        files = {}
        for extension, codec in {
            "mp3": ["-c:a", "libmp3lame", "-b:a", "160k"],
            "ogg": ["-c:a", "libopus", "-b:a", "96k", "-vbr", "on", "-application", "audio"],
        }.items():
            output = OUT / f"{name}.{extension}"
            run([FFMPEG, "-y", "-v", "error", "-xerror", "-fflags", "+bitexact",
                 "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", str(pcm),
                 "-map_metadata", "-1", *codec, "-fflags", "+bitexact", "-flags:a", "+bitexact", str(output)])
            files[extension] = inspect(output, recipe["duration"])
        cues[name] = {"gain": recipe["gain"], "files": {
            ext: f"/assets/audio-v11/{name}.{ext}" for ext in files}}
        verified[name] = {**recipe, "loop": False, "channels": 1,
            "sourceRangeSeconds": [recipe["start"], round(recipe["start"] + recipe["duration"], 6)],
            **levels, "files": files}
    provenance = {"verifiedDate": "2026-10-28", "source": SOURCE,
        "processing": {
            "sampleRate": RATE, "filters": FILTERS,
            "ffmpeg": run([FFMPEG, "-version"]).stdout.decode().splitlines()[0],
            "levels": "Static gain targets -21 dBFS RMS; pre-encoding 4x peak ceiling -4 dBFS. Delivered files must remain at or below -3 dBFS 4x peak.",
            "envelope": "120 ms sine attack, 500 ms sine release; one-shot excerpts with no loop.",
            "content": "Two separate vocal reactions from the provider-described crowd Oooh recording. No applause source, generated voice, added music, reverb, source separation, pitch or speed change.",
            "audition": "No human audition claimed. Content selection is based on the primary creator description and waveform envelope, with numerical decode, duration, level, headroom, endpoint and hash checks."},
        "cues": verified}
    (OUT / "cues.json").write_text(json.dumps(cues, indent=2) + "\n")
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(json.dumps({name: {ext: {k: v for k, v in report.items() if k != "probe"}
                            for ext, report in cue["files"].items()}
                      for name, cue in verified.items()}, indent=2))


if __name__ == "__main__":
    main()
