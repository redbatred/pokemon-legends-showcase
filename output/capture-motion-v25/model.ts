import {encounter} from './encounter';
export type Outcome = 'capture' | 'escape';
export const DURATION = 23.05;
export const OUTCOME_AT = 12.2;
export const clamp = (n:number) => Math.max(0, Math.min(1,n));
export const smooth = (n:number) => {const p=clamp(n); return p*p*(3-2*p)};
export const mix = (a:number,b:number,p:number) => a+(b-a)*p;
// Exactly half of the 256 equally likely byte values select each demo outcome.
export function outcomeFromByte(byte:number):Outcome {
 if(!Number.isInteger(byte)||byte<0||byte>255)throw new RangeError('Expected an unsigned byte');
 return byte<128?'capture':'escape';
}
export function awardAt(outcome:Outcome,time:number) {
 return outcome==='capture'&&time>=14.15 ? {multiplier:encounter.multiplier,bet:encounter.bet,total:encounter.multiplier*encounter.bet} : null;
}
export function camera(width:number,height:number,ballX:number,ballBase:number,time:number,outcome:Outcome){
 const out=smooth((time-(outcome==='escape'?12.2:12.65))/(outcome==='escape'?.68:.8));
 const travel=smooth((time-9.05)/.65)*(1-out),z=mix(1,width<1000?2.1:2,travel);
 return {z,x:Math.min(0,Math.max(width-width*z,mix(ballX,width*.5,travel)-ballX*z)),y:Math.min(0,Math.max(height-height*z,mix(ballBase-52,height*.56,travel)-(ballBase-52)*z))};
}
