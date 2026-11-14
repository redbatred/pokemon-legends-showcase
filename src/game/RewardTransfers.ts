import {cinematicReturnFlight} from './cinematicReturnFlight';
import type {WinSource} from './winPresentationIdentity';
import {attackTransition} from './winCinemaImpact';
import {Container,Graphics,Sprite,Text} from 'pixi.js';
import {AwardJuice,LightComet,ELEMENT_LIGHT,awardPower,awardTextures} from './AwardJuice';
import {juiceUp} from './winJuiceMotion';
import {MoneyReadout} from './MoneyReadout';
import {WinLedger,winFlightPose,WIN_COUNT_TIME,WIN_LAUNCH_TIME,WIN_FOLD_TIME,type WinTier} from './winTransfer';
import {WinCelebration,specialWinGeometry} from './WinCelebration';
import {celebrationPose,WIN_COUNT_FINISH} from './winCelebrationMotion';
import {rewardLayout,totalWinLayout} from './modalLayout';
import {playSound,type Sound} from './audio';
import type {PowerKind} from './powerProfiles';
import {smooth,winCinemaPose,winCinemaGeometry,WIN_CINEMA_FINISH,AWARD_INK} from './winCinemaMotion';
import {winScoreHit,winAmountBody,winReturnPose} from './winContinuity';
const cinematic=(tier:WinTier)=>tier!==null&&tier!=='special';
const finishTime=(tier:WinTier)=>cinematic(tier)?WIN_CINEMA_FINISH:WIN_COUNT_FINISH;
type Flight={index:number;amount:number;age:number;transferAge:number|null;speed:number;label:MoneyReadout;trail:Graphics;width:number;launched:boolean;countFinished:boolean;tier:WinTier;celebration:WinCelebration|null;comet:LightComet;glow:Sprite|null;power:number;tint:number;stamped:boolean;shed:number};
const GOLD=0xffe07a;
/** One persistent award lands on the stone, then leaves as a comet of light; only its arrival credits the presentation total. */
export class RewardTransfers {
 root=new Container();background=new Container();ledger=new WinLedger();private flights:Flight[]=[];private juice=new AwardJuice();private returnWaiters=new Set<()=>void>();private recoveryWaiters=new Set<()=>void>();
 constructor(private credit:(total:number,settled?:boolean)=>void,private draw:()=>void,private advance:()=>void=()=>{}){this.root.eventMode='passive';this.root.addChild(this.juice.back,this.juice.front);}
 /** Strength (0..1) of the award that most recently reached the total, for the total's own reaction. */
 arrivalPower=0;
 private bonusFlight:{amount:number;age:number;from:{x:number;y:number};root:Container;comet:LightComet;stamped:boolean;shed:number}|null=null;
 /** A caught bonus pays this pack: its amount is stamped where the three seats are, then travels into the total as one big award.
  * The total does not know about it until it lands: the running total only starts to count when the amount reaches it.
  * If the screen changes mid-flight the amount is still added, without the show. */
 bonus(amount:number,from:{x:number;y:number}){
  this.endBonus();
  const root=new Container(),title=new Text({text:'BONUS',style:{fontFamily:'BattleDisplay, Nunito, Arial',fontSize:30,fill:0xff6a78,letterSpacing:2,stroke:{color:0x061b32,width:7,join:'round'},dropShadow:{color:0x7a1220,alpha:1,blur:0,distance:4,angle:Math.PI/2}},resolution:2});
  const value=new MoneyReadout({identity:'bonus',value:amount,target:amount,remaining:0},{size:44,meter:true,color:0xffe27a,align:'center',width:600,plus:true,centerY:true,hero:false,reduced:true,ticks:false,draw:this.draw});
  title.anchor.set(.5);title.y=-34;root.addChild(title,value);root.alpha=0;const comet=new LightComet();this.root.addChild(comet.root,root,this.juice.front);
  this.bonusFlight={amount,age:0,from,root,comet,stamped:false,shed:0};
 }
 private endBonus(credit=false){const b=this.bonusFlight;if(!b)return;this.bonusFlight=null;this.ledger.total+=b.amount;b.root.destroy({children:true});b.comet.root.destroy({children:true});if(credit)this.credit(this.ledger.total);}
 private updateBonus(step:number,w:number,h:number,reduced:boolean){
  const b=this.bonusFlight;if(!b)return;b.age+=step;const target=totalWinLayout(w,h),unit=Math.min(w,h),HOLD=.95,FLY=.46;
  if(reduced||b.age>=HOLD+FLY){this.arrivalPower=reduced?0:1;this.endBonus(true);if(!reduced){this.juice.strike(target.x,target.y,target.width*.8,GOLD,1,Math.atan2(target.y-b.from.y,target.x-b.from.x));playSound('win-final-1' as Sound,{gain:.8});playSound('wincollect',{gain:1.1});}return;}
  // Stamped above the seats with weight, held long enough to read, then thrown at the total.
  const size=Math.max(.62,Math.min(1.25,unit/520)),stamp=juiceUp(b.age-.02,.7,.08),u=Math.max(0,(b.age-HOLD)/FLY),travel=u*u*(3-2*u)*(.4+.6*u),rest={x:b.from.x,y:b.from.y-unit*.085};
  if(!b.stamped&&b.age>=.02){b.stamped=true;this.juice.strike(rest.x,rest.y,unit*.34,GOLD,.8,-Math.PI/2);playSound('win-stamp' as Sound,{gain:.9});}
  const bow=Math.sin(travel*Math.PI)*Math.min(120,unit*.16)*(target.x>=rest.x?-1:1),x=rest.x+(target.x-rest.x)*travel+bow*.35,y=rest.y+(target.y-rest.y)*travel;
  b.root.position.set(x,y);b.root.scale.set(size*stamp.scale*(1-travel*.55));b.root.rotation=stamp.rotation-.03*(1-travel);b.root.alpha=Math.min(1,b.age/.05)*(1-Math.max(0,travel-.82)/.18);
  if(travel>0&&travel<1){const before=Math.max(0,travel-.03),px=rest.x+(target.x-rest.x)*before,py=rest.y+(target.y-rest.y)*before;b.comet.pose(x,y,Math.atan2(y-py,x-px),unit*.5*Math.sin(travel*Math.PI),24,GOLD,Math.min(1,travel*6)*Math.min(1,(1-travel)*8));b.shed+=step*120;while(b.shed>=1){b.shed--;this.juice.shed(x,y,22,GOLD);}}else b.comet.hide();
 }

 get cinematicOpacity(){return Math.max(0,...this.flights.filter(f=>cinematic(f.tier)).map(f=>{const p=winCinemaPose(f.age,f.transferAge??0);return p.alpha*p.enter;}));}
 get backgroundOcclusion(){return Math.max(0,...this.flights.filter(f=>cinematic(f.tier)).map(f=>attackTransition(f.age).arena*winReturnPose(f.transferAge??0).scene));}
 get actorOcclusion(){return Math.max(0,...this.flights.filter(f=>cinematic(f.tier)).map(f=>f.transferAge!==null?1:attackTransition(f.age).arena));}
 get celebrationOpacity(){return Math.max(0,...this.flights.map(f=>f.tier?(cinematic(f.tier)?winCinemaPose:celebrationPose)(f.age,f.transferAge??0).alpha:0));}
 reset(identity:string,previous:number[]=[]){this.clear();this.ledger.reset(identity,previous);}
 reveal(index:number,amount:number,reduced:boolean,tier:WinTier=null,low=false,element:PowerKind='wind',species='Charizard',image?:string,source?:WinSource,bet=0){
  if(!this.ledger.offer(index,amount))return;
  if(amount<=0){this.ledger.settle(index);return;}
  const label=new MoneyReadout({identity:String(index),value:amount,target:amount,remaining:0},{size:32,cinematic:cinematic(tier),meter:!cinematic(tier),color:tier?0xfffcde:0xfff3c4,align:'center',width:600,plus:!tier,centerY:true,hero:false,reduced:true,ticks:false,draw:this.draw}),trail=new Graphics(),celebration=tier?new WinCelebration(tier,low,element,species,()=>{const flight=this.flights.find(f=>f.index===index);if(!flight)return;if(flight.age<finishTime(tier))this.finish(index);else this.advance();},image,source):null;
  if(celebration){this.root.addChild(celebration.root);this.background.addChild(celebration.background);}
  const comet=new LightComet();let glow:Sprite|null=null;
  // A plain award sits on a bar of light in the card's colour: the edge of the stone catching it.
  if(!tier&&AwardJuice.available){glow=new Sprite(awardTextures().flare);glow.anchor.set(.5);glow.blendMode='add';glow.alpha=0;this.juice.back.addChild(glow);}
  this.root.addChild(trail,comet.root,label,this.juice.front);this.flights.push({index,amount,age:reduced?finishTime(tier)+.3:0,transferAge:null,speed:cinematic(tier)?1:1.5,label,trail,width:label.getLocalBounds().width,launched:false,countFinished:reduced,tier,celebration,comet,glow,power:awardPower(amount,bet),tint:ELEMENT_LIGHT[element]??0x9eefff,stamped:reduced,shed:0});label.alpha=0;
 }
 finish(index:number){const f=this.flights.find(f=>f.index===index);if(!f||f.transferAge!==null)return;f.age=Math.max(finishTime(f.tier)+(cinematic(f.tier)?.001:.3),f.age);f.countFinished=true;f.label.display(f.amount);f.celebration?.finish();}
 /** Heavy preparation waits until the complete stadium return has cleared. */
 waitForWinRecovery(){if(!this.flights.some(f=>cinematic(f.tier)))return Promise.resolve();return new Promise<void>(resolve=>this.recoveryWaiters.add(resolve));}
 private releaseRecovery(){if(this.flights.some(f=>cinematic(f.tier)))return;for(const resolve of this.recoveryWaiters)resolve();this.recoveryWaiters.clear();}
 /** A card cannot leave the stage underneath a still-visible stadium. */
 beforeCardTransfer(){
  this.rush();
  if(!this.flights.some(f=>cinematic(f.tier)))return Promise.resolve();
  return new Promise<void>(resolve=>this.returnWaiters.add(resolve));
 }
 private releaseReturn(){if(this.flights.some(f=>cinematic(f.tier)))return;for(const resolve of this.returnWaiters)resolve();this.returnWaiters.clear();}
 /** Advancing the card is the only trigger for the reward's exit/transfer clock. */
 rush(){for(const f of this.flights)f.transferAge??=0;}
 deposit(index:number,amount:number){
  this.ledger.offer(index,amount);const flight=this.flights.find(f=>f.index===index);if(flight){flight.transferAge??=0;flight.speed=Math.max(flight.speed,3);return;}
  if(this.ledger.settle(index))this.credit(this.ledger.total);
 }
 update(dt:number,w:number,h:number,reduced:boolean,presentationRate=1){
  const stone=rewardLayout(w,h),target=totalWinLayout(w,h),special=specialWinGeometry(w,h),step=Math.min(.05,dt);
  this.juice.update(step);this.updateBonus(step,w,h,reduced);
  for(const f of [...this.flights]){
   if(f.celebration?.ready!==false)f.age+=step*presentationRate;if(f.transferAge!==null)f.transferAge+=step*f.speed;
   const presentationAge=reduced?Math.max(finishTime(f.tier)+.3,f.age):f.age,celebration=(cinematic(f.tier)?winCinemaPose:celebrationPose)(presentationAge,f.transferAge??0,cinematic(f.tier)?f.tier as 'big':undefined);f.celebration?.update(presentationAge,w,h,f.transferAge??0,reduced);const bone=f.celebration?.amountPose();
   const geometry=cinematic(f.tier)?winCinemaGeometry(w,h,f.tier==='legendary',presentationAge):special;
   const source=f.tier?{x:bone?.x??geometry.x,y:bone?.y??geometry.amountY,size:geometry.size*(bone?.scaleY??1),width:geometry.amountWidth*(bone?.scaleX??1)}:{...stone,size:stone.size*1.35,width:stone.width*1.5};
   const age=WIN_LAUNCH_TIME-WIN_FOLD_TIME+(cinematic(f.tier)?winReturnPose(f.transferAge??0).transfer:(f.transferAge??0)),pose=cinematic(f.tier)?cinematicReturnFlight(winReturnPose(f.transferAge??0).transfer,source,target):winFlightPose(age,source,target),count=f.transferAge!==null?1:f.tier?celebration.count:Math.min(1,presentationAge/WIN_COUNT_TIME),travel=pose.progress,morph=Math.sin(travel*Math.PI);
   // A plain award swings round the card on its way up, rather than crossing its face.
   const rise=Math.hypot(target.x-source.x,target.y-source.y),bow=cinematic(f.tier)?0:(f.index%2?1:-1)*Math.min(150,rise*.42)*Math.max(0,1-Math.abs(target.x-source.x)/Math.max(1,rise)*2.5);pose.x+=morph*bow;
   if(f.tier&&!f.countFinished&&presentationAge>=finishTime(f.tier)&&f.transferAge===null){f.countFinished=true;if(!cinematic(f.tier))playSound('rare',{gain:.2});}
   f.label.display(f.amount*(cinematic(f.tier)?count:1-(1-count)**(f.tier?2:3)));f.label.cinema?.(presentationAge,reduced,cinematic(f.tier)?winScoreHit(presentationAge,f.tier as 'big'):undefined);f.label.position.set(pose.x,pose.y);f.label.returnStyle?.(pose.blend);
   const strike=cinematic(f.tier)?winAmountBody(presentationAge,reduced):{x:1,y:1,lift:0},release=1-pose.blend;
   const body={x:1+(strike.x-1)*release,y:1+(strike.y-1)*release,lift:strike.lift*release};
   // A plain award drops onto the stone from above its size and strikes light along its edge, harder the more it is worth.
   const landing=!f.tier&&f.transferAge===null&&!reduced,punch=landing?juiceUp(f.age-.1,.16+.34*f.power,.03+.05*f.power):{scale:1,rotation:0};
   if(!f.tier&&!f.stamped&&f.age>=.1){f.stamped=true;if(landing&&f.age<.4){const y=source.y+source.size*.1;this.juice.flare(source.x,y,source.width*(1.1+f.power*.9),.22+f.power*.12,f.tint,.7+f.power);if(f.power>.3)this.juice.flare(source.x,y,source.width*(.6+f.power*.5),.14,0xffffff,.4);for(const way of [0,Math.PI])this.juice.sparks(source.x+Math.cos(way)*source.width*.3,y,Math.round(1+6*f.power*f.power),source.width*(1.3+f.power*1.4),f.tint,.25,way,.5);playSound('win-tick',{gain:.22+.5*f.power,rate:.84+.42*f.power});}}
   const emphasis=f.tier&&!cinematic(f.tier)&&f.transferAge===null?1+celebration.amountPulse:landing?(1+(1-smooth(f.age/.1))*(.3+.5*f.power))*punch.scale:1;f.label.rotation=punch.rotation;
   if(f.glow){const rest=f.transferAge===null?smooth((f.age-.06)/.2):1-smooth(travel*4);f.glow.position.set(source.x,source.y+source.size*.46);f.glow.tint=f.tint;f.glow.scale.set(source.width*(1.25+.5*f.power)*(.6+.4*rest)/256,(.35+.4*f.power)*(.9+.1*Math.sin(f.age*5)));f.glow.alpha=reduced?0:rest*(.4+.4*f.power);}
   const start=Math.min(source.size/32,source.width/f.width)*emphasis,end=Math.min(target.size/32*.86,target.width/f.width),size=start+(end-start)*pose.blend;
   const squeeze=travel===0?pose.fold:Math.max(0,1-travel*5);
   f.label.scale.set(size*(cinematic(f.tier)?1:1-squeeze*.16+morph*.18)*body.x,size*(cinematic(f.tier)?1:1-squeeze*.45-morph*.48)*body.y);f.label.y+=body.lift*h;
   // The strike stretches the amount upward from a planted base, so it never spills onto the prompt below it.
   if(cinematic(f.tier))f.label.y-=(body.y-1)*size*32*AWARD_INK.amountBottom;f.label.alpha=(f.tier?celebration.amountAlpha:Math.min(1,f.age/.09))*(1-morph*(cinematic(f.tier)?.08:.72));
   if(travel>0&&!f.launched){f.launched=true;playSound('flip',{gain:.65});}
   const trail=f.trail.clear();
   // The amount leaves as a comet of its own light: a hot head, a tail along its path and motes shed behind it.
   if(!cinematic(f.tier)){if(travel>0&&travel<1&&!reduced){const before=winFlightPose(age-.012,source,target),reach=rise,tint=f.tier?GOLD:f.tint;before.x+=Math.sin(before.progress*Math.PI)*bow;
     f.comet.pose(pose.x,pose.y,Math.atan2(pose.y-before.y,pose.x-before.x),(.1+.5*morph)*reach*(.45+.55*f.power),9+13*f.power,tint,Math.min(1,travel*7)*Math.min(1,(1-travel)*9));
     f.shed+=step*(36+80*f.power);while(f.shed>=1){f.shed--;this.juice.shed(pose.x,pose.y,9+13*f.power,tint);}
    }else f.comet.hide();}
   else if(travel>0&&travel<1&&!reduced){
    for(let i=0;i<14;i++){const sample=(delay:number)=>cinematic(f.tier)?cinematicReturnFlight(winReturnPose(f.transferAge??0).transfer-delay,source,target):winFlightPose(age-delay,source,target);const a=sample(.006*(15-i)),b=sample(.006*(14-i));if(a.progress===0)continue;const width=(i/14)*9;trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:f.tier?0xffe85c:0x4acbff,width:width+6,alpha:i/14*.22}).moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0xdfffff,width:Math.max(1,width*.35),alpha:i/14*.9});}
    const flare=7+morph*7;trail.poly([pose.x-flare*1.6,pose.y,pose.x-3,pose.y-3,pose.x,pose.y-flare*.7,pose.x+3,pose.y-3,pose.x+flare*1.6,pose.y,pose.x+3,pose.y+3,pose.x,pose.y+flare*.7,pose.x-3,pose.y+3]).fill({color:0xf1ffff,alpha:morph*.9});
   }
   if(f.transferAge!==null&&(pose.done||reduced)){
    // Arrival: the total takes the hit, scaled by what the award was worth against the stake.
    const power=cinematic(f.tier)?1:f.power,tint=f.tier?GOLD:f.tint;this.ledger.settle(f.index);this.remove(f);this.arrivalPower=reduced?0:power;
    if(cinematic(f.tier))this.credit(this.ledger.total,true);else this.credit(this.ledger.total);this.releaseReturn();
    if(!reduced){this.juice.strike(target.x,target.y,target.width*(.45+.2*power),tint,.3+.7*power,Math.atan2(target.y-source.y,target.x-source.x));playSound('wincollect',{gain:f.tier?1.35:.6+.52*power});}
   }
  }
  this.releaseRecovery();
 }
 private remove(f:Flight){this.flights=this.flights.filter(item=>item!==f);f.label.destroy();f.trail.destroy();f.comet.root.destroy({children:true});f.glow?.destroy();f.celebration?.destroy();}
 private clear(){this.endBonus();for(const f of [...this.flights])this.remove(f);this.juice.clear();this.arrivalPower=0;this.releaseReturn();this.releaseRecovery();}
 destroy(){this.clear();this.juice.destroy();this.root.destroy({children:true});this.background.destroy({children:true});}
}
