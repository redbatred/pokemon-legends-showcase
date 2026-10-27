import { Assets, type Texture } from 'pixi.js';
import { AtlasAttachmentLoader, SkeletonJson, Spine, SpineTexture, TextureAtlas, type SkeletonData } from '@esotericsoftware/spine-pixi-v8';
import { buildPokemonRigJson, POKEMON_RIG_SIZE } from './pokemonRigData';

const skeletons = new Map<string, Promise<SkeletonData>>();

async function loadSkeleton(path: string): Promise<SkeletonData> {
  const texture = await Assets.load<Texture>(path);
  const atlas = new TextureAtlas(`pokemon.png\nsize: ${texture.width},${texture.height}\nfilter: Linear,Linear\npma: false\nartwork\n  bounds: 0,0,${texture.width},${texture.height}\n`);
  atlas.pages[0].setTexture(SpineTexture.from(texture.source));
  const aspect = texture.width / texture.height;
  const width = aspect >= 1 ? POKEMON_RIG_SIZE : POKEMON_RIG_SIZE * aspect;
  const height = aspect >= 1 ? POKEMON_RIG_SIZE / aspect : POKEMON_RIG_SIZE;
  return new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(buildPokemonRigJson(path, width, height));
}

/** An articulated 2D artwork rig. Advance with rig.update(dtSeconds).
 * Starts `emerge`, then loops `idle`; `roar` is also available through rig.state.
 * Art is a single view: joints bend its visible pixels, never invent hidden surfaces.
 * Charizard has hand-placed anatomical masks. Other species use restrained family
 * profiles or a conservative head/torso fallback. This cannot open a painted-shut
 * mouth, turn the character around, or change the artwork's baked-in occlusion.
 */
export async function createPokemonRig(path: string): Promise<Spine> {
  let pending = skeletons.get(path);
  if (!pending) {
    pending = loadSkeleton(path).catch(error => { skeletons.delete(path); throw error; });
    skeletons.set(path, pending);
  }
  const rig = new Spine({ skeletonData: await pending, autoUpdate: false });
  rig.state.data.defaultMix = .16;
  rig.state.setAnimation(0, 'emerge', false);
  rig.state.addAnimation(0, 'idle', true, 0);
  rig.update(0);
  return rig;
}
