import {cardTrayLayout,gameLayout} from './rendering';
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const PACK_REVEAL={spread:.68,flip:.82,face:1.10,settled:1.44,depart:3.28,stagger:.022};
/** One shared flip clock: all eleven backs become faces on the same beat. */
export function packRevealPose(time:number,index:number){
 const spread=1-(1-clamp((time-index*.009)/(.68-index*.009)))**3;
 const turn=clamp((time-PACK_REVEAL.flip)/(PACK_REVEAL.settled-PACK_REVEAL.flip)),front=time>=PACK_REVEAL.face;
 const flip=front?-Math.PI/2*(1-clamp((time-PACK_REVEAL.face)/(PACK_REVEAL.settled-PACK_REVEAL.face)))**2:Math.PI/2*clamp((time-PACK_REVEAL.flip)/(PACK_REVEAL.face-PACK_REVEAL.flip))**2;
 return {spread,front,flip:turn>=1?0:flip,price:clamp((time-PACK_REVEAL.settled)/.25),pulse:Math.sin(Math.PI*clamp((time-PACK_REVEAL.face)/.45))};
}
export function packRevealLayout(w:number,h:number,count:number){
 const l=gameLayout(w,h,true),compact=l.compact,short=h<620,tray=cardTrayLayout(w,h,0);
 const top=Math.min(compact?94:w>=900?138:l.top+8,h*.37),bottom=tray.y-(compact?10:short?92:108);
 const columns=Math.min(count,compact||bottom-top<110?11:short?6:w<700?4:6),rows=Math.ceil(count/columns),gap=compact||bottom-top<110?7:w<700?12:20,rowGap=compact?7:16,priceHeight=compact?15:w<700?20:24;
 const availableWidth=Math.min(w-(compact?180:32),1000),availableHeight=bottom-top;
 const width=Math.max(8,Math.min(142,(availableWidth-(columns-1)*gap)/columns,((availableHeight-(rows-1)*rowGap)/rows-priceHeight)/1.394)),height=width*435/312;
 const used=rows*(height+priceHeight)+(rows-1)*rowGap,start=top+(availableHeight-used)/2;
 const size=compact?64:short?48:62,controls=compact?{all:{x:46,y:(top+bottom)/2,size},next:{x:w-46,y:(top+bottom)/2,size}}:{all:{x:w*.29,y:tray.y-(short?60:69),size},next:{x:w*.71,y:tray.y-(short?60:69),size}};
 return {top,bottom,priceHeight,controls,slot:(index:number)=>{const row=Math.floor(index/columns),n=Math.min(columns,count-row*columns),col=index%columns;return {x:w/2+(col-(n-1)/2)*(width+gap),y:start+row*(height+priceHeight+rowGap)+height/2,width,height};}};
}
