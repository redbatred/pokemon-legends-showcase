import type {Object3D} from 'three';
/** Presentation-time pose filter. Seeks reset; repaints never advance motion. */
export class SkeletalContinuity{
 private previous?:number;
 private poses;
 constructor(private nodes:Object3D[]){this.poses=nodes.map(n=>({p:n.position.clone(),q:n.quaternion.clone(),s:n.scale.clone()}));}
 apply(time?:number){
  const dt=time===undefined||this.previous===undefined?Infinity:time-this.previous;
  const blend=dt>=0&&dt<=.25;
  const alpha=blend?1-Math.exp(-dt/.08):1;
  this.nodes.forEach((n,i)=>{const p=this.poses[i];
   if(blend){const angle=p.q.angleTo(n.quaternion);n.position.lerpVectors(p.p,n.position,alpha);n.scale.lerpVectors(p.s,n.scale,alpha);n.quaternion.slerpQuaternions(p.q,n.quaternion.clone(),Math.min(alpha,angle>1e-8?10*dt/angle:1));}
   p.p.copy(n.position);p.q.copy(n.quaternion);p.s.copy(n.scale);
  });this.previous=time;
 }
}
/** Two uninterrupted wing cycles; velocity meets normal idle at the handoff. */
export function arrivalPhase(t:number,duration:number){const T=1.6,a=4*duration/T-1;return t>=T?duration*2+t-T:a*t+(1-a)/(2*T)*t*t;}
