import {gameLayout} from './rendering';
export function compactToolbar(w:number){const creditX=w-(w<650?181:224)-16,left=Math.min((w-254)/2,creditX-266);return {left,y:18,logoWidth:70};}
/** Turbo and Auto share the same circular icon row as collection/history. */
export function utilityLayout(w:number,h:number,opening=false){
 const l=gameLayout(w,h,opening);
 if(l.compact){const {left}=compactToolbar(w);return {compact:true,turbo:{x:left+80,y:13,width:44,height:62},auto:{x:left+130,y:13,width:44,height:62}};}
 if(l.sideControls){const shoulder=(w-l.stageWidth)/2,inline=shoulder>240;return {compact:true,turbo:{x:inline?133:25,y:inline?76:132,width:44,height:62},auto:{x:inline?187:79,y:inline?76:132,width:44,height:62}};}
 const y=l.short?66:76;return {compact:true,turbo:{x:114,y,width:44,height:62},auto:{x:164,y,width:44,height:62}};
}
