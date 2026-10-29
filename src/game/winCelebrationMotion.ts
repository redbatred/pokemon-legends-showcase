import {gameLayout,cardTrayLayout,revealControlsLayout} from './rendering';
export const WIN_FRAME_ASSET='/assets/ui/win-frame-v2.png';
export const WIN_COUNT_FINISH=2.05;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
/** Keep the performance above the plaque and the next action below/beside it. */
export function specialWinGeometry(w:number,h:number){
 const l=gameLayout(w,h,true),controls=revealControlsLayout(w,h),tray=cardTrayLayout(w,h,0);
 const controlSpace=Math.min(...[controls.next,controls.all].map(c=>Math.abs(c.x-w/2)-c.size/2-20));
 let bottom=l.sideControls?tray.y-14:l.dockTop-(l.short?64:94);
 let safeTop=l.compact?l.top:Math.max(l.top,controls.next.y+controls.next.size/2+34);
 if(!l.sideControls&&bottom-safeTop<32){bottom=controls.next.y-controls.next.size/2-16;safeTop=64;}
 const width=Math.min(680,w*.92,l.compact?controlSpace*2:Infinity,Math.max(24,bottom-safeTop)*3),height=width/3;
 const y=bottom-height/2;
 return {x:w/2,y,width,height,titleY:y-height*.13,titleSize:width*.040,amountY:y+height*.075,size:width*.104,amountWidth:width*.48,focusY:l.worldY,safeTop};
}
export function celebrationPose(age:number,exitAge=0){
 const enter=clamp(age/.28),out=clamp(exitAge/.18);
 return {alpha:1-out,enter,
  titleAlpha:clamp(age/.10),amountAlpha:clamp((age-.025)/.10),
  count:clamp((age-.04)/(WIN_COUNT_FINISH-.04)),amountPulse:Math.sin(Math.PI*clamp((age-WIN_COUNT_FINISH)/.28))*.065};
}
