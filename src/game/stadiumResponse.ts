import {smooth} from './winCinemaMotion';
import {winAttackBeats,type CinemaTier} from './winChoreography';
/** One continuous impulse per strike; delayed cloth/crowd response follows pressure. */
export function stadiumResponse(age:number,tier:CinemaTier,reduced=false){
 const result={charge:0,light:0,recoil:0,lift:0,roll:0,cloth:0,crowd:0,afterglow:0};
 if(reduced)return result;
 for(const [i,beat] of winAttackBeats(tier).entries()){
  const t=age-beat.impact,strength=beat.finisher?1.65+beat.strength*.28:.65+beat.strength*.2;
  result.charge+=smooth((age-beat.start)/(beat.release-beat.start))*(1-smooth((age-beat.release)/(beat.impact-beat.release)))*(beat.finisher?1:.35);
  if(t<0||t>=1.7)continue;
  const contact=smooth(t/.055),tail=1-smooth((t-.75)/.95);
  result.light+=contact*Math.exp(-t*(beat.finisher?2.6:4.2))*strength*tail;
  result.recoil+=contact*Math.sin(t*14)*Math.exp(-t*4.6)*strength*tail;
  result.lift+=contact*Math.sin(t*9)*Math.exp(-t*4)*strength*tail;
  result.roll+=contact*Math.sin(t*12)*Math.exp(-t*5)*strength*(i%2?-1:1)*tail;
  result.cloth+=smooth((t-.14)/.16)*(1-smooth((t-.45)/1.1))*strength;
  result.crowd+=smooth((t-.23)/.19)*(1-smooth((t-.65)/1))*strength;
  result.afterglow+=smooth(t/.20)*(1-smooth((t-.32)/(beat.finisher?1.28:.65)))*strength;
 }
 return result;
}
export type StadiumResponse=ReturnType<typeof stadiumResponse>;
