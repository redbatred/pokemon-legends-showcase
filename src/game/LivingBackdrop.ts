import {Container,Graphics,MeshPlane,Sprite,Texture} from 'pixi.js';
import regions from '../../public/assets/stage/living-v3/atlas-regions.json';
import {branchWind,cloudPosition,groundWarp,skyPixels,stadiumRim} from './backdropMotion';
import {StadiumAudience} from './StadiumAudience';
import {clearLightTowers,drawLightTowers} from './lightTowerGeometry';

type Tree={mesh:MeshPlane;base:Float32Array;x:number;y:number;width:number;height:number;seed:number};
type Cloud={sprite:Sprite;start:number;y:number;speed:number;width:number};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
/** Separate painted sky, foliage and stadium layers. Only branches move; masonry never bends. */
export class LivingBackdrop {
 root=new Container();private terrain:MeshPlane;private stadium:MeshPlane;private base:Float32Array;private foliage:Float32Array;
 private trees:Tree[]=[];private clouds:Cloud[]=[];private leaves=new Graphics();private textures:Texture[]=[];
 private previous=-1;private wasReduced=false;private floorShift=0;private width:number;private height:number;
 private audience:StadiumAudience;private baseScale=1;
 constructor(texture:Texture,treeAtlas:Texture,cloudAtlas:Texture,crowd:Texture[]){
  this.width=texture.width;this.height=texture.height;
  const canvas=document.createElement('canvas');canvas.width=this.width;canvas.height=this.height;
  const context=canvas.getContext('2d',{willReadFrequently:true})!;context.drawImage(texture.source.resource as CanvasImageSource,0,0);
  const pixels=context.getImageData(0,0,this.width,this.height),mask=skyPixels(pixels.data,this.width,this.height);
  for(let i=0;i<mask.length;i++)if(mask[i])pixels.data[i*4+3]=0;
  context.putImageData(pixels,0,0);clearLightTowers(context,this.width,this.height);const terrainTexture=Texture.from(canvas);this.textures.push(terrainTexture);
  const skyCanvas=document.createElement('canvas');skyCanvas.width=32;skyCanvas.height=512;const sky=skyCanvas.getContext('2d')!,gradient=sky.createLinearGradient(0,0,0,512);
  gradient.addColorStop(0,'#2585ed');gradient.addColorStop(.4,'#4ca6f6');gradient.addColorStop(1,'#c1e9fc');sky.fillStyle=gradient;sky.fillRect(0,0,32,512);
  const skyTexture=Texture.from(skyCanvas);this.textures.push(skyTexture);const skySprite=new Sprite(skyTexture);skySprite.width=this.width;skySprite.height=this.height*.6;this.root.addChild(skySprite);
  const cloudTextures=this.extract(cloudAtlas,regions.clouds.regions);
  // Two depths travel in the same wind direction. Copies wrap after completely leaving the frame.
  const cloudSlots=[[0,-.18,-.10,.53,4.2],[2,.81,-.07,.50,3.4],[3,.37,.22,.27,1.6],[0,.13,.18,.28,1.7],[1,.60,.19,.32,1.45],[2,1.15,.20,.25,1.65],[1,.36,.065,.25,2.5]];
  for(const [id,x,y,size,speed] of cloudSlots){const sprite=new Sprite(cloudTextures[id]);const width=this.width*size;sprite.width=width;sprite.height=width*cloudTextures[id].height/cloudTextures[id].width;sprite.alpha=id===1&&y<.1?.72:y>.1?.94:1;this.root.addChild(sprite);this.clouds.push({sprite,start:x*this.width,y:y*this.height,speed,width});}
  this.terrain=new MeshPlane({texture:terrainTexture,verticesX:97,verticesY:55});this.terrain.geometry.batchMode='no-batch';this.root.addChild(this.terrain);
  this.base=new Float32Array(this.terrain.geometry.getBuffer('aPosition').data);this.foliage=new Float32Array(this.base.length/2);
  for(let i=0;i<this.foliage.length;i++){const x=Math.min(this.width-1,Math.round(this.base[i*2])),y=Math.min(this.height-1,Math.round(this.base[i*2+1])),k=(y*this.width+x)*4,r=pixels.data[k],g=pixels.data[k+1],b=pixels.data[k+2],v=y/this.height;this.foliage[i]=v>.12&&v<stadiumRim(x/this.width)-.02?clamp((g-r*1.1)/30)*clamp((g-b*.9)/30):0;}
  const treeTextures=this.extract(treeAtlas,regions.trees.regions);
  // Foreground groves are still outside the arena; the original rim and light towers occlude them.
  const slots=[[0,.035,.19],[1,.15,.145],[3,.255,.105],[0,.375,.087],[4,.61,.09],[1,.73,.125],[3,.84,.135],[2,.965,.205]];
  slots.forEach(([id,u,h],i)=>{const tex=treeTextures[id],height=this.height*h,width=height*tex.width/tex.height,mesh=new MeshPlane({texture:tex,verticesX:15,verticesY:13});mesh.geometry.batchMode='no-batch';mesh.scale.set(width/tex.width);const x=this.width*u-width/2,y=this.height*(stadiumRim(u)+.027)-height;mesh.position.set(x,y);this.trees.push({mesh,base:new Float32Array(mesh.geometry.getBuffer('aPosition').data),x,y,width:tex.width,height:tex.height,seed:i*1.73});this.root.addChild(mesh);});
  this.root.addChild(this.leaves);
  const architecture=document.createElement('canvas');architecture.width=this.width;architecture.height=this.height;const a=architecture.getContext('2d')!;
  a.beginPath();a.moveTo(0,this.height);a.lineTo(0,this.height*stadiumRim(0));for(let i=1;i<=120;i++)a.lineTo(this.width*i/120,this.height*stadiumRim(i/120));a.lineTo(this.width,this.height);a.closePath();a.clip();a.drawImage(texture.source.resource as CanvasImageSource,0,0);
  // Clean lamp faces and slender supports sit above the moving tree silhouettes.
  const towers=document.createElement('canvas');towers.width=this.width;towers.height=this.height;const tc=towers.getContext('2d')!;
  drawLightTowers(tc,texture.source.resource as CanvasImageSource,this.width,this.height);
  // Drawing into a fresh combined canvas avoids carrying the rim clip into the tower layer.
  const composite=document.createElement('canvas');composite.width=this.width;composite.height=this.height;const cc=composite.getContext('2d')!;cc.drawImage(architecture,0,0);cc.drawImage(towers,0,0);
  const stadiumTexture=Texture.from(composite);this.textures.push(stadiumTexture);this.stadium=new MeshPlane({texture:stadiumTexture,verticesX:97,verticesY:55});this.stadium.geometry.batchMode='no-batch';this.root.addChild(this.stadium);
  this.audience=new StadiumAudience(crowd,this.width,this.height);this.root.addChild(this.audience.root);this.audience.update(0,-1,false);
  this.root.pivot.set(this.width/2,this.height/2);this.root.eventMode='none';
 }
 private extract(atlas:Texture,parts:{contentBounds:{x:number;y:number;width:number;height:number}}[]){
  return parts.map(({contentBounds:b})=>{const canvas=document.createElement('canvas');canvas.width=b.width;canvas.height=b.height;const c=canvas.getContext('2d',{willReadFrequently:true})!;c.drawImage(atlas.source.resource as CanvasImageSource,b.x,b.y,b.width,b.height,0,0,b.width,b.height);const pixels=c.getImageData(0,0,b.width,b.height);for(let i=3;i<pixels.data.length;i+=4){const alpha=pixels.data[i];pixels.data[i]=alpha*clamp((alpha-28)/48);}c.putImageData(pixels,0,0);const t=Texture.from(canvas);this.textures.push(t);return t;});
 }
 resize(w:number,h:number,floorY?:number){const scale=Math.max(w/this.width,h/this.height)*1.035;this.baseScale=scale;this.root.position.set(w/2,h/2);this.root.scale.set(scale);const ground=h/2+this.height*.18*scale;this.floorShift=floorY===undefined?0:(floorY-ground)/scale;this.audience.warp(this.floorShift);this.wasReduced=false;this.previous=-1;}
 show(visibility:number,celebrationAge:number,travel:number,reduced:boolean,low=false,energy=3){this.audience.update(visibility,celebrationAge,reduced,travel,low,energy);this.root.scale.set(this.baseScale*(1+(reduced?0:travel*.018)));}
 project(u:number,v:number){return {x:this.root.x+(u-.5)*this.width*this.root.scale.x,y:this.root.y+((v-.5)*this.height+this.floorShift*groundWarp(v))*this.root.scale.y};}
 tick(time:number,reduced:boolean,low:boolean){
  if(reduced&&this.wasReduced)return;if(!reduced&&time-this.previous<(low?1/24:1/40))return;this.previous=time;this.wasReduced=reduced;const t=reduced?0:time;
  const terrain=this.terrain.geometry.getBuffer('aPosition'),architecture=this.stadium.geometry.getBuffer('aPosition');
  for(let i=0;i<this.foliage.length;i++){const x=this.base[i*2],y=this.base[i*2+1],wind=reduced?0:branchWind(t,x/this.width,.3,x*.003,80).x*this.foliage[i],yy=y+this.floorShift*groundWarp(y/this.height);terrain.data[i*2]=x+wind;terrain.data[i*2+1]=yy+wind*.12;architecture.data[i*2]=x;architecture.data[i*2+1]=yy;}
  terrain.update();architecture.update();
  for(const cloud of this.clouds){cloud.sprite.x=cloudPosition(t,cloud.start,cloud.speed,this.width,this.width*.52);cloud.sprite.y=cloud.y;}
  for(const tree of this.trees){tree.mesh.position.set(tree.x,tree.y+this.floorShift*groundWarp((tree.y+tree.height*tree.mesh.scale.y)/this.height));const buffer=tree.mesh.geometry.getBuffer('aPosition');for(let i=0;i<tree.base.length;i+=2){const x=tree.base[i],y=tree.base[i+1],p=reduced?{x:0,y:0}:branchWind(t,x/tree.width,y/tree.height,tree.seed,tree.width);buffer.data[i]=x+p.x;buffer.data[i+1]=y+p.y;}buffer.update();}
  const g=this.leaves.clear();if(reduced)return;
  for(let i=0;i<(low?8:18);i++){const cycle=11+i%5,u=((t+i*1.91)%cycle)/cycle,origin=(i*.173)%1,x=this.width*(origin-.035+u*.14),v=stadiumRim(clamp(origin))-.065+u*.045,y=this.height*v+this.floorShift*groundWarp(v)+Math.sin(u*9+i)*7,alpha=Math.sin(Math.PI*u)*.65,r=2.2+i%3,angle=t*(.8+i%3*.15)+i,s=Math.sin(angle),c=Math.cos(angle),flip=Math.cos(angle*1.3)*.65;
   g.moveTo(x-c*r,y-s*r).quadraticCurveTo(x-s*r*flip,y+c*r*flip,x+c*r,y+s*r).quadraticCurveTo(x+s*r*flip,y-c*r*flip,x-c*r,y-s*r).fill({color:[0xa4ce4d,0x69a348,0xc3db66][i%3],alpha});}
 }
 destroy(){this.audience.destroy();this.root.destroy({children:true});for(const texture of this.textures)texture.destroy(true);}
}
