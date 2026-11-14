import {clamp,smooth} from './showdownModel';
/** Keep the opaque midpoint while required assets load; only then reveal the destination. */
export function advanceShowdownTransition(time:number,dt:number,ready:boolean,reduced:boolean){
 const midpoint=reduced?.12:.88;
 return Math.min(ready?Infinity:midpoint,time+Math.max(0,dt));
}
export function showdownTransitionFrame(time:number,reduced:boolean){
 const close=reduced?.12:.38,openAt=reduced?.12:.88,end=reduced?.28:1.62;
 const cover=time<close?smooth(time/close):1-smooth((time-openAt)/(end-openAt));
 return {cover:clamp(cover),swap:time>=openAt,arrival:smooth((time-openAt)/(end-openAt)),done:time>=end,emblem:reduced?0:Math.sin(Math.PI*clamp(time/end))};
}
/** Reverse from the current coverage, rather than flashing an uncovered loading scene. */
export function reverseShowdownTransition(time:number,reduced:boolean){
 const frame=showdownTransitionFrame(time,reduced),inverse=.5-Math.sin(Math.asin(1-2*frame.cover)/3);
 return {time:Math.max(0,inverse)*(reduced?.12:.38),retainOrigin:!frame.swap};
}
