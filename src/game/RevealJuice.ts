import {Container,Graphics,Sprite,type Texture} from 'pixi.js';
import {juiceTextures} from './WinJuice';

type Kind='spark'|'ring'|'flash'|'shaft'|'mote'|'lines'|'gather'|'coin'|'flow'|'charge'|'beam'|'shed';
type Point={x:number;y:number};
type Particle={sprite:Sprite;kind:Kind;x:number;y:number;vx:number;vy:number;age:number;life:number;size:number;squash:number;drag:number;gravity:number};
/** Pressure, light and debris for the Poké Ball's beats and the special-pull award. Sizes are in the host's units. */
export class RevealJuice{
 readonly back=new Container({isRenderGroup:true});readonly front=new Container({isRenderGroup:true});
 /** Host units per card unit: 1 inside the card world, smaller or larger on screen. */
 scale=1;
 private live:Particle[]=[];private pool:Particle[]=[];private seed=3;private veil=new Graphics();private veilAlpha=0;private veilColor=0xffffff;private limit:number;private pull:{x:number;y:number;left:number;total:number;tint:number;carry:number}|null=null;private glow:Sprite;
 private path:{from:()=>Point;to:()=>Point;left:number;tint:number;carry:number}|null=null;private core:Sprite;
 private charged={x:0,y:0,amount:0,tint:0xffffff,carry:0};private orb:Sprite;
 constructor(private low=false){this.limit=low?70:170;this.veil.rect(-1600,-1600,3200,3200).fill(0xffffff);this.veil.alpha=0;this.veil.blendMode='add';this.front.addChild(this.veil);this.glow=new Sprite(juiceTextures().dot);this.glow.anchor.set(.5);this.glow.blendMode='add';this.glow.visible=false;this.front.addChild(this.glow);
  const soft=(layer:Container)=>{const sprite=new Sprite(juiceTextures().dot);sprite.anchor.set(.5);sprite.blendMode='add';sprite.visible=false;layer.addChild(sprite);return sprite;};this.core=soft(this.back);this.orb=soft(this.front);
  this.back.eventMode=this.front.eventMode='none';}
 private random(){this.seed=(this.seed*16807)%2147483647;return (this.seed-1)/2147483646;}
 private spawn(kind:Kind,texture:Texture,layer=this.front){
  if(this.live.length>=this.limit)return null;
  let p=this.pool.pop();if(!p){const sprite=new Sprite(texture);sprite.anchor.set(.5);sprite.blendMode='add';p={sprite,kind,x:0,y:0,vx:0,vy:0,age:0,life:1,size:1,squash:1,drag:0,gravity:0};}
  p.kind=kind;p.age=0;p.vx=p.vy=0;p.drag=0;p.gravity=0;p.squash=1;p.sprite.blendMode=kind==='coin'?'normal':'add';p.sprite.texture=texture;p.sprite.anchor.set(.5);p.sprite.tint=0xffffff;p.sprite.rotation=0;p.sprite.alpha=0;layer.addChild(p.sprite);this.live.push(p);return p;
 }
 private sparks(x:number,y:number,count:number,speed:number,tint:number,lift=0){const t=juiceTextures();for(let i=0;i<(this.low?count/2:count);i++){const p=this.spawn('spark',t.streak);if(!p)return;const a=this.random()*6.283,v=speed*this.scale*(.3+this.random()*.9);p.x=x;p.y=y;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v*.85-lift*speed*this.scale;p.life=.3+this.random()*.45;p.size=.6+this.random()*.9;p.drag=2.8;p.gravity=speed*this.scale*.9;p.sprite.tint=this.random()<.4?0xffffff:tint;}}
 private ring(x:number,y:number,size:number,life:number,tint:number,squash=1,layer=this.front){const p=this.spawn('ring',juiceTextures().ring,layer);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.squash=squash;p.sprite.tint=tint;}
 private flash(x:number,y:number,size:number,life:number,tint=0xffffff){const p=this.spawn('flash',juiceTextures().star);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.sprite.tint=tint;p.sprite.rotation=this.random();}
 private screen(alpha:number,color=0xffffff){this.veilAlpha=Math.max(this.veilAlpha,alpha);this.veilColor=color;}
 /** Building blocks for other scenes that share this light: a point flare, a pressure ring, thrown sparks and a frame of screen light. */
 flare(x:number,y:number,size:number,tint=0xffffff,life=.24){this.flash(x,y,size,life,tint);}
 pressure(x:number,y:number,size:number,tint:number,squash=1,life=.4,behind=false){this.ring(x,y,size,life,tint,squash,behind?this.back:this.front);}
 burst(x:number,y:number,count:number,speed:number,tint:number,lift=0){this.sparks(x,y,count,speed,tint,lift);}
 flood(alpha:number,color=0xffffff){this.screen(alpha,color);}
 /** One bar of light from a point along an angle, with no sparks: an anamorphic flare, a kick along the floor, a pillar. */
 streak(x:number,y:number,angle:number,length:number,thickness:number,tint:number,life=.4,behind=false){const p=this.spawn('beam',juiceTextures().streak,behind?this.back:this.front);if(!p)return;p.x=x;p.y=y;p.size=length;p.squash=thickness;p.life=life;p.sprite.tint=tint;p.sprite.rotation=angle;}
 /** A slow fan of light behind an object, such as a card leaving the ball. */
 fan(x:number,y:number,size:number,tint:number,life=.5){const p=this.spawn('lines',juiceTextures().rays,this.back);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.sprite.tint=tint;p.sprite.rotation=this.random()*6.283;}
 /** One award beat: a flat pressure ring, a flare and sparks thrown from the amount. */
 pop(x:number,y:number,size:number,tint:number,count=10){this.ring(x,y,size*.8,.36,tint,.3);this.flash(x,y,size*.5,.22);this.sparks(x,y,count,size*1.5/this.scale,tint,.2);}
 /** Poké coins fountain upward and fall under gravity. */
 coins(x:number,y:number,count:number,spread:number,behind=false){const t=juiceTextures();for(let i=0;i<(this.low?count/2:count);i++){const p=this.spawn('coin',t.coins[0],behind?this.back:this.front);if(!p)return;p.x=x+(this.random()-.5)*spread*.5;p.y=y;p.vx=(this.random()-.5)*spread*2.2;p.vy=-spread*(1.5+this.random()*1.5);p.gravity=spread*5.2;p.life=1.1+this.random()*.5;p.size=(.7+this.random()*.5)*spread/190;p.squash=(this.random()<.5?-1:1)*(9+this.random()*9);p.drag=0;p.age=-this.random()*.12;}}
 /** The ball breaks the artwork: one hard frame of light, radial pressure and torn paper sparks. */
 puncture(x:number,y:number,color:number){
  // Contact on the card: a hot point, a ring of the Pokémon's colour across the card face, sparks thrown off it.
  const t=juiceTextures();this.screen(.18,color);this.flash(x,y,190,.2);this.ring(x,y,230,.36,color);this.sparks(x,y,14,380,color,.1);
  const rays=this.spawn('lines',t.rays);if(rays){rays.x=x;rays.y=y;rays.size=700;rays.life=.34;rays.sprite.tint=color;rays.sprite.rotation=this.random()*6.283;}
 }
 bounce(x:number,y:number,strength=1){this.ring(x,y,150*strength,.3,0xdff6ff,.24,this.back);this.sparks(x,y-4,Math.round(9*strength),170*strength,0xdff6ff,.5);}
 /** Light is drawn into the sealed ball before it opens; the pull accelerates toward the release. */
 gather(x:number,y:number,seconds:number,tint:number){this.pull={x,y,left:seconds,total:seconds,tint,carry:0};}
 /** Light leaves the open ball and flows into the forming Pokémon: both ends are read every frame, so the stream follows them. */
 stream(from:()=>Point,to:()=>Point,seconds:number,tint:number){this.path={from,to,left:seconds,tint,carry:0};}
 /** Call every frame while the Pokémon charges: light converges on its emitter and a core builds there. */
 charging(x:number,y:number,amount:number,tint:number){Object.assign(this.charged,{x,y,amount,tint});}
 /** The attack leaves the emitter as a beam of light along its direction. */
 beam(x:number,y:number,dx:number,dy:number,tint:number,light:number,length=430){
  const t=juiceTextures(),angle=Math.atan2(dy,dx);
  for(const [scale,color,life] of [[5.5,tint,.5],[2.2,0xffffff,.36]] as const){const p=this.spawn('beam',t.streak);if(!p)break;p.x=x;p.y=y;p.size=length;p.squash=scale;p.life=life;p.sprite.tint=color;p.sprite.rotation=angle;}
  for(let i=0;i<(this.low?8:18);i++){const p=this.spawn('spark',t.streak);if(!p)break;const a=angle+(this.random()-.5)*.5,v=(280+this.random()*520)*this.scale;p.x=x;p.y=y;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v;p.life=.25+this.random()*.3;p.size=.6+this.random()*.8;p.drag=3;p.sprite.tint=this.random()<.5?0xffffff:light;}
 }
 /** Motes shed along a moving path, such as the thrown ball. */
 trail(x:number,y:number,size:number,tint:number){const p=this.spawn('shed',juiceTextures().dot);if(!p)return;p.x=x+(this.random()-.5)*size*.5;p.y=y+(this.random()-.5)*size*.5;p.vx=(this.random()-.5)*30;p.vy=(this.random()-.5)*30;p.size=size*(.18+this.random()*.22);p.life=.22+this.random()*.2;p.sprite.tint=this.random()<.4?0xffffff:tint;}
 /** The ball opens: a standing shaft of light, a ground ring and a rush of motes for the forming Pokémon. */
 release(x:number,y:number,color:number,light:number){
  // The ball opens: a flare at the mouth, pressure across the floor, motes rising into the stream that forms the Pokémon.
  const t=juiceTextures();this.screen(.16,light);this.flash(x,y,230,.26,light);this.ring(x,y+18,330,.5,color,.26,this.back);this.sparks(x,y,18,420,light,.55);
  for(let i=0;i<(this.low?10:22);i++){const p=this.spawn('mote',t.dot);if(!p)break;p.x=x+(this.random()-.5)*110;p.y=y+(this.random()-.3)*40;p.vx=(this.random()-.5)*60;p.vy=-(140+this.random()*300);p.life=.6+this.random()*.6;p.size=3+this.random()*6;p.age=-this.random()*.35;p.sprite.tint=this.random()<.4?0xffffff:light;}
 }
 /** A grounded Pokémon lands with weight: a flat pressure ring and dust thrown along the floor. */
 landing(x:number,y:number,color:number,weight=1){this.screen(.16*weight,color);this.ring(x,y,520*weight,.46,0xffffff,.22,this.back);this.ring(x,y,340*weight,.34,color,.22,this.back);this.sparks(x,y-6,Math.round(18*weight),330*weight,color,.35);}
 /** The attack leaves: a muzzle flare that kicks the camera back. */
 blast(x:number,y:number,_color:number,light:number){this.screen(.14,light);this.flash(x,y,260,.26,light);this.sparks(x,y,12,460,light);}
 update(dt:number){
  const path=this.path;
  if(path){const from=path.from(),to=path.to(),distance=Math.hypot(to.x-from.x,to.y-from.y);
   if(path.left>0){path.left-=dt;path.carry+=dt*(this.low?30:70);while(path.carry>=1){path.carry--;const p=this.spawn('flow',juiceTextures().streak,this.back);if(!p)break;p.vx=(this.random()*2-1);p.size=8+this.random()*14;p.life=.3+this.random()*.18;p.sprite.tint=this.random()<.45?0xffffff:path.tint;}}
   // The forming body holds a core of the same light until the stream runs dry.
   this.core.visible=path.left>0;if(this.core.visible){this.core.position.set(to.x,to.y);this.core.tint=path.tint;this.core.scale.set((50+distance*.25)*(.92+Math.sin(path.left*60)*.08)/32);this.core.alpha=Math.min(1,path.left*4)*.55;}
  }
  const charge=this.charged;this.orb.visible=charge.amount>.01;
  if(this.orb.visible){charge.carry+=dt*(this.low?24:56)*charge.amount;while(charge.carry>=1){charge.carry--;const p=this.spawn('charge',juiceTextures().streak);if(!p)break;p.vx=this.random()*6.283;p.size=70+this.random()*90;p.life=.24+this.random()*.14;p.sprite.tint=this.random()<.45?0xffffff:charge.tint;}
   this.orb.position.set(charge.x,charge.y);this.orb.tint=charge.tint;this.orb.scale.set((10+charge.amount*46)*(.88+Math.random()*.12)/32);this.orb.alpha=Math.min(1,.3+charge.amount);}
  charge.amount=0;
  if(this.pull){const pull=this.pull,build=1-pull.left/pull.total;pull.left-=dt;pull.carry+=dt*(this.low?18:42)*(.35+build);
   while(pull.carry>=1){pull.carry--;const p=this.spawn('gather',juiceTextures().streak);if(!p)break;p.x=pull.x;p.y=pull.y;p.vx=this.random()*6.283;p.size=120+this.random()*150;p.life=.22+this.random()*.16;p.sprite.tint=this.random()<.45?0xffffff:pull.tint;}
   this.glow.visible=true;this.glow.position.set(pull.x,pull.y);this.glow.tint=pull.tint;this.glow.scale.set((40+build*90)*(.9+Math.sin(build*70)*.1)/32);this.glow.alpha=build*.8;if(pull.left<=0){this.pull=null;this.glow.visible=false;this.path=null;this.core.visible=false;this.orb.visible=false;this.charged.amount=0;}}
  this.veilAlpha=Math.max(0,this.veilAlpha-dt*3.6);this.veil.alpha=this.veilAlpha;this.veil.tint=this.veilColor;this.veil.visible=this.veilAlpha>.004;
  for(let i=this.live.length-1;i>=0;i--){
   const p=this.live[i],s=p.sprite;p.age+=dt;
   if(p.age>=p.life){s.removeFromParent();this.pool.push(p);this.live[i]=this.live[this.live.length-1];this.live.pop();continue;}
   if(p.age<0){s.alpha=0;continue;}const k=p.age/p.life;
   p.vx-=p.vx*p.drag*dt;p.vy+=(p.gravity-p.vy*p.drag)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;s.position.set(p.x,p.y);
   if(p.kind==='flow'&&path){const from=path.from(),to=path.to(),u=k*k*(3-2*k),mx=(from.x+to.x)/2,my=(from.y+to.y)/2,nx=-(to.y-from.y),ny=to.x-from.x,bow=p.vx*.32,cx=mx+nx*bow,cy=my+ny*bow,x=(1-u)*(1-u)*from.x+2*(1-u)*u*cx+u*u*to.x,y=(1-u)*(1-u)*from.y+2*(1-u)*u*cy+u*u*to.y,tx=2*(1-u)*(cx-from.x)+2*u*(to.x-cx),ty=2*(1-u)*(cy-from.y)+2*u*(to.y-cy);s.position.set(x,y);s.rotation=Math.atan2(ty,tx);s.scale.set(p.size*1.6/128,p.size*.05);s.alpha=Math.sin(k*Math.PI);continue;}
   if(p.kind==='charge'){const radius=p.size*(1-k*k),a=p.vx+k*1.2;s.position.set(this.charged.x+Math.cos(a)*radius,this.charged.y+Math.sin(a)*radius*.8);s.rotation=a+Math.PI+.4;s.scale.set(p.size*(.4+k*.5)/128*.5,.45-k*.2);s.alpha=Math.min(1,k/.25)*(k>.85?(1-k)/.15:1);continue;}
   if(p.kind==='beam'){const reach=1-(1-Math.min(1,k/.22))**3;s.anchor.set(0,.5);s.position.set(p.x,p.y);s.scale.set(Math.max(.01,p.size*reach/128),p.squash*(1-k)**1.2);s.alpha=(1-k)**1.3;continue;}
   if(p.kind==='shed'){s.position.set(p.x+=p.vx*dt,p.y+=p.vy*dt);s.scale.set(p.size*(1-k)/32);s.alpha=(1-k)*.85;continue;}
   if(p.kind==='gather'){const radius=p.size*(1-k*k),a=p.vx+k*.9;s.position.set(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius*.8);s.rotation=a+Math.PI+.45;s.scale.set(p.size*(.4+k*.5)/128*.5,.5-k*.25);s.alpha=Math.min(1,k/.25)*(k>.85?(1-k)/.15:1);continue;}
   if(p.kind==='coin'){const turn=(p.age*p.squash)/Math.PI+p.x*.01;s.texture=juiceTextures().coins[Math.floor((turn-Math.floor(turn))*8)%8];s.scale.set(p.size);s.alpha=Math.min(1,p.age/.05)*(k>.8?(1-k)/.2:1);}
   else if(p.kind==='spark'){s.rotation=Math.atan2(p.vy,p.vx);s.scale.set(Math.max(.04,Math.hypot(p.vx,p.vy)/1500)*p.size*this.scale,p.size*.42*this.scale);s.alpha=1-k*k;}
   else if(p.kind==='ring'){const grow=1-(1-k)**4,size=p.size*(.1+grow*.9)/128;s.scale.set(size,size*p.squash);s.alpha=(1-k)**1.5;}
   else if(p.kind==='flash'){s.scale.set(p.size*(.5+k*.8)/64);s.alpha=(1-k)**2;}
   else if(p.kind==='shaft'){s.rotation=-Math.PI/2;s.scale.set(9*(1-(1-k)**3)+1,(1-k)*9+.6);s.alpha=(1-k)**1.4*.85;}
   else if(p.kind==='mote'){s.scale.set(p.size/32);s.alpha=Math.sin(k*Math.PI);}
   else {s.rotation+=dt*.5;s.scale.set(p.size*(.45+k*.7)/512);s.alpha=(1-k)**1.6*.85;}
  }
 }
 clear(){for(const p of this.live){p.sprite.removeFromParent();this.pool.push(p);}this.live.length=0;this.veilAlpha=0;this.veil.alpha=0;this.pull=null;this.glow.visible=false;}
 destroy(){this.clear();for(const p of this.pool)p.sprite.destroy();this.pool.length=0;this.back.destroy({children:true});this.front.destroy({children:true});}
}
