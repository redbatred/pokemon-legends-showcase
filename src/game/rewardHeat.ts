/** Payout and bet must share units. Heat is purely presentational. */
export function rewardHeat(value:number,bet:number){
 const ratio=Number.isFinite(value)&&Number.isFinite(bet)&&bet>0?Math.max(0,value/bet):0;
 const stops=[{ratio:1,heat:0,color:0xfff2cf},{ratio:2,heat:.08,color:0xffcf62},{ratio:5,heat:.35,color:0xffd36f},{ratio:20,heat:.75,color:0xffefb8},{ratio:100,heat:1,color:0xfff9df}];
 if(ratio<=1)return {ratio,heat:0,color:stops[0].color};
 const upper=stops.findIndex(stop=>stop.ratio>=ratio);
 if(upper<0)return {ratio,heat:1,color:stops.at(-1)!.color};
 const a=stops[upper-1],b=stops[upper],t=Math.log(ratio/a.ratio)/Math.log(b.ratio/a.ratio);
 let color=0;
 for(const shift of [16,8,0])color|=Math.round(((a.color>>shift)&255)*(1-t)+((b.color>>shift)&255)*t)<<shift;
 return {ratio,heat:ratio<2?0:a.heat+(b.heat-a.heat)*t,color};
}
