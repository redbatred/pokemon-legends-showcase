#!/usr/bin/env python3
"""Prepare four recorded CC0 crowd cues at useful mix levels.

Run: python3 scripts/prepare-crowd-audio-v10.py
Requires Python 3, curl, ffmpeg, ffprobe. Only writes public/assets/audio-v10
and a temporary cache. Source checksums fail closed on changed downloads.
"""

import array
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/audio-v10"
CACHE = Path(tempfile.gettempdir()) / "pokemon-crowd-audio-v10"
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE = 48000
SOURCES = {
    "applause": {
        "title": "Small Crowd Clapping 2", "creator": "snakebarney",
        "page": "https://freesound.org/people/snakebarney/sounds/138114/",
        "previewUrl": "https://cdn.freesound.org/previews/138/138114_1572282-hq.mp3",
        "sha256": "4df0ccceb5204350a45f88cba4db351266f1afb492b25ef06e7ebd6d95ec5f0d",
        "license": "CC0 1.0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
        "publishedDate": "2011-12-16", "channels": 1,
        "capture": "Creator describes a small group applauding in a room.",
        "sourceFormat": "Provider HQ MP3 preview; 48 kHz mono; approximately 195 kb/s. Original AIFF not downloaded.",
        "filters": "highpass=f=80:p=2,lowpass=f=11500:p=2",
    },
    "sports": {
        "title": "Crowd Cheer", "creator": "FoolBoyMedia",
        "page": "https://freesound.org/people/FoolBoyMedia/sounds/397434/",
        "previewUrl": "https://cdn.freesound.org/previews/397/397434_4019029-hq.mp3",
        "sha256": "b621e391cb850ff79d8c215faf295119e747340803429ffbb383b5eaf4a132d2",
        "license": "CC0 1.0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
        "publishedDate": "2017-07-12", "channels": 2,
        "capture": "Creator describes spectators celebrating a sporting win, recorded with a Tascam DR-05.",
        "sourceFormat": "Provider HQ MP3 preview; 44.1 kHz stereo; approximately 218 kb/s. Original WAV not downloaded.",
        "filters": "highpass=f=70:p=2,lowpass=f=8000:p=2",
    },
}
RECIPES = {
    "crowdsmall": {"source": "applause", "start": .95, "duration": 1.6, "overlap": 0,
                   "fadeIn": .025, "fadeOut": .24, "rmsTarget": -18.2, "gain": .55},
    "crowdapplause": {"source": "applause", "start": 1.60, "duration": 3.0, "overlap": .35,
                      "fadeIn": 0, "fadeOut": 0, "rmsTarget": -18.2, "gain": .60},
    "crowdrise": {"source": "sports", "start": 1.55, "duration": 1.9, "overlap": 0,
                  "fadeIn": .065, "fadeOut": .24, "rmsTarget": -18.2, "gain": .75},
    "crowdcheer": {"source": "sports", "start": 8.0, "duration": 6.0, "overlap": .75,
                   "fadeIn": 0, "fadeOut": 0, "rmsTarget": -18.2, "gain": .65},
}


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
        raise ValueError("Missing or nonfinite audio samples")
    return result


def write_float(path, data):
    output = array.array("f", data)
    if os.sys.byteorder != "little":
        output.byteswap()
    path.write_bytes(output.tobytes())


def db(value):
    return 20 * math.log10(max(1e-12, value))


def rms(data):
    return math.sqrt(sum(x * x for x in data) / len(data))


def decode(path, channels, rate=RATE, raw=False, filters=None):
    inputs = ["-f", "f32le", "-ar", str(RATE), "-ac", str(channels)] if raw else []
    effect = ["-af", filters] if filters else []
    return floats(run([FFMPEG, "-v", "error", "-xerror", *inputs, "-i", str(path),
        *effect, "-ar", str(rate), "-ac", str(channels), "-f", "f32le", "-"]).stdout)


def edit(data, channels, recipe):
    start = round(recipe["start"] * RATE) * channels
    period = round(recipe["duration"] * RATE)
    overlap = round(recipe["overlap"] * RATE)
    segment = data[start:start + (period + overlap) * channels]
    if len(segment) != (period + overlap) * channels:
        raise ValueError("Source is shorter than the requested selection")
    result = array.array("f", segment[:period * channels])
    if overlap:
        # Rotate the equal-power tail/head overlap to the beginning. Both the
        # internal join and the file wrap then follow adjacent source samples.
        for frame in range(overlap):
            theta = frame / (overlap - 1) * math.pi / 2
            for channel in range(channels):
                result[frame * channels + channel] = (
                    segment[(period + frame) * channels + channel] * math.cos(theta)
                    + segment[frame * channels + channel] * math.sin(theta))
    else:
        attack = round(recipe["fadeIn"] * RATE)
        release = round(recipe["fadeOut"] * RATE)
        for frame in range(period):
            gain = 1.0
            if frame < attack:
                gain *= math.sin(frame / (attack - 1) * math.pi / 2)
            if frame >= period - release:
                gain *= math.sin((period - 1 - frame) / (release - 1) * math.pi / 2)
            for channel in range(channels):
                result[frame * channels + channel] *= gain
    return result


def level(samples, channels, recipe, pcm):
    scalar = 10 ** (recipe["rmsTarget"] / 20) / rms(samples)
    normalized = array.array("f", (x * scalar for x in samples))
    write_float(pcm, normalized)
    before = db(max(abs(x) for x in decode(pcm, channels, RATE * 4, raw=True)))
    limiter = None
    if before > -3.0:
        # No compressor, denoiser, pitch change or generated layer. Only cap
        # exceptional close-clap peaks with a 4x oversampled lookahead limiter.
        # For loops the middle of three repeats retains a periodic envelope.
        loop = recipe["overlap"] > 0
        write_float(pcm, normalized * (3 if loop else 1))
        limiter = ("aresample=192000,alimiter=limit=0.7079457844:attack=1:"
                   "release=35:level=false:latency=true,aresample=48000")
        processed = decode(pcm, channels, raw=True, filters=limiter)
        normalized = processed[len(normalized):len(normalized) * 2] if loop else processed[:len(normalized)]
    rotation = 0
    if recipe["overlap"]:
        # A loop may start at any phase. Put the codec boundary at a naturally
        # low-amplitude adjacent-sample pair inside the first 350 ms.
        rotation = min(range(1, round(.35 * RATE)), key=lambda frame:
                       max(abs(normalized[index]) for index in
                           range((frame - 1) * channels, (frame + 1) * channels)))
        cut = rotation * channels
        normalized = normalized[cut:] + normalized[:cut]
    write_float(pcm, normalized)
    return normalized, {"rmsNormalizationGainDb": round(db(scalar), 6),
                        "preLimiterPeak4xDbfs": round(before, 3), "limiter": limiter,
                        "loopBoundaryRotationSeconds": round(rotation / RATE, 9),
                        "pcmRmsDbfs": round(db(rms(normalized)), 3)}


def inspect(path, channels, duration):
    data = decode(path, channels)
    peak = db(max(abs(x) for x in decode(path, channels, RATE * 4)))
    actual_duration = len(data) / (RATE * channels)
    probe = json.loads(run([FFPROBE, "-v", "error", "-show_entries",
        "stream=codec_name,sample_rate,channels:format=duration,bit_rate", "-of", "json", str(path)]).stdout)
    loudness = run([FFMPEG, "-hide_banner", "-i", str(path), "-af",
        "ebur128=peak=true:framelog=quiet", "-f", "null", "-"]).stderr.decode()
    integrated = re.findall(r"I:\s+(-?[\d.]+) LUFS", loudness)[-1]
    assert abs(actual_duration - duration) < .004, (path, actual_duration)
    assert peak <= -2.0, (path, peak)
    assert -19.25 <= db(rms(data)) <= -17.0, (path, db(rms(data)))
    assert probe["streams"][0]["channels"] == channels
    assert int(probe["streams"][0]["sample_rate"]) == RATE
    return {"sha256": sha(path), "bytes": path.stat().st_size,
            "decodedDuration": round(actual_duration, 9), "peak4xDbfs": round(peak, 3),
            "rmsDbfs": round(db(rms(data)), 3), "integratedLufs": float(integrated),
            "wrapSampleDeltaDbfs": round(db(max(abs(data[c] - data[-channels + c])
                                               for c in range(channels))), 3), "probe": probe}


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    decoded = {}
    for key, source in SOURCES.items():
        path = CACHE / source["previewUrl"].rsplit("/", 1)[-1]
        if not path.exists():
            run(["curl", "--fail", "--silent", "--show-error", "--location", source["previewUrl"], "-o", str(path)])
        if sha(path) != source["sha256"]:
            raise ValueError(f"Source changed: {key}; reverify provider and license before replacing the hash")
        decoded[key] = decode(path, source["channels"], filters=source["filters"])
    cues, verified = {}, {}
    for name, recipe in RECIPES.items():
        channels = SOURCES[recipe["source"]]["channels"]
        pcm = CACHE / f"{name}.f32le"
        samples, normalization = level(edit(decoded[recipe["source"]], channels, recipe), channels, recipe, pcm)
        formats = {}
        for extension, codec in {"mp3": ["-c:a", "libmp3lame", "-b:a", "160k" if channels == 1 else "192k"],
                                 "ogg": ["-c:a", "libopus", "-b:a", "96k" if channels == 1 else "128k",
                                         "-vbr", "on", "-application", "audio"]}.items():
            output = OUT / f"{name}.{extension}"
            run([FFMPEG, "-y", "-v", "error", "-xerror", "-fflags", "+bitexact",
                 "-f", "f32le", "-ar", str(RATE), "-ac", str(channels), "-i", str(pcm),
                 "-map_metadata", "-1", *codec, "-fflags", "+bitexact", "-flags:a", "+bitexact", str(output)])
            formats[extension] = inspect(output, channels, recipe["duration"])
        verified[name] = {**recipe, "sourceRangeSeconds": [recipe["start"], round(recipe["start"] + recipe["duration"] + recipe["overlap"], 6)],
            "loop": recipe["overlap"] > 0, "channels": channels, **normalization,
            "pcmWrapSampleDeltaDbfs": round(db(max(abs(samples[c] - samples[-channels + c])
                                                  for c in range(channels))), 3), "files": formats}
        cues[name] = {"gain": recipe["gain"], "files": {
            "mp3": f"/assets/audio-v10/{name}.mp3", "ogg": f"/assets/audio-v10/{name}.ogg"}}
    provenance = {"verifiedDate": "2026-10-28", "sources": SOURCES, "processing": {
        "sampleRate": RATE, "ffmpeg": run([FFMPEG, "-version"]).stdout.decode().splitlines()[0],
        "levels": "RMS normalized to -18.2 dBFS; exceptional transients limited only as needed at -3 dBFS before encoding. Every delivered decode checked at <= -2 dBFS 4x peak.",
        "loopMethod": "Equal-power cos/sin crossfade rotated to the head; limiter, where needed, processes three repeats and retains the middle period. The finished loop is phase-rotated to a naturally low-amplitude codec boundary.",
        "audition": "No human audition claimed. Primary creator/license metadata, source waveform, finite decoding, duration, RMS, EBU R128 integrated loudness, 4x peak, boundary and hash checks only.",
        "content": "Recorded crowds at original pitch and speed. No added music, synthetic crowd, speech layer or artificial reverb. No source separation attempted."},
        "cues": verified}
    (OUT / "cues.json").write_text(json.dumps(cues, indent=2) + "\n")
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(json.dumps({name: {extension: {k: v for k, v in report.items() if k != "probe"}
                             for extension, report in cue["files"].items()}
                      for name, cue in verified.items()}, indent=2))


if __name__ == "__main__":
    main()
