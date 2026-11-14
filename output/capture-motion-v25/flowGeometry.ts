import {clamp,smooth,mix} from './model';
export type Point={x:number;y:number};
/** Material transport in the chest→mouth coordinate frame. Transverse anatomy
 * curls into a narrow flowing ribbon before longitudinal transport finishes. */
export function flowPoint(source:Point,chest:Point,target:Point,p:number,scale:number){
 const dx=target.x-chest.x,dy=target.y-chest.y,distance=Math.max(1,Math.hypot(dx,dy)),ux=dx/distance,uy=dy/distance;
 const sx=source.x-chest.x,sy=source.y-chest.y,along=sx*ux+sy*uy,across=-sx*uy+sy*ux;
 const radial=clamp(Math.hypot(sx*.8,sy)/(scale*235)),delay=.035+(1-radial)*.38,q=smooth((p-delay)/(1-delay));
 const x=mix(along,distance,q);
 const funnel=1-.985*smooth((p-.1)/.53);
 const curl=Math.sin(Math.PI*q)*scale*(20*Math.sin(x/(scale*91)-p*7)+9*Math.sin(across/(scale*73)))*smooth(p/.2);
 const y=across*(1-q)*funnel+curl;
 return {x:chest.x+x*ux-y*uy,y:chest.y+x*uy+y*ux,q};
}
