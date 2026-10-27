import {Container,MeshPlane,Texture,Rectangle} from 'pixi.js';
import {groundWarp} from './backdropMotion';
import {crowdArrival,crowdPose,standBounds} from './stadiumCues';

/** Two matching painted poses, composited only into seating. Walls/aisles never change. */
export class StadiumAudience {
 root=new Container();private sections:{still:MeshPlane;cheer:MeshPlane;base:Float32Array;x:number;y:number}[]=[];private textures:Texture[]=[];
 constructor(frames:[Texture,Texture],width:number,private height:number){
  const atlases=frames.map(frame=>{
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d')!;
   c.beginPath();for(let i=0;i<=160;i++){const u=i/160,y=standBounds(u).top*height;i?c.lineTo(u*width,y):c.moveTo(0,y);}
   for(let i=160;i>=0;i--){const u=i/160;c.lineTo(u*width,standBounds(u).bottom*height);}c.closePath();c.clip();c.drawImage(frame.source.resource as CanvasImageSource,0,0,width,height);
   // Preserve the six stairways from the original stadium beneath this overlay.
   c.globalCompositeOperation='destination-out';
   for(const [a,b,aa,bb] of [[.135,.151,.153,.174],[.292,.303,.312,.327],[.430,.441,.427,.441],[.559,.570,.559,.573],[.697,.708,.673,.688],[.849,.865,.826,.847]]){
    c.beginPath();c.moveTo(a*width,standBounds(a).top*height-3);c.lineTo(b*width,standBounds(b).top*height-3);c.lineTo(bb*width,standBounds(bb).bottom*height+3);c.lineTo(aa*width,standBounds(aa).bottom*height+3);c.closePath();c.fill();
   }
   const t=Texture.from(canvas);this.textures.push(t);return t;
  });
  for(let i=0;i<8;i++){
   const x=Math.floor(i*width/8),end=Math.floor((i+1)*width/8),y=Math.floor(Math.min(standBounds(i/8).top,standBounds((i+1)/8).top)*height)-2,h=Math.ceil(.61*height)-y;
   const pair=atlases.map(atlas=>{const tex=new Texture({source:atlas.source,frame:new Rectangle(x,y,end-x,h)});this.textures.push(tex);const mesh=new MeshPlane({texture:tex,verticesX:13,verticesY:9});mesh.geometry.batchMode='no-batch';mesh.position.set(x,y);return mesh;});
   pair[1].alpha=0;this.root.addChild(...pair);this.sections.push({still:pair[0],cheer:pair[1],base:new Float32Array(pair[0].geometry.getBuffer('aPosition').data),x,y});
  }
  this.root.eventMode='none';
 }
 warp(floorShift:number){for(const s of this.sections){for(const mesh of [s.still,s.cheer]){const b=mesh.geometry.getBuffer('aPosition');for(let i=0;i<s.base.length;i+=2){b.data[i]=s.base[i];b.data[i+1]=s.base[i+1]+floorShift*groundWarp((s.y+s.base[i+1])/this.height);}b.update();}}}
 update(visibility:number,age:number,reduced:boolean,travel=0){this.root.visible=visibility>.001;this.root.alpha=visibility;for(const [i,s]of this.sections.entries()){const arrival=crowdArrival(travel,i,reduced);s.still.alpha=arrival;s.cheer.alpha=arrival*crowdPose(age,i,reduced);}}
 destroy(){this.root.destroy({children:true});for(const t of this.textures.slice(2))t.destroy(false);for(const t of this.textures.slice(0,2))t.destroy(true);}
}
