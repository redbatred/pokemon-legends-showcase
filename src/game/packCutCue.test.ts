import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {packCutPose,projectPackPoint} from './packCutGeometry';
import {SCISSOR_ATLAS,buildScissorRigJson} from './scissorRigData';
it('keeps the scissors pivot aligned to the real foil seam under pack tilt',()=>{
 for(const yaw of [-.32,0,.32])for(const pitch of [-.19,0,.19])for(const t of [0,.4,.8,1.2]){
  const p=packCutPose(t,yaw,pitch),a=projectPackPoint(p.localX,p.localY,yaw,pitch);
  expect(p.x).toBeCloseTo(a.x,6);expect(p.y).toBeCloseTo(a.y,6);expect(p.localY).toBeLessThan(-157);expect(p.localY).toBeGreaterThan(-166);expect(p.angle).toBeGreaterThan(2.8);expect(p.angle).toBeLessThan(3.5);
 }
});
it('opens and closes independently rigged scissor blades around the seal',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SCISSOR_ATLAS))).readSkeletonData(buildScissorRigJson()),skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
 state.setAnimation(0,'snip',true);state.apply(skeleton);const front=skeleton.findBone('front')!,back=skeleton.findBone('back')!;const open=Math.abs(front.rotation-back.rotation);
 state.update(.42);state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);
 expect(Math.abs(front.rotation-back.rotation)).toBeLessThan(open*.3);expect(open).toBeGreaterThan(25);expect(skeleton.bones.every(b=>Number.isFinite(b.worldX))).toBe(true);
});
