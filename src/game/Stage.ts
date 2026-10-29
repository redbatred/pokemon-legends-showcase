import { Application, Assets, Container, Graphics, PerspectiveMesh, Sprite, Texture, Rectangle } from 'pixi.js';
import { gsap } from 'gsap';
import { createFoil,foilStrength } from './foil';
import { playSound,setAudioHidden,stopRevealAudio } from './audio';
import type { Card } from './model';
import { artworkColor } from './cardColor';
import { CardRevealEffects } from './CardRevealEffects';
import { CanvasScene } from './CanvasScene';
import { gameLayout, renderResolution, cardTrayLayout, performanceFloor } from './rendering';
import { loadPackTexture } from './packTexture';
import type { SpineReveal } from './SpineReveal';
import {PackOpening} from './PackOpening';
import {RevealCompletion} from './revealCompletion';
import {revealSuspense} from './revealSuspense';
import {PACK_CLEARANCE_TIME,PACK_TEAR_LIMIT} from './packTearGeometry';
import {cardHover} from './cardHover';
import {crowdLevel} from './crowdReaction';
import {packStackPose,packStackFan,transferStackFront,PACK_EXTRACTION_START,PACK_ARRIVAL_TIME} from './packOpeningMotion';

type Options = { reduced: boolean; turbo?:boolean; low: boolean; onTear: () => void; onNext: () => void };
type Particle = { sprite: Graphics; x: number; y: number; speed: number; phase: number; depth: number };
/** The render loop owns all frame state. The controller sends discrete commands and receives completion events. */
export class OpeningStage {
  app = new Application();
  scene = new CanvasScene();private revealEffects=new CardRevealEffects();
  onLayout: (()=>void) | null = null;
  onCardStored: ((index:number)=>void)|null=null;onSpecialWin:((card:Card,immediate?:boolean)=>void)|null=null;flightLayer=new Container();private cardColors=new Map<string,number>();
  onCollectFocus:((index:number)=>void)|null=null;
  cardDestination:((index:number)=>{x:number;y:number;cardWidth:number})|null=null;
  blocked = false;
  private lastProjection = new WeakMap<PerspectiveMesh,string>();
  private shadowTexture: Texture | null = null;
  world = new Container();
  pack = new Container();
  cardLayer = new Container();
  effects = new Container();
  packMesh!: PerspectiveMesh;
  cardMesh: PerspectiveMesh | null = null;
  foil = createFoil(.65);
  packFoil = createFoil(.18);
  tilt = { x: 0, y: 0 };
  target = { x: 0, y: 0 };
  motion = { flip: 0, scale: 1, lift: 0, offsetX: 0, roll: 0, pitch: 0,hover:1 };
  private back!: Texture;
  private cardEdge = new Graphics();
  private special:SpineReveal|null=null;private charging=false;private disposeSpecialResources:(()=>void)|null=null;
  particles: Particle[] = [];
  mode: 'pack' | 'sealed' | 'tearing' | 'waiting' | 'card' | 'result' = 'pack';
  time = 0;
  destroyed = false;
  private observer!: ResizeObserver;
  private timeline: gsap.core.Timeline | null = null;
  private packOpening:PackOpening|null=null;
  private tweens = new Set<gsap.core.Tween>();
  private revealToken = 0;
  private packToken = 0;
  private diagnostics = new URLSearchParams(location.search).has('perf');
  private sampleStart = 0;
  private sampleFrames = 0;
  private drawFrame = 0;
  private openingLayout = false;private travelling=false;
  private journey:{amount:number}|null=null;
  private prepared:{key:string;cancelled:boolean;promise:Promise<{texture:Texture;special:SpineReveal|null}>}|null=null;
  private previousTease=false;private cardHoverReady=false;private revealCompletion=new RevealCompletion();
  private dragProgress = 0;
  private dragStart: number | null = null;
  private resetPointer=()=>{this.target.x=0;this.target.y=0;};
  private tearLine = new Graphics();
  private shadows = new Sprite();
  private packShadow = new Container();
  private stack = new Container();private openingCard:PerspectiveMesh|null=null;
  private resize = () => {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    this.app.renderer.resolution = renderResolution(w,h,devicePixelRatio,this.options.low);
    this.app.renderer.resize(w, h);
    const layout=gameLayout(w,h,this.openingLayout);
    this.world.position.set(w/2,layout.worldY);this.world.scale.set(layout.scale);this.special?.fitPresentation((w/2-12)/layout.scale);this.special?.setFloor(performanceFloor(layout));this.special?.update(0);
    this.positionJourney();
    this.scene.resize(w,h,layout.stageY,layout);
    this.onLayout?.();
    if(this.blocked||this.mode==='result')this.draw();
  };
  private visibility = () => {
    setAudioHidden(document.hidden);
    this.scene.pause(document.hidden||this.blocked);
    if (document.hidden) { this.app.stop(); this.timeline?.pause(); for (const t of this.tweens) t.pause(); }
    else if (!this.blocked && this.mode !== 'result') { this.sampleStart=0;this.sampleFrames=0;this.app.start(); this.timeline?.resume(); for (const t of this.tweens) t.resume(); }
  };
  constructor(private host: HTMLElement, private options: Options) {}

  async init() {
    // Register the Spine render pipe before Pixi constructs its renderer.
    await import('@esotericsoftware/spine-pixi-v8');
    await this.app.init({ backgroundAlpha: 0, antialias: true, resolution: renderResolution(this.host.clientWidth,this.host.clientHeight,devicePixelRatio,this.options.low), autoDensity: true, preference: 'webgl', powerPreference: 'high-performance' });
    if (this.destroyed) { this.app.destroy(true, { children: true }); return; }
    this.host.appendChild(this.app.canvas);
    this.app.canvas.setAttribute('aria-hidden', 'true');
    this.app.stage.addChild(this.scene.root,this.world);
    this.world.addChild(this.shadows, this.effects, this.stack, this.packShadow, this.pack,this.revealEffects.back,this.cardLayer,this.revealEffects.front);
    this.cardEdge.moveTo(0,-216).lineTo(0,216).stroke({width:1.2,color:0xa8b1c0});
    this.cardEdge.alpha=0;
    this.cardLayer.addChild(this.cardEdge);
    const shadow=document.createElement('canvas');shadow.width=256;shadow.height=64;
    const shadowContext=shadow.getContext('2d')!;const shade=shadowContext.createRadialGradient(128,32,1,128,32,128);
    shade.addColorStop(0,'rgba(0,5,19,.4)');shade.addColorStop(1,'rgba(0,5,19,0)');shadowContext.scale(1,.25);shadowContext.fillStyle=shade;shadowContext.fillRect(0,0,256,256);
    this.shadowTexture=Texture.from(shadow);this.shadows.texture=this.shadowTexture;this.shadows.anchor.set(.5);this.shadows.position.set(0,235);this.shadows.width=340;this.shadows.height=60;
    await this.scene.init();
    const [packTexture, back] = await Promise.all([loadPackTexture('/assets/pack.webp'), Assets.load<Texture>('/assets/card-back.webp')]);
    if (this.destroyed) return;
    // Clip white source-corner pixels once, at native resolution.
    const backCanvas = document.createElement('canvas');
    backCanvas.width = back.width; backCanvas.height = back.height;
    const ctx = backCanvas.getContext('2d')!;
    ctx.beginPath(); ctx.roundRect(0, 0, back.width, back.height, back.width * .052); ctx.clip();
    ctx.drawImage(back.source.resource as CanvasImageSource, 0, 0);
    this.back = Texture.from(backCanvas);
    this.packMesh = new PerspectiveMesh({ texture: packTexture, verticesX: 4, verticesY: 6 });
    // Wrapper highlights are baked into the source; avoid a full filter pass every frame.
    this.packMesh.filters = [];
    this.pack.addChild(this.packMesh);
    this.pack.addChild(this.tearLine);
    this.pack.eventMode = 'static'; this.pack.cursor = 'pointer';
    this.pack.hitArea = new Rectangle(-150, -235, 300, 470);
    this.pack.on('pointerdown', e => { if (!this.blocked && this.mode === 'sealed') { this.dragStart = e.global.x; this.dragProgress = 0; this.target.x = 0; } });
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('globalpointermove', e => {
      if(this.blocked)return;
      const wrapper=this.mode==='pack'||this.mode==='sealed';
      const parent=wrapper?this.pack:this.cardLayer,p=parent.toLocal(e.global),pose=cardHover(p.x,p.y,wrapper?230:312,wrapper?421:435,e.pointerType==='mouse'&&(wrapper||this.cardHoverReady));
      this.target.x=pose.x;this.target.y=pose.y;
      if (this.dragStart !== null && this.mode === 'sealed') {
        const progress = Math.min(1, Math.abs(e.global.x - this.dragStart) / (230 * this.world.scale.x * .72));
        this.dragProgress = progress;
        this.tearLine.clear().moveTo(-115, -168);
        for (let i = 0; i <= Math.floor(progress * 46); i++) this.tearLine.lineTo(-115+i*5, -168+(i%2?1.8:-1.8));
        this.tearLine.stroke({ width: 1.3, color: 0xe7e2d9, alpha: .9 });
        if (progress >= 1) { this.dragStart = null; this.options.onTear(); }
      }
    });
    this.app.stage.on('pointerup', e => {if(e.pointerType!=='mouse')this.resetPointer(); this.dragStart = null; this.dragProgress = 0; this.tearLine.clear(); });
    this.app.stage.on('pointerupoutside', () => { this.dragStart = null; this.dragProgress = 0; this.tearLine.clear(); });
    this.app.canvas.addEventListener('pointerleave',this.resetPointer);this.app.canvas.addEventListener('pointercancel',this.resetPointer);
    this.cardLayer.eventMode = 'static'; this.cardLayer.cursor = 'pointer';this.cardLayer.hitArea=new Rectangle(-166,-227,332,455);
    this.stack.eventMode='static';this.stack.cursor='pointer';this.stack.hitArea=new Rectangle(-166,-227,332,455);this.stack.on('pointertap',()=>{if(!this.blocked&&this.mode==='waiting')this.options.onNext();});
    this.cardLayer.on('pointertap', () => {if(!this.blocked)this.options.onNext();});
    for (let i = 3; i >= 1; i--) {
      const s = new Sprite(this.back); s.anchor.set(.5); s.width = 312; s.height = 435; s.y = i * 1.3; s.x = i * .8; s.rotation = (i - 1) * .003; this.stack.addChild(s);
    }
    this.stack.visible = false;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const depth = Math.random();
      const s = new Graphics().circle(0, 0, depth * 1.5 + .45).fill(i % 4 ? 0xa1e4ff : 0xc0c9ff);
      s.blendMode = 'add'; this.effects.addChild(s);
      this.particles.push({ sprite: s, x: Math.random()*580-290, y: Math.random()*560-280, speed: 4 + depth*12, phase: Math.random()*6.28, depth });
    }
    this.app.ticker.maxFPS = 60;
    this.app.ticker.add(t => this.tick(Math.min(t.deltaMS, 50) / 1000));
    this.observer = new ResizeObserver(this.resize); this.observer.observe(this.host); this.resize();
    document.addEventListener('visibilitychange', this.visibility);
    this.pack.alpha = 0;
    gsap.to(this.pack, { alpha: 1, duration: this.options.reduced ? .01 : .6 });
  }

  updateOptions(options: Options) { const changed=this.options.low!==options.low,reducing=!this.options.reduced&&options.reduced;this.options=options;this.timeline?.timeScale(options.turbo?4:1);if(reducing){this.revealEffects.clear();this.scene.setCharge(null);this.scene.setCinematic(false,true);}if(reducing&&(this.special||this.charging)){this.timeline?.progress(1);this.special?.update(3);this.charging=false;this.scene.setCharge(null);this.scene.setCinematic(false,true);stopRevealAudio();}if(changed&&this.app.renderer)this.resize(); }
  draw(){
    if(this.destroyed||!this.app.renderer||this.app.ticker.started||this.drawFrame)return;
    this.drawFrame=requestAnimationFrame(()=>{this.drawFrame=0;if(!this.destroyed&&!this.app.ticker.started)this.app.renderer.render(this.app.stage);});
  }
  setLayoutMode(opening:boolean){opening=opening||this.travelling;if(opening!==this.openingLayout){this.openingLayout=opening;this.resize();}}
  private positionJourney(){if(!this.journey)return;const w=this.app.screen.width,h=this.app.screen.height,a=gameLayout(w,h,false),b=gameLayout(w,h,true),t=this.journey.amount;this.world.y=a.worldY+(b.worldY-a.worldY)*t;this.world.scale.set(a.scale+(b.scale-a.scale)*t);}
  setBlocked(value:boolean,keepScene=false){
    if(value!==this.blocked){this.sampleStart=0;this.sampleFrames=0;}
    this.blocked=value;this.world.visible=!value||keepScene;this.flightLayer.visible=!value||keepScene;this.scene.pause(value||document.hidden);
    if(value){this.timeline?.pause();for(const t of this.tweens)t.pause();this.app.stop();}
    else if(!document.hidden){if(this.mode!=='result')this.app.start();this.timeline?.resume();for(const t of this.tweens)t.resume();}
    if(this.diagnostics)this.app.canvas.dataset.renderState=value?'paused':'running';
    this.draw();
  }
  getBackTexture(){return this.back;}
  setScene(active:boolean){this.scene.setActive(active||this.travelling,this.options.reduced);}

  async setPack(path: string, accent: string) {
    const request = ++this.packToken;
    const texture = await loadPackTexture(path);
    if (this.destroyed || request !== this.packToken) return;
    this.packMesh.texture = texture;
    this.lastProjection.delete(this.packMesh);
    const color = Number.parseInt(accent.slice(1), 16);
    for (const p of this.particles) p.sprite.tint = color;
  }
  private project(mesh: PerspectiveMesh, w: number, h: number, flip = 0, extraPitch = 0) {
    const wrapper=mesh===this.packMesh;
    const hover=wrapper?1:this.motion.hover;
    const yaw = this.tilt.x * (wrapper?.32:.19)*hover + flip;
    const pitch = -this.tilt.y * (wrapper?.19:.13)*hover + extraPitch;
    const signature=`${yaw.toFixed(4)},${pitch.toFixed(4)}`;
    if(this.lastProjection.get(mesh)===signature)return;
    this.lastProjection.set(mesh,signature);
    const coordinates: number[] = [];
    for (const [x, y] of [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]) {
      const z = -x * Math.sin(yaw) + y * Math.sin(pitch);
      const perspective = 700 / (700 + z);
      coordinates.push(x * Math.cos(yaw) * perspective, y * Math.cos(pitch) * perspective);
    }
    mesh.setCorners(coordinates[0],coordinates[1],coordinates[2],coordinates[3],coordinates[4],coordinates[5],coordinates[6],coordinates[7]);
  }
  private tick(dt: number) {
    if(this.blocked)return;
    this.revealEffects.update(dt);
    if(this.diagnostics){
      const now=performance.now();
      if(!this.sampleStart)this.sampleStart=now;
      else if(++this.sampleFrames>=120){this.app.canvas.dataset.renderFps=(1000*this.sampleFrames/(now-this.sampleStart)).toFixed(1);this.app.canvas.dataset.lightTint='#'+this.scene.lightTint.toString(16).padStart(6,'0');this.sampleStart=now;this.sampleFrames=0;}
    }
    this.time += dt;
    if(!this.options.reduced)this.special?.update(dt*(this.options.turbo?4:1));
    this.scene.tick(this.time,this.options.reduced,this.options.low);
    const move = !this.options.reduced;
    this.tilt.x += ((move ? this.target.x : 0) - this.tilt.x) * Math.min(1, dt * 5);
    this.tilt.y += ((move ? this.target.y : 0) - this.tilt.y) * Math.min(1, dt * 5);
    if ((this.mode === 'pack' || this.mode === 'sealed') && this.packMesh) {
      this.project(this.packMesh, 230, 421);
      this.pack.y = move ? Math.sin(this.time * .8) * 7 - 8 : -8;
      this.pack.rotation = -.055 + this.tilt.x * .045 + this.dragProgress * .045;
      this.pack.scale.set(1 + this.dragProgress*.025, 1-this.dragProgress*.016);
      this.packShadow.x = 17 - this.tilt.x * 15; this.packShadow.y = 10 - this.tilt.y * 10;
      this.packFoil.resources.foil.uniforms.uTilt = this.tilt.x;
      this.packFoil.resources.foil.uniforms.uTime = move ? this.time : 0;
    }
    if (this.cardMesh) {
      this.project(this.cardMesh, 312, 435, this.motion.flip, this.motion.pitch);
      this.cardLayer.x = this.motion.offsetX;
      this.cardLayer.rotation = this.motion.roll;
      const edge = Math.max(0, 1 - Math.abs(Math.cos(this.motion.flip)) * 8);
      this.cardEdge.alpha=edge;
      this.cardLayer.y = this.motion.lift + (move && !this.special ? Math.sin(this.time*.7)*3*this.motion.hover : 0);
      this.cardLayer.scale.set(this.motion.scale);
      const tint=this.scene.lightTint;this.foil.resources.foil.uniforms.uLightColor=[((tint>>16)&255)/255,((tint>>8)&255)/255,(tint&255)/255];this.foil.resources.foil.uniforms.uLightStrength=this.scene.illumination;
      this.foil.resources.foil.uniforms.uTime = move ? this.time : 0;
      this.foil.resources.foil.uniforms.uTilt = this.tilt.x;
      this.foil.resources.foil.uniforms.uTiltY = this.tilt.y;
      this.special?.setCardTilt(this.tilt.x,this.tilt.y);
    }
    for (const p of this.particles) {
      p.sprite.visible = move && (this.mode==='pack'||this.mode==='sealed') && (!this.options.low || p.depth > .6);
      if (!move) continue;
      p.y -= p.speed * dt;
      if (p.y < -290) p.y = 290;
      p.sprite.position.set(p.x + Math.sin(this.time*.4 + p.phase) * 18 + this.tilt.x * p.depth * 12, p.y);
      p.sprite.alpha = .12 + Math.pow(Math.sin(this.time*.7+p.phase), 2) * .48;
    }
  }

  setSealed() { this.mode = 'sealed'; }
  waitForReveal(){this.mode='waiting';this.travelling=false;this.draw();}
  private clearPackOpening(){
    if(!this.packOpening)return;
    if(this.stack.parent!==this.world)this.world.addChildAt(this.stack,2);
    this.packOpening.destroy();this.packOpening=null;
  }
  async tear(): Promise<void> {
    this.clearPackOpening();this.openingCard?.destroy();this.openingCard=new PerspectiveMesh({texture:this.back,verticesX:4,verticesY:6});this.openingCard.setCorners(-156,-217.5,156,-217.5,156,217.5,-156,217.5);this.stack.addChild(this.openingCard);this.mode='tearing';this.dragStart=null;this.dragProgress=0;this.tearLine.clear();
    const opening=new PackOpening(this.packMesh.texture);this.packOpening=opening;opening.root.visible=false;this.pack.addChild(opening.root);
    const projection={yaw:this.tilt.x*.32,pitch:-this.tilt.y*.19};this.target.x=this.target.y=0;
    const align=()=>{const a:number[]=[];for(const [x,y] of [[-115,-210.5],[115,-210.5],[115,210.5],[-115,210.5]]){const depth=700/(700-x*Math.sin(projection.yaw)+y*Math.sin(projection.pitch));a.push(x*Math.cos(projection.yaw)*depth,y*Math.cos(projection.pitch)*depth);}this.packMesh.setCorners(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7]);};
    const s=opening.state,d=this.options.reduced?.008:1,travel={amount:0},transport={time:PACK_EXTRACTION_START};
    return new Promise(resolve=>{
      this.timeline=gsap.timeline({onUpdate:()=>opening.update(),onComplete:()=>{this.pack.visible=false;this.packShadow.visible=false;this.journey=null;this.clearPackOpening();resolve();}});
      this.timeline.to(projection,{yaw:0,pitch:0,duration:.18*d,ease:'power2.out',onUpdate:align},0)
        .to(this.pack,{rotation:0,x:0,y:0,duration:.18*d,ease:'power2.out'},0)
        .to(this.pack.scale,{x:1,y:1,duration:.18*d},0)
        .call(()=>{opening.root.visible=true;this.packMesh.visible=false;this.stack.visible=true;this.stack.alpha=1;this.stack.scale.set(.66);this.stack.position.set(0,9);this.stack.rotation=0;this.fanStack(0);opening.root.addChildAt(this.stack,1);},[],.18*d)
        .to(s,{tension:1,duration:.19*d,ease:'power2.inOut'},.18*d)
        .call(()=>playSound('packrustle'),[],.18*d)
        .call(()=>playSound('packtear'),[],.34*d)
        .to(s,{rip:.06,curl:.15,duration:.1*d,ease:'power3.in'},.34*d)
        .to(s,{rip:.32,curl:.48,pull:.06,duration:.2*d,ease:'power1.out'},.44*d)
        .to(this.pack,{x:-3,rotation:-.014,duration:.20*d,ease:'power2.out'},.44*d)
        .to(s,{rip:.37,tension:1.15,curl:.62,pull:.1,duration:.1*d,ease:'sine.inOut'},.64*d)
        .to(s,{rip:.79,curl:.86,pull:.58,duration:.27*d,ease:'power2.in'},.74*d)
        .to(s,{rip:PACK_TEAR_LIMIT,curl:1,tension:.35,pull:.86,duration:.15*d,ease:'power2.out'},1.01*d)
        .to(this.pack,{x:2,rotation:.008,duration:.12*d,ease:'power2.out'},1.01*d)
        .to(this.pack,{x:0,rotation:0,duration:.20*d,ease:'sine.out'},1.13*d)
        .to(s,{open:1,duration:.25*d,ease:'power2.out'},1.06*d)
        .to(s,{pull:1,duration:.19*d,ease:'power2.out'},1.16*d)
        .call(()=>playSound('packrustle',{gain:.65}),[],1.18*d)
        .to(opening.bodyRoot,{y:230,duration:.54*d,ease:'power2.inOut'},1.22*d)
        .call(()=>{this.world.addChildAt(this.stack,2);this.travelling=true;this.journey=travel;this.openingLayout=true;this.resize();this.scene.arrive(this.options.reduced);playSound('flip',{gain:.38});},[],PACK_CLEARANCE_TIME*d)
        .to(s,{crumple:1,tension:0,duration:.4*d,ease:'power2.out'},PACK_CLEARANCE_TIME*d)
        .to(opening.bodyRoot,{x:35,y:570,rotation:.24,alpha:0,duration:.49*d,ease:'power2.in'},PACK_CLEARANCE_TIME*d)
        .to(this.packShadow,{alpha:0,duration:.38*d},PACK_CLEARANCE_TIME*d)
        .to(transport,{time:PACK_ARRIVAL_TIME,duration:(PACK_ARRIVAL_TIME-PACK_EXTRACTION_START)*d,ease:'none',onUpdate:()=>{const pose=packStackPose(transport.time);travel.amount=pose.camera;this.positionJourney();this.stack.position.set(pose.x,pose.y);this.stack.scale.set(pose.scale);this.stack.rotation=pose.rotation;this.fanStack(transport.time);}},PACK_EXTRACTION_START*d);
      this.timeline.timeScale(this.options.turbo?4:1);if(this.blocked||document.hidden)this.timeline.pause();
    });
  }

  private fanStack(time:number){
    for(let i=0;i<3;i++){const card=this.stack.children[i],pose=packStackFan(time,3-i);card.position.set(pose.x,pose.y);card.rotation=pose.rotation;}
  }
  private discardPrepared(){if(this.prepared){this.prepared.cancelled=true;void this.prepared.promise.then(({special})=>special?.destroy()).catch(()=>{});}this.prepared=null;}
  prepareReveal(card:Card,pokemonImage:string|null){
    const key=card.image+'|'+pokemonImage;if(this.prepared?.key===key)return;
    this.discardPrepared();const entry={key,cancelled:false,promise:null as unknown as Promise<{texture:Texture;special:SpineReveal|null}>};this.prepared=entry;
    entry.promise=(async()=>{const texture=await Assets.load<Texture>(card.image);let special:SpineReveal|null=null;
      if(pokemonImage&&!this.options.reduced&&!this.options.turbo&&!entry.cancelled&&!this.destroyed){try{const {SpineReveal}=await import('./SpineReveal');if(!entry.cancelled&&!this.destroyed){this.disposeSpecialResources=()=>SpineReveal.disposeResources();special=await SpineReveal.create(texture,pokemonImage,this.options.low);}}catch(error){console.warn('Special reveal artwork unavailable',error);}}
      if(entry.cancelled||this.destroyed){special?.destroy();special=null;}return {texture,special};})();
    void entry.promise.catch(()=>{});
  }

  skipReveal(){return this.revealCompletion.request();}

  async reveal(card: Card, first = false, previousIndex=0,pokemonImage:string|null=null,packPrice=1000): Promise<void> {
    this.revealCompletion.begin();this.cardHoverReady=false;this.resetPointer();this.scene.endCelebration();
    const request = ++this.revealToken;
    this.prepareReveal(card,pokemonImage);const prepared=this.prepared!;this.prepared=null;
    const loaded=await prepared.promise,texture=loaded.texture;let special=loaded.special;
    if(this.destroyed||request!==this.revealToken){special?.destroy();return;}
    if(this.options.reduced||this.options.turbo){special?.destroy();special=null;this.scene.setCharge(null);this.scene.setCinematic(false,true);}
    this.travelling=false;this.revealEffects.clear();this.scene.beginReveal(this.options.reduced,crowdLevel(card,packPrice,!!special));
    this.mode = 'card'; this.pack.visible = false; this.packShadow.visible = false;
    this.cardLayer.visible = true;
    const d = this.options.reduced ? .01 : 1;
    const departing=this.detachCard();
    let color=this.cardColors.get(card.image);
    if(color===undefined){
      try{const sample=document.createElement('canvas');sample.width=sample.height=32;const context=sample.getContext('2d',{willReadFrequently:true})!;context.drawImage(texture.source.resource as CanvasImageSource,texture.width*.1,texture.height*.15,texture.width*.8,texture.height*.39,0,0,32,32);color=artworkColor(context.getImageData(0,0,32,32).data);}catch{color=0x8cddff;}
      this.cardColors.set(card.image,color);
      if(this.diagnostics)this.app.canvas.dataset.cardLight='#'+color.toString(16).padStart(6,'0');
    }
    const arriving=first?this.openingCard:null;
    const next = arriving??new PerspectiveMesh({ texture: this.back, verticesX: 4, verticesY: 6 });
    const pose=arriving?transferStackFront(this.stack,this.cardLayer,arriving):{offsetX:first?0:-22,lift:first?0:24,scale:first?.96:.86,roll:first?0:-.065};
    if(arriving)this.openingCard=null;
    next.filters = this.options.low?[]:[this.foil]; this.cardMesh = next; this.cardLayer.addChild(next);
    Object.assign(this.motion,{...pose,flip:0,pitch:first?0:.14,hover:0});
    this.cardLayer.position.set(pose.offsetX,pose.lift);this.cardLayer.scale.set(pose.scale);this.cardLayer.rotation=pose.roll;this.project(next,312,435,0,this.motion.pitch);
    next.alpha=first?1:0;
    this.foil.resources.foil.uniforms.uStrength=0;
    this.foil.resources.foil.uniforms.uSweep=-.6;
    const lead=first?.40:.32,dramatic=!!special,hold=revealSuspense(dramatic,this.options.reduced||!!this.options.turbo,this.previousTease),turn=hold?lead+hold:first?.42:.19,charge={amount:0};this.previousTease=!dramatic&&hold>0;
    await new Promise<void>(resolve=>{
      this.timeline=gsap.timeline({onComplete:resolve});
      if(hold>0){
        this.charging=true;
        this.timeline.call(()=>{this.charging=true;this.scene.setCinematic(dramatic,false);this.scene.setCardColor(dramatic?color!:0x8cddff,false);this.scene.setCharge(0);playSound('suspense',{gain:dramatic?1:.38});},[],lead*d)
          .to(charge,{amount:1,duration:hold*d,ease:'none',onUpdate:()=>{
            const p=charge.amount,phase=p*16+p*p*45,force=.35+p*p*(dramatic?8:3.8);
            this.motion.offsetX=Math.sin(phase*2.1)*force;this.motion.roll=Math.sin(phase)*(.002+p*p*.024);
            this.motion.lift=-19+Math.sin(phase*1.7)*force*.35;this.motion.scale=1.035+p*.025;
            this.scene.setCharge(p*(dramatic?1:.36));this.revealEffects.charge(p*(dramatic?1:.4),dramatic?color!:0x8cddff,this.options.reduced,this.options.low);
          }},lead*d)
          .call(()=>{this.charging=false;this.motion.offsetX=0;this.motion.roll=0;this.motion.lift=-19;},[],turn*d);
      }
      if(departing)this.flyToTray(this.timeline,departing,previousIndex,previousIndex+1,d);
      this.timeline.to(this.motion,{hover:1,duration:.6*d,ease:'sine.inOut'},0).to(next,{alpha:1,duration:.14*d},first?0:.08*d)
        .to(this.motion,{lift:-19,scale:1.035,offsetX:0,roll:-.012,pitch:-.035,duration:(first?.6:.3)*d,ease:'power3.out'},0)
        .to(this.stack.scale,{x:.98,y:.98,duration:.7*d,ease:'power3.out'},0)
        .to(this.stack,{x:0,y:5,rotation:0,duration:.7*d,ease:'power3.out'},0)
        .call(()=>playSound('flip'),[],turn*d)
        .to(this.motion,{flip:Math.PI/2,offsetX:15,roll:.035,duration:.24*d,ease:'power2.in'},turn*d)
        .call(()=>{next.texture=texture;next.filters=this.options.low?[]:[this.foil];this.lastProjection.delete(next);this.motion.flip=-Math.PI/2;this.foil.resources.foil.uniforms.uStrength=foilStrength(card.rarity,card.value)*(this.options.low?.55:1);const rare=/Illustration|Ultra|Hyper|Special/i.test(card.rarity);playSound(dramatic?'slam':rare?'rare':'reveal');this.charging=false;this.revealEffects.fire(color!,rare,this.options.reduced,this.options.low);this.scene.setCardColor(color!,this.options.reduced);this.scene.impact(rare,this.options.reduced);},[],(turn+.24)*d)
        .to(this.motion,{flip:0,offsetX:0,lift:-8,roll:0,pitch:0,scale:1,duration:.43*d,ease:'back.out(1.08)'},(turn+.24)*d)
        .to(this.foil.resources.foil.uniforms,{uSweep:.8,duration:.46*d,ease:'sine.inOut'},(turn+.28)*d)
        .to(this.foil.resources.foil.uniforms,{uSweep:0,duration:.24*d,ease:'sine.out'},(turn+.74)*d);
      this.revealCompletion.bind(this.timeline,()=>{
        stopRevealAudio();this.charging=false;this.scene.setCharge(null);this.revealEffects.clear();this.scene.setCardColor(color!,true);this.scene.setCinematic(false,true);
        next.texture=texture;next.alpha=1;this.lastProjection.delete(next);this.foil.resources.foil.uniforms.uStrength=foilStrength(card.rarity,card.value)*(this.options.low?.55:1);this.foil.resources.foil.uniforms.uSweep=0;
        Object.assign(this.motion,{flip:0,pitch:0,lift:-8,offsetX:0,roll:0,scale:1,hover:1});this.cardLayer.position.set(0,-8);this.cardLayer.scale.set(1);this.cardLayer.rotation=0;this.project(next,312,435);this.cardEdge.alpha=0;
        if(departing&&!departing.destroyed){departing.destroy({children:true});this.onCardStored?.(previousIndex);}
      },resolve);
      this.timeline.timeScale(this.options.turbo?4:1);if(this.blocked||document.hidden)this.timeline.pause();
    });
    if(this.destroyed||request!==this.revealToken){special?.destroy();return;}
    if(this.options.reduced||this.options.turbo){special?.destroy();special=null;this.scene.setCharge(null);this.scene.setCinematic(false,true);}
    if(special){
      this.scene.setCinematic(true,this.options.reduced);this.special=special;special.fitPresentation((this.app.screen.width/2-12)/this.world.scale.x);special.setFloor(performanceFloor(gameLayout(this.app.screen.width,this.app.screen.height,true)));if(!this.options.low)special.setCardFoil(this.foil);this.stack.visible=false;this.cardLayer.addChild(special.root);next.visible=false;
      await new Promise<void>(resolve=>{this.timeline=gsap.timeline({onComplete:resolve});special!.play(this.timeline,-this.world.y/this.world.scale.y-100,()=>{next.visible=false;this.scene.impact(true,this.options.reduced,false);this.revealEffects.fire(color!,true,this.options.reduced,this.options.low);},powerColor=>{this.scene.setCardColor(powerColor,this.options.reduced,.1);this.scene.impact(true,this.options.reduced);},(amount,powerColor)=>{this.scene.setCharge(amount);if(amount<.02)this.scene.setCardColor(powerColor,this.options.reduced,.25);},()=>{if(!this.destroyed&&request===this.revealToken)this.onSpecialWin?.(card);});this.revealCompletion.bind(this.timeline,()=>{special!.finish();this.charging=false;this.scene.setCharge(null);this.revealEffects.clear();this.scene.setCinematic(false,true);this.scene.setCardColor(color!,true);},resolve);this.timeline.timeScale(this.options.turbo?4:1);if(this.blocked||document.hidden)this.timeline.pause();});
      if(!this.destroyed&&request===this.revealToken){this.scene.setCardColor(color!,this.options.reduced);this.scene.setCinematic(false,this.options.reduced);}
    }
    if(!this.destroyed&&request===this.revealToken){this.cardHoverReady=true;if(this.revealCompletion.requested)this.onSpecialWin?.(card,true);this.revealCompletion.end();this.draw();}
  }

  private detachCard(){
    this.scene.endCelebration();
    this.scene.setCinematic(false,this.options.reduced);this.revealEffects.clear();const mesh=this.cardMesh;if(!mesh)return null;
    const flight=new Container();flight.position.set(this.world.x+this.cardLayer.x*this.world.scale.x,this.world.y+this.cardLayer.y*this.world.scale.y);flight.scale.set(this.world.scale.x*this.cardLayer.scale.x);flight.rotation=this.cardLayer.rotation;
    if(this.special){flight.addChild(this.special.takeCard());this.special.destroy();this.special=null;mesh.destroy();}
    else{mesh.filters=[];mesh.setCorners(-156,-217.5,156,-217.5,156,217.5,-156,217.5);flight.addChild(mesh);}
    this.flightLayer.addChild(flight);this.cardMesh=null;this.cardEdge.alpha=0;return flight;
  }
  private flyToTray(timeline:gsap.core.Timeline,flight:Container,index:number,activeIndex:number,durationScale:number,at=0,initialize?:()=>void){
    let start={x:flight.x,y:flight.y,scale:flight.scale.x,rotation:flight.rotation};const progress={value:0};
    timeline.to(progress,{value:1,duration:.62*durationScale,ease:'power2.inOut',onStart:()=>{initialize?.();start={x:flight.x,y:flight.y,scale:flight.scale.x,rotation:flight.rotation};},onUpdate:()=>{
      const tray=cardTrayLayout(this.app.screen.width,this.app.screen.height,activeIndex),end=this.cardDestination?.(index)??{...tray.slot(index),cardWidth:tray.cardWidth},t=progress.value;
      const controlX=start.x+(end.x-start.x)*.28,controlY=start.y-32;
      flight.position.set((1-t)*(1-t)*start.x+2*(1-t)*t*controlX+t*t*end.x,(1-t)*(1-t)*start.y+2*(1-t)*t*controlY+t*t*end.y);
      flight.scale.set(start.scale+(end.cardWidth/312-start.scale)*t);flight.rotation=start.rotation*(1-t)+Math.sin(Math.PI*t)*Math.sign(end.x-start.x)*.08;
    },onComplete:()=>{flight.destroy({children:true});playSound('land');this.onCardStored?.(index);}},at);
  }
  async collectRemaining(cards:Card[],from:number){
    const request=++this.revealToken;
    const textures=await Promise.all(cards.slice(from).map(card=>Assets.load<Texture>(card.image)));
    if(this.destroyed||request!==this.revealToken)return;
    const first=this.detachCard();this.stack.visible=false;
    const d=this.options.reduced?.01:1;
    return new Promise<void>(resolve=>{
      const timeline=gsap.timeline({onComplete:resolve});this.timeline=timeline;
      textures.forEach((texture,offset)=>{
        const index=from+offset,flight=offset===0&&first?first:new Container();
        if(flight!==first){const face=new Sprite(texture);face.anchor.set(.5);face.width=312;face.height=435;flight.addChild(face);this.flightLayer.addChild(flight);}
        flight.visible=false;
        const at=offset*.04*d,duration=(offset===0?.3:.36)*d;
        const launch=()=>{if(flight!==first){flight.position.set(this.world.x+(offset%2?15:-15)*this.world.scale.x,this.world.y);flight.scale.set(this.world.scale.x*.8);flight.rotation=(offset%2?1:-1)*.045;}flight.visible=true;if(offset%2===0)playSound('flip');};
        if(offset>0){flight.alpha=0;timeline.to(flight,{alpha:1,duration:.07*d},at);}
        this.flyToTray(timeline,flight,index,index,duration/.62,at,launch);
        timeline.call(()=>this.onCollectFocus?.(index),[],at+duration);
      });
      timeline.to({}, {duration:.12*d});
      timeline.timeScale(this.options.turbo?4:1);if(this.blocked||document.hidden)timeline.pause();
    });
  }
  async storeCurrent(index:number){
    const flight=this.detachCard();if(!flight)return;
    return new Promise<void>(resolve=>{this.timeline=gsap.timeline({onComplete:resolve});this.flyToTray(this.timeline,flight,index,index,this.options.reduced?.01:1);this.timeline.timeScale(this.options.turbo?4:1);if(this.blocked||document.hidden)this.timeline.pause();});
  }
  async inspect(card: Card) { this.stack.visible = false; return this.reveal(card, true); }
  showResult() { this.mode = 'result'; this.stack.visible = false; this.cardLayer.visible = false; this.pack.visible = false; this.packShadow.visible = false; this.app.stop(); }
  reset() {
    this.revealCompletion.end();this.previousTease=false;
    this.discardPrepared();this.cardHoverReady=false;this.resetPointer();this.openingCard?.destroy();this.openingCard=null;this.travelling=false;this.journey=null;this.scene.endCelebration();this.scene.setCinematic(false,this.options.reduced);
    this.revealEffects.clear();this.charging=false;this.scene.setCharge(null);this.timeline?.kill();this.timeline=null;this.clearPackOpening();stopRevealAudio();
    this.special?.destroy();this.special=null;++this.revealToken;
    this.mode = 'pack'; if(!this.blocked)this.app.start(); this.pack.visible = true; this.packMesh.visible = true; this.packShadow.visible = true;
    this.flightLayer.removeChildren().forEach(child=>child.destroy({children:true}));this.cardMesh?.destroy(); this.cardMesh = null; this.cardEdge.alpha=0; this.stack.visible = false; this.cardLayer.visible = false; this.pack.alpha = 1; this.packShadow.alpha = 1; this.pack.scale.set(1); this.dragProgress = 0; this.tearLine.clear();
  }
  destroy() {
    this.revealCompletion.end();this.previousTease=false;
    this.discardPrepared();this.openingCard?.destroy();this.openingCard=null;
    this.clearPackOpening();this.special?.destroy();this.special=null;this.disposeSpecialResources?.();
    this.destroyed = true;cancelAnimationFrame(this.drawFrame); ++this.revealToken; ++this.packToken; this.timeline?.kill(); this.observer?.disconnect();
    for (const t of this.tweens) t.kill(); this.tweens.clear();
    document.removeEventListener('visibilitychange',this.visibility);
    this.app.canvas?.removeEventListener('pointerleave',this.resetPointer);this.app.canvas?.removeEventListener('pointercancel',this.resetPointer);
    this.scene.destroy();this.revealEffects.destroy();
    if (this.app.renderer) { gsap.killTweensOf(this.pack); this.app.destroy(true, { children: true }); this.back?.destroy(true); this.shadowTexture?.destroy(true); }
  }
}
