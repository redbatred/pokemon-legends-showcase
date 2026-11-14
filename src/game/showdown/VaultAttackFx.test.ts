import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,MeshAttachment,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {buildVaultAttackFx,VAULT_ATTACK_ATLAS} from './VaultAttackFx';

function rig(index:0|1|2,reduced=false){
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(VAULT_ATTACK_ATLAS))).readSkeletonData(buildVaultAttackFx(index,reduced));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'action',false);
 const sample=(time:number)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 return {data,skeleton,sample};
}
for(const index of [0,1,2] as const)for(const reduced of [false,true]){
 it(`move ${index}, reduced=${reduced}: native tracks stay finite and clear at .76 seconds`,()=>{
  const {data,skeleton,sample}=rig(index,reduced);expect(data.findAnimation('action')!.duration).toBeCloseTo(.76);
  for(let frame=0;frame<=76;frame++){
   sample(frame/100);
   for(const bone of skeleton.bones)for(const n of [bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d])expect(Number.isFinite(n)).toBe(true);
   for(const slot of skeleton.slots){expect(Number.isFinite(slot.color.a)).toBe(true);expect(slot.deform.every(Number.isFinite)).toBe(true);}
  }
  expect(skeleton.slots.every(slot=>slot.color.a===0)).toBe(true);
  sample(.36);expect(skeleton.slots.some(slot=>slot.color.a>.9)).toBe(true);
  const pose=skeleton.bones.map(b=>[b.worldX,b.worldY,b.a,b.b]);sample(.7);sample(.36);
  expect(skeleton.bones.map(b=>[b.worldX,b.worldY,b.a,b.b])).toEqual(pose);
 });
}
it('keeps the Flamethrower cone broad at contact, with an incandescent core and turbulent edge',()=>{
 const {skeleton,sample}=rig(0);sample(.36);
 const cone=skeleton.findSlot('flameOuter')!,core=skeleton.findSlot('flameCore')!;
 expect(cone.getAttachment()).toBeInstanceOf(MeshAttachment);expect(core.color.a).toBeGreaterThan(.9);
 const mesh=cone.getAttachment() as MeshAttachment;const positions=new Float32Array(mesh.worldVerticesLength);mesh.computeWorldVertices(cone,0,positions.length,positions,0,2);
 const ys=Array.from(positions).filter((_,i)=>i%2===1);expect(Math.max(...ys)-Math.min(...ys)).toBeGreaterThan(70);
 expect(cone.deform.some(v=>Math.abs(v)>1)).toBe(true);
});
it('carries a readable five-pronged Fire Blast crest to the collision point',()=>{
 const {skeleton,sample}=rig(1);sample(.12);const early=skeleton.findBone('fireCrest')!.scaleY;
 sample(.42);expect(skeleton.findBone('fireCrest')!.worldX).toBeGreaterThanOrEqual(280);
 expect(skeleton.findBone('fireCrest')!.scaleY).toBeGreaterThan(early);
 expect(skeleton.findSlot('fireCrest')!.color.a).toBeGreaterThan(.9);
 expect(skeleton.slots.filter(slot=>slot.data.name.startsWith('crestLobe'))).toHaveLength(5);
});
it('releases Blast Burn from compressed pressure into a thick spiraling lance',()=>{
 const {skeleton,sample}=rig(2);sample(.025);const early=skeleton.findBone('lanceBody')!.scaleY;
 sample(.24);expect(skeleton.findBone('lanceBody')!.scaleY).toBeGreaterThan(early*2);
 expect(skeleton.findSlot('lanceCore')!.color.a).toBeGreaterThan(.9);
 expect(skeleton.findSlot('pressure0')!.color.a).toBeGreaterThan(.2);
 const a=skeleton.findBone('collar0')!.rotation;sample(.42);expect(skeleton.findBone('collar0')!.rotation).not.toBe(a);
});
it('retains the primary silhouette while suppressing ember and pressure motion when reduced',()=>{
 for(const index of [0,1,2] as const){const {skeleton,sample}=rig(index,true);sample(.32);
  expect(skeleton.slots.some(slot=>slot.color.a>.9)).toBe(true);
  expect(skeleton.slots.filter(slot=>/^(ember|pressure)/.test(slot.data.name)).every(slot=>slot.color.a===0)).toBe(true);
 }
});
