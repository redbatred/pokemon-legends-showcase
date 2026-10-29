import {gameLayout,revealControlsLayout} from './rendering';
export function modalLayout(w:number,h:number,kind:string){
 const inset=w<700||kind==='auto'&&h<480?0:24,max=kind==='history'?760:kind==='about'?680:kind==='auto'?560:kind==='inspect'?980:1040;
 const width=Math.min(w-inset*2,max),height=Math.min(h-inset*2,kind==='auto'?570:800);
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

/** Landscape has separate count and mode columns, keeping purchase controls isolated. */
export function autoSpinLayout(w:number,h:number){
 const compact=w>=500&&h<480,x=28,width=w-56,gap=10,top=compact?108:120,half=(width-gap)/2,ch=44;
 const countWidth=compact?half:width,cell=(countWidth-3*gap)/4;
 const modeY=compact?top:top+2*(ch+gap)+36;
 const individual={x:compact?x+half+gap:x,y:modeY,width:half,height:44};
 const all={x:compact?individual.x:x+half+gap,y:compact?modeY+ch+gap:modeY,width:half,height:44};
 const infoY=compact?top+2*(ch+gap)+12:modeY+57;
 return {compact,x,width,countLabelY:top-23,modeLabelX:individual.x,modeLabelY:modeY-23,infoY,
  count:(i:number)=>({x:x+(i%4)*(cell+gap),y:top+Math.floor(i/4)*(ch+gap),width:cell,height:ch}),individual,all,start:{x,y:h-65,width,height:44}};
}
