import {Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,Physics,type SkeletonData,type Skeleton} from '@esotericsoftware/spine-pixi-v8';
import {clamp} from './showdownModel';
export const VAULT_CARD_ATLAS='vault-card.png\nsize: 512,512\nfilter: Linear,Linear\npma: false\nrail\n  bounds: 0,0,256,256\nseal\n  bounds: 272,0,96,96\nglint\n  bounds: 384,0,64,64\nclasp\n  bounds: 272,112,96,128\n';
let atlas:TextureAtlas,data:SkeletonData;
function getAtlas(){
 if(atlas)return atlas;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d',{willReadFrequently:true})!;
 for(const [radius,width,color] of [[115,8,'#a38ad433'],[115,2,'#d3bcffcc'],[105,1,'#d0b89177']] as const){c.beginPath();c.ellipse(128,128,radius,radius,0,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.save();c.translate(128+Math.cos(a)*115,128+Math.sin(a)*115);c.rotate(a);c.fillStyle=i%3?'#b397d0':'#f5dfb0';c.fillRect(-4,-1,i%3?5:9,2);c.restore();}
 // The three lock emblems share the Poké Ball language of the actual trigger badges.
 const x=320,y=48;for(const [r,color] of [[44,'#15192f'],[40,'#c7a576'],[35,'#44315e'],[29,'#a58bda']] as const){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 c.beginPath();c.arc(x,y,28,Math.PI,Math.PI*2);c.closePath();c.fillStyle='#ddd4fa';c.fill();
 c.strokeStyle='#32264d';c.lineWidth=7;c.beginPath();c.moveTo(x-30,y);c.lineTo(x+30,y);c.stroke();
 for(const [r,color] of [[13,'#30274c'],[9,'#fff6da'],[4,'#c29cff']] as const){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
 c.beginPath();c.moveTo(416,1);c.lineTo(421,27);c.lineTo(447,32);c.lineTo(421,37);c.lineTo(416,63);c.lineTo(411,37);c.lineTo(385,32);c.lineTo(411,27);c.closePath();c.fillStyle='#fff';c.fill();
 c.beginPath();c.moveTo(285,123);c.lineTo(319,117);c.lineTo(351,123);c.lineTo(351,141);c.lineTo(329,135);c.lineTo(329,214);c.lineTo(351,207);c.lineTo(351,225);c.lineTo(320,235);c.lineTo(285,225);c.lineTo(285,207);c.lineTo(309,214);c.lineTo(309,135);c.lineTo(285,141);c.closePath();c.fillStyle='#b6a3d0';c.fill();c.strokeStyle='#f9e6ba';c.lineWidth=2;c.stroke();
 atlas=new TextureAtlas(VAULT_CARD_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));return atlas;
}
export function buildVaultCardFx(){
 const bones:any[]=[{name:'root'}],slots:any[]=[],attachments:any={},motion:any={};
 const add=(name:string,path:string,w:number,h:number,x=0,y=0)=>{bones.push({name,parent:'root',x,y});slots.push({name,bone:name,attachment:name,color:'ffffffff'});attachments[name]={[name]:{path,width:w,height:h}};};
 for(let i=0;i<2;i++){const n='rail'+i;add(n,'rail',150,150);motion[n]={rotate:[{value:i*40},{time:3,value:i*40+(i?-180:180)},{time:6,value:i*40+(i?-360:360)}],scale:[{x:1,y:i?.42:1.22},{time:1.5,x:i?.7:1,y:i?1:.8},{time:3,x:1,y:i?.42:1.22},{time:4.5,x:i?.7:1,y:i?1:.8},{time:6,x:1,y:i?.42:1.22}]};}
 const points=[[-67,14],[67,14],[0,-91]];
 for(let i=0;i<3;i++){
  const n='seal'+i,[x,y]=points[i];add(n,'seal',27,27,x,y);
  motion[n]={scale:[{x:1,y:1},{time:3,x:1.07,y:1.07},{time:6,x:1,y:1}],rotate:[{value:-4},{time:3,value:4},{time:6,value:-4}]};
  const g='glint'+i;add(g,'glint',10,10,x-8,y+8);motion[g]={scale:[{x:.3,y:.3},{time:1+i*.4,x:1,y:1},{time:2.8+i*.4,x:.3,y:.3},{time:6,x:.3,y:.3}]};
 }
 for(const side of [-1,1]){const n='clasp'+side;add(n,'clasp',16,37,side*49,0);}
 return {skeleton:{spine:'4.2.22'},bones,slots,skins:[{name:'default',attachments}],animations:{hold:{bones:motion}}};
}
export function applyVaultCardPose(skeleton:Skeleton,remaining:number,release:number,reduced:boolean,hit:number){
 for(const slot of skeleton.slots){
  const match=/^(?:seal|glint)([0-2])$/.exec(slot.data.name);
  const visible=!match||Number(match[1])<remaining;
  slot.color.a=visible?(1-clamp(release/.55)):0;
  if(slot.data.name.startsWith('rail'))slot.color.a*=reduced?.22:.56;
  if(slot.data.name.startsWith('glint')&&reduced)slot.color.a=0;
  if(slot.data.name.startsWith('clasp')){const b=slot.bone,side=b.data.x>0?1:-1;b.x=b.data.x+side*release*55;slot.color.a=1-clamp(release*2);}
  if(match&&!reduced){slot.bone.scaleX*=1+hit*.18;slot.bone.scaleY*=1+hit*.18;}
 }
}
/** Native Spine containment hardware follows the sealed card, then opens once. */
export class VaultCardFx {
 readonly rig:Spine;
 constructor(){data??=new SkeletonJson(new AtlasAttachmentLoader(getAtlas())).readSkeletonData(buildVaultCardFx());this.rig=new Spine({skeletonData:data,autoUpdate:false});this.rig.eventMode='none';this.rig.state.setAnimation(0,'hold',false);}
 sample(time:number,remaining:number,release:number,reduced:boolean,hit=0){
  this.rig.visible=release<.65;if(!this.rig.visible)return;
  this.rig.skeleton.setToSetupPose();this.rig.state.getCurrent(0)!.trackTime=reduced?0:((time%6)+6)%6;this.rig.update(0);
  applyVaultCardPose(this.rig.skeleton,remaining,release,reduced,hit);this.rig.skeleton.updateWorldTransform(Physics.update);
 }
}
