import {smooth} from './winCinemaMotion';
import {winChoreography} from './winChoreography';
import { ColorMatrixFilter,Container,Graphics,PerspectiveMesh,Sprite,Texture,type Filter } from 'pixi.js';
import {PokeballReleaseCels} from './PokeballReleaseCels';
import {RevealJuice} from './RevealJuice';
import {PokeBall3D,ballSpin} from './PokeBall3D';
import {juiceTextures} from './WinJuice';
import {Quaternion} from 'three';
import {loadPressureRig} from './PressureRig';
import type { SkeletonData, Spine } from '@esotericsoftware/spine-pixi-v8';
import { playSound,playPokemonCry,preloadRevealAudio,stopRevealAudio,playPokemonMove,pokemonSoundTiming,type PokemonMoveVoice } from './audio';
import { pokemonPower } from './powerProfiles';
import {performanceProfile} from './performanceProfiles';
import {EntranceEffects} from './EntranceEffects';
import { PokemonPower } from './PokemonPower';
import {createBallRevealFx} from './BallRevealFx';
import { createPokeballRig } from './PokeballRig';
import { PokemonActor,disposePokemonRenderer } from './PokemonActor';
import {emergencePose,emergenceTiming,ballAperture} from './emergenceMotion';
import {ballFlight,ballLanding,ballLandingPlan,ballRevealCues,BALL_HIT} from './ballPhysics';

const IMPACT={x:0,y:-98};
/** Depth flight and local artwork puncture. The perimeter and card text stay connected. */
export class SpineReveal {
  root=new Container();cardShell=new Container();
  private behind=new Container({isRenderGroup:true});private front=new Container({isRenderGroup:true});private actors=new Container();private floor=270;private ballFloorInfluence=0;
  private ball:Spine;private shellFront:Spine;private flightFx:Spine;private releaseFx:Spine;private formationFx:Spine;private formationFront:Spine;private conduitFx:Spine;private hero:PokemonActor;private face:PerspectiveMesh;private punctured:Texture;
  private trail=new Graphics();private flare=new Graphics();private shadow=new Container();private ballShadow=new Container();
  private intact:Texture;private returning=false;private shards:Graphics[]=[];private released=false;private started=false;
  private energy=new Graphics();private pressure=new Graphics();private latch=new Graphics();private power:PokemonPower;private white=new ColorMatrixFilter();
  private releaseCels:PokeballReleaseCels;private celClock={age:-1};
  /** Lens state for the stage: a push-in on the ball's beats and additive trauma. */
  readonly camera={zoom:1,trauma:0};private juice:RevealJuice;
  // The visible ball is a 3D toon model; the Spine rig only carries its timing, position and aperture.
  private ball3d:PokeBall3D;private ballClock={t:0};private plan={hit:BALL_HIT,first:9,second:9,latch:9,open:9,close:9,end:0};private spinPose=new Quaternion();private departure={progress:0};
  private cardStrike={v:0};private hover={x:0,y:0};private flightGlow:Sprite;private skyY=-500;
  private emergence={progress:0};private entrance:EntranceEffects;private release={amount:0,radius:0};private moveVoice:PokemonMoveVoice|null=null;

  static disposeResources(){disposePokemonRenderer();}
  static async create(card:Texture,pokemonImage:string,low=false){void preloadRevealAudio(pokemonImage).catch(()=>{});const [hero,cels]=await Promise.all([PokemonActor.create(pokemonImage,low),loadPressureRig()]);return new SpineReveal(card,hero,pokemonImage,low,cels);}
  private constructor(card:Texture,hero:PokemonActor,pokemonImage:string,low:boolean,cels:SkeletonData){
    this.intact=card;this.releaseCels=new PokeballReleaseCels(cels,performanceProfile(pokemonPower(pokemonImage).species).grounded);this.hero=hero;this.power=new PokemonPower(hero,pokemonPower(pokemonImage),low);this.entrance=new EntranceEffects(performanceProfile(this.power.profile.species),this.power.profile.color,this.power.profile.light,low);this.ball=createPokeballRig();this.shellFront=createPokeballRig();this.shellFront.visible=false;this.formationFx=createBallRevealFx(low);this.formationFront=createBallRevealFx(low);this.conduitFx=createBallRevealFx(low);this.flightFx=createBallRevealFx(low);this.releaseFx=createBallRevealFx(low);this.face=new PerspectiveMesh({texture:card,verticesX:4,verticesY:6});this.face.setCorners(-156,-217.5,156,-217.5,156,217.5,-156,217.5);
    this.cardShell.addChild(this.face);this.root.addChild(this.behind,this.cardShell,this.front);this.behind.addChild(this.trail,this.flightFx,this.ball);this.actors.addChild(this.entrance.back,this.power.back,this.hero,this.power.front,this.entrance.front);this.front.addChild(this.ballShadow,this.shadow,this.releaseFx,this.formationFx,this.conduitFx,this.actors,this.formationFront,this.shellFront,this.energy,this.pressure,this.latch,this.flare);this.actors.y=this.floor-219;this.front.addChildAt(this.releaseCels.back,this.front.getChildIndex(this.actors));this.front.addChildAt(this.releaseCels.front,this.front.getChildIndex(this.shellFront));
    this.juice=new RevealJuice(low);this.front.addChildAt(this.juice.back,0);this.front.addChild(this.juice.front);
    // Contact and release are carried by light; the flat pressure star and release cels stay retired.
    this.pressure.visible=this.flare.visible=false;this.releaseCels.hide();
    this.ball3d=new PokeBall3D(low,this.power.profile.light);this.behind.addChildAt(this.ball3d.sprite,this.behind.getChildIndex(this.ball)+1);this.front.addChildAt(this.ball3d.front,this.front.getChildIndex(this.shellFront)+1);
    this.flightGlow=new Sprite(juiceTextures().streak);this.flightGlow.anchor.set(1,.5);this.flightGlow.blendMode='add';this.flightGlow.visible=false;this.behind.addChildAt(this.flightGlow,this.behind.getChildIndex(this.ball));
    // Flat drawings are retired from this sequence: the painted ball, paper shards, latch dots, cel light rigs, entrance strokes and in-place attack strokes.
    this.ball3d.prepare();
    for(const node of [this.ball,this.shellFront,this.flightFx,this.releaseFx,this.formationFx,this.formationFront,this.conduitFx,this.latch,this.trail,this.entrance.back,this.entrance.front,this.power.back,this.power.front,...this.shards])node.renderable=false;
    const tint=this.power.profile.light,lr=(tint>>16&255)/255,lg=(tint>>8&255)/255,lb=(tint&255)/255;
    this.white.matrix=[.4,0,0,0,lr*.68,0,.4,0,0,lg*.68,0,0,.4,0,lb*.68,0,0,0,1,0];this.hero.filters=[this.white];
    this.hero.visible=false;this.hero.position.set(70,174);this.hero.scale.set(.025);this.hero.alpha=0;
    const soft=(parent:Container,width:number,height:number,alpha:number)=>{const sprite=new Sprite(juiceTextures().dot);sprite.anchor.set(.5);sprite.width=width;sprite.height=height;sprite.tint=0x020a18;sprite.alpha=alpha;parent.addChild(sprite);};
    soft(this.shadow,150,26,.55);this.shadow.position.set(0,this.floor);this.shadow.alpha=0;
    soft(this.ballShadow,92,15,.6);this.ballShadow.alpha=0;
    this.flare.circle(0,0,34).fill({color:0xeafaff,alpha:.5}).circle(0,0,13).fill(0xffffff);this.flare.position.set(IMPACT.x,IMPACT.y);this.flare.alpha=0;this.flare.blendMode='add';
    for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=i%2?104:145;this.pressure.poly([Math.cos(a-.08)*52,Math.sin(a-.08)*45,Math.cos(a)*r,Math.sin(a)*r*.8,Math.cos(a+.06)*55,Math.sin(a+.06)*46]).fill({color:i%3?0xb9f3ff:0xffffff,alpha:.8});}this.pressure.position.set(IMPACT.x,IMPACT.y);this.pressure.alpha=0;this.pressure.blendMode='add';
    this.latch.circle(0,0,16).fill({color:0x8beeff,alpha:.18}).circle(0,0,8).fill({color:0xbdf7ff,alpha:.7}).circle(0,0,4).fill(0xffffff);this.latch.alpha=0;this.latch.blendMode='add';
    const canvas=document.createElement('canvas');canvas.width=card.width;canvas.height=card.height;const c=canvas.getContext('2d',{willReadFrequently:true})!;
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
  play(timeline:gsap.core.Timeline,skyY:number,onImpact:()=>void,onPower?:(color:number)=>void,onCharge?:(amount:number,color:number)=>void,onWin?:()=>void,onLand?:()=>void){
    this.started=true;const profile=performanceProfile(this.power.profile.species),entryDuration=Math.max(.92,this.hero.entranceDuration),settle=profile.grounded?65:profile.settle-10;const entranceClock={time:0},attackClock={time:0},flight={t:0},fall={t:0},hit=BALL_HIT,landing=ballLandingPlan(skyY,this.floor-50),cues=ballRevealCues(landing),open=cues.open,timing=emergenceTiming(open,entryDuration,this.hero.chargeDuration,this.hero.attackDuration,this.hero.recoveryDuration),{form,charge,attack,attackEnd,recoverEnd}=timing,soundStart=attack-Math.min(this.hero.chargeDuration,pokemonSoundTiming(this.power.profile.cue).preRoll),moveEnvelope={gain:0},spin={frame:0},departure=this.departure,decay=Math.min(.22,this.hero.attackDuration*.3);
    this.skyY=skyY;departure.progress=0;const releaseOrigin={x:0,y:0},departDuration=Math.min(.38,entryDuration*.38);
    this.flightFx.visible=true;this.flightFx.state.setAnimation(0,'flight',true);this.flightFx.update(0);
    const project=()=>{const p=ballFlight(flight.t,skyY),before=ballFlight(Math.max(0,flight.t-.015),skyY);this.ball.position.set(p.x,p.y);this.ball.scale.set(p.scale);this.ball.rotation=p.rotation;
      this.flightFx.position.set(p.x,p.y);this.flightFx.scale.set(p.scale);this.flightFx.rotation=Math.atan2(p.y-before.y,p.x-before.x);this.flightFx.alpha=Math.min(1,flight.t/.18);
      const g=this.trail.clear();for(let i=20;i>=1;i--){const a=ballFlight(Math.max(0,flight.t-i*.011),skyY),b=ballFlight(Math.max(0,flight.t-(i-1)*.011),skyY),fade=(21-i)/20,thickness=(2+9*fade)*p.scale;
        g.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width:thickness*2.5,color:0x65cfff,alpha:fade*.12}).moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width:thickness,color:0x88e6ff,alpha:fade*.58}).moveTo(a.x,a.y).lineTo(b.x,b.y).stroke({width:Math.max(.7,thickness*.25),color:0xf5ffff,alpha:fade*.8});
      }};project();
    const land=()=>{const p=ballLanding(fall.t,skyY,landing.floor),adapt=(this.floor-50-landing.floor)*Math.min(1,fall.t/landing.contact);this.ballFloorInfluence=Math.min(1,fall.t/landing.contact);this.ball.position.set(p.x,p.y+adapt);this.ball.rotation=p.rotation;this.ball.scale.set(p.scale);};
    timeline.call(()=>playSound('flight',{pan:.25}),[],0)
      .to(flight,{t:hit,duration:hit,ease:'none',onUpdate:project},0)
      .call(()=>{this.face.texture=this.punctured;this.front.addChildAt(this.ball,this.front.getChildIndex(this.actors));this.trail.visible=false;this.flightFx.visible=false;onImpact();playSound('win-puncture');playSound('slam',{gain:.2});},[],hit)
      .to(this.pressure,{alpha:1,duration:.04},hit).to(this.pressure.scale,{x:1.45,y:1.45,duration:.22,ease:'power3.out'},hit).to(this.pressure,{alpha:0,duration:.18},hit+.04)
      .to(this.flare,{alpha:.8,duration:.035},hit).to(this.flare.scale,{x:2.1,y:1.5,duration:.24,ease:'power2.out'},hit).to(this.flare,{alpha:0,duration:.22},hit+.05)
      .to(this.cardShell,{y:7,rotation:.014,duration:.06,ease:'power2.out'},hit).to(this.cardShell,{y:0,rotation:0,duration:.25,ease:'power2.out'},hit+.06)
      .to(fall,{t:landing.settled,duration:landing.settled,ease:'none',onUpdate:land},hit)
      .to(this.ball.state,{timeScale:.18,duration:landing.settled,ease:'power1.out'},hit)
      .call(()=>{playSound('ballbounce',{pan:this.ball.x/312,gain:Math.max(.8,Math.min(1,landing.impact/900))});const frame=Number(this.ball.skeleton.findSlot('closed')?.getAttachment()?.name.replace('spin',''))||0;spin.frame=frame>24?frame-48:frame;this.ball.state.clearTracks();},[],cues.first)
      .to(spin,{frame:0,duration:landing.settled-landing.contact,ease:'power2.out',onUpdate:()=>this.ball.skeleton.setAttachment('closed','spin'+((Math.round(spin.frame)%48+48)%48))},hit+landing.contact)
      .call(()=>{playSound('ballsettle',{pan:this.ball.x/312});this.ball.state.setAnimation(0,'ready',false);this.ball.state.timeScale=1;},[],cues.second)
      .call(()=>playSound('latch'),[],cues.latch)
      .to(this.latch,{alpha:1,duration:.10},open-.12).to(this.latch,{alpha:0,duration:.14},open+.03)
      .to(this.shadow,{alpha:1,duration:.38},hit)
      .call(()=>{this.ball.state.setAnimation(0,'open',false);const aperture=this.aperture();this.releaseFx.position.set(aperture.x,aperture.y);this.releaseFx.visible=true;this.releaseFx.state.setAnimation(0,'release',false);this.releaseFx.update(0);playSound('release',{pan:.1});},[],open)
      .to(this.release,{amount:1,radius:1,duration:.16,ease:'power2.out'},open+.04)
      .call(()=>{
        const aperture=this.aperture();releaseOrigin.x=aperture.x;releaseOrigin.y=aperture.y-this.actors.y;this.hero.visible=true;this.released=true;this.hero.play('emerge');this.shellFront.visible=true;this.shellFront.state.setAnimation(0,'open',false).trackTime=form-open;this.shellFront.update(0);
        for(const rig of [this.formationFx,this.formationFront]){rig.visible=true;rig.state.setAnimation(0,'form',false);rig.state.timeScale=1.4/entryDuration;const rgb=this.power.profile.light;for(const slot of rig.skeleton.slots){slot.color.r=(rgb>>16&255)/255;slot.color.g=(rgb>>8&255)/255;slot.color.b=(rgb&255)/255;}}
        this.conduitFx.visible=true;this.conduitFx.state.setAnimation(0,'conduit',false);this.conduitFx.state.timeScale=1.2/(entryDuration*.44);
      },[],form)
      .to(entranceClock,{time:entryDuration,duration:entryDuration,ease:'none',onUpdate:()=>this.hero.setEntranceTime(entranceClock.time)},form)
      .to(this.emergence,{progress:1,duration:entryDuration,ease:'none',onUpdate:()=>{
        const pose=emergencePose(this.emergence.progress,releaseOrigin,{x:0,y:settle},profile.grounded);
        this.hero.position.set(pose.x,pose.y);this.hero.scale.set(pose.scale);this.hero.alpha=pose.alpha;this.white.alpha=pose.white;this.shellFront.alpha=pose.shell;onCharge?.(.55*Math.sin(this.emergence.progress*Math.PI),this.power.profile.color);
      },onComplete:()=>{this.hero.filters=[];this.shellFront.visible=false;onCharge?.(0,this.power.profile.color);}},form)
      .to(this.entrance,{opacity:1,duration:.1},form+.1)
      .to(this.entrance,{progress:1,duration:entryDuration+.2,ease:'none'},form+.1)
      .to(this.entrance,{opacity:0,duration:.3},form+entryDuration-.05)
      .to(this.release,{amount:0,duration:.35,ease:'power1.out'},form+entryDuration*.45)
      .call(()=>{this.conduitFx.visible=false;},[],form+entryDuration*.44)
      .call(()=>{this.formationFx.visible=this.formationFront.visible=false;},[],form+entryDuration+.08)
      .call(()=>playSound('rare',{gain:.18}),[],form+entryDuration*.54)
      .call(()=>{playSound(profile.weight>.5?'land':'release',{gain:profile.grounded?.36+profile.weight*.22:.22});if(profile.grounded)onLand?.();},[],form+entryDuration)
      .call(()=>{this.ball.state.setAnimation(0,'closed',false);},[],form+entryDuration*.48)
      .to(this.ball,{x:-175,rotation:-.8,alpha:0,duration:departDuration,ease:'power2.inOut'},form+entryDuration*.48)
      .to(departure,{progress:1,duration:departDuration,ease:'power2.inOut',onUpdate:()=>{this.ball.y=this.floor-50+21*departure.progress;}},form+entryDuration*.48)
      .to(this.ball.scale,{x:.25,y:.25,duration:departDuration},form+entryDuration*.48)
      .call(()=>{this.hero.play('charge');this.power.begin();},[],charge)
      .call(()=>playPokemonCry(this.power.profile.cryId??this.power.profile.dexId),[],charge+Math.min(.22,this.hero.chargeDuration*.32))
      .to(attackClock,{time:this.hero.chargeDuration+this.hero.attackDuration+this.hero.recoveryDuration,duration:this.hero.chargeDuration+this.hero.attackDuration+this.hero.recoveryDuration,ease:'none',onUpdate:()=>{if(!this.winAttackActive){this.hero.setAttackTime(attackClock.time);this.power.clock=attackClock.time;}}},charge)
      .to(this.power,{charge:1,duration:this.hero.chargeDuration,ease:'power2.in',onUpdate:()=>onCharge?.(this.power.charge,this.power.profile.color)},charge)
      .call(()=>{if(this.winAttackActive)return;this.hero.setAttackTime(this.hero.chargeDuration);this.hero.capturePose();this.power.release(this.hero.chargeDuration);this.hero.play('attack');onPower?.(this.power.profile.color);},[],attack)
      .call(()=>{this.moveVoice=playPokemonMove(this.power.profile.cue);},[],soundStart)
      .to(moveEnvelope,{gain:1,duration:.07,ease:'sine.out',onUpdate:()=>this.moveVoice?.update(moveEnvelope.gain,0)},soundStart)
      .to(moveEnvelope,{gain:0,duration:.18,ease:'sine.in',onUpdate:()=>this.moveVoice?.update(moveEnvelope.gain,0)},attackEnd-.02)
      .call(()=>{this.moveVoice?.stop();this.moveVoice=null;},[],attackEnd+.17)
      .to(this.power,{charge:0,blast:1,duration:.08,ease:'power2.out'},attack)
      .to(this.hero,{x:profile.side*.12,y:settle+2*profile.impact,duration:.055,ease:'power2.out'},attack)
      .to(this.hero,{x:0,y:settle,duration:.19,ease:'sine.out'},attack+.055)
      .to(this.power,{fade:0,duration:decay,ease:'power1.in'},attackEnd-decay)
      .call(()=>onWin?.(),[],timing.win)
      .call(()=>{if(!this.winAttackActive)this.hero.play('recover');},[],recoverEnd)
      .to({}, {duration:.4},recoverEnd);
    // One clock for the 3D ball: tumble, bounces, latch, lid and departure all read from it.
    const close=form+entryDuration*.48,end=close+departDuration+.2;Object.assign(this.plan,{hit,first:cues.first,second:cues.second,latch:cues.latch,open,close,end});this.ballClock.t=0;
    timeline.to(this.ballClock,{t:end,duration:end,ease:'none'},0)
      // The card takes the ball: it gives back on contact and springs upright, instead of tearing.
      .to(this.cardStrike,{v:1,duration:.05,ease:'power2.out'},hit).to(this.cardStrike,{v:0,duration:.8,ease:'elastic.out(1,0.32)'},hit+.05)
      .call(()=>this.juice.stream(()=>this.aperture(),()=>({x:this.hero.x,y:this.actors.y+this.hero.y-63.5*this.hero.scale.y}),entryDuration*.62,this.power.profile.light),[],form);
    // Lens and pressure follow the ball: push in for the puncture, breathe before the release, ride the charge.
    const cam=this.camera,tone=this.power.profile,hurt=(amount:number)=>{cam.trauma=Math.min(1,cam.trauma+amount);};
    timeline.to(cam,{zoom:1.2,duration:hit,ease:'power2.in'},0)
      .call(()=>{hurt(.8);this.juice.puncture(IMPACT.x,IMPACT.y,tone.color);},[],hit)
      .to(cam,{zoom:1.85,duration:.07,ease:'power4.out'},hit).to(cam,{zoom:1.58,duration:.5,ease:'power2.out'},hit+.07)
      .to(cam,{zoom:1.7,duration:Math.max(.1,open-.22-hit-.57),ease:'sine.inOut'},hit+.57)
      .call(()=>{const seconds=Math.min(.62,open-cues.first-.05);this.juice.gather(this.ball.x,this.ball.y,seconds,tone.light);playSound('win-gather',{rate:.62/Math.max(.2,seconds),pan:this.ball.x/312});},[],Math.max(cues.first+.05,open-.62))
      .call(()=>{hurt(.34);this.juice.bounce(this.ball.x,this.floor);},[],cues.first)
      .call(()=>{hurt(.16);this.juice.bounce(this.ball.x,this.floor,.6);},[],cues.second)
      .to(cam,{zoom:1.5,duration:.2,ease:'power2.inOut'},open-.22)
      .call(()=>{hurt(.62);const aperture=this.aperture();this.juice.release(aperture.x,aperture.y,tone.color,tone.light);playSound('win-bloom');},[],open)
      .to(cam,{zoom:1.9,duration:.09,ease:'power4.out'},open).to(cam,{zoom:1.52,duration:Math.max(.3,entryDuration*.8),ease:'power2.inOut'},open+.1)
      .call(()=>{if(!profile.grounded)return;hurt(.3+profile.weight*.35);this.juice.landing(this.hero.x,this.floor,tone.color,.7+profile.weight*.5);playSound('win-land',{gain:.55+profile.weight*.45});},[],form+entryDuration)
      .to(cam,{zoom:1.68,duration:Math.max(.2,this.hero.chargeDuration),ease:'power2.in'},charge)
      .call(()=>{if(this.winAttackActive)return;hurt(.5);const emitter=this.hero.powerEmitters(tone)[0],at=emitter?this.front.toLocal(this.hero.toGlobal(emitter)):{x:this.hero.x,y:this.actors.y+this.hero.y-60};this.juice.blast(at.x,at.y,tone.color,tone.light);if(emitter)this.juice.beam(at.x,at.y,emitter.dx,emitter.dy,tone.color,tone.light);},[],attack)
      .to(cam,{zoom:()=>this.winAttackActive?1.8:1.3,duration:.5,ease:'power3.out'},attack)
      // Without an arena the lens stays close through the count, then clears before the amount travels.
      .to(cam,{zoom:()=>this.winAttackActive?cam.zoom:1,duration:.4,ease:'power2.inOut'},Math.min(attack+.95,recoverEnd));
    timeline.set(this.celClock,{age:0},open).to(this.celClock,{age:entryDuration+.95,duration:entryDuration+.95,ease:'none'},open);
    this.shards.forEach((shard,i)=>{const a=i/12*Math.PI*2;timeline.set(shard,{visible:true},hit).to(shard,{x:Math.cos(a)*(95+i*4),y:IMPACT.y+Math.sin(a)*86+60,rotation:(i-6)*.7,alpha:0,duration:.55,ease:'power2.out'},hit);});
  }
  /** Settle directly without running the skipped bounce, attack or audio callbacks. */
  finish(){
    this.camera.zoom=1;this.camera.trauma=0;this.juice.clear();
    this.moveVoice?.stop();this.moveVoice=null;stopRevealAudio();this.started=true;this.released=true;
    this.face.texture=this.punctured;this.cardShell.position.set(0,0);this.cardShell.rotation=0;this.ballClock.t=this.plan.end;this.cardStrike.v=0;this.applyCardTilt();this.flightGlow.visible=false;this.ball3d.place(0,0,1,0,false);
    this.ball.alpha=0;this.ball.visible=false;this.shellFront.visible=false;this.shellFront.state.clearTracks();this.formationFx.visible=this.formationFront.visible=false;this.formationFront.state.clearTracks();this.conduitFx.visible=false;this.formationFx.state.clearTracks();this.conduitFx.state.clearTracks();this.flightFx.visible=false;this.releaseFx.visible=false;this.flightFx.state.clearTracks();this.releaseFx.state.clearTracks();this.ball.state.clearTracks();this.trail.visible=false;
    for(const effect of [this.flare,this.pressure,this.latch,...this.shards])effect.visible=false;
    this.releaseCels.hide();this.release.amount=0;this.entrance.opacity=0;this.power.charge=0;this.power.blast=0;this.power.fade=0;
    const profile=performanceProfile(this.power.profile.species);
    this.hero.filters=[];this.hero.visible=true;this.hero.alpha=1;this.hero.position.set(0,profile.grounded?65:profile.settle-10);this.hero.scale.set(1);
    this.hero.play('idle');this.hero.update(.2);this.hero.capturePose();this.update(0);
  }
  update(dt:number){
    this.camera.trauma=Math.max(0,this.camera.trauma-dt*1.5);this.juice.update(dt);
    this.hero.setEnergy(this.power.profile.color,Math.min(1,(this.hero.filters&&this.hero.filters.length?this.white.alpha*.9:0)+this.power.charge*.7+this.power.blast*this.power.fade*.9+this.release.amount*.45));
    this.ball.update(dt);const aperture=this.aperture();
    if(this.flightFx.visible)this.flightFx.update(dt);if(this.releaseFx.visible){this.releaseFx.position.set(aperture.x,aperture.y);this.releaseFx.update(dt);}
    for(const [front,rig] of [[false,this.formationFx],[true,this.formationFront]] as const)if(rig.visible){
      rig.position.set(this.hero.x,this.actors.y+this.hero.y-63.5*this.hero.scale.y);rig.scale.set(this.hero.scale.x);rig.update(dt);rig.alpha=front?0:.12;
      for(const slot of rig.skeleton.slots){const name=slot.data.name,isFront=name==='halo1'||name==='halo3';if(front!==isFront)slot.color.a=0;}
    }
    if(this.conduitFx.visible){const tx=this.hero.x,ty=this.actors.y+this.hero.y-63.5*this.hero.scale.y;this.conduitFx.position.set(aperture.x,aperture.y);this.conduitFx.rotation=Math.atan2(ty-aperture.y,tx-aperture.x);this.conduitFx.scale.set(Math.max(.01,Math.hypot(tx-aperture.x,ty-aperture.y)/240),1);this.conduitFx.update(dt);}
    if(this.shellFront.visible){this.shellFront.position.copyFrom(this.ball.position);this.shellFront.scale.copyFrom(this.ball.scale);this.shellFront.rotation=this.ball.rotation;const track=this.shellFront.state.getCurrent(0),source=this.ball.state.getCurrent(0);if(track&&source)track.trackTime=source.trackTime;this.shellFront.update(0);for(const name of ['closed','upper','button'])this.shellFront.skeleton.findSlot(name)!.color.a=0;}
    this.latch.position.set(this.ball.x-19*this.ball.scale.x,this.ball.y);if(this.released&&this.actors.alpha>0&&!this.returning&&!this.winAttackActive)this.hero.update(dt);this.power.update(dt);this.entrance.update(this.hero.x,this.hero.y);if(this.released){this.shadow.x=this.hero.x;const lift=Math.max(0,65-this.hero.y);this.shadow.scale.set(Math.max(.4,1-lift*.0025));this.shadow.alpha=Math.max(.16,.85-lift*.006);}
    const height=Math.max(0,this.floor-this.ball.y-50),proximity=Math.max(0,1-height/330);this.ballShadow.position.set(this.ball.x,this.floor);this.ballShadow.scale.set(.55+proximity*.45);this.ballShadow.alpha=proximity*this.ball.alpha;
    this.updateBall();
    this.energy.clear();
  }

  private updateBall(){
    const t=this.ballClock.t,p=this.plan,ball=this.ball,shown=this.started&&ball.visible&&ball.alpha>.005&&t>0&&t<p.end;
    if(ball.parent&&this.ball3d.sprite.parent!==ball.parent)ball.parent.addChildAt(this.ball3d.sprite,ball.parent.getChildIndex(ball)+1);
    this.ball3d.place(ball.x,ball.y,69*ball.scale.x,ball.alpha,shown);
    const smooth=(v:number)=>{const k=Math.max(0,Math.min(1,v));return k*k*(3-2*k);},back=(v:number)=>{const k=Math.max(0,Math.min(1,v))-1;return 1+2.2*k*k*k+1.2*k*k;};
    const open=t<p.open?0:t<p.close?back((t-p.open)/.24):1-smooth((t-p.close)/.2);
    this.ball3d.update({spin:ballSpin(t,p.hit,p.first,p.second,this.spinPose),roll:-ball.rotation+this.departure.progress*2.8,open,button:smooth((t-p.latch+.1)/.1)*(1-smooth((t-p.open-.04)/.3)),inner:smooth((t-p.open)/.06)*(1-smooth((t-p.close+.05)/.35)),front:this.shellFront.visible});
    // The thrown ball leaves a streak of its own light, stretched by its speed through depth.
    const flying=shown&&t<p.hit;this.flightGlow.visible=flying;
    if(flying){const a=ballFlight(t,this.skyY),b=ballFlight(Math.max(0,t-.03),this.skyY),speed=Math.hypot(a.x-b.x,a.y-b.y)/.03,radius=69*a.scale;this.flightGlow.position.set(ball.x,ball.y);this.flightGlow.rotation=Math.atan2(a.y-b.y,a.x-b.x);this.flightGlow.scale.set(Math.min(5,speed*.05/128+radius*2.2/128),radius*1.5/16);this.flightGlow.tint=this.power.profile.light;this.flightGlow.alpha=.7*Math.min(1,t/.2);this.juice.trail(ball.x,ball.y,radius,this.power.profile.light);}
    if(this.cardStrike.v!==0||t<p.hit+1)this.applyCardTilt();
    if(this.power.charge>.01&&!this.winAttackActive&&this.released){const emitter=this.hero.powerEmitters(this.power.profile)[0];if(emitter){const at=this.front.toLocal(this.hero.toGlobal(emitter));this.juice.charging(at.x,at.y,this.power.charge,this.power.profile.light);}}
  }
  private aperture(){const bone=this.ball.skeleton.findBone('orb')!;return ballAperture({x:this.ball.x,y:this.ball.y,scale:this.ball.scale.x,rotation:this.ball.rotation},{x:bone.worldX,y:bone.worldY});}
  fitPresentation(halfWidth:number){this.hero.fitPresentation(halfWidth);}
  private winAttackActive=false;private winAttackStart=0;
  winOrigins(age?:number){
    if(age!==undefined&&age>=0&&age<1.72){
      if(!this.winAttackActive){this.winAttackActive=true;this.winAttackStart=this.hero.attackTime;}
      const phase=winChoreography(age,'big').clipPhase;
      const time=age<1.08?this.winAttackStart+(this.hero.chargeDuration-this.winAttackStart)*smooth(age/1.08):this.hero.chargeDuration+this.hero.attackDuration*(phase-.36)/.29;
      this.hero.setAttackTime(Math.max(this.winAttackStart,time));
      this.hero.capturePose();
    }
    return this.hero.powerEmitters(this.power.profile).map(p=>{const pt=this.hero.toGlobal(p);return{x:pt.x,y:pt.y};});}
  prepareCardReturn(){this.camera.zoom=1;this.camera.trauma=0;this.returning=true;this.face.texture=this.intact;this.actors.alpha=0;this.shadow.visible=false;}
  setWinOcclusion(value:number,background=value){this.cardShell.alpha=1-smooth(background/.15);if(value>.99&&background<.2)this.face.texture=this.intact;if(value===0&&this.winAttackActive&&this.actors.alpha===0){this.winAttackActive=false;this.hero.play('idle');}this.actors.alpha=this.returning?0:1-Math.min(1,Math.max(0,value)*4);}
  setFloor(y:number){this.ball.y+=(y-this.floor)*this.ballFloorInfluence;this.floor=y;this.actors.y=y-219;this.shadow.y=y;}
  setCardTilt(x:number,y:number){this.hover.x=x;this.hover.y=y;this.applyCardTilt();}
  private applyCardTilt(){const strike=this.cardStrike.v,yaw=this.hover.x*.19,pitch=-this.hover.y*.13-strike*.42,points:number[]=[];for(const [xx,yy] of [[-156,-217.5],[156,-217.5],[156,217.5],[-156,217.5]]){const z=-xx*Math.sin(yaw)+yy*Math.sin(pitch),p=700/(700+z);points.push(xx*Math.cos(yaw)*p,yy*Math.cos(pitch)*p);}this.face.setCorners(points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7]);}
  setCardFoil(filter:Filter){this.face.filters=[filter];}
  takeCard(){this.face.texture=this.intact;this.face.filters=[];this.setCardTilt(0,0);this.cardShell.removeFromParent();return this.cardShell;}
  destroy(){this.ball3d.dispose();this.moveVoice?.stop();this.moveVoice=null;if(this.started)stopRevealAudio();this.hero.filters=[];this.white.destroy();this.root.destroy({children:true});}
}
