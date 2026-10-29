/** All available sets stay in view. No clipping mask, drag rail or hidden choices. */
export function packGridLayout(w:number,h:number,count=10){
 const compact=w>=560&&h<550,columns=Math.min(count,compact||w>=1100?10:5),rows=Math.ceil(count/columns);
 const gap=w<700?6:12,margin=w<700?12:24,areaWidth=Math.min(w-margin*2,1450);
 const width=(areaWidth-gap*(columns-1))/columns;
 const height=compact?Math.max(86,Math.min(128,h*.34)):w<700?Math.max(78,Math.min(142,(h*.35-10*(rows-1))/rows)):rows===1?Math.min(204,h*.26):Math.min(158,h*.2);
 const rowGap=compact?6:10,totalHeight=height*rows+rowGap*(rows-1),top=h-totalHeight-12;
 return {top,totalHeight,columns,rows,slot:(i:number)=>{const row=Math.floor(i/columns),n=Math.min(columns,count-row*columns),rowWidth=n*width+(n-1)*gap;return {x:(w-rowWidth)/2+(i%columns)*(width+gap),y:top+row*(height+rowGap),width,height};}};
}
