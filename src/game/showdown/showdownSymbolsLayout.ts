import {gameLayout,cardTrayLayout,revealControlsLayout} from '../rendering';
import {packRevealLayout} from '../packRevealMotion';

/** The pedestal artwork's front lip to the right of its centre plate: the middle of the steel band, as fractions of the
 * platform image (across, down). The image is drawn `stageWidth` wide and `stageWidth/2*stageFlatten` tall, centred on `stageY`. */
const LIP:readonly [number,number][]=[[.6145,.789],[.834,.733],[.93,.637]];
function lipHeight(u:number){
 for(let i=1;i<LIP.length;i++)if(u<=LIP[i][0]||i===LIP.length-1){const [u0,v0]=LIP[i-1],[u1,v1]=LIP[i];return v0+(v1-v0)*Math.max(0,Math.min(1.15,(u-u0)/(u1-u0)));}
 return LIP[0][1];
}
/** How far right of the pedestal's centre the card's "+$" award can reach, as a fraction of the stage width. */
export const AWARD_REACH=.169;
/** Three seats for this pack's bonus balls. They have no panel and take no room of their own: they are set into the
 * pedestal's front lip, right of the award plate and under the corner of the card where a bonus ball lands. In short
 * landscape the card's caption lies over that lip, so there the seats continue the tray's row past its last slot,
 * or line up beside the caption when the tray fills the width.
 * `group` is the layout while the rest of the pack is laid out over the pedestal: the seats move to the floor between
 * the two controls under the cards (short landscape: the tray's end, or under the Next control). */
export function showdownSocketsLayout(width:number,height:number,group=false){
 const game=gameLayout(width,height,true),sw=game.stageWidth,gap=5,board=group?packRevealLayout(width,height,11):null,next=board?board.controls.next:revealControlsLayout(width,height).next;
 // The Next control with its label underneath; with the pack laid out, the Open All control beside it as well.
 const box=(c:{x:number;y:number;size:number})=>({left:c.x-c.size*.62,right:c.x+c.size*.62,top:c.y-c.size/2,bottom:c.y+c.size/2+20}),control=box(next),controls=board?[control,box(board.controls.all)]:[control];
 const tray=cardTrayLayout(width,height,0),row=(x:number,y:number,r:number)=>[0,1,2].map(i=>({x:x+i*(r*2+gap),y}));
 let radius:number,sockets:{x:number;y:number}[],anchor:'pedestal'|'tray'|'caption'|'controls';
 if(!game.compact&&board){
  radius=Math.max(8.5,Math.min(12,sw*.036));anchor='controls';sockets=row(width/2-radius*2-gap,next.y,radius);
 }else if(!game.compact){
  radius=Math.max(8.5,Math.min(16,sw*.036));anchor='pedestal';
  const first=AWARD_REACH+.5+.006+radius/sw,step=Math.max(.08,(radius*2+2)/sw),tall=sw/2*game.stageFlatten;
  // On a small stage the lip's far end climbs toward the Next label: a seat that would touch it sits a little lower on the lip.
  sockets=[0,1,2].map(i=>{const u=first+i*step,x=width/2+(u-.5)*sw,y=game.stageY+(lipHeight(u)-.5)*tall,under=x+radius>control.left&&x-radius<control.right;return {x,y:under?Math.max(y,Math.min(control.bottom+3+radius,game.stageFront-radius)):y};});
 }else{
  radius=11;
  const end=tray.start+10*tray.stride+tray.cardWidth,span=radius*6+gap*2,fits=tray.contentWidth<=tray.viewportWidth&&width-end>=span+22;
  if(fits){anchor='tray';sockets=row(end+12+radius,tray.y+tray.cardHeight/2,radius);}
  else if(board){anchor='controls';sockets=row(Math.min(next.x,width-8-span/2)-radius*2-gap,control.bottom+6+radius,radius);}
  else{anchor='caption';
   // The caption box as the game lays it out in short landscape; the seats start just outside it and stop short of the Next control.
   const caption=Math.min(288,width-(width<650?181:224)-164),limit=next.x-next.size/2-6-span+radius;
   sockets=row(Math.min(width/2+caption/2+8+radius,limit),game.stageFront-11,radius);}
 }
 // The count is a moment, not a label: it stamps above the seats and is gone within a second.
 const size=Math.max(15,Math.min(24,radius*1.5)),reach=size*4.4,brief=size*1.7,centre=(sockets[0].x+sockets[2].x)/2,top=Math.min(...sockets.map(s=>s.y))-radius,level=(sockets[0].y+sockets[2].y)/2;
 type Stamp={x:number;y:number;size:number;reach:number;align:'centre'|'left'|'right';short:boolean};
 const above=(span:number,short:boolean):Stamp=>({x:Math.max(span+6,Math.min(width-span-6,centre)),y:top-size*.85,size,reach:span,align:'centre',short});
 const beside=(span:number,short:boolean,side:1|-1):Stamp=>({x:side>0?sockets[2].x+radius+9:sockets[0].x-radius-9,y:level,size,reach:span,align:side>0?'left':'right',short});
 // Where that would land on a control or run off the screen, it stamps beside the seats instead; where there is no room for the whole line, just the count.
 const clear=(stamp:Stamp)=>{const left=stamp.align==='centre'?stamp.x-stamp.reach:stamp.align==='left'?stamp.x:stamp.x-stamp.reach*2,right=left+stamp.reach*2;
  return left>=6&&right<=width-6&&stamp.y-size>0&&!controls.some(c=>right>c.left&&left<c.right&&stamp.y-size*.7<c.bottom&&stamp.y+size*.5>c.top);};
 const stamp=[above(reach,false),beside(reach,false,1),beside(reach,false,-1),above(brief,true),beside(brief,true,1),beside(brief,true,-1)].find(clear)??above(brief,true);
 return {anchor,radius,sockets,stamp};
}

/** Source-art hole centers, also used by the encounter's receiver sprite. */
export function showdownReceiverLayout(width:number,height:number,textureWidth:number,textureHeight:number){
 const trayWidth=width*(width<height?.93:.58),scale=trayWidth/textureWidth;
 const x=(width-trayWidth)/2,y=height*.49-textureHeight*scale/2;
 const typeScale=Math.min(1,width/600,height/600);
 return {x,y,scale,typeScale,titleY:y-54*typeScale,subtitleY:y-24*typeScale,
  holes:[610.5,1086,1561.5].map(sourceX=>({x:x+sourceX*scale,y:y+362*scale})),
  tokenScale:335*scale/30};
}
