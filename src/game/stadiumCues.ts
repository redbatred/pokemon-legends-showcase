const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
/** Three held cheer cels run at varied section rhythms until the card is dismissed. */
export function crowdFrame(age:number,section:number,reduced=false,low=false,energy=3){
 if(age<0||energy<=0)return {from:0,to:0,mix:0};
 if(reduced)return energy>=2?{from:1,to:1,mix:0}:{from:0,to:0,mix:0};
 // Quiet pulls get staggered seated applause. Raised arms are reserved for rarer cards.
 if(energy===1){
  const t=Math.max(0,age-section*.14),pulse=(Math.sin(t*3.8+section*.85)+1)/2;
  return {from:0,to:2,mix:smooth(t/.24)*(.12+pulse*.40)};
 }
 const t=age-[.09,.035,.13,0,.055,.11,.025,.08][section%8];
 if(t<=0)return {from:0,to:0,mix:0};
 if(t<.12)return {from:0,to:1,mix:smooth(t/.12)};
 const poses=[1,2,1,3,2,3,1,2],holds=[.26,.23,.29,.25,.24,.32,.22,.28],period=holds.reduce((a,b)=>a+b,0);
 let phase=((t-.12)*(energy===2?.74:1)*(.91+(section%5)*.037))%period,index=0;
 while(phase>=holds[index]&&index<holds.length-1){phase-=holds[index];index++;}
 return {from:poses[index],to:poses[(index+1)%poses.length],mix:low?0:smooth((phase-holds[index]+.055)/.055)};
}
export function crowdArrival(travel:number,section:number,reduced=false){return reduced||travel<=0?1:smooth((-.35+(1-travel)*1.7-(section+.5)/8+.15)/.25);}
export function standBounds(u:number){
 const points=[[0,.351,.464],[.14,.432,.533],[.3,.493,.588],[.43,.518,.600],[.57,.518,.600],[.7,.493,.588],[.86,.432,.533],[1,.351,.464]];
 const i=Math.max(1,points.findIndex(p=>p[0]>=clamp(u))),a=points[i-1],b=points[i],t=(clamp(u)-a[0])/(b[0]-a[0]);
 return {top:a[1]+(b[1]-a[1])*t-.012,bottom:a[2]+(b[2]-a[2])*t};
}
/** The reveal raises actual tower emitters and aims overlapping cones at the stage. */
export function floodlightCue(active:number,charge:number,impact:number,travel:number,reduced=false){
 const q=Math.max(0,charge),strength=active*(.15+q*.38+impact*.36+travel*.2);
 return {strength:Math.min(.85,strength),focus:reduced?1:clamp(.48+q*.52+impact*.52),sweep:reduced?0:travel};
}
