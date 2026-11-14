import {Container} from 'pixi.js';
import {Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {animeCelMatte} from './AnimeCelMatte';
import {winReturnPose} from './winContinuity';
import {smooth,WIN_RETURN_DURATION} from './winCinemaMotion';
/** Two authored gust fronts pass the camera while the game underneath regains focus. */
export class WinReturnCels {
 readonly root=new Container();private rigs:Spine[];private frames=[-1,-1];private matte=animeCelMatte(true);
 constructor(data:SkeletonData){
  this.rigs=[0,1].map(()=>{const rig=new Spine({skeletonData:data,autoUpdate:false});rig.state.setAnimation(0,'draw',false);rig.filters=[this.matte];this.root.addChild(rig);return rig;});
  this.root.eventMode='none';this.root.visible=false;
 }
 sample(age:number,w:number,h:number,reduced=false){
  this.root.visible=!reduced&&age>0&&age<WIN_RETURN_DURATION;if(!this.root.visible)return;
  const p=winReturnPose(age),travel=smooth(age/WIN_RETURN_DURATION),span=Math.max(w,h)*1.12;
  this.rigs.forEach((rig,i)=>{const side=i?-1:1;
   rig.position.set(w/2+side*w*(.8-travel*1.6),h*((i?.52:.38)+travel*.12));
   rig.scale.set(span/512);rig.rotation=side*(.25+travel*.18);rig.alpha=p.curtain*(i?.44:.78);
   const frame=Math.min(15,Math.floor(4+travel*11));if(this.frames[i]!==frame){this.frames[i]=frame;rig.state.getCurrent(0)!.trackTime=frame/24+.00001;rig.update(0);}
  });
 }
 destroy(){this.root.destroy({children:true});this.matte.destroy();}
}
