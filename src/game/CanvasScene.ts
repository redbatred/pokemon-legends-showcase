import { Assets,Container,Sprite,Texture } from 'pixi.js';
import { playSound,playCrowdReaction,stopCrowdReaction } from './audio';
import { gsap } from 'gsap';
import { LivingBackdrop } from './LivingBackdrop';
import { gameLayout } from './rendering';
import {AnimeAtmosphere} from './AnimeAtmosphere';
import { StageLightRig } from './StageLightRig';
import {StadiumFloodlights} from './StadiumFloodlights';
import {projectFloodlights} from './floodlightGeometry';
import type {ArenaBoardState} from './stadiumDisplayGeometry';
import {crowdAnimationLevel,type CrowdLevel} from './crowdReaction';

/** Only emitter pixels are neutralized; stadium paint and platform shadows keep their original colors. */
export class CanvasScene {
  private atmosphere=new AnimeAtmosphere();private cinema={amount:0,travel:0};private cinemaTween:gsap.core.Tween|null=null;private travelTween:gsap.core.Tween|null=null;
  root=new Container();arena=new Container();private focusShade=new Sprite(Texture.WHITE);
  private contact:Sprite|null=null;private contactTexture:Texture|null=null;
  private background:LivingBackdrop|null=null;private platform:Sprite|null=null;private lights:StageLightRig|null=null;
  private chargeLevel=-1;private light={r:140,g:221,b:255};private colorTween:gsap.core.Tween|null=null;private paused=false;
  private exposure={amount:1};private exposureTween:gsap.core.Tween|null=null;
  private impactState={amount:0};private impactTween:gsap.core.Tween|null=null;
  private active=false;private entrance={amount:0};private animation:gsap.core.Tween|null=null;
  private floodlights=new StadiumFloodlights();private celebrationAge=-1;private reactionLevel:CrowdLevel=0;private audienceLevel=0;private targetY=0;private stageWidth=0;
  private width=0;private height=0;private stageBottom=0;private destroyed=false;private lastTime=0;private lastReduced=false;private lastLow=false;
  async init(){
    this.root.eventMode='none';this.root.interactiveChildren=false;
    const [background,platform,trees,clouds,anticipating,celebrating,clapping,waving]=await Promise.all([Assets.load<Texture>('/assets/stage/pokemon-anime-arena-v2.png'),Assets.load<Texture>('/assets/stage/pokemon-anime-platform-v2.png'),Assets.load<Texture>('/assets/stage/living-v3/trees-atlas.png'),Assets.load<Texture>('/assets/stage/living-v3/clouds-atlas.png'),Assets.load<Texture>('/assets/stage/crowd-v1/anticipating.png'),Assets.load<Texture>('/assets/stage/crowd-v1/celebrating.png'),Assets.load<Texture>('/assets/stage/crowd-v2/cheer-clap.png'),Assets.load<Texture>('/assets/stage/crowd-v2/cheer-wave.png')]);
    if(this.destroyed)return;
    this.background=new LivingBackdrop(background,trees,clouds,[anticipating,celebrating,clapping,waving]);this.platform=new Sprite(platform);this.platform.anchor.set(.5);this.lights=new StageLightRig(platform);this.platform.texture=this.lights.baseTexture;
    const shadow=document.createElement('canvas');shadow.width=256;shadow.height=128;const c=shadow.getContext('2d')!;c.scale(1,.5);const shade=c.createRadialGradient(128,128,12,128,128,128);shade.addColorStop(0,'rgba(3,25,49,.32)');shade.addColorStop(.55,'rgba(3,25,49,.18)');shade.addColorStop(1,'transparent');c.fillStyle=shade;c.fillRect(0,0,256,256);this.contactTexture=Texture.from(shadow);this.contact=new Sprite(this.contactTexture);this.contact.anchor.set(.5);
    this.arena.addChild(this.contact,this.platform,this.lights.root);this.focusShade.tint=0x061235;this.focusShade.alpha=0;this.root.addChild(this.background.root,this.focusShade,this.floodlights.root,this.atmosphere.root,this.arena);this.arena.visible=false;
    this.resize(this.width,this.height,this.stageBottom);
  }
  resize(w:number,h:number,bottom:number,geometry=gameLayout(w,h,true)){
    if(w<=0||h<=0)return;
    this.width=w;this.height=h;this.atmosphere.resize(w,h);this.focusShade.width=w;this.focusShade.height=h;this.stageBottom=bottom;this.background?.resize(w,h,gameLayout(w,h,true).stageY-60);
    if(!this.platform)return;
    const width=geometry.stageWidth,y=geometry.stageY,flatten=geometry.stageFlatten;
    this.targetY=y-width*.035;this.stageWidth=width;
    this.platform.width=width;this.platform.height=width/2*flatten;this.platform.position.set(w/2,y);this.lights?.resize(w/2,y,width,flatten);if(this.contact){this.contact.position.set(w/2,y+width*.13);this.contact.width=width*.93;this.contact.height=width*.13;}
    this.tick(this.lastTime,this.lastReduced,this.lastLow);
  }
  setBoard(state:ArenaBoardState){this.background?.setBoard(state);}
  setActive(active:boolean,reduced:boolean){
    if(!active){this.setCinematic(false,reduced);this.endCelebration();this.travelTween?.kill();this.cinema.travel=0;this.impactTween?.kill();this.impactState.amount=0;}if(active===this.active)return;this.active=active;this.chargeLevel=-1;this.animation?.kill();this.arena.visible=active;
    if(active){playSound('stage');this.entrance.amount=reduced?1:0;this.animation=gsap.to(this.entrance,{amount:1,duration:reduced?.01:.8,ease:'power3.out',paused:this.paused});}
  }
  setCinematic(active:boolean|number,reduced:boolean){this.cinemaTween?.kill();this.cinemaTween=gsap.to(this.cinema,{amount:typeof active==='number'?active:active?1:0,duration:reduced?.01:active?.32:.65,ease:'power2.inOut',paused:this.paused});}
  arrive(reduced:boolean){this.setActive(true,reduced);this.travelTween?.kill();this.cinema.travel=reduced?0:1;this.travelTween=gsap.to(this.cinema,{travel:0,duration:reduced?.01:1.05,ease:'none',paused:this.paused});}
  get illumination(){return this.active?(this.chargeLevel>=0?.02+this.chargeLevel*.14:.07+this.impactState.amount*.10):0;}
  get lightTint(){return (Math.round(this.light.r)<<16)|(Math.round(this.light.g)<<8)|Math.round(this.light.b);}
  setCardColor(color:number,reduced:boolean,duration=.55){this.colorTween?.kill();this.colorTween=gsap.to(this.light,{r:(color>>16)&255,g:(color>>8)&255,b:color&255,duration:reduced?.01:duration,ease:'power2.out',paused:this.paused});}
  setCharge(amount:number|null){this.chargeLevel=amount??-1;}
  beginReveal(reduced:boolean,reaction:CrowdLevel=0){this.reactionLevel=reaction;this.audienceLevel=crowdAnimationLevel(reaction);this.chargeLevel=-1;this.exposureTween?.kill();this.exposureTween=gsap.to(this.exposure,{amount:reduced?1:.45,duration:.18,ease:'power2.out',paused:this.paused});}
  endCelebration(){this.celebrationAge=-1;stopCrowdReaction();}
  impact(rare:boolean,reduced:boolean,celebrate=rare){if(celebrate||!rare){if(this.audienceLevel>0&&this.celebrationAge<0)this.celebrationAge=0;playCrowdReaction(this.reactionLevel);}this.chargeLevel=-1;this.exposureTween?.kill();this.exposure.amount=reduced?1:1.2;this.exposureTween=gsap.to(this.exposure,{amount:1,duration:.65,paused:this.paused});this.impactTween?.kill();this.impactState.amount=reduced?0:rare?1:.45;this.impactTween=gsap.to(this.impactState,{amount:0,duration:rare?1.2:.65,ease:'power2.out',paused:this.paused});}
  tick(time:number,reduced:boolean,low:boolean){
    this.lastReduced=reduced;this.lastLow=low;
    const dt=Math.min(.05,Math.max(0,time-this.lastTime));this.lastTime=time;if(!this.background)return;
    this.background.tick(time,reduced,low);
    if(this.celebrationAge>=0)this.celebrationAge+=dt;
    this.background.show(this.active?this.entrance.amount:0,this.celebrationAge,this.cinema.travel,reduced,low,this.audienceLevel);
    this.focusShade.alpha=Math.max(this.cinema.amount*.69,this.cinema.travel*.23,this.active?this.entrance.amount*(this.chargeLevel>=0?.12+this.chargeLevel*.38:.09):0);
    this.floodlights.resize(projectFloodlights((u,v)=>this.background!.project(u,v)),this.width/2,this.targetY,this.stageWidth);
    this.floodlights.update(time,this.active?this.entrance.amount:0,this.chargeLevel,this.impactState.amount,this.cinema.travel,this.lightTint,reduced,low);
    this.atmosphere.update(time,this.cinema.amount,this.impactState.amount*this.cinema.amount,this.cinema.travel,this.lightTint,reduced,low);
    if(this.platform){const shade=Math.round(255-this.cinema.amount*72);this.platform.tint=(shade<<16)|(shade<<8)|Math.min(255,shade+12);}
    if(!this.active)return;
    this.arena.alpha=this.entrance.amount;this.arena.y=(1-this.entrance.amount)*18;
    this.lights?.update(dt,this.lightTint,reduced,low,this.impactState.amount,this.exposure.amount,this.chargeLevel);
  }
  pause(value:boolean){this.paused=value;for(const tween of [this.colorTween,this.animation,this.impactTween,this.exposureTween,this.cinemaTween,this.travelTween])value?tween?.pause():tween?.resume();}
  destroy(){this.destroyed=true;this.endCelebration();this.cinemaTween?.kill();this.travelTween?.kill();this.atmosphere.destroy();this.floodlights.destroy();this.exposureTween?.kill();this.animation?.kill();this.impactTween?.kill();this.colorTween?.kill();this.background?.destroy();this.lights?.destroy();this.root.destroy({children:true});this.contactTexture?.destroy(true);}
}
