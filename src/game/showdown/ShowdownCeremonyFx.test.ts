import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,Physics,RegionAttachment,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {applyShowdownGuardPose,buildShowdownCeremonyFx,SHOWDOWN_CEREMONY_ATLAS,SHOWDOWN_CEREMONY_DURATION,SHOWDOWN_GUARD_RADIUS,type ShowdownCeremonyKind} from './ShowdownCeremonyFx';

function rig(kind:ShowdownCeremonyKind){
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SHOWDOWN_CEREMONY_ATLAS))).readSkeletonData(buildShowdownCeremonyFx(kind));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'action',false);
 const sample=(time:number,remaining=3,reduced=false,pulse=0)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);if(kind==='guard')applyShowdownGuardPose(skeleton,remaining,reduced,pulse);skeleton.updateWorldTransform(Physics.update);};
 return {data,skeleton,sample};
}
for(const kind of ['summon','guard','coronation'] as const)it(`${kind} parses as real Spine 4.2 and supports deterministic finite seeking`,()=>{
 const {data,skeleton,sample}=rig(kind),duration=SHOWDOWN_CEREMONY_DURATION[kind];expect(data.findAnimation('action')!.duration).toBeCloseTo(duration);
 for(let frame=0;frame<=100;frame++){
  sample(frame/100*duration);
  for(const bone of skeleton.bones)for(const value of [bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d])expect(Number.isFinite(value)).toBe(true);
 }
 sample(.43);const earlier=skeleton.bones.map(bone=>[bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d]);
 sample(duration);sample(.43);expect(skeleton.bones.map(bone=>[bone.worldX,bone.worldY,bone.a,bone.b,bone.c,bone.d])).toEqual(earlier);
 if(kind!=='guard')for(const time of [0,duration]){sample(time);expect(skeleton.slots.every(slot=>slot.color.a<1e-6)).toBe(true);}
});

it('opens two independent Poké Ball shells before the finite summon ribbons rise',()=>{
 const {skeleton,sample}=rig('summon');sample(.29);
 const top=skeleton.findBone('ballTop')!,bottom=skeleton.findBone('ballBottom')!,initialGap=Math.abs(top.worldY-bottom.worldY);
 sample(.5);expect(Math.abs(top.worldY-bottom.worldY)).toBeGreaterThan(initialGap+30);expect(skeleton.findSlot('ballTop')!.color.a).toBeGreaterThan(.9);expect(skeleton.findSlot('ballBottom')!.color.a).toBeGreaterThan(.9);
 expect(skeleton.findSlot('ribbon0')!.color.a).toBeGreaterThan(.7);expect(skeleton.findSlot('floorSeal')!.color.a).toBeGreaterThan(.7);
 sample(1.45);expect(skeleton.slots.every(slot=>slot.color.a===0)).toBe(true);
});

it('keeps a fixed transparent membrane contact plane while consuming three energy charges',()=>{
 const {skeleton,sample}=rig('guard');
 for(const count of [3,2,1,0])for(const time of [0,.7,2.3,5.9])for(const pulse of [0,1]){
  sample(time,count,false,pulse);
  for(let i=0;i<3;i++)for(const part of ['seam','rune'])expect(skeleton.findSlot(`guard${i}_${part}`)!.color.a>0).toBe(i<count);
  if(count===0){expect(skeleton.slots.every(slot=>slot.color.a===0)).toBe(true);continue;}
  const slot=skeleton.findSlot('barrierField')!,attachment=slot.getAttachment() as RegionAttachment;
  expect(slot.bone.worldX-slot.bone.a*attachment.width/2).toBeCloseTo(-SHOWDOWN_GUARD_RADIUS);
 }
});
it('restores psychic charges when seeking backwards and keeps reduced motion readable',()=>{
 const {skeleton,sample}=rig('guard');sample(1,1);sample(1,3,true);
 for(let i=0;i<3;i++){expect(skeleton.findSlot(`guard${i}_seam`)!.color.a).toBeGreaterThan(.5);expect(skeleton.findSlot(`guard${i}_rune`)!.color.a).toBe(0);}
 expect(skeleton.findSlot('barrierField')!.color.a).toBeGreaterThan(.5);
});
it('fits the foil rim to the 312 by 435 card and keeps edge glints outside the artwork',()=>{
 const {skeleton,sample}=rig('coronation');
 for(let time=.6;time<2.2;time+=.1){sample(time);for(let i=0;i<2;i++){
  const b=skeleton.findBone('edgeGlint'+i)!;
  expect(Math.abs(b.worldX)>=158.9||Math.abs(b.worldY)>=220.4).toBe(true);
 }}
 sample(1.1);expect(skeleton.findSlot('cardRim')!.color.a).toBeGreaterThan(.8);
 sample(2.7);expect(skeleton.slots.every(slot=>slot.color.a<1e-6)).toBe(true);
});
it('compresses on impact without moving the contact edge, then restores the relaxed field',()=>{
 const {skeleton,sample}=rig('guard');sample(1,3,false,1);
 const field=skeleton.findSlot('barrierField')!,attachment=field.getAttachment() as RegionAttachment;
 expect(field.bone.a).toBeLessThan(.9);
 expect(field.bone.worldX-field.bone.a*attachment.width/2).toBeCloseTo(-100);
 sample(1,3,false,0);expect(field.bone.a).toBeCloseTo(1);
 sample(1,3,true,1);expect(field.bone.a).toBeCloseTo(1);
});
