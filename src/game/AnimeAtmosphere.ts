import {Container,Graphics,Sprite,Texture} from 'pixi.js';
/** Inked speed lines and dark edge falloff, kept behind the card and Pokémon. */
export class AnimeAtmosphere {
 root=new Container();private vignette:Sprite;private lines=new Graphics();private texture:Texture;private w=1;private h=1;
 constructor(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const c=canvas.getContext('2d')!,gradient=c.createRadialGradient(256,235,70,256,256,340);
  gradient.addColorStop(0,'rgba(2,5,25,0)');gradient.addColorStop(.5,'rgba(2,5,25,.15)');gradient.addColorStop(1,'rgba(2,5,25,.95)');c.fillStyle=gradient;c.fillRect(0,0,512,512);
  this.texture=Texture.from(canvas);this.vignette=new Sprite(this.texture);this.root.addChild(this.vignette,this.lines);this.root.eventMode='none';
 }
 resize(w:number,h:number){this.w=w;this.h=h;this.vignette.width=w;this.vignette.height=h;}
 update(time:number,amount:number,pulse:number,travel:number,color:number,reduced:boolean,low:boolean){
  this.root.visible=amount>.001||travel>.001;if(!this.root.visible)return;
  this.vignette.alpha=Math.max(amount,travel*.65);const g=this.lines.clear();if(reduced)return;
  const cx=this.w/2,cy=this.h*.44,count=low?14:28,diagonal=Math.hypot(this.w,this.h);
  for(let i=0;i<count;i++){
   const a=i/count*Math.PI*2+.018*Math.sin(i*17),s=(time*(travel>0?1.8:.6)+i*.173)%1;
   const inner=diagonal*(.19+s*.08),outer=inner+diagonal*(.12+.12*(i%3)/2),width=(i%4===0?3:1.2)*(1+travel*1.5),alpha=(.055+Math.sin(s*Math.PI)*.13)*amount+pulse*.25+travel*.28;
   const dx=Math.cos(a),dy=Math.sin(a),x=cx+dx*inner,y=cy+dy*inner*.75;
   g.poly([x-dy*width,y+dx*width,cx+dx*outer,cy+dy*outer*.75,x+dy*width,y-dx*width]).fill({color:i%3?color:0xd8edff,alpha});
  }
 }
 destroy(){this.root.destroy({children:true});this.texture.destroy(true);}
}
