import type {Graphics} from 'pixi.js';
/** Where the parts of the result panel sit inside a frame `h` tall whose total area is `total`. */
export function resultPanelParts(h:number,total?:{x:number;y:number;width:number;height:number}){
 const compact=h<440,head=compact?58:72,foot=h-78;
 const plate=total?{x:total.x-total.width/2,y:Math.max(head+7,total.y-total.height/2+2),width:total.width,bottom:total.y+total.height/2-4}:null;
 return {compact,head,foot,plate:plate&&{x:plate.x,y:plate.y,width:plate.width,height:plate.bottom-plate.y}};
}
/** The result panel as an object: a raised slab with a lit header, a recessed plate the total sits on and a footer ledge.
 * Drawn with shapes only; `ox`,`oy` place the frame, `alpha` cross-fades it in under the award. */
export function drawResultPanel(g:Graphics,ox:number,oy:number,w:number,h:number,total?:{x:number;y:number;width:number;height:number},alpha=1){
 const a=alpha,{head,foot,plate}=resultPanelParts(h,total),x=ox+8,y=oy+8,pw=w-16,ph=h-16,cx=ox+w/2;
 // Contact shadow: the slab stands off the stadium behind it.
 g.roundRect(x-5,y+9,pw+10,ph+2,22).fill({color:0x010810,alpha:.14*a}).roundRect(x-2,y+5,pw+4,ph+2,19).fill({color:0x010810,alpha:.2*a});
 g.roundRect(x,y,pw,ph,16).fill({color:0x06182a,alpha:.96*a});
 // Light falls from above: stacked sheets brighten the upper half without a hard edge.
 for(let i=0;i<6;i++)g.roundRect(x,y,pw,ph*(.56-i*.075),16).fill({color:0x1c5786,alpha:.05*a});
 // Lit header and its squared lower edge.
 g.roundRect(x+1,y+1,pw-2,head-9,15).fill({color:0x1a5c8c,alpha:.42*a}).rect(x+1,oy+head-14,pw-2,14).fill({color:0x1a5c8c,alpha:.42*a});
 g.roundRect(x,y,pw,ph,16).stroke({color:0xa9d9ea,width:1.5,alpha:.62*a}).roundRect(x+2.5,y+2.5,pw-5,ph-5,14).stroke({color:0xffffff,width:1,alpha:.07*a});
 g.moveTo(x+22,y+1.4).lineTo(x+pw-22,y+1.4).stroke({color:0xffffff,width:1.3,alpha:.38*a});
 // Gold rule under the header with a red key in the middle: the game's ball colours, as a seam.
 const rule=Math.min(240,w*.36);g.moveTo(x+20,oy+head).lineTo(x+pw-20,oy+head).stroke({color:0x7fb0c4,width:1,alpha:.3*a}).moveTo(cx-rule/2,oy+head).lineTo(cx+rule/2,oy+head).stroke({color:0xf0c75e,width:2,alpha:.9*a});
 g.poly([cx,oy+head-5.5,cx+5.5,oy+head,cx,oy+head+5.5,cx-5.5,oy+head]).fill({color:0xe5263f,alpha:a}).stroke({color:0xfff2cf,width:1.3,alpha:a});
 // The total's plate is cut into the slab: dark inside, shaded along its top, lit along the lip coins land on.
 if(plate){const px=ox+plate.x,py=oy+plate.y;
  g.roundRect(px,py,plate.width,plate.height,12).fill({color:0x020b15,alpha:.58*a}).stroke({color:0xf0c75e,width:1,alpha:.22*a});
  for(let i=0;i<4;i++)g.roundRect(px+1,py+1,plate.width-2,10-i*2,11).fill({color:0x000000,alpha:.1*a});
  g.moveTo(px+14,py+plate.height-.6).lineTo(px+plate.width-14,py+plate.height-.6).stroke({color:0xbfe6f4,width:1.4,alpha:.42*a});}
 // Footer ledge for the buttons.
 g.roundRect(x+1,oy+foot,pw-2,h-8-foot-1,15).fill({color:0x0e3350,alpha:.5*a}).rect(x+1,oy+foot,pw-2,16).fill({color:0x0e3350,alpha:.5*a});
 g.moveTo(x+20,oy+foot).lineTo(x+pw-20,oy+foot).stroke({color:0x7fb0c4,width:1,alpha:.34*a}).moveTo(x+20,oy+foot+1.5).lineTo(x+pw-20,oy+foot+1.5).stroke({color:0xffffff,width:1,alpha:.06*a});
}
