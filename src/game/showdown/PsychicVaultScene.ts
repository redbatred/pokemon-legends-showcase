import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { gameLayout } from '../rendering';
import type { ArenaBoardState } from '../stadiumDisplayGeometry';
import { psychicVaultGeometry } from './psychicVaultGeometry';
import { PsychicVaultFx } from './PsychicVaultFx';

type Point = [number, number];
type Layout = ReturnType<typeof gameLayout>;
type Glow = { sprite: Sprite; x: number; y: number; size: number; phase: number };

function polygon(c: CanvasRenderingContext2D, points: Point[], fill: string | CanvasGradient, stroke?: string, width = 1) {
  c.beginPath();
  points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.closePath();c.fillStyle = fill;c.fill();
  if (stroke) { c.strokeStyle = stroke;c.lineWidth = width;c.stroke(); }
}
function line(c: CanvasRenderingContext2D, points: Point[], color: string, width = 1) {
  c.beginPath();points.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
  c.strokeStyle = color;c.lineWidth = width;c.stroke();
}
function gradient(c: CanvasRenderingContext2D, x: number, y: number, xx: number, yy: number, stops: [number, string][]) {
  const g = c.createLinearGradient(x, y, xx, yy);
  stops.forEach(([at, color]) => g.addColorStop(at, color));return g;
}
function aura(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string) {
  c.save();c.translate(x, y);c.scale(rx, ry);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);g.addColorStop(0, color);g.addColorStop(1, 'transparent');
  c.fillStyle = g;c.fillRect(-1, -1, 2, 2);c.restore();
}
function arch(x: number, top: number, width: number, bottom: number): Point[] {
  return [[x-width*.5,bottom],[x-width*.5,top+width*.30],[x-width*.36,top+width*.10],
    [x-width*.18,top],[x+width*.18,top],[x+width*.36,top+width*.10],
    [x+width*.5,top+width*.30],[x+width*.5,bottom]];
}
function crystal(c: CanvasRenderingContext2D, x: number, y: number, size: number, tilt = 0) {
  c.save();c.translate(x, y);c.rotate(tilt);
  aura(c, 0, -size*.46, size*.9, size*1.1, 'rgba(136,90,255,.24)');
  polygon(c, [[0,-size],[-size*.22,-size*.62],[-size*.16,-size*.12],[0,0],[size*.23,-size*.30],[size*.18,-size*.78]],
    gradient(c, -size*.2, 0, size*.2, -size, [[0,'#362e65'],[.4,'#8267c2'],[1,'#d7c9ff']]), 'rgba(217,201,255,.65)');
  polygon(c, [[0,-size],[-size*.22,-size*.62],[-size*.16,-size*.12],[0,0],[-size*.025,-size*.62]], '#a88ae3');
  polygon(c, [[0,-size],[size*.18,-size*.78],[size*.23,-size*.30],[0,0],[size*.035,-size*.58]], '#51457d');
  polygon(c, [[0,-size],[-size*.025,-size*.62],[0,0],[size*.035,-size*.58]], '#ded8ff');
  line(c, [[-size*.2,-size*.62],[-size*.025,-size*.62],[size*.18,-size*.78]], '#e3d2ff', .8);
  c.restore();
}

/** Authored architecture painted only on resize; inexpensive sampled light lives in Pixi. */
export class PsychicVaultScene {
  readonly root = new Container();
  private painting = new Sprite(Texture.EMPTY);
  private lights = new Container();
  private machinery: PsychicVaultFx | null = null;
  private currents = new Graphics();
  private motes = new Graphics();
  private seals = new Graphics();
  private artTexture: Texture | null = null;
  private glowTexture: Texture | null = null;
  private glows: Glow[] = [];
  private width = 0;
  private height = 0;
  private geometry: Layout | null = null;
  private active = false;
  private paused = false;
  private dead = false;
  private ready = false;
  private time = 0;
  private lastTime: number | null = null;
  private impactAge = 100;
  private impactStrength = 0;
  private reveal = 0;
  private color = 0xc6afff;
  private guardCount = 3;

  constructor() {
    this.root.eventMode = 'none';this.root.interactiveChildren = false;
    this.root.addChild(this.painting, this.currents, this.lights, this.seals, this.motes);
  }
  async init() {
    if (this.dead || this.ready) return;
    const canvas = document.createElement('canvas');canvas.width = canvas.height = 128;
    const c = canvas.getContext('2d')!;
    aura(c, 64, 64, 64, 64, 'rgba(255,255,255,.72)');
    this.glowTexture = Texture.from(canvas);
    this.machinery = new PsychicVaultFx();this.machinery.root.visible=this.active;this.root.addChildAt(this.machinery.root,2);
    this.ready = true;
    if (this.geometry) this.resize(this.width, this.height, this.height, this.geometry);
  }
  resize(w: number, h: number, _contentHeight: number, layout = gameLayout(w, h, true)) {
    if (this.dead || w <= 0 || h <= 0) return;
    this.width = w;this.height = h;this.geometry = layout;
    if (!this.ready) return;
    const canvas = document.createElement('canvas');
    const resolution = Math.min(2, Math.sqrt(4_200_000 / (w*h)));
    canvas.width = Math.ceil(w*resolution);canvas.height = Math.ceil(h*resolution);
    const c = canvas.getContext('2d')!;c.scale(resolution, resolution);
    this.paint(c, w, h, layout);
    const old = this.artTexture;this.artTexture = Texture.from(canvas);
    this.painting.texture = this.artTexture;this.painting.width = w;this.painting.height = h;old?.destroy(true);
    this.machinery?.resize(w,h,layout);
    this.rebuildLights();this.drawSeals();this.sample(false, false);
  }

  private paint(c: CanvasRenderingContext2D, w: number, h: number, layout: Layout) {
    const cx = w/2, sy = layout.stageY, span = layout.stageWidth;
    const {horizon,room,doorWidth:doorW,doorBottom,doorTop,roomTop,pylonOffset,crystalSize}=psychicVaultGeometry(w,h,layout);
    c.fillStyle = gradient(c, 0, 0, 0, h, [[0,'#080e1c'],[.42,'#20283c'],[.75,'#111a2b'],[1,'#070c15']]);c.fillRect(0, 0, w, h);
    aura(c,cx,doorTop+doorW*.45,room*.84,room*.75,'rgba(103,88,166,.31)');

    // Broad vault walls disappear into shadow at the frame edges. Their perspective
    // terminates at the rear threshold, rather than at the fighters' feet.
    for (const side of [-1,1]) {
      const outer = cx+side*room*.73, inner = cx+side*doorW*.61;
      polygon(c, [[outer,roomTop-room*.16],[inner,doorTop+doorW*.2],[inner,doorBottom],[outer,horizon+room*.20]],
        gradient(c, outer, 0, inner, 0, [[0,'#0b1323'],[.35,'#273249'],[.64,'#3b3d53'],[1,'#172439']]));
      for (let i = 0; i < 4; i++) {
        const t = (i+1)/5, x = inner+(outer-inner)*t;
        const top = doorTop+doorW*.17-t*room*.27, base = doorBottom+t*room*.17;
        const rib = room*(.014+.014*t);
        polygon(c, [[x-side*rib,top],[x+side*rib,top-room*.015],[x+side*rib,base],[x-side*rib,base-room*.012]],
          gradient(c,x-rib,0,x+rib,0,[[0,'#0d1729'],[.36,'#293b50'],[.46,'#807987'],[.55,'#a09a90'],[.63,'#3e4056'],[1,'#161f31']]));
        line(c, [[x-side*rib*.5,top+room*.04],[x-side*rib*.5,base-room*.035]],'rgba(180,155,202,.12)',1);
        for (let j=1;j<5;j++) {
          const y=top+(base-top)*j/5;
          line(c,[[x-side*rib,y],[x+side*rib,y-room*.004]],'#111322',1.5);
        }
      }
      // Recessed observation slit, a physical piece of the chamber wall.
      const wx = cx+side*room*.40, wy = doorTop+doorW*.39;
      polygon(c,[[wx-room*.055,wy],[wx+room*.055,wy],[wx+room*.055,wy+room*.17],[wx-room*.055,wy+room*.17]],'#0b1220','#534762',2);
      c.fillStyle=gradient(c,wx,wy,wx,wy+room*.17,[[0,'#202b45'],[.5,'#3d3b65'],[1,'#111b2c']]);
      c.fillRect(wx-room*.044,wy+room*.01,room*.088,room*.15);
      for(let j=1;j<4;j++) line(c,[[wx-room*.045,wy+room*.04*j],[wx+room*.045,wy+room*.04*j]],'#111523',room*.008);
      line(c,[[wx-side*room*.045,wy+room*.015],[wx-side*room*.045,wy+room*.155]],'rgba(161,182,237,.45)',1.5);
    }

    // Deep routed channels connect the hatch to the suspended crystal sockets.
    for(const side of [-1,1]) {
      const path:Point[]=[[cx+side*doorW*.53,doorTop+doorW*.26],[cx+side*room*.40,doorTop+doorW*.26],
        [cx+side*pylonOffset,horizon-crystalSize*1.9],[cx+side*pylonOffset,horizon-crystalSize*.5]];
      line(c,path,'#070d1a',Math.max(6,room*.018));
      line(c,path,'#54536a',Math.max(4,room*.012));
      line(c,path,'#101b2e',Math.max(2,room*.007));
      line(c,path,'rgba(178,155,232,.5)',Math.max(1,room*.002));
      for(let j=0;j<3;j++){
        const x=cx+side*(doorW*.53+(room*.40-doorW*.53)*(j+.5)/3),y=doorTop+doorW*.26;
        c.fillStyle='#a39787';c.fillRect(x-room*.004,y-room*.010,room*.008,room*.020);
      }
    }

    // Three massive chamfered stone/metal frames give the central seal its depth.
    polygon(c,arch(cx,doorTop-room*.055,doorW+room*.16,doorBottom+room*.022),'#151321','#5d4b68',2);
    polygon(c,arch(cx,doorTop-room*.038,doorW+room*.125,doorBottom+room*.015),
      gradient(c,0,doorTop,0,doorBottom,[[0,'#8e8290'],[.08,'#b4a491'],[.16,'#4a4c63'],[.5,'#303b51'],[.82,'#171f31'],[1,'#565362']]),'#86728e',1);
    polygon(c,arch(cx,doorTop-room*.011,doorW+room*.065,doorBottom+room*.01),'#171526','#282237',3);
    polygon(c,arch(cx,doorTop,doorW+room*.025,doorBottom),
      gradient(c,0,doorTop,0,doorBottom,[[0,'#4c425f'],[.5,'#333047'],[1,'#211e31']]),'#8c749c',1);
    polygon(c,arch(cx,doorTop+room*.015,doorW,doorBottom),'#0e1421','#0a0c17',Math.max(2,room*.009));
    const door = arch(cx,doorTop+room*.027,doorW-room*.025,doorBottom);
    polygon(c,door,gradient(c,cx-doorW*.5,doorTop,cx+doorW*.5,doorBottom,[[0,'#333044'],[.35,'#28273b'],[.52,'#343047'],[1,'#151c2c']]),'#58465f',1);
    c.save();c.beginPath();door.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
    // Paired heavy leaves, inset flutes, bevels, and engraved psychic crest.
    for(const side of [-1,1]) {
      const x=cx+side*doorW*.29;
      polygon(c,[[x-side*doorW*.11,doorTop+doorW*.22],[x+side*doorW*.10,doorTop+doorW*.12],
        [x+side*doorW*.10,doorBottom-room*.04],[x-side*doorW*.11,doorBottom-room*.04]],'#202236','rgba(118,103,143,.24)',1);
      line(c,[[x,doorTop+doorW*.27],[x,doorBottom-room*.07]],'#4f435e',1);
      line(c,[[cx+side*doorW*.13,doorTop+doorW*.23],[cx+side*doorW*.13,doorBottom]],'#100f1e',3);
      for(let i=0;i<5;i++) line(c,[[x-doorW*.055,doorTop+doorW*.42+i*doorW*.065],[x+doorW*.055,doorTop+doorW*.42+i*doorW*.065]],'rgba(124,108,145,.13)',1);
    }
    line(c,[[cx,doorTop],[cx,doorBottom]],'#0a0d17',5);
    line(c,[[cx+.8,doorTop+doorW*.15],[cx+.8,doorBottom]],'rgba(161,137,215,.25)',1);
    // The sealed Poké Ball is a monumental containment hatch, keyed into the door.
    const crestY=doorTop+doorW*.46, radius=doorW*.435;
    c.save();c.translate(cx,crestY);
    c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.fillStyle=gradient(c,-radius,-radius,radius,radius,[[0,'#978d86'],[.12,'#3e4c61'],[.5,'#182338'],[.84,'#4c4d63'],[1,'#b19a7f']]);c.fill();
    c.strokeStyle='#090f1d';c.lineWidth=Math.max(3,room*.008);c.stroke();
    c.beginPath();c.arc(0,0,radius*.87,0,Math.PI*2);c.fillStyle='#080f20';c.fill();c.strokeStyle='#645e76';c.lineWidth=2;c.stroke();
    for(const [start,end,colors] of [[Math.PI,Math.PI*2,['#52516e','#242d48']],[0,Math.PI,['#344760','#151e33']]] as const){
      c.beginPath();c.arc(0,0,radius*.79,start+.035,end-.035);c.closePath();c.fillStyle=gradient(c,0,-radius,0,radius,[[0,colors[0]],[1,colors[1]]]);c.fill();
    }
    // Recessed equator and a ceramic button establish the familiar silhouette.
    line(c,[[-radius*.80,0],[radius*.80,0]],'#070d1b',Math.max(6,doorW*.035));
    line(c,[[-radius*.77,2],[radius*.77,2]],'#a290c0',Math.max(.8,doorW*.003));
    for(const [r,fill,stroke] of [[.24,'#0a1425','#a99b89'],[.18,'#37435c','#807a9a'],[.115,'#bccee0','#e6e1e8']] as const){c.beginPath();c.arc(0,0,radius*r,0,Math.PI*2);c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}
    for(let i=0;i<24;i++){
      const a=i*Math.PI/12,x=Math.cos(a)*radius*.95,y=Math.sin(a)*radius*.95;
      c.save();c.translate(x,y);c.rotate(a);c.fillStyle=i%3===0?'#b7a58c':'#626b7d';c.fillRect(-room*.003,-room*.0015,room*.006,room*.003);c.restore();
    }
    c.restore();c.restore();

    // Individually keyed stones around the lintel keep the architecture tangible.
    for(const side of [-1,1]) for(let i=0;i<5;i++) {
      const yy=doorTop+doorW*.33+i*(doorBottom-doorTop-doorW*.33)/5;
      line(c,[[cx+side*(doorW*.5+room*.02),yy],[cx+side*(doorW*.5+room*.073),yy+room*.008]],'#211e30',2);
      c.fillStyle='#b3a18b';c.beginPath();c.arc(cx+side*(doorW*.5+room*.047),yy+room*.028,Math.max(1,room*.002),0,Math.PI*2);c.fill();
    }
    // A soft overhead shaft ends on the threshold; there are no stadium spotlights.
    polygon(c,[[cx-room*.11,roomTop],[cx+room*.11,roomTop],[cx+room*.34,horizon],[cx-room*.34,horizon]],
      gradient(c,0,roomTop,0,horizon,[[0,'rgba(180,162,224,.08)'],[.6,'rgba(166,147,217,.018)'],[1,'transparent']]));

    // Perspective floor slabs and quiet reflected color below the rear wall.
    polygon(c,[[0,horizon],[w,horizon],[w,h],[0,h]],gradient(c,0,horizon,0,h,[[0,'#171b29'],[.25,'#292b3b'],[.68,'#161c2a'],[1,'#0b111c']]));
    aura(c,cx,horizon+span*.09,span*.52,span*.12,'rgba(126,100,171,.18)');
    for(let i=-7;i<=7;i++) line(c,[[cx+i*room*.09,horizon],[cx+i*room*.33,h]],'rgba(130,126,155,.12)',1);
    for(let i=1;i<7;i++) {
      const yy=horizon+(h-horizon)*(i/7)**1.65;
      line(c,[[0,yy],[w,yy]],'rgba(125,129,157,.10)',1);
    }
    // Threshold steps recede behind the main battle dais.
    for(let i=2;i>=0;i--) polygon(c,[[cx-doorW*.62-i*room*.022,horizon+i*room*.016],
      [cx+doorW*.62+i*room*.022,horizon+i*room*.016],[cx+doorW*.64+i*room*.022,horizon+(i+1)*room*.016],
      [cx-doorW*.64-i*room*.022,horizon+(i+1)*room*.016]],i%2?'#313045':'#40394e','#64566e',.7);

    // Crystal pylons sit on the rear corners, leaving both combatants silhouetted.
    const pylonX=pylonOffset, pylonY=horizon+span*.035;
    for(const side of [-1,1]) {
      const x=cx+side*pylonX, s=crystalSize, base=pylonY;
      aura(c,x,base-s*.85,s*1.25,s*1.8,'rgba(127,94,208,.19)');
      polygon(c,[[x-s*.42,base],[x-s*.28,base-s*.45],[x+s*.28,base-s*.45],[x+s*.42,base]],'#2c2a3f','#6c5e80',1);
      polygon(c,[[x-s*.42,base],[x+s*.42,base],[x+s*.32,base+s*.12],[x-s*.32,base+s*.12]],'#181c2a','#4b445d',1);
      // Open cradles support the animated suspended mineral above them.
      for(const wing of [-1,1]) {
        polygon(c,[[x+wing*s*.24,base-s*.20],[x+wing*s*.41,base-s*.30],[x+wing*s*.44,base-s*.80],[x+wing*s*.32,base-s*.68]],
          gradient(c,x-s*.4,0,x+s*.4,0,[[0,'#77798e'],[.35,'#363d56'],[.70,'#8d8490'],[1,'#282c43']]),'#b0a18f',.8);
        line(c,[[x+wing*s*.38,base-s*.36],[x+wing*s*.40,base-s*.66]],'#bca5f2',1.4);
      }
      crystal(c,x-side*s*.28,base-s*.03,s*.25,-side*.35);
      polygon(c,[[x-s*.33,base-s*.34],[x+s*.33,base-s*.34],[x+s*.27,base-s*.19],[x-s*.27,base-s*.19]],'#45516b','#b2a28e',1);
      line(c,[[x-s*.25,base-s*.23],[x+s*.25,base-s*.23]],'#b6a0d4',1);
      aura(c,x,base+s*.1,s*1.8,s*.29,'rgba(132,111,218,.22)');
    }
    this.paintDeck(c,cx,sy,span,layout.stageFlatten);

    // Deterministic fine grain gives the large painted planes a mineral finish.
    let seed=2791;
    for(let i=0;i<Math.min(17000,w*h/55);i++) {
      seed=(seed*16807)%2147483647;const x=(seed%10000)/10000*w;
      seed=(seed*16807)%2147483647;const y=(seed%10000)/10000*h;
      c.fillStyle=i%2?'rgba(198,181,218,.025)':'rgba(0,0,0,.07)';c.fillRect(x,y,1,1);
    }
    const vignette=c.createRadialGradient(cx,sy*.64,w*.18,cx,sy*.64,Math.max(w*.66,h*.8));
    vignette.addColorStop(0,'transparent');vignette.addColorStop(.6,'rgba(4,7,16,.08)');vignette.addColorStop(1,'rgba(4,7,16,.83)');
    c.fillStyle=vignette;c.fillRect(0,0,w,h);
  }

  private paintDeck(c:CanvasRenderingContext2D,cx:number,y:number,width:number,flatten:number) {
    const rx=width*.48, ry=width*.19*flatten;
    const edge=(scale=1,dy=0):Point[]=>[[-.73,-.72],[.73,-.72],[1,-.23],[1,.30],[.73,.84],[-.73,.84],[-1,.30],[-1,-.23]].map(([x,z])=>[cx+x*rx*scale,y+z*ry*scale+dy]);
    aura(c,cx,y+ry*.8,rx*1.13,ry*.74,'rgba(0,0,0,.75)');
    polygon(c,edge(1.02,ry*.23),'#0d1320','#4e455f',1);
    polygon(c,edge(1.01,ry*.12),gradient(c,0,y,0,y+ry,[[0,'#353249'],[1,'#171c2c']]),'#6a5b79',1);
    polygon(c,edge(),gradient(c,0,y-ry,0,y+ry,[[0,'#4c536b'],[.28,'#363f56'],[.52,'#41475c'],[1,'#202b3f']]),'#b5a38f',1.4);
    polygon(c,edge(.96),gradient(c,cx-rx,y-ry,cx+rx,y+ry,[[0,'#292d41'],[.45,'#37394d'],[1,'#242a3b']]),'#191c2c',2);
    polygon(c,edge(.88),'rgba(69,65,90,.23)','rgba(155,136,180,.24)',1);
    // Hexagonal stone inlays, interrupted by expansion joints, not neon rings.
    const rear=edge(.87),front=edge(.87);
    line(c,[rear[0],front[5]],'rgba(157,141,177,.11)',1);
    line(c,[rear[1],front[4]],'rgba(157,141,177,.11)',1);
    line(c,[[cx-rx*.95,y+ry*.1],[cx+rx*.95,y+ry*.1]],'rgba(16,21,35,.50)',1);
    line(c,[[cx,y-ry*.68],[cx,y+ry*.80]],'rgba(14,20,33,.40)',1);
    for(const side of [-1,1]) {
      line(c,[[cx+side*rx*.76,y+ry*.71],[cx+side*rx*.92,y+ry*.37]],'rgba(173,151,217,.7)',Math.max(1,width*.0013));
      line(c,[[cx+side*rx*.77,y-ry*.59],[cx+side*rx*.92,y-ry*.27]],'rgba(163,177,212,.47)',Math.max(1,width*.001));
      // Flush brass/stone fastening blocks anchor the platform in the world.
      for(let i=0;i<3;i++) {
        const x=cx+side*rx*(.23+i*.16), yy=y+ry*.83;
        polygon(c,[[x-width*.007,yy],[x+width*.007,yy],[x+width*.007,yy+ry*.11],[x-width*.007,yy+ry*.11]],'#78687f','#a28ba5',.5);
      }
    }
    // A worn psychic lozenge is engraved in the floor beneath the reward.
    polygon(c,[[cx,y-ry*.36],[cx+rx*.11,y],[cx,y+ry*.36],[cx-rx*.11,y]],'rgba(71,65,91,.12)','rgba(164,146,189,.23)',1);
    polygon(c,[[cx,y-ry*.24],[cx+rx*.074,y],[cx,y+ry*.24],[cx-rx*.074,y]],'rgba(71,65,91,.10)','rgba(164,146,189,.12)',1);
  }

  private rebuildLights() {
    for(const glow of this.glows) glow.sprite.destroy();this.glows=[];
    if(!this.geometry||!this.glowTexture) return;
    const {stageY:sy,stageWidth:span}=this.geometry;
    const {pylonOffset:pylonX,crystalSize:s}=psychicVaultGeometry(this.width,this.height,this.geometry);
    for(const side of [-1,1]) this.addGlow(this.width/2+side*pylonX,sy-span*.08-s*.9,s*2.6,side);
    this.addGlow(this.width/2,sy-span*.04,span*.70,2);
  }
  private addGlow(x:number,y:number,size:number,phase:number) {
    const sprite=new Sprite(this.glowTexture!);sprite.anchor.set(.5);sprite.position.set(x,y);sprite.width=sprite.height=size;sprite.blendMode='add';
    this.lights.addChild(sprite);this.glows.push({sprite,x,y,size,phase});
  }
  private drawSeals() {
    this.seals.clear();if(!this.geometry) return;
    const w=this.width;
    const {room,doorWidth:doorW,doorTop:top}=psychicVaultGeometry(w,this.height,this.geometry);
    const y=top+doorW*.13;
    for(let i=0;i<3;i++) {
      const x=w/2+(i-1)*room*.035,r=Math.max(2,room*.005),lit=i<this.guardCount;
      this.seals.poly([x,y-r*1.4,x+r,y,x,y+r*1.4,x-r,y]).fill({color:lit?0xd2bcff:0x5c4d72,alpha:lit?.8:.6});
    }
  }
  setBoard(state:ArenaBoardState) {this.guardCount=Math.max(0,Math.min(3,state.index));this.drawSeals();}
  setActive(active:boolean,_reduced:boolean) {this.active=active;this.lights.visible=active;this.motes.visible=active;this.currents.visible=active;if(this.machinery)this.machinery.root.visible=active;}
  pause(value:boolean) {this.paused=value;this.lastTime=null;}
  tick(time:number,reduced:boolean,low:boolean) {
    if(this.dead)return;
    const dt=this.lastTime===null?0:Math.max(0,Math.min(.1,time-this.lastTime));this.lastTime=time;
    if(!this.paused) {this.time+=dt;this.impactAge+=dt;this.reveal=Math.max(0,this.reveal-dt*.8);}
    this.sample(reduced,low);
  }
  private drawCurrents(reduced:boolean,impact:number) {
    this.currents.clear();if(!this.geometry||!this.active)return;
    const g=psychicVaultGeometry(this.width,this.height,this.geometry),cx=this.width/2;
    for(const side of [-1,1]){
      const path:Point[]=[[cx+side*g.doorWidth*.53,g.doorTop+g.doorWidth*.26],[cx+side*g.room*.40,g.doorTop+g.doorWidth*.26],
        [cx+side*g.pylonOffset,g.horizon-g.crystalSize*1.9],[cx+side*g.pylonOffset,g.horizon-g.crystalSize*.5]];
      for(let j=0;j<path.length-1;j++){
        const [a,b]=[path[j],path[j+1]],pulse=reduced?.26:.30+.17*Math.sin(this.time*1.4-j*.8+side);
        this.currents.moveTo(...a).lineTo(...b).stroke({color:0xbca5ef,width:Math.max(1,g.room*.002),alpha:pulse+impact*.3});
        if(!reduced){
          const t=(this.time*.20+j*.32+(side+1)*.2)%1;
          const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
          this.currents.moveTo(x,y).lineTo(x+(b[0]-a[0])*.10,y+(b[1]-a[1])*.10).stroke({color:0xd8d4ff,width:Math.max(1,g.room*.0026),alpha:.6});
        }
      }
    }
  }
  private sample(reduced:boolean,low:boolean) {
    const impact=reduced?0:this.impactStrength*Math.exp(-this.impactAge*4.2);
    this.machinery?.sample(this.time,reduced,impact);
    this.drawCurrents(reduced,impact);
    this.glows.forEach(({sprite,phase,size},i)=>{
      const pulse=reduced?0:Math.sin(this.time*.73+phase)*.016;
      sprite.alpha=i===2?.025+impact*.13:.11+pulse+impact*.17;
      sprite.tint=i===2?this.color:0xb599ff;
      sprite.width=size*(1+impact*.08);sprite.height=i===2?size*.22:size;
    });
    this.painting.tint=this.reveal>0?0xe7e0f5:0xffffff;
    this.motes.clear();if(reduced||!this.active||!this.geometry)return;
    const count=low?10:24,span=this.geometry.stageWidth;
    for(let i=0;i<count;i++) {
      const u=(i*.61803398875)%1,v=(i*.381966+.09*this.time*(.35+(i%3)*.1))%1;
      const x=this.width/2+(u-.5)*Math.min(this.width*.85,span*1.05)+Math.sin(this.time*.3+i)*4;
      const y=this.geometry.stageY-span*.04-v*Math.min(this.height*.5,span*.48);
      const alpha=Math.sin(v*Math.PI)*(.12+(i%4)*.025);
      this.motes.circle(x,y,i%5===0?1.15:.65).fill({color:i%3?0xd2beff:0xb5d8e8,alpha});
    }
  }
  beginReveal(reduced:boolean,_reaction=0) {this.reveal=reduced?0:1;}
  setCardColor(color:number,_reduced:boolean,_duration=.55) {this.color=color;}
  impact(rare:boolean,reduced:boolean,_celebrate=rare) {this.impactAge=0;this.impactStrength=reduced?0:rare?1:.4;this.reveal=0;}
  resetPresentation() {this.impactAge=100;this.impactStrength=0;this.reveal=0;this.color=0xc6afff;this.guardCount=3;this.drawSeals();}
  destroy() {if(this.dead)return;this.dead=true;this.root.destroy({children:true});this.artTexture?.destroy(true);this.glowTexture?.destroy(true);this.glows=[];}
}
