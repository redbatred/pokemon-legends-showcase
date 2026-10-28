/** Presentation-only accounting. Demo credits are still settled by the game model. */
export class WinLedger {
 identity='';total=0;private seen=new Set<number>();private pending=new Map<number,number>();
 reset(identity:string,previous:number[]=[]){this.identity=identity;this.total=previous.reduce((a,b)=>a+b,0);this.seen=new Set(previous.map((_,i)=>i));this.pending.clear();}
 offer(index:number,amount:number){if(this.seen.has(index))return false;this.seen.add(index);this.pending.set(index,Math.max(0,amount));return true;}
 settle(index:number){const amount=this.pending.get(index);if(amount===undefined)return false;this.pending.delete(index);this.total+=amount;return true;}
}
export const WIN_COUNT_TIME=.27,WIN_HOLD_TIME=.12,WIN_FOLD_TIME=.10,WIN_FLIGHT_TIME=.30;
export const WIN_LAUNCH_TIME=WIN_COUNT_TIME+WIN_HOLD_TIME+WIN_FOLD_TIME;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function winFlightPose(age:number,from:{x:number;y:number},to:{x:number;y:number}){
 const p=clamp((age-WIN_LAUNCH_TIME)/WIN_FLIGHT_TIME),t=p*p*(3-2*p),distance=Math.hypot(to.x-from.x,to.y-from.y);
 const cx=from.x+(to.x-from.x)*.42,cy=Math.min(from.y,to.y)-Math.min(72,distance*.22);
 return {x:(1-t)**2*from.x+2*(1-t)*t*cx+t*t*to.x,y:(1-t)**2*from.y+2*(1-t)*t*cy+t*t*to.y,progress:p,blend:t,fold:clamp((age-WIN_COUNT_TIME-WIN_HOLD_TIME)/WIN_FOLD_TIME),done:age>=WIN_LAUNCH_TIME+WIN_FLIGHT_TIME};
}

export type WinTier='special'|'big'|'epic'|null;
export function winTier(card:{id:string;rarity:string;value:number},price:number,preview=false):WinTier{
 if(card.id==='energy'||card.value<=0)return null;const ratio=card.value/Math.max(100,price);
 if(ratio>=8)return 'epic';if(ratio>=2)return 'big';if(preview||ratio>=1||/illustration|ultra|special|hyper|secret/i.test(card.rarity))return 'special';return null;
}
