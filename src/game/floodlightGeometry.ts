/** Measured bulb centres in the 1672 × 941 arena artwork. Three rows × seven per bank. */
const left=[
 [[229.92,224.79],[240.10,229.54],[250.14,235.11],[259.79,239.82],[270.59,245.41],[279.72,250.14],[288.38,254.38]],
 [[227.66,235.06],[238.15,240.79],[248.32,245.36],[258.04,250.24],[268.13,255.40],[277.48,259.44],[286.25,264.57]],
 [[225.33,246.45],[235.19,251.72],[245.00,255.58],[255.30,260.82],[265.44,265.78],[274.64,270.18],[283.81,274.52]],
];
const right=[
 [[1442.01,224.11],[1431.25,229.31],[1420.89,235.39],[1411.51,240.25],[1401.81,245.38],[1392.93,249.93],[1384.46,254.30]],
 [[1444.21,234.97],[1433.28,240.36],[1422.84,245.34],[1413.79,249.97],[1403.91,255.43],[1394.83,259.60],[1385.52,263.97]],
 [[1447.11,246.27],[1436.12,251.75],[1426.50,255.62],[1415.68,261.48],[1406.87,265.58],[1397.28,269.97],[1388.43,274.43]],
];
export const floodlightBulbs=[left,right].flatMap((bank,side)=>bank.flatMap((row,r)=>row.map(([x,y],column)=>({u:x/1672,v:y/941,bank:side,row:r,column}))));
export type LightSocket={x:number;y:number;width:number;height:number;rotation:number;bank:number;row:number;column:number};
/** A fixed field angle expands with throw distance; the receiver sits before the soft far cutoff. */
export function floodlightCone(source:{x:number;y:number},target:{x:number;y:number},fieldAngle=32){
 const dx=target.x-source.x,dy=target.y-source.y,distance=Math.hypot(dx,dy),length=distance*1.18;
 return {length,width:2*length*Math.tan(fieldAngle*Math.PI/360),rotation:-Math.atan2(dx,dy),receiver:distance/length};
}
export function projectFloodlights(project:(u:number,v:number)=>{x:number;y:number}):LightSocket[]{return floodlightBulbs.map(b=>{
 const p=project(b.u,b.v),x=project(b.u+3.8/1672,b.v+1.8/941*(b.bank?-1:1)),y=project(b.u-1.05/1672*(b.bank?-1:1),b.v+4.4/941);
 return {...p,bank:b.bank,row:b.row,column:b.column,width:Math.hypot(x.x-p.x,x.y-p.y)*2,height:Math.hypot(y.x-p.x,y.y-p.y)*2,rotation:Math.atan2(x.y-p.y,x.x-p.x)};
});}
