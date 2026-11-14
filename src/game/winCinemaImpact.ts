import {finalStrike} from './finalStrike';
import {smooth,unit,WIN_CINEMA_FINISH,WIN_CINEMA_IMPACT} from './winCinemaMotion';
export const WIN_ATTACK_RELEASE=1.08;
/** A single attack reaches the lens before the arena is revealed. */
export function attackTransition(age:number,reduced=false){
 if(reduced)return{travel:1,frame:15,arena:1,visible:false,charge:0};
 const travel=unit((age-WIN_ATTACK_RELEASE)/(WIN_CINEMA_IMPACT-WIN_ATTACK_RELEASE));
 return {travel,frame:age<WIN_CINEMA_IMPACT?travel*6:6+(age-WIN_CINEMA_IMPACT)/.63*9,arena:smooth((age-WIN_CINEMA_IMPACT+.02)/.28),visible:age>=WIN_ATTACK_RELEASE&&age<WIN_CINEMA_IMPACT+.63,charge:smooth((age-.5)/.55)*(1-travel)};
}
/** One impact with recovery: exact-total hit-stop, lens punch, shake, light wave. */
export function finalWinImpact(age:number,reduced=false){
 const t=age-WIN_CINEMA_FINISH;if(reduced||t<0)return{energy:0,zoom:0,shake:0,hold:1,flash:0,ring:0,echo:0};
 return {energy:Math.exp(-t*3.6),zoom:finalStrike(age).zoom,shake:.055*Math.exp(-t*8)*Math.sin(t*63),hold:t<.095?.06:1,flash:Math.max(0,1-t/.075)*.42,ring:unit(t/.85),echo:smooth(t/.06)*(1-smooth((t-.12)/.5))};
}
