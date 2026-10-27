import { ColorMatrixFilter,Container,Graphics,Sprite,Texture } from 'pixi.js';
import type { Spine } from '@esotericsoftware/spine-pixi-v8';
import { playSound,playPokemonCry,preloadRevealAudio,stopRevealAudio } from './audio';
import { pokemonPower } from './powerProfiles';
import { PokemonPower } from './PokemonPower';
import { createPokeballRig } from './PokeballRig';
import { PokemonActor,disposePokemonRenderer } from './PokemonActor';
import {ballFlight,ballLanding,BALL_HIT} from './ballPhysics';

const IMPACT={x:0,y:-98};
/** Depth flight and local artwork puncture. The perimeter and card text stay connected. */
export class SpineReveal {
  root=new Container();cardShell=new Container();
  private behind=new Container({isRenderGroup:true});private front=new Container({isRenderGroup:true});
  private ball:Spine;private hero:PokemonActor;private face:Sprite;private punctured:Texture;
  private trail=new Graphics();private flare=new Graphics();private shadow=new Graphics();
  private shards:Graphics[]=[];private released=false;
  private energy=new Graphics();private pressure=new Graphics();private latch=new Graphics();private power:PokemonPower;private white=new ColorMatrixFilter();
  private release={amount:0,radius:0};

  static disposeResources(){disposePokemonRenderer();}
  static async create(card:Texture,pokemonImage:string,low=false){const [hero]=await Promise.all([PokemonActor.create(pokemonImage,low),preloadRevealAudio(pokemonImage)]);return new SpineReveal(card,hero,pokemonImage,low);}
  private constructor(card:Texture,hero:PokemonActor,pokemonImage:string,low:boolean){
    this.hero=hero;this.power=new PokemonPower(hero,pokemonPower(pokemonImage),low);this.ball=createPokeballRig();this.face=new Sprite(card);this.face.anchor.set(.5);this.face.width=312;this.face.height=435;
    this.cardShell.addChild(this.face);this.root.addChild(this.behind,this.cardShell,this.front);this.behind.addChild(this.trail,this.ball);this.front.addChild(this.shadow,this.power.back,this.hero,this.power.front,this.energy,this.pressure,this.latch,this.flare);
    this.white.matrix=[0,0,0,0,.91,0,0,0,0,.99,0,0,0,0,1,0,0,0,1,0];this.hero.filters=[this.white];
    this.hero.visible=false;this.hero.position.set(70,174);this.hero.scale.set(.025);this.hero.alpha=0;
    this.shadow.ellipse(0,0,45,8).fill({color:0x07223a,alpha:.28});this.shadow.position.set(18,219);this.shadow.alpha=0;
    this.flare.circle(0,0,34).fill({color:0xeafaff,alpha:.5}).circle(0,0,13).fill(0xffffff);this.flare.position.set(IMPACT.x,IMPACT.y);this.flare.alpha=0;this.flare.blendMode='add';
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=i%2?104:145;this.pressure.poly([Math.cos(a-.08)*52,Math.sin(a-.08)*45,Math.cos(a)*r,Math.sin(a)*r*.8,Math.cos(a+.06)*55,Math.sin(a+.06)*46]).fill({color:i%3?0xb9f3ff:0xffffff,alpha:.8});}this.pressure.position.set(IMPACT.x,IMPACT.y);this.pressure.alpha=0;this.pressure.blendMode='add';
    this.latch.circle(0,0,16).fill({color:0x8beeff,alpha:.18}).circle(0,0,8).fill({color:0xbdf7ff,alpha:.7}).circle(0,0,4).fill(0xffffff);this.latch.alpha=0;this.latch.blendMode='add';
    const canvas=document.createElement('canvas');canvas.width=card.width;canvas.height=card.height;const c=canvas.getContext('2d')!;
    c.drawImage(card.source.resource as CanvasImageSource,0,0);c.save();c.scale(card.width/312,card.height/435);c.translate(156,217.5);
    const points=Array.from({length:34},(_,i)=>{const a=i/34*Math.PI*2,r=65+Math.sin(i*7.83)*4.5+Math.sin(i*2.6)*3;return [IMPACT.x+Math.cos(a)*r,IMPACT.y+Math.sin(a)*r*.83];});
    const path=()=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();};
    path();c.strokeStyle='#19283a';c.lineWidth=5;c.stroke();path();c.strokeStyle='#d8e4ee';c.lineWidth=2.6;c.stroke();
    c.globalCompositeOperation='destination-out';path();c.fill();c.globalCompositeOperation='source-over';
    for(let i=0;i<11;i++){const a=i/11*Math.PI*2,r=67+Math.sin(i*7.83)*3;c.beginPath();c.moveTo(Math.cos(a)*r,IMPACT.y+Math.sin(a)*r*.83);c.lineTo(Math.cos(a+.035)*(r+9),IMPACT.y+Math.sin(a+.035)*(r+9)*.83);c.lineTo(Math.cos(a+.01)*(r+16),IMPACT.y+Math.sin(a+.01)*(r+16)*.83);c.strokeStyle='rgba(18,34,53,.55)';c.lineWidth=.8;c.stroke();}
    for(let i=0;i<34;i+=2){const [x,y]=points[i],a=i/34*Math.PI*2;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(a)*2+2,y-Math.sin(a)*3);c.strokeStyle='rgba(239,245,247,.85)';c.lineWidth=.65;c.stroke();}
    c.restore();this.punctured=Texture.from(canvas);this.cardShell.once('destroyed',()=>this.punctured.destroy(true));
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const shard=new Graphics().poly([-5,-3,3,-7,8,1,-2,10]).fill(i%3===0?0xd8e4ef:i%3===1?0x7285af:0x3d6893).moveTo(-5,-3).lineTo(3,-7).lineTo(8,1).stroke({color:0xe7eff5,width:.8});shard.position.set(Math.cos(a)*52,IMPACT.y+Math.sin(a)*43);shard.visible=false;this.front.addChild(shard);this.shards.push(shard);}

  }
  play(timeline:gsap.core.Timeline,skyY:number,onImpact:()=>void,onPower?:(color:number)=>void){
    const attackClock={time:0},flight={t:0},fall={t:0},hit=BALL_HIT,open=hit+.78,form=open+.12,charge=form+.62,attack=charge+this.hero.chargeDuration,attackEnd=attack+this.hero.attackDuration,decay=Math.min(.22,this.hero.attackDuration*.3);
    const project=()=>{const p=ballFlight(flight.t,skyY);this.ball.position.set(p.x,p.y);this.ball.scale.set(p.scale);this.ball.rotation=p.rotation;
      this.trail.clear();for(let i=5;i>=1;i--){const a=ballFlight(Math.max(0,flight.t-i*.015),skyY),b=ballFlight(Math.max(0,flight.t-(i-1)*.015),skyY);this.trail.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width:(6-i)*.7,color:0xd3f5ff,alpha:(6-i)*.06});}};project();
    const land=()=>{const p=ballLanding(fall.t);this.ball.position.set(p.x,p.y);this.ball.rotation=p.rotation;};
    timeline.call(()=>playSound('throw',{pan:.35}),[],.52)
      .to(flight,{t:hit,duration:hit,ease:'none',onUpdate:project},0)
      .call(()=>{this.face.texture=this.punctured;this.front.addChildAt(this.ball,this.front.getChildIndex(this.energy));this.trail.visible=false;onImpact();playSound('impact');},[],hit)
      .to(this.pressure,{alpha:1,duration:.04},hit).to(this.pressure.scale,{x:1.45,y:1.45,duration:.22,ease:'power3.out'},hit).to(this.pressure,{alpha:0,duration:.18},hit+.04)
      .to(this.flare,{alpha:.8,duration:.035},hit).to(this.flare.scale,{x:2.1,y:1.5,duration:.24,ease:'power2.out'},hit).to(this.flare,{alpha:0,duration:.22},hit+.05)
      .to(this.cardShell,{y:7,rotation:.014,duration:.06,ease:'power2.out'},hit).to(this.cardShell,{y:0,rotation:0,duration:.25,ease:'power2.out'},hit+.06)
      .to(fall,{t:.83,duration:.83,ease:'none',onUpdate:land},hit)
      .to(this.ball.scale,{x:.62,y:.62,duration:.53,ease:'none'},hit)
      .call(()=>{playSound('land');this.ball.state.setAnimation(0,'ready',false);},[],hit+.53)
      .call(()=>playSound('latch'),[],open-.12)
      .to(this.latch,{alpha:1,duration:.10},open-.12).to(this.latch,{alpha:0,duration:.14},open+.03)
      .to(this.shadow,{alpha:1,duration:.38},hit)
      .call(()=>{this.ball.state.setAnimation(0,'open',false);playSound('release',{pan:.1});},[],open)
      .to(this.release,{amount:1,radius:1,duration:.16,ease:'power2.out'},open+.04)
      .call(()=>{this.hero.visible=true;this.released=true;this.hero.alpha=1;this.hero.play('emerge');},[],form)
      .to(this.hero,{x:0,y:47,duration:.42,ease:'power3.out'},form)
      .to(this.hero.scale,{x:1.04,y:1.04,duration:.42,ease:'power3.out'},form)
      .to(this.white,{alpha:0,duration:.30,ease:'power2.inOut',onComplete:()=>{this.hero.filters=[];}},form+.27)
      .to(this.hero,{y:65,duration:.18,ease:'power2.in'},form+.42)
      .to(this.hero.scale,{x:1,y:1,duration:.18,ease:'power2.out'},form+.42)
      .to(this.release,{amount:0,duration:.3,ease:'power1.out'},form+.23)
      .call(()=>playSound('impact',{gain:.32}),[],form+.6)
      .call(()=>{this.ball.state.setAnimation(0,'closed',false);playPokemonCry(this.power.profile.dexId);},[],form+.53)
      .to(this.ball,{x:155,y:188,rotation:.7,alpha:0,duration:.48,ease:'power2.in'},form+.53)
      .to(this.ball.scale,{x:.25,y:.25,duration:.48},form+.53)
      .call(()=>{this.hero.play('charge');this.power.begin();playSound('charge',{gain:.5});},[],charge)
      .to(attackClock,{time:this.hero.chargeDuration+this.hero.attackDuration+.24,duration:this.hero.chargeDuration+this.hero.attackDuration+.24,ease:'none',onUpdate:()=>{this.hero.setAttackTime(attackClock.time);this.power.clock=attackClock.time;}},charge)
      .to(this.power,{charge:1,duration:this.hero.chargeDuration,ease:'power2.in'},charge)
      .call(()=>{this.hero.setAttackTime(this.hero.chargeDuration);this.hero.capturePose();this.power.release(this.hero.chargeDuration);this.hero.play('attack');playSound(this.power.profile.cue);onPower?.(this.power.profile.color);},[],attack)
      .to(this.power,{charge:0,blast:1,duration:.08,ease:'power2.out'},attack)
      .to(this.power,{fade:0,duration:decay,ease:'power1.in'},attackEnd-decay)
      .call(()=>{this.hero.play('recover');},[],attackEnd+.24)
      .to({}, {duration:.46},attackEnd+.24);
    this.shards.forEach((shard,i)=>{const a=i/12*Math.PI*2;timeline.set(shard,{visible:true},hit).to(shard,{x:Math.cos(a)*(95+i*4),y:IMPACT.y+Math.sin(a)*86+60,rotation:(i-6)*.7,alpha:0,duration:.55,ease:'power2.out'},hit);});
  }
  update(dt:number){
    this.ball.update(dt);this.latch.position.set(this.ball.x-19*this.ball.scale.x,this.ball.y);if(this.released)this.hero.update(dt);this.power.update(dt);
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
