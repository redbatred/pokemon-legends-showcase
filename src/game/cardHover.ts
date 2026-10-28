const smooth=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
/** Stable card-local hit zone; controls and touch gestures cannot leave a tilted card. */
export function cardHover(x:number,y:number,width:number,height:number,mouse=true){
 if(!mouse||width<=0||height<=0)return {x:0,y:0};
 const nx=x/(width*.5),ny=y/(height*.5),edge=Math.max(Math.abs(nx),Math.abs(ny)),weight=1-smooth((edge-1.03)/.25);
 return {x:Math.max(-1,Math.min(1,nx))*weight,y:Math.max(-1,Math.min(1,ny))*weight};
}
