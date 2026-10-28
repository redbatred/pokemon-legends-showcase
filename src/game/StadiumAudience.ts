import {Container,MeshPlane,Texture,Rectangle} from 'pixi.js';
import {groundWarp} from './backdropMotion';
import {crowdArrival,crowdFrame,standBounds} from './stadiumCues';

/** Registered held poses, restricted to seats. Only two cels per section render at once. */
export class StadiumAudience {
 root=new Container();private sections:{root:Container;planes:MeshPlane[];frames:Texture[];base:Float32Array;y:number}[]=[];
 private atlases:Texture[]=[];private regions:Texture[]=[];
 constructor(frames:Texture[],width:number,private height:number){
  const cropY=Math.floor(standBounds(0).top*height)-2,cropBottom=Math.ceil(.61*height);
  this.atlases=frames.map(frame=>{
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=cropBottom-cropY;const c=canvas.getContext('2d')!;c.translate(0,-cropY);
   c.beginPath();for(let i=0;i<=160;i++){const u=i/160,y=standBounds(u).top*height;i?c.lineTo(u*width,y):c.moveTo(0,y);}
   for(let i=160;i>=0;i--){const u=i/160;c.lineTo(u*width,standBounds(u).bottom*height);}c.closePath();c.clip();c.drawImage(frame.source.resource as CanvasImageSource,0,0,width,height);
   c.globalCompositeOperation='destination-out';
   for(const [a,b,aa,bb] of [[.135,.151,.153,.174],[.292,.303,.312,.327],[.430,.441,.427,.441],[.559,.570,.559,.573],[.697,.708,.673,.688],[.849,.865,.826,.847]]){
    c.beginPath();c.moveTo(a*width,standBounds(a).top*height-3);c.lineTo(b*width,standBounds(b).top*height-3);c.lineTo(bb*width,standBounds(bb).bottom*height+3);c.lineTo(aa*width,standBounds(aa).bottom*height+3);c.closePath();c.fill();
   }
   return Texture.from(canvas);
  });
  for(let i=0;i<8;i++){
   const x=Math.floor(i*width/8),end=Math.floor((i+1)*width/8),y=Math.floor(Math.min(standBounds(i/8).top,standBounds((i+1)/8).top)*height)-2,h=cropBottom-y;
   const textures=this.atlases.map(atlas=>{const t=new Texture({source:atlas.source,frame:new Rectangle(x,y-cropY,end-x,h)});this.regions.push(t);return t;});
   const root=new Container(),planes=[0,1].map(()=>{const mesh=new MeshPlane({texture:textures[0],verticesX:13,verticesY:9});mesh.geometry.batchMode='no-batch';mesh.position.set(x,y);root.addChild(mesh);return mesh;});
   this.root.addChild(root);this.sections.push({root,planes,frames:textures,base:new Float32Array(planes[0].geometry.getBuffer('aPosition').data),y});
  }
  this.root.eventMode='none';
 }
 warp(floorShift:number){for(const s of this.sections)for(const mesh of s.planes){const b=mesh.geometry.getBuffer('aPosition');for(let i=0;i<s.base.length;i+=2){b.data[i]=s.base[i];b.data[i+1]=s.base[i+1]+floorShift*groundWarp((s.y+s.base[i+1])/this.height);}b.update();}}
 update(visibility:number,age:number,reduced:boolean,travel=0,low=false,energy=3){
  this.root.visible=visibility>.001;this.root.alpha=visibility;if(!this.root.visible)return;
  for(const [i,s] of this.sections.entries()){
   const pose=crowdFrame(age,i,reduced,low,energy),[from,to]=s.planes;s.root.alpha=crowdArrival(travel,i,reduced);
   if(from.texture!==s.frames[pose.from])from.texture=s.frames[pose.from];if(to.texture!==s.frames[pose.to])to.texture=s.frames[pose.to];from.alpha=1;to.alpha=pose.mix;to.visible=pose.mix>.001;
  }
 }
 destroy(){this.root.destroy({children:true});for(const t of this.regions)t.destroy(false);for(const t of this.atlases)t.destroy(true);}
}
