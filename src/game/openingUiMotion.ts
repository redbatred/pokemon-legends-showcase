import {PACK_CLEARANCE_TIME} from './packTearGeometry';
import {PACK_ARRIVAL_TIME} from './packOpeningMotion';
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
/** Every dock/action follows the same physical opening and camera journey clock. */
export function openingUiPose(time:number){
 const packs=1-smooth((time-.7)/.8),cards=smooth((time-PACK_CLEARANCE_TIME)/(PACK_ARRIVAL_TIME-PACK_CLEARANCE_TIME));
 return {packs,cards,controls:smooth((time-PACK_ARRIVAL_TIME)/.20),open:1-smooth((time-.18)/.35)};
}
const unit=(v:number)=>Math.max(0,Math.min(1,v)),ease=(v:number)=>{const p=unit(v);return p*p*(3-2*p);};
/** A revealed card's trip into its tray slot, 0..1. It lifts and tips first (anticipation), hangs briefly, then falls and arrives
 * with speed; the slot, not the flight, plays the overshoot. `travel` runs along the path, `shrink` is how far it has receded,
 * `height` is how far it is above whatever its shadow falls on. */
export function trayFlightPose(t:number){
 const p=unit(t),rise=ease(p/.2),fall=unit((p-.14)/.86),travel=fall*fall*(3-2*fall)*(.55+.45*fall);
 return {travel,shrink:ease((p-.1)/.9)**1.15,lift:Math.sin(Math.PI*unit(p/.42))*(1-fall*.4),tip:rise*(1-ease((p-.72)/.28)),lean:Math.sin(Math.PI*travel)*(1-.4*travel),height:Math.sin(Math.PI*unit(p/.94))**.8*(1-p*.25)};
}

