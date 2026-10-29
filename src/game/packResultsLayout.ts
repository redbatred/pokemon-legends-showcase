/** Smaller raised results frame, leaving the stadium and the source tray visible around it. */
export function packResultsFrame(w:number,h:number){const compact=w>=500&&h<480,width=Math.min(920,w-(compact?24:28)),height=Math.min(620,h-(compact?20:32));return {x:(w-width)/2,y:Math.max(compact?10:14,(h-height)*.30),width,height};}
export function packResultsLayout(w:number,h:number){
 const compact=w>=450&&h<420,phone=!compact&&w<620,columns=compact?11:phone&&h>=480?4:6,rows=Math.ceil(11/columns),gap=compact?8:12,top=compact?91:phone?143:116,bottom=h-102;
 const cardWidth=Math.min(126,(w-48-gap*(columns-1))/columns,Math.max(12,(bottom-top-(rows-1)*23)/rows-18)/1.397),cardHeight=cardWidth*1.397;
 const usedHeight=rows*(cardHeight+18)+(rows-1)*23,firstY=top+Math.max(0,(bottom-top-usedHeight)/2);
 return {compact,phone,columns,total:{x:phone?w/2:w-150,y:phone?102:56,size:compact?32:phone?36:44},slot:(index:number)=>{const row=Math.floor(index/columns),col=index%columns,n=Math.min(columns,11-row*columns),rowWidth=n*cardWidth+(n-1)*gap;return {x:(w-rowWidth)/2+col*(cardWidth+gap)+cardWidth/2,y:firstY+row*(cardHeight+41)+cardHeight/2,width:cardWidth,height:cardHeight};}};
}
export function collectionFlight(t:number,from:{x:number;y:number},to:{x:number;y:number},index:number){const p=Math.max(0,Math.min(1,t)),q=p*p*(3-2*p),arc=Math.sin(Math.PI*q);return {x:from.x+(to.x-from.x)*q+(index-5)*arc*4,y:from.y+(to.y-from.y)*q-arc*65,rotation:p===0||p===1?0:(index-5)*.025*arc,scale:q,done:p===1};}
