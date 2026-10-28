import {gameLayout,revealControlsLayout} from './rendering';
export function modalLayout(w:number,h:number,kind:string){
 const inset=w<700?0:24,max=kind==='history'?760:kind==='about'?680:kind==='inspect'?980:1040;
 const width=Math.min(w-inset*2,max),height=Math.min(h-inset*2,800);
 return {x:(w-width)/2,y:(h-height)/2,width,height};
}
export function rewardLayout(w:number,h:number){
 const l=gameLayout(w,h,true),stoneHeight=l.stageWidth*.5*l.stageFlatten;
 return {x:w/2,y:l.stageY+stoneHeight*.317,width:l.stageWidth*.225,size:Math.max(l.compact?14:18,Math.min(40,l.stageWidth*.044))};
}
export function creditLayout(w:number,h:number){
 const compact=h<550&&w>=560,width=compact&&w<650?181:w<700?Math.min(200,w*.51):224,x=w-width-16,y=13,height=compact?50:58,buttonSize=38;
 const buttonX=x+width-buttonSize-9,textX=x+14,textWidth=buttonX-textX-14;
 return {x,y,width,height,buttonX,buttonY:y+(height-buttonSize)/2,buttonSize,textX,textWidth,labelY:y+(compact?5:7),amountY:y+(compact?32:37),amountSize:compact?25:w<700?27:29};
}

/** Fixed destination for the card reward, separate from the card tray. */
export function totalWinLayout(w:number,h:number){
 const l=gameLayout(w,h,true),controls=revealControlsLayout(w,h),space=(w-l.stageWidth)/2;
 if(l.compact){const x=h<430?(controls.next.x+controls.all.x)/2:controls.next.x,y=Math.max(111,controls.next.y-controls.next.size/2-28);return {x,y,size:22,width:Math.min(150,space-24),labelY:y-27};}
 if(l.sideControls){const y=controls.next.y-controls.next.size/2-34,size=l.short?28:34;return {x:controls.next.x,y,size,width:Math.min(210,space-26),labelY:y-size*.5-17};}
 const y=l.dockTop-54;return {x:w/2,y,size:30,width:Math.max(60,w-228),labelY:y-30};
}
