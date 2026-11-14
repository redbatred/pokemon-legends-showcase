import {CARD_REVEAL_AT,clamp,smooth,type showdownLayout} from './showdownModel';
type Layout=ReturnType<typeof showdownLayout>;
/** One enclosure includes the guardian and the card behind his shoulder. */
export function vaultWard(l:Layout){return {x:l.boss.x-6,y:l.boss.y-(l.wide?186:166),radius:l.guardRadius};}
export function lockedReward(l:Layout){return {x:l.boss.x+(l.wide?46:43),y:l.boss.y-(l.wide?206:186),scale:l.wide?.31:.28};}
export function vaultCardPose(time:number,l:Layout,reduced=false){
 const from=lockedReward(l),start=8.86,end=CARD_REVEAL_AT-.35;
 if(time<1.1){const u=reduced?(time<0?0:1):smooth(time/1.1);return {x:l.card.x+(from.x-l.card.x)*u,y:l.card.y+(from.y-l.card.y)*u,scale:.45+(from.scale-.45)*u,release:0};}
 const u=reduced?(time>=end?1:0):smooth((time-start)/(end-start));
 return {x:from.x+(l.card.x-from.x)*u,y:from.y+(l.card.y-from.y)*u-(reduced?0:Math.sin(u*Math.PI)*42),scale:from.scale+(l.cardScale*.8-from.scale)*u,release:clamp((time-start)/(end-start))};
}
/** Seal positions belong to the enclosure; beams remain attached when actors recoil. */
export function vaultSealPoints(l:Layout){const p=lockedReward(l);return [{x:p.x-67,y:p.y-14},{x:p.x+67,y:p.y-14},{x:p.x,y:p.y+91}];}
