import type {Card} from './model';
export type CrowdLevel=0|1|2|3|4;
/** Values are demo cents. Rarity alone never earns the loudest reaction. */
export function crowdLevel(card:Pick<Card,'id'|'rarity'|'value'>,packPrice:number):CrowdLevel{
 if(card.id==='energy'||card.value<=0)return 0;
 const ratio=card.value/Math.max(100,packPrice);
 if(card.value>=2000&&ratio>=4)return 4;
 if(card.value>=500&&ratio>=1)return 3;
 if(card.value>=250&&ratio>=.35||card.value>=300&&/illustration|ultra|hyper|secret|shiny/i.test(card.rarity))return 2;
 if(/rare|holo/i.test(card.rarity)||card.value>=100)return 1;
 return 0;
}
export function crowdMix(level:CrowdLevel){return [{rise:0,loop:0},{rise:.048,loop:0},{rise:.10,loop:.035},{rise:.17,loop:.065},{rise:.25,loop:.105}][level];}

/** Audience body language is independent of how loudly the card should sound. */
export function crowdAnimationLevel(card:Pick<Card,'id'|'rarity'|'value'>,special=false){
 if(card.id==='energy')return 0;
 if(special||/illustration|ultra|hyper|secret|shiny/i.test(card.rarity))return 3;
 if(/rare|holo/i.test(card.rarity))return 2;
 return 1;
}
