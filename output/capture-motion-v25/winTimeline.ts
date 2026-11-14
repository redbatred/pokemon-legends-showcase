/** Seconds after the face-up reveal; shared with the score's cue manifest. */
export const WIN_STAGES=[
 {start:1.15,end:1.50,value:10},
 {start:1.95,end:2.30,value:30},
 {start:2.80,end:3.20,value:75},
 {start:3.70,end:4.10,value:120},
 {start:4.78,end:5.3,value:180},
] as const;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function winState(age:number,targetMultiplier=180){let value=0,tier=-1,impact=0;for(let i=0;i<WIN_STAGES.length;i++){const s=WIN_STAGES[i],previous=i?WIN_STAGES[i-1].value:0;if(age>=s.start){const p=clamp((age-s.start)/(s.end-s.start));value=previous+(s.value-previous)*(p**2.65);}if(age>=s.end){tier=i;const a=age-s.end;impact=Math.max(impact,Math.exp(-a*13),a>=.12?.72*Math.exp(-(a-.12)*17):0);}}return{value:Math.min(targetMultiplier,value/180*targetMultiplier),tier,impact,complete:age>=5.3};}
