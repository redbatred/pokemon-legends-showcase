import {Container, Texture} from 'pixi.js';
import {Spine, SpineTexture, TextureAtlas, AtlasAttachmentLoader, SkeletonJson, type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {psychicVaultGeometry, type VaultStage} from './psychicVaultGeometry';

export const PSYCHIC_VAULT_FX_DURATION=12;
export const PSYCHIC_VAULT_FX_ATLAS='vault.png\nsize: 1024,512\nfilter: Linear,Linear\npma: false\nrotor\n  bounds: 0,0,384,384\ncrystal\n  bounds: 400,0,80,160\ncore\n  bounds: 496,0,128,128\nray\n  bounds: 640,0,128,384\ncollar\n  bounds: 784,0,224,112\n';
export type PsychicVaultFxKind='reactor'|'pylon';
const cache=new Map<PsychicVaultFxKind,SkeletonData>();
let atlas:TextureAtlas|undefined;

/** Small authored material atlas; motion comes from real Spine bones and timelines. */
function getAtlas(){
 if(atlas)return atlas;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
 const c=canvas.getContext('2d')!;
 const poly=(p:number[],fill:string,stroke?:string)=>{c.beginPath();for(let i=0;i<p.length;i+=2)i?c.lineTo(p[i],p[i+1]):c.moveTo(p[i],p[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}};
 // Eight substantial machined segments, dark inner bevel, champagne outer bevel.
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4+.045,b=(i+1)*Math.PI/4-.045;
  c.beginPath();c.arc(192,192,180,a,b);c.arc(192,192,158,b,a,true);c.closePath();
  const metal=c.createLinearGradient(24,20,360,370);metal.addColorStop(0,'#a89c89');metal.addColorStop(.24,'#4a4a5c');metal.addColorStop(.6,'#252c40');metal.addColorStop(1,'#756b77');c.fillStyle=metal;c.fill();
  c.strokeStyle='#141d2d';c.lineWidth=3;c.stroke();
  c.beginPath();c.arc(192,192,179,a+.006,b-.006);c.strokeStyle='#c2ad8f';c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(192,192,161,a+.035,b-.035);c.strokeStyle='#c2a4ff';c.lineWidth=3;c.stroke();
  const m=(a+b)/2;c.save();c.translate(192+Math.cos(m)*170,192+Math.sin(m)*170);c.rotate(m);c.fillStyle='#b0dce6';c.fillRect(-3,-2,6,4);c.restore();
 }
 // Mineral faces retain a solid silhouette while hovering over their sockets.
 poly([440,5,408,57,417,129,440,157,470,106,466,40],'#595881','#b6b5e1');
 poly([440,5,408,57,417,129,440,157,433,66],'#9895c7');
 poly([440,5,466,40,470,106,440,157,447,65],'#393c61');
 poly([440,5,433,66,440,157,447,65],'#eee3ff');
 poly([408,57,433,66,466,40,447,65],'#c5b9e8');
 c.beginPath();c.moveTo(440,18);c.lineTo(443,60);c.lineTo(440,135);c.strokeStyle='#d9fbff';c.lineWidth=2;c.stroke();
 const core=c.createRadialGradient(560,64,3,560,64,61);core.addColorStop(0,'#effcff');core.addColorStop(.12,'#9de9f6');core.addColorStop(.23,'#a3b5ffbb');core.addColorStop(.52,'#8d7ddd38');core.addColorStop(1,'#7c66d000');c.fillStyle=core;c.fillRect(496,0,128,128);
 // Layered cone fades along its length and across its width.
 for(let i=0;i<20;i++){
  const q=i/20,spread=60*(1-q*.65),g=c.createLinearGradient(0,0,0,384);g.addColorStop(0,'#c0afff00');g.addColorStop(.35,`rgba(190,174,255,${.008+q*.003})`);g.addColorStop(1,`rgba(211,206,255,${.014+q*.006})`);
  c.beginPath();c.moveTo(704-spread,0);c.lineTo(704+spread,0);c.lineTo(710,384);c.lineTo(698,384);c.closePath();c.fillStyle=g;c.fill();
 }
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3+.08,b=(i+1)*Math.PI/3-.08;
  c.beginPath();c.ellipse(896,56,106,38,0,a,b);c.strokeStyle='#191e31';c.lineWidth=11;c.stroke();
  c.beginPath();c.ellipse(896,53,106,38,0,a,b);c.strokeStyle='#a69bac';c.lineWidth=3;c.stroke();
  c.beginPath();c.ellipse(896,57,103,35,0,a+.03,b-.03);c.strokeStyle='#bca8fc';c.lineWidth=2;c.stroke();
 }
 atlas=new TextureAtlas(PSYCHIC_VAULT_FX_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));return atlas;
}

export function buildPsychicVaultFx(kind:PsychicVaultFxKind){
 const bones:Record<string,unknown>[]=[{name:'root'}],slots:Record<string,unknown>[]=[],attachments:Record<string,Record<string,unknown>>={},motion:Record<string,unknown>={},alpha:Record<string,unknown>={};
 const add=(name:string,path:string,w:number,h:number,x=0,y=0,rotation=0)=>{bones.push({name,parent:'root',x,y,rotation});slots.push({name,bone:name,attachment:name});attachments[name]={[name]:{path,width:w,height:h}};};
 if(kind==='reactor'){
  for(let i=0;i<3;i++){
   const name='shaft'+i;add(name,'ray',140+i*24,330,i===1?-55:i===2?55:0,-120,180+(i===1?-14:i===2?14:0));
   motion[name]={rotate:[{value:-2},{time:6,value:2},{time:12,value:-2}],scale:[{x:.82,y:1},{time:6,x:1.1,y:1},{time:12,x:.82,y:1}]};
   alpha[name]={alpha:[{value:.22+i*.06},{time:6,value:.44+i*.05},{time:12,value:.22+i*.06}]};
  }
  add('rotor','rotor',360,360);motion.rotor={rotate:[{value:0},{time:12,value:45}]};
  add('innerRotor','rotor',275,275);motion.innerRotor={rotate:[{value:22.5},{time:12,value:-22.5}]};alpha.innerRotor={alpha:[{value:.72},{time:6,value:.95},{time:12,value:.72}]};
  add('heart','core',108,108);motion.heart={scale:[{x:.8,y:.8},{time:6,x:1.1,y:1.1},{time:12,x:.8,y:.8}]};alpha.heart={alpha:[{value:.7},{time:6,value:1},{time:12,value:.7}]};
 }else{
  add('containmentRay','ray',112,280,0,136);alpha.containmentRay={alpha:[{value:.38},{time:6,value:.66},{time:12,value:.38}]};
  add('rearCollar','collar',150,75,0,108);motion.rearCollar={scale:[{x:1,y:.8},{time:6,x:.82,y:1},{time:12,x:1,y:.8}]};
  for(let i=0;i<3;i++){
   const name='fragment'+i;add(name,'crystal',i===0?54:27,i===0?108:54,0,104);
   const frames=[],scales=[];
   for(let f=0;f<=24;f++){
    const a=(f/24+i/3)*Math.PI*2;
    frames.push({time:f*.5,x:i===0?Math.sin(a)*4:Math.cos(a)*(i===1?47:42),y:i===0?Math.sin(a)*9:Math.sin(a)*18+(i===1?20:-16)});
    const s=i===0?1:.86+Math.sin(a)*.14;scales.push({time:f*.5,x:s,y:s});
   }
   motion[name]={translate:frames,scale:scales,rotate:[{value:i===0?-3:-14},{time:6,value:i===0?3:14},{time:12,value:i===0?-3:-14}]};
  }
  add('frontCollar','collar',130,65,0,46);motion.frontCollar={translate:[{y:0},{time:6,y:5},{time:12,y:0}]};
  add('socketCore','core',110,55,0,16);alpha.socketCore={alpha:[{value:.5},{time:6,value:.9},{time:12,value:.5}]};
 }
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{ambient:{bones:motion,slots:alpha}}};
}

export class PsychicVaultFx {
 readonly root=new Container();
 private rigs:Spine[]=[];
 constructor(){
  this.root.eventMode='none';
  for(const kind of ['reactor','pylon','pylon'] as const){
   if(!cache.has(kind))cache.set(kind,new SkeletonJson(new AtlasAttachmentLoader(getAtlas())).readSkeletonData(buildPsychicVaultFx(kind)));
   const rig=new Spine({skeletonData:cache.get(kind)!,autoUpdate:false});rig.eventMode='none';rig.state.setAnimation(0,'ambient',true);rig.update(0);this.rigs.push(rig);this.root.addChild(rig);
  }
 }
 resize(w:number,h:number,stage:VaultStage){
  const g=psychicVaultGeometry(w,h,stage),cx=w/2;
  this.rigs[0].position.set(cx,g.doorTop+g.doorWidth*.46);this.rigs[0].scale.set(g.doorWidth*.91/384);
  for(let i=1;i<3;i++){this.rigs[i].position.set(cx+(i===1?-1:1)*g.pylonOffset,g.horizon+stage.stageWidth*.035-g.crystalSize*.20);this.rigs[i].scale.set(Math.min(g.crystalSize/100,(w/2-g.pylonOffset-4)/75));}
 }
 sample(time:number,reduced:boolean,impact:number){
  for(let i=0;i<this.rigs.length;i++){
   const rig=this.rigs[i];rig.skeleton.setToSetupPose();rig.state.getCurrent(0)!.trackTime=reduced?0:((time+i*2.3)%12+12)%12;rig.update(0);rig.alpha=.94+Math.min(.06,impact*.06);
  }
 }
}
