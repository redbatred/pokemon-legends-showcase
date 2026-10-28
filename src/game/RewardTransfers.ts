import {Container,Graphics} from 'pixi.js';
import {MoneyReadout} from './MoneyReadout';
import {WinLedger,winFlightPose,WIN_COUNT_TIME,WIN_LAUNCH_TIME,type WinTier} from './winTransfer';
import {WinCelebration,specialWinGeometry} from './WinCelebration';
import {rewardLayout,totalWinLayout} from './modalLayout';
import {playSound} from './audio';
type Flight={index:number;amount:number;age:number;speed:number;label:MoneyReadout;trail:Graphics;width:number;launched:boolean;tier:WinTier;hold:number;celebration:WinCelebration|null};
/** One persistent award morphs into a comet; only its arrival credits the presentation total. */
export class RewardTransfers {
 root=new Container();ledger=new WinLedger();private flights:Flight[]=[];private impacts:number[]=[];private impact=new Graphics();
 constructor(private credit:(total:number)=>void,private draw:()=>void){this.root.eventMode='none';this.root.addChild(this.impact);}
 get celebrationOpacity(){return Math.max(0,...this.flights.map(f=>f.tier?Math.max(0,Math.min(1,(f.hold+.42-f.age)/.16)):0));}
 reset(identity:string,previous:number[]=[]){this.clear();this.ledger.reset(identity,previous);}
 reveal(index:number,amount:number,reduced:boolean,tier:WinTier=null){
  if(!this.ledger.offer(index,amount))return;
  if(reduced||amount<=0){this.ledger.settle(index);this.credit(this.ledger.total);return;}
  const label=new MoneyReadout({identity:String(index),value:amount,target:amount,remaining:0},{size:32,color:tier?0xfff5a2:0xf3fbff,align:'center',width:600,plus:true,centerY:true,hero:false,reduced:true,ticks:false,draw:this.draw}),trail=new Graphics(),celebration=tier?new WinCelebration(tier):null;
  if(celebration){this.root.addChild(celebration.root);playSound(tier==='special'?'rare':'win',{gain:tier==='special'?.6:.7});}
  this.root.addChild(trail,label);this.flights.push({index,amount,age:0,speed:1,label,trail,width:label.getLocalBounds().width,launched:false,tier,hold:tier==='epic'?.95:tier?.70:0,celebration});label.alpha=0;
 }
 rush(){for(const f of this.flights){f.age=Math.max(f.age,WIN_LAUNCH_TIME+f.hold);f.speed=Math.max(f.speed,3);}}
 deposit(index:number,amount:number){
  this.ledger.offer(index,amount);const flight=this.flights.find(f=>f.index===index);if(flight){flight.speed=Math.max(flight.speed,6);return;}
  if(this.ledger.settle(index))this.credit(this.ledger.total);
 }
 update(dt:number,w:number,h:number,reduced:boolean){
  const stone=rewardLayout(w,h),target=totalWinLayout(w,h),special=specialWinGeometry(w,h),step=Math.min(.05,dt);
  this.impact.clear();this.impacts=this.impacts.map(age=>age+step).filter(age=>age<.24);
  for(const age of this.impacts){const p=age/.24;for(let i=0;i<8;i++){const a=i*Math.PI/4,dx=Math.cos(a),dy=Math.sin(a),r=25+p*24,tail=r+14*(1-p);this.impact.moveTo(target.x+dx*r,target.y+dy*r*.6).lineTo(target.x+dx*tail,target.y+dy*tail*.6).stroke({color:i%2?0x9eefff:0xfff297,width:3*(1-p),alpha:1-p});}}
  for(const f of [...this.flights]){
   f.age+=step*f.speed;const source=f.tier?{x:special.x,y:special.amountY,size:special.size,width:special.width*.60}:{...stone,size:stone.size*1.35,width:stone.width*1.5};
   const age=f.age-f.hold,pose=winFlightPose(age,source,target),count=Math.min(1,f.age/WIN_COUNT_TIME),travel=pose.progress,morph=Math.sin(travel*Math.PI);
   f.celebration?.update(f.age,w,h,f.hold);
   f.label.display(f.amount*(1-(1-count)**3));f.label.position.set(pose.x,pose.y);
   const start=Math.min(source.size/32,source.width/f.width),end=Math.min(target.size/32*.86,target.width/f.width),size=start+(end-start)*pose.blend;
   const squeeze=travel===0?pose.fold:Math.max(0,1-travel*5);
   f.label.scale.set(size*(1-squeeze*.16+morph*.18),size*(1-squeeze*.45-morph*.48));f.label.alpha=Math.min(1,f.age/.09)*(1-morph*.72);
   if(travel>0&&!f.launched){f.launched=true;playSound('flip',{gain:.65});}
   const trail=f.trail.clear();if(travel>0&&travel<1&&!reduced){
    for(let i=0;i<14;i++){const a=winFlightPose(age-.006*(15-i),source,target),b=winFlightPose(age-.006*(14-i),source,target);if(a.progress===0)continue;const width=(i/14)*9;trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:f.tier?0xffe85c:0x4acbff,width:width+6,alpha:i/14*.22}).moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({color:0xdfffff,width:Math.max(1,width*.35),alpha:i/14*.9});}
    const flare=7+morph*7;trail.poly([pose.x-flare*1.6,pose.y,pose.x-3,pose.y-3,pose.x,pose.y-flare*.7,pose.x+3,pose.y-3,pose.x+flare*1.6,pose.y,pose.x+3,pose.y+3,pose.x,pose.y+flare*.7,pose.x-3,pose.y+3]).fill({color:0xf1ffff,alpha:morph*.9});
   }
   if(pose.done||reduced){this.ledger.settle(f.index);this.remove(f);this.credit(this.ledger.total);if(!reduced){this.impacts.push(0);playSound('wincollect',{gain:f.tier?1.35:1.05});}}
  }
 }
 private remove(f:Flight){this.flights=this.flights.filter(item=>item!==f);f.label.destroy();f.trail.destroy();f.celebration?.destroy();}
 private clear(){for(const f of [...this.flights])this.remove(f);this.impacts=[];this.impact.clear();}
 destroy(){this.clear();this.root.destroy({children:true});}
}
