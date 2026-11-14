/** Keep one readable award as it moves into the existing total, without folding or fading out. */
export function cinematicReturnFlight(seconds:number,from:{x:number;y:number},to:{x:number;y:number}){
 const p=Math.max(0,Math.min(1,seconds/.56)),t=p*p*p*(p*(p*6-15)+10),arc=Math.sin(Math.PI*t);
 return {x:from.x+(to.x-from.x)*t+arc*Math.min(32,Math.abs(to.y-from.y)*.045),y:from.y+(to.y-from.y)*t,progress:p,blend:t,fold:0,done:seconds>=.56};
}
