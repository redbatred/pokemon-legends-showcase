export type PackTearState={tension:number;rip:number;curl:number;open:number;crumple:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export const packSeam=(u:number)=>49+Math.sin(u*31)*1.1+Math.sin(u*83+.4)*.65+Math.sin(u*17)*1.4;
export const releasedFoil=(u:number,rip:number)=>smooth((rip-(1-u))/.11);
export const foilBend=(u:number,v:number,s:PackTearState)=>(1-v)*releasedFoil(u,s.rip)*s.curl*2.8;
/** Shared unbroken boundary; deformation travels behind the fracture front. */
export function packTearPoint(part:'seal'|'body',u:number,v:number,s:PackTearState){
 const seam=packSeam(u),released=releasedFoil(u,s.rip),pinch=s.tension*Math.exp(-(((u-(1-s.rip))/.16)**2)),mouth=Math.sin(Math.PI*u)*s.open;
 const dx=pinch*2,dy=-pinch*3;
 if(part==='seal'){
  const arc=released*s.curl*2.8,theta=foilBend(u,v,s),radius=arc>.001?seam/arc:0;
  const foldY=radius?-Math.sin(theta)*radius:(v-1)*seam,depth=radius?(1-Math.cos(theta))*radius:0;
  const tip=clamp(1-s.rip),length=(u-tip)*230,angle=released*s.curl*.26;
  // A cylindrical roll along the narrow seal keeps foil thin; the released end lifts outward.
  return {x:tip*230-115+length*Math.cos(angle)-foldY*Math.sin(angle)+depth*.23+dx+released*s.curl*18,
   y:-210.5+seam-length*Math.sin(angle)+foldY*Math.cos(angle)+dy-released*(5+s.curl*6)};
 }
 const rim=(1-v)**6,wrinkle=Math.sin(v*19+u*11)*s.crumple*6*Math.sin(Math.PI*u);
 return {x:u*230-115+dx*rim+(u-.5)*s.open*12*rim+wrinkle,y:-210.5+seam+(421-seam)*v+dy*rim+mouth*23*rim+s.crumple*Math.sin(u*19+v*8)*4};
}
export const PACK_CLEARANCE_TIME=1.76;
