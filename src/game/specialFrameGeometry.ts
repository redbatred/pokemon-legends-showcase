import type {PowerKind} from './powerProfiles';

export const FRAME_DURATION=4.8;
export type FrameTier=1|2|3;
export function specialFrameTier(rarity:string):FrameTier {
  return /special illustration|hyper|secret/i.test(rarity)?3:/illustration|ultra|shiny|radiant|VMAX|VSTAR/i.test(rarity)?2:1;
}
export const FRAME_COLORS:Record<PowerKind,readonly [string,string,string]>={
  fire:['cf174b','ff526b','fff1a6'],water:['1256bd','25bdff','d6ffff'],electric:['bc6c15','ffe136','ffffd7'],
  leaf:['187d50','60ed91','e7ffb2'],psychic:['6431b7','cb73ff','ffe1ff'],fairy:['b83d99','ff8bd2','fff1fc'],
  dark:['45256f','a75bfa','edbfff'],dragon:['4052ba','76f6cf','eeffdc'],ice:['21769e','78e3ff','f0ffff'],
  metal:['476e8a','b5d7ef','ffffff'],ground:['83532c','e7b762','fff0b2'],wind:['287c91','8af2e3','f3fffe'],
};
const TAU=Math.PI*2;
const cycle=(time:number)=>((time/FRAME_DURATION)%1+1)%1;
export function framePerimeter(t:number){
  const r=14,x=164,y=225.5,a=x-r,b=y-r,arc=Math.PI*r/2,length=4*(a+b)+4*arc;
  let d=((t%1)+1)%1*length;
  const segments=[2*a,arc,2*b,arc,2*a,arc,2*b,arc];let i=0;while(i<7&&d>segments[i])d-=segments[i++];
  const u=d/segments[i];
  if(i===0)return {x:-a+2*a*u,y,nx:0,ny:1};if(i===2)return {x,y:b-2*b*u,nx:1,ny:0};
  if(i===4)return {x:a-2*a*u,y:-y,nx:0,ny:-1};if(i===6)return {x:-x,y:-b+2*b*u,nx:-1,ny:0};
  const angle=Math.PI/2*(1-(i-1)/2-u),nx=Math.cos(angle),ny=Math.sin(angle);
  return {x:(i===1||i===3?a:-a)+nx*r,y:(i===1||i===7?b:-b)+ny*r,nx,ny};
}
export type FrameMesh={vertices:number[];uvs:number[];triangles:number[]};

/** Material packets wrap around the rim. Their silhouette deforms independently
 * of the card, and the final renderer masks the print and its price completely. */
export function frameRibbon(kind:PowerKind,index:number,count:number,time:number,layer:number,low:boolean):FrameMesh {
  const phase=cycle(time),points=low?11:19,seed=index*1.731,vertices:number[]=[],uvs:number[]=[],triangles:number[]=[];
  const speed=kind==='electric'?2:1,length=kind==='wind'?.23:kind==='water'?.18:kind==='fire'?.105:kind==='electric'?.075:.13;
  const center=phase*speed+index/count,theta=TAU*phase;
  for(let n=0;n<points;n++){
    const u=n/(points-1),envelope=Math.sin(Math.PI*u),p=framePerimeter(center+(u-.5)*length);
    const wave=Math.sin(u*TAU*2-theta*3+seed),curl=Math.sin(u*TAU*4-theta*5+seed);
    let distance=2+envelope*(5+3*wave),width=4*envelope;
    if(kind==='fire'){distance=3+envelope*(11+7*wave)+6*envelope*curl;width=envelope*(6+4*Math.sin(u*11-theta*4+seed)**2);}
    else if(kind==='water'){distance=3+envelope*(6+5*wave);width=envelope*(6+2*curl);}
    else if(kind==='electric'){distance=4+envelope*(8*Math.sin(n*3.27+theta*5+seed)+4*Math.sin(n*1.41-theta*3));width=envelope*1.65;}
    else if(kind==='dark'||kind==='psychic'){distance=4+envelope*(11+8*Math.sin(u*TAU*3-theta*2+seed));width=envelope*(kind==='dark'?9:5);}
    else if(kind==='dragon'){distance=3+envelope*(10+7*wave);width=envelope*(6+3*curl);}
    else if(kind==='wind'){distance=2+envelope*(6+5*Math.sin(u*TAU-theta*2+seed));width=envelope*3;}
    else if(kind==='leaf'){distance=4+envelope*(6+5*wave);width=envelope*2.5;}
    else if(kind==='ice'||kind==='metal'||kind==='ground'){distance=2+envelope*(3+2*wave);width=envelope*3.5;}
    else {distance=3+envelope*(8+6*wave);width=envelope*4;}
    width*=layer===0?3.2:layer===2?.24:1;
    for(const side of [-1,1]){const outward=distance+side*width;vertices.push(p.x+p.nx*outward,p.y+p.ny*outward);uvs.push(side<0?0:1,u);}
    if(n<points-1){const a=n*2;triangles.push(a,a+1,a+2,a+1,a+3,a+2);}
  }
  return {vertices,uvs,triangles};
}

/** Element-specific matter: leaves tumble, crystals grow, embers rise, while
 * psychic/fairy motes orbit. Vertex animation changes the shape, not a bitmap. */
export function frameMote(kind:PowerKind,index:number,count:number,time:number):FrameMesh {
  const phase=cycle(time),a=TAU*phase+index*1.83,p=framePerimeter(phase+index/count+.03),heavy=['ice','ground','metal'].includes(kind);
  const distance=heavy?10+4*Math.sin(a*2):13+7*Math.sin(a*2),cx=p.x+p.nx*distance,cy=p.y+p.ny*distance;
  const angle=heavy?index*1.47:a*2,cos=Math.cos(angle),sin=Math.sin(angle),pulse=.72+.28*Math.sin(a*2)**2;
  let outline:number[][];
  if(kind==='leaf')outline=[[0,-14],[7,-5],[4,9],[0,15],[-5,5],[-7,-4]];
  else if(kind==='ice'||kind==='ground'||kind==='metal')outline=[[0,-15],[7,-4],[5,10],[0,16],[-6,5],[-7,-5]];
  else if(kind==='electric')outline=[[-2,-17],[8,-4],[1,1],[5,17],[-8,4],[-1,-1]];
  else if(kind==='fire')outline=[[0,-11],[4,-4],[3,4],[0,10],[-3,2],[-5,-4]];
  else if(kind==='water')outline=[[0,-13],[6,-1],[4,6],[0,9],[-4,6],[-6,-1]];
  else outline=[[0,-14],[3,-3],[12,0],[3,3],[0,14],[-3,3],[-12,0],[-3,-3]];
  const vertices=[cx,cy],uvs=[.5,.5],triangles:number[]=[];
  for(const [x,y] of outline){vertices.push(cx+(x*cos-y*sin)*pulse,cy+(x*sin+y*cos)*pulse);uvs.push(x/36+.5,y/36+.5);}
  for(let n=0;n<outline.length;n++)triangles.push(0,n+1,(n+1)%outline.length+1);
  return {vertices,uvs,triangles};
}
