#!/usr/bin/env python3
"""Prepare recorded CC0 wrapper Foley. Requires Python 3, curl, ffmpeg, ffprobe.

Run: python3 scripts/prepare-pack-audio-v9.py
Only writes public/assets/audio-v9 and a temporary processing cache.
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
OUT = ROOT / "public/assets/audio-v9"
CACHE = Path(tempfile.gettempdir()) / "pokemon-foil-audio-v9"
FFMPEG = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE = 48000
SOURCE_URL = "https://cdn.freesound.org/previews/590/590195_129727-hq.mp3"
SOURCE_SHA = "7166e92f3f01bcc191be61c7703c52fbd1922271d96ec57a03a9947e8737c7bd"
SOURCE_PAGE = "https://freesound.org/people/MrFossy/sounds/590195/"


def run(args):
    return subprocess.run(args, check=True, capture_output=True).stdout


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def samples(data):
    result = array.array("f")
    result.frombytes(data)
    if os.sys.byteorder != "little":
        result.byteswap()
    assert result and all(math.isfinite(x) for x in result)
    return result


def decode(path, rate=RATE, raw=False):
    inputs = ["-f", "f32le", "-ar", str(RATE), "-ac", "1"] if raw else []
    return samples(run([FFMPEG, "-v", "error", "-xerror", *inputs, "-i", str(path),
                        "-ar", str(rate), "-ac", "1", "-f", "f32le", "-"]))


def db(value):
    return 20 * math.log10(max(1e-12, value))


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    source = CACHE / "590195.mp3"
    if not source.exists():
        run(["curl", "--fail", "--silent", "--show-error", "--location", SOURCE_URL, "-o", str(source)])
    if sha(source) != SOURCE_SHA:
        raise ValueError("Source changed; verify provider and license before replacing pinned hash")
    shaping = ("highpass=f=180:p=2,lowpass=f=12500:p=2,"
               "acompressor=threshold=0.03:ratio=3:attack=0.5:release=35:knee=2,"
               "volume=24,alimiter=limit=0.125:attack=0.5:release=20:level=false:latency=true")
    recipes = {
        "packtear": {"range": [.025, .905], "tempo": .88, "duration": 1.0,
                     "fadeIn": .006, "fadeOut": .10, "peak": -5.5, "gain": .30},
        "packrustle": {"range": [.38, .63], "tempo": 1, "duration": .25,
                       "fadeIn": .015, "fadeOut": .06, "peak": -10, "gain": .18},
    }
    cues, verified = {}, {}
    for name, recipe in recipes.items():
        duration = recipe["duration"]
        start, end = recipe["range"]
        filters = (f"atrim=start={start}:end={end},asetpts=PTS-STARTPTS,"
                   f"atempo={recipe['tempo']},{shaping},apad,atrim=duration={duration},"
                   f"afade=t=in:d={recipe['fadeIn']},"
                   f"afade=t=out:st={duration-recipe['fadeOut']}:d={recipe['fadeOut']}")
        pcm = CACHE / f"{name}.f32le"
        pcm.write_bytes(run([FFMPEG, "-v", "error", "-xerror", "-i", str(source),
                            "-af", filters, "-ar", str(RATE), "-ac", "1", "-f", "f32le", "-"]))
        peak = max(abs(x) for x in decode(pcm, RATE * 4, raw=True))
        normalization = 10 ** (recipe["peak"] / 20) / peak
        normalized = array.array("f", (x * normalization for x in decode(pcm, raw=True)))
        if os.sys.byteorder != "little":
            normalized.byteswap()
        pcm.write_bytes(normalized.tobytes())
        formats = {}
        for extension, codec in {"mp3": ["-c:a", "libmp3lame", "-b:a", "160k"],
                                 "ogg": ["-c:a", "libopus", "-b:a", "96k", "-vbr", "on"]}.items():
            output = OUT / f"{name}.{extension}"
            run([FFMPEG, "-y", "-v", "error", "-xerror", "-fflags", "+bitexact",
                 "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", str(pcm),
                 "-map_metadata", "-1", *codec, "-fflags", "+bitexact", "-flags:a", "+bitexact", str(output)])
            data = decode(output)
            true_peak = db(max(abs(x) for x in decode(output, RATE * 4)))
            decoded_duration = len(data) / RATE
            probe = json.loads(run([FFPROBE, "-v", "error", "-show_entries",
                                    "stream=codec_name,channels,sample_rate", "-of", "json", str(output)]))
            stream = probe["streams"][0]
            assert abs(decoded_duration - duration) < .004, (output, decoded_duration)
            assert true_peak < -4.0, (output, true_peak)
            assert stream["channels"] == 1 and int(stream["sample_rate"]) == RATE
            assert stream["codec_name"] == {"mp3": "mp3", "ogg": "opus"}[extension]
            formats[extension] = {"sha256": sha(output), "bytes": output.stat().st_size,
                                  "decodedDuration": decoded_duration,
                                  "stream": stream,
                                  "peak4xDbfs": round(true_peak, 3),
                                  "rmsDbfs": round(db(math.sqrt(sum(x*x for x in data)/len(data))), 3)}
        cues[name] = {"gain": recipe["gain"], "files": {
            "mp3": f"/assets/audio-v9/{name}.mp3", "ogg": f"/assets/audio-v9/{name}.ogg"}}
        verified[name] = {**recipe, "filters": filters,
                          "normalizationGainDb": round(db(normalization), 3), "files": formats}
    provenance = {"verifiedDate": "2026-10-28", "source": {
        "title": "SFX_STICKERRIPPER_candyWrapper_20.wav", "creator": "MrFossy",
        "page": SOURCE_PAGE, "previewUrl": SOURCE_URL, "sha256": SOURCE_SHA,
        "license": "CC0 1.0", "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
        "recording": "Real plastic candy wrapper peeled off adhesive contact film; Rode NT1 into Universal Audio Arrow.",
        "sourceFormat": "Provider HQ MP3 preview; original is 44.1 kHz, 24-bit mono WAV.",
        "publishedDate": "2021-10-04"}, "processing": {
        "sampleRate": RATE, "channels": 1,
        "ffmpeg": run([FFMPEG, "-version"]).decode().splitlines()[0],
        "audition": "No human audition claimed. Verified primary recording/license description, inspected spectra/envelopes, checked decoding, duration, finite samples, true-peak estimate and hashes. No added speech, music, synthesized noise, reverb or tonal layer."},
        "cues": verified}
    (OUT / "cues.json").write_text(json.dumps(cues, indent=2) + "\n")
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(json.dumps({"output": str(OUT), "cues": verified}, indent=2))


if __name__ == "__main__":
    main()
