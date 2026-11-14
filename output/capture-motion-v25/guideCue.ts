import {playbackTime} from './timing';
export type GuideCueId='arrive'|'throw'|'knock'|'escape'|'caught';
/** Seconds of the throw wait given to the rivals' entrance line before their dare. */
export const ARRIVE_HOLD=2.5;
export interface GuideCue {id:GuideCueId;age:number;opacity:number;}
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
/** Rivals stay out of capture and counting; a separate reaction follows the settled reward. */
export function guideCue(t:number,rewardAge:number,caught:boolean,waiting:boolean,held:number):GuideCue|null{
 // While the player holds the ball: first the rivals announce themselves, then they dare the throw.
 const entering=held<ARRIVE_HOLD,local=entering?held:held-ARRIVE_HOLD,span=entering?ARRIVE_HOLD:3.1,id=entering?'arrive' as const:'throw' as const;
 const heldOpacity=smooth(local/.26)*(1-smooth((local-span+.3)/.3));
 if(waiting&&local<span)return{id,age:local,opacity:heldOpacity};
 if(held>0&&local<span&&t>=5&&t<5.24)return{id,age:local+t-5,opacity:heldOpacity*(1-smooth((t-5)/.24))};
 if(t>=9.05&&t<11.65){const age=playbackTime(t+4.45)-playbackTime(13.5);return{id:'knock',age,opacity:smooth(age/.22)*(1-smooth((t-11.4)/.25))};}
 if(!caught&&t>=15.4&&t<17)return{id:'escape',age:t-15.4,opacity:smooth((t-15.4)/.18)*(1-smooth((t-16.88)/.12))};
 if(caught&&rewardAge>=6.05&&t>=16.75&&t<17){const age=playbackTime(t+4.45)-playbackTime(21.2);return{id:'caught',age,opacity:smooth(age/.22)*(1-smooth((t-16.97)/.03))};}
 return null;
}
export function guideLayout(w:number,h:number,id:GuideCueId){
 const portrait=w<h,right=id==='escape'||id==='caught',size=portrait?230:240;
 const portraitX=right?w-size*.5:size*.5,portraitY=id==='caught'?h-106:right?h-280:h*.12+size/2;
 const bubbleW=portrait?450:300,bubbleH=portrait?116:126;
 const bubbleX=right?w-size-bubbleW-20:size+20;
 const bubbleY=id==='caught'?h-163:right?portraitY-70:h*.12;
 return{size,right,portraitX,portraitY,bubbleX,bubbleY,bubbleW,bubbleH};
}
