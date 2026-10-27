import { ColorMatrixFilter,Container,Graphics,Sprite,Texture } from 'pixi.js';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';
import { playSound,playPokemonCry,preloadRevealAudio,stopRevealAudio } from './audio';
import { pokemonPower } from './powerProfiles';
import { PokemonPower } from './PokemonPower';
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
  private energy=new Graphics();private power:PokemonPower;private white=new ColorMatrixFilter();
  private release={amount:0,radius:0};

  static async create(card:Texture,pokemonImage:string,low=false){const [hero]=await Promise.all([createPokemonRig(pokemonImage),preloadRevealAudio(pokemonImage)]);return new SpineReveal(card,hero,pokemonImage,low);}
  private constructor(card:Texture,hero:Spine,pokemonImage:string,low:boolean){
    this.hero=hero;this.power=new PokemonPower(hero,pokemonPower(pokemonImage),low);this.ball=createPokeballRig();this.face=new Sprite(card);this.face.anchor.set(.5);this.face.width=312;this.face.height=435;
    this.cardShell.addChild(this.face);this.root.addChild(this.behind,this.cardShell,this.front);this.behind.addChild(this.trail,this.ball);this.front.addChild(this.shadow,this.aura,this.power.back,this.hero,this.power.front,this.energy,this.flare);
    this.white.matrix=[0,0,0,0,.91,0,0,0,0,.99,0,0,0,0,1,0,0,0,1,0];this.hero.filters=[this.white];
    this.hero.visible=false;this.hero.position.set(56,125);this.hero.scale.set(.025);this.hero.alpha=0;
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
  play(timeline:gsap.core.Timeline,skyY:number,onImpact:()=>void,onPower?:(color:number)=>void){
    const flight={t:0},start={x:190,y:Math.max(-355,skyY+145)},hit=1.04,open=1.48,form=1.60,charge=2.24,attack=2.72;
    const locate=(t:number)=>{const q=1-t;return {x:q*q*q*start.x+3*q*q*t*105+3*q*t*t*-38+t*t*t*IMPACT.x,y:q*q*q*start.y+3*q*q*t*(start.y-115)+3*q*t*t*(IMPACT.y-135)+t*t*t*IMPACT.y};};
    const project=()=>{const t=flight.t,p=locate(t);this.ball.position.set(p.x,p.y);this.ball.scale.set(.065+.50*t*t);this.ball.rotation=-.25+t*.32;
      this.trail.clear();for(let i=7;i>=1;i--){const a=locate(Math.max(0,t-i*.018)),b=locate(Math.max(0,t-(i-1)*.018));this.trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width:(8-i)*.65+1,color:0xd0f6ff,alpha:(8-i)*.055*t});}};project();
    timeline.call(()=>playSound('throw',{pan:.35}),[],.52)
      .to(flight,{t:1,duration:hit,ease:'power1.in',onUpdate:project},0)
      .call(()=>{this.face.texture=this.punctured;this.front.addChildAt(this.ball,this.front.getChildIndex(this.energy));this.trail.visible=false;onImpact();playSound('impact');},[],hit)
      .to(this.flare,{alpha:.8,duration:.035},hit).to(this.flare.scale,{x:2.1,y:1.5,duration:.24,ease:'power2.out'},hit).to(this.flare,{alpha:0,duration:.22},hit+.05)
      .to(this.cardShell,{y:7,rotation:.014,duration:.06,ease:'power2.out'},hit).to(this.cardShell,{y:0,rotation:0,duration:.25,ease:'power2.out'},hit+.06)
      .to(this.ball,{x:66,y:125,rotation:-.16,duration:.38,ease:'power2.out'},hit)
      .to(this.ball.scale,{x:.62,y:.62,duration:.38,ease:'power1.out'},hit)
      .call(()=>{this.ball.state.setAnimation(0,'ready',false);},[],hit+.29)
      .to(this.shadow,{alpha:1,duration:.38},hit)
      .call(()=>{this.ball.state.setAnimation(0,'open',false);playSound('release',{pan:.1});},[],open)
      .to(this.release,{amount:1,radius:1,duration:.16,ease:'power2.out'},open+.04)
      .call(()=>{this.hero.visible=true;this.released=true;this.hero.alpha=1;this.hero.state.setAnimation(0,'emerge',false);},[],form)
      .to(this.hero,{x:0,y:47,duration:.42,ease:'power3.out'},form)
      .to(this.hero.scale,{x:1.22,y:1.22,duration:.42,ease:'power3.out'},form)
      .to(this.white,{alpha:0,duration:.30,ease:'power2.inOut',onComplete:()=>{this.hero.filters=[];}},form+.27)
      .to(this.hero,{y:65,duration:.18,ease:'power2.in'},form+.42)
      .to(this.hero.scale,{x:1.2,y:1.2,duration:.18,ease:'power2.out'},form+.42)
      .to(this.release,{amount:0,duration:.3,ease:'power1.out'},form+.23)
      .call(()=>playSound('impact',{gain:.32}),[],form+.6)
      .to(this.aura,{alpha:1,duration:.06},form+.5).to(this.aura.scale,{x:3,y:1.1,duration:.38,ease:'power2.out'},form+.5).to(this.aura,{alpha:0,duration:.32},form+.56)
      .call(()=>{this.ball.state.setAnimation(0,'closed',false);playPokemonCry(this.power.profile.dexId);},[],form+.53)
      .to(this.ball,{x:155,y:188,rotation:.7,alpha:0,duration:.48,ease:'power2.in'},form+.53)
      .to(this.ball.scale,{x:.25,y:.25,duration:.48},form+.53)
      .call(()=>{this.hero.state.setAnimation(0,'charge',false);playSound('charge');},[],charge)
      .to(this.power,{charge:1,duration:.46,ease:'power2.in'},charge)
      .call(()=>{this.hero.state.setAnimation(0,'attack',false);playSound(this.power.profile.cue);onPower?.(this.power.profile.color);},[],attack)
      .to(this.power,{charge:0,blast:1,duration:.18,ease:'power2.out'},attack)
      .to(this.power,{fade:0,duration:.55,ease:'power1.in'},attack+.34)
      .call(()=>{this.hero.state.setAnimation(0,'recover',false);this.hero.state.addAnimation(0,'idle',true,0);},[],attack+.82)
      .to({}, {duration:.46},attack+.82);
    this.shards.forEach((shard,i)=>{const a=i/7*Math.PI*2;timeline.set(shard,{visible:true},hit).to(shard,{x:Math.cos(a)*(65+i*3),y:IMPACT.y+Math.sin(a)*60+30,rotation:i-3,alpha:0,duration:.42,ease:'power2.out'},hit);});
  }
  update(dt:number){
    this.ball.update(dt);if(this.released)this.hero.update(dt);this.power.update(dt);
    const g=this.energy.clear(),a=this.release.amount,r=this.release.radius;
    if(a>0){
      const x=this.ball.x,y=this.ball.y-12;
      g.ellipse(x,y,29,12).fill({color:0xeaffff,alpha:a});
      g.moveTo(x-18,y).bezierCurveTo(x-80,y-65,35,-70,0,-100*r).bezierCurveTo(-38,-40,x+20,y-30,x+20,y).closePath().fill({color:0x8cddff,alpha:a*.6});
      g.moveTo(x-9,y).bezierCurveTo(x-50,y-65,15,-65,0,-90*r).bezierCurveTo(-12,-30,x+8,y-30,x+9,y).closePath().fill({color:0xf5ffff,alpha:a});
      for(let i=0;i<9;i++){const angle=i/9*Math.PI*2;const d=32+r*52;g.moveTo(x+Math.cos(angle)*20,y+Math.sin(angle)*13).lineTo(x+Math.cos(angle)*d,y+Math.sin(angle)*d*.7).stroke({color:0xd1faff,width:2,alpha:a*.7});}
    }
  }
  takeCard(){this.cardShell.removeFromParent();return this.cardShell;}
  destroy(){stopRevealAudio();this.hero.filters=[];this.white.destroy();this.root.destroy({children:true});}
}
