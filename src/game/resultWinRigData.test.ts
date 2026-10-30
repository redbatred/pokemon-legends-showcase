import { describe, expect, it } from 'vitest';
import { AnimationState, AnimationStateData, AtlasAttachmentLoader, MeshAttachment, Physics, RegionAttachment, Skeleton, SkeletonJson, TextureAtlas } from '@esotericsoftware/spine-core';
import { buildResultWinRigJson,buildResultWinFountainsJson, RESULT_WIN_ATLAS } from './resultWinRigData';

function load(width: number, height: number, low = false) {
  const json = buildResultWinRigJson(width, height, low);
  const data = new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(RESULT_WIN_ATLAS))).readSkeletonData(json);
  const skeleton = new Skeleton(data), state = new AnimationState(new AnimationStateData(data));
  const pose = (animation: string, time: number) => {
    skeleton.setToSetupPose(); state.clearTracks(); state.setAnimation(0, animation, animation === 'idle');
    state.update(time); state.apply(skeleton); skeleton.updateWorldTransform(Physics.none);
  };
  return { json, skeleton, pose };
}

describe('compact native result-win rig', () => {
  it.each([[240, 76], [342, 100], [560, 108], [680, 200]])('keeps every visible animated vertex inside its %s × %s award area', (width, height) => {
    const { skeleton, pose } = load(width, height);
    let largestExtent = 0;
    for (const animation of ['arrive', 'charge', 'impact', 'idle', 'held']) for (let time = 0; time <= 4; time += .025) {
      pose(animation, time);
      for (const slot of skeleton.slots.filter(slot => slot.color.a > .001)) {
        const attachment = slot.getAttachment()!;
        const vertices = new Float32Array(attachment instanceof MeshAttachment ? attachment.worldVerticesLength : 8);
        if (attachment instanceof MeshAttachment) attachment.computeWorldVertices(slot, 0, vertices.length, vertices, 0, 2);
        else (attachment as RegionAttachment).computeWorldVertices(slot, vertices, 0, 2);
        for (let i = 0; i < vertices.length; i++) {
          if (!Number.isFinite(vertices[i])) throw new Error(`Nonfinite ${slot.data.name} / ${animation} vertex`);
          largestExtent = Math.max(largestExtent, Math.abs(vertices[i]) / ((i % 2 ? height : width) / 2));
        }
      }
    }
    expect(largestExtent).toBeLessThanOrEqual(1);
  });

  it('uses native medal, wing and rim meshes with a smaller low-performance burst', () => {
    for (const low of [false, true]) {
      const { skeleton } = load(560, 108, low);
      for (const slot of skeleton.slots.filter(slot => /medal|wing/.test(slot.data.name))) expect(slot.getAttachment()).toBeInstanceOf(MeshAttachment);
      expect(skeleton.slots.filter(slot => slot.data.name.startsWith('confetti'))).toHaveLength(low ? 6 : 16);
    }
  });

  it('keeps confetti out of held and idle poses and completes the burst before an interlude ends', () => {
    const { skeleton, pose } = load(340, 100);
    pose('impact', .3);
    expect(skeleton.slots.some(slot => slot.data.name.startsWith('confetti') && slot.color.a > .5)).toBe(true);
    for (const animation of ['impact', 'idle', 'held']) {
      pose(animation, 1);
      expect(skeleton.slots.filter(slot => slot.data.name.startsWith('confetti')).every(slot => slot.color.a === 0)).toBe(true);
    }
  });
});

it('authors the side fountains as ballistic native Spine keys with a clean end pose',()=>{
 const reader=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(RESULT_WIN_ATLAS)));
 for(const low of [false,true]){
  const data=reader.readSkeletonData(buildResultWinFountainsJson(900,520,low)),skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
  state.setAnimation(0,'impact',false);state.update(.4);state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);
  expect(skeleton.slots.filter(s=>s.color.a>.5)).toHaveLength(low?12:36);
  const firstY=skeleton.slots[0].bone.worldY;
  state.update(.8);state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);
  expect(skeleton.slots[0].bone.worldY).toBeLessThan(firstY);
  state.update(.6);state.apply(skeleton);expect(skeleton.slots.every(s=>s.color.a===0)).toBe(true);
 }
});
