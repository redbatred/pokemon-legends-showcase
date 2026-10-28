export type PackTearState={tension:number;rip:number;curl:number;open:number;crumple:number;pull?:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
/** The last 12% remains a real material hinge, including during wrapper collapse. */
export const PACK_TEAR_LIMIT=.88;
export const packSeam=(u:number)=>49+Math.sin(u*31)*1.1+Math.sin(u*83+.4)*.65+Math.sin(u*17)*1.4;
export const releasedFoil=(u:number,rip:number)=>smooth((Math.min(PACK_TEAR_LIMIT,rip)-(1-u))/.085);
const foilRoll=(u:number,s:PackTearState)=>releasedFoil(u,s.rip)*s.curl*(1.8+.45*Math.sin(u*4+(s.pull??0)*2));
export const foilBend=(u:number,v:number,s:PackTearState)=>(1-v)*foilRoll(u,s);
function bodyPoint(u:number,v:number,s:PackTearState){
 const seam=packSeam(u),tip=1-Math.min(PACK_TEAR_LIMIT,s.rip),pinch=s.tension*Math.exp(-(((u-tip)/.16)**2)),rim=(1-v)**6;
 const wrinkle=Math.sin(v*19+u*11)*s.crumple*6*Math.sin(Math.PI*u),fold=s.open*Math.sin(u*Math.PI)*Math.sin(u*16+v*8)*4*rim;
 return {x:u*230-115-pinch*2*rim+(u-.5)*s.open*12*rim+wrinkle,
  y:-210.5+seam+(421-seam)*v-pinch*3*rim+Math.sin(Math.PI*u)*s.open*27*rim+fold+s.crumple*Math.sin(u*19+v*8)*4};
}
/** A tensioned flap folds around its unbroken corner; no detached flying strip. */
export function packTearPoint(part:'seal'|'body',u:number,v:number,s:PackTearState){
 if(part==='body')return bodyPoint(u,v,s);
 const rim=bodyPoint(u,0,s),seam=packSeam(u),released=releasedFoil(u,s.rip),pull=s.pull??0;
 const tip=1-Math.min(PACK_TEAR_LIMIT,s.rip),freeLength=(1-tip)*230,length=Math.max(0,(u-tip)*230),q=freeLength?length/freeLength:0;
 const base=pull*2.25,bend=pull*.52,angle=(base+bend*q)*released;
 const radius=bend>.001?freeLength/bend:0;
 const pathX=radius?radius*(Math.sin(base+bend*q)-Math.sin(base)):length;
 const pathY=radius?radius*(Math.cos(base)-Math.cos(base+bend*q)):0;
 const arc=foilRoll(u,s),theta=foilBend(u,v,s),crossRadius=arc>.001?seam/arc:0;
 const cross=crossRadius?-Math.sin(theta)*crossRadius:(v-1)*seam,depth=crossRadius?(1-Math.cos(theta))*crossRadius:0;
 // Pull first lifts the broken lip, then folds the free length down outside the left seam.
 const lift=-(1-pull)*released*s.curl*14;
 return {x:rim.x+(pathX-length)*released-Math.sin(angle)*cross+depth*.12,
  y:rim.y+pathY*released+Math.cos(angle)*cross+lift};
}
export const PACK_CLEARANCE_TIME=1.76;
