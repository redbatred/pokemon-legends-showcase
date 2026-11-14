export function settingsLayout(w:number,h:number){
 // Four rows of actions under the switches (credits, two pairs, cheats). A short portrait drawer closes its spacing up
 // so every switch keeps a full touch height; the wide drawer puts the actions beside the switches.
 const compact=h<480&&w>=560,width=Math.min(compact?660:404,w-24),height=Math.min(h-24,compact?360:566),tight=!compact&&height<530,x=w-width-12,y=(h-height)/2,pad=22,bodyY=y+(compact?92:tight?96:110),gap=compact||tight?8:10,rowHeight=compact||tight?44:Math.max(44,Math.min(62,(height-384)/3)),column=compact?(width-pad*2-20)/2:width-pad*2;
 const actionsX=compact?x+pad+column+20:x+pad,actionsY=compact?bodyY:bodyY+3*(rowHeight+gap)+(tight?4:8),actionsWidth=column,actionsHeight=182;
 // The small print under the actions is dropped where it would touch them.
 const captionY=compact?actionsY+actionsHeight+13:y+height-25,caption=compact?captionY+12<y+height-8:!tight;
 return {compact,width,height,x,y,pad,bodyY,gap,rowHeight,column,actionsX,actionsY,actionsWidth,actionsHeight,caption,captionY};
}
