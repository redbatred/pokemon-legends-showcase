/** Presentation only: the card has already been drawn and its value is never modified. */
export function revealSuspense(special:boolean,fast:boolean,previousTease:boolean,roll=Math.random()){
 return fast?0:special?1.3:!previousTease&&roll<.2?.62:0;
}
