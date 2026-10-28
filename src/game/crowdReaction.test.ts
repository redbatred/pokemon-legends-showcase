import {expect,it} from 'vitest';
import {crowdLevel,crowdMix,type CrowdLevel} from './crowdReaction';
const card=(rarity:string,value:number)=>({id:'card',rarity,value});
it('keeps ordinary and energy cards quiet and reserves the strongest crowd for exceptional returns',()=>{
 expect(crowdLevel(card('Common',25),1000)).toBe(0);expect(crowdLevel(card('Uncommon',50),1000)).toBe(0);
 expect(crowdLevel({id:'energy',rarity:'Energy',value:0},1000)).toBe(0);
 expect(crowdLevel(card('Rare',90),1000)).toBe(1);expect(crowdLevel(card('Double Rare',250),1000)).toBe(1);
 expect(crowdLevel(card('Illustration Rare',600),1000)).toBe(2);expect(crowdLevel(card('Special Illustration Rare',2200),1000)).toBe(3);
 expect(crowdLevel(card('Special Illustration Rare',4500),1000)).toBe(4);expect(crowdLevel(card('Special Illustration Rare',4500),25000)).toBe(2);
});
it('increases reaction power monotonically and only sustains cheers for valuable cards',()=>{
 expect(crowdMix(0)).toEqual({rise:0,loop:0});expect(crowdMix(1).loop).toBe(0);
 for(let i=1;i<=4;i++){expect(crowdMix(i as CrowdLevel).rise).toBeGreaterThan(crowdMix((i-1) as CrowdLevel).rise);expect(crowdMix(i as CrowdLevel).loop).toBeGreaterThanOrEqual(crowdMix((i-1) as CrowdLevel).loop);}
 expect(crowdMix(4).loop).toBeLessThan(.18);
});
