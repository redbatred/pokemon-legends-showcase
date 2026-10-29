import { describe, expect, it } from 'vitest';
import { AnimationState, AnimationStateData, AtlasAttachmentLoader, MeshAttachment, Physics, Skeleton, SkeletonJson, TextureAtlas } from '@esotericsoftware/spine-core';
import { buildElementalWinRigJson, ELEMENTAL_KINDS, ELEMENTAL_WIN_ATLAS } from './elementalWinRigData';
import { FLOW_DURATION } from './elementalFlow';

function load(kind: typeof ELEMENTAL_KINDS[number], front = false, low = false) {
  const data = new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(ELEMENTAL_WIN_ATLAS))).readSkeletonData(buildElementalWinRigJson(kind, front, true, low));
  const skeleton = new Skeleton(data), state = new AnimationState(new AnimationStateData(data));
  state.setAnimation(0, 'flow', true);
  const pose = (time: number) => {
    state.getCurrent(0)!.trackTime = time; state.apply(skeleton); skeleton.updateWorldTransform(Physics.none);
  };
  const vertices = (index: number) => {
    const slot = skeleton.slots[index], mesh = slot.getAttachment() as MeshAttachment;
    const result = new Float32Array(mesh.worldVerticesLength);
    mesh.computeWorldVertices(slot, 0, result.length, result, 0, 2); return result;
  };
  return { data, skeleton, state, pose, vertices };
}

describe('native elemental fluid meshes', () => {
  it.each(ELEMENTAL_KINDS)('%s parses finite mesh silhouettes and remains alive across many loops', kind => {
    for (const front of [false, true]) {
      const { skeleton, pose, vertices } = load(kind, front);
      for (const time of [0, .2, .55, 1.3, 2.8, 3.2, 7.1, 23.8]) {
        pose(time);
        let visible = 0;
        for (let index = 0; index < skeleton.slots.length; index++) {
          const slot = skeleton.slots[index];
          expect(slot.getAttachment()).toBeInstanceOf(MeshAttachment);
          expect(vertices(index).every(Number.isFinite)).toBe(true);
          expect(slot.color.a).toBeGreaterThanOrEqual(0); expect(slot.color.a).toBeLessThanOrEqual(1);
          if (slot.color.a > .2) visible++;
        }
        expect(visible).toBeGreaterThan(front ? 4 : 12);
      }
    }
  });

  it('changes the actual silhouette through native deform, with no elemental image attachment', () => {
    const { skeleton, pose, vertices } = load('fire');
    pose(.25); const before = vertices(1);
    pose(.75); const after = vertices(1);
    expect(Math.max(...after.map((value, index) => Math.abs(value - before[index])))).toBeGreaterThan(70);
    expect(skeleton.slots[1].deform.some(value => Math.abs(value) > 20)).toBe(true);
    for (const slot of skeleton.slots) expect(['soft', 'material', 'fluid']).toContain((slot.getAttachment() as MeshAttachment).path);
  });

  it('joins the loop within native Float32 precision in geometry and opacity', () => {
    const { skeleton, pose, vertices } = load('water');
    pose(0); const initial = skeleton.slots.map((slot, index) => ({ alpha: slot.color.a, points: [...vertices(index)] }));
    pose(FLOW_DURATION);
    skeleton.slots.forEach((slot, index) => {
      expect(slot.color.a).toBeCloseTo(initial[index].alpha, 5);
      expect(Math.max(...vertices(index).map((value, n) => Math.abs(value - initial[index].points[n])))).toBeLessThan(.002);
    });
  });

  it('keeps front material low and limits mesh cost, with reduced emitters on low mode', () => {
    let regular = 0, reduced = 0;
    for (const front of [false, true]) {
      for (const low of [false, true]) {
        const { skeleton, pose, vertices } = load('fire', front, low);
        const count = skeleton.slots.reduce((sum, slot) => sum + (slot.getAttachment() as MeshAttachment).worldVerticesLength / 2, 0);
        if (low) reduced += count; else regular += count;
        if (front) for (const time of [.1, .6, 1.2, 1.8, 2.6]) {
          pose(time);
          skeleton.slots.forEach((slot, index) => {
            if (slot.color.a < .05) return;
            const ys = [...vertices(index)].filter((_, n) => n % 2 === 1);
            expect(Math.max(...ys)).toBeLessThan(90);
          });
        }
      }
    }
    expect(regular).toBeLessThan(7200); expect(reduced).toBeLessThan(regular * .45);
  });
});
