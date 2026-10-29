import {packSeam} from './packTearGeometry';
export function projectPackPoint(x:number,y:number,yaw:number,pitch:number){const p=700/(700-x*Math.sin(yaw)+y*Math.sin(pitch));return {x:x*Math.cos(yaw)*p,y:y*Math.cos(pitch)*p};}
export function packCutPose(time:number,yaw:number,pitch:number){
 const localX=127-3*(.5-.5*Math.cos(time*Math.PI/1.4)),localY=-210.5+packSeam(.96);
 const a=projectPackPoint(localX,localY,yaw,pitch),b=projectPackPoint(localX-70,localY,yaw,pitch);
 let angle=Math.atan2(b.y-a.y,b.x-a.x);if(angle<0)angle+=Math.PI*2;
 return {...a,localX,localY,angle,scale:Math.hypot(b.x-a.x,b.y-a.y)/70*.72};
}
