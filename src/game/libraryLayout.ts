export function binderLayout(w:number,h:number){
 const compact=h<500,phone=w<600,pad=phone?22:36,gap=phone?12:20,top=compact?136:158,bottom=h-82,columns=compact?Math.max(3,Math.floor((w-60)/145)):phone?w<360?2:3:Math.max(4,Math.min(6,Math.floor((w-72)/148))),rows=compact?1:phone&&h>=680?3:2;
 const width=(w-pad*2-(columns-1)*gap)/columns,height=(bottom-top-(rows-1)*18)/rows;
 return {pad,top,bottom,columns,rows,size:columns*rows,slot:(i:number)=>({x:pad+i%columns*(width+gap),y:top+Math.floor(i/columns)*(height+18),width,height})};
}
export function historyLayout(w:number,h:number){const pad=w<600?22:36,top=h<500?145:176,rowHeight=h<500?76:w<600?99:108,gap=12,rows=Math.max(1,Math.floor((h-80-top+gap)/(rowHeight+gap)));return {pad,top,rowHeight,gap,rows,width:w-pad*2};}
