import {packResultsFrame} from './packResultsLayout';
import {gameLayout,revealControlsLayout} from './rendering';
export function modalLayout(w:number,h:number,kind:string){
 if(kind==='results')return packResultsFrame(w,h);
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
 const l=gameLayout(w,h,true),controls=revealControlsLayout(w,h);
 if(l.compact)return {x:66,y:74,size:18,width:120,labelY:55};
 if(l.sideControls&&l.short)return {x:w-94,y:176,size:26,width:150,labelY:149};
 if(l.sideControls){const y=controls.next.y-controls.next.size/2-34;return {x:controls.next.x,y,size:32,width:190,labelY:y-31};}
 const y=l.dockTop-(l.short?26:54);return {x:w/2,y,size:l.short?26:30,width:Math.max(60,w-160),labelY:y-(l.short?27:30)};
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
