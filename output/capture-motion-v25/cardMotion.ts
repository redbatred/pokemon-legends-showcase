const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
/** Seconds around the face-up moment (age 0). The face lands at `land` and is held for `hold` before it rings out. */
export const CARD={wind:-.28,land:.18,hold:.07};
/** The card has one reveal impulse. Tally milestones never feed back into it.
 * It hangs and trembles, winds a little the wrong way, commits to one turn with a push toward the lens,
 * lands, holds the contact for a few frames, rings out and then only sways. */
export function cardMotion(age:number){
 const turn=age<0?.5*smooth((age-CARD.wind)/-CARD.wind):.5+.5*smooth(age/CARD.land);
 const anticipation=smooth((age+.75)/.45)*(1-smooth((age-CARD.wind)/-CARD.wind));
 // Contact is held: nothing recoils until the hold has passed.
 const landed=age-CARD.land,hit=landed-CARD.hold,ring=Math.max(0,hit);
 const push=landed<0?.085*smooth((age+.3)/(CARD.land+.3))**2:.085*Math.exp(-ring*7)*Math.cos(ring*18);
 const rotation=landed>=0?.045*Math.exp(-ring*6)*Math.sin(ring*18):Math.sin(age*34)*.009*anticipation;
 const settle=smooth((age-.55)/.9);
 return {turn,scale:1+push-.035*anticipation,rotation,skew:.065*Math.sin(turn*Math.PI),face:age>=0,
  /** Rotation about the vertical axis: π shows the back, 0 the face. It winds away before the turn and overshoots the landing. */
  yaw:Math.PI*(1-turn)+.24*anticipation-(landed>=0?.2*Math.exp(-ring*8)*Math.cos(ring*15):0),
  /** Slow parallax once it has settled. */
  swayYaw:.085*Math.sin((age-.55)*.82)*settle,swayPitch:.05*Math.sin((age-.55)*.63+1.1)*settle,
  tremble:anticipation,
  /** Light building behind the card while it hangs, released by the turn. */
  leak:smooth((age+1.0)/.6)*(1-smooth((age+.02)/.2)),
  /** The frame of contact: 1 while held, gone a moment later. */
  impact:landed<0?0:landed<CARD.hold?1:Math.exp(-(landed-CARD.hold)*16),
  /** A single hard highlight crosses the foil once after the landing: -1 before, 1 after. */
  sweep:-1.2+2.5*smooth((age-CARD.land-CARD.hold)/.75)};
}
