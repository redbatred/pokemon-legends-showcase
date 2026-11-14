import {winAttackBeats,type CinemaTier} from './winChoreography';
import {smooth} from './winCinemaMotion';
/** Impact causes a bounded response, never a repeating background spectacle. */
export function arenaImpact(age:number,tier:CinemaTier,reduced=false){
 const beat=winAttackBeats(tier).filter(b=>age>=b.impact).at(-1),t=beat?age-beat.impact:99;
 const visible=!reduced&&t<.68,strength=beat?.finisher?1.35: .7;
 return {visible,time:t,radius:Math.min(5.4,.5+t*7.2),light:!reduced&&t<.68?Math.exp(-t*8)*strength:0,flag:!reduced&&t>.22&&t<.9?Math.sin((t-.22)/.68*Math.PI)*strength:0,strength};
}
export function releaseImpactTiming(age:number,duration:number,grounded:boolean){return {release:age,landing:grounded?age-.20-duration:-1};}
export function groundWave(age:number,tier:CinemaTier,reduced=false){const p=arenaImpact(age,tier,reduced);return {radius:p.radius,alpha:p.visible?(1-smooth(p.time/.68))*p.strength:0};}
