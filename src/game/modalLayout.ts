export function modalLayout(w:number,h:number,kind:string){
 const inset=w<700?0:24,max=kind==='history'?760:kind==='about'?680:kind==='inspect'?980:1040;
 const width=Math.min(w-inset*2,max),height=Math.min(h-inset*2,800);
 return {x:(w-width)/2,y:(h-height)/2,width,height};
}
export function rewardLayout(w:number,_h:number,dockTop:number,side:boolean,compact:boolean){
 const y=compact?dockTop-57:side?dockTop-65:dockTop-62;
 return {x:w/2,y,width:Math.max(100,Math.min(side?420:280,w-(side?260:156))),size:compact?30:side?46:36};
}
