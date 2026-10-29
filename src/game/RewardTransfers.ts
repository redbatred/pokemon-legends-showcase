import {Container,Graphics} from 'pixi.js';
import {MoneyReadout} from './MoneyReadout';
import {WinLedger,winFlightPose,WIN_COUNT_TIME,WIN_LAUNCH_TIME,WIN_FOLD_TIME,type WinTier} from './winTransfer';
import {WinCelebration,specialWinGeometry} from './WinCelebration';
import {celebrationPose,WIN_COUNT_FINISH} from './winCelebrationMotion';
import {rewardLayout,totalWinLayout} from './modalLayout';
import {playSound} from './audio';
type Flight={index:number;amount:number;age:number;transferAge:number|null;speed:number;label:MoneyReadout;trail:Graphics;width:number;launched:boolean;countFinished:boolean;tier:WinTier;celebration:WinCelebration|null};
/** One persistent award morphs into a comet; only its arrival credits the presentation total. */
export class RewardTransfers {
 root=new Container();ledger=new WinLedger();private flights:Flight[]=[];private impacts:number[]=[];private impact=new Graphics();
 constructor(private credit:(total:number)=>void,private draw:()=>void){this.root.eventMode='none';this.root.addChild(this.impact);}
 get celebrationOpacity(){return Math.max(0,...this.flights.map(f=>f.tier?celebrationPose(f.age,f.transferAge??0).alpha:0));}
 reset(identity:string,previous:number[]=[]){this.clear();this.ledger.reset(identity,previous);}
 reveal(index:number,amount:number,reduced:boolean,tier:WinTier=null,low=false){
  if(!this.ledger.offer(index,amount))return;
  if(amount<=0){this.ledger.settle(index);return;}
  const label=new MoneyReadout({identity:String(index),value:amount,target:amount,remaining:0},{size:32,color:tier?0xfffcde:0xf3fbff,align:'center',width:600,plus:!tier,centerY:true,hero:false,reduced:true,ticks:false,draw:this.draw}),trail=new Graphics(),celebration=tier?new WinCelebration(tier,low):null;
  if(celebration)this.root.addChild(celebration.root);
  this.root.addChild(trail,label);this.flights.push({index,amount,age:reduced?WIN_COUNT_FINISH+.3:0,transferAge:null,speed:1.5,label,trail,width:label.getLocalBounds().width,launched:false,countFinished:reduced,tier,celebration});label.alpha=0;
 }
 finish(index:number){const f=this.flights.find(f=>f.index===index);if(!f||f.transferAge!==null)return;f.age=Math.max(WIN_COUNT_FINISH+.3,f.age);f.countFinished=true;f.label.display(f.amount);f.celebration?.finish();}
 /** Advancing the card is the only trigger for the reward's exit/transfer clock. */
 rush(){for(const f of this.flights)f.transferAge??=0;}
 deposit(index:number,amount:number){
  this.ledger.offer(index,amount);const flight=this.flights.find(f=>f.index===index);if(flight){flight.transferAge??=0;flight.speed=Math.max(flight.speed,3);return;}
  if(this.ledger.settle(index))this.credit(this.ledger.total);
 }
 update(dt:number,w:number,h:number,reduced:boolean){
  const stone=rewardLayout(w,h),target=totalWinLayout(w,h),special=specialWinGeometry(w,h),step=Math.min(.05,dt);
  this.impact.clear();this.impacts=this.impacts.map(age=>age+step).filter(age=>age<.24);
  for(const age of this.impacts){const p=age/.24;for(let i=0;i<8;i++){const a=i*Math.PI/4,dx=Math.cos(a),dy=Math.sin(a),r=25+p*24,tail=r+14*(1-p);this.impact.moveTo(target.x+dx*r,target.y+dy*r*.6).lineTo(target.x+dx*tail,target.y+dy*tail*.6).stroke({color:i%2?0x9eefff:0xfff297,width:3*(1-p),alpha:1-p});}}
  for(const f of [...this.flights]){
   f.age+=step;if(f.transferAge!==null)f.transferAge+=step*f.speed;
   const presentationAge=reduced?Math.max(WIN_COUNT_FINISH+.3,f.age):f.age,celebration=celebrationPose(presentationAge,f.transferAge??0);f.celebration?.update(presentationAge,w,h,f.transferAge??0,reduced);const bone=f.celebration?.amountPose();
   const source=f.tier?{x:bone?.x??special.x,y:bone?.y??special.amountY,size:special.size*(bone?.scaleY??1),width:special.amountWidth*(bone?.scaleX??1)}:{...stone,size:stone.size*1.35,width:stone.width*1.5};
   const age=WIN_LAUNCH_TIME-WIN_FOLD_TIME+(f.transferAge??0),pose=winFlightPose(age,source,target),count=f.transferAge!==null?1:f.tier?celebration.count:Math.min(1,presentationAge/WIN_COUNT_TIME),travel=pose.progress,morph=Math.sin(travel*Math.PI);
   if(f.tier&&!f.countFinished&&presentationAge>=WIN_COUNT_FINISH&&f.transferAge===null){f.countFinished=true;playSound('rare',{gain:.2});}
   f.label.display(f.amount*(1-(1-count)**(f.tier?2:3)));f.label.position.set(pose.x,pose.y);
   const emphasis=f.tier&&f.transferAge===null?1+celebration.amountPulse:1;
   const start=Math.min(source.size/32,source.width/f.width)*emphasis,end=Math.min(target.size/32*.86,target.width/f.width),size=start+(end-start)*pose.blend;
   const squeeze=travel===0?pose.fold:Math.max(0,1-travel*5);
   f.label.scale.set(size*(1-squeeze*.16+morph*.18),size*(1-squeeze*.45-morph*.48));f.label.alpha=(f.tier?celebration.amountAlpha:Math.min(1,f.age/.09))*(1-morph*.72);
   if(travel>0&&!f.launched){f.launched=true;playSound('flip',{gain:.65});}
   const trail=f.trail.clear();if(travel>0&&travel<1&&!reduced){
    for(let i=0;i<14;i++){const a=winFlightPose(age-.006*(15-i),source,target),b=winFlightPose(age-.006*(14-i),source,target);if(a.progress===0)continue;const width=(i/14)*9;trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:f.tier?0xffe85c:0x4acbff,width:width+6,alpha:i/14*.22}).moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0xdfffff,width:Math.max(1,width*.35),alpha:i/14*.9});}
    const flare=7+morph*7;trail.poly([pose.x-flare*1.6,pose.y,pose.x-3,pose.y-3,pose.x,pose.y-flare*.7,pose.x+3,pose.y-3,pose.x+flare*1.6,pose.y,pose.x+3,pose.y+3,pose.x,pose.y+flare*.7,pose.x-3,pose.y+3]).fill({color:0xf1ffff,alpha:morph*.9});
   }
   if(f.transferAge!==null&&(pose.done||reduced)){this.ledger.settle(f.index);this.remove(f);this.credit(this.ledger.total);if(!reduced){this.impacts.push(0);playSound('wincollect',{gain:f.tier?1.35:1.05});}}
  }
 }
 private remove(f:Flight){this.flights=this.flights.filter(item=>item!==f);f.label.destroy();f.trail.destroy();f.celebration?.destroy();}
 private clear(){for(const f of [...this.flights])this.remove(f);this.impacts=[];this.impact.clear();}
 destroy(){this.clear();this.root.destroy({children:true});}
}
