import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {SPECIAL_FRAME_ATLAS,buildSpecialFrameRigJson} from './specialFrameRigData';
it.each([false,true])('loops native Spine highlights around the card without entering the artwork (low=%s)',low=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SPECIAL_FRAME_ATLAS))).readSkeletonData(buildSpecialFrameRigJson(low));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data)),duration=data.findAnimation('surround')!.duration;
 const pose=(t:number)=>{state.clearTracks();skeleton.setToSetupPose();state.setAnimation(0,'surround',true);state.update(t);state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);return skeleton.bones.filter(b=>b.data.name.startsWith('spark')).map(b=>[b.worldX,b.worldY]);};
 const start=pose(0);expect(start.length).toBeGreaterThan(2);
 for(let i=0;i<80;i++)for(const [x,y] of pose(duration*i/80)){
  expect(Number.isFinite(x)&&Number.isFinite(y)).toBe(true);
  expect(Math.abs(x)>=154||Math.abs(y)>=216).toBe(true);
 }
 const loop=pose(duration);loop.forEach((p,i)=>{expect(p[0]).toBeCloseTo(start[i][0],3);expect(p[1]).toBeCloseTo(start[i][1],3);});
 expect(pose(duration*.2)).not.toEqual(start);
});
