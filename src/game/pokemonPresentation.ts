/** Frame padding varies by species/attack; size the silhouette, then bound its complete animation envelope. */
export function pokemonFrameSpan(bodyHeight:number,frameWidth:number,horizontalAnchor:number,halfWidth:number){
 const desired=435/Math.max(.12,bodyHeight),available=Math.max(160,halfWidth*2-24);
 return Math.min(desired,available/Math.max(.2,frameWidth+Math.abs(horizontalAnchor)));
}

/** Imported rigs use different units. Fit the camera's depth to the complete animated volume. */
export function pokemonCameraDepth(span:number,depth:number){
 const padding=Math.max(.01,span),distance=padding*2+depth/2;
 return {distance,near:Math.max(.001,padding*.01),far:distance+depth/2+padding};
}
