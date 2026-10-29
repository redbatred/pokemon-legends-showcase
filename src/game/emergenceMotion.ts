const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
/** The model's foot anchor is 154 units below its origin. Grow upward from the opening, then land forward. */
export function emergencePose(progress:number,source:{x:number;y:number},target:{x:number;y:number},grounded:boolean){
 const p=clamp(progress),travel=smooth(p),sine=p===0||p===1?0:Math.sin(Math.PI*p),scale=.018+.982*smooth((p-.04)/.86),arc=sine*(grounded?29:58);
 const foot=source.y+(target.y+154-source.y)*travel-arc;
 return {x:source.x+(target.x-source.x)*travel+sine*(grounded?-15:25),y:foot-154*scale,scale,alpha:smooth(p/.12),white:1-smooth((p-.34)/.42),shell:1-smooth((p-.18)/.16)};
}
export function emergenceTiming(open:number,entry:number,chargeDuration:number,attackDuration:number,recoveryDuration:number){
 const form=open+.20,charge=form+entry+.16,attack=charge+chargeDuration,attackEnd=attack+attackDuration;
 return {form,charge,attack,attackEnd,recoverEnd:attackEnd+recoveryDuration,win:form+Math.min(.38,entry*.5)};
}
