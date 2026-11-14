import type {CinemaTier} from './winChoreography';
/** The count of a pack's total: short, like a slot. Cards pay in a fast cascade, the number rolls with accelerating ticks,
 * the tier name upgrades in place on the way up, and the total lands once. Presentation only: nothing here decides an outcome. */
export const PACK_TIERS:readonly {tier:CinemaTier;at:number;title:string}[]=[{tier:'big',at:10,title:'BIG WIN'},{tier:'mega',at:50,title:'MEGA WIN'},{tier:'epic',at:100,title:'EPIC WIN'},{tier:'legendary',at:150,title:'LEGENDARY WIN'}];
/** Highest tier reached at `ratio` times the pack price, or -1 below the first. */
export function packTierIndex(ratio:number){let index=-1;PACK_TIERS.forEach((tier,i)=>{if(ratio>=tier.at)index=i;});return index;}
/** Presentation tier of a pack total; it picks a palette and a sound weight. Totals under the first tier use its palette. */
export function packWinTier(ratio:number):CinemaTier{return PACK_TIERS[Math.max(0,packTierIndex(ratio))].tier;}

export const PACK_COUNT={/** A card's light takes this long to reach the total. */travel:.2,/** Roll with no tier to cross. */base:.85,/** Added for every tier crossed, including its catch. */perTier:.42,/** The roll catches on an upgrade for this long. */hold:.11,/** The landing holds its first frame for this long. */stop:.07,/** Seconds after landing before the count is at rest. */settle:.9};
export interface PackCountPlan{from:number;to:number;price:number;start:number;land:number;
 /** Roll segments: value runs `from`→`to` over `begin`→`end`; segments after the first begin with a tier upgrade. */
 segments:{begin:number;end:number;from:number;to:number;tier:number}[]}
/** Plan one roll from `from` to `to` starting at `start` seconds. It accelerates into every tier it crosses, catches there
 * for a moment, and lands on the exact total. An ordinary pack lands under a second after it starts; the top tier in about 2.5 s. */
export function packCountPlan(from:number,to:number,price:number,start:number):PackCountPlan{
 const unit=Math.max(1,price),crossed=PACK_TIERS.map((tier,index)=>({index,value:tier.at*unit})).filter(tier=>tier.value>from&&tier.value<to);
 const duration=PACK_COUNT.base+PACK_COUNT.perTier*crossed.length,rolling=(duration-PACK_COUNT.hold*crossed.length)/(crossed.length+1);
 const stops=[from,...crossed.map(tier=>tier.value),to],segments:PackCountPlan['segments']=[];let time=start,tier=packTierIndex(from/unit);
 for(let i=0;i<stops.length-1;i++){if(i>0){time+=PACK_COUNT.hold;tier=crossed[i-1].index;}segments.push({begin:time,end:time+rolling,from:stops[i],to:stops[i+1],tier});time+=rolling;}
 // A total that lands exactly on a threshold takes that tier's upgrade with the landing itself.
 return {from,to,price:unit,start,land:time,segments};
}
/** The roll at `age` seconds: the value on screen, the tier named above it and how long ago that tier was stamped. */
export function packCountPose(plan:PackCountPlan,age:number){
 const last=plan.segments[plan.segments.length-1],finalTier=packTierIndex(plan.to/plan.price);
 if(age<=plan.start)return {value:plan.from,tier:plan.segments[0].tier,tierAge:-1,progress:0,landed:false,landAge:-1,rolling:false};
 if(age>=plan.land)return {value:plan.to,tier:finalTier,tierAge:finalTier>last.tier?age-plan.land:plan.segments.length>1?age-last.begin:-1,progress:1,landed:true,landAge:age-plan.land,rolling:false};
 const index=Math.max(0,plan.segments.findIndex(segment=>age<segment.end)),segment=plan.segments[index<0?plan.segments.length-1:index],catching=age<segment.begin;
 // Every segment accelerates; only the last eases onto its total.
 const u=Math.max(0,Math.min(1,(age-segment.begin)/(segment.end-segment.begin))),final=segment===last,eased=final?1-(1-u)**2.2*(1-.35*u):u**1.7;
 return {value:catching?segment.from:segment.from+(segment.to-segment.from)*eased,tier:segment.tier,tierAge:index>0?age-(segment.begin-PACK_COUNT.hold):-1,progress:(age-plan.start)/(plan.land-plan.start),landed:false,landAge:-1,rolling:!catching};
}
/** Ticks heard so far at `progress` through a roll that crosses `tiers` upgrades: sparse at first, a blur at the end. */
export function packCountTicks(progress:number,tiers:number){const p=Math.max(0,Math.min(1,progress));return Math.floor((9+7*tiers)*(.4*p+.6*p*p));}
/** When each of `count` tiles pays, given when the first is on the table: tens of milliseconds apart, never slower for a full pack. */
export function packCascade(index:number,count:number,first:number){return first+index*Math.max(.03,Math.min(.07,.5/Math.max(1,count-1)));}
/** The landing reaches a tile `distance` (0..1 of the panel) from the total after this delay, as one hop. */
export function packPunch(sinceLand:number,distance:number){const t=sinceLand-distance*.16;return t<=0?0:Math.sin(Math.min(t/.22,1)*Math.PI)*Math.exp(-t*6);}
