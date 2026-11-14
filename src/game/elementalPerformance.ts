import {CubicBezierCurve3,PerspectiveCamera,Vector3} from 'three';
import {smooth,winCinemaGeometry} from './winCinemaMotion';
import {winAttackBeats,type CinemaTier} from './winChoreography';
export type ElementalSocket={position:Vector3;direction:Vector3};
export function elementalBeat(age:number,tier:CinemaTier){
 const beat=winAttackBeats(tier).find((b,i)=>i>0&&age>=b.start&&age<b.impact+.95);
 if(!beat)return null;
 const charge=smooth((age-beat.start)/(beat.release-beat.start)),travel=smooth((age-beat.release)/(beat.impact-beat.release));
 return {beat,charge:age<beat.release?charge:0,travel,after:age-beat.impact,tail:smooth((age-beat.impact)/.25),strength:beat.finisher?1.65:1};
}
/** Start tangent is the native nozzle axis. The second control steers clear of the body. */
export function elementalPath(socket:ElementalSocket,camera:PerspectiveCamera,w:number,h:number,age:number,tier:CinemaTier,side:number){
 const g=winCinemaGeometry(w,h,tier==='legendary',age),target=new Vector3(0,1-g.amountY/h*2,.5).unproject(camera).sub(camera.position).normalize().multiplyScalar(3.4).add(camera.position);
 const right=new Vector3().setFromMatrixColumn(camera.matrixWorld,0),up=new Vector3().setFromMatrixColumn(camera.matrixWorld,1);
 const first=socket.position.clone().addScaledVector(socket.direction,1.15);
 const second=target.clone().lerp(first,.34).addScaledVector(right,side*.85).addScaledVector(up,.25);
 return new CubicBezierCurve3(socket.position.clone(),first,second,target);
}
