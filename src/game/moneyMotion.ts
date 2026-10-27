export type MoneyState={identity:string;value:number;target:number;remaining:number};
export const moneyDuration=(delta:number)=>Math.min(.85,.28+Math.log10(Math.abs(delta)+1)*.08);
/** Persist the actual displayed cents, so redraws never jump to a queued destination. */
export function moneyState(previous:MoneyState|undefined,identity:string,target:number,initialStatic:boolean):MoneyState{
 if(previous?.identity===identity&&previous.target===target)return previous;
 const value=previous?.identity===identity?previous.value:initialStatic?target:0;
 return {identity,value,target,remaining:value===target?0:moneyDuration(target-value)};
}
