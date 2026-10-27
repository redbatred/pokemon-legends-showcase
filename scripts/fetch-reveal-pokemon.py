#!/usr/bin/env python3
"""Fetch only the official artwork needed by current higher-rarity card catalogs.

Requires curl and Pillow. Run with the project's existing asset Python interpreter.
No image is resized, recolored, or otherwise altered.
"""

import concurrent.futures
import hashlib
import json
import pathlib
import re
import subprocess
import tempfile

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets"
OUT = ASSETS / "pokemon"
RARITY = re.compile(r"ultra|illustration|special|hyper|secret|shiny|radiant|double|holo rare v", re.I)
SUFFIX = re.compile(r"(?:[- ]?(?:VMAX|VSTAR|GX|ex|V))$")
GROUPS = {"Moltres & Zapdos & Articuno": ["Moltres", "Zapdos", "Articuno"]}
NON_POKEMON = {"Serena"}  # The only Trainer among the selected catalog rarities.


def download(url, path):
    subprocess.run(["curl", "-fsSL", "--retry", "2", "--connect-timeout", "15", "--max-time", "90", url, "-o", str(path)], check=True)


def remote_json(url):
    with tempfile.NamedTemporaryFile(suffix=".json") as temporary:
        download(url, temporary.name)
        return json.loads(pathlib.Path(temporary.name).read_text())


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    selected = {}
    skipped = []
    catalogs = [ASSETS / "catalog.json", *sorted((ASSETS / "sets").glob("*/catalog.json"))]
    for catalog in catalogs:
        for card in json.loads(catalog.read_text()):
            if not RARITY.search(card["rarity"]):
                continue
            base = SUFFIX.sub("", re.sub(r"^Radiant ", "", card["name"])).strip()
            if base in NON_POKEMON:
                skipped.append(card["id"])
                continue
            for name in GROUPS.get(base, [base]):
                selected.setdefault(name, []).append(card["id"])

    species = remote_json("https://pokeapi.co/api/v2/pokemon-species?limit=1025")
    dex = {row["name"]: int(row["url"].rstrip("/").split("/")[-1]) for row in species["results"]}
    commit = remote_json("https://api.github.com/repos/PokeAPI/sprites/commits/master")["sha"]

    def fetch(name):
        slug = name.lower().replace(" ", "-")
        if name == "Paldean Clodsire":
            slug = "clodsire"
        dex_id = dex[slug]
        source = f"https://raw.githubusercontent.com/PokeAPI/sprites/{commit}/sprites/pokemon/other/official-artwork/{dex_id}.png"
        destination = OUT / f"{slug}.png"
        with tempfile.NamedTemporaryFile(suffix=".png", dir=OUT, delete=False) as temporary:
            temporary_path = pathlib.Path(temporary.name)
        try:
            download(source, temporary_path)
            with Image.open(temporary_path) as picture:
                picture.load()
                if picture.format != "PNG" or "A" not in picture.getbands():
                    raise ValueError(f"{name}: expected transparent PNG")
                if picture.getchannel("A").getextrema() != (0, 255):
                    raise ValueError(f"{name}: missing transparent or opaque pixels")
                dimensions = list(picture.size)
            temporary_path.replace(destination)
        finally:
            temporary_path.unlink(missing_ok=True)
        return name, {"dexId": dex_id, "image": f"/assets/pokemon/{slug}.png"}, {
            "dexId": dex_id,
            "file": f"/assets/pokemon/{slug}.png",
            "source": source,
            "dimensions": dimensions,
            "sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
            "cards": sorted(set(selected[name])),
        }

    manifest = {}
    sources = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for name, entry, provenance in pool.map(fetch, sorted(selected)):
            manifest[name] = entry
            sources[name] = provenance
            print(f"{name}: {provenance['dimensions'][0]} × {provenance['dimensions'][1]}", flush=True)

    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (OUT / "provenance.json").write_text(json.dumps({
        "provider": "PokeAPI/sprites",
        "repository": "https://github.com/PokeAPI/sprites",
        "revision": commit,
        "selection": "Double, Illustration, Ultra, Special, Hyper, Secret, Shiny, Radiant, and Holo Rare V/VMAX/VSTAR catalog cards; Trainers and Energy excluded.",
        "processing": "Original regular official-artwork PNG bytes, unchanged. No fan recolors, shiny-directory art, synthetic art, resizing, or upscaling. Base species art does not reproduce card-specific forms or costumes.",
        "groups": GROUPS,
        "excludedTrainerCards": sorted(set(skipped)),
        "sources": sources,
    }, indent=2) + "\n")
    print(f"Wrote {len(manifest)} species; excluded Trainer cards: {sorted(set(skipped))}")


if __name__ == "__main__":
    main()
