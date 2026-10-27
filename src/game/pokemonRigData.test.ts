import { describe, expect, it } from 'vitest';
import { AnimationState, AnimationStateData, AtlasAttachmentLoader, MeshAttachment, Physics, Skeleton, SkeletonJson, TextureAtlas } from '@esotericsoftware/spine-core';
import { buildPokemonRigJson } from './pokemonRigData';
import manifest from '../../public/assets/pokemon/manifest.json';

function load(path = '/assets/pokemon/charizard.png') {
  const json = buildPokemonRigJson(path);
  const atlas = new TextureAtlas('pokemon.png\nsize: 475,475\nfilter: Linear,Linear\npma: false\nartwork\n  bounds: 0,0,475,475\n');
  const data = new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);
  const skeleton = new Skeleton(data);
  const state = new AnimationState(new AnimationStateData(data));
  skeleton.updateWorldTransform(Physics.none);
  const slot = skeleton.slots[0], mesh = slot.getAttachment() as MeshAttachment;
  const vertices = () => {
    const result = new Float32Array(mesh.worldVerticesLength);
    mesh.computeWorldVertices(slot, 0, result.length, result, 0, 2);
    return result;
  };
  const pose = (animation: string, time: number) => {
    skeleton.setToSetupPose();
    state.clearTracks();
    state.setAnimation(0, animation, false);
    state.update(time);
    state.apply(skeleton);
    skeleton.updateWorldTransform(Physics.none);
    return vertices();
  };
  return { json, data, skeleton, state, mesh, vertices, pose };
}

describe('weighted Pokémon artwork rigs', () => {
  it('reconstructs the unaltered source rectangle in the setup pose', () => {
    const { json, mesh, vertices } = load();
    expect(mesh.bones).not.toBeNull();
    const actual = vertices(), uvs = json.skins[0].attachments.artwork.artwork.uvs;
    for (let i = 0; i < actual.length; i += 2) {
      expect(actual[i]).toBeCloseTo((uvs[i] - .5) * 350, 4);
      expect(actual[i + 1]).toBeCloseTo((.5 - uvs[i + 1]) * 350, 4);
    }
  });

  it('moves wing roots and tips, head and flame independently while keeping feet planted', () => {
    const { skeleton, pose, vertices, json } = load();
    const before = vertices();
    const footBefore = ['footLeft', 'footRight'].map(name => {
      const bone = skeleton.findBone(name)!;
      return [bone.worldX, bone.worldY];
    });
    const after = pose('idle', .8);
    const rotations = ['head', 'wingLeft', 'wingLeftTip', 'wingRight', 'wingRightTip', 'tailTip', 'flame'].map(name => skeleton.findBone(name)!.rotation);
    expect(rotations.every(value => Math.abs(value) > .01)).toBe(true);
    expect(new Set(rotations).size).toBeGreaterThan(5);
    for (const [i, name] of ['footLeft', 'footRight'].entries()) {
      const bone = skeleton.findBone(name)!;
      expect([bone.worldX, bone.worldY]).toEqual(footBefore[i]);
    }
    // The tip actually deforms mesh vertices, rather than being an unused animated bone.
    const uvs = json.skins[0].attachments.artwork.artwork.uvs;
    const at = (u: number, v: number) => {
      let best = 0, distance = Infinity;
      for (let i = 0; i < uvs.length; i += 2) {
        const d = Math.hypot(uvs[i] - u, uvs[i + 1] - v);
        if (d < distance) { distance = d; best = i; }
      }
      return best;
    };
    const wing = at(.15, .34), foot = at(.31, .82);
    expect(Math.hypot(after[wing] - before[wing], after[wing + 1] - before[wing + 1])).toBeGreaterThan(3);
    expect(Math.hypot(after[foot] - before[foot], after[foot + 1] - before[foot + 1])).toBeLessThan(.001);
  });

  it('parses and evaluates all 50 supported species and an unknown fallback in Spine 4.2', () => {
    for (const path of [...Object.values(manifest).map(value => value.image), '/unknown-pokemon.png']) {
      const rig = load(path);
      for (const animation of ['emerge', 'roar', 'idle', 'charge', 'attack', 'recover']) {
        expect(rig.data.findAnimation(animation), `${path}: ${animation}`).not.toBeNull();
        for (const time of [0, .25, .6, 1, 1.35, 3.2]) {
          expect(rig.pose(animation, time).every(Number.isFinite), `${path}: ${animation} at ${time}`).toBe(true);
        }
      }
    }
  });

  it('opens Charizard’s separate jaw for the attack and closes it on recovery',()=>{
    const {skeleton,pose}=load();
    pose('charge',.48);expect(skeleton.findBone('jaw')!.rotation).toBeCloseTo(7);
    pose('attack',.12);expect(skeleton.findBone('jaw')!.rotation).toBeCloseTo(23);
    pose('recover',.46);expect(skeleton.findBone('jaw')!.rotation).toBeCloseTo(0);
    pose('idle',.8);expect(skeleton.findBone('jaw')!.rotation).toBeCloseTo(0);
  });

  it('queues the emergence into a continuous idle loop', () => {
    const { state, skeleton } = load();
    state.data.defaultMix = .16;
    state.setAnimation(0, 'emerge', false);
    state.addAnimation(0, 'idle', true, 0);
    for (let frame = 0; frame < 120; frame++) { state.update(1 / 60); state.apply(skeleton); }
    expect(state.getCurrent(0)?.animation?.name).toBe('idle');
    expect(state.getCurrent(0)?.loop).toBe(true);
  });
});
