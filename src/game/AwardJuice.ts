import {Container,Sprite,Texture} from 'pixi.js';
import {juiceTextures} from './WinJuice';
import type {PowerKind} from './powerProfiles';

/** The light a card of each element gives off when its value is paid. */
export const ELEMENT_LIGHT:Record<PowerKind,number>={fire:0xff8a4c,water:0x4fb6ff,electric:0xffe14a,psychic:0xd58cff,leaf:0x7de894,wind:0x9aeff7,ice:0x9fe0ff,dark:0xb07ae6,metal:0xa5d3e6,ground:0xe2b06a,fairy:0xffa6d8,dragon:0x8f9bff};
/** How hard an award lands for its size against the stake: a few cents stays quiet, the stake itself is full strength. */
export function awardPower(amount:number,bet:number){
 if(!(amount>0))return 0;if(!(bet>0))return .5;
 return Math.min(1,.2+.8*Math.sqrt(Math.min(1,amount/bet)));
}
type Kind='spark'|'flare'|'glint'|'mote'|'rays'|'coin'|'gather';
type Particle={sprite:Sprite;kind:Kind;x:number;y:number;vx:number;vy:number;age:number;life:number;size:number;squash:number;drag:number;gravity:number;floor:number};
let shapes:{flare:Texture;shade:Texture}|undefined;
/** Shapes this layer needs beyond the shared set: an anamorphic lens streak (bright in the middle, tapering to both ends)
 * and a soft dark blot for contact shadows. */
export function awardTextures(){
 if(shapes)return shapes;
 const sheet=(w:number,h:number,paint:(c:CanvasRenderingContext2D)=>void)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;paint(canvas.getContext('2d')!);return Texture.from(canvas);};
 const flare=sheet(256,32,c=>{const along=c.createLinearGradient(0,0,256,0);along.addColorStop(0,'rgba(255,255,255,0)');along.addColorStop(.32,'rgba(255,255,255,.28)');along.addColorStop(.5,'rgba(255,255,255,1)');along.addColorStop(.68,'rgba(255,255,255,.28)');along.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=along;c.beginPath();c.moveTo(0,16);c.quadraticCurveTo(128,-2,256,16);c.quadraticCurveTo(128,34,0,16);c.fill();
  // A hot hairline through the middle keeps the streak sharp where it crosses the type.
  const core=c.createLinearGradient(40,0,216,0);core.addColorStop(0,'rgba(255,255,255,0)');core.addColorStop(.5,'rgba(255,255,255,1)');core.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=core;c.fillRect(40,14.5,176,3);});
 const shade=sheet(64,32,c=>{const g=c.createRadialGradient(32,16,0,32,16,32);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(.55,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.save();c.scale(1,.5);c.translate(0,16);c.fillStyle=g;c.fillRect(0,-16,64,64);c.restore();});
 return shapes={flare,shade};
}
/** Light for award moments on the 2D screens. Nothing here is a ring or a round burst: a hit is a lens streak across what was
 * struck and sparks thrown the way the light was travelling. Sizes are screen pixels. */
export class AwardJuice{
 readonly back=new Container({isRenderGroup:true});readonly front=new Container({isRenderGroup:true});
 private live:Particle[]=[];private pool:Particle[]=[];private seed=7;private limit:number;
 /** The light shapes are painted on a canvas; headless runs keep both layers empty. */
 static get available(){return typeof window!=='undefined'&&typeof document!=='undefined';}
 constructor(private low=false){this.limit=low?110:300;this.back.eventMode=this.front.eventMode='none';}
 private random(){this.seed=(this.seed*16807)%2147483647;return (this.seed-1)/2147483646;}
 private spawn(kind:Kind,texture:Texture,layer=this.front){
  if(this.live.length>=this.limit)return null;
  let p=this.pool.pop();if(!p){const sprite=new Sprite(texture);p={sprite,kind,x:0,y:0,vx:0,vy:0,age:0,life:1,size:1,squash:1,drag:0,gravity:0,floor:Infinity};}
  p.kind=kind;p.age=0;p.vx=p.vy=0;p.drag=0;p.gravity=0;p.squash=1;p.floor=Infinity;const s=p.sprite;s.texture=texture;s.anchor.set(.5);s.blendMode=kind==='coin'?'normal':'add';s.tint=0xffffff;s.rotation=0;s.alpha=0;layer.addChild(s);this.live.push(p);return p;
 }
 /** An anamorphic streak `width` pixels long, lying along `angle`: it snaps out to full length and thins as it dies. */
 flare(x:number,y:number,width:number,life:number,tint=0xffffff,thickness=1,angle=0,back=false){if(!AwardJuice.available)return;const p=this.spawn('flare',awardTextures().flare,back?this.back:this.front);if(!p)return;p.x=x;p.y=y;p.size=width;p.life=life;p.squash=thickness;p.sprite.tint=tint;p.sprite.rotation=angle;}
 /** A small four-point glint, for a letter or a coin catching the light. */
 glint(x:number,y:number,size:number,life:number,tint=0xffffff){if(!AwardJuice.available)return;const p=this.spawn('glint',juiceTextures().star);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.sprite.tint=tint;p.sprite.rotation=this.random()*.5;}
 rays(x:number,y:number,size:number,life:number,tint:number){if(!AwardJuice.available)return;const p=this.spawn('rays',juiceTextures().rays,this.back);if(!p)return;p.x=x;p.y=y;p.size=size;p.life=life;p.sprite.tint=tint;p.sprite.rotation=this.random()*6.283;}
 /** Sparks thrown along `angle` within `spread` radians of it (a full turn by default). */
 sparks(x:number,y:number,count:number,speed:number,tint:number,lift=0,angle=0,spread=Math.PI){
  if(!AwardJuice.available)return;const t=juiceTextures();
  for(let i=0;i<Math.round(this.low?count/2:count);i++){const p=this.spawn('spark',t.streak);if(!p)return;const a=angle+(this.random()*2-1)*spread,v=speed*(.3+this.random()*.9);p.x=x;p.y=y;p.vx=Math.cos(a)*v;p.vy=Math.sin(a)*v*.85-lift*speed;p.life=.28+this.random()*.42;p.size=.6+this.random()*.9;p.drag=2.8;p.gravity=speed*.9;p.sprite.tint=this.random()<.4?0xffffff:tint;}
 }
 /** A mote left behind by something moving. */
 shed(x:number,y:number,size:number,tint:number){if(!AwardJuice.available)return;const p=this.spawn('mote',juiceTextures().dot);if(!p)return;p.x=x+(this.random()-.5)*size*.6;p.y=y+(this.random()-.5)*size*.6;p.vx=(this.random()-.5)*26;p.vy=(this.random()-.5)*26;p.size=size*(.22+this.random()*.3);p.life=.2+this.random()*.22;p.sprite.tint=this.random()<.4?0xffffff:tint;}
 /** Streaks drawn in toward a point that is about to be struck. */
 gather(x:number,y:number,count:number,radius:number,tint:number){
  if(!AwardJuice.available)return;const t=juiceTextures();
  for(let i=0;i<count;i++){const p=this.spawn('gather',t.streak);if(!p)return;p.x=x;p.y=y;p.vx=this.random()*6.283;p.size=radius*(.6+this.random()*.6);p.life=.24+this.random()*.16;p.sprite.tint=this.random()<.45?0xffffff:tint;}
 }
 /** Shaded coins fountain from a point, tumble and fall; with a `floor` they bounce once and come to rest before fading.
  * `behind` keeps them under whatever is drawn between the two layers. */
 coins(x:number,y:number,count:number,spread:number,floor=Infinity,size=1,behind=false,width=.5,stay=0){
  if(!AwardJuice.available)return;const t=juiceTextures();
  for(let i=0;i<Math.round(this.low?count/2:count);i++){const p=this.spawn('coin',t.coins[0],behind?this.back:this.front);if(!p)return;p.x=x+(this.random()-.5)*spread*width;p.y=y;p.vx=(this.random()-.5)*spread*3.4;p.vy=-spread*(1.4+this.random()*1.9);p.gravity=spread*5.2;p.life=1.5+this.random()*.7+stay;p.size=(.7+this.random()*.5)*spread/190*size;p.squash=(this.random()<.5?-1:1)*(9+this.random()*9);p.age=-this.random()*.14;p.floor=floor;}
 }
 /** Light arrives at (x,y) travelling along `angle`: a lens streak across the target and sparks carried on past it.
  * `width` is the width of what was struck; `power` runs 0..1+. */
 strike(x:number,y:number,width:number,tint:number,power=1,angle=-Math.PI/2){
  this.flare(x,y,width*(1.15+power*.75),.2+power*.14,tint,.8+power*.9);if(power>.25)this.flare(x,y,width*(.7+power*.5),.12+power*.08,0xffffff,.35+power*.3);
  this.sparks(x,y,Math.round(3+13*power*power),width*(1.1+power*1.5),tint,.1,angle,.55+.35*power);
 }
 get busy(){return this.live.length>0;}
 update(dt:number){
  for(let i=this.live.length-1;i>=0;i--){
   const p=this.live[i],s=p.sprite;p.age+=dt;
   if(p.age>=p.life){s.removeFromParent();this.pool.push(p);this.live[i]=this.live[this.live.length-1];this.live.pop();continue;}
   if(p.age<0){s.alpha=0;continue;}const k=p.age/p.life;
   if(p.kind==='gather'){const radius=p.size*(1-k*k),a=p.vx+k*.9;s.position.set(p.x+Math.cos(a)*radius,p.y+Math.sin(a)*radius*.86);s.rotation=a+Math.PI+.45;s.scale.set(p.size*(.4+k*.5)/128*.5,.5-k*.25);s.alpha=Math.min(1,k/.25)*(k>.85?(1-k)/.15:1);continue;}
   p.vx-=p.vx*p.drag*dt;p.vy+=(p.gravity-p.vy*p.drag)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.y>p.floor){p.y=p.floor;if(Math.abs(p.vy)>p.gravity*.08){p.vy=-p.vy*.34;p.vx*=.6;p.squash*=.5;}else{p.vy=0;p.vx*=.8;p.squash=0;}}
   s.position.set(p.x,p.y);
   if(p.kind==='coin'){const turn=(p.age*p.squash)/Math.PI+p.x*.01;s.texture=juiceTextures().coins[Math.floor((turn-Math.floor(turn))*8)%8];s.scale.set(p.size);s.alpha=Math.min(1,p.age/.05)*(k>.8?(1-k)/.2:1);}
   else if(p.kind==='spark'){s.rotation=Math.atan2(p.vy,p.vx);s.scale.set(Math.max(.04,Math.hypot(p.vx,p.vy)/1500)*p.size,p.size*.42);s.alpha=1-k*k;}
   else if(p.kind==='flare'){const reach=1-(1-Math.min(1,k/.18))**3;s.scale.set(p.size*(.3+.7*reach)/256,p.squash*(1-k)**.7*(1+.5*(1-reach)));s.alpha=(1-k)**1.6;}
   else if(p.kind==='glint'){s.scale.set(p.size*(.4+.6*Math.sin(Math.min(1,k/.3)*Math.PI/2))/128);s.rotation+=dt*.8;s.alpha=Math.sin(Math.min(1,k/.2)*Math.PI/2)*(1-k)**1.3;}
   else if(p.kind==='mote'){s.scale.set(p.size*(1-k*.6)/32);s.alpha=(1-k)*.85;}
   else {s.rotation+=dt*.45;s.scale.set(p.size*(.5+k*.6)/512);s.alpha=Math.sin(Math.min(1,k/.12)*Math.PI/2)*(1-k)**1.4*.8;}
  }
 }
 clear(){for(const p of this.live){p.sprite.removeFromParent();this.pool.push(p);}this.live.length=0;}
 destroy(){this.clear();for(const p of this.pool)p.sprite.destroy();this.pool.length=0;if(!this.back.destroyed)this.back.destroy({children:true});if(!this.front.destroyed)this.front.destroy({children:true});}
}
/** A travelling point of light with a tail: the value leaving a card, or an amount on its way to the total. */
export class LightComet{
 readonly root=new Container();private tail:Sprite|null=null;private glow:Sprite|null=null;private core:Sprite|null=null;
 constructor(){
  this.root.eventMode='none';this.root.visible=false;if(!AwardJuice.available)return;const t=juiceTextures();
  const make=(texture:Texture,ax:number)=>{const s=new Sprite(texture);s.anchor.set(ax,.5);s.blendMode='add';this.root.addChild(s);return s;};
  this.tail=make(t.streak,1);this.glow=make(t.dot,.5);this.core=make(t.dot,.5);
 }
 /** Head at (x,y) travelling along `angle`, trailing `length` pixels of light behind it. */
 pose(x:number,y:number,angle:number,length:number,size:number,tint:number,alpha=1){
  if(!this.tail||!this.glow||!this.core)return;this.root.visible=alpha>.003;this.root.position.set(x,y);this.root.alpha=Math.min(1,alpha);
  this.tail.rotation=angle;this.tail.scale.set(Math.max(.02,length/128),size*1.5/16);this.tail.tint=tint;
  this.glow.scale.set(size*4.2/64);this.glow.tint=tint;this.glow.alpha=.75;this.core.scale.set(size*1.5/64);
 }
 hide(){this.root.visible=false;}
}
