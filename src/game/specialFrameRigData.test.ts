import {expect,it} from 'vitest';
import {AnimationState,AnimationStateData,AtlasAttachmentLoader,MeshAttachment,Physics,Skeleton,SkeletonJson,TextureAtlas} from '@esotericsoftware/spine-core';
import {SPECIAL_FRAME_ATLAS,buildSpecialFrameRigJson} from './specialFrameRigData';
it.each([false,true])('loops native Spine highlights around the card without entering the artwork (low=%s)',low=>{
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SPECIAL_FRAME_ATLAS))).readSkeletonData(buildSpecialFrameRigJson('fire','Double rare',low));
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

function loadFrame(kind: 'fire'|'water'|'electric'|'leaf'|'ice'|'dark'|'psychic'|'fairy'|'dragon'|'metal'|'ground'|'wind',rarity='Double rare',low=false){
 const data=new SkeletonJson(new AtlasAttachmentLoader(new TextureAtlas(SPECIAL_FRAME_ATLAS))).readSkeletonData(buildSpecialFrameRigJson(kind,rarity,low));
 const skeleton=new Skeleton(data),state=new AnimationState(new AnimationStateData(data));state.setAnimation(0,'surround',true);
 const pose=(time:number)=>{state.getCurrent(0)!.trackTime=time;state.apply(skeleton);skeleton.updateWorldTransform(Physics.none);return skeleton.slots.filter(slot=>slot.getAttachment() instanceof MeshAttachment).map(slot=>{const mesh=slot.getAttachment() as MeshAttachment,points=new Float32Array(mesh.worldVerticesLength);mesh.computeWorldVertices(slot,0,points.length,points,0,2);return [...points];});};
 return {data,skeleton,pose};
}
it.each(['fire','water','electric','leaf','ice','dark','psychic','fairy','dragon','metal','ground','wind'] as const)('%s has substantial native mesh motion that loops seamlessly',kind=>{
 const {data,pose}=loadFrame(kind,'Special illustration rare'),start=pose(0),initial=start.flat(),later=pose(.8);
 expect(start.length).toBeGreaterThanOrEqual(8);
 expect(initial.every(Number.isFinite)).toBe(true);
 expect(Math.max(...later.flat().map((v,i)=>Math.abs(v-initial[i])))).toBeGreaterThan(12);
 const end=pose(data.findAnimation('surround')!.duration);
 expect(Math.max(...end.flat().map((v,i)=>Math.abs(v-initial[i])))).toBeLessThan(.01);
});
it('gives rarer cards richer effects and bounds the low-quality rendering cost',()=>{
 const basic=loadFrame('water','Double rare'),ultra=loadFrame('water','Ultra Rare'),secret=loadFrame('water','Secret Rare'),low=loadFrame('water','Secret Rare',true);
 const vertices=(rig:ReturnType<typeof loadFrame>)=>rig.pose(0).flat().length/2;
 expect(vertices(ultra)).toBeGreaterThan(vertices(basic));expect(vertices(secret)).toBeGreaterThan(vertices(ultra));
 expect(vertices(low)).toBeLessThan(vertices(secret)*.65);expect(vertices(secret)).toBeLessThan(1600);
});
it('uses different elemental silhouettes, not only different tints',()=>{
 const fire=loadFrame('fire').pose(.7).flat(),water=loadFrame('water').pose(.7).flat(),electric=loadFrame('electric').pose(.7).flat();
 expect(fire).not.toEqual(water);expect(water).not.toEqual(electric);
});
it('keeps electric mote triangles consistently wound without filling its notches',async()=>{
 const {frameMote}=await import('./specialFrameGeometry');
 for(const time of [0,.7,1.9,3.1]){
  const {vertices,triangles}=frameMote('electric',0,6,time);
  for(let i=0;i<triangles.length;i+=3){const [a,b,c]=triangles.slice(i,i+3).map(index=>[vertices[index*2],vertices[index*2+1]]);expect((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])).toBeGreaterThan(0);}
 }
});
