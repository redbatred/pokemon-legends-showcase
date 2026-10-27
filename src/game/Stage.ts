import { Application, Assets, Container, Graphics, PerspectiveMesh, MeshPlane, Sprite, Texture, Rectangle } from 'pixi.js';
import { gsap } from 'gsap';
import { createFoil } from './foil';
import { playSound } from './audio';
import type { Card } from './model';
import { artworkColor } from './cardColor';
import { CanvasScene } from './CanvasScene';
import { gameLayout, renderResolution, cardTrayLayout } from './rendering';
import { loadPackTexture } from './packTexture';
import type { SpineReveal } from './SpineReveal';

type Options = { reduced: boolean; low: boolean; onTear: () => void; onNext: () => void };
type Particle = { sprite: Graphics; x: number; y: number; speed: number; phase: number; depth: number };
/** The render loop owns all frame state. The controller sends discrete commands and receives completion events. */
export class OpeningStage {
  app = new Application();
  scene = new CanvasScene();
  onLayout: (()=>void) | null = null;
  onCardStored: ((index:number)=>void)|null=null;flightLayer=new Container();private cardColors=new Map<string,number>();
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
  motion = { flip: 0, scale: 1, lift: 0, offsetX: 0, roll: 0, pitch: 0 };
  private back!: Texture;
  private cardEdge = new Graphics();
  private special:SpineReveal|null=null;
  particles: Particle[] = [];
  mode: 'pack' | 'sealed' | 'tearing' | 'card' | 'result' = 'pack';
  time = 0;
  destroyed = false;
  private observer!: ResizeObserver;
  private timeline: gsap.core.Timeline | null = null;
  private tweens = new Set<gsap.core.Tween>();
  private revealToken = 0;
  private packToken = 0;
  private diagnostics = new URLSearchParams(location.search).has('perf');
  private sampleStart = 0;
  private sampleFrames = 0;
  private drawFrame = 0;
  private openingLayout = false;
  private dragProgress = 0;
  private dragStart: number | null = null;
  private resetPointer=()=>{this.target.x=0;this.target.y=0;};
  private tearLine = new Graphics();
  private shadows = new Sprite();
  private packShadow = new Container();
  private stack = new Container();
  private resize = () => {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    this.app.renderer.resolution = renderResolution(w,h,devicePixelRatio,this.options.low);
    this.app.renderer.resize(w, h);
    const layout=gameLayout(w,h,this.openingLayout);
    this.world.position.set(w/2,layout.worldY);this.world.scale.set(layout.scale);
    this.scene.resize(w,h,layout.actionTop+25);
    this.onLayout?.();
    if(this.blocked||this.mode==='result')this.draw();
  };
  private visibility = () => {
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
    this.world.addChild(this.shadows, this.effects, this.stack, this.packShadow, this.pack, this.cardLayer);
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
      const b = this.host.getBoundingClientRect();
      const wrapper=this.mode==='pack'||this.mode==='sealed';
      this.target.x = wrapper?Math.max(-1,Math.min(1,(e.global.x-this.world.x)/(150*this.world.scale.x))):(e.global.x / b.width - .5) * 2;
      this.target.y = wrapper?Math.max(-1,Math.min(1,(e.global.y-this.world.y)/(230*this.world.scale.y))):(e.global.y / b.height - .5) * 2;
      if (this.dragStart !== null && this.mode === 'sealed') {
        const progress = Math.min(1, Math.abs(e.global.x - this.dragStart) / (230 * this.world.scale.x * .72));
        this.dragProgress = progress;
        this.tearLine.clear().moveTo(-115, -168);
        for (let i = 0; i <= Math.floor(progress * 46); i++) this.tearLine.lineTo(-115+i*5, -168+(i%2?1.8:-1.8));
        this.tearLine.stroke({ width: 1.3, color: 0xe7e2d9, alpha: .9 });
        if (progress >= 1) { this.dragStart = null; this.options.onTear(); }
      }
    });
    this.app.stage.on('pointerup', () => { this.dragStart = null; this.dragProgress = 0; this.tearLine.clear(); });
    this.app.stage.on('pointerupoutside', () => { this.dragStart = null; this.dragProgress = 0; this.tearLine.clear(); });
    this.app.canvas.addEventListener('pointerleave',this.resetPointer);
    this.cardLayer.eventMode = 'static'; this.cardLayer.cursor = 'pointer';
    this.cardLayer.on('pointertap', () => {if(!this.blocked)this.options.onNext();});
    for (let i = 3; i >= 0; i--) {
      const s = new Sprite(this.back); s.anchor.set(.5); s.width = 305; s.height = 426; s.y = i * 1.3; s.x = i * .8; s.rotation = (i - 1) * .003; this.stack.addChild(s);
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

  updateOptions(options: Options) { const changed=this.options.low!==options.low,reducing=!this.options.reduced&&options.reduced;this.options=options;if(reducing&&this.special){this.timeline?.progress(1);this.special.update(3);}if(changed&&this.app.renderer)this.resize(); }
  draw(){
    if(this.destroyed||!this.app.renderer||this.app.ticker.started||this.drawFrame)return;
    this.drawFrame=requestAnimationFrame(()=>{this.drawFrame=0;if(!this.destroyed&&!this.app.ticker.started)this.app.renderer.render(this.app.stage);});
  }
  setLayoutMode(opening:boolean){if(opening!==this.openingLayout){this.openingLayout=opening;this.resize();}}
  setBlocked(value:boolean,keepScene=false){
    if(value!==this.blocked){this.sampleStart=0;this.sampleFrames=0;}
    this.blocked=value;this.world.visible=!value||keepScene;this.flightLayer.visible=!value||keepScene;this.scene.pause(value||document.hidden);
    if(value){this.timeline?.pause();for(const t of this.tweens)t.pause();this.app.stop();}
    else if(!document.hidden){if(this.mode!=='result')this.app.start();this.timeline?.resume();for(const t of this.tweens)t.resume();}
    if(this.diagnostics)this.app.canvas.dataset.renderState=value?'paused':'running';
    this.draw();
  }
  getBackTexture(){return this.back;}
  setScene(active:boolean){this.scene.setActive(active,this.options.reduced);}

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
    const yaw = this.tilt.x * (wrapper?.32:.13) + flip;
    const signature=`${yaw.toFixed(4)},${this.tilt.y.toFixed(3)},${extraPitch.toFixed(4)}`;
    if(this.lastProjection.get(mesh)===signature)return;
    this.lastProjection.set(mesh,signature);
    const pitch = -this.tilt.y * (wrapper?.19:.07) + extraPitch;
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
    if(this.diagnostics){
      const now=performance.now();
      if(!this.sampleStart)this.sampleStart=now;
      else if(++this.sampleFrames>=120){this.app.canvas.dataset.renderFps=(1000*this.sampleFrames/(now-this.sampleStart)).toFixed(1);this.app.canvas.dataset.lightTint='#'+this.scene.lightTint.toString(16).padStart(6,'0');this.sampleStart=now;this.sampleFrames=0;}
    }
    this.time += dt;
    if(!this.options.reduced)this.special?.update(dt);
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
      this.cardLayer.y = this.motion.lift + (move ? Math.sin(this.time*.7)*3 : 0);
      this.cardLayer.scale.set(this.motion.scale);
      this.foil.resources.foil.uniforms.uTime = move ? this.time : 0;
      this.foil.resources.foil.uniforms.uTilt = this.tilt.x;
    }
    for (const p of this.particles) {
      p.sprite.visible = move && (!this.options.low || p.depth > .6);
      if (!move) continue;
      p.y -= p.speed * dt;
      if (p.y < -290) p.y = 290;
      p.sprite.position.set(p.x + Math.sin(this.time*.4 + p.phase) * 18 + this.tilt.x * p.depth * 12, p.y);
      p.sprite.alpha = .12 + Math.pow(Math.sin(this.time*.7+p.phase), 2) * .48;
    }
  }

  setSealed() { this.mode = 'sealed'; }
  async tear(): Promise<void> {
    this.mode = 'tearing'; this.dragStart = null; this.dragProgress = 0; this.tearLine.clear();
    this.pack.scale.set(1);
    const texture = this.packMesh.texture;
    const cut = Math.round(texture.height * 45 / 421);
    const topTexture = new Texture({ source: texture.source, frame: new Rectangle(0, 0, texture.width, cut) });
    const bodyTexture = new Texture({ source: texture.source, frame: new Rectangle(0, cut, texture.width, texture.height - cut) });
    const top = new MeshPlane({ texture: topTexture, verticesX: 33, verticesY: 6 });
    const body = new MeshPlane({ texture: bodyTexture, verticesX: 33, verticesY: 24 });
    top.autoResize = false; body.autoResize = false;
    const topGroup = new Container(), bodyGroup = new Container();
    const silver = new Graphics(), cutEdge = new Graphics(), creases = new Graphics(), foldedFoil = new Graphics();
    const innerShadow = new Graphics();
    topGroup.position.set(-115, -210.5); bodyGroup.position.set(-115, -165.5);
    topGroup.addChild(top,foldedFoil); bodyGroup.addChild(silver, body, innerShadow, cutEdge, creases);
    this.packMesh.visible = false; this.pack.addChild(bodyGroup, topGroup);
    this.stack.visible = true; this.stack.scale.set(.66); this.stack.alpha = 0;
    this.stack.position.set(0, 9); this.stack.rotation = this.pack.rotation;
    const state = { tension: 0, rip: 0, curl: 0, open: 0, drop: 0 };
    const topBuffer = top.geometry.getAttribute('aPosition').buffer;
    const bodyBuffer = body.geometry.getAttribute('aPosition').buffer;
    const jag = (i: number) => Math.sin(i*7.7)*1.8 + (i%2?1.2:-1.2);
    const deform = () => {
      for (let y=0; y<6; y++) for (let x=0; x<33; x++) {
        const u=x/32, v=y/5, i=(y*33+x)*2;
        const peeled=Math.max(0, Math.min(1, (state.rip-u)*3));
        const curlAngle=peeled*state.curl*Math.PI*.88;
        topBuffer.data[i]=u*230 + Math.sin(curlAngle)*v*13 - peeled*state.curl*17;
        topBuffer.data[i+1]=v*45*Math.cos(curlAngle) - peeled*(10+state.curl*26) + Math.sin(u*17+v*2)*state.tension*2 + (y===5?jag(x):0)*state.rip;
      }
      topBuffer.update();
      foldedFoil.clear();
      for(let x=0;x<32;x++) {
        const peeled=Math.max(0,Math.min(1,(state.rip-x/32)*3));
        const visibility=Math.max(0,-Math.cos(peeled*state.curl*Math.PI*.88));
        if(visibility>0) {
          const a=x*2,b=(x+1)*2,c=(5*33+x+1)*2,e=(5*33+x)*2;
          foldedFoil.poly([topBuffer.data[a],topBuffer.data[a+1],topBuffer.data[b],topBuffer.data[b+1],topBuffer.data[c],topBuffer.data[c+1],topBuffer.data[e],topBuffer.data[e+1]]).fill({color:x%3===0?0xe0e5e9:0x9da9b5,alpha:visibility*.95});
        }
      }
      const points: number[]=[];
      for (let y=0; y<24; y++) for (let x=0; x<33; x++) {
        const u=x/32, v=y/23, i=(y*33+x)*2;
        const rim=(1-v)**5;
        const ripple=Math.sin(u*22+v*5)*state.tension*(1-v)*2;
        const edgeY=Math.sin(u*Math.PI)*state.open*30+jag(x)*state.rip;
        bodyBuffer.data[i]=u*230+(u-.5)*state.open*18*rim+ripple+Math.sin(v*18+u*3)*state.drop*6;
        bodyBuffer.data[i+1]=v*376+edgeY*rim+Math.sin(u*28)*state.tension*(1-v)*2;
        if (y===0) points.push(bodyBuffer.data[i],bodyBuffer.data[i+1]);
      }
      bodyBuffer.update();
      silver.clear().poly([0,-3,230,-3,...points.slice().reverse().reduce<number[]>((a,_,i,arr)=>{if(i%2===0)a.push(arr[i+1],arr[i]);return a;},[])]).fill({color:0xd3d4d5,alpha:state.open*.8});
      cutEdge.clear(); innerShadow.clear(); creases.clear();
      if(state.rip>0) {
        cutEdge.moveTo(points[0],points[1]);
        for(let x=1;x<=Math.floor(state.rip*32);x++)cutEdge.lineTo(points[x*2],points[x*2+1]);
        cutEdge.stroke({color:0xf3ece5,width:1.2,alpha:.9});
      }
      innerShadow.moveTo(0,0).quadraticCurveTo(115,state.open*48,230,0).stroke({width:4,color:0x08090b,alpha:state.open*.7});
      for(let x=1;x<9;x++) {
        const px=x*26;
        creases.moveTo(px,8+Math.sin(x)*8).quadraticCurveTo(px-7,36,px+Math.sin(x)*11,90).stroke({width:1,color:x%2?0xffffff:0x000000,alpha:state.tension*.12});
      }
    };
    deform();
    return new Promise(resolve => {
      const d = this.options.reduced ? .008 : 1;
      this.timeline = gsap.timeline({ onUpdate: deform, onComplete: () => {
        this.pack.visible=false; this.packShadow.visible=false;
        topGroup.destroy({children:true}); bodyGroup.destroy({children:true});
        topTexture.destroy(false); bodyTexture.destroy(false); resolve();
      }});
      this.timeline.to(state,{tension:1,duration:.24*d,ease:'power2.inOut'},0)
        .to(this.pack,{rotation:.015,duration:.24*d,ease:'power2.out'},0)
        .call(()=>playSound('tear'),[],.2*d)
        .to(state,{rip:.16,curl:.24,duration:.22*d,ease:'power2.in'},.2*d)
        .to(state,{rip:.42,curl:.5,duration:.22*d,ease:'power1.out'},.42*d)
        .to(state,{rip:1,curl:.72,duration:.3*d,ease:'power2.in'},.64*d)
        .to(topGroup,{x:-138,y:-220,rotation:-.08,duration:.5*d,ease:'power1.inOut'},.25*d)
        .to(state,{curl:1,open:1,duration:.36*d,ease:'power2.out'},.76*d)
        .to(topGroup,{x:-180,y:-245,rotation:-.35,duration:.3*d,ease:'power2.out'},.94*d)
        .to(topGroup,{x:-275,y:-75,rotation:-1.3,alpha:0,duration:.65*d,ease:'power2.in'},1.24*d)
        .to(this.stack,{alpha:1,duration:.15*d},.9*d)
        .to(this.stack,{y:-32,rotation:0,duration:.55*d,ease:'power2.out'},.96*d)
        .to(bodyGroup,{y:-115,duration:.4*d,ease:'power2.inOut'},1.04*d)
        .to(state,{drop:1,tension:.4,duration:.6*d},1.25*d)
        .to(bodyGroup,{y:360,x:-85,rotation:.22,alpha:0,duration:.65*d,ease:'power2.in'},1.3*d)
        .to(this.packShadow,{alpha:0,duration:.5*d},1.25*d)
        .to(this.stack.scale,{x:.7,y:.7,duration:.68*d,ease:'power3.out'},1.3*d)
        .to(this.stack,{y:0,duration:.5*d,ease:'power2.inOut'},1.65*d);
      if(this.blocked||document.hidden)this.timeline.pause();
    });
  }

  async reveal(card: Card, first = false, previousIndex=0,pokemonImage:string|null=null): Promise<void> {
    const request = ++this.revealToken;
    const texture = await Assets.load<Texture>(card.image);
    if (this.destroyed || request !== this.revealToken) return;
    let special:SpineReveal|null=null;
    if(pokemonImage&&!this.options.reduced){try{const {SpineReveal}=await import('./SpineReveal');special=await SpineReveal.create(texture,pokemonImage);}catch(error){console.warn('Special reveal artwork unavailable',error);}}
    if(this.destroyed||request!==this.revealToken){special?.destroy();return;}
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
    const next = new PerspectiveMesh({ texture: this.back, verticesX: 4, verticesY: 6 });
    next.filters = []; this.cardMesh = next; this.cardLayer.addChild(next);
    Object.assign(this.motion,{flip:0,scale:first?.7:.96,lift:first?55:8,offsetX:first?35:8,roll:first?-.09:.025,pitch:first?.18:.04});
    next.alpha=0;
    this.foil.resources.foil.uniforms.uStrength=0;
    this.foil.resources.foil.uniforms.uSweep=-.6;
    const turn=first?.72:.3;
    await new Promise<void>(resolve=>{
      this.timeline=gsap.timeline({onComplete:resolve});
      if(departing)this.flyToTray(this.timeline,departing,previousIndex,previousIndex+1,d);
      this.timeline.to(next,{alpha:1,duration:.14*d},first?0:.08*d)
        .to(this.motion,{lift:-17,scale:1.045,offsetX:0,roll:-.015,pitch:0,duration:(first?.73:.36)*d,ease:'power3.out'},0)
        .to(this.stack.scale,{x:.98,y:.98,duration:.7*d,ease:'power3.out'},0)
        .to(this.stack,{x:0,y:5,rotation:0,duration:.7*d,ease:'power3.out'},0)
        .call(()=>playSound('flip'),[],turn*d)
        .to(this.motion,{flip:Math.PI/2,offsetX:10,roll:.015,duration:.28*d,ease:'power2.in'},turn*d)
        .call(()=>{next.texture=texture;next.filters=card.value>=600&&!this.options.low?[this.foil]:[];this.lastProjection.delete(next);this.motion.flip=-Math.PI/2;this.foil.resources.foil.uniforms.uStrength=this.options.low?.05:card.value>=600?.28:.035;const rare=/Illustration|Ultra|Hyper|Special/i.test(card.rarity);playSound(rare?'rare':'reveal');this.scene.setCardColor(color!,this.options.reduced);this.scene.impact(rare,this.options.reduced);this.burst(rare?30:10);},[],(turn+.28)*d)
        .to(this.motion,{flip:0,offsetX:0,lift:-8,roll:0,pitch:0,scale:1,duration:.58*d,ease:'back.out(1.25)'},(turn+.28)*d)
        .to(this.foil.resources.foil.uniforms,{uSweep:.65,duration:.85*d,ease:'sine.inOut'},(turn+.38)*d);
      if(this.blocked||document.hidden)this.timeline.pause();
    });
    if(this.destroyed||request!==this.revealToken){special?.destroy();return;}
    if(this.options.reduced){special?.destroy();special=null;}
    if(special){
      this.special=special;this.stack.visible=false;this.cardLayer.addChild(special.root);
      await new Promise<void>(resolve=>{this.timeline=gsap.timeline({onComplete:resolve});special!.play(this.timeline,-this.world.y/this.world.scale.y-100,()=>{next.visible=false;this.scene.impact(true,this.options.reduced);this.burst(22);});if(this.blocked||document.hidden)this.timeline.pause();});
    }
  }

  private detachCard(){
    const mesh=this.cardMesh;if(!mesh)return null;
    const flight=new Container();flight.position.set(this.world.x+this.cardLayer.x*this.world.scale.x,this.world.y+this.cardLayer.y*this.world.scale.y);flight.scale.set(this.world.scale.x*this.cardLayer.scale.x);flight.rotation=this.cardLayer.rotation;
    if(this.special){flight.addChild(this.special.takeCard());this.special.destroy();this.special=null;mesh.destroy();}
    else{mesh.filters=[];mesh.setCorners(-156,-217.5,156,-217.5,156,217.5,-156,217.5);flight.addChild(mesh);}
    this.flightLayer.addChild(flight);this.cardMesh=null;this.cardEdge.alpha=0;return flight;
  }
  private flyToTray(timeline:gsap.core.Timeline,flight:Container,index:number,activeIndex:number,durationScale:number,at=0,initialize?:()=>void){
    let start={x:flight.x,y:flight.y,scale:flight.scale.x,rotation:flight.rotation};const progress={value:0};
    timeline.to(progress,{value:1,duration:.72*durationScale,ease:'power2.inOut',onStart:()=>{initialize?.();start={x:flight.x,y:flight.y,scale:flight.scale.x,rotation:flight.rotation};},onUpdate:()=>{
      const tray=cardTrayLayout(this.app.screen.width,this.app.screen.height,activeIndex),end=this.cardDestination?.(index)??{...tray.slot(index),cardWidth:tray.cardWidth},t=progress.value;
      const controlX=start.x+(end.x-start.x)*.28,controlY=start.y-32;
      flight.position.set((1-t)*(1-t)*start.x+2*(1-t)*t*controlX+t*t*end.x,(1-t)*(1-t)*start.y+2*(1-t)*t*controlY+t*t*end.y);
      flight.scale.set(start.scale+(end.cardWidth/312-start.scale)*t);flight.rotation=start.rotation*(1-t)+Math.sin(Math.PI*t)*Math.sign(end.x-start.x)*.08;
    },onComplete:()=>{flight.destroy({children:true});this.onCardStored?.(index);}},at);
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
        this.flyToTray(timeline,flight,index,index,duration/.72,at,launch);
        timeline.call(()=>this.onCollectFocus?.(index),[],at+duration);
      });
      timeline.to({}, {duration:.12*d});
      if(this.blocked||document.hidden)timeline.pause();
    });
  }
  async storeCurrent(index:number){
    const flight=this.detachCard();if(!flight)return;
    return new Promise<void>(resolve=>{this.timeline=gsap.timeline({onComplete:resolve});this.flyToTray(this.timeline,flight,index,index,this.options.reduced?.01:1);if(this.blocked||document.hidden)this.timeline.pause();});
  }
  async inspect(card: Card) { this.stack.visible = false; return this.reveal(card, true); }
  showResult() { this.mode = 'result'; this.stack.visible = false; this.cardLayer.visible = false; this.pack.visible = false; this.packShadow.visible = false; this.app.stop(); }
  reset() {
    this.special?.destroy();this.special=null;++this.revealToken;
    this.timeline?.kill(); this.mode = 'pack'; if(!this.blocked)this.app.start(); this.pack.visible = true; this.packMesh.visible = true; this.packShadow.visible = true;
    this.flightLayer.removeChildren().forEach(child=>child.destroy({children:true}));this.cardMesh?.destroy(); this.cardMesh = null; this.cardEdge.alpha=0; this.stack.visible = false; this.cardLayer.visible = false; this.pack.alpha = 1; this.packShadow.alpha = 1; this.pack.scale.set(1); this.dragProgress = 0; this.tearLine.clear();
  }
  private burst(count: number) {
    if (this.options.reduced) return;
    for (let i = 0; i < (this.options.low ? 8 : count); i++) {
      const p = new Graphics().roundRect(-1,-3,2,6,1).fill(i%3 ? 0xa8efff : 0xc4c5ff);
      p.blendMode = 'add'; p.y = -90; this.effects.addChild(p);
      const angle = Math.random()*Math.PI*2, distance = 100+Math.random()*190;
      const tween = gsap.to(p, { x: Math.cos(angle)*distance, y: -80+Math.sin(angle)*distance, alpha: 0, rotation: Math.random()*6, duration: 1+Math.random(), ease: 'power3.out', onComplete: () => { this.tweens.delete(tween); p.destroy(); } });
      this.tweens.add(tween);
    }
  }
  destroy() {
    this.special?.destroy();this.special=null;
    this.destroyed = true;cancelAnimationFrame(this.drawFrame); ++this.revealToken; ++this.packToken; this.timeline?.kill(); this.observer?.disconnect();
    for (const t of this.tweens) t.kill(); this.tweens.clear();
    document.removeEventListener('visibilitychange',this.visibility);
    this.app.canvas?.removeEventListener('pointerleave',this.resetPointer);
    this.scene.destroy();
    if (this.app.renderer) { gsap.killTweensOf(this.pack); this.app.destroy(true, { children: true }); this.back?.destroy(true); this.shadowTexture?.destroy(true); }
  }
}
