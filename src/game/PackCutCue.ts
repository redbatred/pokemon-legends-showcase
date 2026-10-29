import {Container,Graphics,Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {SCISSOR_ATLAS,buildScissorRigJson} from './scissorRigData';
import {packCutPose,projectPackPoint} from './packCutGeometry';
import {packSeam} from './packTearGeometry';
let data:SkeletonData|undefined;
function makeRig(){
 if(!data){
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=192;const c=canvas.getContext('2d')!;
  for(let i=0;i<2;i++){
   c.save();c.translate(i*160+80,80);if(i===1)c.scale(1,-1);c.lineJoin='round';c.lineCap='round';
   const metal=c.createLinearGradient(0,-8,0,10);metal.addColorStop(0,'#f1fbff');metal.addColorStop(.45,i?'#83a9c0':'#c3e4f3');metal.addColorStop(.58,'#50758e');metal.addColorStop(1,'#d3f0fa');
   c.beginPath();c.moveTo(-14,7);c.lineTo(-1,-6);c.quadraticCurveTo(37,-6,72,-1);c.lineTo(73,0);c.lineTo(5,4);c.lineTo(-14,10);c.closePath();c.fillStyle=metal;c.fill();c.strokeStyle='#092c4b';c.lineWidth=3;c.stroke();
   c.beginPath();c.moveTo(8,-3);c.lineTo(62,-2);c.strokeStyle='#f0fcff';c.lineWidth=1.8;c.stroke();
   c.beginPath();c.ellipse(-35,17,18,12,-.28,0,Math.PI*2);c.strokeStyle='#092c4b';c.lineWidth=10;c.stroke();c.strokeStyle=i?'#235b7c':'#43819e';c.lineWidth=6;c.stroke();c.strokeStyle=i?'#82afc4':'#b4d6e3';c.lineWidth=1.5;c.stroke();
   c.restore();
  }
  c.fillStyle='#0a304d';c.beginPath();c.arc(16,176,8,0,Math.PI*2);c.fill();c.fillStyle='#9bdcf5';c.beginPath();c.arc(16,176,5,0,Math.PI*2);c.fill();c.strokeStyle='#285c82';c.lineWidth=2;c.beginPath();c.moveTo(13,179);c.lineTo(19,173);c.stroke();
  const atlas=new TextureAtlas(SCISSOR_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));data=new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(buildScissorRigJson());
 }
 const rig=new Spine({skeletonData:data,autoUpdate:false});rig.state.setAnimation(0,'snip',true);rig.update(0);return rig;
}
/** The pack mesh sits between these two Spine layers, exactly between the blades. */
export class PackCutCue {
 back=new Container();front=new Container();private bladeBack=makeRig();private bladeFront=makeRig();private line=new Graphics();private alpha=0;
 constructor(){this.back.addChild(this.bladeBack);this.front.addChild(this.line,this.bladeFront);this.back.eventMode=this.front.eventMode='none';this.back.visible=this.front.visible=false;}
 update(dt:number,time:number,yaw:number,pitch:number,visible:boolean,reduced:boolean,drag=0){
  this.alpha+=(Number(visible)-this.alpha)*Math.min(1,dt*(visible?10:14));
  this.back.visible=this.front.visible=this.alpha>.005;this.back.alpha=this.front.alpha=this.alpha;if(!this.front.visible)return;
  const pose=packCutPose(reduced?0:time,yaw,pitch);
  for(const rig of [this.bladeBack,this.bladeFront]){rig.position.set(pose.x,pose.y);rig.rotation=pose.angle;rig.scale.set(pose.scale);if(!reduced)rig.update(dt);}
  this.bladeBack.skeleton.findSlot('front')!.color.a=0;this.bladeBack.skeleton.findSlot('pivot')!.color.a=0;this.bladeFront.skeleton.findSlot('back')!.color.a=0;
  const g=this.line.clear(),offset=reduced?0:(time*9)%16;
  for(let x=-111+offset;x<112;x+=16){const end=Math.min(112,x+8),points:number[]=[];for(let xx=x;xx<=end;xx+=2){const p=projectPackPoint(xx,-210.5+packSeam((xx+115)/230),yaw,pitch);points.push(p.x,p.y);}if(points.length<4)continue;for(const [width,color,alpha] of [[4,0x082e50,.88],[1.7,0xf1d47c,.9]]){g.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)g.lineTo(points[i],points[i+1]);g.stroke({width,color,alpha,cap:'round',join:'round'});}}
  if(drag>0){for(const [width,color] of [[5,0x082e50],[2.5,0xffe678]]){for(let i=0;i<=40;i++){const x=115-230*drag*i/40,p=projectPackPoint(x,-210.5+packSeam((x+115)/230),yaw,pitch);i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y);}g.stroke({width,color,cap:'round'});}}
 }
 hide(){this.alpha=0;this.back.visible=this.front.visible=false;}
}
