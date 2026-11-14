import {Assets,Container} from 'pixi.js';
import {AtlasAttachmentLoader,MeshAttachment,Physics,SkeletonJson,Spine,type Skeleton,type SkeletonData,type TextureAtlas} from '@esotericsoftware/spine-pixi-v8';

export type PaintedVaultKind='fire0'|'fire1'|'fire2'|'impact'|'guardback'|'guardfront'|'guardbreak'|'summon'|'charge'|'reward'|'containment'|'ambient'|'portal'|'ball'|'link'|'water'|'rocks'|'speed'|'shock';
export const PAINTED_VAULT_DURATIONS:Record<PaintedVaultKind,number>={fire0:.76,fire1:.76,fire2:.76,impact:.8,guardback:4,guardfront:4,guardbreak:1.4,summon:1.5,charge:1.2,reward:3,containment:6,ambient:12,portal:6,ball:1.5,link:3,water:3,rocks:6,speed:.7,shock:.55};
const loops=new Set<PaintedVaultKind>(['guardback','guardfront','containment','ambient','portal','link','water','rocks','speed']);
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
let loadedData:Promise<SkeletonData>|undefined;
function loadData(){
 if(!loadedData)loadedData=Promise.all([
  Assets.load<TextureAtlas>('/assets/showdown-v11/vault.atlas'),
  Assets.load<Record<string,unknown>>('/assets/showdown-v11/vault.json'),
 ]).then(([atlas,json])=>new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(json)).catch(error=>{loadedData=undefined;throw error;});
 return loadedData;
}

/** Compresses the painted membrane at its left contact point, leaving the opposite edge intact. */
export function applyPaintedWardPose(skeleton:Skeleton,remaining:number,reduced:boolean,hitPulse=0){
 const strength=clamp(remaining/3),hit=reduced?0:clamp(hitPulse);
 for(const slot of skeleton.slots){
  if(!slot.data.name.startsWith('guardfront_')&&!slot.data.name.startsWith('guardback_'))continue;
  slot.color.a*=.48+strength*.52;
  if(slot.data.name==='guardfront_membrane'){
   const attachment=slot.getAttachment();
   if(attachment instanceof MeshAttachment&&hit>0){
    const vertices=attachment.vertices;
    // Spine stores unweighted deforms as absolute local vertices after timeline application.
    if(slot.deform.length===0)slot.deform=Array.from(vertices);
    for(let i=0;i<vertices.length;i+=2){
     const x=vertices[i],y=vertices[i+1];
     const contact=Math.pow(clamp((102-x)/204),2)*Math.exp(-y*y/(88*88));
     slot.deform[i]+=hit*34*contact;
     slot.deform[i+1]+=hit*y*.12*contact;
    }
   }
  }
  if(slot.data.name.startsWith('guardfront_wisp'))slot.color.a*=reduced?.35:1;
 }
}

export function applyPaintedContainmentPose(skeleton:Skeleton,remaining:number,release:number,reduced:boolean,hitPulse=0){
 const count=Math.max(0,Math.min(3,Math.floor(remaining))),fade=1-clamp(release/.65);
 for(const slot of skeleton.slots){
  if(!slot.data.name.startsWith('containment_'))continue;
  slot.color.a*=fade;
  const match=/^containment_seal([0-2])$/.exec(slot.data.name);
  if(match){
   if(Number(match[1])>=count)slot.color.a=0;
   const b=slot.bone,spread=reduced?0:clamp(release/.5);
   b.x+=b.data.x*spread*.4;b.y+=b.data.y*spread*.3;
   if(!reduced){b.scaleX*=1+clamp(hitPulse)*.12;b.scaleY*=1+clamp(hitPulse)*.12;}
  }
 }
}

/** A stable scene container with shared, externally loaded native Spine raster data. */
export class PaintedVaultFx{
 readonly rig=new Container();
 private spine?:Spine;
 private loading?:Promise<void>;
 private dead=false;
 private lastPose?:()=>void;
 constructor(readonly kind:PaintedVaultKind){this.rig.eventMode='none';this.rig.visible=false;}
 load():Promise<void>{
  if(this.dead)return Promise.resolve();
  if(!this.loading)this.loading=loadData().then(skeletonData=>{
   if(this.dead)return;
   this.spine=new Spine({skeletonData,autoUpdate:false});
   this.spine.eventMode='none';this.spine.state.setAnimation(0,this.kind,false);
   this.rig.addChild(this.spine);this.lastPose?.();
  }).catch(error=>{this.loading=undefined;throw error;});
  return this.loading;
 }
 private pose(time:number,reduced:boolean){
  const spine=this.spine;if(!spine)return;
  const duration=PAINTED_VAULT_DURATIONS[this.kind];
  spine.skeleton.setToSetupPose();
  spine.state.getCurrent(0)!.trackTime=reduced?duration*.4:loops.has(this.kind)?((time%duration)+duration)%duration:time;
  spine.update(0);
 }
 sample(age:number,reduced=false){
  this.lastPose=()=>this.sample(age,reduced);
  const duration=PAINTED_VAULT_DURATIONS[this.kind],loop=loops.has(this.kind);
  this.rig.visible=!this.dead&&!!this.spine&&Number.isFinite(age)&&age>=0&&(loop||age<duration);
  if(!this.rig.visible)return;
  this.rig.alpha=reduced&&!loop?Math.min(clamp(age/.08),clamp((duration-age)/.16)):1;
  this.pose(age,reduced);
 }
 sampleGuard(time:number,remaining:number,reduced=false,hitPulse=0){
  this.lastPose=()=>this.sampleGuard(time,remaining,reduced,hitPulse);
  this.rig.visible=!this.dead&&!!this.spine&&Number.isFinite(time)&&remaining>0;
  if(!this.rig.visible)return;
  this.rig.alpha=1;this.pose(time,reduced);
  if(this.kind==='containment')applyPaintedContainmentPose(this.spine!.skeleton,remaining,0,reduced,hitPulse);
  else applyPaintedWardPose(this.spine!.skeleton,remaining,reduced,hitPulse);
  this.spine!.skeleton.updateWorldTransform(Physics.update);
 }
 sampleContainment(time:number,remaining:number,release=0,reduced=false,hitPulse=0){
  this.lastPose=()=>this.sampleContainment(time,remaining,release,reduced,hitPulse);
  this.rig.visible=!this.dead&&!!this.spine&&Number.isFinite(time)&&release<.65;
  if(!this.rig.visible)return;
  this.rig.alpha=1;this.pose(time,reduced);
  applyPaintedContainmentPose(this.spine!.skeleton,remaining,release,reduced,hitPulse);
  this.spine!.skeleton.updateWorldTransform(Physics.update);
 }
 destroy(){
  if(this.dead)return;this.dead=true;this.lastPose=undefined;
  // Skeleton/atlas textures are shared by every instance and remain in Assets.
  this.rig.destroy({children:true});this.spine=undefined;
 }
}
