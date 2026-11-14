import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,RegionAttachment,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
it('parses both court Spine animations, keeps every attachment finite, and clears after impact',()=>{
 const dir=new URL('../../public/assets/arena-pressure-v54/',import.meta.url),atlas=new TextureAtlas(readFileSync(new URL('pressure.atlas',dir),'utf8')),data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(JSON.parse(readFileSync(new URL('pressure.json',dir),'utf8')));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
 for(const name of ['gather','burst']){state.setAnimation(0,name,false);for(const time of [0,.15,.4,.7,1]){state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);for(const slot of skeleton.slots){const vertices=new Float32Array(8);(slot.getAttachment() as RegionAttachment).computeWorldVertices(slot,vertices,0,2);expect([...vertices].every(Number.isFinite)).toBe(true);}if(time===1)expect(skeleton.slots.every(s=>s.color.a===0)).toBe(true);}}
});
