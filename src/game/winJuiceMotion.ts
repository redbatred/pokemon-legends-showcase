import {smooth,unit,FINAL_STRIKE_RELEASE,WIN_CINEMA_FINISH,WIN_CINEMA_IMPACT} from './winCinemaMotion';
import {winAttackBeats,winTierProfile,type CinemaTier} from './winChoreography';

/** Presentation palette per tier: cool → gold → hot → white-gold. Labels never alter outcomes. */
export const TIER_PALETTE:Record<CinemaTier,{fill:number;edge:number;glow:number;coin:number}>={
 big:{fill:0xf3fcff,edge:0x2f9bff,glow:0x6fd4ff,coin:24},
 mega:{fill:0xffe6a4,edge:0xff9a2e,glow:0xffc552,coin:40},
 epic:{fill:0xffd2a8,edge:0xff4f6e,glow:0xff7a4d,coin:60},
 legendary:{fill:0xfff6c9,edge:0xffb400,glow:0xfff0a0,coin:84},
};
const LADDER:Record<CinemaTier,{tier:CinemaTier;time:number}[]>={
 big:[],
 mega:[{tier:'big',time:3.55}],
 epic:[{tier:'big',time:3.55},{tier:'mega',time:4.55}],
 legendary:[{tier:'big',time:WIN_CINEMA_IMPACT},{tier:'mega',time:3.55},{tier:'epic',time:4.55}],
};
/** Lower tiers land on earlier strikes, on the frame of contact; the awarded tier always belongs to the finisher. */
export const winLadder=(tier:CinemaTier)=>LADDER[tier];
/** Balatro-style punch: an instant squash that springs back and rings out over 0.4 s. */
export function juiceUp(t:number,amount=.4,twist=.1){
 if(t<0||t>=.4)return {scale:1,rotation:0};
 const k=1-t/.4;
 return {scale:1-.6*amount*(1-smooth(t/.14))+amount*Math.sin(t*50.8)*k**3,rotation:twist*Math.sin(t*40.8)*k*k};
}
/** A rung falls while the attack travels and lands with it, rings out, then yields the instant the next tier lands. */
export function ladderPose(age:number,tier:CinemaTier,reduced=false){
 const rungs=winLadder(tier),lead=.12;let index=-1;for(let i=0;i<rungs.length;i++)if(age>=rungs[i].time-lead)index=i;
 if(index<0)return {index,previous:-1,enter:0,scale:1,rotation:0,alpha:0,flash:0,exit:0,hit:-99};
 const hit=age-rungs[index].time,t=hit+lead,leave=unit((age-WIN_CINEMA_FINISH+.06)/.20);
 if(reduced)return {index,previous:-1,enter:1,scale:1,rotation:0,alpha:hit<0?0:1-leave,flash:0,exit:leave,hit};
 const drop=unit(t/lead),punch=juiceUp(hit,.6,.09);
 return {index,previous:t<.18?index-1:-1,enter:drop,scale:(3-2*drop**4)*punch.scale,rotation:punch.rotation-.035,alpha:smooth(t/.05)*(1-leave),flash:hit>=0?Math.max(0,1-hit/.16):0,exit:leave,hit};
}
/** Every strike that moves the amount, with its weight. The opening strike belongs to the lens. */
export function juiceBeats(tier:CinemaTier){
 const rank=winTierProfile(tier).rank,rungs=winLadder(tier);
 return winAttackBeats(tier).map((beat,index)=>({...beat,index,opening:index===0,weight:beat.finisher?1+rank*.25:beat.impact===WIN_CINEMA_IMPACT?.55:.5+beat.strength*.5,rung:rungs.findIndex(r=>Math.abs(r.time-beat.impact)<.01)}));
}
/** Additive trauma: each strike stacks, the visible shake follows trauma squared. */
export function winTrauma(age:number,tier:CinemaTier,reduced=false){
 if(reduced)return 0;let trauma=0;
 for(const beat of juiceBeats(tier)){const t=age-beat.impact;if(t>=0)trauma+=Math.max(0,(beat.finisher?.62+winTierProfile(tier).rank*.095:.30+beat.strength*.12)-t*1.2);}
 for(const rung of winLadder(tier)){const t=age-rung.time;if(t>=0&&rung.time>WIN_CINEMA_IMPACT)trauma+=Math.max(0,.22-t*1.2);}
 return Math.min(1,trauma);
}
/** Deterministic two-axis noise; no allocation and stable for a given age. */
export function shakeOffset(age:number,trauma:number,max:number){
 if(trauma<=0)return {x:0,y:0,roll:0};
 const power=trauma*trauma*max;
 return {x:(Math.sin(age*113.1)+Math.sin(age*71.7+1.3)*.6)*.62*power,y:(Math.sin(age*97.3+2.1)+Math.sin(age*59.9+.4)*.6)*.62*power,roll:Math.sin(age*83.9+.7)*trauma*trauma*.012};
}
/** A fast lens punch on contact which releases with the recovery. */
export function scenePunch(age:number,tier:CinemaTier,reduced=false){
 if(reduced)return 0;let punch=0;
 for(const beat of juiceBeats(tier)){const t=age-beat.impact;if(t>=0&&t<.6)punch+=(beat.finisher?.085:.03+beat.strength*.03)*smooth(t/.05)*Math.exp(-t*7);}
 for(const rung of winLadder(tier)){const t=age-rung.time;if(t>=0&&t<.6&&rung.time>WIN_CINEMA_IMPACT)punch+=.03*smooth(t/.05)*Math.exp(-t*8);}
 return punch;
}
/** Contact light on the finisher: one hard white frame that falls away within a quarter second. */
export function impactFrame(age:number,reduced=false){
 const t=age-WIN_CINEMA_FINISH;if(reduced||t<0||t>=.3)return {white:0};
 return {white:t<.034?.9:.62*(1-(t-.034)/.266)**2};
}
/** The opening strike leaves the Pokémon as light, grows to flood the lens and clears onto the arena. */
export function lensBloom(age:number,reduced=false){
 const start=1.08,travel=unit((age-start)/(WIN_CINEMA_IMPACT-start)),after=age-WIN_CINEMA_IMPACT;
 if(reduced||age<start||after>.62)return {visible:false,centre:0,grow:0,light:0,veil:0,rush:0};
 return {visible:true,centre:smooth(travel),grow:travel**3.2,light:after<0?1:1-smooth(after/.36),veil:after<0?smooth((travel-.84)/.16):1-smooth((after-.03)/.22),rush:after<0?.3+travel:0};
}
/** Score heat: the amount ignites as it climbs and burns hardest after the final tier lands. */
export function scoreHeat(age:number,count:number,tier:CinemaTier,exitAge=0,reduced=false){
 if(reduced)return 0;const rank=winTierProfile(tier).rank,landed=smooth((age-WIN_CINEMA_FINISH)/.25);
 return (unit(count)*(.35+rank*.16)+landed*(.3+rank*.14))*smooth((age-1.9)/.4)*(1-smooth(exitAge/.3));
}
/** Hero backlight: a pulse on every strike and a sustained fan behind the held award. */
export function heroLight(age:number,tier:CinemaTier,exitAge=0,reduced=false){
 if(reduced)return {rays:0,core:0};const rank=winTierProfile(tier).rank;let pulse=0,charge=0;
 for(const beat of juiceBeats(tier)){const t=age-beat.impact;if(t>=0)pulse+=Math.exp(-t*3.2)*beat.weight*.42;if(!beat.opening)charge+=smooth((age-beat.start)/(beat.release-beat.start))*(1-smooth((age-beat.release)/.2))*(beat.finisher?1:.45);}
 const held=smooth((age-WIN_CINEMA_FINISH)/.3)*(.55+rank*.13),release=1-smooth(exitAge/.4);
 return {rays:Math.min(1.6,pulse+held)*release,core:Math.min(1.4,charge*.8+pulse*.5+held*.35)*release};
}
/** Count ticks rise in pitch across the roll-up and restart slightly lower after each slam. */
export function tickRate(count:number,segment:number){return Math.min(2,.86+unit(count)*.62+segment*.06);}
/** Slow motion for the eye shot: the body all but stops in its wind-up, then snaps into the release on time. */
export const EYE_SLOW={from:5.30,to:5.60,rate:.12};
/** Performance clock for the 3D body: slowed through the eye shot, held on contact, and rejoining real time without a jump. */
export function strikeClock(age:number,tier:CinemaTier,reduced=false){
 if(reduced)return age;
 const {from,to,rate}=EYE_SLOW,release=FINAL_STRIKE_RELEASE;
 if(age>from&&age<release){const held=from+(Math.min(age,to)-from)*rate;return age<=to?held:held+(release-held)*((age-to)/(release-to))**2;}
 const hold=.07+winTierProfile(tier).rank*.03,t=age-WIN_CINEMA_FINISH;
 if(t<=0)return age;
 return t<hold?WIN_CINEMA_FINISH:age-hold*(1-smooth((t-hold)/.45));
}
