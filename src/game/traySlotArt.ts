import {Texture} from 'pixi.js';

/** Margin around the tray art so rims and shadows have room outside the card slots. */
export const TRAY_PAD=6;
export type TrayMetrics={cardWidth:number;cardHeight:number;priceY:number;priceHeight:number;slotHeight:number;stride:number};
export type SlotState={index:number;next:boolean;special:boolean;image:{source:CanvasImageSource;width:number;height:number}|null};
/** One card slot at the origin: a shallow recess in the floor, light enough that the painting still reads through it.
 * Empty slots carry a faint emblem and number; the next one to be filled is lit from above, where its card is standing;
 * a filled one holds the card with a contact shadow. Nothing is drawn under an empty slot: the value arrives with the card. */
export function drawTraySlot(c:CanvasRenderingContext2D,m:TrayMetrics,s:SlotState){
 const w=m.cardWidth,h=m.cardHeight;
 c.save();
 // The recess: a thin veil of ink, deeper at its top edge where the lip shades it, and a lit lip along its foot.
 const well=c.createLinearGradient(0,0,0,h);well.addColorStop(0,s.next?'rgba(14,62,104,.5)':'rgba(5,28,54,.46)');well.addColorStop(.22,s.next?'rgba(20,84,132,.36)':'rgba(8,40,72,.3)');well.addColorStop(1,s.next?'rgba(40,120,170,.28)':'rgba(14,58,98,.24)');
 c.beginPath();c.roundRect(0,0,w,h,6);c.fillStyle=well;c.fill();
 const edge=c.createLinearGradient(0,0,0,h);edge.addColorStop(0,s.next?'rgba(226,251,255,.95)':'rgba(3,18,36,.5)');edge.addColorStop(.5,s.next?'rgba(170,236,255,.8)':'rgba(120,186,222,.26)');edge.addColorStop(1,s.next?'rgba(226,251,255,.95)':'rgba(190,236,255,.55)');
 c.strokeStyle=edge;c.lineWidth=s.next?1.8:1.1;c.stroke();
 if(s.image){
  // Seated card: its shadow lands on the floor of the recess just below it.
  const inset=1.5,cw=w-inset*2,ch=h-inset*2,radius=cw*.05,scale=Math.max(cw/s.image.width,ch/s.image.height),iw=s.image.width*scale,ih=s.image.height*scale;
  c.save();c.shadowColor='rgba(0,8,20,.6)';c.shadowBlur=6;c.shadowOffsetY=3;c.beginPath();c.roundRect(inset,inset,cw,ch,radius);c.fillStyle='#061c33';c.fill();c.restore();
  c.save();c.beginPath();c.roundRect(inset,inset,cw,ch,radius);c.clip();c.drawImage(s.image.source,inset+(cw-iw)/2,inset+(ch-ih)/2,iw,ih);
  const sheen=c.createLinearGradient(0,0,w*.9,h*.55);sheen.addColorStop(0,'rgba(255,255,255,.2)');sheen.addColorStop(.32,'rgba(255,255,255,.03)');sheen.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sheen;c.fillRect(0,0,w,h);c.restore();
  c.beginPath();c.roundRect(inset,inset,cw,ch,radius);c.strokeStyle=s.special?'rgba(255,229,154,.9)':'rgba(2,14,28,.6)';c.lineWidth=s.special?1.4:1;c.stroke();
 }else{
  const cx=w/2,cy=h*.44,r=w*.17,ink=s.next?'226,251,255':'150,206,236',alpha=s.next?.92:.34;
  c.strokeStyle=`rgba(${ink},${alpha})`;c.lineWidth=1.4;c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.moveTo(cx-r,cy);c.lineTo(cx-r*.36,cy);c.moveTo(cx+r*.36,cy);c.lineTo(cx+r,cy);c.stroke();c.beginPath();c.arc(cx,cy,r*.33,0,Math.PI*2);c.stroke();
  const label=Math.max(9,w*.115);c.font=`800 ${label}px Nunito, Arial`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=`rgba(${ink},${s.next?.95:.5})`;c.fillText(String(s.index+1).padStart(2,'0'),cx,h-label*1.2);
 }
 c.restore();
}
let shaft:Texture|undefined,shadow:Texture|undefined;
/** Light falling from the stage into the waiting slot: bright at its foot, gone before it reaches the pedestal. */
export function trayShaftTexture(){
 if(shaft)return shaft;if(typeof document==='undefined'||typeof document.createElement!=='function')return Texture.EMPTY;const canvas=document.createElement('canvas');canvas.width=64;canvas.height=160;const c=canvas.getContext('2d')!;
 const fall=c.createLinearGradient(0,0,0,160);fall.addColorStop(0,'rgba(170,236,255,0)');fall.addColorStop(.55,'rgba(170,236,255,.2)');fall.addColorStop(1,'rgba(214,250,255,.62)');c.fillStyle=fall;
 c.beginPath();c.moveTo(20,0);c.lineTo(44,0);c.lineTo(64,160);c.lineTo(0,160);c.closePath();c.fill();
 c.globalCompositeOperation='destination-in';const across=c.createLinearGradient(0,0,64,0);across.addColorStop(0,'rgba(0,0,0,0)');across.addColorStop(.3,'rgba(0,0,0,1)');across.addColorStop(.7,'rgba(0,0,0,1)');across.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=across;c.fillRect(0,0,64,160);
 return shaft=Texture.from(canvas);
}
/** A card's soft shadow on whatever lies under it while it travels. */
export function cardShadowTexture(){
 if(shadow)return shadow;if(typeof document==='undefined'||typeof document.createElement!=='function')return Texture.EMPTY;const canvas=document.createElement('canvas');canvas.width=96;canvas.height=128;const c=canvas.getContext('2d')!;
 c.shadowColor='rgba(1,8,18,.9)';c.shadowBlur=14;c.fillStyle='rgba(1,8,18,.9)';c.beginPath();c.roundRect(20,22,56,84,7);c.fill();
 return shadow=Texture.from(canvas);
}
