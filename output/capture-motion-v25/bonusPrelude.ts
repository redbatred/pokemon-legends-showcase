import {createCaptureSeal} from '../../src/game/showdown/CaptureSealFrames';
import {Container,Sprite,Texture,Text} from 'pixi.js';
import {Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {smooth} from './model';
/** Entry after the real pack has already collected three symbols. No fabricated cards. */
export function createBonusPrelude(_back:Texture,receiverTexture:Texture,stadium:Texture,data:SkeletonData,_pack:Texture,_cards:Texture[]){
 const container=new Container(),background=new Sprite(stadium),shade=new Sprite(Texture.WHITE),tray=new Sprite(receiverTexture);
 const title=new Text({text:'LEGENDARY ENCOUNTER',style:{fontFamily:'Nunito',fontWeight:'900',fontSize:32,fill:0xfff5dc}}),sub=new Text({text:'3 Poké Balls collected',style:{fontFamily:'Nunito',fontWeight:'800',fontSize:23,fill:0xffe8a8}});
 title.anchor.set(.5);sub.anchor.set(.5);shade.tint=0x102333;
 const rig=()=>new Spine({skeletonData:data,autoUpdate:false});
 const balls=[rig(),rig(),rig()],locks=[createCaptureSeal('ball')!,createCaptureSeal('ball')!,createCaptureSeal('ball')!];
 function pose(s:Spine,name:string,t:number){s.skeleton.setToSetupPose();if(s.state.getCurrent(0)?.animation?.name!==name)s.state.setAnimation(0,name,false);s.state.getCurrent(0)!.trackTime=Math.max(0,t);s.update(0);}
 container.addChild(background,shade,tray,...balls,...locks.map(lock=>lock.container),title,sub);
 function sample(t:number,w:number,h:number,portrait:boolean){
  container.visible=t<5.7;if(!container.visible)return;
  const age=Math.max(0,t-3.75),s=Math.max(w/stadium.width,h/stadium.height);background.scale.set(s);background.position.set((w-background.width)/2,(h-background.height)/2);shade.width=w;shade.height=h;shade.alpha=.72;
  title.position.set(w*.5,h*.24);title.style.fontSize=portrait?32:42;sub.position.set(w*.5,h*.73);
  const tw=w*(portrait?.93:.58),ts=tw/receiverTexture.width;tray.scale.set(ts);tray.position.set((w-tw)/2,h*.49-receiverTexture.height*ts/2);
  balls.forEach((ball,i)=>{const x=tray.x+[610.5,1086,1561.5][i]*ts,y=tray.y+362*ts,scale=335*ts/100;pose(ball,'closed',0);ball.scale.set(scale*(1+.09*Math.sin(smooth(age/.25)*Math.PI)));ball.position.set(x,y+51.8*scale);const lock=locks[i];lock.sample((age-i*.08)/.75);lock.container.visible=age>=i*.08&&age<.75+i*.08;lock.container.scale.set(335*ts/190);lock.container.position.set(x,y);});
 }
 return{container,sample};
}
