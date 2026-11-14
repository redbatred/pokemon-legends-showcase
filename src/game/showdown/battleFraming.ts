import {smooth,type Strike} from './showdownModel';
/** A close two-shot during combat, easing back for the complete card reveal. */
export function battleCameraZoom(time:number,wide:boolean,reduced:boolean){
 if(time<0||reduced)return 1;
 const close=smooth(time/.7);
 const release=1-smooth((time-9.05)/.7);
 return 1+(wide?.12:.04)*close*release;
}
/** Brief contact holds affect poses, never the encounter/audio/outcome clock. */
export function impactPresentationTime(time:number,strikes:readonly Strike[],reduced:boolean){
 if(reduced)return time;
 const hit=[...strikes].reverse().find(s=>time>=s.at);if(!hit)return time;
 const age=time-hit.at,hold=hit.finisher?.115:.075,end=hit.finisher?.32:.23;
 if(age<=.035||age>=end)return time;
 if(age<=hold)return hit.at+.035;
 return time-(hold-.035)*(1-smooth((age-hold)/(end-hold)));
}
