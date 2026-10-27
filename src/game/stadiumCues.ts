const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
/** Held drawing changes travel across the stands; no continuously bending crowd sheet. */
export function crowdPose(age:number,section:number,reduced=false){
 if(reduced||age<0)return 0;
 const t=age-[.09,.035,.13,0,.055,.11,.025,.08][section%8];
 return smooth(t/.085)*(1-smooth((t-1.45)/.22));
}
export function crowdArrival(travel:number,section:number,reduced=false){return reduced||travel<=0?1:smooth((-.35+(1-travel)*1.7-(section+.5)/8+.15)/.25);}
export function standBounds(u:number){
 const points=[[0,.351,.464],[.14,.432,.533],[.3,.493,.588],[.43,.518,.600],[.57,.518,.600],[.7,.493,.588],[.86,.432,.533],[1,.351,.464]];
 const i=Math.max(1,points.findIndex(p=>p[0]>=clamp(u))),a=points[i-1],b=points[i],t=(clamp(u)-a[0])/(b[0]-a[0]);
 return {top:a[1]+(b[1]-a[1])*t-.012,bottom:a[2]+(b[2]-a[2])*t};
}
/** The reveal raises the actual tower emitters, then brings the beams together. */
export function floodlightCue(active:number,charge:number,impact:number,travel:number,reduced=false){
 const q=Math.max(0,charge),strength=active*(.15+q*.38+impact*.36+travel*.2);
 return {strength:Math.min(.85,strength),focus:reduced?1:clamp(.48+q*.52+impact*.52),sweep:reduced?0:travel};
}
