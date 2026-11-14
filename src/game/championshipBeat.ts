import {smooth,WIN_CINEMA_FINISH} from './winCinemaMotion';
import {winTierProfile,type CinemaTier} from './winChoreography';
/** One screen-wide contact, a cleared award, then a held championship shot. */
export function championshipBeat(age:number,tier:CinemaTier,exitAge=0,reduced=false){
 const t=age-WIN_CINEMA_FINISH,rank=winTierProfile(tier).rank,release=1-smooth(exitAge/.62);
 return {burst:reduced||t<0?0:(1-smooth((t-.07)/.45))*release,spread:smooth((t-.035)/.45),reveal:smooth((t-.10)/.55)*release,light:(.35+smooth((t-.10)/.55)*(.32+rank*.12))*release};
}
/** The finisher's eye beat, in real time: the lens closes on the eyes, the eyes flash, then it snaps back for the release. */
export const EYE_BEAT={push:5.12,bars:5.22,glint:5.40,snap:5.60};
/** Camera weight of the eye shot; cleared before the projectile leaves. */
export function winAttackCloseup(age:number,reduced=false){return reduced?0:smooth((age-EYE_BEAT.push)/.18)*(1-smooth((age-EYE_BEAT.snap)/.12));}
/** Letterbox bars that close to a strip across the eyes and open on the snap. */
export function eyeBars(age:number,reduced=false){return reduced?0:smooth((age-EYE_BEAT.bars)/.08)*(1-smooth((age-EYE_BEAT.snap)/.08));}
