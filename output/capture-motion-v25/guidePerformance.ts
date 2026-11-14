import type {Taunt} from './voiceBank';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
/** Anticipation → speaking gesture → stressed word → recovery; never a looping reset. */
export function guidePerformance(meta:Taunt,age:number,amp:number,reduced=false){
 const voiceAge=Math.max(0,age-.16),p=clamp(voiceAge/meta.duration),angry=meta.phase==='caught';
 const row=(meta.character==='Jessie'?0:1)+(angry?2:0);
 const cel=reduced?0:p<.10?0:p<.30?1:p<.80?2:3;
 const accent=amp*amp*Math.sin(Math.PI*clamp(p/.8)),settle=Math.sin(age*12)*Math.exp(-Math.max(0,age-.2)*6);
 return{frame:row*4+cel,rotation:reduced?0:(angry?-1:1)*(1.8*Math.sin(p*Math.PI)+accent*2.7),head:reduced?0:(angry?-1:1)*(Math.sin(p*Math.PI*2)*3+amp*2),hair:reduced?0:Math.sin(age*7-.7)*(2+amp*2),gesture:reduced?0:(angry?-1:1)*Math.sin(p*Math.PI)*7,offset:reduced?0:-amp*2.5+settle*2,accent:reduced?0:accent};
}
