import { Assets,Container,Sprite,Texture } from 'pixi.js';
import { gsap } from 'gsap';
import { LivingBackdrop } from './LivingBackdrop';
import { StageLightRig } from './StageLightRig';

/** The painted stadium and platform remain untouched beneath independently animated light. */
export class CanvasScene {
  root=new Container();arena=new Container();
  private background:LivingBackdrop|null=null;private platform:Sprite|null=null;private lights:StageLightRig|null=null;
  private light={r:140,g:221,b:255};private colorTween:gsap.core.Tween|null=null;private paused=false;
  private impactState={amount:0};private impactTween:gsap.core.Tween|null=null;
  private active=false;private entrance={amount:0};private animation:gsap.core.Tween|null=null;
  private width=0;private height=0;private stageBottom=0;private destroyed=false;private lastTime=0;
  async init(){
    this.root.eventMode='none';this.root.interactiveChildren=false;
    const [background,platform]=await Promise.all([Assets.load<Texture>('/assets/stage/pokemon-anime-arena-v2.png'),Assets.load<Texture>('/assets/stage/pokemon-anime-platform-v2.png')]);
    if(this.destroyed)return;
    this.background=new LivingBackdrop(background);this.platform=new Sprite(platform);this.platform.anchor.set(.5);this.lights=new StageLightRig(platform);
    this.arena.addChild(this.platform,this.lights.root);this.root.addChild(this.background.root,this.arena);this.arena.visible=false;
    this.resize(this.width,this.height,this.stageBottom);
  }
  resize(w:number,h:number,bottom:number){
    this.width=w;this.height=h;this.stageBottom=bottom;this.background?.resize(w,h);
    if(!this.platform)return;
    const width=Math.min(w<700?w*1.25:w*.67,900),y=bottom-17;
    this.platform.width=width;this.platform.height=width/2;this.platform.position.set(w/2,y);this.lights?.resize(w/2,y,width);
  }
  setActive(active:boolean,reduced:boolean){
    if(active===this.active)return;this.active=active;this.animation?.kill();this.arena.visible=active;
    if(active){this.entrance.amount=reduced?1:0;this.animation=gsap.to(this.entrance,{amount:1,duration:reduced?.01:.8,ease:'power3.out',paused:this.paused});}
  }
  get lightTint(){return (Math.round(this.light.r)<<16)|(Math.round(this.light.g)<<8)|Math.round(this.light.b);}
  setCardColor(color:number,reduced:boolean){this.colorTween?.kill();this.colorTween=gsap.to(this.light,{r:(color>>16)&255,g:(color>>8)&255,b:color&255,duration:reduced?.01:.55,ease:'power2.out',paused:this.paused});}
  impact(rare:boolean,reduced:boolean){this.impactTween?.kill();this.impactState.amount=reduced?0:rare?1:.45;this.impactTween=gsap.to(this.impactState,{amount:0,duration:rare?1.2:.65,ease:'power2.out',paused:this.paused});}
  tick(time:number,reduced:boolean,low:boolean){
    const dt=Math.min(.05,Math.max(0,time-this.lastTime));this.lastTime=time;if(!this.background)return;
    this.background.tick(time,reduced,low);if(!this.active)return;
    this.arena.alpha=this.entrance.amount;this.arena.y=(1-this.entrance.amount)*35;
    this.lights?.update(dt,this.lightTint,reduced,low,this.impactState.amount);
  }
  pause(value:boolean){this.paused=value;for(const tween of [this.colorTween,this.animation,this.impactTween])value?tween?.pause():tween?.resume();}
  destroy(){this.destroyed=true;this.animation?.kill();this.impactTween?.kill();this.colorTween?.kill();this.background?.destroy();this.lights?.destroy();this.root.destroy({children:true});}
}
