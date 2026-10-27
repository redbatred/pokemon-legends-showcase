#!/usr/bin/env python3
"""Prepare two synchronized Poké Ball contact cues from one authentic recording.

Run: python3 scripts/prepare-ball-bounce-v7.py
Requires Python 3, curl and ffmpeg. Writes only public/assets/audio-v7.
The second cue is a quieter reuse of the first contact, not a claim that the
archive provides separately labeled first- and second-bounce recordings.
"""

import array
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import tempfile
from urllib.parse import quote
import wave


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/audio-v7"
CACHE = Path(tempfile.gettempdir()) / "pokemon-genuine-audio-sources"
COMMIT = "c2a686eb08ace6e890d8fe3d2134c76988db87b5"
REPOSITORY = "https://github.com/PokeMiners/pogo_assets"
SOURCE_PATH = "Sounds/Encounter/se_go_ball_ground.wav"
SOURCE_SHA256 = "42ee9eb7e175c16ea628760b1d45cf981c04beb737c57a267c7cf667a143781e"
SOURCE_BLOB_SHA1 = "71e38d704c8c7b45a7d124b300a914e5c7785381"
SOURCE_URL = f"https://raw.githubusercontent.com/PokeMiners/pogo_assets/{COMMIT}/" + quote(SOURCE_PATH)
SOURCE_PAGE = f"{REPOSITORY}/blob/{COMMIT}/" + quote(SOURCE_PATH)
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
RATE = 48000
CONTACT_END = .155
FADE_START = .138
ATTACK_FADE = .0005
SILENT_TAIL = .005
DURATION = CONTACT_END + SILENT_TAIL
GAIN = .38
RECIPES = {
    "ballbounce": {"target": -4.5, "role": "First visible Poké Ball floor contact"},
    "ballsettle": {"target": -10.5, "role": "Second visible Poké Ball floor contact; quieter reuse of the same first-contact excerpt"},
}


def run(args, data=None):
    result = subprocess.run(args, input=data, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors="replace"))
    return result.stdout


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git_blob_sha1(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def fetch():
    destination = CACHE / SOURCE_PATH
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not destination.exists():
        pending = destination.with_suffix(".wav.download")
        run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "90", SOURCE_URL, "-o", str(pending)])
        pending.replace(destination)
    data = destination.read_bytes()
    if sha256(destination) != SOURCE_SHA256 or git_blob_sha1(data) != SOURCE_BLOB_SHA1:
        raise ValueError("Pinned Poké Ball source hash mismatch")
    return destination


def floats(raw):
    result = array.array("f")
    result.frombytes(raw)
    if sys.byteorder != "little":
        result.byteswap()
    if not result or not all(math.isfinite(v) for v in result):
        raise ValueError("Invalid PCM samples")
    return result


def decode(path, rate=RATE):
    # Do not downmix dual mono to mono: ffmpeg's mix matrix changes the gain.
    raw = run([FFMPEG, "-v", "error", "-xerror", "-i", str(path), "-map", "0:a:0", "-vn", "-ar", str(rate), "-f", "f32le", "-"])
    with wave.open(str(path)) as source:
        channels = source.getnchannels()
    return floats(raw), channels


def db(value):
    return round(20 * math.log10(max(value, 1e-10)), 6)


def inspect(path):
    samples, channels = decode(path)
    high, high_channels = decode(path, RATE * 4)
    # Per-frame max preserves channel peaks without an amplitude-changing mix.
    envelope = [max(abs(v) for v in samples[i:i + channels]) for i in range(0, len(samples), channels)]
    high_envelope = [max(abs(v) for v in high[i:i + high_channels]) for i in range(0, len(high), high_channels)]
    peak = max(envelope)
    def onset(threshold):
        return next((round(i / RATE, 9) for i, v in enumerate(envelope) if v >= threshold), None)
    return {
        "duration": round(len(envelope) / RATE, 9),
        "sampleRate": RATE,
        "channels": channels,
        "peakDbfs": db(peak),
        "truePeak4xDbfs": db(max(high_envelope)),
        "peakTime": round(envelope.index(peak) / RATE, 9),
        "truePeakTime4x": round(high_envelope.index(max(high_envelope)) / (RATE * 4), 9),
        "onsetMinus60Dbfs": onset(10 ** (-60 / 20)),
        "onset40DbBelowPeak": onset(peak * .01),
        "onset20DbBelowPeak": onset(peak * .1),
        "rmsDbfs": db(math.sqrt(sum(v * v for v in samples) / len(samples))),
        "lastSampleDbfs": db(max(map(abs, samples[-channels:]))),
        "silentTailFrames": next((i for i in range(len(envelope)) if envelope[-1 - i] != 0), len(envelope)),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
    }


def write_wav(path, samples, gain):
    with wave.open(str(path), "wb") as output:
        output.setnchannels(2)
        output.setsampwidth(2)
        output.setframerate(RATE)
        # Identical L/R channels preserve the game's mono source. PCM has no
        # encoder priming, decoder skip samples, pre-echo or lossy transient.
        pcm = b"".join(struct.pack("<hh", int(round(v * gain * 32767)), int(round(v * gain * 32767))) for v in samples)
        output.writeframes(pcm)


def main():
    source = fetch()
    decoded, channels = decode(source)
    if channels != 1:
        raise ValueError("Expected the pinned mono original")
    edited = list(decoded[:round(CONTACT_END * RATE)])
    # Keep the complete initial transient and its first natural decay. Only
    # the final quiet trough is faded, before the next recorded swell.
    for index, value in enumerate(edited):
        time = index / RATE
        attack = min(1, time / ATTACK_FADE)
        tail = 1 if time < FADE_START else .5 * (1 + math.cos(math.pi * min(1, (time - FADE_START) / (CONTACT_END - FADE_START))))
        edited[index] = value * attack * tail
    edited.extend([0.0] * round(SILENT_TAIL * RATE))
    with tempfile.TemporaryDirectory(prefix="pokemon-ball-bounce-") as folder:
        intermediate = Path(folder) / "contact.wav"
        # Float PCM avoids introducing a temporary 16-bit quantization pass.
        raw = b"".join(struct.pack("<f", v) for v in edited)
        run([FFMPEG, "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "1", "-i", "-", "-c:a", "pcm_f32le", str(intermediate)], raw)
        oversampled = floats(run([FFMPEG, "-v", "error", "-xerror", "-i", str(intermediate), "-ar", str(RATE * 4), "-f", "f32le", "-"]))
        original_true_peak = max(map(abs, oversampled))
    OUT.mkdir(parents=True, exist_ok=True)
    effects = {}
    for name, recipe in RECIPES.items():
        output = OUT / f"{name}.wav"
        gain = 10 ** (recipe["target"] / 20) / original_true_peak
        write_wav(output, edited, gain)
        measured = inspect(output)
        if abs(measured["truePeak4xDbfs"] - recipe["target"]) > .03:
            raise ValueError(f"True-peak target failed: {name}: {measured}")
        if measured["onset20DbBelowPeak"] > .005 or measured["duration"] != DURATION:
            raise ValueError(f"Contact timing failed: {name}: {measured}")
        if measured["silentTailFrames"] < round(SILENT_TAIL * RATE) or measured["lastSampleDbfs"] > -90:
            raise ValueError(f"Tail failed: {name}: {measured}")
        effects[name] = {"sourceSound": "Poké Ball ground contact", "role": recipe["role"], "files": {"wav": {"path": f"/assets/audio-v7/{name}.wav", "codec": "pcm_s16le", **measured}}, "recommendedPlaybackGain": GAIN, "targetTruePeakDbfs": recipe["target"], "normalizationGain": gain}
        print(f"{name}: {measured['truePeak4xDbfs']:.3f} dBTP; onset {measured['onset20DbBelowPeak'] * 1000:.3f} ms; peak {measured['peakTime'] * 1000:.3f} ms; {measured['bytes']} bytes")
    with wave.open(str(source)) as original:
        original_format = {"sampleRate": original.getframerate(), "channels": original.getnchannels(), "sampleWidthBits": original.getsampwidth() * 8, "frames": original.getnframes(), "duration": original.getnframes() / original.getframerate()}
    provenance = {
        "description": "Two independently schedulable Poké Ball floor-contact cues, both derived from the same authentic first-contact excerpt. The second is 6 dB quieter; no separately recorded second bounce is claimed.",
        "source": {"repository": REPOSITORY, "commit": COMMIT, "path": SOURCE_PATH, "url": SOURCE_URL, "page": SOURCE_PAGE, "sha256": SOURCE_SHA256, "gitBlobSha1": SOURCE_BLOB_SHA1, **original_format},
        "rights": "Copyrighted Pokémon GO game audio reused under the user's stated Pokémon license. PokeMiners is the archive source; this is not an open-license claim.",
        "processing": {"sourceStart": 0, "sourceEnd": CONTACT_END, "attackFade": ATTACK_FADE, "tailFadeStart": FADE_START, "tailFadeEnd": CONTACT_END, "tailFadeCurve": "half cosine", "silentTail": SILENT_TAIL, "sampleRate": RATE, "codec": "16-bit PCM WAV, dual mono", "pitchChange": 0, "speedChange": 0, "method": "Original first transient and decay; 0.5 ms edge fade, 17 ms fade in the natural trough before later recorded swells, 5 ms silent endpoint guard, peak normalization. No EQ, compression, layering, synthesis, added reverb or source pitch/time change. Resampling supplies browser-compatible PCM; it cannot add source detail."},
        "timing": {"startOffset": 0, "preRoll": 0, "instruction": "Schedule ballbounce at BALL_HIT + landing.contact and ballsettle at BALL_HIT + landing.settled. Both files have audible onset within 2 ms and peak at about 9 ms; no negative pre-roll or seek offset is needed. Dedicated scheduling avoids coupling these to the card land cue."},
        "validation": "Both delivered WAVs decode with ffmpeg -xerror; samples are finite; four-times oversampled peak is within 0.03 dB of target; the -20 dB relative transient threshold occurs within 5 ms; duration is exactly 160 ms; at least 5 ms of digital silence terminates each file. PCM avoids compressed-audio priming and pre-echo. Actual output-device latency still depends on the browser/audio system.",
        "reproduce": "python3 scripts/prepare-ball-bounce-v7.py; optional ASSET_FFMPEG=/absolute/path/to/ffmpeg. Requires Python 3, curl and ffmpeg. Source SHA-256 and Git blob SHA-1 are both checked before processing. Writes only public/assets/audio-v7.",
        "toolVersion": run([FFMPEG, "-version"]).decode().splitlines()[0],
        "effects": effects,
    }
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2, ensure_ascii=False) + "\n")
    manifest = {name: {"files": {"wav": entry["files"]["wav"]["path"]}, "duration": DURATION, "gain": GAIN, "peakDbfs": entry["targetTruePeakDbfs"], "sourceSound": entry["sourceSound"], "timing": {"startOffset": 0, "preRoll": 0, "onset": entry["files"]["wav"]["onset20DbBelowPeak"], "peak": entry["files"]["wav"]["peakTime"]}} for name, entry in effects.items()}
    (OUT / "cues.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
