import {packResultsFrame} from './packResultsLayout';
import {gameLayout} from './rendering';
export function modalLayout(w:number,h:number,kind:string,items?:number){
 if(['results','auto-session','auto-pack'].includes(kind))return packResultsFrame(w,h);
 const inset=w<700||h<400||(kind==='auto'||kind==='cheats')&&h<480?0:24,max=kind==='history'||kind==='cheats'?760:kind==='about'?680:kind==='auto'?560:kind==='inspect'||kind==='history-pack'?980:1040;
 const width=Math.min(w-inset*2,max),height=Math.min(h-inset*2,kind==='cheats'?(w-inset*2<560?590:440):kind==='auto'?550:kind==='about'?572:kind==='history-pack'?660:kind==='history'?Math.max(370,258+Math.min(4,items??4)*120):800);
 return {x:(w-width)/2,y:(h-height)/2,width,height};
}
export function rewardLayout(w:number,h:number){
 const l=gameLayout(w,h,true),stoneHeight=l.stageWidth*.5*l.stageFlatten;
 return {x:w/2,y:l.stageY+stoneHeight*.317,width:l.stageWidth*.225,size:Math.max(l.compact?14:18,Math.min(40,l.stageWidth*.044))};
}
export function creditLayout(w:number,h:number){
 const compact=h<550&&w>=560,large=w>=1600&&h>=900,width=compact&&w<650?181:w<700?Math.min(200,w*.51):large?290:224;
 // The wallet ends on the same right edge as the buttons under it.
 const right=compact?w-25:w-(large?32:w<700?18:25),x=right-width,y=large?18:13,height=compact?50:large?72:58,buttonSize=large?50:compact?34:w<700?36:40;
 const amountSize=compact?22:w<700?25:large?36:28,labelSize=large?13:compact?9:11;
 // The amount and its + button share one centre line, a small gap apart; the label sits right above the amount and ends where it ends.
 const buttonX=right-buttonSize,amountY=y+height-buttonSize/2-(compact?1:3),textRight=buttonX-(large?14:10),textX=x,textWidth=textRight-textX;
 return {x,y,width,height,buttonX,buttonY:amountY-buttonSize/2,buttonSize,textX,textRight,textWidth,labelSize,labelY:amountY-amountSize*.365-5-labelSize*1.3,amountY,amountSize};
}

/** Fixed destination for the card reward, separate from the card tray. */
export function totalWinLayout(w:number,h:number){
 const l=gameLayout(w,h,true);
 // The label sits right above the digits, in the same lettering at two fifths of their size. `y` is the middle of the digits.
 // The digits' edge reaches 0.43 of a size above their middle; the label's lettering ends 1.25 of its size below its top.
 const gap=(size:number)=>Math.max(4,size*.14),at=(x:number,top:number,size:number,width:number)=>{const labelSize=Math.max(9,Math.round(size*.4));return {x,size,width,labelSize,labelY:top,y:top+labelSize*1.25+gap(size)+size*.43};};
 // Reserve the header for the total, outside every character's attack envelope.
 if(l.compact)return at(54,54,18,98);
 // Wide screens carry the total in the header's centre; it grows with the screen.
 if(l.sideControls||l.shortWide){const size=l.shortWide?30:Math.max(36,Math.min(46,h*.045));return at(w/2,12,size,Math.max(220,size*6.4));}
 if(l.short)return at(w/2,l.dockTop-50,24,200);
 // Portrait: the total closes the header, large enough to be the second thing the eye finds after the card, and its whole
 // block (label, digits and their drop) ends clear of the card's top edge on every screen.
 const size=Math.max(34,Math.min(42,w*.085)),cardTop=l.worldY-217.5*l.scale,block=Math.max(9,Math.round(size*.4))*1.25+gap(size)+size*.905;
 return at(w/2,Math.min(166,cardTop-14-block),size,Math.min(300,w-80));
}

/** Landscape has separate count and mode columns, keeping purchase controls isolated. */
export function autoSpinLayout(w:number,h:number){
 const compact=h<430||w>=500&&h<480,x=28,width=w-56,gap=compact?8:10,top=compact?(h<360?103:109):114,half=(width-gap)/2,ch=compact?34:40;
 const countWidth=compact?half:width,cell=(countWidth-2*gap)/3;
 const modeY=compact?top:top+3*(ch+gap)+30;
 const individual={x:compact?x+half+gap:x,y:modeY,width:half,height:40};
 const all={x:compact?individual.x:x+half+gap,y:compact?modeY+48:modeY,width:half,height:40};
 const infoY=compact?top+3*(ch+gap)+2:modeY+49;
 return {compact,x,width,countLabelY:top-22,modeLabelX:individual.x,modeLabelY:modeY-22,infoY,
  count:(i:number)=>({x:x+(i%3)*(cell+gap),y:top+Math.floor(i/3)*(ch+gap),width:cell,height:ch}),individual,all,start:{x,y:h-58,width,height:40}};
}

/** The cheats panel: each choice is one strip of chips on a wide panel; on a phone the longer choices wrap to two rows.
 * `w`,`h` are the panel's own size. Every chip sits between the header seam and the footer ledge. */
export function cheatsLayout(w:number,h:number){
 const strips=w>=560,short=strips?h<400:h<540,x=28,width=w-56,gap=strips?8:6,ch=short?(strips&&h<340?28:32):38,label=short?(strips&&h<340?18:21):28,top=strips?(short?(h<340?99:105):114):(short?104:114);
 const cells=(x0:number,y:number,span:number,per:number)=>(i:number)=>{const cell=(span-(per-1)*gap)/per;return {x:x0+(i%per)*(cell+gap),y:y+Math.floor(i/per)*(ch+gap),width:cell,height:ch};};
 const tag=(x0:number,y:number)=>({x:x0,y:y-label+(short?5:7)});
 let win,total,bonus,legendary,labels,bottom;
 if(strips){
  // Bonus and its legendary share the third strip, a little apart.
  const y2=top+ch+label,y3=y2+ch+label,split=20,cell=(width-split-4*gap)/6,legendX=x+4*cell+3*gap+split;
  win=cells(x,top,width,7);total=cells(x,y2,width,5);bonus=cells(x,y3,4*cell+3*gap,4);legendary=cells(legendX,y3,2*cell+gap,2);
  labels={win:tag(x,top),total:tag(x,y2),bonus:tag(x,y3),legendary:tag(legendX,y3)};bottom=y3+ch;
 }else{
  const y2=top+2*ch+gap+label,y3=y2+2*ch+gap+label,y4=y3+ch+label;
  win=cells(x,top,width,4);total=cells(x,y2,width,3);bonus=cells(x,y3,width,4);legendary=cells(x,y4,width,2);
  labels={win:tag(x,top),total:tag(x,y2),bonus:tag(x,y3),legendary:tag(x,y4)};bottom=y4+ch;
 }
 // One line (two on a phone) saying what is armed, where there is room for it above the footer.
 const ledge=h-74,infoLines=strips?1:2,infoY=bottom+(short?8:14),info=infoY+infoLines*15<=ledge-4,resetWidth=strips?150:96;
 return {strips,short,x,width,labels,win,total,bonus,legendary,bottom,ledge,info,infoY,reset:{x,y:h-58,width:resetWidth,height:40},open:{x:x+resetWidth+gap,y:h-58,width:width-resetWidth-gap,height:40}};
}
