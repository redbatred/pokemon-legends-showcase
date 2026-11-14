import {Container,Rectangle} from 'pixi.js';
import {Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {animeCelMatte} from './AnimeCelMatte';
import {championshipBeat} from './championshipBeat';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
import {winTierProfile,type CinemaTier} from './winChoreography';
/** The authored elemental cels strike the lens, then separate to expose the award. */
export class WinFinisher{
 readonly root=new Container();private rigs:Spine[];private frames=[-1,-1];private matte=animeCelMatte();private area=new Rectangle();
 constructor(data:SkeletonData,private tier:CinemaTier){
  this.rigs=[0,1].map(()=>{const rig=new Spine({skeletonData:data,autoUpdate:false});rig.state.setAnimation(0,'draw',false);this.root.addChild(rig);return rig;});
  this.root.filters=[this.matte];this.root.eventMode='none';this.root.visible=false;
 }
 sample(age:number,w:number,h:number,exitAge=0,reduced=false){
  const p=championshipBeat(age,this.tier,exitAge,reduced),rank=winTierProfile(this.tier).rank,t=age-WIN_CINEMA_FINISH;this.root.visible=p.burst>0;if(!this.root.visible)return;
  this.area.width=w;this.area.height=h;this.root.filterArea=this.area;
  this.rigs.forEach((rig,i)=>{const side=i?1:-1,span=Math.max(w,h)*(1.05+rank*.09)*(1-p.spread*.30);rig.position.set(w*.5+side*p.spread*w*.70,h*(.44-p.spread*.08));rig.scale.set(span/512);rig.rotation=side*p.spread*.42;rig.alpha=p.burst*.92;
   const frame=Math.min(15,Math.max(5,Math.floor(5+t/.52*10)));if(this.frames[i]!==frame){this.frames[i]=frame;rig.state.getCurrent(0)!.trackTime=frame/24+.00001;rig.update(0);}
  });
 }
 destroy(){this.root.filters=[];this.matte.destroy();this.root.destroy({children:true});}
}
