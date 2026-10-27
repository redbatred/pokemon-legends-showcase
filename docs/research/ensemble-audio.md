# Ensemble Pokémon attack audio

Research and encoding: 2026-10-27. Scope: all 50 big-win artwork species, including the 33 native models available at the start of this audit. No application source, earlier assets, Git state or deployment was changed by this asset task.

## Deliverables

- `public/assets/audio-v6/cues.json`: 43 named move cues in the existing `files.mp3`, `files.ogg`, `gain`, `duration`, `timing.startOffset` and `timing.preRoll` schema. This includes references to 16 correct v4/v5 cues and 27 new recordings. It can be merged after v4/v5; reused files are not copied or re-encoded.
- `public/assets/audio-v6/species-cues.json`: exact routing for all 50 species. Do not continue routing the missing species through a type-wide fallback after loading this mapping.
- `public/assets/audio-v6/provenance.json`: original source URLs, pinned source SHA-256 and Git blob SHA-1, all output SHA-256 values, waveform landmarks, processing notes, source limits and per-species learnset evidence.
- `scripts/fetch-ensemble-audio-v6.py`: reproducible downloader/encoder; writes only `public/assets/audio-v6`. Requires Python 3, curl, ffmpeg and ffprobe. Re-run with `python3 scripts/fetch-ensemble-audio-v6.py`.

All source recordings are the exact named move files in the [PokeMiners Pokémon GO asset collection](https://github.com/PokeMiners/pogo_assets/tree/c2a686eb08ace6e890d8fe3d2134c76988db87b5/Sounds/Pokemon%20Moves), pinned to commit `c2a686eb08ace6e890d8fe3d2134c76988db87b5`. The repository [attributes the original assets](https://github.com/PokeMiners/pogo_assets/blob/c2a686eb08ace6e890d8fe3d2134c76988db87b5/README.md) to The Pokémon Company and Niantic and says it did not create or modify them. These are game recordings, not synthesized Pokémon voices or unrelated sound effects assigned Pokémon move names. Use is based on the user's stated Pokémon license; the public mirror is not a rights-holder delivery service.

## Integration and mix

Merge v6 into both cue lookup **and** `pokemonSoundTiming`, then route species through `species-cues.json`. A key such as `electric` is a retained API alias for the actual Thunderbolt recording; it is not permission to assign that recording to every electric species. Raichu now has Thunder Punch, Zapdos Thunder, Dracozolt/Rotom Discharge, and Raikou Wild Charge.

Keep the existing runtime Pokémon multiplier of **0.5 exactly once**. New manifest gains are 0.26–0.28, giving 0.13–0.14 effective gain before existing cry ducking and scene envelopes. Preserve each reused cue's gain. Do not raise volume to compensate for a longer recording. One owned voice plays for the whole move; particle, ring, blade and lightning-branch updates must not retrigger it. A scene ending early should fade its voice for about 180 ms. Do not loop a short move to fill a visual hold.

The source's own onset supplies its charge sound. Do not add the current generic Solar Beam preparation to every Pokémon. The named Solar Beam source is not evidence of a universal charging effect.

`timing.startOffset` is a seek into the **encoded file**. Start audio at `releaseTime - preRoll`, seek to `startOffset`, and release the visual after `preRoll` seconds of playback. `releaseAt = startOffset + preRoll` is the file-local release landmark. `playbackDuration` is the available recording after that seek. `processing.sourceStartOffset` separately identifies lead physically removed while encoding. All landmarks are editorial timing recommendations based on the waveform, not official game animation events.

## Complete species routing

Durations are available playback after the recommended seek, including the natural tail. The old v4 compact excerpts are intentionally reused without further changes. An attack can stop earlier with an owned fade, but the same sample must not restart to fill the scene.

| Pokémon | Cue key | Actual move recording | Available playback | Pre-roll | Source pack |
|---|---|---|---:|---:|---|
| Aerodactyl | `rockslide` | Rock Slide | 3.712 s | 0.08 s | audio-v6 |
| Alakazam | `psychic` | Psychic | 1.100 s | 0.00 s | audio-v4 |
| Arceus | `hyperbeam` | Hyper Beam | 1.000 s | 0.00 s | audio-v4 |
| Articuno | `ice` | Ice Beam | 1.100 s | 0.00 s | audio-v4 |
| Blastoise | `hydropump` | Hydro Pump | 4.136 s | 0.24 s | audio-v5 |
| Breloom | `seedbomb` | Seed Bomb | 2.121 s | 0.02 s | audio-v6 |
| Charizard | `fire` | Flamethrower | 1.100 s | 0.00 s | audio-v4 |
| Cinderace | `blazekick` | Blaze Kick | 2.203 s | 0.45 s | audio-v6 |
| Cleffa | `disarmingvoice` | Disarming Voice | 2.806 s | 0.04 s | audio-v6 |
| Paldean Clodsire | `ground` | Earthquake | 1.100 s | 0.00 s | audio-v4 |
| Dracozolt | `discharge` | Discharge | 2.922 s | 0.20 s | audio-v6 |
| Dragonite | `hyperbeam` | Hyper Beam | 1.000 s | 0.00 s | audio-v4 |
| Duraludon | `flashcannon` | Flash Cannon | 3.410 s | 0.50 s | audio-v6 |
| Eevee | `swift` | Swift | 0.950 s | 0.00 s | audio-v4 |
| Espeon | `psybeam` | Psybeam | 3.468 s | 0.40 s | audio-v6 |
| Forretress | `gyroball` | Gyro Ball | 3.317 s | 0.96 s | audio-v6 |
| Gardevoir | `fairy` | Dazzling Gleam | 1.100 s | 0.00 s | audio-v4 |
| Genesect | `technoblast` | Techno Blast | 4.432 s | 0.12 s | audio-v6 |
| Gengar | `shadowball` | Shadow Ball | 0.950 s | 0.00 s | audio-v4 |
| Giratina | `shadowforce` | Shadow Force | 2.993 s | 0.10 s | audio-v6 |
| Glaceon | `icywind` | Icy Wind | 4.668 s | 0.10 s | audio-v6 |
| Gloom | `petals` | Petal Blizzard | 0.950 s | 0.00 s | audio-v4 |
| Greninja | `watershuriken` | Water Shuriken | 1.436 s | 0.02 s | audio-v6 |
| Gyarados | `hydropump` | Hydro Pump | 4.136 s | 0.24 s | audio-v5 |
| Kyogre | `originpulse` | Origin Pulse | 2.420 s | 0.12 s | audio-v6 |
| Leafeon | `leafblade` | Leaf Blade | 2.446 s | 0.08 s | audio-v6 |
| Lugia | `aeroblast` | Aeroblast | 0.950 s | 0.00 s | audio-v4 |
| Mew | `psychic` | Psychic | 1.100 s | 0.00 s | audio-v4 |
| Mewtwo | `psystrike` | Psystrike | 1.646 s | 0.04 s | audio-v5 |
| Moltres | `firespin` | Fire Spin | 1.611 s | 0.02 s | audio-v6 |
| Ninetales | `fireblast` | Fire Blast | 4.091 s | 0.08 s | audio-v6 |
| Oddish | `megadrain` | Mega Drain | 2.731 s | 0.06 s | audio-v6 |
| Pidgeot | `hurricane` | Hurricane | 3.712 s | 0.16 s | audio-v6 |
| Pidgey | `wind` | Gust | 0.950 s | 0.00 s | audio-v4 |
| Pikachu | `electric` | Thunderbolt | 0.950 s | 0.00 s | audio-v4 |
| Pinsir | `xscissor` | X-Scissor | 1.820 s | 0.08 s | audio-v6 |
| Raichu | `thunderpunch` | Thunder Punch | 2.354 s | 0.12 s | audio-v6 |
| Raikou | `wildcharge` | Wild Charge | 2.546 s | 0.04 s | audio-v6 |
| Rayquaza | `dragonascent` | Dragon Ascent | 2.751 s | 0.62 s | audio-v6 |
| Rotom | `discharge` | Discharge | 2.922 s | 0.20 s | audio-v6 |
| Scizor | `bulletpunch` | Bullet Punch | 1.663 s | 0.08 s | audio-v6 |
| Starmie | `powergem` | Power Gem | 3.225 s | 0.08 s | audio-v6 |
| Suicune | `aurorabeam` | Aurora Beam | 2.621 s | 0.12 s | audio-v6 |
| Sylveon | `moonblast` | Moonblast | 3.267 s | 0.14 s | audio-v6 |
| Trevenant | `seedbomb` | Seed Bomb | 2.121 s | 0.02 s | audio-v6 |
| Tyranitar | `ground` | Earthquake | 1.100 s | 0.00 s | audio-v4 |
| Umbreon | `dark` | Dark Pulse | 1.000 s | 0.00 s | audio-v4 |
| Vaporeon | `waterpulse` | Water Pulse | 3.700 s | 0.08 s | audio-v5 |
| Venusaur | `petals` | Petal Blizzard | 0.950 s | 0.00 s | audio-v4 |
| Zapdos | `thunder` | Thunder | 2.490 s | 0.12 s | audio-v6 |

Every mapping was checked against the source data in [Pokémon Showdown's pinned learnsets](https://github.com/smogon/pokemon-showdown/blob/2cf5a6889bf422803724e4d077078e0c7c722664/data/learnsets.ts). All 50 selected moves have explicit entries. The manifest preserves the generation/method evidence. This is community learnset data; it establishes a legitimate species/move choice across the main series, not a current Pokémon GO PvP moveset or the identity of the supplied generic model attack clip.

Shared cues are deliberate: Alakazam/Mew use Psychic, Arceus/Dragonite Hyper Beam, Blastoise/Gyarados Hydro Pump, Breloom/Trevenant Seed Bomb, Clodsire/Tyranitar Earthquake, Dracozolt/Rotom Discharge, and Gloom/Venusaur Petal Blizzard. Judgment and Pyro Ball are absent from this pinned archive; Arceus uses its learnable Hyper Beam and Cinderace its learnable Blaze Kick. No replacement is falsely labelled as those unavailable signature moves.

## Waveform and timing decisions

The new files retain their original speed, pitch, mono channel and natural envelope. All new sources are mono 11.025 kHz; resampling for codecs does not add source detail. Only Icy Wind's first 60 ms and Shadow Force's first 40 ms of near-silence were removed. Each receives 35 Hz DC removal, a 2 ms edge fade, an 80 ms fade at the very end, and a 20 ms silent codec guard. New four-times-oversampled peaks target −6.2 dBFS and are required to stay at or below −6 dBFS.

The analysis computes 20 ms RMS windows, detects activity above 1.5% of the strongest RMS window (−36.48 dB relative), and stores a 100 ms RMS envelope. Energy thresholds describe audibility and timing, not semantic move phases. Each shortened playback below seeks into the retained original source; none removes or manufactures the attack sound.

| Cue | Encoded duration | Default seek | Pre-roll | Observed structure |
|---|---:|---:|---:|---|
| `watershuriken` | 1.436 s | 0.00 s | 0.02 s | Exact Water Shuriken fast-move recording. Immediate watery throw with a second internal accent near 0.65 s; one voice per thrown shuriken, not per blade. |
| `thunderpunch` | 2.354 s | 0.00 s | 0.12 s | The electrical punch rises immediately, with the strongest impact around 0.8–1.0 s and a natural short tail. |
| `thunder` | 4.530 s | 2.04 s | 0.12 s | Compact default selects the second original thunder phrase after the 2.0 s trough, preserving its growing strike and tail. |
| `bulletpunch` | 1.663 s | 0.00 s | 0.08 s | The fast metallic attack has a broad impact over 0.1–0.9 s, followed by its original short decay. |
| `flashcannon` | 3.410 s | 0.00 s | 0.50 s | The first 0.5 s is the original low-level charge. The brighter cannon release begins near 0.5 s and continues through about 2.4 s. |
| `gyroball` | 3.317 s | 0.00 s | 0.96 s | Retain the roughly one-second original spin-up before the stronger rolling passage at 1.0–3.0 s. |
| `dragonascent` | 6.051 s | 3.30 s | 0.62 s | Compact default selects the final rising attack phrase after the 3.3 s trough, with payoff near 4.0 s. Full-sequence alternative starts at zero; no claim that a waveform phrase is official engine metadata. |
| `originpulse` | 5.900 s | 3.48 s | 0.12 s | Compact default selects the second original wave phrase after the trough near 3.5 s. The whole source remains available at offset zero. |
| `moonblast` | 4.287 s | 1.02 s | 0.14 s | Compact default seeks past the low-level opening phrase to the strong rising moonblast sequence; its peak follows near 2.4 s in the file. |
| `powergem` | 4.165 s | 0.94 s | 0.08 s | Compact default selects the second brighter gem phrase after the low-energy gap around 0.9 s, preserving its full decay. |
| `fireblast` | 4.931 s | 0.84 s | 0.08 s | The source has a preparation phrase before the low-energy gap at 0.8 s. Compact playback begins at this gap and retains both subsequent blast phrases. |
| `wildcharge` | 2.806 s | 0.26 s | 0.04 s | Compact default seeks to the first clear electrical surge after the short 0.2 s trough; keep the second surge around 1.6–2.2 s. |
| `psybeam` | 3.468 s | 0.00 s | 0.40 s | Use the original 0.4 s onset as preparation, then release the beam with the stronger passage. Retain the later 1.8 s accent. |

The remaining new cues start at zero and use a short 20–200 ms pre-roll, except Blaze Kick's 450 ms original preparation. Icy Wind and Shadow Force are the only physically trimmed files. All per-cue notes and full envelopes are in provenance. Existing Psystrike keeps v5's 2.78 s seek / 40 ms pre-roll; Hydro Pump and Water Pulse retain their previous complete recordings and timings.

## Verification and limits

The encoder completed successfully for **54 new encoded files**, with ffmpeg `-xerror` finite-sample decoding. Their four-times-oversampled peaks range from **−6.418 to −6.080 dBFS**; every final sample is below **−122.8 dBFS**. Decoded durations are within 3 ms of expectation. The v6 folder is **3,010,605 bytes**, below the 4 MB budget.

An independent manifest check confirmed exact coverage of all 50 artwork species, 43 resolving cue keys, correct species lists, valid start/release/pre-roll tuples, and matching SHA-256 values for all **86 referenced MP3/OGG files** (54 new plus 32 reused). Existing v4/v5 media was not modified. Automated waveform, decode, timing, hash, size and headroom checks are complete; no human audition or retail gameplay comparison is claimed. Final visual/audio synchronization should be checked in the actual reveal sequence, particularly compact later-phrase seeks and attacks with multiple internal accents.
