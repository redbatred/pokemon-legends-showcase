import { Graphics, Point } from 'pixi.js';
import { Vector2,type Spine } from '@esotericsoftware/spine-pixi-v8';
import type { PowerProfile } from './powerProfiles';

const TAU=Math.PI*2;
/** One finite, cel-shaded move, attached to the animated skeleton, never to the screen. */
export class PokemonPower {
 readonly back=new Graphics();readonly front=new Graphics();
 charge=0;blast=0;fade=1;
 private t=0;private origin=new Point();private local=new Vector2();
 constructor(private hero:Spine,readonly profile:PowerProfile,private low=false){}
 update(dt:number){
  this.t+=dt;const b=this.back.clear(),g=this.front.clear(),p=this.profile;
  if(this.fade<=0||(!this.charge&&!this.blast))return;
  const bone=this.hero.skeleton.findBone(p.bone)??this.hero.skeleton.findBone('head')!;
  let ox=0,oy=0;
  if(p.origin){let bx=0,by=0;for(let parent:typeof bone|null=bone;parent;parent=parent.parent){bx+=parent.data.x;by+=parent.data.y;}ox=(p.origin[0]-.5)*this.hero.skeleton.data.width-bx;oy=(.5-p.origin[1])*this.hero.skeleton.data.height-by;}
  const local=this.local.set(ox,oy);bone.localToWorld(local);
  // Spine's skeleton uses yDown in the Pixi runtime. Convert through the display
  // transform so charge and projectile follow the actual posed head/hand.
  this.hero.parent!.toLocal(this.hero.toGlobal(local),undefined,this.origin);
  const x=this.origin.x,y=this.origin.y,t=this.t,c=p.color,light=p.light;
  const q=this.charge,blast=this.blast,alpha=this.fade;
  if(q>0){
   const r=9+q*17;
   for(let i=0;i<(this.low?8:14);i++){
    const a=i/14*TAU+t*1.3,travel=(t*1.3+i*.071)%1,d=(1-travel)*100+18;
    const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d*.8;
    g.moveTo(px,py).lineTo(px+Math.cos(a)*8,py+Math.sin(a)*8).stroke({color:c,width:2,alpha:q*travel*alpha});
   }
   g.circle(x,y,r*1.6).fill({color:c,alpha:q*.15*alpha});
   g.circle(x,y,r).fill({color:c,alpha:q*.9*alpha}).circle(x-2,y-2,r*.6).fill({color:light,alpha:q*alpha});
   g.circle(x-3,y-3,r*.3).fill({color:0xffffff,alpha:q*alpha});
  }
  if(blast<=0)return;
  const strength=Math.sin(Math.min(1,blast)*Math.PI*.5),a=alpha*strength;
  const direction=p.direction;
  const dx=Math.cos(direction),dy=Math.sin(direction),nx=-dy,ny=dx;
  const at=(u:number,v:number)=>[x+dx*u+nx*v,y+dy*u+ny*v];
  const count=this.low?9:17;
  if(p.kind==='water'){
   const reach=245*strength;
   for(let layer=0;layer<3;layer++){
    const points:number[]=[];const width=(13-layer*4)*strength;
    for(let i=0;i<=24;i++){const u=i/24;points.push(...at(u*reach,Math.sin(u*12-t*17)*6*u+width*(1-u*.4)));}
    for(let i=24;i>=0;i--){const u=i/24;points.push(...at(u*reach,Math.sin(u*12-t*17)*6*u-width*(1-u*.4)));}
    g.poly(points).fill({color:layer===0?c:layer===1?light:0xffffff,alpha:a*.9});
   }
   for(let ribbon=0;ribbon<2;ribbon++){
    const points:number[]=[];for(let j=0;j<=25;j++){const u=j/25;points.push(...at(u*reach,Math.sin(u*19-t*17+ribbon*Math.PI)*14));}
    g.poly(points,false).stroke({color:light,width:2,alpha:a*.7});
   }
   for(let i=0;i<count;i++){
    const u=(t*1.4+i/count)%1,side=Math.sin(i*47),[px,py]=at(reach*.7+u*65,side*(10+u*45));
    g.ellipse(px,py,2+u*3,4+u*4).fill({color:i%2?c:light,alpha:a*(1-u)});
   }
  }else if(['fire','dragon'].includes(p.kind)){
   const reach=55+205*strength;
   for(let layer=0;layer<3;layer++){
    const w=(32-layer*9)*strength,col=layer===0?c:layer===1?light:0xffffff;
    const pts:number[]=[];
    for(let i=0;i<=14;i++){const u=i/14;const v=(Math.sin(u*19-t*26)*.22+1)*w*Math.sin(u*Math.PI)**.6;pts.push(...at(u*reach,v));}
    for(let i=14;i>=0;i--){const u=i/14;const v=-(Math.sin(u*21-t*22+2)*.23+1)*w*Math.sin(u*Math.PI)**.6;pts.push(...at(u*reach,v));}
    g.poly(pts).fill({color:col,alpha:a*(layer===0?.9:.95)});
   }
   for(let i=0;i<count;i++){
    const u=(i/count+t*1.3)%1,spread=Math.sin(i*14.7)*55*u;
    const [px,py]=at(u*reach,spread),r=(1-u)*4+1;
    g.poly([px-r,py,px,py-r*3,px+r,py,px,py+r*2]).fill({color:i%2?c:light,alpha:a*(1-u)});
   }
  }else if(p.kind==='electric'){
   for(let ray=0;ray<(this.low?5:9);ray++){
    const angle=ray/9*TAU+t*.1,reach=(155+Math.sin(ray*17)*45)*strength;
    const pts:number[]=[x,y];
    for(let j=1;j<7;j++){const r=j/6*reach,zig=j===6?0:Math.sin(j*9+ray*4+Math.floor(t*24))*15;pts.push(x+Math.cos(angle)*r+Math.sin(angle)*zig,y+Math.sin(angle)*r-Math.cos(angle)*zig);}
    g.poly(pts,false).stroke({color:c,width:10,alpha:a*.22}).poly(pts,false).stroke({color:c,width:5,alpha:a*.9}).poly(pts,false).stroke({color:0xffffef,width:1.8,alpha:a});
    const px=pts[8],py=pts[9];g.moveTo(px,py).lineTo(px+Math.cos(angle+.7)*22,py+Math.sin(angle+.7)*22).lineTo(px+Math.cos(angle+.4)*42,py+Math.sin(angle+.4)*42).stroke({color:light,width:1.7,alpha:a*.9});
   }
  }else if(p.kind==='psychic'||p.kind==='fairy'||p.kind==='dark'){
   for(let i=0;i<(this.low?8:15);i++){
    const angle=i/15*TAU+t*(p.kind==='dark'?-2.3:1.8),r=50+blast*110;
    const px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r*.7;
    if(p.kind==='dark')g.moveTo(px,py).quadraticCurveTo(px+Math.sin(angle)*40,py-Math.cos(angle)*40,x+Math.cos(angle+.5)*r*.65,y+Math.sin(angle+.5)*r*.65).stroke({color:c,width:8,alpha:a*.8});
    else {const size=i%3===0?9:5;g.poly([px,py-size,px+size*.25,py-size*.25,px+size,py,px+size*.25,py+size*.25,px,py+size,px-size*.25,py+size*.25,px-size,py,px-size*.25,py-size*.25]).fill({color:i%2?c:light,alpha:a});}
   }
   b.ellipse(x,y,120*strength,48*strength).stroke({color:c,width:4,alpha:a*.7});
   b.ellipse(x,y,80*strength,100*strength).stroke({color:light,width:2,alpha:a*.6});
  }else{
   for(let i=0;i<count;i++){
    const angle=i/count*TAU+t*.6,r=35+((t*1.1+i/count)%1)*140*strength;
    const px=x+Math.cos(angle)*r,py=y+Math.sin(angle)*r*.75,s=(4+i%4)*strength;
    if(p.kind==='leaf'){
     const vx=Math.cos(angle)*s*2,vy=Math.sin(angle)*s*2;
     g.moveTo(px-vx,py-vy).quadraticCurveTo(px-vy*1.1,py+vx*1.1,px+vx,py+vy).quadraticCurveTo(px+vy,py-vx,px-vx,py-vy).fill({color:i%2?c:light,alpha:a});
     g.moveTo(px-vx,py-vy).lineTo(px+vx,py+vy).stroke({color:0x1c754d,width:1,alpha:a});
    }else if(p.kind==='ice'||p.kind==='metal'){
     g.poly([px,py-s*2,px+s*.7,py,px,py+s*2,px-s*.7,py]).fill({color:c,alpha:a});
     g.poly([px,py-s*2,px+s*.7,py,px,py+s*2]).fill({color:light,alpha:a});
    }else if(p.kind==='ground'){
     g.poly([px-s,py-s*.4,px-s*.3,py-s,px+s*.8,py-s*.6,px+s,py+s*.6,px-s*.5,py+s]).fill({color:i%2?c:light,alpha:a});
    }else{
     g.moveTo(px,py).quadraticCurveTo(px+Math.sin(angle)*35,py-Math.cos(angle)*35,x+Math.cos(angle+.4)*r*.5,y+Math.sin(angle+.4)*r*.5).stroke({color:i%2?c:light,width:2+i%3,alpha:a});
    }
   }
  }
 }
 destroy(){this.back.destroy();this.front.destroy();}
}
