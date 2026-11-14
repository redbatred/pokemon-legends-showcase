import type {Graphics} from 'pixi.js';
const RED=0xd8405a;
/** The game's panel, shared by every modal: a slab with cut corners standing off the stadium, lit from above, with a brighter
 * header band over a seam, the red flash on its top-left corner, a red key on the seam, rivets, and an optional footer ledge
 * for buttons. Shapes only. */
export function drawPanel(g:Graphics,x:number,y:number,w:number,h:number,options:{head?:number;foot?:number;cut?:number}={}){
 const head=options.head??72,c=options.cut??16,cx=x+w/2;
 const shape=(n:number,dy=0)=>[x+c+n*.4,y+n+dy,x+w-c-n*.4,y+n+dy,x+w-n,y+c+n*.4+dy,x+w-n,y+h-c-n*.4+dy,x+w-c-n*.4,y+h-n+dy,x+c+n*.4,y+h-n+dy,x+n,y+h-c-n*.4+dy,x+n,y+c+n*.4+dy];
 const upper=(bottom:number)=>[x+c+1,y+1,x+w-c-1,y+1,x+w-1,y+c+1,x+w-1,y+bottom,x+1,y+bottom,x+1,y+c+1];
 // Contact shadow: the slab stands off what is behind it.
 g.poly(shape(-5,9)).fill({color:0x010810,alpha:.14}).poly(shape(-2,5)).fill({color:0x010810,alpha:.2});
 g.poly(shape(0)).fill({color:0x06182a,alpha:.97});
 // Light falls from above: stacked sheets brighten the upper half without a hard edge.
 for(let i=0;i<6;i++)g.poly(upper(h*(.56-i*.075))).fill({color:0x1c5786,alpha:.05});
 g.poly(upper(head)).fill({color:0x1d67a3,alpha:.5});
 // Ink outline, bright rim, and a faint inner line.
 g.poly(shape(-1.5)).stroke({color:0x07111e,width:3,alpha:.9}).poly(shape(0)).stroke({color:0xa9d9ea,width:1.6,alpha:.8}).poly(shape(4)).stroke({color:0xffffff,width:1,alpha:.08});
 g.moveTo(x+c+6,y+1.6).lineTo(x+w-c-6,y+1.6).stroke({color:0xffffff,width:1.3,alpha:.4});
 // The seam under the header, with the red key at its middle.
 g.moveTo(x+18,y+head).lineTo(x+w-18,y+head).stroke({color:0xbfe6f4,width:1.2,alpha:.45});
 g.poly([cx,y+head-5,cx+5,y+head,cx,y+head+5,cx-5,y+head]).fill(0xe5263f).stroke({color:0xffffff,width:1.2});
 // The red flash that wraps the top-left corner.
 g.poly([x+6,y+22,x+22,y+6,x+102,y+6,x+88,y+12,x+22,y+12,x+12,y+22,x+12,y+Math.min(head-6,68),x+6,y+Math.min(head,74)]).fill(RED);
 if(options.foot!==undefined){const fy=y+h-options.foot;
  g.poly([x+1,fy,x+w-1,fy,x+w-1,y+h-c-1,x+w-c-1,y+h-1,x+c+1,y+h-1,x+1,y+h-c-1]).fill({color:0x0e3350,alpha:.5});
  g.moveTo(x+18,fy).lineTo(x+w-18,fy).stroke({color:0x7fb0c4,width:1,alpha:.34});}
 // Rivets.
 for(const rx of [x+12,x+w-12])for(const ry of [y+head+10,y+h-14])g.circle(rx,ry,2).fill(0x82bdd0);
}
/** A row or tile inside a panel: a shallow plate a shade lighter than the slab, with a soft rim. */
export function drawPlate(g:Graphics,x:number,y:number,w:number,h:number,radius=10,lit=false){
 return g.roundRect(x,y,w,h,radius).fill({color:lit?0x16507c:0x0f3554,alpha:lit?.8:.66}).stroke({color:lit?0xbfe6f4:0x4f86a8,width:1,alpha:lit?.85:.6});
}
/** A small Poké Ball: red over white with a dark band and latch, lit from the upper left. */
export function drawBall(g:Graphics,cx:number,cy:number,r:number){
 g.circle(cx,cy+r*.14,r+1).fill({color:0x031a30,alpha:.4}).circle(cx,cy,r).fill(0xf6f8fb);
 g.moveTo(cx-r,cy).arc(cx,cy,r,Math.PI,Math.PI*2).closePath().fill(0xe5263f);
 g.moveTo(cx-r,cy).lineTo(cx+r,cy).stroke({color:0x061b32,width:Math.max(1.6,r*.18)}).circle(cx,cy,r).stroke({color:0x061b32,width:Math.max(1.4,r*.14)});
 g.circle(cx,cy,r*.36).fill(0x061b32).circle(cx,cy,r*.2).fill(0xffffff);
 return g.moveTo(cx-r*.55,cy-r*.45).quadraticCurveTo(cx-r*.2,cy-r*.82,cx+r*.2,cy-r*.7).stroke({color:0xffd0d4,width:Math.max(1,r*.11),cap:'round'});
}
