/** Frame padding varies by species/attack; size the silhouette, then bound its complete animation envelope. */
export function pokemonFrameSpan(bodyHeight:number,frameWidth:number,horizontalAnchor:number,halfWidth:number){
 const desired=435/Math.max(.12,bodyHeight),available=Math.max(160,halfWidth*2-24);
 return Math.min(desired,available/Math.max(.2,frameWidth+Math.abs(horizontalAnchor)));
}
