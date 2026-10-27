import type {AnimationMixer,AnimationAction} from 'three';
/** Advance blend weights and action pose from the same reveal clock, including stalled frames. */
export function sampleAttack(mixer:AnimationMixer,action:AnimationAction,seconds:number,previous:number,seek:number,speed:number,wallDelta?:number){
 const dt=wallDelta??Math.max(0,seconds-previous),target=Math.min(action.getClip().duration,seek+seconds*speed);
 action.time=target-dt*action.getEffectiveTimeScale();mixer.update(dt);
 return seconds;
}
