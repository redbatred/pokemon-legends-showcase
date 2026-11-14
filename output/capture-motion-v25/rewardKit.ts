import {Graphics,Text,Texture} from 'pixi.js';
/** One visual system for the reward: the game's ink, cream, Poké Ball red, steel blue and gold, drawn as cel-shaded
 * objects with an ink outline (the receiver tray's language), battle lettering for display text and Nunito for captions. */
export const INK=0x0b1420,CREAM=0xf5ead0,CREAM_SHADE=0xdccba4,RED=0xd9363e,RED_LIGHT=0xf2666a,RED_SHADE=0xa3202c,STEEL=0x44608a,STEEL_SHADE=0x2f4567,STEEL_LIGHT=0x6f8db8,WELL=0x0c1524,RIM=0xa9b4c0,GOLD=0xffc531,GOLD_LIGHT=0xffe58a,GOLD_SHADE=0xb9741a;
export const clamp=(v:number)=>Math.max(0,Math.min(1,v)),smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);},out=(v:number)=>1-(1-clamp(v))**3,mix=(a:number,b:number,p:number)=>a+(b-a)*p;
/** Stable pseudo-random numbers from an index, so every particle is a pure function of the clock. */
export const hash=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export function display(text:string,size:number,fill=0xfff6dc,edge=0x16405e,ink=INK){const t=new Text({text,style:{fontFamily:'BattleDisplay, Nunito, Arial',fontWeight:'400',fontSize:size,fill,letterSpacing:1,stroke:{color:ink,width:Math.max(4,size*.14),join:'round'},dropShadow:{color:edge,alpha:1,blur:0,distance:Math.max(3,size*.1),angle:Math.PI/2}},resolution:2});t.anchor.set(.5);return t;}
export function caption(text:string,size:number,fill=0xdfe9f2,spacing=2.5){const t=new Text({text,style:{fontFamily:'Nunito, Arial',fontWeight:'900',fontSize:size,fill,letterSpacing:spacing},resolution:2});t.anchor.set(.5);return t;}
/** A long plate with angled ends: the price tags and tabs of the main game. Points run clockwise from the top-left shoulder. */
export function lozenge(width:number,height:number,cut=height*.5){const w=width/2,h=height/2;return [-w+cut,-h,w-cut,-h,w,0,w-cut,h,-w+cut,h,-w,0];}
/** A tray silhouette with chamfered corners, like the receiver's. */
export function tray(width:number,height:number,cut=height*.22){const w=width/2,h=height/2;return [-w+cut,-h,w-cut,-h,w,-h+cut,w,h-cut,w-cut,h,-w+cut,h,-w,h-cut,-w,-h+cut];}
/** The part of a lozenge between two heights, inset from its sides: lit bands and lips that follow the plate's own shape. */
export function slice(width:number,height:number,cut:number,y1:number,y2:number,inset=5){
 const w=width/2,h=height/2,half=(y:number)=>Math.max(0,w-cut*Math.min(1,Math.abs(y)/h)-inset),ys=y1<0&&y2>0?[y1,0,y2]:[y1,y2],points:number[]=[];
 for(const y of ys)points.push(half(y),y);for(const y of [...ys].reverse())points.push(-half(y),y);return points;
}
export function fillPoly(g:Graphics,points:number[],fill:number,ink=INK,width=5,alpha=1){g.poly(points).fill({color:fill,alpha});if(width>0)g.poly(points).stroke({color:ink,width,join:'round',alpha});return g;}
/** Evenly spaced points along a closed polygon, for light that runs along an edge. */
export function perimeter(points:number[],step=6){const out:number[]=[],n=points.length/2;for(let i=0;i<n;i++){const ax=points[i*2],ay=points[i*2+1],bx=points[((i+1)%n)*2],by=points[((i+1)%n)*2+1],d=Math.hypot(bx-ax,by-ay),k=Math.max(1,Math.round(d/step));for(let j=0;j<k;j++)out.push(ax+(bx-ax)*j/k,ay+(by-ay)*j/k);}return out;}
/** Stroke the part of a closed outline between two fractions of its length (wrapping), as a travelling highlight. */
export function strokeRun(g:Graphics,path:number[],from:number,to:number,color:number,width:number,alpha=1){const n=path.length/2;if(to<=from||n<2)return;const a=Math.floor(from*n),b=Math.ceil(to*n);g.moveTo(path[((a%n)+n)%n*2],path[((a%n)+n)%n*2+1]);for(let i=a+1;i<=b;i++){const k=((i%n)+n)%n;g.lineTo(path[k*2],path[k*2+1]);}g.stroke({color,width,alpha,cap:'round',join:'round'});}
const made=new Map<string,Texture>();
function canvasTexture(key:string,width:number,height:number,draw:(c:CanvasRenderingContext2D)=>void){let t=made.get(key);if(!t){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;draw(canvas.getContext('2d',{willReadFrequently:true})!);t=Texture.from(canvas);made.set(key,t);}return t;}
/** Soft card-shaped light or shadow: a blurred rounded rectangle, never a disc. */
export const softCard=()=>canvasTexture('soft-card',192,256,c=>{c.filter='blur(22px)';c.fillStyle='#fff';c.beginPath();c.roundRect(40,44,112,168,14);c.fill();});
/** Soft wide bar for plate shadows and the warmth inside the reel window. */
export const softBar=()=>canvasTexture('soft-bar',256,96,c=>{c.filter='blur(16px)';c.fillStyle='#fff';c.beginPath();c.roundRect(36,30,184,36,18);c.fill();});
/** A shaft of light: bright along its axis at the near end, spreading and fading with distance. */
export const shaft=()=>canvasTexture('shaft',128,256,c=>{const g=c.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.35,'rgba(255,255,255,.42)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.filter='blur(7px)';c.beginPath();c.moveTo(48,6);c.lineTo(80,6);c.lineTo(122,250);c.lineTo(6,250);c.closePath();c.fill();});
/** A hairline of light with soft ends, for flares drawn through a point of contact and sweeps across lettering. */
export const hairline=()=>canvasTexture('hairline',256,16,c=>{const g=c.createLinearGradient(0,0,256,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.ellipse(128,8,128,5,0,0,Math.PI*2);c.fill();});
/** Blend two colours channel by channel. */
export function blend(a:number,b:number,p:number){const t=clamp(p);let o=0;for(const shift of [16,8,0])o|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;return o;}
/** The room's own darkness: the cavern stays faintly visible through the middle and falls away toward the edges. */
export const vignette=()=>canvasTexture('vignette',256,256,c=>{const g=c.createRadialGradient(128,116,8,128,128,184);g.addColorStop(0,'rgba(8,20,36,.36)');g.addColorStop(.42,'rgba(7,17,31,.6)');g.addColorStop(1,'rgba(3,8,16,.99)');c.fillStyle=g;c.fillRect(0,0,256,256);});
/** Light held at the borders of the frame, open in the middle. */
export const edgeFrame=()=>canvasTexture('edge-frame',256,256,c=>{const g=c.createRadialGradient(128,128,100,128,128,186);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.14)');g.addColorStop(1,'rgba(255,255,255,.9)');c.fillStyle=g;c.fillRect(0,0,256,256);});
/** A lit floor seen at a low angle: bright along its far edge, boards running to a vanishing point, fading toward the lens and the sides. */
export const floorPlane=()=>canvasTexture('floor',512,160,c=>{
 const g=c.createLinearGradient(0,0,0,160);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.05,'rgba(255,255,255,.5)');g.addColorStop(.22,'rgba(255,255,255,.17)');g.addColorStop(1,'rgba(255,255,255,.02)');c.fillStyle=g;c.fillRect(0,0,512,160);
 c.lineWidth=1.3;for(let i=-10;i<=10;i++){c.strokeStyle='rgba(255,255,255,.2)';c.beginPath();c.moveTo(256+i*13,7);c.lineTo(256+i*104,160);c.stroke();}
 for(const [y,a] of [[20,.22],[40,.15],[74,.1],[124,.06]]){c.strokeStyle=`rgba(255,255,255,${a})`;c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke();}
 c.globalCompositeOperation='destination-in';const m=c.createLinearGradient(0,0,512,0);m.addColorStop(0,'rgba(0,0,0,0)');m.addColorStop(.22,'rgba(0,0,0,1)');m.addColorStop(.78,'rgba(0,0,0,1)');m.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=m;c.fillRect(0,0,512,160);
});
