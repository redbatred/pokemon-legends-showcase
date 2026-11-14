import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {buildPsychicVaultFx,PSYCHIC_VAULT_FX_ATLAS,PSYCHIC_VAULT_FX_DURATION,type PsychicVaultFxKind} from './PsychicVaultFx';

function fixture(kind:PsychicVaultFxKind){
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(PSYCHIC_VAULT_FX_ATLAS))).readSkeletonData(buildPsychicVaultFx(kind));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'ambient',true);
 const sample=(time:number)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 const pose=()=>skeleton.bones.map(b=>[b.worldX,b.worldY,b.a,b.b,b.c,b.d]);
 return {data,skeleton,sample,pose};
}
for(const kind of ['reactor','pylon'] as const)it(`${kind} is a native looping Spine rig with deterministic seeking and finite poses`,()=>{
 const {data,sample,pose}=fixture(kind);
 expect(data.findAnimation('ambient')!.duration).toBe(PSYCHIC_VAULT_FX_DURATION);
 for(let i=0;i<121;i++){sample(i/10);expect(pose().flat().every(Number.isFinite)).toBe(true);}
 sample(2.75);const prior=pose();sample(11);sample(2.75);expect(pose()).toEqual(prior);
 sample(14.75);expect(pose()).toEqual(prior);
});
it('counter-rotates independent containment rings while the core remains centered',()=>{
 const {skeleton,sample}=fixture('reactor');sample(0);
 const outer=skeleton.findBone('rotor')!,inner=skeleton.findBone('innerRotor')!,core=skeleton.findBone('heart')!;
 const initial=[outer.rotation,inner.rotation];sample(6);
 expect(outer.rotation).toBeGreaterThan(initial[0]);expect(inner.rotation).toBeLessThan(initial[1]);
 expect(core.worldX).toBe(0);expect(core.worldY).toBe(0);
});
it('suspends independently orbiting crystals inside each containment socket',()=>{
 const {skeleton,sample}=fixture('pylon');sample(0);
 const center=skeleton.findBone('fragment0')!,left=skeleton.findBone('fragment1')!,right=skeleton.findBone('fragment2')!;
 const before=[left.worldX,right.worldX];sample(3);
 expect(Math.abs(left.worldX-before[0])).toBeGreaterThan(10);expect(Math.abs(right.worldX-before[1])).toBeGreaterThan(10);
 for(let i=0;i<48;i++){
  sample(i/4);
  expect(Math.abs(center.worldX)).toBeLessThanOrEqual(4.01);expect(-center.worldY).toBeGreaterThan(90);
  for(const fragment of [left,right]){expect(Math.abs(fragment.worldX)).toBeLessThanOrEqual(47.01);expect(-fragment.worldY).toBeGreaterThan(65);}
 }
});
