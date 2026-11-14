import {convergeOutlet} from './energyConvergence';
import {createCaptureMaterial} from './captureMaterial';
import {AlphaFilter,Container,ColorMatrixFilter,Sprite} from 'pixi.js';
import {BlendMode,Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {smooth,mix} from './model';
type Point={x:number;y:number};
type Meta={outlets:number[][];cell:number[];first:number[];last:number[]|null;reference:number[]};
export const TRANSFER_DURATION=1.25;
/** Premultiplied cross-dissolves between the live pose and native Spine drawings.
 * The isolated layer adds weighted pixels before compositing onto the scene;
 * ordinary alpha-over would make the overlapping body transparent mid-blend. */
export function createEnergyTransfer(data:SkeletonData,sprite:Sprite,species:string,meta:Meta,flowData:SkeletonData){
 const container=new Container(),body=new Container(),live=new Sprite(sprite.texture);
 const frames=[new Spine({skeletonData:data,autoUpdate:false}),new Spine({skeletonData:data,autoUpdate:false})];
 for(const slot of data.slots)slot.blendMode=BlendMode.Additive;

 const a0=meta.first,r0=meta.reference,cell0=meta.cell,ratio=(r0[3]-r0[1])/(a0[3]-a0[1]);
 const mapping=[cell0[0]*ratio/1024,cell0[1]*ratio/1024,((r0[0]+r0[2])/2-(a0[0]+a0[2])/2*ratio)/1024,((r0[1]+r0[3])/2-(a0[1]+a0[3])/2*ratio)/1024];
 const artMaterials=frames.map(frame=>{const material=createCaptureMaterial(species,mapping,sprite.texture);frame.filters=[material.filter];return material;});
 live.blendMode='add';body.filters=[new AlphaFilter({alpha:1})];body.addChild(live,...frames);
 const tail=new Spine({skeletonData:flowData,autoUpdate:false}),hue=new ColorMatrixFilter();
 if(species==='lugia')hue.hue(-65,false);tail.filters=[hue];container.addChild(body,tail);container.eventMode='none';sprite.filters=[];
 function sample(mode:'none'|'capture'|'release',age:number,actor:Container,target:Point,_chest:Point,_anchors:Point[],_paths:Point[][]){
  container.visible=mode!=='none';sprite.visible=true;sprite.alpha=1;if(!container.visible)return;
  // Match the first attachment while it is stationary, then spend most of the
  // interval on the anatomical conversion drawings. Escape reverses this map.
  const time=mode==='release'?TRANSFER_DURATION-age:age;
  const handoff=smooth((time-.025)/.15);
  const raw=15*smooth((time-.1)/1.15);
  for(const material of artMaterials)material.sample(time,raw);
  const p=raw/15,fade=1-smooth((p-.94)/.06),fa=Math.floor(raw),fb=Math.min(15,fa+1),fraction=raw-fa;
  sprite.visible=false;
  live.texture=sprite.texture;live.anchor.copyFrom(sprite.anchor);live.position.set(actor.x+sprite.x*actor.scale.x,actor.y+sprite.y*actor.scale.y);
  live.scale.set(sprite.scale.x*actor.scale.x,sprite.scale.y*actor.scale.y);live.rotation=actor.rotation+sprite.rotation;live.alpha=1-handoff;
  const a=meta.first,r=meta.reference,cell=meta.cell,artCenter={x:(a[0]+a[2])/2,y:(a[1]+a[3])/2};
  const sf=sprite.width/1024*(r[3]-r[1])/(a[3]-a[1])*actor.scale.x;
  const referenceCenter={x:actor.x+((r[0]+r[2])/2048-sprite.anchor.x)*sprite.width*actor.scale.x,y:actor.y+((r[1]+r[3])/2048-sprite.anchor.y)*sprite.height*actor.scale.y};
  const base={x:referenceCenter.x-(artCenter.x-cell[0]/2)*sf,y:referenceCenter.y-(artCenter.y-cell[1]/2)*sf};
  const oa=meta.outlets[fa],ob=meta.outlets[fb],point={x:mix(oa[0],ob[0],fraction),y:mix(oa[1],ob[1],fraction)};
  const outlet={x:base.x+(point.x-cell[0]/2)*sf,y:base.y+(point.y-cell[1]/2)*sf};
  const shared=convergeOutlet(outlet,target,raw);
  for(let i=0;i<2;i++){
   const framePoint=meta.outlets[i?fb:fa],frameOutlet={x:base.x+(framePoint[0]-cell[0]/2)*sf,y:base.y+(framePoint[1]-cell[1]/2)*sf};
   const {shift,bend,width}=convergeOutlet(frameOutlet,target,raw);
   const art=frames[i];art.position.set(base.x+shift.x,base.y+shift.y);art.scale.set(sf);art.alpha=handoff*fade*(i?fraction:1-fraction);
   art.skeleton.setToSetupPose();if(art.state.getCurrent(0)?.animation?.name!=='transform')art.state.setAnimation(0,'transform',false);
   art.state.getCurrent(0)!.trackTime=(i?fb:fa)*.07+.0001;art.update(0);
   const slot=art.skeleton.findSlot('art')!,attachment=slot.getAttachment() as import('@esotericsoftware/spine-pixi-v8').MeshAttachment;
   const vertices=attachment.vertices;slot.deform.length=vertices.length;let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   for(let j=0;j<vertices.length;j+=2){const weight=smooth((vertices[j]-(framePoint[0]-cell[0]/2-width))/width);slot.deform[j]=vertices[j]+bend.x/sf*weight;slot.deform[j+1]=vertices[j+1]-bend.y/sf*weight;minX=Math.min(minX,slot.deform[j]);maxX=Math.max(maxX,slot.deform[j]);minY=Math.min(minY,slot.deform[j+1]);maxY=Math.max(maxY,slot.deform[j+1]);}
   artMaterials[i].setMapping([(maxX-minX)*ratio/1024,(maxY-minY)*ratio/1024,((r[0]+r[2])/2+(minX+cell[0]/2-artCenter.x)*ratio)/1024,((r[1]+r[3])/2+(-maxY+cell[1]/2-artCenter.y)*ratio)/1024]);
  }
  const source=shared.end,dx=target.x-source.x,dy=target.y-source.y;
  tail.skeleton.setToSetupPose();if(tail.state.getCurrent(0)?.animation?.name!=='flow')tail.state.setAnimation(0,'flow',true);
  tail.state.getCurrent(0)!.trackTime=time*1.4;tail.update(0);tail.position.set(source.x,source.y);tail.rotation=Math.atan2(dy,dx);
  tail.scale.set(Math.hypot(dx,dy)/(440*.76),.14*actor.scale.x);tail.alpha=smooth((time-.12)/.08)*(1-smooth((raw-2)/.7));
 }
 return{container,sample};
}
