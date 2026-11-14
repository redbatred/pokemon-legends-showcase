import {createAnimeCel} from './animeCels';
import {Container,Sprite,Texture,Text} from 'pixi.js';
import {Spine,type SkeletonData} from '@esotericsoftware/spine-pixi-v8';
import {clamp,smooth,mix} from './model';
/** One eye performance: compress, blink, track, lock, bank into the next shot. */
export function createCinematicEye(data:SkeletonData,species:string,name:string){
 const container=new Container(),black=new Sprite(Texture.WHITE),top=new Sprite(Texture.WHITE),bottom=new Sprite(Texture.WHITE),drawn=createAnimeCel('eye'),legacy=new Spine({skeletonData:data,autoUpdate:false});
 const eye=species==='lugia'?drawn.rig:legacy;
 black.tint=top.tint=bottom.tint=0x080d18;
 const title=new Text({text:name.toUpperCase(),style:{fontFamily:'BattleDisplay, Nunito, Arial',fontSize:72,fontWeight:'400',fill:0xfff9ed,letterSpacing:6,stroke:{color:0x061b32,width:9},dropShadow:{color:0x1c5f8f,alpha:1,blur:0,distance:8,angle:Math.PI/2}},resolution:2});title.anchor.set(.5);
 const subtitle=new Text({text:'LEGENDARY ENCOUNTER',style:{fontFamily:'Nunito',fontSize:17,fontWeight:'800',fill:0xe1e9ef,letterSpacing:3}});subtitle.anchor.set(.5);
 container.addChild(black,eye,top,bottom,title,subtitle);
 function sample(elapsed:number,w:number,h:number){
  const u=(elapsed-4.6)/1.1;container.visible=u>=0&&u<1;if(!container.visible)return;
  const reveal=smooth(u/.08),shut=smooth((u-.94)/.06),snap=smooth((u-.38)/.12);
  black.width=w;black.height=h;
  const frame=Math.min(15,Math.floor(clamp((u-.035)/.91)*16));
  if(species==='lugia')drawn.sample(frame);
  else{legacy.skeleton.setToSetupPose();if(!legacy.state.getCurrent(0))legacy.state.setAnimation(0,species,false);legacy.state.getCurrent(0)!.trackTime=Math.min(7,Math.floor(frame/2))*.07+.0001;legacy.update(0);}
  const zoom=1.12+.14*smooth(u/.8)+.035*snap;
  eye.scale.set(w/1024*zoom);eye.rotation=-.018-.035*smooth((u-.72)/.28);
  eye.position.set(w*.5+mix(w*.07,-w*.025,smooth(u)),h*.42+Math.sin(u*Math.PI)*h*.012);
  // Opaque mattes reveal a widening close-up without crossfading two drawings.
  const height=h*(.20+.06*snap)*reveal*(1-shut);
  top.width=bottom.width=w;top.height=Math.max(0,h*.42-height/2);bottom.y=h*.42+height/2;bottom.height=h-bottom.y;
  title.position.set(w*.5,h*.64+16*(1-smooth((u-.44)/.12)));title.style.fontSize=w<1000?50:62;title.alpha=smooth((u-.44)/.1)*(1-shut);
  subtitle.position.set(w*.5,h*.70);subtitle.alpha=title.alpha;
 }
 return{container,sample};
}
