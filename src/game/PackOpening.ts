import {Container,Graphics,MeshPlane,Texture} from 'pixi.js';
import {packSeam,packTearPoint,foilBend,type PackTearState} from './packTearGeometry';

/** The photographed foil stays registered until a local crack releases its curled edge. */
export class PackOpening {
 root=new Container();rear=new Graphics();bodyRoot=new Container();sealRoot=new Container();
 state:PackTearState={tension:0,rip:0,curl:0,open:0,crumple:0};
 private body:MeshPlane;private seal:MeshPlane;private reverse=new Graphics();private rim=new Graphics();private creases=new Graphics();
 constructor(texture:Texture){
  this.seal=this.mesh(texture,'seal',17);this.body=this.mesh(texture,'body',25);
  this.bodyRoot.addChild(this.body,this.rim,this.creases);this.sealRoot.addChild(this.seal,this.reverse);
  this.sealRoot.pivot.set(0,-165);this.sealRoot.position.set(0,-165);
  this.root.addChild(this.rear,this.bodyRoot,this.sealRoot);this.root.eventMode='none';this.update();
 }
 private mesh(texture:Texture,part:'seal'|'body',rows:number){
  const mesh=new MeshPlane({texture,verticesX:49,verticesY:rows});mesh.autoResize=false;const uv=mesh.geometry.getBuffer('aUV');
  for(let y=0;y<rows;y++)for(let x=0;x<49;x++){const u=x/48,v=y/(rows-1),seam=packSeam(u)/421,k=(y*49+x)*2;uv.data[k]=u;uv.data[k+1]=part==='seal'?v*seam:seam+(1-seam)*v;}uv.update();return mesh;
 }
 update(){
  for(const [mesh,part,rows] of [[this.seal,'seal',17],[this.body,'body',25]] as const){const buffer=mesh.geometry.getBuffer('aPosition');for(let y=0;y<rows;y++)for(let x=0;x<49;x++){const p=packTearPoint(part,x/48,y/(rows-1),this.state),k=(y*49+x)*2;buffer.data[k]=p.x;buffer.data[k+1]=p.y;}buffer.update();}
  const s=this.state,g=this.reverse.clear(),rim=this.rim.clear(),creases=this.creases.clear(),rear=this.rear.clear();
  this.rear.position.copyFrom(this.bodyRoot.position);this.rear.rotation=this.bodyRoot.rotation;this.rear.alpha=this.bodyRoot.alpha;
  // Dark cavity is behind the rigid deck; the bowed printed front remains in front of it.
  const back:number[]=[],front:number[]=[];
  for(let i=0;i<=48;i++){const u=i/48,p=packTearPoint('body',u,0,s);back.push(u*230-115,-210.5+packSeam(u)-Math.sin(u*Math.PI)*s.open*7);front.unshift(p.x,p.y);}
  rear.poly([...back,...front]).fill({color:0x091b29,alpha:s.open});
  rear.moveTo(back[0],back[1]);for(let i=2;i<back.length;i+=2)rear.lineTo(back[i],back[i+1]);rear.stroke({color:0xadb9c5,width:2,alpha:s.open*.9});
  for(let x=0;x<48;x++){
   const u=(x+.5)/48;
   for(let y=0;y<16;y++){
    const facing=-Math.cos(foilBend(u,(y+.5)/16,s));if(facing<=0)continue;
    const points=[[x/48,y/16],[(x+1)/48,y/16],[(x+1)/48,(y+1)/16],[x/48,(y+1)/16]].flatMap(([a,b])=>{const p=packTearPoint('seal',a,b,s);return[p.x,p.y];});
    const value=Math.round(132+facing*62+Math.exp(-(((facing-.45)/.13)**2))*42);g.poly(points).fill({color:(value-8)<<16|value<<8|Math.min(255,value+8),alpha:Math.min(1,facing*4)});
   }
  }
  if(s.rip>0){const start=Math.max(0,Math.ceil((1-s.rip)*48));for(let i=start;i<=48;i++){const p=packTearPoint('body',i/48,0,s);i>start?rim.lineTo(p.x,p.y):rim.moveTo(p.x,p.y);}rim.stroke({color:0xf0f4f5,width:1.05,alpha:.88});}
  for(let i=0;i<8;i++){
   const u=.06+i*.126,p=packTearPoint('body',u,0,s),weight=Math.exp(-(((u-(1-s.rip))/.2)**2))*s.tension+s.open*.2;
   creases.moveTo(p.x,p.y+2).quadraticCurveTo(p.x+(i%2?8:-8),p.y+20,p.x+(i%2?-5:4),p.y+49).stroke({color:i%2?0xffffff:0x081520,width:i%2?1.1:1.8,alpha:weight*.2});
  }
 }
 destroy(){this.root.destroy({children:true});}
}
