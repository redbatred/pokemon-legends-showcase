import {Container,Rectangle} from 'pixi.js';
import {Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {animeCelMatte} from './AnimeCelMatte';
import {smooth,WIN_CINEMA_IMPACT} from './winCinemaMotion';

/** Elemental impact at the lens, followed by two offset gust cels opening onto the arena. */
export class WinStadiumEntry {
 readonly root=new Container();private rigs:Spine[];private frames=[-1,-1];private matte=animeCelMatte(true);private area=new Rectangle();
 constructor(_element:SkeletonData,wind:SkeletonData,private low=false){
  this.rigs=[wind,wind].map(data=>{const rig=new Spine({skeletonData:data,autoUpdate:false});rig.state.setAnimation(0,'draw',false);rig.filters=[this.matte];this.root.addChild(rig);return rig;});
  this.root.eventMode='none';this.root.visible=false;this.matte.resolution=low?.75:1;
 }
 sample(age:number,w:number,h:number,reduced=false){
  // The launched elemental cel owns the cover; only its clearing wake is added here.
  const t=age-WIN_CINEMA_IMPACT,span=Math.max(w,h);
  this.root.visible=!reduced&&t>=0&&t<.82;if(!this.root.visible)return;
  this.area.width=w;this.area.height=h;this.root.filterArea=this.area;
  this.rigs.forEach((rig,i)=>{
   const local=t-i*.055,p=smooth(local/.76),side=i===0?-1:1;
   rig.visible=local>=0&&p<1&&!(this.low&&i===1);if(!rig.visible)return;
   rig.position.set(w/2+side*w*(.10+p*.56),h*.42+side*p*h*.08);
   rig.rotation=side*(.20+p*.35);rig.scale.set(span*(.92+p*.22)/512);
   rig.alpha=smooth(local/.10)*.85*(1-smooth((p-.3)/.7));
   const frame=Math.min(15,Math.floor(5+p*10));
   if(this.frames[i]!==frame){this.frames[i]=frame;rig.state.getCurrent(0)!.trackTime=frame/24+.00001;rig.update(0);}
  });
 }
 destroy(){this.root.destroy({children:true});this.matte.destroy();}
}
