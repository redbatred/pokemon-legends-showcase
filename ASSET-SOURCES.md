# Authentic Pokémon asset library

Downloaded October 27, 2026 for the user-authorized licensed frontend prototype. The library contains **10 authentic English booster wrappers and 250 authentic card fronts**, 25 cards per pack. All 30 featured card references from `/Users/redjonmezani/Downloads/Pokemon_Legends.pdf` are included with the exact collector number. The PDF's separate, earlier full 25-card lists are not supplied; the remaining entries are curated demonstration selections from the appropriate expansion.

No artwork was generated, redrawn, recolored, reconstructed, or artificially upscaled. Fronts are converted from the original native PNGs to quality-95 WebP without resizing. The original files remain in `source-assets/originals/`.

## Runtime manifests

- `public/assets/packs.json`: ten entries with `id`, `name`, `price` in USD cents, `packImage`, `catalogUrl`, `accent`, and `rewardCount`.
- `public/assets/catalog.json`: Obsidian Flames, preserving the original application paths.
- `public/assets/sets/<slug>/catalog.json`: each of the other nine catalogs. Every entry has `{id, number, name, rarity, image}`; gallery prefixes and source leading zeroes are preserved.
- `public/assets/expanded-asset-manifest.json`: every card's exact source URL, native dimensions, local original, and runtime file.
- `public/assets/wrapper-manifest.json`: exact wrapper sources, native/served dimensions, and any crop.
- `public/assets/asset-manifest.json`: combined current card, wrapper, and shared-art provenance.

The displayed pack prices are the PDF's **illustrative game prices**, not external retail prices or card market valuations. Modern packs carry 10 reward cards; Base Set carries 9. Basic Energy images are supporting non-reward slots and are excluded from every 25-card reward catalog.

| Pack slug | Game price | Featured references | Native front resolution |
| --- | ---: | --- | --- |
| obsidian-flames | $10 | Charizard ex 223; Ninetales 199; Pidgeot ex 225 | 733 × 1024 |
| pokemon-151 | $25 | Charizard ex 199; Blastoise ex 200; Venusaur ex 198 | 733 × 1024 |
| crown-zenith | $50 | Giratina VSTAR GG69; Mewtwo VSTAR GG44; Arceus VSTAR GG70 | 734 × 1024 |
| paldean-fates | $100 | Mew ex 232; Charizard ex 234; Gardevoir ex 233 | 733 × 1024 |
| lost-origin | $150 | Giratina V 186; Aerodactyl V 180; Pikachu VMAX TG17 | 734 × 1024 |
| fusion-strike | $250 | Gengar VMAX 271; Espeon VMAX 270; Mew VMAX 269 | 734 × 1024 |
| silver-tempest | $350 | Lugia V 186; Rayquaza VMAX TG20; Serena 193 | 734 × 1024 |
| evolving-skies | $500 | Umbreon VMAX 215; Rayquaza VMAX 218; Leafeon VMAX 205 | 734 × 1024 |
| hidden-fates | $750 | Charizard-GX SV49; Umbreon-GX SV69; Mewtwo-GX SV59 | 734 × 1024 |
| base-set | $1,000 | Charizard 4; Blastoise 2; Venusaur 15 | 600 × 825 |

Base Set's source `hires` scans are themselves 600 × 825. They are retained at that native size, not enlarged to claim a higher resolution. The modern Obsidian Flames fronts were upgraded from the first implementation's TCGdex 600 × 825 scans to the native 733 × 1024 PNG source.

## Card providers

Card names, collector numbers, and rarity metadata come from [TCGdex](https://api.tcgdex.net/v2/en/sets). Card artwork comes from the [Pokémon TCG API image service](https://images.pokemontcg.io/), which is also the source named by the PDF. Its URL format is `https://images.pokemontcg.io/<set>/<number>_hires.png`.

The exact provider set mappings are:

| Pack | TCGdex | Pokémon TCG API images |
| --- | --- | --- |
| Obsidian Flames | sv03 | sv3 |
| Pokémon 151 | sv03.5 | sv3pt5 |
| Crown Zenith | swsh12.5; swsh12.5gg | swsh12pt5; swsh12pt5gg |
| Paldean Fates | sv04.5 | sv4pt5 |
| Lost Origin | swsh11; swsh11tg | swsh11; swsh11tg |
| Fusion Strike | swsh8 | swsh8 |
| Silver Tempest | swsh12; swsh12tg | swsh12; swsh12tg |
| Evolving Skies | swsh7 | swsh7 |
| Hidden Fates | sm115; sma | sm115; sma |
| Base Set | base1 | base1 |

Gallery and Shiny Vault cards remain associated with their parent packs, and their original `GG`, `TG`, and `SV` collector numbers are preserved. No price data from the metadata APIs is bundled.

## Booster wrappers

Obsidian Flames retains `/assets/pack.webp`; the other packs use `/assets/sets/<slug>/pack.webp`. All are authentic English wrappers. Native transparency is preserved where supplied. JPEG wrappers retain their original artwork/background; no synthetic cutout was made.

| Wrapper | Served dimensions | Original source |
| --- | --- | --- |
| Obsidian Flames, Charizard | 780 × 1429 | [Bulbagarden original PNG](https://archives.bulbagarden.net/media/upload/5/52/SV3_Booster_Charizard.png) |
| Pokémon 151, Mew | 780 × 1429 | [Bulbagarden original PNG](https://archives.bulbagarden.net/media/upload/2/24/151_Booster.png) |
| Crown Zenith, Zacian & Zamazenta | 782 × 1431 | [Bulbagarden original JPEG](https://archives.bulbagarden.net/media/upload/d/dd/Crown_Zenith_Booster.jpg) |
| Paldean Fates, Ceruledge | 780 × 1429 | [Bulbagarden original PNG](https://archives.bulbagarden.net/media/upload/0/08/Paldean_Fates_Booster_Ceruledge.png) |
| Lost Origin, Enamorus | 780 × 1429 | [Bulbagarden original JPEG](https://archives.bulbagarden.net/media/upload/7/78/SWSH11_Booster_Enamorus.jpg) |
| Fusion Strike, Mew | 780 × 1429 | [Bulbagarden original JPEG](https://archives.bulbagarden.net/media/upload/d/d5/SWSH8_Booster_Mew.jpg) |
| Silver Tempest, Lugia | 780 × 1429 | [Bulbagarden original JPEG](https://archives.bulbagarden.net/media/upload/2/2b/SWSH12_Booster_Lugia.jpg) |
| Evolving Skies, Rayquaza | 780 × 1429 | [Bulbagarden original JPEG](https://archives.bulbagarden.net/media/upload/a/a5/SWSH7_Booster_Rayquaza.jpg) |
| Hidden Fates, Charizard | 532 × 952 | [Amazingtoys original product JPEG](https://amazingtoys.cstatic.io/media/36/79/13/1678199968/pok-mon-hidden-fates-booster-1.jpg), plain rectangular crop from native 560 × 1000 |
| Base Set 1999, Charizard | 882 × 1779 | [TCG Tower original product photo](https://tcgtower.com/cdn/shop/files/base-set-long-crimp-bp.png?v=1714522971&width=2048), plain rectangular crop from its 2048 × 2048 canvas; no retouching |

The [official May 25, 2023 Pokémon press release](https://press.pokemon.com/en-AU/New-Pokemon-Trading-Card-Game-Scarlet-VioletObsidian-Flames-Debuts-Typ) was researched first for the original Obsidian Flames pack. It identifies the 780 × 1429 Charizard wrapper. Its original-download redirect returned HTTP 404, so the same documented packaging was obtained from [Bulbagarden](https://bulbapedia.bulbagarden.net/wiki/File:SV3_Booster_Charizard.png). No higher native wrapper source was found; it was not artificially enlarged.

## Shared branding and supporting cards

| Runtime file | Dimensions | Source and processing |
| --- | --- | --- |
| `public/assets/set-logo.webp` and `set-logo.png` | 451 × 167 | [TCGdex official expansion-logo artwork](https://assets.tcgdex.net/en/sv/sv03/logo.png), format conversion only |
| `public/assets/pokemon-logo.png` | 240 × 88 | [Official Pokémon press-site masthead](https://press.pokemon.com/Content/Themes/Pokemon/img/pokemon-masthead.png), plain crop `(0,0,240,88)` from original 457 × 88 |
| `public/assets/card-back.webp` | 745 × 1040 | [Bulbagarden English card back](https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg), format conversion only; [file history](https://bulbapedia.bulbagarden.net/wiki/File:Cardback.jpg) attributes this image to the Alternative Play Handbook |
| `public/assets/cards/energy.webp` | 733 × 1024 | [Scarlet & Violet basic Fire Energy #2](https://images.pokemontcg.io/sve/2_hires.png), format conversion only; excluded from rewards |

## Refresh and validation

Requires Node 20+, `curl`, and Python with Pillow:

```sh
ASSET_PYTHON=/path/to/python node scripts/fetch-assets.mjs
```

The entry point runs `scripts/fetch-all-packs.py` and `scripts/fetch-pack-wrappers.py`, then refreshes shared assets. The Python scripts can also be run separately. Downloads are decoded and verified as actual images; card conversion never resizes. Every catalog has 25 unique cards, every runtime image resolves locally, and all 30 PDF reference cards and all ten wrappers were visually inspected together.

Archival originals are stored in `source-assets/originals/`, outside the public deployment directory, and `source-assets/` is gitignored. Provenance `original` fields use repository-relative filesystem paths. Runtime references remain under `/assets/`, pointing to optimized WebPs or the shared logo PNG.

Pokémon artwork remains the property of its respective rights holders. Its inclusion follows the user's stated license authorization.


## Official character artwork for the illustrated game stage

- `public/assets/pokemon/charizard.webp`: **2356 × 2356**, transparent RGBA. [Original image](https://archives.bulbagarden.net/media/upload/3/38/0006Charizard.png); [source attribution and file history](https://archives.bulbagarden.net/wiki/File:0006Charizard.png).
- `public/assets/pokemon/charmander.webp`: **932 × 932**, transparent RGBA. [Original image](https://archives.bulbagarden.net/media/upload/2/27/0004Charmander.png); [source attribution and file history](https://archives.bulbagarden.net/wiki/File:0004Charmander.png).

Both are official Ken Sugimori artwork released for Pokémon FireRed and LeafGreen, mirrored by Bulbagarden Archives. PNG originals are retained in `source-assets/originals/pokemon/`. Runtime WebPs use lossless encoding; exact decoded RGBA pixel equality with the originals was verified. No resizing, cropping, recoloring, background generation, or other alterations were performed.

## Canvas interface font

Nunito variable font, Google Fonts: https://github.com/google/fonts/tree/main/ofl/nunito . Bundled `public/assets/fonts/Nunito.ttf` and `OFL.txt` (SIL Open Font License). Used for canvas UI and pre-rendered numeric glyphs.

## Official Pokémon artwork for high-value card reveals

`public/assets/pokemon/manifest.json` maps 50 card base Pokémon names to `{ "dexId": number, "image": "/assets/pokemon/<species>.png" }`. These cover all 89 Pokémon cards in the current catalogs with Double, Illustration, Ultra, Special, Hyper, Secret, Shiny, Radiant, or Holo Rare V/VMAX/VSTAR rarity. Trainer Serena is excluded; ordinary Rare/Holo Rare cards do not expand this selection.

The original transparent **475 × 475 PNGs** come from the [PokeAPI/sprites official-artwork directory](https://github.com/PokeAPI/sprites/tree/d8c2fb78563e28ad7b3abe938cf6e79998d04e90/sprites/pokemon/other/official-artwork), pinned to commit `d8c2fb78563e28ad7b3abe938cf6e79998d04e90`. Only the regular official-artwork directory is used. The separate shiny directory, which includes fan recolors, is excluded. All PNG bytes are served unchanged, without resizing, cropping, recoloring, or generation. The existing higher-resolution `charizard.webp` and `charmander.webp` stage assets remain separate and unchanged.

`public/assets/pokemon/provenance.json` records each source URL, Pokédex ID, dimensions, SHA-256, and covered card IDs. Names and IDs were resolved against the [PokeAPI species API](https://pokeapi.co/api/v2/pokemon-species?limit=1025). The `Paldean Clodsire` catalog name maps to Clodsire #980 at `/assets/pokemon/clodsire.png`. The Moltres & Zapdos & Articuno GX card maps to three separate species entries, with group membership recorded in provenance; no combined illustration was fabricated. Base-species artwork does not reproduce the cards' individual shiny, Tera, Dynamax, or other forms.

Refresh only these bounded assets with `ASSET_PYTHON`'s interpreter, for example `/path/to/python scripts/fetch-reveal-pokemon.py` (requires existing Pillow and `curl`). Every selected image was decoded, checked for native dimensions and alpha transparency, and visually inspected in a contact sheet. Coverage is complete; the 50 PNG files total 6,762,592 bytes.

## Spine special reveals

- Runtime: `@esotericsoftware/spine-pixi-v8` 4.2.120, from the official Esoteric Software package. Runtime license is shipped at `public/assets/spine/LICENSE.txt`. User confirmed the required Spine Editor license in the project chat.
- Poké Ball: original canvas-authored cel-shaded atlas and Spine bone animation data in `src/game/SpineReveal.ts`.
- Pokémon: official artwork listed in `public/assets/pokemon/provenance.json`, displayed through original Spine mesh/breathing animation data. These are artwork rigs, not studio-authored articulated character rigs.
- Big-win eligibility is at least the selected pack's demo price and a supported Pokémon artwork. This presentation threshold does not change card values or odds.
