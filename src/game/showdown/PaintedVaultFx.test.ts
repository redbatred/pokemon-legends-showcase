import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,MeshAttachment,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';

const paths=['jet','bloom','ward','wisp','summon','reward','portal','fog','shadow','ball','flare','clasp','water','rock','speed','shock'];
function rig(kind:string){
 const raw=JSON.parse(readFileSync('public/assets/showdown-v11/vault.json','utf8'));
 const atlas=new TextureAtlas('test.png\nsize: 1024,1024\nfilter: Linear,Linear\npma: false\n'+paths.map(p=>`${p}\n  bounds: 0,0,256,256\n`).join(''));
 const data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(raw),skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));
 state.setAnimation(0,kind,false);
 const sample=(time:number)=>{skeleton.setToSetupPose();state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.update);};
 return {data,skeleton,sample};
}
for(const [kind,end] of [['fire0',.76],['fire1',.76],['fire2',.76],['impact',.8],['guardbreak',1.4],['summon',1.5],['charge',1.2],['reward',3],['shock',.55]] as const){
 it(`${kind} clears every raster at completion and permits deterministic seeking`,()=>{
  const {skeleton,sample}=rig(kind);sample(end*.4);
  expect(skeleton.slots.some(s=>s.color.a>.5)).toBe(true);
  const pose=skeleton.bones.map(b=>[b.worldX,b.worldY,b.a,b.b]);
  expect(skeleton.slots.filter(s=>s.color.a>0).every(s=>s.getAttachment() instanceof MeshAttachment)).toBe(true);
  expect(skeleton.slots.some(s=>s.color.a>0&&s.deform.some(v=>Math.abs(v)>1))).toBe(true);
  sample(end);expect(skeleton.slots.every(s=>Math.abs(s.color.a)<1e-6)).toBe(true);
  sample(end*.4);expect(skeleton.bones.map(b=>[b.worldX,b.worldY,b.a,b.b])).toEqual(pose);
 });
}
it('gives the ward independent orbit bones and a membrane mesh, with a dim separate back layer',()=>{
 const front=rig('guardfront');front.sample(.2);const first=front.skeleton.findBone('guardfront_wisp0')!.worldY;front.sample(1.1);
 expect(front.skeleton.findBone('guardfront_wisp0')!.worldY).not.toBe(first);
 expect(front.skeleton.findSlot('guardfront_membrane')!.getAttachment()).toBeInstanceOf(MeshAttachment);
 expect(front.skeleton.findSlot('guardback_field')!.color.a).toBe(0);
 const back=rig('guardback');back.sample(1);expect(back.skeleton.findSlot('guardback_field')!.color.a).toBeLessThan(.3);
});

it('localizes ward pressure to the left contact and restores the mesh on the next seek',async()=>{
 const {applyPaintedWardPose}=await import('./PaintedVaultFx');
 const {skeleton,sample}=rig('guardfront');sample(.4);
 const slot=skeleton.findSlot('guardfront_membrane')!,before=[...slot.deform];
 applyPaintedWardPose(skeleton,3,false,1);
 const middleLeft=2*9*2,middleRight=middleLeft+16;
 expect(slot.deform[middleLeft]-before[middleLeft]).toBeGreaterThan(30);
 expect(slot.deform[middleRight]).toBe(before[middleRight]);
 sample(.4);expect(slot.deform).toEqual(before);
 applyPaintedWardPose(skeleton,3,true,1);expect(slot.deform).toEqual(before);
});
it('consumes precisely one containment seal per remaining-count decrement',async()=>{
 const {applyPaintedContainmentPose}=await import('./PaintedVaultFx');
 const {skeleton,sample}=rig('containment');
 for(const count of [3,2,1,0]){sample(2);applyPaintedContainmentPose(skeleton,count,0,false);
  expect(skeleton.slots.filter(s=>/^containment_seal/.test(s.data.name)&&s.color.a>0)).toHaveLength(count);
 }
 sample(2);applyPaintedContainmentPose(skeleton,3,.65,false);
 expect(skeleton.slots.every(s=>s.color.a===0)).toBe(true);
});

it('retains the scene container across async loading and does not resurrect a destroyed effect',async()=>{
 const {vi}=await import('vitest');
 const {Assets}=await import('pixi.js');
 const {PaintedVaultFx}=await import('./PaintedVaultFx');
 const raw=JSON.parse(readFileSync('public/assets/showdown-v11/vault.json','utf8'));
 const atlas=new TextureAtlas('test.png\nsize: 1024,1024\nfilter: Linear,Linear\npma: false\n'+paths.map(p=>`${p}\n  bounds: 0,0,256,256\n`).join(''));
 let finish!:(value:unknown)=>void;
 const pending=new Promise(resolve=>{finish=resolve;});
 const load=vi.spyOn(Assets,'load').mockImplementation((url:unknown)=>String(url).endsWith('.atlas')?pending as never:Promise.resolve(raw));
 const active=new PaintedVaultFx('fire0'),cancelled=new PaintedVaultFx('fire1'),stable=active.rig;
 try{
  active.sample(.3);const first=active.load(),second=cancelled.load();cancelled.destroy();
  finish(atlas);await Promise.all([first,second]);
  expect(active.rig).toBe(stable);expect(active.rig.children).toHaveLength(1);expect(active.rig.visible).toBe(true);
  active.sample(.76);expect(active.rig.visible).toBe(false);
  expect(cancelled.rig.destroyed).toBe(true);expect(cancelled.rig.children).toHaveLength(0);
 }finally{load.mockRestore();active.destroy();}
});

it('lands the physical ball at the foot before the plume conceals it',()=>{
 const {skeleton,sample}=rig('ball');sample(0);
 expect(skeleton.findBone('ball_sphere')!.worldX).toBeCloseTo(-120);
 sample(.35);expect(skeleton.findBone('ball_sphere')!.worldX).toBeCloseTo(0);
 expect(skeleton.findSlot('ball_sphere')!.color.a).toBe(1);
 sample(.9);expect(skeleton.slots.every(s=>s.color.a===0)).toBe(true);
});

it('places containment hardware on the held card seal anchors',()=>{
 const {skeleton,sample}=rig('containment');sample(0);
 for(const [index,x,y] of [[0,-67,14],[1,67,14],[2,0,-91]]){
  const b=skeleton.findBone('containment_seal'+index)!;
  expect(b.x).toBe(x);expect(b.y).toBe(y);
 }
});

it('keeps Blast Burn continuous without detached edge curls',()=>{
 const {skeleton,sample}=rig('fire2');sample(.35);
 const visible=skeleton.slots.filter(s=>s.color.a>0);
 expect(visible.every(s=>(s.getAttachment() as MeshAttachment).path==='jet')).toBe(true);
 const curls=visible.filter(s=>s.data.name.startsWith('fire2_curl'));
 expect(curls).toHaveLength(0);
 expect(skeleton.findSlot('fire2_core')!.color.a).toBeGreaterThan(.75);
});
it('keeps the ward membrane above the floor at its normalized actor placement',()=>{
 const {skeleton,sample}=rig('guardfront');sample(.7);
 const slot=skeleton.findSlot('guardfront_membrane')!,mesh=slot.getAttachment() as MeshAttachment;
 const vertices=new Float32Array(mesh.worldVerticesLength);mesh.computeWorldVertices(slot,0,vertices.length,vertices,0,2);
 const ys=Array.from(vertices).filter((_,i)=>i%2===1);
 expect(Math.max(...ys)-Math.min(...ys)).toBeLessThan(250);
});

it('keeps the reward opening rigid and beneath the card while fine edge glints move',()=>{
 const {skeleton,sample}=rig('reward');
 for(const time of [.4,1.2,2.7]){
  sample(time);const aura=skeleton.findSlot('reward_aura')!;
  expect(aura.deform).toHaveLength(0);
  expect(aura.bone.scaleX).toBeLessThanOrEqual(1);expect(aura.bone.scaleY).toBeLessThanOrEqual(1);
  expect(skeleton.findSlot('reward_edge0')!.deform.length).toBeGreaterThan(0);
 }
});

it('compresses the psychic ward before a broad starburst and clears the burst before its ribbons',()=>{
 const {skeleton,sample}=rig('guardbreak');
 sample(0);const membrane=skeleton.findBone('guardbreak_membrane')!,start=membrane.scaleX;
 sample(.16);expect(membrane.scaleX).toBeLessThan(start*.5);
 expect(skeleton.findSlot('guardbreak_shock')!.color.a).toBe(0);
 sample(.32);
 const shock=skeleton.findSlot('guardbreak_shock')!;
 expect(shock.color.a).toBeGreaterThan(.9);expect(shock.bone.scaleX).toBeGreaterThanOrEqual(1);
 expect(shock.bone.worldX).toBe(0);expect(shock.bone.worldY).toBe(0);
 expect(skeleton.slots.filter(s=>s.color.a>0).every(s=>['ward','wisp','shock'].includes((s.getAttachment() as MeshAttachment).path))).toBe(true);
 sample(.38);expect(shock.color.a).toBeCloseTo(.25);
 sample(.46);expect(shock.color.a).toBeCloseTo(0,6);
 expect(skeleton.slots.some(s=>s.data.name.startsWith('guardbreak_shard')&&s.color.a>0)).toBe(true);
});
it('gives every attack a continuous wide core that contracts after its initial strike',()=>{
 for(const kind of ['fire0','fire1','fire2']){
  const {skeleton,sample}=rig(kind);sample(.2);
  expect(skeleton.slots.filter(s=>s.color.a>0)).toHaveLength(2);
  const core=skeleton.findSlot(kind+'_core')!;
  expect((core.getAttachment() as MeshAttachment).path).toBe('jet');
  expect(core.color.a).toBeGreaterThan(.85);
  const height=core.bone.scaleY;
  sample(.6);expect(core.bone.scaleY).toBeLessThan(height*.3);
 }
});
it('loops water deformations and independent rigid floating rocks without a visible seam',()=>{
 for(const [kind,duration] of [['water',3],['rocks',6]] as const){
  const {skeleton,sample}=rig(kind);sample(0);
  const active=()=>skeleton.slots.filter(s=>s.color.a>0);
  const pose=()=>active().map(s=>[s.bone.x,s.bone.y,s.bone.rotation,s.bone.scaleX,s.color.a,...s.deform]);
  const first=pose();sample(duration*.37);expect(pose()).not.toEqual(first);
  sample(duration);const last=pose();
  expect(last).toHaveLength(first.length);
  last.forEach((values,i)=>values.forEach((value,j)=>expect(value).toBeCloseTo(first[i][j],3)));
  if(kind==='rocks'){
   expect(active()).toHaveLength(5);
   for(const slot of active()){
    expect((slot.getAttachment() as MeshAttachment).path).toBe('rock');expect(slot.deform).toHaveLength(0);
    expect(slot.bone.y).toBeGreaterThanOrEqual(80);expect(slot.bone.y).toBeLessThanOrEqual(260);
   }
  }
 }
});
it('keeps the speed field at half opacity and the reward to four fine flare glints',()=>{
 const speed=rig('speed');speed.sample(.35);
 expect(speed.skeleton.findSlot('speed_lines')!.color.a).toBeCloseTo(.5);
 const reward=rig('reward');reward.sample(1);
 const edges=reward.skeleton.slots.filter(s=>s.data.name.startsWith('reward_edge'));
 expect(edges).toHaveLength(4);
 expect(edges.every(s=>(s.getAttachment() as MeshAttachment).path==='flare')).toBe(true);
});

it('freezes new ambient loops in reduced motion and clears the finite psychic flash',async()=>{
 const {PaintedVaultFx,PAINTED_VAULT_DURATIONS}=await import('./PaintedVaultFx');
 for(const kind of ['water','rocks','speed','shock'] as const){
  const fx=new PaintedVaultFx(kind);
  try{
   await fx.load();fx.sample(.1,true);expect(fx.rig.visible).toBe(true);
   const spine=fx.rig.children[0] as unknown as {skeleton:Skeleton};
   const pose=()=>spine.skeleton.bones.map(b=>[b.x,b.y,b.rotation,b.scaleX,b.scaleY]);
   const first=pose();fx.sample(.3,true);expect(pose()).toEqual(first);
   fx.sample(PAINTED_VAULT_DURATIONS[kind]*2,true);
   expect(fx.rig.visible).toBe(kind!=='shock');
   fx.sample(Number.NaN,true);expect(fx.rig.visible).toBe(false);
  }finally{fx.destroy();}
  expect(fx.rig.destroyed).toBe(true);
 }
});

it('keeps the painted ward accents sparse and round containment seals undistorted',()=>{
 const front=rig('guardfront');front.sample(0);
 const wisps=front.skeleton.slots.filter(s=>s.data.name.startsWith('guardfront_wisp'));
 expect(wisps).toHaveLength(2);
 for(const slot of wisps){
  const mesh=slot.getAttachment() as MeshAttachment;
  expect(mesh.width).toBe(32);expect(mesh.height).toBe(65);expect(slot.color.a).toBeCloseTo(.28);
 }
 const containment=rig('containment');containment.sample(0);
 for(const slot of containment.skeleton.slots.filter(s=>s.data.name.startsWith('containment_seal'))){
  const mesh=slot.getAttachment() as MeshAttachment;
  expect(mesh.width).toBe(30);expect(mesh.height).toBe(30);
 }
});
