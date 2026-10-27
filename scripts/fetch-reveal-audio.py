#!/usr/bin/env python3
"""Fetch documented samples and make bounded reveal one-shots. No oscillator loops.

Requires curl, ffmpeg and ffprobe; no Python packages. Source cache stays outside
the deployment folder. Pokémon cries are genuine game audio, not anime voices.
"""
import array
import concurrent.futures
import hashlib
import json
import math
import os
import pathlib
import shutil
import subprocess
import tempfile
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/audio-v2"
CACHE = pathlib.Path(tempfile.gettempdir()) / "pokemon-reveal-audio-sources"
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"

LIBRARIES = {
    "rpg": ("https://kenney.nl/assets/rpg-audio", "https://kenney.nl/media/pages/assets/rpg-audio/8e99002d76-1677590336/kenney_rpg-audio.zip", "Kenney"),
    "impact": ("https://kenney.nl/assets/impact-sounds", "https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip", "Kenney"),
    "scifi": ("https://kenney.nl/assets/sci-fi-sounds", "https://kenney.nl/media/pages/assets/sci-fi-sounds/6b296f9ecf-1677589334/kenney_sci-fi-sounds.zip", "Kenney"),
    "interface": ("https://kenney.nl/assets/interface-sounds", "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip", "Kenney"),
    "casino": ("https://kenney.nl/assets/casino-audio", "https://kenney.nl/media/pages/assets/casino-audio/2472606a04-1721639069/kenney_casino-audio.zip", "Kenney"),
    "water": ("https://opengameart.org/content/40-cc0-water-splash-slime-sfx", "https://opengameart.org/sites/default/files/water-splash-slime-sfx.zip", "rubberduck"),
}
SINGLES = {
    "flame.ogg": ("https://opengameart.org/content/catching-fire", "https://opengameart.org/sites/default/files/flame_0.ogg", "themightyglider, derived from qubodup's recording", "CC0-1.0"),
    "magical-1.ogg": ("https://opengameart.org/content/magic-spell-sfx", "https://opengameart.org/sites/default/files/magical_1_0.ogg", "JaggedStone", "CC0-1.0"),
    "magical-4.ogg": ("https://opengameart.org/content/magic-spell-sfx", "https://opengameart.org/sites/default/files/magical_4.ogg", "JaggedStone", "CC0-1.0"),
    "pokeball-open.mp3": ("https://www.myinstants.com/en/instant/pokeball-open/", "https://www.myinstants.com/media/sounds/pokeball_sound_effects_mp3cut_1.mp3", "Community uploader nauth; original producer/episode unverified", "Pokémon-associated effect, included under user's stated license; uploader provenance unverified"),
}


def layer(file, gain=1, rate=1, delay=0, start=0, length=2, filters=""):
    return dict(file=file, gain=gain, rate=rate, delay=delay, start=start, length=length, filters=filters)


# Layered one-shots: sampled transient + body + short tail, rather than beeps.
# Rates alter the sample's pitch/speed; all edits are recorded in provenance.
RECIPES = {
    "throw": (.55, [layer("rpg/Audio/knifeSlice.ogg", .8, .82), layer("rpg/Audio/cloth2.ogg", .2, 1.2, 30)]),
    "impact": (.65, [layer("impact/Audio/impactPunch_heavy_000.ogg", .8, .75), layer("impact/Audio/impactMetal_light_001.ogg", .22, .7, 12)]),
    "release": (1.8, [layer("pokeball-open.mp3", start=.54, length=1.8)]),
    "charge": (1.3, [layer("scifi/Audio/lowFrequency_explosion_000.ogg", .4, .9, filters="areverse,highpass=f=75"), layer("scifi/Audio/forceField_000.ogg", .55, .85, 160, filters="areverse")]),
    "fire": (1.45, [layer("flame.ogg", .9, .8), layer("scifi/Audio/thrusterFire_002.ogg", .45, .85, 60, length=1.2, filters="lowpass=f=6500"), layer("scifi/Audio/explosionCrunch_001.ogg", .25, .85)]),
    "electric": (1.1, [layer("scifi/Audio/forceField_003.ogg", .6, 1.12), layer("scifi/Audio/laserLarge_002.ogg", .4, .85, 45), layer("impact/Audio/impactGlass_light_002.ogg", .3, 1.3, 80)]),
    "water": (1.3, [layer("water/splash_04.ogg", .8, .9), layer("water/splash_11.ogg", .45, 1.1, 110), layer("water/bubble_02.ogg", .2, .8, 320)]),
    "psychic": (1.65, [layer("magical-4.ogg", .7, .92, length=1.5), layer("scifi/Audio/forceField_001.ogg", .22, .65, 80, filters="aecho=.6:.5:110:.25")]),
    "leaf": (1.0, [layer("impact/Audio/footstep_grass_001.ogg", .7, .85), layer("impact/Audio/footstep_grass_003.ogg", .4, 1.15, 130), layer("rpg/Audio/knifeSlice2.ogg", .2, 1.1, 40)]),
    "wind": (1.25, [layer("scifi/Audio/thrusterFire_000.ogg", .55, .78, length=1.15, filters="highpass=f=400,lowpass=f=4800"), layer("rpg/Audio/knifeSlice.ogg", .35, .65, 130, filters="aecho=.5:.4:95:.2")]),
    "ice": (1.25, [layer("impact/Audio/impactGlass_heavy_002.ogg", .6, 1.05), layer("impact/Audio/footstep_snow_001.ogg", .55, .7, 30), layer("interface/Audio/glass_004.ogg", .23, 1.25, 140)]),
    "dark": (1.6, [layer("scifi/Audio/spaceEngineLow_003.ogg", .65, .72, length=1.4, filters="lowpass=f=1800"), layer("scifi/Audio/explosionCrunch_004.ogg", .3, .65, filters="areverse,lowpass=f=2800")]),
    "metal": (1.15, [layer("impact/Audio/impactMetal_heavy_001.ogg", .8, .85), layer("rpg/Audio/drawKnife2.ogg", .3, .8, 20), layer("impact/Audio/impactBell_heavy_003.ogg", .18, 1.2, 80)]),
    "ground": (1.2, [layer("impact/Audio/impactMining_002.ogg", .7, .72), layer("impact/Audio/impactWood_heavy_000.ogg", .4, .65, 40), layer("scifi/Audio/lowFrequency_explosion_001.ogg", .4, .8, length=1.05, filters="lowpass=f=1000")]),
    "flip": (.35, [layer("casino/Audio/card-slide-4.ogg", .85, 1.1), layer("casino/Audio/card-place-2.ogg", .2, 1, 70)]),
    "reveal": (.8, [layer("casino/Audio/card-fan-1.ogg", .7), layer("interface/Audio/glass_001.ogg", .4, 1.1, 45)]),
    "tear": (1.05, [layer("casino/Audio/cards-pack-open-1.ogg", .9), layer("rpg/Audio/cloth3.ogg", .2, .8, 90)]),
    "complete": (1.8, [layer("magical-1.ogg", .8), layer("impact/Audio/impactBell_heavy_000.ogg", .18, 1.35, 100)]),
    "credit": (.7, [layer("rpg/Audio/handleCoins.ogg", .7, 1.1), layer("interface/Audio/confirmation_001.ogg", .25, .9, 80)]),
}


def run(args):
    result = subprocess.run(args, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors="replace"))
    return result.stdout


def download(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        temporary = path.with_suffix(path.suffix + ".download")
        run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "90", url, "-o", str(temporary)])
        temporary.replace(path)
    return path


def probe(path):
    data = json.loads(run([FFPROBE, "-v", "error", "-show_entries", "format=duration:stream=codec_name,sample_rate,channels", "-of", "json", str(path)]))
    return {"duration": round(float(data["format"]["duration"]), 4), **data["streams"][0]}


def peak(path):
    raw = run([FFMPEG, "-v", "error", "-i", str(path), "-vn", "-f", "f32le", "-acodec", "pcm_f32le", "-"])
    samples = array.array("f"); samples.frombytes(raw)
    return max(map(abs, samples), default=0)


def encode_pair(source, destination, length=None):
    duration = length or probe(source)["duration"]
    gain = 10 ** (-4 / 20) / max(peak(source), .0001)
    filters = f"volume={gain:.9f},afade=t=in:st=0:d=0.003,afade=t=out:st={max(0,duration-.08):.5f}:d=0.08,alimiter=limit=0.89:level=false"
    files = {}
    for extension, codec in [("ogg", ["-c:a", "libopus", "-b:a", "128k", "-vbr", "on"]), ("mp3", ["-c:a", "libmp3lame", "-b:a", "192k"] )]:
        path = destination.with_suffix("." + extension)
        run([FFMPEG, "-v", "error", "-y", "-i", str(source), "-vn", "-t", str(duration), "-ar", "48000" if extension == "ogg" else "44100", "-ac", "2", "-af", filters, *codec, str(path)])
        measured = peak(path)
        if measured >= .95:
            raise ValueError(f"Encoded peak too high: {path} {measured}")
        files[extension] = {"path": "/" + str(path.relative_to(ROOT / "public")), **probe(path), "peakDbfs": round(20 * math.log10(max(measured, .000001)), 2), "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
    return files


def prepare_library(item):
    name, (_, url, _) = item
    archive = download(url, CACHE / f"{name}.zip")
    destination = CACHE / name
    with zipfile.ZipFile(archive) as package:
        for entry in package.infolist():
            if not (destination / entry.filename).resolve().is_relative_to(destination.resolve()):
                raise ValueError("Unsafe archive path")
        package.extractall(destination)


def source_note(file):
    if file in SINGLES:
        page, url, creator, license_name = SINGLES[file]
        return dict(file=file, page=page, url=url, creator=creator, license=license_name)
    library, member = file.split("/", 1)
    page, url, creator = LIBRARIES[library]
    return dict(file=member, page=page, archive=url, creator=creator, license="CC0-1.0")


def build_effect(item):
    name, (duration, layers) = item
    command = [FFMPEG, "-v", "error", "-y"]
    for entry in layers:
        command += ["-i", str(CACHE / entry["file"])]
    filters = []
    for index, entry in enumerate(layers):
        chain = f"[{index}:a]atrim=start={entry['start']}:duration={entry['length']},asetpts=PTS-STARTPTS,aresample=44100,asetrate={44100*entry['rate']:.0f},aresample=44100,aformat=channel_layouts=stereo"
        if entry["filters"]: chain += "," + entry["filters"]
        chain += f",volume={entry['gain']},adelay={entry['delay']}|{entry['delay']}[a{index}]"
        filters.append(chain)
    filters.append("".join(f"[a{i}]" for i in range(len(layers))) + f"amix=inputs={len(layers)}:normalize=0,apad=pad_dur={duration},atrim=duration={duration},highpass=f=35[mix]")
    intermediate = CACHE / f"mixed-{name}.wav"
    run(command + ["-filter_complex", ";".join(filters), "-map", "[mix]", "-c:a", "pcm_f32le", str(intermediate)])
    result = dict(files=encode_pair(intermediate, OUT / name, duration), sources=[source_note(entry["file"]) for entry in layers], processing=dict(duration=duration, layers=layers, mastering="Stereo; sample peak normalized to -4 dBFS; edge fades; protective limiter; 48kHz OGG Opus at 128kbps and 44.1kHz MP3 at 192kbps"))
    print(f"Effect {name}: {duration:.2f}s", flush=True)
    return name, result


def main():
    OUT.mkdir(parents=True, exist_ok=True); (OUT / "cries").mkdir(exist_ok=True); CACHE.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(6) as pool:
        list(pool.map(prepare_library, LIBRARIES.items()))
        list(pool.map(lambda item: download(item[1][1], CACHE / item[0]), SINGLES.items()))
    species = json.loads((ROOT / "public/assets/pokemon/manifest.json").read_text())

    def cry(item):
        name, row = item; dex = row["dexId"]
        url = f"https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/{dex}.ogg"
        source = download(url, CACHE / "cries" / f"{dex}.ogg")
        result = dict(name=name, dexId=dex, files=encode_pair(source, OUT / "cries" / str(dex)), source=url, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest())
        print(f"Cry {name} ({dex})", flush=True)
        return str(dex), result

    with concurrent.futures.ThreadPoolExecutor(5) as pool:
        cries = dict(pool.map(cry, species.items()))
        effects = dict(pool.map(build_effect, RECIPES.items()))
    provenance = {
        "description": "Sampled reveal one-shots and authentic Pokémon game cries; no anime voice impersonation, dialogue, songs, or generated oscillator loops.",
        "criesSource": {"repository": "https://github.com/PokeAPI/cries", "kind": "Latest game cries, not anime voices", "upstream": "PokeAPI README identifies Pokémon Showdown, Veekun and The Sounds Resource as upstream sources.", "rights": "Pokémon/game audio included under user's stated license; PokeAPI is a community mirror, not the rights holder.", "processing": "Complete cry retained; peak normalization, 3ms attack/80ms tail fade, stereo 48kHz OGG Opus and 44.1kHz MP3 encoding."},
        "releaseProvenance": {"status": "Community-uploaded Poké Ball opening sample; original episode, sound-library source, and uploader chain of custody not independently verified.", "reference": "https://soundeffects.fandom.com/wiki/Anime_Big_Pop_Sound", "selection": "First 1.8 seconds after the initial 0.54-second silence lead-in from MyInstants uploader nauth. This is an excerpt of the source recording, not a newly synthesized substitute.", "validation": "Audio format, duration, decoding, source attribution and output peak checks verified. Automated tooling here does not provide human listening review."},
        "recommendedPlayback": "MP3 provides broad Safari compatibility; OGG alternate supplied. Start cries/release at gain 0.55, power layers at 0.3 and UI at 0.35; avoid playing several full-gain effects together.",
        "aliases": {"pokeball-open": "release", "rare": "charge"},
        "effects": effects,
        "cries": cries,
    }
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    print(f"Finished: {len(cries)} game cries + {len(effects)} effects, each OGG and MP3; no missing species.")


if __name__ == "__main__":
    main()
