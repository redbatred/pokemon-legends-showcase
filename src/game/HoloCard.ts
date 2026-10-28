import {Container,PerspectiveMesh,Point,type Texture} from 'pixi.js';
import {gsap} from 'gsap';
import {cardHover} from './cardHover';
import {createFoil} from './foil';
/** Inspector material updates only during pointer movement/settling; a paused game stays paused. */
export class HoloCard extends Container {
 private mesh:PerspectiveMesh;private foil;private pose={x:0,y:0};private tween:gsap.core.Tween|null=null;private elapsed=0;private aimPoint={x:0,y:0};
 constructor(texture:Texture,private widthPx:number,private heightPx:number,private canvas:HTMLCanvasElement,private redraw:()=>void,strength:number,private reduced:boolean){
  super();this.foil=createFoil(strength);this.mesh=new PerspectiveMesh({texture,verticesX:4,verticesY:6});this.mesh.filters=[this.foil];this.addChild(this.mesh);this.updatePose();
  canvas.addEventListener('pointermove',this.move);canvas.addEventListener('pointerleave',this.leave);canvas.addEventListener('pointercancel',this.leave);canvas.addEventListener('pointerup',this.up);
 }
 private move=(event:PointerEvent)=>{if(this.reduced)return;const b=this.canvas.getBoundingClientRect(),logicalW=this.canvas.clientWidth,logicalH=this.canvas.clientHeight,p=this.toLocal(new Point((event.clientX-b.left)*logicalW/b.width,(event.clientY-b.top)*logicalH/b.height)),pose=cardHover(p.x,p.y,this.widthPx,this.heightPx,event.pointerType==='mouse');this.aim(pose.x,pose.y);};
 private up=(event:PointerEvent)=>{if(event.pointerType!=='mouse')this.leave();};
 private leave=()=>this.aim(0,0);
 private aim(x:number,y:number){if(Math.abs(x-this.aimPoint.x)+Math.abs(y-this.aimPoint.y)<.003)return;this.aimPoint={x,y};this.tween?.kill();this.tween=gsap.to(this.pose,{x,y,duration:.32,ease:'power2.out',onUpdate:()=>this.updatePose(),onComplete:()=>{this.tween=null;}});}
 private updatePose(){const w=this.widthPx,h=this.heightPx,yaw=this.pose.x*.17,pitch=-this.pose.y*.13,points:number[]=[];
  for(const [x,y] of [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]]){const depth=-x*Math.sin(yaw)+y*Math.sin(pitch),p=1000/(1000+depth);points.push(x*Math.cos(yaw)*p,y*Math.cos(pitch)*p);}
  this.mesh.setCorners(points[0],points[1],points[2],points[3],points[4],points[5],points[6],points[7]);const u=this.foil.resources.foil.uniforms;u.uTilt=this.pose.x;u.uTiltY=this.pose.y;u.uTime=this.elapsed+=1/60;this.redraw();
 }
 override destroy(){this.tween?.kill();this.canvas.removeEventListener('pointermove',this.move);this.canvas.removeEventListener('pointerleave',this.leave);this.canvas.removeEventListener('pointercancel',this.leave);this.canvas.removeEventListener('pointerup',this.up);this.mesh.filters=[];this.foil.destroy();super.destroy({children:true});}
}
