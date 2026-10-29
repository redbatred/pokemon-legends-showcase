import {PACK_CLEARANCE_TIME} from './packTearGeometry';
import {PACK_ARRIVAL_TIME} from './packOpeningMotion';
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t);};
/** Every dock/action follows the same physical opening and camera journey clock. */
export function openingUiPose(time:number){
 const packs=1-smooth((time-.7)/.8),cards=smooth((time-PACK_CLEARANCE_TIME)/(PACK_ARRIVAL_TIME-PACK_CLEARANCE_TIME));
 return {packs,cards,controls:smooth((time-PACK_ARRIVAL_TIME)/.20),open:1-smooth((time-.18)/.35)};
}
