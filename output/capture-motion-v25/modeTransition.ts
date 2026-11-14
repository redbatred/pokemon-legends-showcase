import {Container,Sprite,Texture} from 'pixi.js';
import {createAnimeCel} from './animeCels';
import {smooth} from './model';
/** Authored ink/speed-line cels fill the frame, then make a clean cut to the eye shot. */
export function createModeTransition(){
 const container=new Container(),backing=new Sprite(Texture.WHITE),cel=createAnimeCel('ink');backing.tint=0x080d18;container.addChild(backing,cel.rig);container.eventMode='none';
 function sample(age:number,w:number,h:number,exit=false){
  container.visible=age>=0&&age<(exit?1.5:1.25);if(!container.visible)return;
  const reveal=exit&&age>=.85,p=reveal?1-smooth((age-.85)/.65):smooth(age/.65);
  // A uniform held ink field guarantees total occlusion while the underlying scene switches.
  backing.width=w;backing.height=h;backing.alpha=smooth((p-.72)/.2);
  cel.sample(p*11);cel.rig.position.set(w/2,h/2);cel.rig.scale.set((reveal?-1:1)*w/512,h/512);cel.rig.alpha=age<.06?smooth(age/.06):reveal?Math.min(1,p*12):exit?1:1-smooth((age-.78)/.32);
 }
 return{container,sample};
}
