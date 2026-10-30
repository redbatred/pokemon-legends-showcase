import {packGridLayout} from './packGrid';
export function renderResolution(width: number, height: number, dpr: number, low: boolean, detail=false) {
  const pixels = Math.max(1,width*height);
  return Math.min(dpr,low?1:width<700?2.5:2,Math.sqrt((low?950_000:detail?8_300_000:4_500_000)/pixels));
}
export function pageWindow(total: number, size: number, requested: number) {
  const pages=Math.max(1,Math.ceil(total/size));
  const page=Math.max(0,Math.min(pages-1,requested));
  return {page,pages,start:page*size,end:Math.min(total,(page+1)*size)};
}
export function gameLayout(width:number,height:number,opening=false) {
  const portrait=width<700,compact=height<550&&width>=560,short=height<620;
  const sideControls=width>=900||compact;
  const top=compact?84:sideControls?90:short?188:208;
  const dock=opening?(compact?92:short?112:148):(height-packGridLayout(width,height).top);
  const actions=opening?(sideControls?(compact?0:44):short?112:124):(compact?52:72);
  const dockTop=height-dock,actionTop=dockTop-actions;
  // One local coordinate system for the card, physical platform and floor gap.
  // Width-only platform sizing made short/wide screens dwarf the height-fitted card.
  const stageFlatten=.82,platformSpan=840,cardHeight=435,floorGap=32;
  const widthLimit=width*(compact?.52:sideControls?.60:1.02),frontInset=12;
  const frontPerScale=platformSpan*.5*stageFlatten*.40;
  const compositionHeight=cardHeight+floorGap+frontPerScale;
  const arenaScale=Math.min(widthLimit/platformSpan,Math.max(1,actionTop-frontInset-top)/compositionHeight,1.4);
  const stageWidth=platformSpan*arenaScale,stageFrontOffset=frontPerScale*arenaScale;
  const stageY=actionTop-stageFrontOffset-frontInset,stageFront=stageY+stageFrontOffset;
  const playHeight=opening?cardHeight*arenaScale:Math.max(36,(compact?dockTop-9:actionTop-16)-top);
  const scale=opening?arenaScale:Math.max(.17,Math.min(width/(sideControls?720:430),playHeight/cardHeight,1.4));
  const worldY=opening?stageY-(floorGap+cardHeight/2)*scale:top+playHeight/2;
  return {width,height,portrait,compact,short,sideControls,top,dock,actions,playHeight,actionTop,dockTop,worldY,scale,stageY,stageFront,stageWidth,stageFlatten};
}

export function revealControlsLayout(width:number,height:number){
 const l=gameLayout(width,height,true),y=l.worldY-8*l.scale,size=l.compact||width<360?80:l.sideControls?132:96,allSize=l.compact||width<360?78:l.sideControls?120:92;
 const nextX=l.compact?width-66:Math.min(width-size/2-10,width/2+156*l.scale+size/2+14);
 const allX=l.compact?66:Math.max(allSize/2+10,width/2-156*l.scale-allSize/2-20);
 return {next:{x:nextX,y,size},all:{x:allX,y,size:allSize}};
}

/** Card-local floor, including its settled -8px lift; a little forward of the centre emblem. */
export function performanceFloor(layout:ReturnType<typeof gameLayout>){return (layout.stageY+layout.stageWidth*.012-layout.worldY)/layout.scale+8;}

/** Shared by the collection strip and the card-flight animation: one landing coordinate. */
export function cardTrayLayout(width:number,height:number,activeIndex:number){
  const layout=gameLayout(width,height,true),cardWidth=layout.compact?48:layout.short?58:width<700?76:82,cardHeight=cardWidth*435/312,stride=cardWidth+10;
  const viewportX=18,viewportWidth=width-36,contentWidth=11*stride-10;
  const offset=Math.max(0,Math.min(Math.max(0,contentWidth-viewportWidth),activeIndex*stride-(viewportWidth-cardWidth)/2));
  const start=contentWidth<=viewportWidth?(width-contentWidth)/2:viewportX-offset;
  const priceHeight=layout.compact?18:layout.short?20:24,priceY=cardHeight+3,slotHeight=priceY+priceHeight,y=height-slotHeight-4;
  return {cardWidth,cardHeight,priceY,priceHeight,slotHeight,stride,offset,start,y,viewportX,viewportWidth,contentWidth,maxOffset:Math.max(0,contentWidth-viewportWidth),slot:(index:number)=>({x:start+index*stride+cardWidth/2,y:y+cardHeight/2})};
}
