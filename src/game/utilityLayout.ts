import {gameLayout} from './rendering';
/** Utility controls occupy the left shoulder on wide screens, one row on phones. */
export function utilityLayout(w:number,h:number,opening=false){
 const l=gameLayout(w,h,opening);
 if(l.compact){const width=Math.min(104,((w-l.stageWidth)/2-40)/2),y=l.dockTop-58;return {compact:true,turbo:{x:16,y,width,height:48},auto:{x:24+width,y,width,height:48}};}
 if(l.sideControls){const width=Math.min(176,(w-l.stageWidth)/2-42),y=l.dockTop-126;return {compact:false,turbo:{x:24,y,width,height:52},auto:{x:24,y:y+62,width,height:52}};}
 const gap=12,width=(w-36-gap)/2,y=l.short?108:124;
 return {compact:false,turbo:{x:18,y,width,height:48},auto:{x:18+width+gap,y,width,height:48}};
}
