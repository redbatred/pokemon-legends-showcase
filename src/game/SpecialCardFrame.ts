import {Container,Graphics,Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {SPECIAL_FRAME_ATLAS,buildSpecialFrameRigJson} from './specialFrameRigData';
import type {PowerKind} from './powerProfiles';
let atlas:TextureAtlas|undefined;const data=new Map<boolean,SkeletonData>();
const colors:Record<PowerKind,number>={fire:0xff8297,water:0x77dbff,electric:0xffe983,leaf:0x87efb1,psychic:0xe3a2ff,fairy:0xffb1e0,dark:0xc7a3fa,dragon:0x8ce9d4,ice:0xb4f6ff,metal:0xc7e9ff,ground:0xf3dca6,wind:0xd0eeff};
function frameData(low:boolean){
 if(!atlas){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;
  c.strokeStyle='#ffffff';c.lineWidth=3;c.lineJoin='round';c.beginPath();c.moveTo(52,12);c.lineTo(27,12);c.quadraticCurveTo(12,12,12,27);c.lineTo(12,52);c.stroke();
  c.globalAlpha=.42;c.lineWidth=9;c.stroke();c.globalAlpha=1;c.fillStyle='#fff';
  c.beginPath();c.moveTo(96,3);c.quadraticCurveTo(101,27,125,32);c.quadraticCurveTo(101,37,96,61);c.quadraticCurveTo(91,37,67,32);c.quadraticCurveTo(91,27,96,3);c.fill();
  const g=c.createRadialGradient(64,128,0,64,128,62);g.addColorStop(0,'#ffffff');g.addColorStop(.16,'#ffffffcc');g.addColorStop(.42,'#ffffff44');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.fillRect(0,64,128,128);
  atlas=new TextureAtlas(SPECIAL_FRAME_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));
 }
 if(!data.has(low))data.set(low,new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(buildSpecialFrameRigJson(low)));
 return data.get(low)!;
}
/** Shared atlas, independent Spine tracks, and no light drawn across the card's text. */
export class SpecialCardFrame extends Container {
 private rig:Spine;
 constructor(width:number,height:number,kind:PowerKind,low=false,reduced=false){
  super();this.eventMode='none';const color=colors[kind];
  const edge=new Graphics().roundRect(-width/2-2,-height/2-2,width+4,height+4,Math.max(3,width*.045)).stroke({color,width:1.2,alpha:.7});this.addChild(edge);
  this.rig=new Spine({skeletonData:frameData(low),autoUpdate:false});this.rig.scale.set(width/312,height/435);
  for(const slot of this.rig.skeleton.slots)if(!slot.data.name.startsWith('spark')||Number(slot.data.name.slice(5))%(low?2:4)!==0){slot.color.r=(color>>16&255)/255;slot.color.g=(color>>8&255)/255;slot.color.b=(color&255)/255;}
  this.rig.state.setAnimation(0,'surround',true);this.rig.update(reduced?0:Math.random()*4.8);this.addChild(this.rig);
 }
 update(dt:number){this.rig.update(dt);}
 override destroy(){super.destroy({children:true});}
}
