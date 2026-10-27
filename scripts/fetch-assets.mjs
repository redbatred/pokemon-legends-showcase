/** Refresh authentic source assets. Requires Node 20+ and Python with Pillow.
 * Usage: ASSET_PYTHON=/path/to/python node scripts/fetch-assets.mjs
 * Does not synthesize, retouch, or reconstruct artwork. */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dest = resolve(root, 'public/assets');
const originals = resolve(root, 'source-assets/originals');
const press = 'https://press.pokemon.com';
const sources = [];
await mkdir(resolve(dest, 'cards'), { recursive: true });
await mkdir(originals, { recursive: true });
async function get(url, json = false) {
  const response = await fetch(url, { headers: {'User-Agent': 'ObsidianFlamesPrototype/1.0', 'X-Requested-With': 'XMLHttpRequest'} });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  if (json) return response.json();
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 200).toString().toLowerCase().includes('<html')) throw new Error(`HTML returned instead of image: ${url}`);
  return bytes;
}
async function saveOriginal(name, url, provider, runtimeFile) {
  const bytes = await get(url);
  await mkdir(dirname(resolve(originals, name)), { recursive: true });
  await writeFile(resolve(originals, name), bytes);
  sources.push({ file: runtimeFile, original: `source-assets/originals/${name}`, url, provider });
  return bytes;
}
// Refresh all ten native-resolution catalogs before shared art. Never replace them with lower-resolution thumbnails.
const python = process.env.ASSET_PYTHON || 'python3';
for (const script of ['fetch-all-packs.py', 'fetch-pack-wrappers.py']) {
  const result = spawnSync(python, [resolve(root, 'scripts', script)], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Asset refresh failed: ${script}`);
}
// Original packaging is identified by the official May 25, 2023 press release.
// Its original-download redirect was unavailable; the archive preserves that same source PNG.
await saveOriginal('pack.png', 'https://archives.bulbagarden.net/media/upload/5/52/SV3_Booster_Charizard.png', 'Bulbagarden Archives, official Pokémon booster packaging', '/assets/pack.webp');
await saveOriginal('set-logo.png', 'https://assets.tcgdex.net/en/sv/sv03/logo.png', 'TCGdex, official Pokémon expansion logo', '/assets/set-logo.webp');
await saveOriginal('energy.png', 'https://images.pokemontcg.io/sve/2_hires.png', 'Pokémon TCG API', '/assets/cards/energy.webp');
await saveOriginal('pokemon-masthead.png', `${press}/Content/Themes/Pokemon/img/pokemon-masthead.png`, 'The Pokémon Company International official press site', '/assets/pokemon-logo.png');
// This stable Bulbagarden image is an unaltered English card-back scan.
await saveOriginal('card-back.jpg', 'https://archives.bulbagarden.net/media/upload/1/17/Cardback.jpg', 'Bulbagarden Archives', '/assets/card-back.webp');
await saveOriginal('pokemon/0006Charizard.png', 'https://archives.bulbagarden.net/media/upload/3/38/0006Charizard.png', 'Bulbagarden Archives; official Ken Sugimori artwork', '/assets/pokemon/charizard.webp');
await saveOriginal('pokemon/0004Charmander.png', 'https://archives.bulbagarden.net/media/upload/2/27/0004Charmander.png', 'Bulbagarden Archives; official Ken Sugimori artwork', '/assets/pokemon/charmander.webp');
const convert = spawnSync(python, ['-c', `
from PIL import Image
from pathlib import Path
p=Path(${JSON.stringify(dest)})
o=Path(${JSON.stringify(originals)})
for name in ['pack','set-logo']:
 im=Image.open(o/f'{name}.png'); im.save(p/f'{name}.png'); im.save(p/f'{name}.webp',quality=93,method=6)
Image.open(o/'energy.png').save(p/'cards'/'energy.webp',quality=93,method=6)
Image.open(o/'card-back.jpg').save(p/'card-back.webp',quality=93,method=6)
im=Image.open(o/'pokemon-masthead.png')
im.crop((0,0,240,88)).save(p/'pokemon-logo.png')
(p/'pokemon').mkdir(exist_ok=True)
for name,filename in [('charizard','0006Charizard.png'),('charmander','0004Charmander.png')]:
 Image.open(o/'pokemon'/filename).save(p/'pokemon'/f'{name}.webp',lossless=True,exact=True,method=6)
`], {encoding:'utf8'});
if (convert.status !== 0) throw new Error(`Image conversion failed; install Pillow in ASSET_PYTHON. ${convert.stderr}`);
const expanded = JSON.parse(await readFile(resolve(dest, 'expanded-asset-manifest.json'), 'utf8'));
const wrappers = JSON.parse(await readFile(resolve(dest, 'wrapper-manifest.json'), 'utf8'));
await writeFile(resolve(dest, 'asset-manifest.json'), JSON.stringify({downloadedAt:new Date().toISOString(), sources: [...expanded, ...wrappers, ...sources]}, null, 2) + '\n');
console.log('All source assets downloaded. Inspect the Pokémon logo crop if its upstream masthead changes.');
