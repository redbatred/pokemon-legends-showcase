import {Graphics,Point} from 'pixi.js';
import type {PokemonActor} from './PokemonActor';
import type {PowerProfile} from './powerProfiles';
import type {ProjectedEmitter} from './moveRig';
import {signatureEffect} from './SignatureEffects';
const TAU=Math.PI*2;

/** Finite, pose-synchronized cel effects. Released projectiles retain their launch vector. */
export class PokemonPower {
 readonly back=new Graphics();readonly front=new Graphics();charge=0;blast=0;fade=1;clock=0;
 private history:{time:number;points:ProjectedEmitter[]}[]=[];private time=0;private releasedAt=-1;private launch:ProjectedEmitter[]=[];private point=new Point();private target=new Point();
 constructor(private hero:PokemonActor,readonly profile:PowerProfile,private low=false){}
 begin(){this.history=[];this.time=0;this.clock=0;this.releasedAt=-1;this.launch=[];this.charge=0;this.blast=0;this.fade=1;}
 release(at:number){this.releasedAt=at;this.launch=this.emitters();this.history=[{time:at,points:this.launch}];}
 private emitters():ProjectedEmitter[]{return this.hero.powerEmitters(this.profile).map(p=>{
  this.hero.parent!.toLocal(this.hero.toGlobal(new Point(p.x,p.y)),undefined,this.point);
  this.hero.parent!.toLocal(this.hero.toGlobal(new Point(p.x+p.dx*20,p.y+p.dy*20)),undefined,this.target);
  const dx=this.target.x-this.point.x,dy=this.target.y-this.point.y,d=Math.hypot(dx,dy)||1;
  return {x:this.point.x,y:this.point.y,dx:dx/d,dy:dy/d,foreshortening:p.foreshortening};
 });}
 update(_dt:number){
  this.back.clear();const g=this.front.clear();if(this.fade<=0||(!this.charge&&!this.blast))return;
  this.time=this.clock;let emitters=this.emitters();
  if(this.blast>0&&this.releasedAt<0){this.releasedAt=this.time;this.launch=emitters.map(p=>({...p}));}
  if(this.blast>0&&this.time>(this.history.at(-1)?.time??-1)){this.history.push({time:this.time,points:emitters});while(this.history.length>2&&this.history[1].time<this.time-.32)this.history.shift();}
  if(['shuriken','orb','stars','pulse','crystals','gems','seeds','moon','firestar'].includes(this.profile.move)&&this.blast>0)emitters=this.launch;
  for(let i=0;i<emitters.length;i++)this.draw(emitters[i],i,g);
 }
 private star(g:Graphics,x:number,y:number,r:number,color:number,alpha:number,rotation=0){
  const points:number[]=[];for(let j=0;j<8;j++){const a=rotation+j*Math.PI/4,rr=j%2?r*.19:r;points.push(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.poly(points).fill({color,alpha});
 }
 private draw(e:ProjectedEmitter,index:number,g:Graphics){
  const p=this.profile,t=this.time,c=p.color,light=p.light,q=this.charge,alpha=this.fade;
  const {x,y,dx,dy}=e,nx=-dy,ny=dx;
  const at=(u:number,v:number):[number,number]=>{
   if(['stream','beam'].includes(p.move)&&this.history.length&&this.blast>0){
    const birth=this.time-u/900;let a=this.history[0],b=a;
    for(const sample of this.history){b=sample;if(sample.time>=birth)break;a=sample;}
    const t=a===b?0:Math.max(0,Math.min(1,(birth-a.time)/(b.time-a.time))),a0=a.points[index]??e,b0=b.points[index]??e;
    const hx=a0.x+(b0.x-a0.x)*t,hy=a0.y+(b0.y-a0.y)*t,fx=a0.dx+(b0.dx-a0.dx)*t,fy=a0.dy+(b0.dy-a0.dy)*t;
    return [hx+fx*u-fy*v,hy+fy*u+fx*v];
   }
   return [x+dx*u+nx*v,y+dy*u+ny*v];
  };
  if(q>0){
   if(p.move==='orb'){this.orb(g,x,y,5+q*16,q,t);}
   else if(p.move==='shuriken')this.shuriken(g,x,y,9+q*27,t*13,q);
   else if(p.kind==='electric'){
    this.star(g,x,y,3+q*8,light,q,t*2);for(let i=0;i<3;i++){const a=i/3*TAU+t,pts=[x,y,x+Math.cos(a)*14,y+Math.sin(a)*14,x+Math.cos(a+.4)*(25+q*20),y+Math.sin(a+.4)*(25+q*20)];g.poly(pts,false).stroke({color:c,width:2,alpha:q*.85});}
   }else{
    // Small anatomical ignition; the character remains readable through the windup.
    const count=this.low?5:9;for(let i=0;i<count;i++){const u=(t*1.7+i/count)%1,a=i/count*TAU,r=12+(1-u)*52*q;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.65;g.moveTo(px,py).lineTo(x+Math.cos(a)*(r+7),y+Math.sin(a)*(r+7)*.65).stroke({color:c,width:1.2,alpha:u*q*.65});}
    this.star(g,x,y,3+q*7,light,q*.85,t*.8);
   }
  }
  if(!this.blast)return;
  const age=Math.max(0,this.time-this.releasedAt),strength=Math.min(1,this.blast*1.35),opacity=alpha*strength;
  // An anatomical launch drawing: dark cel edge, colored pressure crescent and fine hot core.
  // It lasts a fraction of the move, so the native body attack remains the focal point.
  if(age<.32){
   const u=Math.min(1,age/.32),a=opacity*(1-u),radius=12+u*77,spread=p.kind==='electric'?.95:p.kind==='psychic'||p.kind==='dark'?1.25:.72;
   const start=at(radius,-radius*spread),mid=at(radius*1.38,0),end=at(radius,radius*spread);
   for(const [width,col,opacityScale] of [[7,0x111e3b,.7],[4,c,1],[1.3,light,.9]])g.moveTo(...start).quadraticCurveTo(...mid,...end).stroke({color:col,width,alpha:a*opacityScale});
   for(let i=0;i<(this.low?3:5);i++){const side=i-2,dist=18+u*(92+Math.abs(side)*22),offset=side*(12+u*11),tip=at(dist+30,offset*1.2),root=at(dist,offset),edge=at(dist-13,offset+Math.sign(side||1)*3);this.back.poly([...root,...tip,...edge]).fill({color:i%2?c:light,alpha:a*.62});}
  }
  if(p.move==='quake'&&index>0)return;
  if(signatureEffect(g,this.back,p,at,age,opacity,this.low,{x:this.hero.x,y:this.hero.y+154}))return;
  if(p.move==='shuriken'){
   const u=Math.min(1,age/.44),distance=u*260,[px,py]=at(distance,-Math.sin(u*Math.PI)*18);
   for(let trail=4;trail>0;trail--){const [tx,ty]=at(Math.max(0,distance-trail*15),-Math.sin(u*Math.PI)*18);this.shuriken(this.back,tx,ty,(37+u*12)*(1-trail*.08),age*24-trail*.3,opacity*(.12-trail*.018));}
   this.shuriken(g,px,py,37+u*12,age*24,opacity);return;
  }
  if(p.move==='orb'){
   const progress=Math.min(1,age/.55),distance=progress*220,[px,py]=at(distance,-Math.sin(progress*Math.PI)*20);
   for(let i=3;i>0;i--){const [tx,ty]=at(Math.max(0,distance-i*13),-Math.sin(progress*Math.PI)*20);this.orb(this.back,tx,ty,19-i*2,opacity*(.16-i*.03),t-i*.1);}
   this.orb(g,px,py,26+progress*10,opacity,t);return;
  }
  if(p.move==='stars'){
   for(let i=0;i<6;i++){const life=age-i*.045;if(life<0)continue;const u=Math.min(1,life/.44),angle=(i-1.5)*.17,ax=dx*Math.cos(angle)-dy*Math.sin(angle),ay=dy*Math.cos(angle)+dx*Math.sin(angle),px=x+ax*(20+u*185),py=y+ay*(20+u*185)-Math.sin(u*Math.PI)*15,r=10+u*4;
    const pts:number[]=[];for(let j=0;j<10;j++){const a=t*4+j*Math.PI/5,rr=j%2?r*.43:r;pts.push(px+Math.cos(a)*rr,py+Math.sin(a)*rr);}g.moveTo(px-ax*26,py-ay*26).lineTo(px,py).stroke({color:c,width:2,alpha:opacity*.4}).poly(pts).fill({color:c,alpha:opacity}).stroke({color:light,width:1.2,alpha:opacity});
   }return;
  }
  if(p.move==='wave'){
   g.circle(x,y,11).fill({color:c,alpha:opacity*.4}).circle(x,y,4).fill({color:light,alpha:opacity});
   for(let i=0;i<3;i++){const u=Math.min(1,Math.max(0,(age-i*.07)*2.3)),[px,py]=at(12+u*170,0),r=12+u*37;
    g.moveTo(px+nx*r-dx*8,py+ny*r-dy*8).quadraticCurveTo(px+dx*r*.55,py+dy*r*.55,px-nx*r-dx*8,py-ny*r-dy*8).stroke({color:0x39205c,width:10,alpha:opacity*(1-u)*.85}).moveTo(px+nx*r-dx*8,py+ny*r-dy*8).quadraticCurveTo(px+dx*r*.55,py+dy*r*.55,px-nx*r-dx*8,py-ny*r-dy*8).stroke({color:c,width:6,alpha:opacity*(1-u)}).moveTo(px+nx*r-dx*8,py+ny*r-dy*8).quadraticCurveTo(px+dx*r*.55,py+dy*r*.55,px-nx*r-dx*8,py-ny*r-dy*8).stroke({color:light,width:1.5,alpha:opacity*(1-u)});
   }return;
  }
  if(p.move==='pulse'){
   const u=Math.min(1,age/.36),[px,py]=at(18+u*100,0),r=9+u*34;
   for(let ring=0;ring<2;ring++){const rr=Math.max(3,r-ring*7);g.ellipse(px-dx*ring*7,py-dy*ring*7,rr*.65,rr).stroke({color:0x1775bf,width:6,alpha:opacity*(1-ring*.28)}).ellipse(px-dx*ring*7,py-dy*ring*7,rr*.65,rr).stroke({color:light,width:2.5,alpha:opacity});}return;
  }
  if(p.move==='sphere'){
   const r=42+strength*45;this.back.ellipse(x,y,r,r*1.12).fill({color:c,alpha:opacity*.1}).stroke({color:c,width:6,alpha:opacity*.25}).ellipse(x,y,r,r*1.12).stroke({color:light,width:1.5,alpha:opacity*.8});
   for(let i=0;i<3;i++){const a=t*2+i*TAU/3;this.star(g,x+Math.cos(a)*r,y+Math.sin(a)*r*1.12,5,light,opacity,a);}return;
  }
  if(p.move==='beam'){
   const reach=260*Math.min(strength,age/.15)*(.35+.65*(e.foreshortening??1));
   for(let layer=0;layer<3;layer++){const pts:number[]=[],width=[23,13,4][layer];for(let side=0;side<2;side++)for(let i=0;i<=18;i++){const u=side?1-i/18:i/18;pts.push(...at(u*reach,(side?-1:1)*width*(.35+u*.8)*Math.min(1,(1-u)*16)));}g.poly(pts).fill({color:layer===0?c:layer===1?light:0xffffff,alpha:opacity*(layer===0?.65:.9)});}
   for(let phase=0;phase<2;phase++){const pts:number[]=[];for(let i=0;i<=24;i++){const u=i/24;pts.push(...at(u*reach,Math.sin(u*24-t*25+phase*Math.PI)*(4+u*13)));}g.poly(pts,false).stroke({color:light,width:1.5,alpha:opacity*.75});}return;
  }
  if(p.kind==='fire'||p.kind==='dragon'){
   const length=(p.kind==='fire'?195:215)*Math.min(strength,age/.18)*(.35+.65*(e.foreshortening??1)),osc=t*19;
   // An accelerating stream with asymmetric tongues, dark cel edge and a slender hot core.
   for(let layer=0;layer<3;layer++){
    const points:number[]=[],width=[26,17,6][layer],reach=length*(1-layer*.13);
    for(let side=0;side<2;side++)for(let j=0;j<=26;j++){
     const u=side?1-j/26:j/26,root=2*(1-u),shape=(.12+.88*u)*Math.min(1,(1-u)*13);
     const tongues=1+.21*Math.sin(u*27-osc+side*2)+.11*Math.sin(u*43-osc*1.4);
     const center=Math.sin(u*8-t*7)*u*6;
     points.push(...at(u*reach,center+(side?-1:1)*(root+width*shape*tongues)));
    }
    g.poly(points).fill({color:layer===0?c:layer===1?(p.kind==='fire'?0xffcc53:light):0xfff9d9,alpha:opacity});
    if(layer===0)g.poly(points).stroke({color:p.kind==='fire'?0xbc3449:0x394da4,width:1.2,alpha:opacity*.65});
   }
   for(let i=0;i<(this.low?5:10);i++){
    const u=(age*2.2+i*.103)%1,side=Math.sin(i*4.7),[px,py]=at(length*(.4+u*.75),side*(16+u*32)),r=(1-u)*7+2;
    // Curved tear-off tongues follow the jet instead of orbiting the Pokémon.
    g.moveTo(px-dx*r*2,py-dy*r*2).quadraticCurveTo(px+nx*r,py+ny*r,px+dx*r*2,py+dy*r*2).quadraticCurveTo(px-nx*r*.5,py-ny*r*.5,px-dx*r*2,py-dy*r*2).fill({color:i%3?c:light,alpha:opacity*(1-u)});
   }
  }else if(p.kind==='water'||p.kind==='ice'){
   const reach=205*Math.min(strength,age/.18)*(.35+.65*(e.foreshortening??1)),w=p.species==='blastoise'?10:14;
   for(let layer=0;layer<3;layer++){
    const pts:number[]=[],width=w*(1-layer*.31);
    for(let side=0;side<2;side++)for(let j=0;j<=20;j++){const u=side?1-j/20:j/20,taper=Math.min(1,(1-u)*12),wave=Math.sin(u*22-t*29+index)*2*u;pts.push(...at(u*reach,wave+(side?-1:1)*width*(.55+u*.8)*taper));}
    g.poly(pts).fill({color:layer===0?0x1675cf:layer===1?c:light,alpha:opacity*(layer===2?.88:1)});
   }
   for(let i=0;i<(this.low?5:9);i++){
    const u=(age*2.6+i*.17)%1,[px,py]=at(reach*.88+u*34,Math.sin(i*13)*(6+u*28));
    g.moveTo(px-dx*6,py-dy*6).lineTo(px+nx*2,py+ny*2).lineTo(px+dx*9,py+dy*9).closePath().fill({color:light,alpha:opacity*(1-u)});
   }
  }else if(p.kind==='electric'){
   const pulse=.65+.35*Math.sin(age*67)**2,seed=Math.floor(age*22),count=this.low?3:5;
   for(let i=0;i<count;i++){
    const angle=(index?-.4:.5)+i/count*TAU,length=(100+i%3*29)*strength,pts:number[]=[x,y];
    for(let j=1;j<=6;j++){const u=j/6,z=j===6?0:Math.sin(j*12.4+i*6.3+seed*4.1)*10;pts.push(x+Math.cos(angle)*length*u-Math.sin(angle)*z,y+Math.sin(angle)*length*u+Math.cos(angle)*z);}
    g.poly(pts,false).stroke({color:c,width:7,alpha:opacity*.18*pulse}).poly(pts,false).stroke({color:c,width:3.6,alpha:opacity*pulse}).poly(pts,false).stroke({color:light,width:1.1,alpha:opacity*pulse});
    const bx=pts[6],by=pts[7];g.moveTo(bx,by).lineTo(bx+Math.cos(angle+.8)*18,by+Math.sin(angle+.8)*18).lineTo(bx+Math.cos(angle+.3)*34,by+Math.sin(angle+.3)*34).stroke({color:light,width:1,alpha:opacity});
   }
  }else if(p.move==='blade'||p.move==='petals'){
   const count=this.low?5:9;for(let i=0;i<count;i++){
    const u=(age*1.7+i/count)%1,side=Math.sin(i*9.1),[px,py]=at(22+u*185,side*(35+u*45)),r=(6+i%3*2)*(1-u*.35),a=t*8+i;
    const vx=Math.cos(a)*r,vy=Math.sin(a)*r;
    g.moveTo(px-vx,py-vy).quadraticCurveTo(px-vy,py+vx,px+vx*2,py+vy*2).quadraticCurveTo(px+vy*.4,py-vx*.4,px-vx,py-vy).fill({color:i%2?c:light,alpha:opacity*(1-u*.7)});
    g.moveTo(px-vx,py-vy).lineTo(px+vx*1.6,py+vy*1.6).stroke({color:p.move==='petals'?0xffd5ed:p.kind==='leaf'?0x247a55:0xf1ffff,width:.8,alpha:opacity});
   }
  }else{
   // Aura pressure travels outward in staggered crescents, with a single focal flash.
   const count=this.low?5:8;
   for(let i=0;i<count;i++){
    const u=Math.min(1,Math.max(0,age*2.3-i*.045)),angle=i/count*TAU,r=22+u*115,span=.28+(i%2)*.12;
    g.moveTo(x+Math.cos(angle-span)*r,y+Math.sin(angle-span)*r*.75).quadraticCurveTo(x+Math.cos(angle)*(r+12),y+Math.sin(angle)*(r+12)*.75,x+Math.cos(angle+span)*r,y+Math.sin(angle+span)*r*.75).stroke({color:i%2?c:light,width:5*(1-u)+1,alpha:opacity*(1-u)});
   }
   if(age<.18)this.star(g,x,y,30*(1-age/.18),light,opacity*(1-age/.18),.2);
  }
 }
 private orb(g:Graphics,x:number,y:number,r:number,alpha:number,time:number){
  g.circle(x,y,r*1.2).fill({color:0x7034c3,alpha:alpha*.17}).circle(x,y,r).fill({color:0x281145,alpha}).circle(x-r*.15,y-r*.15,r*.7).fill({color:0x652a9d,alpha});
  for(let i=0;i<3;i++){const a=time*4+i*TAU/3;g.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r).quadraticCurveTo(x+Math.cos(a+.6)*r*.2,y+Math.sin(a+.6)*r*.2,x+Math.cos(a+1.6)*r*.9,y+Math.sin(a+1.6)*r*.9).stroke({color:i%2?0xe3a9ff:0xb577ff,width:2,alpha:alpha*.85});}
 }
 private shuriken(g:Graphics,x:number,y:number,r:number,angle:number,alpha:number){
  const points:number[]=[];for(let i=0;i<12;i++){const a=angle+i*TAU/12,rr=i%3===0?r:i%3===1?r*.27:r*.36;points.push(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.72);}
  g.poly(points).fill({color:0x3aaeff,alpha:alpha*.85}).stroke({color:0xc6ffff,width:1.7,alpha});
  for(let i=0;i<4;i++){const a=angle+i*Math.PI/2;g.moveTo(x,y).lineTo(x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.58).stroke({color:0xeaffff,width:1.6,alpha:alpha*.9});}
 }
 destroy(){this.back.destroy();this.front.destroy();}
}
