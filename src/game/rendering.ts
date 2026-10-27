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
  const top=compact?68:portrait?82:76;
  const dock=opening?(compact?92:158):(compact?148:portrait?216:226);
  const actions=opening?(compact?74:144):(compact?52:72);
  const playHeight=Math.max(90,height-top-dock-actions);
  return {width,height,portrait,compact,top,dock,actions,playHeight,actionTop:height-dock-actions,dockTop:height-dock,worldY:top+playHeight/2,scale:Math.min(width/430,(playHeight-16)/435,1.4)};
}

/** Shared by the collection strip and the card-flight animation: one landing coordinate. */
export function cardTrayLayout(width:number,height:number,activeIndex:number){
  const layout=gameLayout(width,height,true),cardWidth=layout.compact?48:width<700?76:82,cardHeight=cardWidth*435/312,stride=cardWidth+10;
  const viewportX=18,viewportWidth=width-36,contentWidth=11*stride-10;
  const offset=Math.max(0,Math.min(Math.max(0,contentWidth-viewportWidth),activeIndex*stride-(viewportWidth-cardWidth)/2));
  const start=contentWidth<=viewportWidth?(width-contentWidth)/2:viewportX-offset;
  const y=layout.dockTop+(layout.compact?12:31);
  return {cardWidth,cardHeight,stride,offset,start,y,viewportX,viewportWidth,slot:(index:number)=>({x:start+index*stride+cardWidth/2,y:y+cardHeight/2})};
}
