import {Container,Graphics,Text} from 'pixi.js';
import type {Spine} from '@esotericsoftware/spine-pixi-v8';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** A tactile Pokémon command: round ball dock, red enamel face and a real press depth. */
export function createThrowButton(input:HTMLButtonElement,icon:Spine){
 const container=new Container(),face=new Container(),shadow=new Graphics(),shell=new Graphics(),surface=new Graphics(),rim=new Graphics();
 const label=new Text({text:'THROW',style:{fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400',fontSize:40,fill:0xfff8e5,letterSpacing:3,stroke:{color:0x5e0f1c,width:5}},resolution:2});label.anchor.set(.5);
 const sub=new Text({text:'POKÉ BALL',style:{fontFamily:'Nunito',fontWeight:'900',fontSize:13,fill:0xffd7d9,letterSpacing:2.2}});sub.anchor.set(.5);
 const key=new Text({text:'›',style:{fontFamily:'Nunito',fontWeight:'900',fontSize:41,fill:0xfff8e5}});key.anchor.set(.5);
 face.addChild(shell,surface,rim,icon,label,sub,key);container.addChild(shadow,face);container.eventMode='none';
 let hover=false,pressed=false,focus=false,progress=0,last=0,demoPressedUntil=-1;
 const enter=()=>hover=true,leave=()=>{hover=false;pressed=false;},down=()=>pressed=true,up=()=>pressed=false,onFocus=()=>focus=true,onBlur=()=>{focus=false;pressed=false;};
 const kd=(e:KeyboardEvent)=>{if(e.key===' '||e.key==='Enter')pressed=true;};
 input.addEventListener('pointerenter',enter);input.addEventListener('pointerleave',leave);input.addEventListener('pointerdown',down);input.addEventListener('pointerup',up);input.addEventListener('pointercancel',up);input.addEventListener('focus',onFocus);input.addEventListener('blur',onBlur);input.addEventListener('keydown',kd);input.addEventListener('keyup',up);
 function sample(time:number,w:number,h:number,visible:boolean,reduced=false){
  container.visible=visible;input.hidden=!visible;if(!visible){pressed=false;return;}
  const bw=Math.min(430,w*.73),bh=88,bx=(w-bw)/2,by=h-128;
  const dt=clamp((time-last)*12);last=time;progress+=(Number(hover||focus)-progress)*(reduced?1:dt);
  const activePress=pressed||time<demoPressedUntil,press=activePress?5:0,lift=activePress?0:progress*3;
  container.position.set(bx,by);face.y=press-lift;
  input.style.left=`${bx/w*100}%`;input.style.top=`${by/h*100}%`;input.style.width=`${bw/w*100}%`;input.style.height=`${bh/h*100}%`;input.style.bottom='auto';
  shadow.clear().roundRect(0,7,bw,bh,18).fill(0x081923);
  shell.clear().roundRect(0,0,bw,bh,18).fill(focus?0xffdf83:0xf5edda);
  surface.clear().roundRect(4,4,bw-8,bh-8,14).fill(activePress?0x8f263c:hover?0xe04858:0xc9334c);
  // One inset edge communicates material and movement, not decorative sci-fi lines.
  rim.clear().roundRect(7,7,bw-14,bh-14,12).stroke({color:0xffd6cf,alpha:activePress?.15:.42+progress*.2,width:1.5});
  shell.circle(49,44,31).fill(0x172f3a).circle(49,44,27).fill(0xfff4df);
  icon.position.set(49,69-press*.25);icon.scale.set(.46*(1+.08*progress),.46*(activePress?.91:1));icon.rotation=reduced?0:Math.sin(time*2)*.035+progress*.12;
  label.position.set(bw*.55,34);sub.position.set(bw*.55,62);key.position.set(bw-27+progress*3,42);
 }
 return{container,sample,demonstratePress:(time:number)=>{demoPressedUntil=time+.15;},destroy(){input.removeEventListener('pointerenter',enter);input.removeEventListener('pointerleave',leave);input.removeEventListener('pointerdown',down);input.removeEventListener('pointerup',up);input.removeEventListener('pointercancel',up);input.removeEventListener('focus',onFocus);input.removeEventListener('blur',onBlur);input.removeEventListener('keydown',kd);input.removeEventListener('keyup',up);container.destroy({children:true});}};
}
