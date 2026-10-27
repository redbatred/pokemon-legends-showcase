#!/usr/bin/env python3
"""Build compact authentic Pokémon GO-derived cues; no synthetic replacements.

Run: python3 scripts/fetch-genuine-audio.py
Requires Python 3, curl, ffmpeg and ffprobe. Downloads only the small selected
WAVs from a pinned PokeMiners commit. Pokémon audio use is based on the user's
stated license; this is not a claim that these game recordings are open-licensed.
"""

import array
import concurrent.futures
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
OUT = ROOT / "public/assets/audio-v4"
CACHE = Path(tempfile.gettempdir()) / "pokemon-genuine-audio-sources"
COMMIT = "c2a686eb08ace6e890d8fe3d2134c76988db87b5"
REPOSITORY = "https://github.com/PokeMiners/pogo_assets"
FFMPEG = os.environ.get("ASSET_FFMPEG") or shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
FFPROBE = os.environ.get("ASSET_FFPROBE") or shutil.which("ffprobe") or "/opt/homebrew/bin/ffprobe"
RATE = 48000


def cue(path, duration, decay, gain, label, start=0, target=-6, role=""):
    return dict(path="Sounds/" + path, duration=duration, decay=decay, gain=gain,
                label=label, start=start, target=target, role=role)


# These are direct excerpts of one actual game file each. No pitch changes,
# reverse effects, generated tones, invented sound layers, or added reverb.
# A 35 Hz DC-removal filter is used before the fade to prevent codec DC tails.
RECIPES = {
    "fire": cue("Pokemon Moves/053-0_flamethrower.wav", 1.10, .25, .40, "Flamethrower", role="Charizard/fire attack"),
    "water": cue("Pokemon Moves/055-0_water_gun.wav", 1.00, .22, .36, "Water Gun", role="Water attack"),
    "electric": cue("Pokemon Moves/085-0_thunderbolt.wav", .95, .20, .34, "Thunderbolt", role="Electric attack"),
    "psychic": cue("Pokemon Moves/094-0_psychic.wav", 1.10, .23, .34, "Psychic", role="Psychic attack"),
    "leaf": cue("Pokemon Moves/075-0_razor_leaf.wav", .80, .18, .34, "Razor Leaf", role="Grass attack"),
    "wind": cue("Pokemon Moves/016-0_gust_fast.wav", .95, .22, .33, "Gust", role="Wind attack"),
    "ice": cue("Pokemon Moves/058-0_ice_beam.wav", 1.10, .25, .34, "Ice Beam", role="Ice attack"),
    "dark": cue("Pokemon Moves/399-0_dark_pulse.wav", 1.00, .22, .34, "Dark Pulse", role="Dark attack"),
    "metal": cue("Pokemon Moves/232-0_metal_claw.wav", .75, .20, .34, "Metal Claw", role="Metal attack"),
    "ground": cue("Pokemon Moves/089-0_earthquake.wav", 1.10, .25, .32, "Earthquake", role="Ground attack"),
    "dragon": cue("Pokemon Moves/406-0_dragon_pulse.wav", 1.15, .25, .35, "Dragon Pulse", start=.85, role="Dragon attack; excerpt of the strongest beam passage"),
    "fairy": cue("Pokemon Moves/605-0_dazzling_gleam.wav", 1.10, .23, .34, "Dazzling Gleam", start=1.25, role="Fairy attack; excerpt of the bright payoff passage"),
    "throw": cue("Encounter/se_go_ball_throw.wav", .54, .045, .34, "Poké Ball throw", role="Ball throw"),
    "impact": cue("Encounter/se_go_ball_ground.wav", .52, .12, .28, "Poké Ball ground contact", role="Ball impact; first ground contact retained"),
    "release": cue("Encounter/se_go_ball_bowa1.wav", .366, .035, .44, "Poké Ball bowa/poof", role="The actual game's short ball-opening burst, followed by the species cry"),
    "latch": cue("Master Ball/mb_unlatchSFX.wav", .314, .025, .34, "Master Ball unlatch", role="Ball button/unlatch"),
    "tear": cue("Master Ball/mb_steamUnsealSFX.wav", 1.20, .20, .27, "Master Ball steam unseal", role="Pack unseal; repurposed Pokémon game unsealing cue, not a claim of card-paper Foley"),
    "flip": cue("Menu Sounds/SEQ_SE_OPEN2.wav", .569, .04, .20, "Game menu open", role="Card turn; repurposed game UI sound"),
    "normal": cue("Menu Sounds/SEQ_SE_COMPLETE1.wav", .784, .055, .28, "Game completion confirmation", role="Normal card reveal"),
    "rare": cue("Master Ball/mb_sparkleMotionSFX.wav", 1.26, .08, .34, "Master Ball sparkle motion", role="Rare card sparkle"),
    "complete": cue("Menu Sounds/se_go_quests_get_rewards.wav", 2.175, .10, .30, "Quest reward collected", role="One completed pack/payout reward cue; do not loop"),
    "credit": cue("Menu Sounds/se_go_main_xp.wav", .72, .065, .18, "XP awarded", target=-9, role="One completed credit award; never repeat per counter tick"),
    "ui": cue("Menu Sounds/se_go_real_button.wav", .412, .035, .20, "Game real-button click", target=-9, role="Selection"),
    "stage": cue("Encounter/se_go_pokemon_appear.wav", .80, .14, .18, "Pokémon appearance", role="Stage activation"),
    "land": cue("Encounter/se_go_ball_ground.wav", .26, .09, .15, "Poké Ball ground contact", target=-9, role="Card settling; repurposed first contact from the game"),
    "charge": cue("Pokemon Moves/076-0_solar_beam.wav", 1.30, .16, .23, "Solar Beam stage 0", role="Short game-derived charge"),
    "suspense": cue("Pokemon Moves/076-0_solar_beam.wav", 1.30, .10, .30, "Solar Beam stage 0", role="Special-card charge; retain original pitch and onset"),
    "slam": cue("Pokemon Moves/033-0_tackle.wav", .424, .045, .42, "Tackle", role="Immediate special-card reveal impact"),
}

# Filled from the exact downloaded commit files, and verified against Git tree
# blob identifiers during preparation. Pins prevent stale-cache substitution.
SOURCE_HASHES = {
    "Sounds/Pokemon Moves/053-0_flamethrower.wav": "790ad2c9f81735d3acf5a61b9df67e9c7e17758a7cbfac933ab441f4a26e99a1",
    "Sounds/Pokemon Moves/055-0_water_gun.wav": "bc65d91b12c30d766e53232bc5241d1879895c3e8a0ceae76d17edf78e16b07d",
    "Sounds/Pokemon Moves/085-0_thunderbolt.wav": "9528c66e63d730c683ca6b8dafe3f39112c3213f0b06be8bad38059cfcce7543",
    "Sounds/Pokemon Moves/094-0_psychic.wav": "c9e97ecf098c2066e4a52a3e355cdc5fa609b5e3b06297f90692a593cc113445",
    "Sounds/Pokemon Moves/075-0_razor_leaf.wav": "ee0b3febca8c5991da6e5f7b77882b6cb28eb41dcee8c0b8ff837a648d740eae",
    "Sounds/Pokemon Moves/016-0_gust_fast.wav": "e151643ca2fad69f09876728159d402cbc29fca3e56698ed90251df763ccdf5d",
    "Sounds/Pokemon Moves/058-0_ice_beam.wav": "8831573e0eaaf1b37562feb315757314256418486051c7fea7b993742190ff9d",
    "Sounds/Pokemon Moves/399-0_dark_pulse.wav": "ed027edbdb3d532ce329bd3e6b67a5309ff1e5587aabd88f534e68c54e0fe35a",
    "Sounds/Pokemon Moves/232-0_metal_claw.wav": "874826dd6682323b474b1187ffc6442eee70af4b40f4a844936cba544e237034",
    "Sounds/Pokemon Moves/089-0_earthquake.wav": "fd096b8bb6485d4583cbb4fe5506977250f373cebe1938c6ec31461df5b125a5",
    "Sounds/Pokemon Moves/076-0_solar_beam.wav": "52738dc753130f0a50135dc8b82c4fe459ca6124df065f2e19444d9a0e0d867b",
    "Sounds/Pokemon Moves/076-1_solar_beam.wav": "8c03392692ae0e38766ff995989f823ae2ad6f1e83a63f968b7b44afd3c0d7d0",
    "Sounds/Encounter/se_go_ball_throw.wav": "a6b1f4f8d9b9c0295ea40d5fc5611d77c6f269040b9c48871b9430cf461f85f7",
    "Sounds/Encounter/se_go_ball_ground.wav": "42ee9eb7e175c16ea628760b1d45cf981c04beb737c57a267c7cf667a143781e",
    "Sounds/Encounter/se_go_ball_out.wav": "ba8476ada4c3fae2683c109c15b1c18446e8311c04c30aa467c94c81b30685d3",
    "Sounds/Encounter/se_go_ball_bowa1.wav": "c9153453db3fe0778d1f4df03f171e408de2a1524365fd06ad19d4260d25b454",
    "Sounds/Encounter/se_go_ball_bowa2.wav": "a37e04b2406ba63c8fc6095d3337b5653681ddd96215747ebdd448d0bb052fb6",
    "Sounds/Encounter/se_go_pokemon_appear.wav": "5c904f488b49ea616d796e99dd1456dc73623fad7aa3d499c2385239ccc1b645",
    "Sounds/Encounter/200_ME_gotcha.wav": "a66eb757d768103d7890b2fe003ee36a44978c5fe608e600348699ed23aed7f1",
    "Sounds/Encounter/ME_gotcha_rare.wav": "990dcbf2455d4f656e4ce027719ee900b6d14ec11b474d6370b935f2529d2d08",
    "Sounds/Master Ball/mb_unlatchSFX.wav": "67e588f4937c411a82fab0b2d11935d2c2a9a95641e35ca969b302101f631a60",
    "Sounds/Master Ball/mb_steamUnsealSFX.wav": "611207d44f2b5eb4993aaf98d699d578125192db94b7b91d87f0bc07337bf9a6",
    "Sounds/Master Ball/mb_mysticalStartSFX.wav": "bdf7e8b77dd943575ea24680c06fd2c70dc12dbb21e3547a63b1ff85353ae7ff",
    "Sounds/Master Ball/mb_sparkleMotionSFX.wav": "7fe441009c6a672b4563cb09496a31d8c896954aa5ee9d0427b5aff431dbf828",
    "Sounds/Menu Sounds/se_go_sys_tap.wav": "259fb98122afcc8309a95cf10e7ad51f8a44c204878158a5b0892b679d6a6359",
    "Sounds/Menu Sounds/se_go_sys_select.wav": "2b83167421f1fc38150c9652e6a6244898ba49af2b799fedef2bc3f621678d8d",
    "Sounds/Menu Sounds/se_go_main_xp.wav": "e737b4b39ddd6525fb04f2697c3cbe694f57ad6a765e5ec138b6b1d7bfc09fa7",
    "Sounds/Menu Sounds/se_go_quests_get_rewards.wav": "ec414f22eba6ab97a0dae7cc2d54be57b1c7f53649acf5ee09af28201e4ec4a9",
    "Sounds/Menu Sounds/se_go_friend_gift_select.wav": "69ab1cdceec7bce3324e99087f0a74428cd8180b4e0f40395cc06c89d1b24ede",
    "Sounds/Menu Sounds/ui_back.wav": "737788fb1e069974eddbdc147d3bc14ad7fa403199d9740a83b923c0f0236a36",
    "Sounds/Menu Sounds/se_go_real_button.wav": "a54fcb1b46b983ff984c617002ba7e6514d12c6e0930b5f66a4dd88e96e0ba58",
    "Sounds/Menu Sounds/se_go_sys_pi.wav": "2d3e28ca2e46246afb98b43a3f6b5bfeaa2ff293dbbb30123e9b8876fb431108",
    "Sounds/Menu Sounds/SEQ_SE_COMPLETE1.wav": "f8e17ea60ed7dfb97d4f647c3ce91b006003ac247bc26236d05bf766053fd237",
    "Sounds/Menu Sounds/SEQ_SE_OPEN2.wav": "8bd30432394e30f0d5ab6f906dfa95c65cd5de3bb7e4176c392398e036445abf",
    "Sounds/Menu Sounds/se_go_quests_stamp.wav": "5dbd41029db1b897a74739df5c7caf52f283eb75053908aff7515cf2ec863c3a",
    "Sounds/Evolution/se_go_mega_evolution.wav": "7af51c73b0bff28883bddd28fe7a6aff59b81751a450617c5222fcd50ad577ff",
    "Sounds/Pokemon Moves/033-0_tackle.wav": "150459b9b6afde6d3e5877c2bbaf7840b2f463ef9239bdf512a04b9e7860738c",
    "Sounds/Pokemon Moves/406-0_dragon_pulse.wav": "3e6c23898abb0c142c977b5e9ef869431985b9fc0f47c0b064642b1417e2a6e8",
    "Sounds/Pokemon Moves/605-0_dazzling_gleam.wav": "d1330422ec0182040d3ae5018ac41c66848ae559d71f09e7ddde55cfdf338148"
}


def run(args):
    result = subprocess.run(args, capture_output=True)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors="replace"))
    return result.stdout


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_url(path):
    return f"https://raw.githubusercontent.com/PokeMiners/pogo_assets/{COMMIT}/" + quote(path)


def fetch(path):
    destination = CACHE / path
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not destination.exists():
        pending = destination.with_suffix(".wav.download")
        run(["curl", "-fsSL", "--retry", "3", "--connect-timeout", "15", "--max-time", "90", source_url(path), "-o", str(pending)])
        pending.replace(destination)
    if sha256(destination) != SOURCE_HASHES[path]:
        raise ValueError(f"Pinned game source hash mismatch: {path}")
    return destination


def probe(path):
    info = json.loads(run([FFPROBE, "-v", "error", "-show_entries", "format=duration:stream=codec_name,sample_rate,channels", "-of", "json", str(path)]))
    return {"duration": round(float(info["format"]["duration"]), 6), **info["streams"][0]}


def decode(path, rate=RATE):
    raw = run([FFMPEG, "-v", "error", "-xerror", "-i", str(path), "-vn", "-f", "f32le", "-ac", "2", "-ar", str(rate), "-"])
    samples = array.array("f")
    samples.frombytes(raw)
    if not samples or not all(math.isfinite(x) for x in samples):
        raise ValueError(f"Invalid decoded PCM: {path}")
    return samples


def db(value):
    return round(20 * math.log10(max(value, 1e-9)), 3)


def metrics(path):
    a = decode(path)
    return {"decodedDuration": round(len(a) / (RATE * 2), 6), "peakDbfs": db(max(map(abs, a))),
            "oversampledPeakDbfs": db(max(map(abs, decode(path, RATE * 4)))),
            "rmsDbfs": db(math.sqrt(sum(x*x for x in a) / len(a))),
            "lastSampleDbfs": db(max(abs(a[-2]), abs(a[-1])))}


def build(item, working):
    name, recipe = item
    source = CACHE / recipe["path"]
    duration, decay = recipe["duration"], recipe["decay"]
    edited = working / (name + ".wav")
    # One silent Opus frame after the fade prevents predictive codec ringing
    # from leaving a small discontinuity at the end of a short game transient.
    guard = .020
    filters = f"atrim=start={recipe['start']}:duration={duration},asetpts=PTS-STARTPTS,highpass=f=35,apad=pad_dur={duration},atrim=duration={duration},afade=t=in:d=0.002,afade=t=out:st={duration-decay-guard:.6f}:d={decay}"
    run([FFMPEG, "-v", "error", "-y", "-i", str(source), "-af", filters, "-ar", str(RATE), "-ac", "2", "-c:a", "pcm_f32le", str(edited)])
    gain = 10 ** (recipe["target"] / 20) / max(map(abs, decode(edited, RATE * 4)))
    files = {}
    for extension, codec, rate in [("mp3", ["-c:a", "libmp3lame", "-b:a", "192k"], 44100), ("ogg", ["-c:a", "libopus", "-b:a", "128k", "-vbr", "on"], 48000)]:
        destination = OUT / f"{name}.{extension}"
        codec_gain = gain
        for attempt in range(4):
            run([FFMPEG, "-v", "error", "-y", "-i", str(edited), "-map_metadata", "-1", "-af", f"volume={codec_gain:.12f}", "-ar", str(rate), "-ac", "2", *codec, str(destination)])
            measured = metrics(destination)
            if abs(measured["oversampledPeakDbfs"] - recipe["target"]) <= .35:
                break
            codec_gain *= 10 ** ((recipe["target"] - measured["oversampledPeakDbfs"]) / 20)
        if abs(measured["oversampledPeakDbfs"] - recipe["target"]) > .4:
            raise ValueError(f"Peak target failed: {destination} {measured}")
        if abs(measured["decodedDuration"] - duration) > .003 or measured["lastSampleDbfs"] > -65:
            raise ValueError(f"Duration/tail check failed: {destination} {measured}")
        files[extension] = {"path": "/" + str(destination.relative_to(ROOT / "public")), **probe(destination), **measured, "bytes": destination.stat().st_size, "sha256": sha256(destination)}
    source_bytes = source.read_bytes()
    print(f"{name:9s} {duration:.3f}s  " + " / ".join(f"{ext} {f['oversampledPeakDbfs']:.2f} dBFS" for ext, f in files.items()), flush=True)
    return name, {"sourceSound": recipe["label"], "role": recipe["role"], "files": files,
                  "source": {"path": recipe["path"], "url": source_url(recipe["path"]), "page": f"{REPOSITORY}/blob/{COMMIT}/" + quote(recipe["path"]), **probe(source), "sha256": sha256(source), "gitBlobSha1": hashlib.sha1(b"blob " + str(len(source_bytes)).encode() + b"\0" + source_bytes).hexdigest()},
                  "processing": {"sourceStart": recipe["start"], "duration": duration, "attackFade": .002, "decay": decay, "silentTail": guard, "dcRemovalHz": 35, "targetPeakDbfs": recipe["target"], "pitchChange": 0, "method": "One original game sample excerpt, 35 Hz DC removal, 2 ms edge attack, endpoint fade, and a final 20 ms silent codec guard. Original pitch and speed preserved; no layers, synthesis or added reverb. Resampling is solely format compatibility."},
                  "recommendedPlaybackGain": recipe["gain"]}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    paths = sorted({recipe["path"] for recipe in RECIPES.values()})
    with concurrent.futures.ThreadPoolExecutor(5) as pool:
        list(pool.map(fetch, paths))
    with tempfile.TemporaryDirectory(prefix="pokemon-genuine-audio-") as folder:
        working = Path(folder)
        with concurrent.futures.ThreadPoolExecutor(3) as pool:
            effects = dict(pool.map(lambda item: build(item, working), RECIPES.items()))
    originals = OUT / "originals"
    originals.mkdir(exist_ok=True)
    original_fire = originals / "flamethrower.wav"
    shutil.copyfile(CACHE / RECIPES["fire"]["path"], original_fire)
    provenance = {
        "description": "Compact authentic Pokémon GO-derived ball, move, UI and reward cues. Replaces generic sampled effects with actual game recordings; no Kenney samples or arbitrary synthesizer tones are used.",
        "repository": {"url": REPOSITORY, "commit": COMMIT, "readme": f"{REPOSITORY}/blob/{COMMIT}/README.md", "claim": "The PokeMiners repository states these are mined Pokémon GO audio assets and that it did not create or modify the sound files. It attributes copyright to The Pokémon Company and Niantic.", "verification": "Source downloads are pinned to an immutable commit. SHA-256 and Git blob SHA-1 recorded per file; selected downloads matched the repository's Git tree blob identifiers during preparation."},
        "rights": "Copyrighted game audio reused under the user's stated Pokémon license. PokeMiners is the datamining source, not a rights-holder delivery service; no open-license claim is made. No private ROM, login, DRM bypass or region-block bypass was used.",
        "reproduce": "python3 scripts/fetch-genuine-audio.py. Requires Python 3, curl, ffmpeg and ffprobe; optional ASSET_FFMPEG and ASSET_FFPROBE. Only selected small WAVs download, and each pinned source hash is checked before encoding.",
        "validation": "Each MP3 and OGG decodes with ffmpeg -xerror; PCM is finite, duration is within 3 ms of its cue, four-times-oversampled peaks are within 0.4 dB of target, and final samples are below -65 dBFS. Output hashes and metrics recorded per file.",
        "limitations": "Source clips are chiefly mono 11.025 kHz game audio, with some 22.05 kHz clips. Resampling does not create additional detail. Names and repository provenance identify the assets; no human listening review or direct comparison against a retail game capture is claimed. Card/pack roles are explicitly labeled artistic reuse of game UI or Master Ball sounds.",
        "originalFlamethrower": {"path": "/assets/audio-v4/originals/flamethrower.wav", **probe(original_fire), "sha256": sha256(original_fire), "bytes": original_fire.stat().st_size},
        "effects": effects,
    }
    (OUT / "provenance.json").write_text(json.dumps(provenance, indent=2) + "\n")
    manifest = {name: {"files": {ext: f["path"] for ext, f in entry["files"].items()}, "duration": entry["processing"]["duration"], "decay": entry["processing"]["decay"], "peakDbfs": entry["processing"]["targetPeakDbfs"], "gain": entry["recommendedPlaybackGain"], "sourceSound": entry["sourceSound"]} for name, entry in effects.items()}
    (OUT / "cues.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"Verified {len(effects)*2} cue files; original Flamethrower also retained. Total cue bytes: {sum(f['bytes'] for e in effects.values() for f in e['files'].values())}")


if __name__ == "__main__":
    main()
