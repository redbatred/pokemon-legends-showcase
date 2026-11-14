import {Container,Sprite,Texture} from 'pixi.js';
import {money} from './model';
/** The result total as a slot readout. Every glyph is painted once per size into two small textures (ink and fill), so a
 * rolling number only swaps textures and moves sprites: no text is laid out or rasterised while it counts. */
type Glyphs={scale:number;height:number;baseline:number;advance:Record<string,number>;ink:Record<string,Texture>;fill:Record<string,Texture>};
const CHARS='$0123456789,.-',CENTS=.6,MAX_GLYPHS=16,cache=new Map<number,Glyphs>();
const lerp=(a:number,b:number,t:number)=>{let out=0;for(const shift of [16,8,0])out|=Math.round(((a>>shift)&255)*(1-t)+((b>>shift)&255)*t)<<shift;return out;};
function glyphs(size:number):Glyphs{
 const key=Math.round(size);let set=cache.get(key);if(set)return set;
 const advance:Record<string,number>={},ink:Record<string,Texture>={},fill:Record<string,Texture>={};
 // Headless (tests): metrics only.
 const canvas2d=typeof document==='undefined'?null:document.createElement('canvas').getContext?.('2d') as CanvasRenderingContext2D|null;
 if(!canvas2d||typeof canvas2d.measureText!=='function'){for(const char of CHARS){advance[char]=key*(/\d/.test(char)?.56:char==='$'?.5:.24);ink[char]=fill[char]=Texture.EMPTY;}set={scale:1,height:key,baseline:key*.8,advance,ink,fill};cache.set(key,set);return set;}
 const k=2,px=key*k,pad=Math.ceil(px*.16),depth=Math.max(2,Math.round(px*.085)),stroke=Math.max(2,px*.1),font=`400 ${px}px BattleDisplay, Nunito, Arial`,probe=canvas2d;probe.font=font;
 const digit=Math.max(...[...'0123456789'].map(char=>probe.measureText(char).width));
 for(const char of CHARS){
  const width=/\d/.test(char)?digit:probe.measureText(char).width,w=Math.ceil(width+pad*2),h=Math.ceil(px*1.16+pad*2+depth),paint=(draw:(c:CanvasRenderingContext2D,x:number,y:number)=>void)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const c=canvas.getContext('2d')!;c.font=font;c.textAlign='center';c.textBaseline='alphabetic';c.lineJoin='round';draw(c,w/2,pad+px*.92);return Texture.from(canvas);};
  // Ink: an amber edge extruded downward, then the navy outline. Fill: the face alone, white, tinted at draw time.
  ink[char]=paint((c,x,y)=>{c.lineWidth=stroke;c.strokeStyle=c.fillStyle='#b9680e';for(let d=depth;d>0;d--){c.strokeText(char,x,y+d);}c.strokeStyle='#061b32';c.strokeText(char,x,y);});
  fill[char]=paint((c,x,y)=>{c.fillStyle='#fff';c.fillText(char,x,y);});
  advance[char]=width/k;
 }
 set={scale:1/k,height:key*1.16,baseline:(pad+px*.92)/k,advance,ink,fill};cache.set(key,set);return set;
}
type Slot={ink:Sprite;fill:Sprite;shine:Sprite;char:string;changed:number;x:number;small:boolean};
export class ResultDigits extends Container{
 private slots:Slot[]=[];private written='';private set:Glyphs;private now=0;private inkWidth=0;private maxWidth=Infinity;private fitScale=1;private golden=0;private face=0xffffff;private warm:Container|null=null;private warmed=0;
 constructor(private size:number,private cream=0xfff4d6,private gold=0xffd24a){
  // Its own render group with a fixed set of sprites: a rolling number never changes the display list, so the renderer
  // never has to rebuild anything while it counts.
  super({isRenderGroup:true});this.set=glyphs(size);this.eventMode='none';
  const g=this.set,make=(blend:'normal'|'add')=>{const s=new Sprite(Texture.EMPTY);s.scale.set(g.scale);s.blendMode=blend;s.alpha=0;return s;};
  for(let i=0;i<MAX_GLYPHS;i++)this.slots.push({ink:make('normal'),fill:make('normal'),shine:make('add'),char:'',changed:-9,x:0,small:false});
  // Ink first, then every face, then the shine: three batches however long the number is.
  for(const layer of ['ink','fill','shine'] as const)for(const slot of this.slots)this.addChild(slot[layer]);
  // Every glyph is drawn once, unseen, so no texture is first uploaded in the middle of a roll.
  this.warm=new Container();for(const texture of [...Object.values(g.ink),...Object.values(g.fill)]){const s=new Sprite(texture);s.scale.set(.02);s.alpha=.004;this.warm.addChild(s);}this.addChild(this.warm);
 }
 /** The battle face may arrive after the first paint: drop the fallback glyphs and paint again. */
 restyle(){cache.delete(Math.round(this.size));this.set=glyphs(this.size);const text=this.written;this.written='';for(const slot of this.slots)slot.char='';this.write(text);}
 /** Never wider than `width`: the readout scales itself down to fit. */
 fit(width:number){this.maxWidth=width;this.refit();}
 private refit(){this.fitScale=Math.min(1,this.maxWidth/Math.max(1,this.inkWidth));this.scale.set(this.fitScale);}
 /** The colour the faces are drawn in right now. */
 get faceTint(){return this.face;}
 /** Show an amount in cents. Glyphs that changed are marked so they can kick as they roll over. */
 show(cents:number,now=this.now){this.now=now;this.write(money(cents));}
 private write(text:string){
  if(text===this.written)return;this.written=text;const g=this.set,point=text.indexOf('.');let x=0;
  text=text.slice(0,MAX_GLYPHS);this.written=text;
  // Unused places are left in the list, transparent.
  for(let i=text.length;i<MAX_GLYPHS;i++){const slot=this.slots[i];if(slot.char){slot.char='';slot.ink.alpha=slot.fill.alpha=slot.shine.alpha=0;}}
  [...text].forEach((char,i)=>{const slot=this.slots[i],small=point>=0&&i>=point,k=small?CENTS:1,known=char in g.advance?char:'-';
   if(slot.char!==char){slot.char=char;slot.changed=this.now;slot.ink.texture=g.ink[known];slot.fill.texture=slot.shine.texture=g.fill[known];slot.ink.alpha=slot.fill.alpha=1;}
   slot.small=small;slot.x=x;x+=g.advance[known]*k;});
  this.inkWidth=x;this.refit();this.place(this.now,this.golden,0);
 }
 /** Per frame: glyphs that just changed drop in from above, the faces move from cream toward gold, the shine flashes. */
 pose(now:number,gold:number,flash:number){this.golden=gold;this.place(now,gold,flash);if(this.warm&&++this.warmed>2){this.warm.destroy({children:true});this.warm=null;}}
 private place(now:number,gold:number,flash:number){
  this.now=now;const g=this.set,pad=g.height*.14,tint=this.face=lerp(this.cream,this.gold,Math.max(0,Math.min(1,gold))),left=-this.inkWidth/2;
  for(let i=0;i<this.written.length;i++){const slot=this.slots[i],k=slot.small?CENTS:1,age=now-slot.changed,kick=age>=0&&age<.07?(1-age/.07):0,
   x=left+slot.x-pad*k,y=-g.height*.5+g.baseline*(1-k)*.86-kick*g.height*.1*k;
   for(const sprite of [slot.ink,slot.fill,slot.shine]){sprite.scale.set(g.scale*k,g.scale*k*(1+kick*.1));sprite.position.set(x,y);}
   slot.fill.tint=tint;slot.shine.alpha=flash;}
 }
 /** Width of the number as drawn, after fitting. */
 get drawnWidth(){return this.inkWidth*this.fitScale;}
}
