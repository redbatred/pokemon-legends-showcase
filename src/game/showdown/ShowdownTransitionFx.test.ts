import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {buildShowdownTransitionFx,SHOWDOWN_TRANSITION_ATLAS} from './ShowdownTransitionFx';

function rig(){
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SHOWDOWN_TRANSITION_ATLAS))).readSkeletonData(buildShowdownTransitionFx());
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'transition',false);
 const sample=(time:number)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 return {data,skeleton,sample};
}
it('parses the authored transition rig, keeps finite transforms, and clears both endpoints',()=>{
 const {data,skeleton,sample}=rig();expect(data.findAnimation('transition')!.duration).toBeCloseTo(1.62);
 for(let frame=0;frame<=100;frame++){
  sample(frame/100*1.62);
  for(const bone of skeleton.bones)for(const value of [bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d])expect(Number.isFinite(value)).toBe(true);
 }
 for(const time of [0,1.62]){sample(time);expect(skeleton.slots.length).toBeGreaterThan(0);expect(skeleton.slots.every(slot=>slot.color.a<1e-6)).toBe(true);}
});
it('keeps a visible locked seal while assets wait and can resample backwards after cancellation',()=>{
 const {skeleton,sample}=rig();sample(.88);
 expect(skeleton.findSlot('seal')!.color.a).toBeGreaterThan(.9);
 sample(.18);const earlier=skeleton.bones.map(bone=>[bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d]);
 sample(1.42);sample(.18);
 expect(skeleton.bones.map(bone=>[bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d])).toEqual(earlier);
});
