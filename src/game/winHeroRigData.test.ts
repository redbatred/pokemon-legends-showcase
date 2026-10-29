import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,MeshAttachment,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {buildWinHeroRigJson} from './winHeroRigData';
import {WIN_FX_ATLAS} from './winFxRigData';
it.each([false,true])('keeps the native hero coronas outside the body and sustains their glow after entrance (%s)',epic=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(WIN_FX_ATLAS))).readSkeletonData(buildWinHeroRigJson(epic)),s=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
 state.setAnimation(0,'celebrate',false);state.addAnimation(0,'idle',true,0);
 let held=0;
 for(let i=0;i<180;i++){
  state.update(.05);state.apply(s);s.updateWorldTransform(Physics.none);
  for(const slot of s.slots){
   expect(Number.isFinite(slot.bone.worldX+slot.bone.worldY)).toBe(true);
   const a=slot.getAttachment();if(a instanceof MeshAttachment){const v=new Float32Array(a.worldVerticesLength);a.computeWorldVertices(slot,0,v.length,v,0,2);expect([...v].every(Number.isFinite)).toBe(true);if(i>60){expect(slot.color.a).toBeGreaterThan(.2);for(let n=0;n<v.length;n+=2)expect(Math.abs(v[n])).toBeGreaterThan(165);held++;}}
  }
 }
 expect(held).toBeGreaterThan(300);
});
