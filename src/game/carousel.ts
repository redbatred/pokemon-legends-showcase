/** Drag positions are pixels; velocity is pixels per millisecond. */
export function railPosition(value:number,max:number){return Math.max(0,Math.min(max,value));}
export function railElastic(value:number,max:number){return value<0?value*.22:value>max?max+(value-max)*.22:value;}
export function railSnap(value:number,velocity:number,stride:number,max:number){
  const projected=value+Math.max(-3,Math.min(3,velocity))*190;
  return railPosition(Math.round(projected/stride)*stride,max);
}
