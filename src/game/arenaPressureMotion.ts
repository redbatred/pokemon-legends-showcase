import {winAttackBeats,type CinemaTier} from './winChoreography';
export function arenaPressureMotion(age:number,tier:CinemaTier,reduced=false){
 const beat=winAttackBeats(tier).filter(b=>age>=b.start).at(-1),after=beat?age-beat.impact:99;
 if(reduced||!beat||after>=.96)return {visible:false,animation:'burst',time:0,strength:0,lift:0};
 if(after<0)return {visible:true,animation:'gather',time:(age-beat.start)/(beat.impact-beat.start),strength:beat.finisher?1.12:.82,lift:0};
 return {visible:true,animation:'burst',time:after,strength:beat.finisher?1.28:.85,lift:Math.sin(after/.96*Math.PI)*28};
}
