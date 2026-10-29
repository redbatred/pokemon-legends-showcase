#!/usr/bin/env python3
"""Build the actual anime battle loop and two staged Poké Ball cues.

Only writes public/assets/audio-v13 and the existing temporary source caches.
Requires Python 3, curl, ffmpeg and ffprobe; no Python packages are required.
Copyrighted Pokémon audio reuse follows the user's stated Pokémon license.
"""

import array
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import sys
import tempfile
from urllib.parse import quote
import zipfile

sys.dont_write_bytecode = True


def module(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    loaded = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(loaded)
    return loaded


P = module("polish_audio_v13", "polish-audio.py")
G = module("genuine_audio_v13", "fetch-genuine-audio.py")
# macOS per-process temp folders differ from the source cache used by prior
# asset sessions. Prefer that shared /tmp cache, while retaining explicit env
# overrides and a portable fallback on systems without /tmp.
SHARED_TEMP = Path("/tmp") if Path("/tmp").is_dir() else Path(tempfile.gettempdir())
P.CACHE = Path(os.environ.get("REVEAL_AUDIO_SOURCE_CACHE", str(SHARED_TEMP / "pokemon-reveal-audio-sources")))
G.CACHE = Path(os.environ.get("POKEMON_GAME_AUDIO_SOURCE_CACHE", str(SHARED_TEMP / "pokemon-genuine-audio-sources")))
OUT = P.ROOT / "public/assets/audio-v13"
RATE = P.RATE
TRACK_MEMBER = "Pocket Monsters TV Anime Orchestral Arrangements/15 Battle (VS Trainer)（１９９７－１９９８｜Ｍ５６）.mp3"
TRACK_URL = "https://archive.org/download/16-battle-vs-trainer1997-1998m56b/" + quote(TRACK_MEMBER)
TRACK_SHA = "bd1b3868accc446faba62267627e8c11fd1d372459eb36309e6fc7f449dd53f1"
MUSIC_START = 14.296
MUSIC_PERIOD = 69.549
MUSIC_CROSSFADE = .240
FOLEY = "rpg/Audio/knifeSlice.ogg"
FOLEY_SHA = "4cd96dc630bed9840c15f1dd2306da2cc56a4da26a5d3f1a03c5a7265ac5e54f"
GAME_PATHS = {
    "throw": "Sounds/Encounter/se_go_ball_throw.wav",
    "release": "Sounds/Encounter/se_go_ball_bowa1.wav",
    "air": "Sounds/Encounter/se_go_ball_out.wav",
    "sparkle": "Sounds/Master Ball/mb_sparkleMotionSFX.wav",
}


def layer(source, start, length, gain, delay, filters, purpose):
    return dict(source=source, start=start, length=length, gain=gain,
                delay=delay, filters=filters, purpose=purpose)


RECIPES = {
    "flight": {
        "duration": 1.12,
        "gain": .43,
        "targetPeakDbfs": -6,
        "intent": "A distant, soft approach grows into a close airy throw as the Poké Ball reaches the card. Start once at flight launch, not at contact.",
        "layers": [
            layer("throw", 0, .53, .19, 0,
                  "areverse,atempo=0.66,highpass=f=170,lowpass=f=2300,afade=t=in:d=0.20,afade=t=out:st=0.62:d=0.18",
                  "Authentic game throw reversed and stretched without repitching for a soft distant approach"),
            layer("foley", .015, .47, .34, .57,
                  "atempo=0.90,highpass=f=380,lowpass=f=9000,afade=t=in:d=0.09,afade=t=out:st=0.34:d=0.18",
                  "Quiet recorded swish supplies airy detail as the ball gets close"),
            layer("throw", 0, .34, 1, .78,
                  "highpass=f=130,lowpass=f=8200,afade=t=in:d=0.025,afade=t=out:st=0.23:d=0.10",
                  "Original-pitch game throw crests at about 0.935 seconds and decays into contact"),
        ],
    },
    "release": {
        "duration": 1.0,
        "gain": .46,
        "targetPeakDbfs": -6,
        "intent": "Immediate authentic Poké Ball opening burst, followed by a low airy expansion and a restrained sparkle under the creature entrance. Start at shell opening; keep the species cry separately scheduled.",
        "layers": [
            layer("release", 0, .3657, 1, 0,
                  "highpass=f=80,lowpass=f=7200,afade=t=in:d=0.001,afade=t=out:st=0.28:d=0.075",
                  "The original game ball-opening transient anchors the visible shell split"),
            layer("air", .02, .78, .28, .035,
                  "highpass=f=250,lowpass=f=6400,afade=t=in:d=0.04,afade=t=out:st=0.48:d=0.29",
                  "Authentic ball-out air adds the creature-emergence body without another impact"),
            layer("sparkle", .22, .77, .12, .13,
                  "highpass=f=1600,lowpass=f=7000,afade=t=in:d=0.09,afade=t=out:st=0.46:d=0.30",
                  "A quiet excerpt of original Master Ball sparkle provides a brief high tail"),
        ],
    },
}


def fetch_sources():
    P.CACHE.mkdir(parents=True, exist_ok=True)
    music = P.CACHE / "battle-trainer-m56.mp3"
    if not music.exists():
        pending = music.with_suffix(".mp3.download")
        P.run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "180", TRACK_URL, "-o", str(pending)])
        pending.replace(music)
    if P.sha256(music) != TRACK_SHA:
        raise ValueError("Anime source changed; inspect the source before updating its pinned SHA-256")
    sources = {key: G.fetch(path) for key, path in GAME_PATHS.items()}
    foley = P.CACHE / FOLEY
    if not foley.exists():
        archive = P.CACHE / "rpg.zip"
        if not archive.exists():
            P.run(["curl", "-fsSL", "--retry", "3", "--max-time", "90", P.LIBRARIES["rpg"][1], "-o", str(archive)])
        with zipfile.ZipFile(archive) as package:
            foley.parent.mkdir(parents=True, exist_ok=True)
            foley.write_bytes(package.read("Audio/knifeSlice.ogg"))
    if P.sha256(foley) != FOLEY_SHA:
        raise ValueError("Recorded swish source hash mismatch")
    sources["foley"] = foley
    return music, sources


def source_note(key, path):
    if key == "foley":
        return P.source_note(FOLEY)
    relative = GAME_PATHS[key]
    source_bytes = path.read_bytes()
    return {
        "file": relative, "url": G.source_url(relative),
        "page": f"{G.REPOSITORY}/blob/{G.COMMIT}/" + quote(relative),
        "repositoryCommit": G.COMMIT, "sha256": P.sha256(path),
        "gitBlobSha1": hashlib.sha1(b"blob " + str(len(source_bytes)).encode() + b"\0" + source_bytes).hexdigest(),
        **P.probe(path),
        "rights": "Copyrighted Pokémon GO sound, reused under the user's stated Pokémon license. PokeMiners is a community asset archive; no open-license claim is made.",
    }


def encode(name, mix, duration, target, loop=False):
    gain = 10 ** (target / 20) / max(map(abs, P.decode(mix, RATE * 4)))
    files = {}
    for ext, codec, rate in [("mp3", ["-c:a", "libmp3lame", "-b:a", "192k"], 44100),
                             ("ogg", ["-c:a", "libopus", "-b:a", "128k", "-vbr", "on"], 48000)]:
        destination = OUT / f"{name}.{ext}"
        codec_gain = gain
        for attempt in range(4):
            P.run([P.FFMPEG, "-v", "error", "-y", "-i", str(mix), "-map_metadata", "-1",
                   "-af", f"volume={codec_gain:.12f}", "-ar", str(rate), "-ac", "2", *codec, str(destination)])
            measured = P.measure(destination)
            if abs(measured["oversampledPeakDbfs"] - target) <= .25:
                break
            codec_gain *= 10 ** ((target - measured["oversampledPeakDbfs"]) / 20)
        if abs(measured["oversampledPeakDbfs"] - target) > .3:
            raise ValueError(f"Decoded headroom outside target: {destination} {measured}")
        if abs(measured["decodedDuration"] - duration) > .003:
            raise ValueError(f"Decoded duration mismatch: {destination} {measured}")
        if not loop and (measured["firstSampleDbfs"] > -55 or measured["lastSampleDbfs"] > -65):
            raise ValueError(f"Cue edge did not settle: {destination} {measured}")
        pcm = P.decode(destination)
        if loop:
            seam = max(abs(pcm[channel] - pcm[-2 + channel]) for channel in (0, 1))
            local = max(abs(pcm[i] - pcm[i-2]) for i in list(range(2, 2400)) + list(range(len(pcm)-2400, len(pcm))))
            measured.update(wrapSampleStepDbfs=P.db(seam), nearbyMaximumSampleStepDbfs=P.db(local))
            if seam > max(.02, local * 1.35):
                raise ValueError(f"Loop seam discontinuity exceeds nearby waveform changes: {measured}")
        else:
            mono_peak = [max(abs(pcm[i]), abs(pcm[i+1])) for i in range(0, len(pcm), 2)]
            peak = max(mono_peak)
            measured["peakTimeSeconds"] = round(mono_peak.index(peak) / RATE, 6)
            measured["onset40DbBelowPeakSeconds"] = round(next(i for i, v in enumerate(mono_peak) if v > peak * .01) / RATE, 6)
            measured["rms100msDbfs"] = [P.db(math.sqrt(sum(x*x for x in pcm[i:i+RATE//5]) / len(pcm[i:i+RATE//5]))) for i in range(0, len(pcm), RATE//5)]
        files[ext] = {"path": "/" + str(destination.relative_to(P.ROOT / "public")), **P.probe(destination),
                      **measured, "sha256": P.sha256(destination), "bytes": destination.stat().st_size}
    print(f"{name}: {duration:.3f}s; " + "; ".join(f"{ext} peak {info['oversampledPeakDbfs']:.3f} dBFS" for ext, info in files.items()), flush=True)
    return files


def build_effect(name, recipe, sources, working):
    command = [P.FFMPEG, "-v", "error", "-y"]
    filters, processing = [], []
    for i, part in enumerate(recipe["layers"]):
        edited = working / f"{name}-{i}.wav"
        chain = f"atrim=start={part['start']}:duration={part['length']},asetpts=PTS-STARTPTS,aresample={RATE},aformat=channel_layouts=stereo," + part["filters"]
        P.run([P.FFMPEG, "-v", "error", "-y", "-i", str(sources[part["source"]]), "-af", chain, "-c:a", "pcm_f32le", str(edited)])
        peak = max(map(abs, P.decode(edited)))
        gain = 10 ** (-12 / 20) / peak * part["gain"]
        delay = round(part["delay"] * 1000)
        command += ["-i", str(edited)]
        filters.append(f"[{i}:a]volume={gain:.12f},adelay={delay}|{delay}[a{i}]")
        processing.append({**part, "appliedLinearGain": round(gain, 9)})
    duration = recipe["duration"]
    # The final 20 ms is deliberately silent to absorb predictive-codec tails.
    filters.append("".join(f"[a{i}]" for i in range(len(processing))) +
                   f"amix=inputs={len(processing)}:normalize=0,apad=pad_dur={duration},atrim=duration={duration},highpass=f=35,afade=t=in:d=0.002,afade=t=out:st={duration-.065}:d=0.045[mix]")
    mix = working / f"{name}-mix.wav"
    P.run(command + ["-filter_complex", ";".join(filters), "-map", "[mix]", "-c:a", "pcm_f32le", str(mix)])
    return {
        "intent": recipe["intent"],
        "files": encode(name, mix, duration, recipe["targetPeakDbfs"]),
        "sources": [source_note(key, sources[key]) for key in dict.fromkeys(p["source"] for p in recipe["layers"])],
        "processing": {"duration": duration, "layers": processing, "silentTailSeconds": .020,
                       "targetPeakDbfs": recipe["targetPeakDbfs"],
                       "method": "48 kHz stereo float mixing of source excerpts; normalized ingredient peaks before relative balance; source-specific EQ and fades; final DC removal and 20 ms silent codec guard. No oscillator tones, generated noise, artificial reverb or master limiting. Original pitch retained in every layer; only the distant flight layers are reversed/time-stretched as documented."},
        "recommendedPlaybackGain": recipe["gain"],
    }


def build_battle(source, working):
    phrase = working / "battle-phrase.wav"
    P.run([P.FFMPEG, "-v", "error", "-y", "-i", str(source), "-af",
           f"atrim=start={MUSIC_START}:duration={MUSIC_PERIOD+MUSIC_CROSSFADE},asetpts=PTS-STARTPTS,highpass=f=35,lowpass=f=14000",
           "-ar", str(RATE), "-ac", "2", "-c:a", "pcm_f32le", str(phrase)])
    samples = P.decode(phrase)
    frames, overlap = round(MUSIC_PERIOD * RATE), round(MUSIC_CROSSFADE * RATE)
    if len(samples) < (frames + overlap) * 2:
        raise ValueError("Battle source shorter than selected loop")
    loop = array.array("f", samples[:frames * 2])
    # Head begins with the uninterrupted source continuation from the end.
    # Complementary sine-squared weights then join the matching earlier phrase.
    for frame in range(overlap):
        incoming = math.sin(frame / (overlap - 1) * math.pi / 2) ** 2
        for channel in (0, 1):
            i = frame * 2 + channel
            loop[i] = samples[frames * 2 + i] * (1 - incoming) + samples[i] * incoming
    raw = working / "battle-loop.f32"
    raw.write_bytes(loop.tobytes())
    mix = working / "battle-loop.wav"
    P.run([P.FFMPEG, "-v", "error", "-y", "-f", "f32le", "-ar", str(RATE), "-ac", "2", "-i", str(raw), "-c:a", "pcm_f32le", str(mix)])
    return {
        "title": "Battle (VS Trainer) — 1997–1998 M56",
        "files": encode("battle", mix, MUSIC_PERIOD, -12, loop=True),
        "source": {
            "url": TRACK_URL, "page": "https://archive.org/details/16-battle-vs-trainer1997-1998m56b",
            "archiveMember": TRACK_MEMBER, "sha256": TRACK_SHA,
            "archiveMd5": "2f517777a4fe8621bfbe0f2589085073", "archiveSha1": "2c4e05f083eaa8932ccd3b48f4c0031aebb57d20",
            "sourceDurationSeconds": 103.4897, "track": "Disc 1, track 15", "cueId": "1997-1998-M56",
            "album": "TV Anime Pocket Monsters Original Soundtrack Best 1997-2010", "catalog": "ZMCP-5452",
            "releaseDate": "2010-09-08", "arranger": "Shinji Miyazaki", "label": "Pikachu Records / Media Factory",
            "verification": "Archive file, embedded title/artist/track/album/publisher/date, 103.49-second duration and published disc 1 track 15 listing agree. Published listings identify M56 as the TV anime orchestral Battle (VS Trainer) cue. This is a soundtrack recording, not a generated arrangement or game-synth cover.",
            "metadataReferences": ["https://www.pocketmonsters.net/cd/view/203", "https://www.cdjapan.co.jp/product/ZMCP-5452"],
            "rights": "Copyrighted Pokémon anime music reused under the user's stated Pokémon license. Internet Archive is a community mirror, not rights-holder delivery; no open-license claim or independent uploader-authority verification is made.",
        },
        "processing": {
            "sourceStartSeconds": MUSIC_START, "sourceEndSeconds": round(MUSIC_START + MUSIC_PERIOD, 6),
            "loopDurationSeconds": MUSIC_PERIOD, "crossfadeSeconds": MUSIC_CROSSFADE,
            "targetPeakDbfs": -12, "pitchChange": 0, "tempoChange": 0,
            "selectionEvidence": "A repeated musical passage near 14.296 / 83.836 seconds was identified by three-second chroma similarity of 0.885 at a 69.54-second lag. Fine waveform correlation refined the lag to 69.549 seconds. This is numerical phrase matching, not an audition claim.",
            "method": "Original stereo recording with gentle 35 Hz high-pass / 14 kHz low-pass. A 240 ms complementary sine-squared circular crossfade joins matching musical passages. No silence, tempo/pitch change, extra instruments, vocals or generated music added. Each codec is independently normalized using decoded four-times-oversampled peak measurements.",
        },
        "recommendedPlaybackGain": .34,
        "recommendedDuckedGain": .16,
        "playback": "Decode to an AudioBuffer, loop the full 69.549-second decoded buffer, fade its bus in over 0.45 seconds and out over 0.65 seconds. Start only when a pack opens. Duck to about .16 during ball effects and creature cries, returning smoothly to .34 afterward. Avoid an HTML media-element loop when exact gapless timing is required.",
        "limitations": "The source is a community MP3 rather than a verified lossless master. Track identity, phrase similarity, duration, waveform continuity and headroom were checked; no human listening or musical-seam audition is claimed.",
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    music, sources = fetch_sources()
    with tempfile.TemporaryDirectory(prefix="pokemon-battle-audio-v13-") as folder:
        working = Path(folder)
        effects = {name: build_effect(name, recipe, sources, working) for name, recipe in RECIPES.items()}
        battle = build_battle(music, working)
    cues = {name: {"files": {ext: info["path"] for ext, info in entry["files"].items()},
                   "duration": RECIPES[name]["duration"], "gain": entry["recommendedPlaybackGain"],
                   "peakDbfs": RECIPES[name]["targetPeakDbfs"]} for name, entry in effects.items()}
    (OUT / "cues.json").write_text(json.dumps(cues, indent=2) + "\n")
    (OUT / "battle.json").write_text(json.dumps({"title": battle["title"], "files": {ext: info["path"] for ext, info in battle["files"].items()}, "duration": MUSIC_PERIOD, "loop": True, "gain": battle["recommendedPlaybackGain"], "duckedGain": battle["recommendedDuckedGain"]}, indent=2) + "\n")
    provenance = {
        "description": "Actual original-series Pokémon anime battle music plus staged Poké Ball flight and opening/creature-emergence cues.",
        "reproduce": "python3 scripts/prepare-battle-audio-v13.py. Requires only Python 3, curl, ffmpeg and ffprobe. Optional ASSET_FFMPEG, ASSET_FFPROBE and REVEAL_AUDIO_SOURCE_CACHE. All sources are SHA-256 pinned; output is limited to public/assets/audio-v13.",
        "encoder": P.run([P.FFMPEG, "-version"]).decode().splitlines()[0],
        "formats": "Stereo MP3 192 kbps / 44.1 kHz and OGG Opus 128 kbps / 48 kHz. Decoded duration, not container duration including codec delay, defines the browser AudioBuffer timeline.",
        "validation": "All six files decode with ffmpeg -xerror to finite PCM; decoded durations within 3 ms; 4x oversampled peaks within 0.3 dB of target. Effects begin below -55 dBFS and end below -65 dBFS. Music wrap waveform step is compared with nearby normal sample steps. Per-file timings, levels and SHA-256 hashes are recorded.",
        "limitations": "Automated technical validation only; no listening review is claimed. Source game effects can be low-rate original assets; output resampling does not create detail. Swish Foley is Kenney CC0; Pokémon music/game recordings follow the user's stated license, with mirror provenance recorded separately.",
        "effects": effects, "backgroundMusic": battle,
    }
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print("Prepared and validated six files; cues.json contains flight/release, battle.json contains music metadata.")


if __name__ == "__main__":
    main()
