/** A full hand stays in frame; the raised card clears its neighbours and the footer. */
export function historyFanLayout(w:number,h:number,count:number){
 const compact=h<420,pad=compact?28:34,top=compact?100:154,bottom=h-(compact?55:106),height=Math.min(310,(bottom-top)*.66),width=height/1.397,span=Math.max(0,w-pad*2-width),step=count>1?span/(count-1):0,lift=compact?22:46;
 const centerY=top+height/2+lift,arc=compact?18:36;
 return {width,height,step,lift,detailY:h-(compact?45:81),pose:(i:number,selected=false)=>{const t=count>1?(i/(count-1)-.5)*2:0;return {x:w/2+t*span/2,y:centerY+t*t*arc-(selected?lift:0),rotation:selected?0:t*.13,scale:selected?1.12:1};}};
}
