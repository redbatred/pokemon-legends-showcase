import {finalStrike} from './finalStrike';
import {smooth,WIN_RETURN_DURATION} from './winCinemaMotion';
import {winAttackBeats,type AttackBeat,type CinemaTier} from './winChoreography';

/** Released effects outlive the actor's action; a following windup cannot erase a hit. */
export function winEffectAge(age:number,beat:AttackBeat){
 const tail=beat.finisher?1.12:.82;
 return {visible:age>=beat.release&&age<beat.impact+tail,travel:smooth((age-beat.release)/(beat.impact-beat.release)),after:age-beat.impact,tail};
}
export function winScoreHit(age:number,tier:CinemaTier){
 const beat=winAttackBeats(tier).filter(b=>b.impact<=age).at(-1);
 return {age:beat?age-beat.impact:99,strength:beat?(beat.finisher?1.45:.6+beat.strength*.32):0};
}
/** Hold the close camera through contact, then ease back with the physical recovery. */
export function winCameraBeat(age:number,tier:CinemaTier,reduced=false){
 let focus=0,dolly=0,bank=0;
 if(reduced)return {focus,dolly,bank};
 for(const [i,beat] of winAttackBeats(tier).entries()){
  const build=smooth((age-beat.start)/(beat.release-beat.start));
  const release=1-smooth((age-beat.impact-.08)/(beat.finisher?.85:.48));
  const pressure=build*release;
  focus+=beat.finisher?pressure:0;
  dolly+=pressure*(beat.finisher?.11:.035);
  bank+=pressure*(i%2?-1:1)*(beat.finisher?.018:.008);
 }
 return {focus,dolly,bank};
}
/** A single held total; build tension just before impact and resolve into a still award. */
export function winAmountBody(age:number,reduced=false){
 const p=finalStrike(age,reduced);return {x:p.amountX,y:p.amountY,lift:p.lift};
}
/** Keep the game beneath the award covered while its camera and actor yield. */
export function winReturnPose(age:number){
 return {scene:1-smooth((age-.12)/.50),alpha:1-smooth((age-.78)/.26),curtain:Math.sin(Math.PI*smooth(age/WIN_RETURN_DURATION)),pull:(()=>{const t=Math.max(0,Math.min(1,age/.98));return t*t*t*(t*(t*6-15)+10);})(),transfer:Math.max(0,age-.48)};
}
