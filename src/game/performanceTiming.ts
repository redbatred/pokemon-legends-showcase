import type {MoveRig} from './moveRig';
/** Active effects finish first; the genuine action then completes its recovery before idle blending. */
export function performanceTiming(species:string,clipDuration:number,rig?:MoveRig){
 const seek=rig?.seek??0,speed=rig?.speed??1.4,powerAt=rig?.powerAt??clipDuration*.36,end=rig?.end??Math.min(clipDuration,powerAt+1.26);
 const recoveryEnd=Math.min(clipDuration,rig?.recoveryEnd??({blastoise:4.3,greninja:1.8} as Record<string,number>)[species]??clipDuration);
 const charge=Math.max(.25,(powerAt-seek)/speed),attack=Math.max(.3,(end-powerAt)/speed),recovery=Math.max(.2,Math.min(1.35,(recoveryEnd-end)/(rig?.recoverySpeed??1.75)));
 return {seek,speed,powerAt,end,recoveryEnd,charge,attack,recovery,sourceAt:(seconds:number)=>seconds<=charge+attack?Math.min(end,seek+seconds*speed):end+(recoveryEnd-end)*Math.min(1,(seconds-charge-attack)/recovery)};
}
