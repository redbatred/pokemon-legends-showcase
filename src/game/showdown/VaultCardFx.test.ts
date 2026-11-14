import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {applyVaultCardPose,buildVaultCardFx,VAULT_CARD_ATLAS} from './VaultCardFx';
it('seeks native containment animation and removes only the broken seal/link',()=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(VAULT_CARD_ATLAS))).readSkeletonData(buildVaultCardFx()),skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'hold',false);
 for(const remaining of [3,2,1,0,3])for(const time of [0,2.5,5.8]){
  skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);applyVaultCardPose(skeleton,remaining,0,false,.7);skeleton.updateWorldTransform(Physics.update);
  for(let i=0;i<3;i++)expect(skeleton.findSlot('seal'+i)!.color.a>0).toBe(i<remaining);
  for(const b of skeleton.bones)expect([b.worldX,b.worldY,b.a,b.b,b.c,b.d].every(Number.isFinite)).toBe(true);
 }
 applyVaultCardPose(skeleton,0,1,false,0);expect(skeleton.slots.every(s=>s.color.a===0)).toBe(true);
});
