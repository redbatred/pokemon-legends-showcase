/** Smaller raised results frame, leaving the stadium and the source tray visible around it. */
export function packResultsFrame(w:number,h:number){const compact=w>=500&&h<480,width=Math.min(920,w-(compact?24:28)),height=Math.min(680,h-(compact?20:32));return {x:(w-width)/2,y:Math.max(compact?10:14,(h-height)*.30),width,height};}
export function packResultsLayout(w:number,h:number){
 const compact=h<440,phone=w<620,columns=compact?(w>=450?11:6):phone?4:6,rows=Math.ceil(11/columns),gap=compact?6:12,rowGap=compact?16:20;
 const top=compact?146:226,bottom=h-82,total={x:w/2,y:compact?98:140,width:Math.min(w-48,660),height:compact?76:152,size:compact?40:68};
 const cardWidth=Math.max(12,Math.min(126,(w-48-gap*(columns-1))/columns,((bottom-top-(rows-1)*rowGap)/rows-18)/1.397)),cardHeight=cardWidth*1.397;
 const usedHeight=rows*(cardHeight+18)+(rows-1)*rowGap,firstY=top+Math.max(0,(bottom-top-usedHeight)/2);
 return {compact,phone,columns,total,slot:(index:number)=>{const row=Math.floor(index/columns),col=index%columns,n=Math.min(columns,11-row*columns),rowWidth=n*cardWidth+(n-1)*gap;return {x:(w-rowWidth)/2+col*(cardWidth+gap)+cardWidth/2,y:firstY+row*(cardHeight+18+rowGap)+cardHeight/2,width:cardWidth,height:cardHeight};}};
}
/** Every pack is retained by the session; pagination bounds textures and tap targets. */
export function autoResultsLayout(w:number,h:number){
 const compact=h<440,phone=w<620,columns=compact?6:phone?4:5,rows=compact?1:phone?3:2,gap=compact?8:12,top=compact?146:226,bottom=h-82,pad=compact?24:30;
 const width=(w-pad*2-(columns-1)*gap)/columns,height=(bottom-top-(rows-1)*gap)/rows;
 return {capacity:columns*rows,total:packResultsLayout(w,h).total,slot:(index:number)=>({x:pad+index%columns*(width+gap),y:top+Math.floor(index/columns)*(height+gap),width,height})};
}
export function collectionFlight(t:number,from:{x:number;y:number},to:{x:number;y:number},index:number){const p=Math.max(0,Math.min(1,t)),q=p*p*(3-2*p),arc=Math.sin(Math.PI*q);return {x:from.x+(to.x-from.x)*q+(index-5)*arc*4,y:from.y+(to.y-from.y)*q-arc*65,rotation:p===0||p===1?0:(index-5)*.025*arc,scale:q,done:p===1};}
