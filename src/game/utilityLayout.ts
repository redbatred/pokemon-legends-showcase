import {gameLayout} from './rendering';
/** Utility controls occupy the left shoulder on wide screens, one row on phones. */
export function utilityLayout(w:number,h:number,opening=false){
 const l=gameLayout(w,h,opening);
 if(l.compact){const width=Math.min(72,((w-l.stageWidth)/2-40)/2),y=91;return {compact:true,turbo:{x:16,y,width,height:44},auto:{x:24+width,y,width,height:44}};}
 if(l.sideControls){const width=Math.min(82,((w-l.stageWidth)/2-42)/2),y=132;return {compact:true,turbo:{x:25,y,width,height:52},auto:{x:35+width,y,width,height:52}};}
 const gap=12,width=(w-36-gap)/2,y=l.short?108:124;
 return {compact:false,turbo:{x:18,y,width,height:48},auto:{x:18+width+gap,y,width,height:48}};
}
