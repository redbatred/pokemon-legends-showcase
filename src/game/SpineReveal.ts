import { Container,Graphics,Sprite,Texture } from 'pixi.js';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';
import { playSound } from './audio';
import { createPokeballRig } from './PokeballRig';
import { createPokemonRig } from './PokemonRig';

const IMPACT={x:0,y:-98};
/** Depth flight and local artwork puncture. The perimeter and card text stay connected. */
export class SpineReveal {
  root=new Container();cardShell=new Container();
  private behind=new Container({isRenderGroup:true});private front=new Container({isRenderGroup:true});
  private ball:Spine;private hero:Spine;private face:Sprite;private punctured:Texture;
  private trail=new Graphics();private flare=new Graphics();private aura=new Graphics();private shadow=new Graphics();
  private shards:Graphics[]=[];private released=false;
  static async create(card:Texture,pokemonImage:string){return new SpineReveal(card,await createPokemonRig(pokemonImage));}
  private constructor(card:Texture,hero:Spine){
    this.hero=hero;this.ball=createPokeballRig();this.face=new Sprite(card);this.face.anchor.set(.5);this.face.width=312;this.face.height=435;
    this.cardShell.addChild(this.face);this.root.addChild(this.behind,this.cardShell,this.front);this.behind.addChild(this.trail,this.ball);this.front.addChild(this.shadow,this.aura,this.hero,this.flare);
    this.hero.visible=false;this.hero.position.set(0,145);this.hero.scale.set(.025);this.hero.alpha=0;
    this.shadow.ellipse(0,0,45,8).fill({color:0x07223a,alpha:.28});this.shadow.position.set(18,219);this.shadow.alpha=0;
    this.flare.circle(0,0,34).fill({color:0xeafaff,alpha:.5}).circle(0,0,13).fill(0xffffff);this.flare.position.set(IMPACT.x,IMPACT.y);this.flare.alpha=0;this.flare.blendMode='add';
    for(let i=0;i<3;i++)this.aura.circle(0,0,42+i*23).stroke({color:i===1?0x81e7ff:0xf3ffff,width:3-i*.6,alpha:.5-i*.1});this.aura.position.set(18,178);this.aura.alpha=0;this.aura.blendMode='add';
    const canvas=document.createElement('canvas');canvas.width=card.width;canvas.height=card.height;const c=canvas.getContext('2d')!;
    c.drawImage(card.source.resource as CanvasImageSource,0,0);c.save();c.scale(card.width/312,card.height/435);c.translate(156,217.5);
    const points=Array.from({length:22},(_,i)=>{const a=i/22*Math.PI*2,r=33+(i%3===0?7:i%2?2:-3);return [IMPACT.x+Math.cos(a)*r,IMPACT.y+Math.sin(a)*r*.83];});
    const path=()=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
    path();c.strokeStyle='#19283a';c.lineWidth=4;c.stroke();path();c.strokeStyle='#e2e7ed';c.lineWidth=1.7;c.stroke();
    c.globalCompositeOperation='destination-out';path();c.fill();c.globalCompositeOperation='source-over';
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;c.beginPath();c.moveTo(Math.cos(a)*35,IMPACT.y+Math.sin(a)*29);c.lineTo(Math.cos(a+.04)*49,IMPACT.y+Math.sin(a+.04)*40);c.lineTo(Math.cos(a)*54,IMPACT.y+Math.sin(a)*47);c.strokeStyle='rgba(18,34,53,.65)';c.lineWidth=.8;c.stroke();}c.restore();this.punctured=Texture.from(canvas);this.cardShell.once('destroyed',()=>this.punctured.destroy(true));
    for(let i=0;i<7;i++){const shard=new Graphics().poly([0,-5,3,2,-2,5]).fill(i%2?0xdce7ee:0x9cacbb);shard.position.set(IMPACT.x,IMPACT.y);shard.visible=false;this.front.addChild(shard);this.shards.push(shard);}
  }
  play(timeline:gsap.core.Timeline,skyY:number,onImpact:()=>void){
    const flight={t:0},start={x:190,y:Math.max(-355,skyY+145)},duration=1.12;
    const locate=(t:number)=>{const q=1-t;return {x:q*q*q*start.x+3*q*q*t*105+3*q*t*t*-38+t*t*t*IMPACT.x,y:q*q*q*start.y+3*q*q*t*(start.y-115)+3*q*t*t*(IMPACT.y-135)+t*t*t*IMPACT.y};};
    const project=()=>{const t=flight.t,p=locate(t);this.ball.position.set(p.x,p.y);this.ball.scale.set(.085+.48*t*t);this.ball.rotation=-.25+t*.32;
      this.trail.clear();for(let i=7;i>=1;i--){const a=locate(Math.max(0,t-i*.018)),b=locate(Math.max(0,t-(i-1)*.018));this.trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width:(8-i)*.65+1,color:0xd0f6ff,alpha:(8-i)*.055*t});}};project();
    timeline.to(flight,{t:1,duration,ease:'power1.in',onUpdate:project},0)
      .call(()=>{this.face.texture=this.punctured;this.front.addChild(this.ball);this.trail.visible=false;onImpact();playSound('tear');},[],duration)
      .to(this.flare,{alpha:.9,duration:.035},duration).to(this.flare.scale,{x:2.1,y:1.5,duration:.26,ease:'power2.out'},duration).to(this.flare,{alpha:0,duration:.25},duration+.05)
      .to(this.cardShell,{y:8,rotation:.017,duration:.065,ease:'power2.out'},duration).to(this.cardShell,{y:0,rotation:0,duration:.3,ease:'elastic.out(1,.45)'},duration+.065)
      .to(this.ball,{x:18,y:163,rotation:.25,duration:.44,ease:'power2.in'},duration)
      .to(this.ball.scale,{x:.83,y:.83,duration:.44,ease:'power1.in'},duration)
      .to(this.shadow,{alpha:1,duration:.4},duration)
      .to(this.ball,{y:116,rotation:-.12,duration:.2,ease:'power2.out'},duration+.44)
      .to(this.ball,{y:163,rotation:0,duration:.17,ease:'power2.in'},duration+.64)
      .call(()=>{this.ball.state.setAnimation(0,'open',false);this.hero.visible=true;this.released=true;this.hero.state.setAnimation(0,'emerge',false);this.hero.state.addAnimation(0,'idle',true,0);playSound('rare');},[],duration+.88)
      .to(this.aura,{alpha:1,duration:.08},duration+.88).to(this.aura.scale,{x:2.8,y:2.1,duration:.65,ease:'power2.out'},duration+.88).to(this.aura,{alpha:0,duration:.45},duration+1.02)
      .to(this.hero,{y:65,alpha:1,duration:.57,ease:'power3.out'},duration+.92).to(this.hero.scale,{x:1.2,y:1.2,duration:.7,ease:'back.out(1.15)'},duration+.92)
      .to(this.ball,{x:73,rotation:.13,duration:.5,ease:'power2.out'},duration+1.3).to({}, {duration:.34});
    this.shards.forEach((shard,i)=>{const a=i/7*Math.PI*2;timeline.set(shard,{visible:true},duration).to(shard,{x:Math.cos(a)*(65+i*3),y:IMPACT.y+Math.sin(a)*60+30,rotation:i-3,alpha:0,duration:.46,ease:'power2.out'},duration);});
  }
  update(dt:number){this.ball.update(dt);if(this.released)this.hero.update(dt);}
  takeCard(){this.cardShell.removeFromParent();return this.cardShell;}
  destroy(){this.root.destroy({children:true});}
}
