import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {buildShowdownFx,SHOWDOWN_FX_ATLAS} from './ShowdownFx';
function rig(){const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SHOWDOWN_FX_ATLAS))).readSkeletonData(buildShowdownFx('guardbreak'));const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'action',false);return {data,skeleton,state};}
it('builds a finite native Spine shield breakup that completely clears at1.6 seconds',()=>{
 const {data,skeleton,state}=rig();expect(data.findAnimation('action')!.duration).toBeCloseTo(1.6);
 for(let frame=0;frame<=96;frame++){state.getCurrent(0)!.trackTime=frame/60;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);for(const bone of skeleton.bones)for(const value of [bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d])expect(Number.isFinite(value)).toBe(true);}
 expect(skeleton.slots.every(slot=>slot.color.a<1e-6)).toBe(true);
});
it('releases three curved energy fragments outwards while secondary sparks follow',()=>{
 const {skeleton,state}=rig();const sample=(time:number)=>{state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 sample(.28);for(let i=0;i<3;i++)expect(skeleton.findSlot('plate'+i)!.color.a).toBeGreaterThan(.8);
 const plate=skeleton.findBone('plate0')!;const early={x:plate.worldX,y:plate.worldY};sample(.55);expect(Math.hypot(plate.worldX,plate.worldY)).toBeGreaterThan(Math.hypot(early.x,early.y));
 sample(.9);expect(Math.abs(plate.worldX)).toBeGreaterThan(Math.abs(early.x));
 expect(skeleton.findSlot('spark0')).not.toBeNull();expect(skeleton.findSlot('ring')).not.toBeNull();
});
it('keeps every visible flame attachment between the mouth and the collision plane',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SHOWDOWN_FX_ATLAS))).readSkeletonData(buildShowdownFx('fire'));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'action',false);
 for(let frame=1;frame<51;frame++){
  state.getCurrent(0)!.trackTime=frame/60;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);
  for(const slot of skeleton.slots){
   if(slot.color.a<.01)continue;
   const attachment=slot.getAttachment();if(!attachment||!('width' in attachment)||!slot.data.name.startsWith('tongue'))continue;
   const half=(attachment.width as number)/2,halfY=((attachment as unknown as {height:number}).height)/2,b=slot.bone;
   const extent=Math.abs(b.a)*half+Math.abs(b.b)*halfY;
   expect(b.worldX-extent).toBeGreaterThanOrEqual(0);
   expect(b.worldX+extent).toBeLessThanOrEqual(320);
  }
 }
});
it('pulls the final field inward before releasing the outward shockwave',()=>{
 const {skeleton,state}=rig();const sample=(time:number)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 sample(.02);const shell=skeleton.findBone('collapseShell');expect(shell).not.toBeNull();const start=shell!.scaleX;
 sample(.16);expect(shell!.scaleX).toBeLessThan(start*.4);expect(skeleton.findSlot('ring')!.color.a).toBeLessThan(.1);
 sample(.4);expect(skeleton.findSlot('ring')!.color.a).toBeGreaterThan(.5);expect(skeleton.findBone('ring')!.scaleX).toBeGreaterThan(1);
});
it('clears all contact ripples and restores them when seeking backwards',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SHOWDOWN_FX_ATLAS))).readSkeletonData(buildShowdownFx('guardhit'));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'action',false);
 const sample=(t:number)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=t;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 sample(.15);expect(skeleton.findSlot('contactRipple0')!.color.a).toBeGreaterThan(.5);
 const pos=skeleton.findBone('contactRipple0')!.worldX;
 sample(1);expect(skeleton.slots.every(s=>s.color.a===0)).toBe(true);
 sample(.15);expect(skeleton.findBone('contactRipple0')!.worldX).toBe(pos);
});
