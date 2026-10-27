import { Assets,Container,Sprite,Texture } from 'pixi.js';
import { playSound } from './audio';
import { gsap } from 'gsap';
import { LivingBackdrop } from './LivingBackdrop';
import { gameLayout } from './rendering';
import { StageLightRig } from './StageLightRig';

/** Only emitter pixels are neutralized; stadium paint and platform shadows keep their original colors. */
export class CanvasScene {
  root=new Container();arena=new Container();
  private contact:Sprite|null=null;private contactTexture:Texture|null=null;
  private background:LivingBackdrop|null=null;private platform:Sprite|null=null;private lights:StageLightRig|null=null;
  private chargeLevel=-1;private light={r:140,g:221,b:255};private colorTween:gsap.core.Tween|null=null;private paused=false;
  private exposure={amount:1};private exposureTween:gsap.core.Tween|null=null;
  private impactState={amount:0};private impactTween:gsap.core.Tween|null=null;
  private active=false;private entrance={amount:0};private animation:gsap.core.Tween|null=null;
  private width=0;private height=0;private stageBottom=0;private destroyed=false;private lastTime=0;
  async init(){
    this.root.eventMode='none';this.root.interactiveChildren=false;
    const [background,platform]=await Promise.all([Assets.load<Texture>('/assets/stage/pokemon-anime-arena-v2.png'),Assets.load<Texture>('/assets/stage/pokemon-anime-platform-v2.png')]);
    if(this.destroyed)return;
    this.background=new LivingBackdrop(background);this.platform=new Sprite(platform);this.platform.anchor.set(.5);this.lights=new StageLightRig(platform);this.platform.texture=this.lights.baseTexture;
    const shadow=document.createElement('canvas');shadow.width=256;shadow.height=128;const c=shadow.getContext('2d')!;c.scale(1,.5);const shade=c.createRadialGradient(128,128,12,128,128,128);shade.addColorStop(0,'rgba(3,25,49,.32)');shade.addColorStop(.55,'rgba(3,25,49,.18)');shade.addColorStop(1,'transparent');c.fillStyle=shade;c.fillRect(0,0,256,256);this.contactTexture=Texture.from(shadow);this.contact=new Sprite(this.contactTexture);this.contact.anchor.set(.5);
    this.arena.addChild(this.contact,this.platform,this.lights.root);this.root.addChild(this.background.root,this.arena);this.arena.visible=false;
    this.resize(this.width,this.height,this.stageBottom);
  }
  resize(w:number,h:number,bottom:number,geometry=gameLayout(w,h,true)){
    this.width=w;this.height=h;this.stageBottom=bottom;this.background?.resize(w,h,gameLayout(w,h,true).stageY-60);
    if(!this.platform)return;
    const width=geometry.stageWidth,y=geometry.stageY,flatten=geometry.stageFlatten;
    this.platform.width=width;this.platform.height=width/2*flatten;this.platform.position.set(w/2,y);this.lights?.resize(w/2,y,width,flatten);if(this.contact){this.contact.position.set(w/2,y+width*.13);this.contact.width=width*.93;this.contact.height=width*.13;}
  }
  setActive(active:boolean,reduced:boolean){
    if(active===this.active)return;this.active=active;this.chargeLevel=-1;this.animation?.kill();this.arena.visible=active;
    if(active){playSound('stage');this.entrance.amount=reduced?1:0;this.animation=gsap.to(this.entrance,{amount:1,duration:reduced?.01:.8,ease:'power3.out',paused:this.paused});}
  }
  get lightTint(){return (Math.round(this.light.r)<<16)|(Math.round(this.light.g)<<8)|Math.round(this.light.b);}
  setCardColor(color:number,reduced:boolean){this.colorTween?.kill();this.colorTween=gsap.to(this.light,{r:(color>>16)&255,g:(color>>8)&255,b:color&255,duration:reduced?.01:.55,ease:'power2.out',paused:this.paused});}
  setCharge(amount:number|null){this.chargeLevel=amount??-1;}
  beginReveal(reduced:boolean){this.chargeLevel=-1;this.exposureTween?.kill();this.exposureTween=gsap.to(this.exposure,{amount:reduced?1:.45,duration:.18,ease:'power2.out',paused:this.paused});}
  impact(rare:boolean,reduced:boolean){this.chargeLevel=-1;this.exposureTween?.kill();this.exposure.amount=reduced?1:1.2;this.exposureTween=gsap.to(this.exposure,{amount:1,duration:.65,paused:this.paused});this.impactTween?.kill();this.impactState.amount=reduced?0:rare?1:.45;this.impactTween=gsap.to(this.impactState,{amount:0,duration:rare?1.2:.65,ease:'power2.out',paused:this.paused});}
  tick(time:number,reduced:boolean,low:boolean){
    const dt=Math.min(.05,Math.max(0,time-this.lastTime));this.lastTime=time;if(!this.background)return;
    this.background.tick(time,reduced,low);if(!this.active)return;
    this.arena.alpha=this.entrance.amount;this.arena.y=(1-this.entrance.amount)*18;
    this.lights?.update(dt,this.lightTint,reduced,low,this.impactState.amount,this.exposure.amount,this.chargeLevel);
  }
  pause(value:boolean){this.paused=value;for(const tween of [this.colorTween,this.animation,this.impactTween,this.exposureTween])value?tween?.pause():tween?.resume();}
  destroy(){this.destroyed=true;this.exposureTween?.kill();this.animation?.kill();this.impactTween?.kill();this.colorTween?.kill();this.background?.destroy();this.lights?.destroy();this.root.destroy({children:true});this.contactTexture?.destroy(true);}
}
