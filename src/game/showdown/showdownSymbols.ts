/** Presentation fixtures only. Production math will supply these positions in the outcome. */
export function validShowdownSymbols(positions:unknown,rewardCount:number):positions is number[]{
 return Array.isArray(positions)&&positions.length<=3&&new Set(positions).size===positions.length&&positions.every(p=>Number.isInteger(p)&&p>=0&&p<rewardCount);
}
export function qualifiesForShowdown(positions:unknown,rewardCount:number){return validShowdownSymbols(positions,rewardCount)&&positions.length===3;}
export function assignMockShowdownSymbols(rewardCount:number,armed=false,rng=Math.random):number[]{
 const positions=Array.from({length:rewardCount},(_,i)=>i);
 if(armed)return [Math.floor(rewardCount*.1),Math.floor(rewardCount*.4),Math.floor(rewardCount*.7)];
 return positions.filter(()=>rng()<.12).slice(0,3);
}
export function revealedShowdownSymbols(positions:readonly number[],revealed:readonly number[]){return positions.filter(p=>revealed.includes(p));}
