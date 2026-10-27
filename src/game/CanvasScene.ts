import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { gsap } from 'gsap';

/** All scenery shares the game's renderer. No CSS animation, blur or compositing layers. */
export class CanvasScene {
  root=new Container(); selection=new Container(); arena=new Container();
  private sky!:Sprite; private platform!:Sprite; private glow!:Sprite;
  private beams:Sprite[]=[]; private stars:Sprite[]=[];private sockets:Sprite[]=[];
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
    const light=document.createElement('canvas');light.width=128;light.height=128;const lc=light.getContext('2d')!;const lg=lc.createRadialGradient(64,64,0,64,64,64);lg.addColorStop(0,'rgba(135,233,255,.8)');lg.addColorStop(.45,'rgba(98,194,255,.2)');lg.addColorStop(1,'rgba(98,194,255,0)');lc.fillStyle=lg;lc.fillRect(0,0,128,128);const lt=Texture.from(light);this.owned.push(lt);
    this.glow=new Sprite(lt);this.glow.anchor.set(.5);this.glow.blendMode='add';this.arena.addChild(this.glow,this.platform,this.ring);
    const beam=document.createElement('canvas');beam.width=128;beam.height=512;const bc=beam.getContext('2d')!;const bg=bc.createLinearGradient(0,0,0,512);bg.addColorStop(0,'rgba(201,246,255,.2)');bg.addColorStop(1,'rgba(119,205,255,0)');bc.fillStyle=bg;bc.beginPath();bc.moveTo(62,0);bc.lineTo(66,0);bc.lineTo(128,512);bc.lineTo(0,512);bc.fill();const bt=Texture.from(beam);this.owned.push(bt);
    for(let i=0;i<2;i++){const s=new Sprite(bt);s.anchor.set(.5,0);s.blendMode='add';this.beams.push(s);this.arena.addChild(s);}
    for(let i=0;i<4;i++){const socket=new Sprite(lt);socket.anchor.set(.5);socket.blendMode='add';this.sockets.push(socket);this.arena.addChild(socket);}
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
    this.glow.position.set(w/2,bottom-15);this.glow.width=pw*.9;this.glow.height=pw*.18;
    this.ring.clear().ellipse(w/2,bottom-20,pw*.36,pw*.085).stroke({width:2,color:0xb5f6ff,alpha:.7});this.ring.pivot.set(w/2,bottom-20);this.ring.position.set(w/2,bottom-20);
    this.beams.forEach((s,i)=>{s.position.set(w/2+(i?1:-1)*pw*.3,bottom-190);s.width=pw*.31;s.height=310;s.rotation=i?.2:-.2;});
    this.sockets.forEach((s,i)=>{s.position.set(w/2+pw*(i%2?.32:-.32),bottom+(i<2?-.105:.055)*pw);s.width=pw*.13;s.height=pw*.065;});
  }
  setActive(active:boolean,reduced:boolean){
    if(active===this.active)return;this.active=active;this.animation?.kill();
    this.arena.visible=active;this.selection.visible=!active;
    if(active){this.entrance.amount=reduced?1:0;this.animation=gsap.to(this.entrance,{amount:1,duration:reduced?.01:1.05,ease:'power3.out'});}
  }
  impact(rare:boolean,reduced:boolean){this.impactTween?.kill();this.impactState.amount=reduced?0:rare?1:.45;this.impactTween=gsap.to(this.impactState,{amount:0,duration:rare?1.2:.65,ease:'power2.out'});}
  tick(time:number,reduced:boolean,low:boolean){
    if(!this.platform)return;
    this.sky.x=this.width/2+(reduced?0:Math.sin(time*.07)*7);
    this.stars.forEach((s,i)=>{s.visible=!reduced&&(!low||i<6);s.position.set((i*137+41+Math.sin(time*.2+i)*15)%Math.max(1,this.width),(this.height-((time*9+i*57)%this.height)));s.alpha=.24+Math.sin(time+i)*.12;});
    if(!this.active)return;
    const a=this.entrance.amount;this.arena.alpha=a;
    this.platform.y=this.stageBottom-17+(1-a)*55;
    this.glow.alpha=low?.15:.32+this.impactState.amount*.5+(reduced?0:Math.sin(time*.9)*.07);
    this.ring.visible=(a<1||this.impactState.amount>0)&&!reduced;this.ring.scale.set(a<1?.6+a*.8:1.35-this.impactState.amount*.5);this.ring.alpha=Math.max(1-a,this.impactState.amount);
    this.beams.forEach((s,i)=>{s.visible=!low;s.alpha=.35+this.impactState.amount*.6;s.rotation=(i?1:-1)*(.32+(reduced?0:Math.sin(time*.16+i)*.04));});
    this.sockets.forEach((s,i)=>{s.alpha=.5+this.impactState.amount*.5+(reduced?0:Math.sin(time*2+i)*.15);});
  }
  pause(value:boolean){if(value){this.animation?.pause();this.impactTween?.pause();}else{this.animation?.resume();this.impactTween?.resume();}}
  destroy(){this.destroyed=true;this.animation?.kill();this.impactTween?.kill();this.root.destroy({children:true});this.owned.forEach(t=>t.destroy(true));}
}
