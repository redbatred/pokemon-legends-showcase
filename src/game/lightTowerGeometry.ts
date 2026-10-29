/** Silhouettes measured in the arena's 1672 × 941 art coordinate system. */
export const lightHeads=[
 [[207,211],[225,210],[300,247],[292,287],[276,291],[198,256]],
 [[1465,211],[1447,210],[1372,247],[1380,287],[1396,291],[1474,256]],
];
const towerErase=[[196,207],[228,207],[304,245],[297,291],[268,298],[261,359],[207,346],[214,271],[194,258]];
function polygon(c:CanvasRenderingContext2D,points:number[][]){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
/** Remove the old broad white supports before the independent foreground foliage is composed. */
export function clearLightTowers(c:CanvasRenderingContext2D,w:number,h:number){
 c.save();c.scale(w/1672,h/941);c.globalCompositeOperation='destination-out';c.fillStyle='#000';
 for(const side of [false,true]){polygon(c,towerErase.map(([x,y])=>[side?1672-x:x,y]));c.fill();}c.restore();
}
/** Only the lamp faces are copied. Narrow shaded steel trusses replace the white backplates. */
export function drawLightTowers(c:CanvasRenderingContext2D,source:CanvasImageSource,w:number,h:number){
 c.save();c.scale(w/1672,h/941);
 for(let bank=0;bank<2;bank++){
  const mirror=(points:number[][])=>points.map(([x,y])=>[bank?1672-x:x,y]);
  polygon(c,mirror([[232,269],[249,278],[241,354],[224,346]]));c.fillStyle='#224d79';c.fill();c.strokeStyle='#163858';c.lineWidth=2;c.stroke();
  c.strokeStyle='#74acd0';c.lineWidth=2;c.beginPath();for(const line of [[[234,279],[226,345]],[[246,282],[239,349]],[[233,288],[244,305],[229,318],[241,335]]]){mirror(line).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));}c.stroke();
  c.save();polygon(c,lightHeads[bank]);c.clip();c.drawImage(source,0,0,1672,941);c.restore();
  // The illustrated light bank's side panel is blue metal, without a pale opaque rectangle.
  polygon(c,mirror([[207,212],[224,211],[216,251],[199,256]]));c.fillStyle='#316496';c.fill();c.strokeStyle='#16426b';c.lineWidth=1.5;c.stroke();
  c.beginPath();mirror([[209,214],[221,213],[214,246]]).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle='#7ab5de';c.lineWidth=1;c.stroke();
 }
 c.restore();
}
