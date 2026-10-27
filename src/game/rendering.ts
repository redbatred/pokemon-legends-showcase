export function renderResolution(width: number, height: number, dpr: number, low: boolean) {
  const pixels = Math.max(1,width*height);
  return Math.min(dpr,low?1:1.5,Math.sqrt((low?950_000:1_700_000)/pixels));
}
export function pageWindow(total: number, size: number, requested: number) {
  const pages=Math.max(1,Math.ceil(total/size));
  const page=Math.max(0,Math.min(pages-1,requested));
  return {page,pages,start:page*size,end:Math.min(total,(page+1)*size)};
}
export function gameLayout(width:number,height:number,opening=false) {
  const portrait=width<700,compact=height<550&&width>=560;
  const top=compact?68:portrait?96:80;
  const dock=opening?(compact?78:112):(compact?132:portrait?174:190);
  const actions=opening?(compact?74:132):(compact?52:72);
  const playHeight=Math.max(90,height-top-dock-actions);
  return {width,height,portrait,compact,top,dock,actions,playHeight,actionTop:height-dock-actions,dockTop:height-dock,worldY:top+playHeight/2,scale:Math.min(width/430,(playHeight-16)/435,1.4)};
}
