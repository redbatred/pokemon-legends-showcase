import {smooth,WIN_CINEMA_FINISH} from './winCinemaMotion';
const routes=[[1,2,2,1],[2,2,1,2],[3,3,1,3]];
/** Stable seated bodies breathe locally; groups reach different held cheers after contact. */
export function arenaCrowdMotion(age:number,group:number,reduced=false){
 if(reduced)return {from:0,to:0,mix:0,cheer:0,weights:[1,0,0,0]};
 const row=Math.floor(group/16),column=group%16,delay=.045+Math.abs(column-7.5)*.012+row*.035;
 const cheer=smooth((age-WIN_CINEMA_FINISH-delay)/.22);
 let from=0,to=0,mix=0;
 const weights=[1-cheer,0,0,0];
 if(cheer>0){
  const t=Math.max(0,age-WIN_CINEMA_FINISH-delay-.48),route=routes[group%3],hold=1.12+(group%7)*.137,slot=Math.floor(t/hold)%route.length;
  from=route[slot];to=route[(slot+1)%route.length];mix=smooth((t%hold-hold+.48)/.48);
  weights[from]+=(1-mix)*cheer;weights[to]+=mix*cheer;
 }
 return {from,to,mix,cheer,weights};
}
