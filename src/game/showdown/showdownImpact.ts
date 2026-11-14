import {Euler,Quaternion,type Object3D} from 'three';
import {clamp,smooth} from './showdownModel';
/** Directional contact, short hold, then a controlled recovery. No indefinite oscillation. */
export function impactPose(age:number,power:number,finisher:boolean,reduced:boolean){
 if(age<0||reduced)return {recoil:0,x:0,y:0,shake:0,flash:0};
 const recover=finisher?1.65:1.05,recoil=smooth(age/.075)*(1-smooth((age-.15)/(recover-.15)));
 const shock=1-smooth(age/(finisher?.42:.26));
 return {recoil,x:recoil*(finisher?72:34)*power,y:-Math.sin(Math.PI*clamp(age/.48))*(finisher?19:8)*power,shake:shock*(finisher?13:5.5)*power,flash:(1-smooth(age/.13))*(finisher?.32:.14)};
}
export function rewardPresentation(age:number,total:number,reduced:boolean){
 const count=reduced?(age>=.9?1:0):smooth((age-.95)/1.05),burst=reduced||age<=.48||age>=1.88?0:Math.sin(Math.PI*clamp((age-.48)/1.4));
 return {shownTotal:Math.round(total*count),burst,zoom:reduced?1:1+Math.sin(Math.PI*clamp((age-.45)/1.1))*.065};
}
/** Additive articulation, restored after rendering so native animation remains authoritative. */
export function applyHitPose(bones:readonly Object3D[],amount:number,power:number){
 const saved:{bone:Object3D;rotation:Quaternion}[]=[];
 if(amount<=0)return ()=>{};
 const a=amount*power;
 for(const bone of bones){
  const name=bone.name.toLowerCase();let angles:[number,number,number]|undefined;
  if(name==='spine_02')angles=[-.24*a,.07*a,-.06*a];
  else if(name==='spine_01')angles=[-.13*a,0,0];
  else if(name==='neck')angles=[.18*a,-.06*a,0];
  else if(name==='head')angles=[.14*a,.1*a,.07*a];
  else if(name==='left_arm_01')angles=[-.25*a,0,.19*a];
  else if(name==='right_arm_01')angles=[-.22*a,0,-.16*a];
  else if(name==='left_arm_02'||name==='right_arm_02')angles=[-.23*a,0,0];
  else if(name==='tail_02')angles=[.09*a,.15*a,0];
  if(!angles)continue;
  saved.push({bone,rotation:bone.quaternion.clone()});bone.quaternion.multiply(new Quaternion().setFromEuler(new Euler(...angles)));
 }
 return ()=>{for(const entry of saved)entry.bone.quaternion.copy(entry.rotation);};
}
