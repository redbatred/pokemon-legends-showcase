import {Container,Sprite,Texture,Rectangle} from 'pixi.js';
import {floodlightCue} from './stadiumCues';
import type {LightSocket} from './floodlightGeometry';
const blendWhite=(color:number,amount:number)=>{const channel=(shift:number)=>Math.round(((color>>shift)&255)*(1-amount)+255*amount);return channel(16)<<16|channel(8)<<8|channel(0);};
/** Each painted bulb has its own hot lens, soft halo and feathered shaft. Shared atlas, no blur filters. */
export class StadiumFloodlights {
 root=new Container();private rays:Sprite[]=[];private halos:Sprite[]=[];private lenses:Sprite[]=[];private bankHalos:Sprite[]=[];private atlas:Texture;private regions:Texture[]=[];
 private sockets:LightSocket[]=[];private target={x:0,y:0};private width=1;
 constructor(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const c=canvas.getContext('2d')!,p=c.createImageData(256,768);
  for(let y=0;y<768;y++)for(let x=0;x<256;x++){
   const v=y/767,n=(x-127.5)/128,spread=.11+(1-Math.exp(-v*2))*.92,edge=Math.exp(-2.2*(n/spread)**2),end=1-Math.max(0,Math.min(1,(v-.65)/.35))**2,falloff=Math.exp(-v*1.2),k=(y*256+x)*4;
   p.data[k]=p.data[k+1]=p.data[k+2]=255;p.data[k+3]=255*edge*end*falloff;
  }c.putImageData(p,0,0);
  const radial=(x:number,y:number,size:number,stops:[number,string][])=>{const r=size/2,g=c.createRadialGradient(x+r,y+r,0,x+r,y+r,r);stops.forEach(([at,color])=>g.addColorStop(at,color));c.fillStyle=g;c.fillRect(x,y,size,size);};
  radial(256,0,256,[[0,'rgba(255,255,255,.9)'],[.12,'rgba(255,255,255,.6)'],[.4,'rgba(255,255,255,.14)'],[1,'rgba(255,255,255,0)']]);
  radial(512,0,64,[[0,'white'],[.38,'rgba(255,255,255,.98)'],[.7,'rgba(255,255,255,.72)'],[1,'rgba(255,255,255,0)']]);
  radial(256,256,512,[[0,'rgba(255,255,255,.2)'],[.38,'rgba(255,255,255,.07)'],[1,'rgba(255,255,255,0)']]);
  this.atlas=Texture.from(canvas);
  const region=(x:number,y:number,w:number,h:number)=>{const texture=new Texture({source:this.atlas.source,frame:new Rectangle(x,y,w,h)});this.regions.push(texture);return texture;};
  const cone=region(0,0,256,768),halo=region(256,0,256,256),lens=region(512,0,64,64),haze=region(256,256,512,512);
  for(let i=0;i<42;i++){const ray=new Sprite(cone);ray.anchor.set(.5,0);ray.blendMode='add';this.rays.push(ray);this.root.addChild(ray);}
  for(let i=0;i<2;i++){const sprite=new Sprite(haze);sprite.anchor.set(.5);sprite.blendMode='add';this.bankHalos.push(sprite);this.root.addChild(sprite);}
  for(let i=0;i<42;i++){const h=new Sprite(halo),l=new Sprite(lens);h.anchor.set(.5);l.anchor.set(.5);h.blendMode=l.blendMode='add';this.halos.push(h);this.lenses.push(l);this.root.addChild(h,l);}this.root.eventMode='none';
 }
 resize(sockets:LightSocket[],x:number,y:number,width:number){this.sockets=sockets;this.target={x,y};this.width=width;}
 update(time:number,active:number,charge:number,impact:number,travel:number,color:number,reduced:boolean,low:boolean){
  const cue=floodlightCue(active,charge,impact,travel,reduced);this.root.visible=active>.001;if(!this.root.visible)return;
  const beamColor=blendWhite(color,.34),lensColor=blendWhite(color,.85);
  this.sockets.forEach((o,i)=>{
   const direction=o.bank?-1:1,sweep=direction*((1-cue.focus)*this.width*.12+cue.sweep*this.width*.16)+(reduced?0:Math.sin(time*.18+o.bank)*this.width*.012*(1-cue.focus));
   const tx=this.target.x+sweep+(o.column-3)*this.width*.006,ty=this.target.y+(o.row-1)*this.width*.004,dx=tx-o.x,dy=ty-o.y;
   const ray=this.rays[i],halo=this.halos[i],lens=this.lenses[i],ignite=charge<0?1:.38+.62*Math.max(0,Math.min(1,charge*1.3-o.row*.13));
   ray.position.set(o.x,o.y);ray.rotation=-Math.atan2(dx,dy);ray.width=Math.max(o.width*4.5,this.width*(.085-cue.focus*.025));ray.height=Math.hypot(dx,dy)*1.25;ray.tint=beamColor;ray.alpha=cue.strength*.085*ignite*(low?.72:1);
   for(const s of [halo,lens]){s.position.set(o.x,o.y);s.rotation=o.rotation;}
   halo.width=o.width*(3.5+impact*.7);halo.height=o.height*(3.3+impact*.7);halo.tint=color;halo.alpha=active*(.2+cue.strength*.62)*ignite;
   lens.width=o.width*1.1;lens.height=o.height*1.1;lens.tint=lensColor;lens.alpha=active*(.32+cue.strength*.64)*ignite;
  });
  for(let bank=0;bank<2;bank++){const first=this.sockets[bank*21],last=this.sockets[bank*21+20];if(!first||!last)continue;const haze=this.bankHalos[bank];haze.position.set((first.x+last.x)/2,(first.y+last.y)/2);haze.width=Math.hypot(first.x-last.x,first.y-last.y)*1.7;haze.height=first.height*8;haze.rotation=(bank?-1:1)*.46;haze.tint=beamColor;haze.alpha=cue.strength*.45;}
 }
 destroy(){this.root.destroy({children:true});for(const t of this.regions)t.destroy(false);this.atlas.destroy(true);}
}
