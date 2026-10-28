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
  const portrait=width<700,compact=height<550&&width>=560,short=height<620;
  const sideControls=width>=900||compact;
  const top=compact?84:sideControls?90:short?148:156;
  const dock=opening?(compact?92:short?112:148):(compact?148:portrait?216:226);
  const actions=opening?(sideControls?0:short?112:124):(compact?52:72);
  const dockTop=height-dock,actionTop=dockTop-actions;
  const stageWidth=Math.min(width*(compact?.52:sideControls?.60:1.02),900),stageFlatten=.82;
  // The source platform has transparent padding; its physical front ends at v=.90.
  const stageFrontOffset=stageWidth*.5*stageFlatten*.40;
  const stageY=actionTop-stageFrontOffset-(compact?8:12),stageFront=stageY+stageFrontOffset;
  const playHeight=Math.max(76,(opening?stageY-32:compact?dockTop-9:actionTop-16)-top);
  const scale=Math.max(.17,Math.min(width/(sideControls?720:430),playHeight/435,1.4));
  const worldY=opening?stageY-32-217.5*scale:top+playHeight/2;
  return {width,height,portrait,compact,short,sideControls,top,dock,actions,playHeight,actionTop,dockTop,worldY,scale,stageY,stageFront,stageWidth,stageFlatten};
}

export function revealControlsLayout(width:number,height:number){
 const l=gameLayout(width,height,true),space=(width-l.stageWidth)/2;
 if(l.compact&&height<430){const next=width<650?60:68,all=width<650?58:62,gap=(next+all)/2+8,x=width-space/2,y=Math.min(l.dockTop-next/2-32,Math.max(l.top+next/2+8,l.worldY+30));return {next:{x:x+gap/2,y,size:next},all:{x:x-gap/2,y,size:all}};}
 if(l.sideControls){const x=width-space/2,y=Math.max(l.compact?120:220,l.worldY+16);return {next:{x,y,size:l.compact?64:100},all:{x,y:y+(l.compact?92:142),size:l.compact?58:82}};}
 return {next:{x:width-58,y:l.dockTop-66,size:84},all:{x:56,y:l.dockTop-66,size:76}};
}

/** Card-local floor, including its settled -8px lift; a little forward of the centre emblem. */
export function performanceFloor(layout:ReturnType<typeof gameLayout>){return (layout.stageY+layout.stageWidth*.012-layout.worldY)/layout.scale+8;}

/** Shared by the collection strip and the card-flight animation: one landing coordinate. */
export function cardTrayLayout(width:number,height:number,activeIndex:number){
  const layout=gameLayout(width,height,true),cardWidth=layout.compact?48:layout.short?58:width<700?76:82,cardHeight=cardWidth*435/312,stride=cardWidth+10;
  const viewportX=18,viewportWidth=width-36,contentWidth=11*stride-10;
  const offset=Math.max(0,Math.min(Math.max(0,contentWidth-viewportWidth),activeIndex*stride-(viewportWidth-cardWidth)/2));
  const start=contentWidth<=viewportWidth?(width-contentWidth)/2:viewportX-offset;
  const y=layout.dockTop+(layout.compact?12:layout.short?28:31);
  return {cardWidth,cardHeight,stride,offset,start,y,viewportX,viewportWidth,slot:(index:number)=>({x:start+index*stride+cardWidth/2,y:y+cardHeight/2})};
}
