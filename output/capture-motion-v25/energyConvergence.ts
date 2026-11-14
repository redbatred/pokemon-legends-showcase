import {smooth} from './model';
type Point={x:number;y:number};
/** Preserve intact anatomy while pinning the converted current to the real mouth. */
export function convergeOutlet(outlet:Point,target:Point,frame:number){
 const travel=smooth((frame/15-.5)/.4),aim=smooth((frame-1.3)/1.4)*(1-travel);
 const dx=target.x-outlet.x,dy=target.y-outlet.y;
 return {shift:{x:dx*travel,y:dy*travel},bend:{x:dx*aim,y:dy*aim},width:72+120*smooth((frame-4)/5),end:{x:outlet.x+dx*(travel+aim),y:outlet.y+dy*(travel+aim)}};
}
