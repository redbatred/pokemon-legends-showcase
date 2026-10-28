import type {Card} from './model';
export type CrowdLevel=0|1|2|3|4;
/** One reveal tier drives audience poses and audible reaction together. Values are demo cents. */
export function crowdLevel(card:Pick<Card,'id'|'rarity'|'value'>,packPrice:number,special=false):CrowdLevel{
 if(card.id==='energy'||card.value<=0)return 0;
 const ratio=card.value/Math.max(100,packPrice);
 if(card.value>=2000&&ratio>=4)return 4;
 if(special||card.value>=500&&ratio>=1||/illustration|ultra|hyper|secret/i.test(card.rarity))return 3;
 if(/rare|holo|shiny/i.test(card.rarity)||card.value>=100)return 2;
 return 1;
}
export function crowdMix(level:CrowdLevel){
 const gain=[{rise:0,loop:0},{rise:.20,loop:0},{rise:.30,loop:0},{rise:.66,loop:.34},{rise:.80,loop:.46}][level];
 return {...gain,attack:level<=1?'crowdreact':level===2?'crowdreactrare':'crowdrise',bed:level<=2?null:'crowdcheer'};
}
export function crowdAnimationLevel(level:CrowdLevel){return Math.min(3,level);}
