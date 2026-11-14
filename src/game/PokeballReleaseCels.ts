import {Container} from 'pixi.js';
import {Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {releaseImpactTiming} from './arenaImpact';
/** Pressure leaves the actual ball aperture; dust comes only from grounded foot contact. */
export class PokeballReleaseCels{
 readonly back=new Container();readonly front=new Container();private aperture:Spine;private landing:Spine;
 constructor(data:SkeletonData,private grounded=true){
  this.aperture=new Spine({skeletonData:data,autoUpdate:false});this.aperture.state.setAnimation(0,'burst',false);this.aperture.scale.set(.42);
  this.landing=new Spine({skeletonData:data,autoUpdate:false});this.landing.state.setAnimation(0,'landing',false);
  this.back.addChild(this.landing);this.front.addChild(this.aperture);this.back.eventMode=this.front.eventMode='none';
 }
 sample(age:number,duration:number,aperture:{x:number;y:number},body:{x:number;y:number},floor:number){
  const p=releaseImpactTiming(age,duration,this.grounded);
  this.aperture.visible=p.release>=0&&p.release<.62;if(this.aperture.visible){this.aperture.position.set(aperture.x,aperture.y);this.aperture.state.getCurrent(0)!.trackTime=p.release;this.aperture.update(0);}
  this.landing.visible=p.landing>=0&&p.landing<.8;if(this.landing.visible){this.landing.position.set(body.x,floor-3);this.landing.state.getCurrent(0)!.trackTime=p.landing;this.landing.update(0);}
 }
 hide(){this.back.visible=this.front.visible=false;}
}
