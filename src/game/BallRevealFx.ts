import {Texture} from 'pixi.js';
import {Spine,SpineTexture,TextureAtlas,AtlasAttachmentLoader,SkeletonJson,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {BALL_FX_ATLAS,buildBallFxRigJson} from './ballFxRigData';
const data=new Map<boolean,SkeletonData>();let atlas:TextureAtlas;
/** Small reusable cel-effect atlas; movement/opacity is animated by actual Spine tracks. */
export function createBallRevealFx(low=false){
 if(!atlas){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d')!;c.fillStyle='#fff';
  c.beginPath();c.moveTo(0,16);c.bezierCurveTo(55,7,150,5,240,16);c.bezierCurveTo(150,27,55,25,0,16);c.fill();
  c.beginPath();for(let i=0;i<=32;i++){const a=-1.35+i/32*2.7,x=64+Math.cos(a)*60,y=104+Math.sin(a)*60;i?c.lineTo(x,y):c.moveTo(x,y);}for(let i=32;i>=0;i--){const a=-1.35+i/32*2.7,r=60-Math.sin(i/32*Math.PI)*16;c.lineTo(64+Math.cos(a)*r,104+Math.sin(a)*r);}c.closePath();c.fill();
  c.beginPath();[[168,41],[173,66],[198,72],[173,77],[168,103],[163,77],[137,72],[163,66]].forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
  const glow=c.createRadialGradient(184,160,0,184,160,46);glow.addColorStop(0,'#ffffffff');glow.addColorStop(.15,'#ffffffdd');glow.addColorStop(.4,'#ffffff55');glow.addColorStop(1,'#ffffff00');c.fillStyle=glow;c.fillRect(136,112,96,96);
  atlas=new TextureAtlas(BALL_FX_ATLAS);atlas.pages[0].setTexture(SpineTexture.from(Texture.from(canvas).source));
 }
 if(!data.has(low))data.set(low,new SkeletonJson(new AtlasAttachmentLoader(atlas)).readSkeletonData(buildBallFxRigJson(low)));
 const rig=new Spine({skeletonData:data.get(low)!,autoUpdate:false});rig.eventMode='none';rig.visible=false;return rig;
}
