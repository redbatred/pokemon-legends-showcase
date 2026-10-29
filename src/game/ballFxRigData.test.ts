import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {BALL_FX_ATLAS,buildBallFxRigJson} from './ballFxRigData';
it('authors a native flight loop and an expanding release with a clean finish',()=>{
 for(const low of [false,true]){const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(BALL_FX_ATLAS))).readSkeletonData(buildBallFxRigJson(low)),skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
 expect(data.findAnimation('flight')!.duration).toBeGreaterThan(.4);expect(data.findAnimation('release')!.duration).toBeGreaterThan(.9);
 for(const [name,end] of [['flight',.3],['release',.25],['release',1.3]] as const){skeleton.setToSetupPose();state.clearTracks();state.setAnimation(0,name,false);state.update(end);state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);expect(skeleton.bones.every(b=>Number.isFinite(b.worldX)&&Number.isFinite(b.worldY))).toBe(true);const visible=skeleton.slots.filter(s=>s.color.a>.01);if(name==='release'&&end>1)expect(visible).toHaveLength(0);else expect(visible.length).toBeGreaterThan(3);}
 }
});

it('animates a body-sized formation halo and a connected aperture stream with no residual slots',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(BALL_FX_ATLAS))).readSkeletonData(buildBallFxRigJson()),skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
 for(const name of ['form','conduit']){expect(data.findAnimation(name)).not.toBeNull();state.clearTracks();skeleton.setToSetupPose();state.setAnimation(0,name,false);state.update(.3);state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);expect(skeleton.slots.filter(s=>s.color.a>.01).length).toBeGreaterThan(3);state.update(2);state.apply(skeleton);expect(skeleton.slots.every(s=>s.color.a<.01)).toBe(true);}
});
