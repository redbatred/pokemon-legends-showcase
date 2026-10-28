#!/usr/bin/env python3
"""Prepare CC0 field-recorded crowd cues; no synthesized crowd layer.

Run: python3 scripts/prepare-crowd-audio-v8.py
Requires Python 3, curl, ffmpeg and ffprobe. Only writes public/assets/audio-v8
and a temporary download/processing cache. Pinned input hash fails closed.
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
OUT = ROOT / "public/assets/audio-v8"
CACHE = Path(tempfile.gettempdir()) / "pokemon-crowd-audio-v8"
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE, CHANNELS = 48000, 2
SOURCE_URL = "https://cdn.freesound.org/previews/397/397434_4019029-hq.mp3"
SOURCE_SHA256 = "b621e391cb850ff79d8c215faf295119e747340803429ffbb383b5eaf4a132d2"
SOURCE_PAGE = "https://freesound.org/people/FoolBoyMedia/sounds/397434/"
LICENSE_URL = "https://creativecommons.org/publicdomain/zero/1.0/"


def run(args, **kwargs):
    return subprocess.run(args, check=True, capture_output=True, **kwargs)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def floats(data):
    result = array.array("f")
    result.frombytes(data)
    if os.sys.byteorder != "little":
        result.byteswap()
    return result


def write_float(path, data):
    output = array.array("f", data)
    if os.sys.byteorder != "little":
        output.byteswap()
    path.write_bytes(output.tobytes())


def db(value):
    return 20 * math.log10(max(1e-12, value))


def decode(path, rate=RATE, raw=False):
    raw_args = ["-f", "f32le", "-ar", str(RATE), "-ac", str(CHANNELS)] if raw else []
    result = run([FFMPEG, "-v", "error", "-xerror", *raw_args, "-i", str(path),
                  "-ar", str(rate), "-ac", str(CHANNELS), "-f", "f32le", "-"])
    data = floats(result.stdout)
    if not data or not all(math.isfinite(x) for x in data):
        raise ValueError(f"Invalid audio samples: {path}")
    return data


def peak_normalize(data, target_db, path):
    write_float(path, data)
    peak = max(abs(x) for x in decode(path, RATE * 4, raw=True))
    scalar = 10 ** (target_db / 20) / peak
    result = array.array("f", (x * scalar for x in data))
    write_float(path, result)
    return result, db(scalar)


def excerpt(data, start, duration):
    offset, count = round(start * RATE) * CHANNELS, round(duration * RATE) * CHANNELS
    result = array.array("f", data[offset:offset + count])
    if len(result) != count:
        raise ValueError("Source too short")
    return result


def rise(data):
    # Capture the real rising celebration, preserving its original speed/pitch.
    result = excerpt(data, 1.55, 1.9)
    frames = len(result) // CHANNELS
    attack, release = round(.065 * RATE), round(.24 * RATE)
    for frame in range(frames):
        gain = 1.0
        if frame < attack:
            gain *= math.sin(frame / (attack - 1) * math.pi / 2)
        if frame >= frames - release:
            gain *= math.sin((frames - 1 - frame) / (release - 1) * math.pi / 2)
        for channel in range(CHANNELS):
            result[frame * CHANNELS + channel] *= gain
    return result


def loop(data):
    # 6.75 s input, .75 s overlap -> 6.0 s period. Rotate the crossfade to
    # the beginning: tail*cos(theta) + head*sin(theta), then the untouched
    # middle. Both wrap and internal join follow adjacent source samples.
    segment = excerpt(data, 8.0, 6.75)
    overlap, period = round(.75 * RATE), round(6 * RATE)
    result = array.array("f", [0.0]) * (period * CHANNELS)
    for frame in range(overlap):
        theta = frame / (overlap - 1) * math.pi / 2
        for channel in range(CHANNELS):
            result[frame * CHANNELS + channel] = (
                segment[(period + frame) * CHANNELS + channel] * math.cos(theta)
                + segment[frame * CHANNELS + channel] * math.sin(theta)
            )
    result[overlap * CHANNELS:] = segment[overlap * CHANNELS:period * CHANNELS]
    return result


def inspect(path, expected_duration):
    data = decode(path)
    high_rate = decode(path, RATE * 4)
    duration = len(data) / (RATE * CHANNELS)
    peak = db(max(abs(x) for x in high_rate))
    rms = db(math.sqrt(sum(x * x for x in data) / len(data)))
    seam = max(abs(data[channel] - data[-CHANNELS + channel]) for channel in range(CHANNELS))
    probe = json.loads(run([FFPROBE, "-v", "error", "-show_entries",
        "stream=codec_name,sample_rate,channels:format=duration,bit_rate", "-of", "json", str(path)]).stdout)
    assert abs(duration - expected_duration) < .004, (path, duration)
    assert peak <= -6, (path, peak)
    assert probe["streams"][0]["channels"] == 2
    return {"sha256": sha(path), "bytes": path.stat().st_size,
            "decodedDuration": round(duration, 9), "peak4xDbfs": round(peak, 3),
            "rmsDbfs": round(rms, 3), "wrapSampleDeltaDbfs": round(db(seam), 3),
            "probe": probe}


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    source = CACHE / "397434_4019029-hq.mp3"
    if not source.exists():
        run(["curl", "--fail", "--silent", "--show-error", "--location", SOURCE_URL, "-o", str(source)])
    if sha(source) != SOURCE_SHA256:
        raise ValueError("Source checksum changed; verify provider and license before replacing it")
    # Preserve the real stereo image. A restrained band limit reduces low rumble
    # and close clap edges; no denoiser, reverb, pitch shift or generated noise.
    source_pcm = floats(run([FFMPEG, "-v", "error", "-xerror", "-i", str(source),
        "-af", "highpass=f=70:p=2,lowpass=f=8000:p=2", "-ar", str(RATE),
        "-ac", str(CHANNELS), "-f", "f32le", "-"]).stdout)
    recipes = {
        "crowdrise": {"samples": rise(source_pcm), "duration": 1.9, "gain": .30,
                       "target": -7.5, "sourceRange": [1.55, 3.45], "loop": False},
        "crowdcheer": {"samples": loop(source_pcm), "duration": 6.0, "gain": .18,
                        "target": -9.0, "sourceRange": [8.0, 14.75], "loop": True},
    }
    cues, verified = {}, {}
    for name, recipe in recipes.items():
        pcm = CACHE / f"{name}.f32le"
        samples, level_db = peak_normalize(recipe["samples"], recipe["target"], pcm)
        formats = {}
        for extension, codec in {"mp3": ["-c:a", "libmp3lame", "-b:a", "192k"],
                                 "ogg": ["-c:a", "libopus", "-b:a", "128k", "-vbr", "on",
                                         "-application", "audio"]}.items():
            target = OUT / f"{name}.{extension}"
            run([FFMPEG, "-y", "-v", "error", "-xerror", "-fflags", "+bitexact",
                "-f", "f32le", "-ar", str(RATE), "-ac", str(CHANNELS), "-i", str(pcm),
                "-map_metadata", "-1", *codec, "-fflags", "+bitexact", "-flags:a", "+bitexact", str(target)])
            formats[extension] = inspect(target, recipe["duration"])
        verified[name] = {"sourceRangeSeconds": recipe["sourceRange"],
            "loop": recipe["loop"], "crossfadeSeconds": .75 if recipe["loop"] else 0,
            "normalizationGainDb": round(level_db, 6), "targetPeak4xDbfs": recipe["target"],
            "pcmDuration": recipe["duration"],
            "pcmWrapSampleDeltaDbfs": round(db(max(abs(samples[c] - samples[-CHANNELS+c])
                                                  for c in range(CHANNELS))), 3),
            "files": formats}
        cues[name] = {"gain": recipe["gain"], "files": {
            "mp3": f"/assets/audio-v8/{name}.mp3", "ogg": f"/assets/audio-v8/{name}.ogg"}}
    provenance = {"verifiedDate": "2026-10-28", "source": {
        "title": "Crowd Cheer", "creator": "FoolBoyMedia", "page": SOURCE_PAGE,
        "previewUrl": SOURCE_URL, "sha256": SOURCE_SHA256, "license": "CC0 1.0",
        "licenseUrl": LICENSE_URL, "sourceFormat": "Provider HQ MP3 preview; 44.1 kHz stereo; approx. 218 kb/s",
        "capture": "Creator describes a sports win crowd captured on Tascam DR-05.",
        "publishedDate": "2017-07-12"}, "processing": {
        "sampleRate": RATE, "channels": CHANNELS,
        "filters": "highpass=f=70:p=2,lowpass=f=8000:p=2",
        "ffmpeg": run([FFMPEG, "-version"]).stdout.decode().splitlines()[0],
        "loopMethod": "Last .75 s crossfades into first .75 s with cos/sin equal-power curves; then original middle; period 6 s.",
        "audition": "No human audition claimed. Primary provider metadata, spectrogram, finite decoding, duration, headroom, seam and hash checks only."},
        "cues": verified}
    (OUT / "cues.json").write_text(json.dumps(cues, indent=2) + "\n")
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(json.dumps({"output": str(OUT), "cues": verified}, indent=2))


if __name__ == "__main__":
    main()
