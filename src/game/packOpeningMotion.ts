import type {Container} from 'pixi.js';
import {PACK_CLEARANCE_TIME} from './packTearGeometry';
export const PACK_EXTRACTION_START=1.22;
export const PACK_ARRIVAL_TIME=PACK_CLEARANCE_TIME+.88;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>x*x*(3-2*x);
const hermite=(a:number,b:number,va:number,vb:number,t:number)=>(2*t*t*t-3*t*t+1)*a+(t*t*t-2*t*t+t)*va+(-2*t*t*t+3*t*t)*b+(t*t*t-t*t)*vb;
/** Matching nonzero velocity at clearance joins extraction to the camera journey. */
export function packStackPose(time:number){
 const extraction=PACK_CLEARANCE_TIME-PACK_EXTRACTION_START,flight=PACK_ARRIVAL_TIME-PACK_CLEARANCE_TIME;
 if(time<=PACK_CLEARANCE_TIME){const t=clamp((time-PACK_EXTRACTION_START)/extraction);return {x:0,y:hermite(9,-90,0,-70*extraction,t),scale:.66,rotation:0,camera:0};}
 const t=clamp((time-PACK_CLEARANCE_TIME)/flight),camera=smooth(t),arc=Math.sin(t*Math.PI)**2;
 return {x:arc*15,y:hermite(-90,-8,-70*flight,0,t),scale:.66+.30*camera,rotation:arc*.032,camera};
}
/** The backs briefly separate only after the stack has cleared the wrapper. */
export function packStackFan(time:number,index:number){
 const t=clamp((time-PACK_CLEARANCE_TIME)/(PACK_ARRIVAL_TIME-PACK_CLEARANCE_TIME));
 const spread=Math.sin(Math.PI*t)**2;
 return {x:index*.8+spread*(index-2)*17,y:index*1.3+spread*index*3,rotation:(index-1)*.003+spread*(index-2)*.075};
}
/** Both parents share the same world. Keep the same front mesh and its exact pose. */
export function transferStackFront(stack:Container,layer:Container,front:Container){
 layer.position.copyFrom(stack.position);layer.scale.copyFrom(stack.scale);layer.rotation=stack.rotation;
 layer.addChild(front);
 return {offsetX:stack.x,lift:stack.y,scale:stack.scale.x,roll:stack.rotation};
}
