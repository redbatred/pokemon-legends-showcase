import {PACK_TEAR_LIMIT,type PackTearState} from './packTearGeometry';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const PEEL_START=.18,PEEL_DURATION=1.04;
/** Pull from the snip toward the opposite corner, or down to curl the released foil. */
export function peelProgress(dx:number,dy:number,scale:number){return clamp(Math.max(-dx,dy*.85)/Math.max(1,184*scale));}
export function cutHandleHit(x:number,y:number){return x>=60&&x<=210&&y>=-218&&y<=-105;}
const keys=[
 [0,0,0,0,0,0],[.15,1,0,0,0,0],[.25,1,.06,.15,0,.01],[.43,1,.32,.48,0,.06],
 [.52,1.15,.37,.62,0,.1],[.76,.7,.79,.86,.25,.58],[.88,.35,PACK_TEAR_LIMIT,1,.8,.86],[1,0,PACK_TEAR_LIMIT,1,1,1],
];
/** Shared by pointer scrubbing and the timed animation, so releasing cannot jump. */
export function manualPeelPose(progress:number):PackTearState{
 const p=clamp(progress),end=keys.findIndex(k=>k[0]>=p),b=keys[Math.max(1,end)],a=keys[Math.max(0,end-1)],u=clamp((p-a[0])/(b[0]-a[0])),t=u*u*(3-2*u),at=(i:number)=>a[i]+(b[i]-a[i])*t;
 return {tension:at(1),rip:at(2),curl:at(3),open:at(4),pull:at(5),crumple:0};
}
