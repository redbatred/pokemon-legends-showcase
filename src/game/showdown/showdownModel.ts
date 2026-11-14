export type ShowdownId='classic'|'legendary';
export type Point={x:number;y:number};
export interface Strike {at:number;title:string;finisher?:boolean}
export interface ShowdownRound {id:ShowdownId;name:string;duration:number;rewardMultiplier:number;strikes:Strike[]}
export const SHOWDOWN_DURATION=13;
export const SHOWDOWNS:ShowdownRound[]=[
 {id:'classic',name:'Classic vault',duration:SHOWDOWN_DURATION,rewardMultiplier:50,strikes:[{at:3,title:'Flamethrower'},{at:5.8,title:'Fire Blast'},{at:8.6,title:'Blast Burn',finisher:true}]},
 {id:'legendary',name:'Legendary vault',duration:SHOWDOWN_DURATION,rewardMultiplier:180,strikes:[{at:3,title:'Flamethrower'},{at:5.8,title:'Fire Blast'},{at:8.6,title:'Blast Burn',finisher:true}]},
];
export const FLIGHT_TIME=.42;
export const CARD_REVEAL_AT=10.1;
/** Pick by the native charge onset; a fixed post-hit hold can skip the next wind-up. */
export function showdownReleaseAt(id:ShowdownId,time:number,chargeDuration:number){
 const strikes=SHOWDOWNS.find(r=>r.id===id)!.strikes;
 const active=strikes.filter(s=>time>=s.at-FLIGHT_TIME-chargeDuration).at(-1)??strikes[0];
 return active.at-FLIGHT_TIME;
}
export function showdownMessage(time:number){
 if(time<1.9)return 'Mewtwo seals the reward card.';
 if(time<3)return 'Charizard uses Flamethrower!';
 if(time<3.8)return 'First seal broken. Two remain.';
 if(time<4.7)return 'Mewtwo reinforces the vault.';
 if(time<5.8)return 'Charizard uses Fire Blast!';
 if(time<6.6)return 'Second seal broken. One remains.';
 if(time<7.5)return 'Mewtwo guards the final seal.';
 if(time<8.6)return 'Charizard uses Blast Burn!';
 if(time<9.75)return 'Vault unlocked. Reveal the card!';
 return 'One card reveals your bonus reward.';
}
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export function showdownSnapshot(id:ShowdownId,time:number){
 const round=SHOWDOWNS.find(r=>r.id===id)!;
 return {guard:3-round.strikes.filter(s=>time>=s.at).length,total:time>=CARD_REVEAL_AT+.55?round.rewardMultiplier:0,complete:time>=round.duration};
}
export function projectilePosition(from:Point,to:Point,progress:number):Point{
 const u=clamp(progress);if(u===0)return {...from};if(u===1)return {...to};
 return {x:from.x+(to.x-from.x)*u,y:from.y+(to.y-from.y)*u-Math.sin(u*Math.PI)*35};
}
export function showdownLayout(w:number,h:number){
 const wide=w/h>1.2,width=wide?1200:600,height=600;
 const top=wide?(h<500?62:95):(h<650?96:108),bottom=wide?(h<500?96:112):118;
 const scale=Math.max(.1,Math.min(w/width,(h-top-bottom)/height));
 const deck={x:width/2,y:wide?473:468,width:wide?1180:650,flatten:wide?.8:.78};
 // Coordinates lie within the illustrated platform's upper ellipse, not the stadium wall.
 const laneY=460;
 const player={x:wide?340:140,y:laneY},boss={x:wide?860:460,y:laneY};
 return {guardRadius:wide?162:138,width,height,scale,x:(w-width*scale)/2,y:top+(h-top-bottom-height*scale)/2,wide,deck,player,boss,
  playerScale:wide?1.4:1.14,bossScale:wide?1.5:1.28,card:{x:width/2,y:wide?270:270},cardScale:wide?1.03:.96};
}
