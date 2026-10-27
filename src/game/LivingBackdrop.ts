import { Container,MeshPlane,Sprite,Texture } from 'pixi.js';

const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** Deform only sky and foliage; stadium architecture remains pinned to its source coordinates. */
export class LivingBackdrop {
  root=new Container();private mesh:MeshPlane;private base:Float32Array;private sky:Float32Array;private foliage:Float32Array;
  private rays:Sprite[]=[];private lightTexture:Texture;private previous=-1;private wasReduced=false;
  constructor(texture:Texture){
    this.mesh=new MeshPlane({texture,verticesX:97,verticesY:55});this.mesh.geometry.batchMode='no-batch';this.root.addChild(this.mesh);
    this.base=new Float32Array(this.mesh.geometry.getBuffer('aPosition').data);const count=this.base.length/2;this.sky=new Float32Array(count);this.foliage=new Float32Array(count);
    const sample=document.createElement('canvas');sample.width=194;sample.height=110;const context=sample.getContext('2d',{willReadFrequently:true})!;context.drawImage(texture.source.resource as CanvasImageSource,0,0,sample.width,sample.height);const pixels=context.getImageData(0,0,sample.width,sample.height).data;
    for(let i=0;i<count;i++){
      const u=this.base[i*2]/texture.width,v=this.base[i*2+1]/texture.height,skyline=.10+.22*Math.sin(Math.PI*u),rim=.25+.22*Math.sin(Math.PI*u);
      const edge=clamp(u/.055)*clamp((1-u)/.055);
      this.sky[i]=clamp((skyline-v)/.08)*edge;
      const x=Math.min(193,Math.round(u*193)),y=Math.min(109,Math.round(v*109));let green=0;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const k=(Math.max(0,Math.min(109,y+dy))*194+Math.max(0,Math.min(193,x+dx)))*4,r=pixels[k],g=pixels[k+1],b=pixels[k+2];green+=clamp((g-r*1.12)/22)*clamp((g-b*.87)/25);}
      this.foliage[i]=v>.12&&v<rim-.014?green/9*clamp((rim-v)/.07)*edge:0;
    }
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=512;const c=canvas.getContext('2d')!;
    const g=c.createLinearGradient(0,0,0,512);g.addColorStop(0,'rgba(255,255,255,.04)');g.addColorStop(.16,'rgba(255,255,255,.2)');g.addColorStop(.6,'rgba(255,255,255,.06)');g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(0,0,128,512);
    c.globalCompositeOperation='destination-in';const edge=c.createLinearGradient(0,0,128,0);edge.addColorStop(0,'transparent');edge.addColorStop(.45,'white');edge.addColorStop(.55,'white');edge.addColorStop(1,'transparent');c.fillStyle=edge;c.fillRect(0,0,128,512);this.lightTexture=Texture.from(canvas);
    for(let i=0;i<3;i++){const ray=new Sprite(this.lightTexture);ray.anchor.set(.5,0);ray.position.set(texture.width*(.83+i*.04),-texture.height*.12);ray.width=texture.width*(i===1?.055:.12);ray.height=texture.height*.61;ray.rotation=.35+i*.075;ray.blendMode='add';ray.alpha=.13;this.rays.push(ray);this.root.addChild(ray);}
    this.root.pivot.set(texture.width/2,texture.height/2);
  }
  resize(w:number,h:number){this.root.position.set(w/2,h/2);this.root.scale.set(Math.max(w/this.mesh.texture.width,h/this.mesh.texture.height)*1.035);}
  tick(time:number,reduced:boolean,low:boolean){
    this.rays.forEach(ray=>{ray.visible=!low;});
    if(reduced&&this.wasReduced)return;
    if(!reduced&&time-this.previous<(low?1/24:1/40))return;
    this.previous=time;this.wasReduced=reduced;
    const buffer=this.mesh.geometry.getBuffer('aPosition'),vertices=buffer.data,t=reduced?0:time,cloudDrift=Math.sin(t*.045)*28+Math.sin(t*.019)*12;
    for(let i=0;i<this.sky.length;i++){
      const x=this.base[i*2],y=this.base[i*2+1],wind=reduced?0:Math.sin(t*1.15+x*.013)*2.5+Math.sin(t*.63+y*.018)*1.1;
      vertices[i*2]=x+this.sky[i]*cloudDrift+this.foliage[i]*wind;
      vertices[i*2+1]=y+this.sky[i]*Math.sin(t*.035)*2.8+this.foliage[i]*wind*.2;
    }
    buffer.update();
    this.rays.forEach((ray,i)=>{ray.visible=!low;ray.alpha=reduced?.12:.12+Math.sin(time*.16+i)*.045;ray.rotation=.35+i*.075+(reduced?0:Math.sin(time*.04+i)*.009);});
  }
  destroy(){this.root.destroy({children:true});this.lightTexture.destroy(true);}
}
