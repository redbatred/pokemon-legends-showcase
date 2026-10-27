import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { gsap } from 'gsap';

/** All scenery shares the game's renderer. No CSS animation, blur or compositing layers. */
export class CanvasScene {
  root=new Container(); selection=new Container(); arena=new Container();
  private sky!:Sprite; private platform!:Sprite; private glow!:Sprite;private emission!:Sprite;
  private beams:Sprite[]=[]; private stars:Sprite[]=[];private sockets:Sprite[]=[];
  private light={r:140,g:221,b:255};private colorTween:gsap.core.Tween|null=null;private paused=false;
  private impactState={amount:0};private impactTween:gsap.core.Tween|null=null;
  private selectionArt=new Graphics(); private ring=new Graphics();
  private active=false; private entrance={amount:0}; private animation:gsap.core.Tween|null=null;
  private width=0;private height=0;private stageBottom=0;
  private owned:Texture[]=[];private destroyed=false;
  async init(){
    this.root.eventMode='none';this.root.interactiveChildren=false;
    this.root.addChild(this.selection,this.arena);
    const gradient=document.createElement('canvas');gradient.width=512;gradient.height=512;
    const ctx=gradient.getContext('2d')!;const fill=ctx.createRadialGradient(256,215,10,256,256,360);fill.addColorStop(0,'#24446a');fill.addColorStop(1,'#071426');ctx.fillStyle=fill;ctx.fillRect(0,0,512,512);
    const texture=Texture.from(gradient);this.owned.push(texture);const field=new Sprite(texture);field.label='field';this.selection.addChild(field,this.selectionArt);
    const [background,platform]=await Promise.all([Assets.load<Texture>('/assets/stage/pokemon-anime-arena-v2.png'),Assets.load<Texture>('/assets/stage/pokemon-anime-platform-v2.png')]);
    if(this.destroyed)return;
    this.sky=new Sprite(background);this.sky.anchor.set(.5);this.sky.tint=0xffffff;this.root.addChildAt(this.sky,0);this.selection.alpha=.32;
    this.platform=new Sprite(platform);this.platform.anchor.set(.5);
    const emissionCanvas=document.createElement('canvas');emissionCanvas.width=platform.width;emissionCanvas.height=platform.height;
    const ec=emissionCanvas.getContext('2d',{willReadFrequently:true})!;ec.drawImage(platform.source.resource as CanvasImageSource,0,0);const pixels=ec.getImageData(0,0,platform.width,platform.height);
    for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2],a=pixels.data[i+3],u=(i/4%platform.width)/platform.width,v=Math.floor(i/4/platform.width)/platform.height;
      const radius=((u-.5)/.409)**2+((v-.485)/.213)**2;
      const dx=Math.abs(u-.5),socket=((dx-.226)/.029)**2+((v-.305)/.023)**2<1||((dx-.343)/.029)**2+((v-.61)/.023)**2<1;
      const strip=(radius>.82&&radius<1.12||socket)&&b>140&&g>130&&g>b*.66&&r<g*.8,mark=u>.19&&u<.81&&v>.305&&v<.645&&r>190&&g>200&&b>205;
      pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=Math.max(r,g,b);pixels.data[i+3]=strip||mark?a:0;}
    ec.putImageData(pixels,0,0);const et=Texture.from(emissionCanvas);this.owned.push(et);this.emission=new Sprite(et);this.emission.anchor.set(.5);
    const light=document.createElement('canvas');light.width=128;light.height=128;const lc=light.getContext('2d')!;const lg=lc.createRadialGradient(64,64,0,64,64,64);lg.addColorStop(0,'rgba(255,255,255,.95)');lg.addColorStop(.45,'rgba(255,255,255,.32)');lg.addColorStop(1,'rgba(255,255,255,0)');lc.fillStyle=lg;lc.fillRect(0,0,128,128);const lt=Texture.from(light);this.owned.push(lt);
    this.glow=new Sprite(lt);this.glow.anchor.set(.5);this.glow.blendMode='add';this.arena.addChild(this.platform,this.emission,this.glow,this.ring);
    const beam=document.createElement('canvas');beam.width=128;beam.height=512;const bc=beam.getContext('2d')!;const bg=bc.createLinearGradient(0,0,0,512);bg.addColorStop(0,'rgba(255,255,255,0)');bg.addColorStop(.4,'rgba(255,255,255,.04)');bg.addColorStop(1,'rgba(255,255,255,.5)');bc.fillStyle=bg;bc.beginPath();bc.moveTo(0,0);bc.lineTo(128,0);bc.lineTo(81,512);bc.lineTo(47,512);bc.fill();
    bc.globalCompositeOperation='destination-in';const feather=bc.createLinearGradient(0,0,128,0);feather.addColorStop(0,'transparent');feather.addColorStop(.25,'white');feather.addColorStop(.75,'white');feather.addColorStop(1,'transparent');bc.fillStyle=feather;bc.fillRect(0,0,128,512);const bt=Texture.from(beam);this.owned.push(bt);
    for(let i=0;i<2;i++){const s=new Sprite(bt);s.anchor.set(.5,1);s.blendMode='add';this.beams.push(s);this.arena.addChild(s);}
    for(let i=0;i<4;i++){const socket=new Sprite(lt);socket.anchor.set(.5);socket.blendMode='normal';this.sockets.push(socket);this.arena.addChild(socket);}
    for(let i=0;i<18;i++){const s=new Sprite(lt);s.anchor.set(.5);s.width=s.height=i%4===0?8:4;s.blendMode='add';this.stars.push(s);this.root.addChild(s);}
    this.arena.visible=false;this.resize(this.width,this.height,this.stageBottom);
  }
  resize(w:number,h:number,bottom:number){
    this.width=w;this.height=h;this.stageBottom=bottom;
    const field=this.selection.getChildByLabel('field') as Sprite|null;if(field){field.width=w;field.height=h;}
    this.selectionArt.clear().circle(w*.5,h*.43,Math.min(w*.38,300)).stroke({width:1,color:0x76c4ef,alpha:.09}).circle(w*.5,h*.43,Math.min(w*.49,400)).stroke({width:1,color:0x76c4ef,alpha:.04});
    const cx=w*.13,cy=h*.45,r=Math.min(w*.23,190);this.selectionArt.circle(cx,cy,r).stroke({width:12,color:0x78bce5,alpha:.035}).moveTo(cx-r,cy).lineTo(cx+r,cy).stroke({width:12,color:0x78bce5,alpha:.035}).circle(cx,cy,r*.22).fill(0x12233c).stroke({width:8,color:0x78bce5,alpha:.035});
    if(!this.sky)return;
    this.sky.position.set(w/2,h/2);this.sky.scale.set(Math.max(w/this.sky.texture.width,h/this.sky.texture.height)*1.02);
    const pw=Math.min(w<700?w*1.25:w*.67,900);this.platform.width=pw;this.platform.height=pw/2;this.platform.position.set(w/2,bottom-17);
    this.emission.position.copyFrom(this.platform.position);this.emission.width=pw;this.emission.height=pw/2;
    const centerY=bottom-17-pw*.0225;
    this.glow.position.set(w/2,centerY);this.glow.width=pw*.32;this.glow.height=pw*.12;
    this.ring.clear().ellipse(0,0,pw*.075,pw*.022).stroke({width:3,color:0xffffff,alpha:.9});this.ring.position.set(w/2,centerY);
    this.beams.forEach((s,i)=>{s.position.set(w/2,centerY);s.width=pw*(i?.62:.36);s.height=Math.min(390,h*.6);s.rotation=0;});
    this.sockets.forEach((s,i)=>{s.position.set(w/2+pw*(i%2?1:-1)*(i<2?.225:.34),bottom-17+(i<2?-.096:.059)*pw);s.width=pw*.13;s.height=pw*.065;});
  }
  setActive(active:boolean,reduced:boolean){
    if(active===this.active)return;this.active=active;this.animation?.kill();
    this.arena.visible=active;this.selection.visible=!active;
    if(active){this.entrance.amount=reduced?1:0;this.animation=gsap.to(this.entrance,{amount:1,duration:reduced?.01:1.05,ease:'power3.out'});}
  }
  get lightTint(){return (Math.round(this.light.r)<<16)|(Math.round(this.light.g)<<8)|Math.round(this.light.b);}
  setCardColor(color:number,reduced:boolean){this.colorTween?.kill();this.colorTween=gsap.to(this.light,{r:(color>>16)&255,g:(color>>8)&255,b:color&255,duration:reduced?.01:.48,ease:'power2.out',paused:this.paused});}
  impact(rare:boolean,reduced:boolean){this.impactTween?.kill();this.impactState.amount=reduced?0:rare?1:.45;this.impactTween=gsap.to(this.impactState,{amount:0,duration:rare?1.2:.65,ease:'power2.out'});}
  tick(time:number,reduced:boolean,low:boolean){
    if(!this.platform)return;
    this.sky.x=this.width/2+(reduced?0:Math.sin(time*.07)*7);
    this.stars.forEach((s,i)=>{s.visible=!reduced&&(!low||i<6);s.position.set((i*137+41+Math.sin(time*.2+i)*15)%Math.max(1,this.width),(this.height-((time*9+i*57)%this.height)));s.alpha=.24+Math.sin(time+i)*.12;});
    if(!this.active)return;
    const a=this.entrance.amount;this.arena.alpha=a;const tint=(Math.round(this.light.r)<<16)|(Math.round(this.light.g)<<8)|Math.round(this.light.b);this.emission.tint=tint;this.glow.tint=tint;this.ring.tint=tint;this.sockets.forEach(s=>s.tint=tint);this.beams.forEach(s=>s.tint=tint);
    this.arena.y=(1-a)*45;this.emission.alpha=.9;
    this.glow.alpha=low?.4:.68+this.impactState.amount*.3+(reduced?0:Math.sin(time*1.3)*.07);
    this.ring.visible=true;this.ring.scale.set(1+this.impactState.amount*.12);this.ring.alpha=.65+this.impactState.amount*.3;
    this.beams.forEach((s,i)=>{s.visible=!low;s.alpha=(i?.18:.52)+this.impactState.amount*.22;s.rotation=reduced?0:Math.sin(time*.35+i)*.012;});
    this.sockets.forEach((s,i)=>{s.alpha=.85+this.impactState.amount*.15+(reduced?0:Math.sin(time*2+i)*.15);});
  }
  pause(value:boolean){this.paused=value;value?this.colorTween?.pause():this.colorTween?.resume();if(value){this.animation?.pause();this.impactTween?.pause();}else{this.animation?.resume();this.impactTween?.resume();}}
  destroy(){this.destroyed=true;this.animation?.kill();this.impactTween?.kill();this.colorTween?.kill();this.root.destroy({children:true});this.owned.forEach(t=>t.destroy(true));}
}
