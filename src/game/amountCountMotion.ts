const stops=[0,.24,.44,.61,.76,.89,1];
const values=[0,.07,.18,.34,.54,.77,1];
export const AMOUNT_COUNT_ARRIVALS=stops.slice(1).map((end,index)=>stops[index]+(end-stops[index])*.78);
/** Short accelerating transfers, with a readable micro-hold after each arrival. */
export function amountCountPose(progress:number){
 const p=Math.max(0,Math.min(1,progress));
 if(p===1)return {value:1,beat:6};
 const step=Math.max(0,stops.findIndex(end=>end>p)-1),start=stops[step],end=stops[step+1];
 const burst=Math.min(1,(p-start)/((end-start)*.78)),ease=1-(1-burst)**2;
 return {value:values[step]+(values[step+1]-values[step])*ease,beat:step+(burst>=1?1:0)};
}
export function amountFireHeat(ratio:number){return ratio<100||!Number.isFinite(ratio)?0:Math.min(1,.16+.84*(ratio-100)/200);}
export function resultWinTitle(ratio:number,session=false){return ratio>=150?'LEGENDARY WIN':ratio>=100?'EPIC WIN':ratio>=50?'MEGA WIN':ratio>=10?'BIG WIN':session?'SESSION WIN':'PACK WIN';}
export function resultCountDuration(ratio:number){return 1.8+.7*Math.min(1,Math.log10(Math.max(1,ratio))/Math.log10(300));}
