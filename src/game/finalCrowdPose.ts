import {smooth,WIN_CINEMA_FINISH} from './winCinemaMotion';
const poses=[1,3,2,3,1,2];
/** Stand sections raise their arms after contact, then sustain a faster cheer cadence. */
export function finalCrowdPose(age:number,section:number,reduced=false){
 const t=age-WIN_CINEMA_FINISH,delay=.04+Math.abs(section-3.5)*.025;
 const celebration=reduced?0:smooth((t-delay)/.15);
 if(t<.55)return {from:1,to:1,mix:0,celebration};
 const hold=.23+(section%3)*.024,clock=Math.max(0,t-.55-delay)*(1+(section%4)*.11),index=Math.floor(clock/hold)%poses.length;
 return {from:poses[index],to:poses[(index+1)%poses.length],mix:smooth((clock%hold-hold+.13)/.13),celebration};
}
