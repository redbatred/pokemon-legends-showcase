import {Container,Mesh,MeshGeometry,Sprite,Texture} from 'pixi.js';
import {juiceTextures} from '../../src/game/WinJuice';

type Point={x:number;y:number};
const SEGMENTS=30;
/** A strip of flowing light, seamless along its length so it can scroll: a hot core, a soft body and filaments that show the flow. */
function flowTexture(seed:number,core:number){
 const W=256,H=64,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const context=canvas.getContext('2d')!,image=context.createImageData(W,H),rows=8,cols=16;
 const grid=Array.from({length:rows*cols},(_,i)=>{const x=Math.sin((i+1)*12.9898+seed*78.233)*43758.5453;return x-Math.floor(x);});
 const noise=(u:number,v:number)=>{const x=u*cols,y=v*(rows-1),x0=Math.floor(x)%cols,x1=(x0+1)%cols,y0=Math.min(rows-2,Math.floor(y)),fx=x-Math.floor(x),fy=y-y0,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);
  return (grid[y0*cols+x0]*(1-sx)+grid[y0*cols+x1]*sx)*(1-sy)+(grid[(y0+1)*cols+x0]*(1-sx)+grid[(y0+1)*cols+x1]*sx)*sy;};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const u=x/W,v=y/(H-1),d=Math.abs(v-.5)*2,body=Math.exp(-d*d*5),hot=Math.exp(-d*d/(core*core)),filament=.35+.65*noise(u,v)*(.55+.45*Math.sin(u*Math.PI*6+v*8));
  const alpha=Math.min(1,body*filament*.9+hot)*(1-d**6),i=(y*W+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=255;image.data[i+3]=alpha*255;}
 context.putImageData(image,0,0);const texture=Texture.from(canvas);texture.source.style.addressMode='repeat';return texture;
}
function ribbon(texture:Texture){
 const positions=new Float32Array((SEGMENTS+1)*4),uvs=new Float32Array((SEGMENTS+1)*4),indices=new Uint32Array(SEGMENTS*6);
 for(let i=0;i<SEGMENTS;i++){const k=i*2;indices.set([k,k+1,k+2,k+1,k+3,k+2],i*6);}
 const geometry=new MeshGeometry({positions,uvs,indices}),mesh=new Mesh({geometry,texture});mesh.blendMode='add';
 return {mesh,geometry};
}
export interface BeamSample{now:number;/** The ball's mouth. */from:Point;/** The Pokémon's chest. */to:Point;/** Drawn part of the path, 0 at the mouth to 1 at the chest. */start:number;end:number;
 /** 0..1: thickness and brightness. */power:number;/** True while the Pokémon is drawn in; false while it is thrown back out. */inward:boolean;unit:number;}
/** The capture beam: one body of light between the ball's mouth and the Pokémon, with a white core, two strands wound round it
 * and knots of light travelling along it. Its texture scrolls toward the ball on the way in and away from it on the way out. */
export function createEnergyBeam(tint:number,light:number){
 const container=new Container();container.eventMode='none';container.visible=false;
 const outer=ribbon(flowTexture(3,.34)),core=ribbon(flowTexture(11,.2)),strands=[ribbon(flowTexture(17,.5)),ribbon(flowTexture(23,.5))],t=juiceTextures();
 const sprite=(texture:Texture,color:number)=>{const s=new Sprite(texture);s.anchor.set(.5);s.blendMode='add';s.tint=color;return s;};
 const mouthGlow=sprite(t.dot,light),tipGlow=sprite(t.dot,light),tipStar=sprite(t.star,0xffffff),knots=Array.from({length:7},()=>sprite(t.dot,0xffffff));
 outer.mesh.tint=tint;core.mesh.tint=0xffffff;for(const strand of strands)strand.mesh.tint=light;
 container.addChild(mouthGlow,outer.mesh,strands[0].mesh,core.mesh,strands[1].mesh,...knots,tipGlow,tipStar);
 function sample(s:BeamSample){
  container.visible=s.power>.004&&s.end>s.start+.01;if(!container.visible)return;
  const {from,to,now,unit}=s,dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy)||1,ux=-dy/length,uy=dx/length,lift=(uy<0?1:-1)*length*.16,cx=(from.x+to.x)/2+ux*lift,cy=(from.y+to.y)/2+uy*lift,direction=s.inward?1:-1;
  /** Centre line: a bow between the two ends that ripples along its length, still at both ends. */
  const centre=(u:number)=>{const v=1-u,x=v*v*from.x+2*v*u*cx+u*u*to.x,y=v*v*from.y+2*v*u*cy+u*u*to.y,tx=2*v*(cx-from.x)+2*u*(to.x-cx),ty=2*v*(cy-from.y)+2*u*(to.y-cy),tl=Math.hypot(tx,ty)||1,nx=-ty/tl,ny=tx/tl,
   wave=Math.sin(u*8-now*11*direction)*7*unit*Math.sin(Math.PI*u)*s.power;return {x:x+nx*wave,y:y+ny*wave,nx,ny};};
  const thickness=(10+26*s.power)*unit*(1+.08*Math.sin(now*37)),ends=(u:number)=>Math.min(1,(u-s.start)/.06+.25,(s.end-u)/.05+(s.end>.985?1:.02));
  const shape=(r:ReturnType<typeof ribbon>,half:(u:number)=>number,offset:(u:number)=>number,scroll:number,repeat:number)=>{
   const positions=r.geometry.getBuffer('aPosition'),uvs=r.geometry.getBuffer('aUV'),p=positions.data as Float32Array,uv=uvs.data as Float32Array;
   for(let i=0;i<=SEGMENTS;i++){const u=s.start+(s.end-s.start)*i/SEGMENTS,c=centre(u),o=offset(u),w=Math.max(0,half(u)),k=i*4,x=c.x+c.nx*o,y=c.y+c.ny*o;
    p[k]=x+c.nx*w;p[k+1]=y+c.ny*w;p[k+2]=x-c.nx*w;p[k+3]=y-c.ny*w;const tu=u*repeat+scroll;uv[k]=tu;uv[k+1]=0;uv[k+2]=tu;uv[k+3]=1;}
   positions.update();uvs.update();};
  // Wide where it holds the Pokémon, narrowing into the mouth.
  const profile=(u:number)=>(.42+.58*u**.7)*ends(u),repeat=Math.max(1,length/(230*unit));
  shape(outer,u=>thickness*profile(u),()=>0,now*1.5*direction,repeat);outer.mesh.alpha=.85*s.power;
  shape(core,u=>thickness*.36*profile(u),()=>0,now*2.6*direction,repeat*1.4);core.mesh.alpha=Math.min(1,.55+.6*s.power);
  strands.forEach((strand,i)=>{const phase=(u:number)=>u*Math.PI*5-now*12*direction+i*Math.PI;
   // Each strand passes in front of the beam and behind it: thin and dim behind, wide and bright in front.
   shape(strand,u=>thickness*.2*(.45+.55*(.5+.5*Math.cos(phase(u))))*ends(u),u=>Math.sin(phase(u))*thickness*1.15*Math.sin(Math.PI*u)**.6,now*2*direction,repeat*1.2);strand.mesh.alpha=.7*s.power;});
  knots.forEach((knot,i)=>{const travel=((now*1.25+i/knots.length)%1),u=s.inward?1-travel:travel,on=u>s.start&&u<s.end,c=centre(u);knot.visible=on;if(!on)return;
   const swing=Math.sin(u*Math.PI*5-now*12*direction+i)*thickness*.5;knot.position.set(c.x+c.nx*swing,c.y+c.ny*swing);knot.scale.set(thickness*(.5+.9*Math.sin(Math.PI*u))/32);knot.alpha=s.power*Math.sin(Math.PI*travel);});
  mouthGlow.position.set(from.x,from.y);mouthGlow.scale.set(thickness*(s.start<.05?1.5:0)/32);mouthGlow.alpha=.6*s.power;
  const tip=centre(s.end),flicker=.85+.15*Math.sin(now*53);tipGlow.position.set(tip.x,tip.y);tipGlow.scale.set(thickness*(s.end<.985?2.4:1.6)*flicker/32);tipGlow.alpha=.5*s.power;
  tipStar.position.set(tip.x,tip.y);tipStar.scale.set(thickness*(s.end<.985?3.4:2.2)*flicker/64);tipStar.rotation=now*1.7;tipStar.alpha=s.end<.985?s.power:.45*s.power;
 }
 return {container,sample};
}
