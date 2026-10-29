export function settingsLayout(w:number,h:number){
 const compact=h<480&&w>=560,width=Math.min(compact?660:404,w-24),height=Math.min(h-24,compact?360:520),x=w-width-12,y=(h-height)/2,pad=22,bodyY=y+(compact?92:110),gap=compact?8:10,rowHeight=compact?44:Math.max(44,Math.min(62,(height-338)/3)),column=compact?(width-pad*2-20)/2:width-pad*2;
 const actionsX=compact?x+pad+column+20:x+pad,actionsY=compact?bodyY:bodyY+3*(rowHeight+gap)+8,actionsWidth=column;
 return {compact,width,height,x,y,pad,bodyY,gap,rowHeight,column,actionsX,actionsY,actionsWidth};
}
