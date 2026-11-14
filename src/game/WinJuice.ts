import {Container,Graphics,Rectangle,Sprite,Texture} from 'pixi.js';
import {smooth,WIN_CINEMA_FINISH} from './winCinemaMotion';
import {winChoreography,winTierProfile,type CinemaTier} from './winChoreography';
import {finalStrikeTravel} from './finalStrike';
import {winReturnPose} from './winContinuity';
import {impactFrame,juiceBeats,lensBloom,scoreHeat,TIER_PALETTE,winLadder} from './winJuiceMotion';
import type {PowerKind} from './powerProfiles';
import {EYE_BEAT} from './championshipBeat';
const EYE_GLINT=EYE_BEAT.glint;

type Point={x:number;y:number};
type Kind='spark'|'gather'|'ring'|'flash'|'warp'|'shed'|'glint'|'glare';
type Particle={sprite:Sprite;kind:Kind;x:number;y:number;vx:number;vy:number;age:number;life:number;size:number;spin:number;phase:number;drag:number;gravity:number;depth:number};
export type JuiceFrame={socket:Point|null;body:Point;amount:Point;banner:Point;count:number;exitAge:number;reduced:boolean;eyes?:Point[];bars?:number};

let atlas:{dot:Texture;streak:Texture;ring:Texture;star:Texture;rays:Texture;coins:Texture[]}|undefined;
const sheet=(w:number,h:number,paint:(c:CanvasRenderingContext2D)=>void)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;paint(canvas.getContext('2d',{willReadFrequently:true})!);return Texture.from(canvas);};
/** Soft light shapes shared by every win: glow, streak, pressure ring, flare, rays and shaded coins. */
export function juiceTextures(){
 if(atlas)return atlas;
 const dot=sheet(64,64,c=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.72)');g.addColorStop(.6,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);});
 const streak=sheet(128,16,c=>{const g=c.createLinearGradient(0,0,128,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.72,'rgba(255,255,255,.75)');g.addColorStop(1,'rgba(255,255,255,1)');c.fillStyle=g;c.beginPath();c.moveTo(0,8);c.quadraticCurveTo(90,0,126,5);c.quadraticCurveTo(128,8,126,11);c.quadraticCurveTo(90,16,0,8);c.fill();});
 const ring=sheet(256,256,c=>{const g=c.createRadialGradient(128,128,92,128,128,127);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.62,'rgba(255,255,255,.22)');g.addColorStop(.86,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,256,256);});
 const star=sheet(128,128,c=>{c.translate(64,64);const glow=c.createRadialGradient(0,0,0,0,0,40);glow.addColorStop(0,'rgba(255,255,255,.9)');glow.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=glow;c.fillRect(-64,-64,128,128);c.fillStyle='#fff';for(let i=0;i<4;i++){c.rotate(Math.PI/2);c.beginPath();c.moveTo(0,-5);c.quadraticCurveTo(14,-2,62,0);c.quadraticCurveTo(14,2,0,5);c.fill();}});
 // Volumetric rays: overlapping soft beams of uneven length around an open centre.
 const rays=sheet(512,512,c=>{c.translate(256,256);let seed=11;const random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;for(let i=0;i<46;i++){const a=random()*Math.PI*2,reach=120+random()*136,width=.02+random()*.07,g=c.createRadialGradient(0,0,18,0,0,reach);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.22,'rgba(255,255,255,'+(.10+random()*.22)+')');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;for(const spread of [1,.55,.25]){c.beginPath();c.moveTo(0,0);c.arc(0,0,reach,a-width*spread,a+width*spread);c.closePath();c.fill();}}});
 const strip=sheet(64*8,64,c=>{for(let i=0;i<8;i++){const turn=Math.abs(Math.cos(i/8*Math.PI)),rx=Math.max(3,27*turn),x=32+i*64;const g=c.createLinearGradient(x-rx,5,x+rx,59);g.addColorStop(0,'#fff6b8');g.addColorStop(.45,'#ffc934');g.addColorStop(1,'#c9741a');c.fillStyle='#8a4a12';c.beginPath();c.ellipse(x,34,rx,28,0,0,Math.PI*2);c.fill();c.fillStyle=g;c.beginPath();c.ellipse(x,32,rx,28,0,0,Math.PI*2);c.fill();if(rx>9){c.strokeStyle='rgba(138,74,18,.75)';c.lineWidth=2.6;c.beginPath();c.ellipse(x,32,rx*.68,19,0,0,Math.PI*2);c.moveTo(x-rx*.68,32);c.lineTo(x+rx*.68,32);c.stroke();c.fillStyle='#fff3a6';c.beginPath();c.ellipse(x,32,rx*.2,5.6,0,0,Math.PI*2);c.fill();c.stroke();}c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.ellipse(x-rx*.42,17,rx*.22,5.4,-.5,0,Math.PI*2);c.fill();}});
 const coins=Array.from({length:8},(_,i)=>new Texture({source:strip.source,frame:new Rectangle(i*64,0,64,64)}));
 return atlas={dot,streak,ring,star,rays,coins};
}
const mix=(a:number,b:number,t:number)=>{let out=0;for(const shift of [16,8,0])out|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;return out;};

/** Light around the 3D performance. One chain: energy gathers at the Pokémon, leaves it, lands on the amount and pays out. */
export class WinJuice{
 // Each layer is its own render group: spawning and retiring particles never rebuilds the game's whole display list.
 readonly back=new Container({isRenderGroup:true});readonly mid=new Container({isRenderGroup:true});readonly front=new Container({isRenderGroup:true});
 private pool:Particle[]=[];private live:Particle[]=[];private last=-1;private seed=1;private carry={gather:0,warp:0,shed:0};
 private aura:Sprite;private socketGlow:Sprite;private amountGlow:Sprite;private head:Sprite;private headCore:Sprite;private tail:Sprite;private launch:Point|null=null;
 private eyeGlow:Sprite[]=[];private glinted=false;
 private bloomHalo:Sprite;private bloomCore:Sprite;private bloomRays:Sprite;private arc=new Graphics();private veil=new Sprite(Texture.WHITE);
 private beats:ReturnType<typeof juiceBeats>;private rank:number;private limit:number;
 constructor(private tier:CinemaTier,private color:number,private light:number,private low=false,private kind:PowerKind='wind'){
  const t=juiceTextures();this.beats=juiceBeats(tier);this.rank=winTierProfile(tier).rank;this.limit=low?160:400;
  const glow=(parent:Container,texture=t.dot)=>{const sprite=new Sprite(texture);sprite.anchor.set(.5);sprite.blendMode='add';sprite.alpha=0;parent.addChild(sprite);return sprite;};
  this.aura=glow(this.back);this.amountGlow=glow(this.back);
  this.tail=new Sprite(t.streak);this.tail.anchor.set(1,.5);this.tail.blendMode='add';this.tail.visible=false;this.arc.blendMode='add';this.mid.addChild(this.arc,this.tail);this.head=glow(this.mid);this.headCore=glow(this.mid);this.socketGlow=glow(this.mid);
  this.eyeGlow=[glow(this.front),glow(this.front)];this.bloomRays=glow(this.front,t.rays);this.bloomHalo=glow(this.front);this.bloomCore=glow(this.front);this.veil.visible=false;this.front.addChild(this.veil);
  for(const layer of [this.back,this.mid,this.front])layer.eventMode='none';
  // Sprites exist before the first burst, so no strike pays for allocation.
  for(let i=0;i<(low?70:180);i++){const sprite=new Sprite(t.dot);sprite.anchor.set(.5);this.pool.push({sprite,kind:'spark',x:0,y:0,vx:0,vy:0,age:0,life:1,size:1,spin:0,phase:0,drag:0,gravity:0,depth:1});}
 }
 private random(){this.seed=(this.seed*16807)%2147483647;return (this.seed-1)/2147483646;}
 private spawn(kind:Kind,layer:Container,texture:Texture,additive:boolean){
  if(this.live.length>=this.limit)return null;
  let p=this.pool.pop();
  if(!p){const sprite=new Sprite(texture);sprite.anchor.set(.5);p={sprite,kind,x:0,y:0,vx:0,vy:0,age:0,life:1,size:1,spin:0,phase:0,drag:0,gravity:0,depth:1};}
  p.kind=kind;p.age=0;p.spin=0;p.phase=this.random()*6.283;p.drag=0;p.gravity=0;p.depth=1;p.vx=p.vy=0;p.sprite.texture=texture;p.sprite.blendMode=additive?'add':'normal';p.sprite.tint=0xffffff;p.sprite.rotation=0;p.sprite.anchor.set(.5);p.sprite.visible=true;
  layer.addChild(p.sprite);this.live.push(p);return p;
 }
 private sparks(x:number,y:number,count:number,speed:number,tint:number,upward=0,layer=this.mid){
  const t=juiceTextures();
  for(let i=0;i<count;i++){const p=this.spawn('spark',layer,t.streak,true);if(!p)return;const a=this.random()*6.283,v=speed*(.35+this.random()*.85);p.x=x;p.y=y;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v-upward*speed;p.life=.32+this.random()*.5;p.size=.5+this.random()*.9;p.drag=2.6;p.gravity=speed*1.1;p.sprite.tint=this.random()<.35?0xffffff:tint;}
 }
 private ring(x:number,y:number,size:number,life:number,tint:number,squash=1,layer=this.mid){const p=this.spawn('ring',layer,juiceTextures().ring,true);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.spin=squash;p.sprite.tint=tint;}
 private flash(x:number,y:number,size:number,life:number,tint:number,layer=this.mid){const p=this.spawn('flash',layer,juiceTextures().star,true);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.sprite.tint=tint;p.sprite.rotation=this.random()*.6;}
 /** A strike on the amount: a flare and sparks on the lettering, scaled by its weight. */
 private strike(beat:ReturnType<typeof juiceBeats>[number],f:JuiceFrame,w:number,h:number){
  const unitSize=Math.min(w,h),palette=TIER_PALETTE[this.tier],weight=beat.weight;
  if(beat.opening){this.ring(w/2,h*.45,unitSize*2.1,.6,this.light);this.sparks(w/2,h*.45,this.low?12:26,unitSize*1.7,this.light);return;}
  const at=f.amount;
  // Contact on the lettering; the wave and the coins belong to the arena floor.
  this.flash(at.x,at.y,unitSize*(.5+weight*.42),.24,0xffffff);
  this.sparks(at.x,at.y,Math.round((this.low?10:20)*weight),unitSize*(.9+weight*.5),beat.finisher?palette.glow:this.color,.25);
 }
 private reset(){for(const p of this.live){p.sprite.removeFromParent();this.pool.push(p);}this.live.length=0;this.seed=1;this.launch=null;this.glinted=false;this.carry={gather:0,warp:0,shed:0};}
 update(age:number,w:number,h:number,f:JuiceFrame){
  const t=juiceTextures(),visible=!f.reduced;this.back.visible=this.mid.visible=this.front.visible=visible;if(!visible){this.reset();this.last=age;return;}
  if(age<this.last||this.last<0){this.reset();this.last=age;}
  const jump=age-this.last>.25,dt=Math.min(.05,age-this.last),unitSize=Math.min(w,h),palette=TIER_PALETTE[this.tier],choreo=winChoreography(age,this.tier),leave=1-smooth(f.exitAge/.35),landed=age>=WIN_CINEMA_FINISH;
  // Events: a skipped count only keeps the finisher.
  for(const beat of this.beats){
   if(this.last<beat.impact&&age>=beat.impact&&(!jump||beat.finisher))this.strike(beat,f,w,h);
   if(f.socket&&this.last<beat.release&&age>=beat.release){this.launch={...f.socket};if(!jump){this.flash(f.socket.x,f.socket.y,unitSize*(beat.finisher?.5:.3),.2,this.light);this.ring(f.socket.x,f.socket.y,unitSize*(beat.finisher?.5:.3),.3,this.light);this.sparks(f.socket.x,f.socket.y,this.low?5:10,unitSize*.7,this.light);}}
  }
  if(!jump)for(const rung of winLadder(this.tier)){if(this.last<rung.time&&age>=rung.time&&rung.time>2){const tone=TIER_PALETTE[rung.tier];this.flash(f.banner.x,f.banner.y,unitSize*.8,.22,0xffffff);this.sparks(f.banner.x,f.banner.y,this.low?8:16,unitSize*1.15,tone.glow,.12);}}
  // The eye beat: the eyes hold a glow in the Pokémon's light, then each flashes with a four-point glint and a horizontal flare.
  const eyes=f.eyes??[],bars=f.bars??0;
  if(!this.glinted&&age>=EYE_GLINT&&age<EYE_GLINT+.3&&eyes.length){this.glinted=true;for(const [index] of eyes.entries()){const star=this.spawn('glint',this.front,t.star,true);if(star){star.spin=index;star.size=unitSize*.24;star.life=.42;star.sprite.tint=0xffffff;star.phase=index?.4:-.2;}for(const side of [0,1]){const line=this.spawn('glare',this.front,t.streak,true);if(!line)break;line.spin=index;line.depth=side;line.size=unitSize*.62;line.life=.36;line.sprite.tint=mix(0xffffff,this.light,.35);}}}
  this.eyeGlow.forEach((sprite,i)=>{const eye=eyes[i];sprite.visible=!!eye&&bars>.01;if(!sprite.visible||!eye)return;sprite.position.set(eye.x,eye.y);sprite.tint=this.light;const flare=age>=EYE_GLINT?Math.exp(-(age-EYE_GLINT)*6):0;sprite.scale.set(unitSize*(.05+flare*.07)*(.92+Math.sin(age*48+i)*.08)/32);sprite.alpha=bars*(.5+flare*.4);});
  // Energy gathers at the emitter while the Pokémon charges.
  const charge=choreo.beat&&age<choreo.beat.release?choreo.charge*(choreo.finisher?1:.6):0,heat=scoreHeat(age,f.count,this.tier,f.exitAge),arena=smooth((age-2.0)/.5)*leave;
  if(f.socket&&charge>0){this.carry.gather+=dt*(this.low?26:60)*charge;while(this.carry.gather>=1){this.carry.gather--;const p=this.spawn('gather',this.mid,t.streak,true);if(!p)break;p.x=f.socket.x;p.y=f.socket.y;p.size=unitSize*(.16+this.random()*.22)*(choreo.finisher?1.25:1);p.life=.26+this.random()*.16;p.sprite.tint=this.random()<.4?0xffffff:this.light;}}else this.carry.gather=0;
  // The opening strike leaves the Pokémon as light, floods the lens and opens onto the arena.
  const lens=lensBloom(age),origin=this.launch??f.socket??{x:w/2,y:h*.4},lx=origin.x+(w/2-origin.x)*lens.centre,ly=origin.y+(h*.45-origin.y)*lens.centre;
  this.bloomHalo.visible=this.bloomCore.visible=this.bloomRays.visible=lens.visible;
  if(lens.visible){
   const size=unitSize*(.14+lens.grow*4.4)*(.96+Math.sin(age*57)*.04);
   this.bloomHalo.position.set(lx,ly);this.bloomHalo.tint=mix(this.color,this.light,.45);this.bloomHalo.scale.set(size/32);this.bloomHalo.alpha=lens.light;
   this.bloomCore.position.set(lx,ly);this.bloomCore.scale.set(size*.5/32);this.bloomCore.alpha=lens.light;
   this.bloomRays.position.set(lx,ly);this.bloomRays.tint=mix(this.light,0xffffff,.4);this.bloomRays.rotation=age*.7;this.bloomRays.scale.set(size*1.9/256);this.bloomRays.alpha=lens.light*.85;
   this.carry.warp+=dt*(this.low?34:80)*lens.rush;
   while(this.carry.warp>=1){this.carry.warp--;const p=this.spawn('warp',this.front,t.streak,true);if(!p)break;p.x=lx;p.y=ly;p.size=unitSize*(.03+this.random()*.05);p.spin=4.2+this.random()*3.2;p.life=1.3;p.sprite.tint=this.random()<.5?0xffffff:this.light;}
  }
  for(let i=this.live.length-1;i>=0;i--){
   const p=this.live[i],s=p.sprite;p.age+=dt;
   if(p.age>=p.life){s.removeFromParent();this.pool.push(p);this.live[i]=this.live[this.live.length-1];this.live.pop();continue;}
   if(p.age<0){s.visible=false;continue;}s.visible=true;const k=p.age/p.life;
   if(p.kind==='gather'){
    // Converge on the moving emitter: fast at the rim, absorbed at the core.
    const socket=f.socket??{x:p.x,y:p.y},radius=p.size*(1-k*k),a=p.phase+k*1.1;s.position.set(socket.x+Math.cos(a)*radius,socket.y+Math.sin(a)*radius*.78);s.rotation=a+Math.PI+.5;s.scale.set(p.size*(.5+k*.6)/128*.55,(1-k*.5)*unitSize/900);s.alpha=smooth(k/.25)*(1-smooth((k-.85)/.15));continue;
   }
   if(p.kind==='glint'||p.kind==='glare'){const eye=eyes[p.spin];if(eye)s.position.set(eye.x,eye.y);const pop=k<.18?(k/.18)**.6:Math.max(0,1-(k-.18)/.82)**1.6;
    if(p.kind==='glint'){s.rotation=p.phase+k*.9;s.scale.set(p.size*pop/128*(1+(k<.18?.0:.15)));s.alpha=Math.min(1,pop*1.3);}
    else{s.anchor.set(1,.5);s.rotation=p.depth?Math.PI:0;s.scale.set(p.size*pop/128,unitSize*.006*pop/16*4);s.alpha=pop;}
    continue;}
   if(p.kind==='warp'){
    // Light rushing past the lens: distance grows with itself, so streaks accelerate and lengthen like depth.
    p.size+=(p.size*p.spin+unitSize*.25)*dt;if(!lens.visible||p.size>Math.hypot(w,h)*.75){p.age=p.life;s.visible=false;continue;}s.position.set(lx+Math.cos(p.phase)*p.size,ly+Math.sin(p.phase)*p.size);s.rotation=p.phase;s.scale.set(p.size*.55/128,Math.min(2.4,.5+p.size/unitSize*2.4)*unitSize/700);s.alpha=Math.min(1,p.size/(unitSize*.14))*lens.light;continue;
   }
   p.vx-=p.vx*p.drag*dt;p.vy+=(p.gravity-p.vy*p.drag)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;s.position.set(p.x,p.y);
   if(p.kind==='spark'){const speed=Math.hypot(p.vx,p.vy);s.rotation=Math.atan2(p.vy,p.vx);s.scale.set(Math.max(.05,speed/unitSize*.34)*p.size,p.size*unitSize/1500);s.alpha=1-k*k;}
   else if(p.kind==='shed'){s.scale.set(p.size*(1-k)/32);s.alpha=(1-k)*.9;}
   else if(p.kind==='ring'){const grow=1-(1-k)**4;s.scale.set(p.size*(.12+grow*.88)/128,p.size*(.12+grow*.88)/128*p.spin);s.alpha=(1-k)**1.5*.9;}
   else {s.scale.set(p.size*(.55+k*.75)/64);s.alpha=(1-k)**2;}
  }
  // Steady lights.
  const strikeGlow=this.beats.reduce((sum,beat)=>{const a=age-beat.impact;return a>=0?sum+Math.exp(-a*4)*beat.weight:sum;},0);
  this.aura.position.set(f.body.x,f.body.y);this.aura.tint=this.color;this.aura.scale.set(unitSize*(1.05+charge*.35+Math.min(1,strikeGlow)*.25)/32);this.aura.alpha=Math.min(.55,(.10+charge*.26+strikeGlow*.16+(landed?.14:0))*arena);
  // The amount takes each strike as a brief glow in its own colour; lasting light belongs to the floor beneath it.
  this.amountGlow.position.set(f.amount.x,f.amount.y);this.amountGlow.tint=landed?palette.edge:this.color;this.amountGlow.scale.set(unitSize*.8/32,unitSize*.2/32);this.amountGlow.alpha=Math.min(.34,heat*.08+strikeGlow*.16)*leave;
  if(f.socket&&charge>0){this.socketGlow.visible=true;this.socketGlow.position.set(f.socket.x,f.socket.y);this.socketGlow.tint=this.light;const flicker=.85+Math.sin(age*61)*.15;this.socketGlow.scale.set(unitSize*(.05+charge*.19)*flicker/32);this.socketGlow.alpha=charge*.9;}else this.socketGlow.visible=false;
  // A hot point rides every released attack from the emitter into the amount, shedding light along its path.
  const flying=this.beats.find(beat=>!beat.opening&&age>=beat.release&&age<beat.impact),from=this.launch??f.socket,arc=this.arc.clear();
  this.head.visible=this.headCore.visible=this.tail.visible=!!flying&&!!from;
  if(flying&&from){const travel=flying.finisher?finalStrikeTravel(age):smooth((age-flying.release)/(flying.impact-flying.release)),lift=Math.sin(travel*Math.PI)*h*.035,x=from.x+(f.amount.x-from.x)*travel,y=from.y+(f.amount.y-from.y)*travel-lift,reach=Math.hypot(x-from.x,y-from.y),size=unitSize*(.09+flying.weight*.05)*(.9+Math.sin(age*70)*.1);
   this.head.position.set(x,y);this.head.tint=this.light;this.head.scale.set(size*1.5/32);this.head.alpha=.9;this.headCore.position.set(x,y);this.headCore.scale.set(size*.6/32);this.headCore.alpha=1;
   this.tail.position.set(x,y);this.tail.rotation=Math.atan2(y-from.y,x-from.x);this.tail.tint=this.light;this.tail.scale.set(Math.min(reach,unitSize*.5)/128,size*.5/16);this.tail.alpha=.8;
   this.carry.shed+=dt*(this.low?30:70);while(this.carry.shed>=1){this.carry.shed--;const p=this.spawn('shed',this.mid,t.dot,true);if(!p)break;p.x=x+(this.random()-.5)*size*.6;p.y=y+(this.random()-.5)*size*.6;p.vx=(this.random()-.5)*unitSize*.12;p.vy=(this.random()-.5)*unitSize*.12;p.life=.22+this.random()*.25;p.size=size*(.12+this.random()*.2);p.sprite.tint=this.random()<.4?0xffffff:this.light;}
   // Electric attacks keep a live arc between the emitter and the strike.
   if(this.kind==='electric'){const steps=9,roll=Math.floor(age*30),noise=(i:number)=>{const v=Math.sin(roll*12.9898+i*78.233)*43758.5453;return (v-Math.floor(v))*2-1;};for(const [width,color,alpha] of [[size*.34,this.color,.5],[size*.11,0xffffff,1]] as const){arc.moveTo(from.x,from.y);for(let i=1;i<steps;i++){const u=i/steps,jitter=noise(i)*size*.9*Math.sin(u*Math.PI);arc.lineTo(from.x+(x-from.x)*u+jitter,from.y+(y-from.y)*u-jitter*.6);}arc.lineTo(x,y).stroke({color,width,alpha,cap:'round',join:'round'});}}
  }
  // Full-frame light: the lens flood, the finisher's contact and the way back to the game.
  const impact=impactFrame(age),back=f.exitAge>0?winReturnPose(f.exitAge).curtain:0,flood=Math.max(lens.veil,impact.white*Math.min(1,.6+this.rank*.12),back*.92);
  this.veil.visible=flood>.004;if(this.veil.visible){this.veil.width=w;this.veil.height=h;this.veil.tint=mix(0xffffff,this.light,lens.veil>impact.white?.3:.12);this.veil.alpha=Math.min(1,flood);}
  this.last=age;
 }
 get particleCount(){return this.live.length;}
 destroy(){this.reset();for(const p of this.pool)p.sprite.destroy();this.pool.length=0;for(const layer of [this.back,this.mid,this.front])layer.destroy({children:true});}
}
