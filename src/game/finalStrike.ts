import {smooth,unit,WIN_CINEMA_FINISH,FINAL_STRIKE_RELEASE} from './winCinemaMotion';
/** Contact changes the value once; one finite envelope moves the entire award and lens. */
export function finalStrike(age:number,reduced=false){
 if(reduced)return {hit:0,amountX:1,amountY:1,lift:0,zoom:0};
 const t=age-WIN_CINEMA_FINISH,compress=smooth((t+.30)/.18)*(1-smooth(t/.065));
 const hit=smooth(t/.065)*(1-smooth((t-.065)/.885));
 return {hit,amountX:1+compress*.055+hit*.24,amountY:1-compress*.18+hit*.38,lift:hit*.016,zoom:hit*.17};
}
/** The last projectile accelerates into contact; the recovery is separate from travel. */
export function finalStrikeTravel(age:number){return age>=WIN_CINEMA_FINISH?1:unit((age-FINAL_STRIKE_RELEASE)/(WIN_CINEMA_FINISH-FINAL_STRIKE_RELEASE))**2.4;}
