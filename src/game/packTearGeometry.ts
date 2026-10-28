export type PackTearState={tension:number;rip:number;curl:number;open:number;crumple:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export const packSeam=(u:number)=>49+Math.sin(u*31)*1.1+Math.sin(u*83+.4)*.65+Math.sin(u*17)*1.4;
export const releasedFoil=(u:number,rip:number)=>smooth((rip-u)/.11);
/** Shared unbroken boundary; deformation travels behind the fracture front. */
export function packTearPoint(part:'seal'|'body',u:number,v:number,s:PackTearState){
 const seam=packSeam(u),released=releasedFoil(u,s.rip),pinch=s.tension*Math.exp(-(((u-s.rip)/.16)**2)),mouth=Math.sin(Math.PI*u)*s.open;
 const dx=-pinch*2,dy=-pinch*3;
 if(part==='seal'){
  const angle=released*s.curl*Math.PI*(.55+.57*(1-v));
  return {x:u*230-115+dx+released*(-s.curl*19+Math.sin(angle)*v*12),y:-210.5+v*seam+dy-released*(5+s.curl*12)+(1-Math.cos(angle))*(1-v)*seam};
 }
 const rim=(1-v)**6,wrinkle=Math.sin(v*19+u*11)*s.crumple*6*Math.sin(Math.PI*u);
 return {x:u*230-115+dx*rim+(u-.5)*s.open*12*rim+wrinkle,y:-210.5+seam+(421-seam)*v+dy*rim+mouth*23*rim+s.crumple*Math.sin(u*19+v*8)*4};
}
export const PACK_CLEARANCE_TIME=1.76;
