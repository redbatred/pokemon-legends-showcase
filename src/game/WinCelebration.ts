import type {WinSource} from './winPresentationIdentity';
import {Container,Text} from 'pixi.js';
import type {WinTier} from './winTransfer';
import {celebrationPose,specialWinGeometry,WIN_COUNT_FINISH} from './winCelebrationMotion';
import type {PowerKind} from './powerProfiles';
import {playSound} from './audio';
import {WinCinema,preloadWinCinema} from './WinCinema';
import {RevealJuice} from './RevealJuice';
import {juiceUp} from './winJuiceMotion';
import {pokemonPower} from './powerProfiles';
export {specialWinGeometry} from './winCelebrationMotion';
export function preloadWinCelebration(){return preloadWinCinema().then(()=>{});}
/** Type lands like a stamp and every count beat throws light from the amount; no ornament artwork. */
export class WinCelebration {
 root=new Container();background=new Container();private cinema:WinCinema|null=null;private w=1280;private h=720;private letters:Text[]=[];
 private beatsSounded=0;private settled=false;private age=0;private sounded=false;private geometry=specialWinGeometry(1280,720);
 private titleBox=new Container();private shines:Text[]=[];private juice:RevealJuice|null=null;private bursts=0;private tone=0xffd66b;
 constructor(tier:Exclude<WinTier,null>,_low=false,_element:PowerKind='wind',species='Charizard',onTap=()=>{},image?:string,source?:WinSource){
  if(tier!=='special'){this.cinema=new WinCinema(tier,species,_low,onTap,image,source);this.root.addChild(this.cinema.root);return;}
  if(image)this.tone=pokemonPower(image).color;
  const title='SPECIAL PULL';
  for(const char of title){const letter=new Text({text:char,style:{fontFamily:'BattleDisplay, Nunito',fontWeight:'400',fontSize:30,fill:0xfff2cf,stroke:{color:0x112b3a,width:4.5},dropShadow:{color:0x7e2339,alpha:1,distance:5,blur:0,angle:Math.PI/2}},resolution:2});letter.anchor.set(.5);this.letters.push(letter);
   const shine=new Text({text:char,style:{fontFamily:'BattleDisplay, Nunito',fontWeight:'400',fontSize:30,fill:0xffffff},resolution:2});shine.anchor.set(.5);shine.blendMode='add';shine.alpha=0;this.shines.push(shine);this.titleBox.addChild(letter,shine);}
  // Each count beat throws pressure from the amount; the exact total pays out in coins.
  this.juice=new RevealJuice(_low);this.root.addChild(this.juice.back,this.titleBox,this.juice.front);this.root.eventMode=this.background.eventMode='none';
 }
 get ready(){return this.cinema?.ready??true;}
 finish(){this.cinema?.finish();this.beatsSounded=4;this.settled=true;this.sounded=true;}
 update(age:number,w:number,h:number,exitAge=0,reduced=false){
  this.w=w;this.h=h;if(this.cinema){this.cinema.update(age,w,h,exitAge,reduced);return;}
  this.age=age;const g=this.geometry=specialWinGeometry(w,h),p=celebrationPose(age,exitAge);
  this.root.alpha=this.background.alpha=p.alpha;
  if(!this.sounded&&age>=.12){this.sounded=true;if(!this.settled&&!reduced)playSound('win-stamp');}
  const beats=[.40,.88,1.4,WIN_COUNT_FINISH];if(!reduced&&!this.settled&&age>=beats[this.beatsSounded]){const final=++this.beatsSounded===4;playSound(final?'win-rung-1':'win-tick',{gain:final?.8:.9,rate:final?1:.9+this.beatsSounded*.14});if(final)playSound('win-coins-1',{gain:.8});}
  // The stamp drops in oversized, hits and rings out; then every beat answers on the amount.
  const size=g.titleSize*2.15,advance=size*.5,drop=Math.min(1,age/.12),punch=juiceUp(age-.12,.5,.07),unit=Math.min(w,h)/700,juice=this.juice!,dt=Math.min(.05,Math.max(0,age-this.last));this.last=age;
  this.titleBox.position.set(g.x,g.titleY);this.titleBox.scale.set(reduced||this.settled?1:(2.4-1.4*drop**4)*punch.scale);this.titleBox.rotation=reduced||this.settled?0:punch.rotation;
  this.letters.forEach((letter,i)=>{const a=Math.max(0,age-i*.014),landing=reduced?0:Math.max(...beats.map(b=>Math.max(0,1-Math.abs(age-b-.07)/.18))),shine=this.shines[i],sweep=((age-.5)*1.3)%2.4-i*.07;letter.style.fontSize=shine.style.fontSize=size;letter.position.set((i-(this.letters.length-1)/2)*advance,reduced?0:Math.sin(age*2.6+i*.6)*size*.03*Math.min(1,age));letter.rotation=reduced?0:-.03+.02*Math.sin(age*2+i*.5)*Math.min(1,age);letter.scale.set(1+.10*landing,1+.16*landing);letter.alpha=Math.min(1,a/.05);
   shine.position.copyFrom(letter.position);shine.rotation=letter.rotation;shine.scale.copyFrom(letter.scale);shine.alpha=reduced?0:letter.alpha*Math.max(age>=.12?Math.max(0,1-(age-.12)/.2)*.9:0,age>.5?Math.max(0,1-Math.abs(sweep)/.15)*.6:0);});
  juice.scale=unit;juice.back.visible=juice.front.visible=!reduced;
  if(!reduced&&!this.settled)while(this.bursts<beats.length&&age>=beats[this.bursts]){const final=++this.bursts===beats.length;juice.pop(g.x,g.amountY,g.width*(final?1:.45+this.bursts*.1),this.tone,final?20:6+this.bursts*3);}
  if(age>=.12&&this.bursts===0&&!this.stamped&&!reduced&&!this.settled){this.stamped=true;juice.pop(g.x,g.titleY,g.width*.9,this.tone,14);}
  juice.update(dt);
 }
 private last=0;private stamped=false;
 amountPose(){if(this.cinema)return this.cinema.amountPose(this.w,this.h);const g=this.geometry,a=Math.max(0,this.age-.12),spring=this.settled?0:Math.exp(-a*8)*Math.sin(a*20);return{x:g.x,y:g.amountY,scaleX:1+.06*spring,scaleY:1+.08*spring};}
 destroy(){this.cinema?.destroy();this.juice?.destroy();this.root.destroy({children:true});this.background.destroy({children:true});}
}
