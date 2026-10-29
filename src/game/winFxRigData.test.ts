import { describe, expect, it } from 'vitest';
import { AnimationState, AnimationStateData, AtlasAttachmentLoader, MeshAttachment, Physics, RegionAttachment, Skeleton, SkeletonJson, TextureAtlas } from '@esotericsoftware/spine-core';
import { buildWinFxRigJson, WIN_FX_ATLAS } from './winFxRigData';

function load(epic = false, special = false) {
  const json = buildWinFxRigJson(epic, special);
  const atlas = new TextureAtlas(WIN_FX_ATLAS);
  const data = new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json);
  const skeleton = new Skeleton(data);
  const state = new AnimationState(new AnimationStateData(data));
  const pose = (time: number) => {
    skeleton.setToSetupPose();
    state.clearTracks();
    state.setAnimation(0, 'celebrate', false);
    state.update(time);
    state.apply(skeleton);
    skeleton.updateWorldTransform(Physics.none);
  };
  const vertices = (name: string) => {
    const slot = skeleton.findSlot(name)!;
    const attachment = slot.getAttachment()!;
    const result = new Float32Array(attachment instanceof MeshAttachment ? attachment.worldVerticesLength : 8);
    if (attachment instanceof MeshAttachment) attachment.computeWorldVertices(slot, 0, result.length, result, 0, 2);
    else (attachment as RegionAttachment).computeWorldVertices(slot, result, 0, 2);
    return result;
  };
  return { json, data, skeleton, pose, vertices };
}

describe('native Spine win celebration', () => {
  it('loops quiet glints after the entrance without repeating the burst',()=>{
    const {data,skeleton}=load(true),state=new AnimationState(new AnimationStateData(data));
    state.setAnimation(0,'celebrate',false);state.addAnimation(0,'idle',true,0);
    let glints=0;for(let i=0;i<180;i++){state.update(.05);state.apply(skeleton);if(i>65){glints+=skeleton.slots.filter(s=>s.data.name.startsWith('glint')&&s.color.a>.2).length;for(const slot of skeleton.slots.filter(s=>!s.data.name.startsWith('glint')))expect(slot.color.a).toBe(0);}}
    expect(glints).toBeGreaterThan(10);
  });
  it.each([[false, false, 36], [true, false, 54], [false, true, 12], [true, true, 12]] as const)(
    'parses the %s/%s tier and keeps all attachments finite and invisible after the effect', (epic, special, count) => {
      const { data, skeleton, pose, vertices } = load(epic, special);
      expect(data.findAnimation('celebrate')?.duration).toBe(2.5);
      expect(skeleton.slots.filter(slot => slot.data.name.startsWith('confetti'))).toHaveLength(count);
      for (const time of [0, .2, .5, .8, 1.5, 2, 2.5, 3]) {
        pose(time);
        for (const slot of skeleton.slots) {
          expect(vertices(slot.data.name).every(Number.isFinite), `${slot.data.name} at ${time}`).toBe(true);
          expect(slot.color.a).toBeGreaterThanOrEqual(0);
          expect(slot.color.a).toBeLessThanOrEqual(1);
          if (time === 0 || time >= 2.5) expect(slot.color.a, `${slot.data.name} at ${time}`).toBe(0);
        }
      }
    },
  );

  it('launches confetti upward, tumbles it, then lets it fall', () => {
    const { skeleton, pose } = load();
    const bone = skeleton.findBone('confetti0')!;
    pose(.2);
    const early = { y: bone.y, rotation: bone.rotation, scaleX: bone.scaleX };
    pose(.65);
    const apex = bone.y;
    expect(apex).toBeGreaterThan(early.y + 60);
    expect(Math.abs(bone.rotation - early.rotation)).toBeGreaterThan(30);
    expect(Math.abs(bone.scaleX - early.scaleX)).toBeGreaterThan(.1);
    pose(1.9);
    expect(bone.y).toBeLessThan(apex - 100);
    expect(skeleton.findSlot('confetti0')!.color.a).toBeGreaterThan(0);
  });

  it('uses celebration pieces without surrounding ribbons or speed-line blades',()=>{const {skeleton}=load(true);expect(skeleton.slots.some(s=>/ribbon|blade/.test(s.data.name))).toBe(false);});
});
