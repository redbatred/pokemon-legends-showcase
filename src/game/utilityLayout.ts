import {gameLayout} from './rendering';
export function compactToolbar(w:number){const creditX=w-(w<650?181:224)-16,left=Math.min((w-254)/2,creditX-266);return {left,y:18,logoWidth:70};}
/** One set of bounds for the circular controls, including their captions. */
export function utilityLayout(w:number,h:number,opening=false){
 // Large desktops get a larger header: the same grid, a step up in size.
 const l=gameLayout(w,h,opening),size=l.compact?36:l.portrait?40:l.large?56:44,gap=l.compact||l.portrait?8:l.large?12:10,stride=size+gap;
 const left=l.compact?compactToolbar(w).left:l.portrait?18:l.large?32:25,y=l.compact?18:l.short&&!l.sideControls?66:l.large?98:76;
 const slot=(x:number,y:number,caption=true)=>({x,y,width:size,height:size+(caption?18:0)});
 return {compact:true,
  binder:slot(left,y),history:slot(left+stride,y),
  turbo:slot(left+2*stride,y),auto:slot(left+3*stride,y),
  settings:slot(l.compact?left+4*stride:w-left-2*size-gap,y,false),
  sound:slot(l.compact?left+5*stride:w-left-size,y,false),
 };
}
