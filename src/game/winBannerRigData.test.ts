import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {buildWinBannerRigJson,WIN_BANNER_ATLAS} from './winBannerRigData';

it('animates independent award wings and settles the text sockets exactly in the plaque',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(WIN_BANNER_ATLAS))).readSkeletonData(buildWinBannerRigJson());
 const rig=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'celebrate',false);
 const step=(dt:number)=>{state.update(dt);state.apply(rig);rig.updateWorldTransform(Physics.none);};
 step(.12);const a=rig.findBone('left')!,b=rig.findBone('right')!;expect(a.rotation).not.toBe(b.rotation);expect(Math.abs(a.rotation)).toBeGreaterThan(4);
 step(.7);expect(a.rotation).toBeCloseTo(0);expect(b.rotation).toBeCloseTo(0);
 expect(rig.findBone('amount')!.worldX).toBeCloseTo(0);expect(Math.abs(rig.findBone('amount')!.worldY)).toBeCloseTo(25);
 expect(rig.findBone('plaque')!.scaleX).toBeCloseTo(1);expect(rig.findBone('amount')!.scaleX).toBeCloseTo(1);
});
it('emits one impact event on the authored Spine frame',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(WIN_BANNER_ATLAS))).readSkeletonData(buildWinBannerRigJson());
 const rig=new Skeleton(data),state=new AnimationState(new AnimationStateData(data)),events:string[]=[];state.addListener({event:(_track,event)=>events.push(event.data.name)});state.setAnimation(0,'celebrate',false);
 state.update(.16);state.apply(rig);expect(events).toEqual([]);state.update(.04);state.apply(rig);expect(events).toEqual(['impact']);state.update(1);state.apply(rig);expect(events).toEqual(['impact']);
});
it('keeps the award gently animated while waiting without replaying its impact',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(WIN_BANNER_ATLAS))).readSkeletonData(buildWinBannerRigJson());
 const rig=new Skeleton(data),state=new AnimationState(new AnimationStateData(data)),events:string[]=[];
 state.addListener({event:(_track,event)=>events.push(event.data.name)});state.setAnimation(0,'celebrate',false);state.addAnimation(0,'idle',true,0);
 const heights:number[]=[];for(let i=0;i<180;i++){state.update(.05);state.apply(rig);rig.updateWorldTransform(Physics.none);if(i>60)heights.push(rig.findBone('plaque')!.worldY);}
 expect(Math.max(...heights)-Math.min(...heights)).toBeGreaterThan(2);expect(events).toEqual(['impact']);
 expect(rig.findSlot('plate')!.color.a).toBe(1);expect(rig.findBone('amount')!.scaleX).toBe(1);
});
