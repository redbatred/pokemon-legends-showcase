import {smooth,unit,WIN_CINEMA_FINISH,WIN_CINEMA_IMPACT,FINAL_STRIKE_RELEASE} from './winCinemaMotion';
export type CinemaTier='big'|'mega'|'epic'|'legendary';
const profiles={
 big:{title:'BIG WIN',rank:1,strength:.72,orbit:.10,color:0xe6faff},
 mega:{title:'MEGA WIN',rank:2,strength:1.12,orbit:.22,color:0xffe4a0},
 epic:{title:'EPIC WIN',rank:3,strength:1.58,orbit:.34,color:0xffc888},
 legendary:{title:'LEGENDARY WIN',rank:4,strength:2,orbit:.44,color:0xffefad},
};
export const winTierProfile=(tier:CinemaTier)=>profiles[tier];
export type AttackBeat={start:number;release:number;impact:number;end:number;strength:number;finisher:boolean};
const beatCache:Partial<Record<CinemaTier,AttackBeat[]>>={};
export function winAttackBeats(tier:CinemaTier):AttackBeat[]{if(beatCache[tier])return beatCache[tier]!;const p=profiles[tier];return beatCache[tier]=[
 {start:.42,release:1.08,impact:WIN_CINEMA_IMPACT,end:2.48,strength:.8,finisher:false},
 {start:2.72,release:3.25,impact:3.55,end:4.04,strength:.35+p.rank*.10,finisher:false},
 ...(p.rank>=2?[{start:4.05,release:4.32,impact:4.55,end:5.05,strength:.40+p.rank*.12,finisher:false}]:[]),
 {start:5.12,release:FINAL_STRIKE_RELEASE,impact:WIN_CINEMA_FINISH,end:7.18,strength:p.strength,finisher:true},
 ];}
/** Shared choreography for native bones, socket FX, sound and camera. No per-action clock reset. */
export function winChoreography(age:number,tier:CinemaTier){
 const beats=winAttackBeats(tier),beat=beats.find(b=>age>=b.start&&age<b.end);
 if(!beat)return{beat:null,attackWeight:0,clipPhase:0,charge:0,recoil:0,finisher:false,strength:0};
 const attackWeight=smooth((age-beat.start)/.16)*(1-smooth((age-beat.end+.25)/.25));
 const contactPhase=beat.finisher?.48:.65;
 const clipPhase=age<beat.release?smooth((age-beat.start)/(beat.release-beat.start))*.36:age<beat.impact?.36+smooth((age-beat.release)/(beat.impact-beat.release))*(contactPhase-.36):contactPhase+smooth((age-beat.impact)/(beat.end-beat.impact))*(1-contactPhase);
 const charge=age<beat.release?smooth((age-beat.start)/(beat.release-beat.start)):(1-smooth((age-beat.release)/(beat.impact-beat.release)));
 const t=age-beat.impact,recoil=t>=0?Math.sin(Math.min(1,t/.42)*Math.PI)*Math.exp(-t*2):0;
 return{beat,attackWeight,clipPhase,charge,recoil,finisher:beat.finisher,strength:beat.strength};
}
export function packAwardPose(age:number,cards:number|readonly number[]){
 const values=typeof cards==='number'?Array(Math.max(1,cards)).fill(1) as number[]:[...cards],total=values.reduce((a,b)=>a+b,0)||1,n=Math.max(1,values.length);
 let count=0;for(let i=0;i<n;i++){const end=1.7+(WIN_CINEMA_FINISH-1.7)*(i+1)/n,start=i===0?.7:1.7+(WIN_CINEMA_FINISH-1.7)*i/n+.10;count+=values[i]/total*smooth((age-start)/(end-start));}
 return {count:unit(count),landed:age>=WIN_CINEMA_FINISH,enter:smooth(age/.55),impact:age>=WIN_CINEMA_FINISH?Math.exp(-(age-WIN_CINEMA_FINISH)*4):0};
}
