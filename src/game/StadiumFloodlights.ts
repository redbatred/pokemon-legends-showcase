import {Container,Sprite,Texture,Graphics} from 'pixi.js';
import {floodlightCue} from './stadiumCues';

/** Beams originate at the painted floodlight banks, with a bright source and feathered cone. */
export class StadiumFloodlights {
 root=new Container();private beams:Sprite[]=[];private sources:Sprite[]=[];private glints=new Graphics();private textures:Texture[]=[];
 private origins=[{x:0,y:0},{x:0,y:0}];private target={x:0,y:0};private width=1;
 constructor(){
  const cone=document.createElement('canvas');cone.width=256;cone.height=512;const c=cone.getContext('2d')!,p=c.createImageData(256,512);
  for(let y=0;y<512;y++)for(let x=0;x<256;x++){const v=y/511,n=Math.abs(x-127.5)/128,spread=.055+v*.945,edge=Math.max(0,1-n/spread),fade=(1-v)**.6,k=(y*256+x)*4;p.data[k]=p.data[k+1]=p.data[k+2]=255;p.data[k+3]=255*edge**1.8*fade;}
  c.putImageData(p,0,0);const beam=Texture.from(cone);this.textures.push(beam);
  const glow=document.createElement('canvas');glow.width=glow.height=128;const gc=glow.getContext('2d')!,gr=gc.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'white');gr.addColorStop(.09,'rgba(255,255,255,.9)');gr.addColorStop(.25,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=gr;gc.fillRect(0,0,128,128);const source=Texture.from(glow);this.textures.push(source);
  for(let i=0;i<2;i++){const b=new Sprite(beam);b.anchor.set(.5,0);b.blendMode='add';const s=new Sprite(source);s.anchor.set(.5);s.blendMode='add';this.root.addChild(b,s);this.beams.push(b);this.sources.push(s);}this.root.addChild(this.glints);this.root.eventMode='none';
 }
 resize(origins:{x:number;y:number}[],x:number,y:number,width:number){this.origins=origins;this.target={x,y};this.width=width;}
 update(time:number,active:number,charge:number,impact:number,travel:number,color:number,reduced:boolean,low:boolean){
  const cue=floodlightCue(active,charge,impact,travel,reduced);this.root.visible=active>.001;const g=this.glints.clear();
  for(let i=0;i<2;i++){
   const o=this.origins[i],side=i?-1:1,sweep=side*(1-cue.focus)*this.width*.19+side*cue.sweep*this.width*.18+(reduced?0:Math.sin(time*.22+i)*this.width*.018*(1-cue.focus));
   const tx=this.target.x+sweep,ty=this.target.y,dx=tx-o.x,dy=ty-o.y,beam=this.beams[i],source=this.sources[i];
   beam.position.set(o.x,o.y);beam.height=Math.hypot(dx,dy)*1.17;beam.width=this.width*(.18-cue.focus*.07);beam.rotation=-Math.atan2(dx,dy);beam.tint=color;beam.alpha=cue.strength*(low?.36:.7);
   source.position.set(o.x,o.y);source.width=this.width*(.055+impact*.022);source.height=source.width*.7;source.tint=color;source.alpha=Math.min(.95,.25+cue.strength);
   const r=this.width*.012*(1+impact*.65),a=cue.strength;g.moveTo(o.x-r*2,o.y).lineTo(o.x+r*2,o.y).stroke({color:0xf2fcff,width:1,alpha:a}).moveTo(o.x,o.y-r*.7).lineTo(o.x,o.y+r*.7).stroke({color:0xf2fcff,width:1,alpha:a*.8});
  }
 }
 destroy(){this.root.destroy({children:true});for(const t of this.textures)t.destroy(true);}
}
