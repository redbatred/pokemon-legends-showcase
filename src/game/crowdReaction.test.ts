import {expect,it} from 'vitest';
import {crowdLevel,crowdMix,crowdAnimationLevel,type CrowdLevel} from './crowdReaction';
const card=(rarity:string,value:number)=>({id:'card',rarity,value});
it('gives every valued reveal an audible reaction and matches its crowd animation tier',()=>{
 expect(crowdLevel(card('Common',25),1000)).toBe(1);expect(crowdLevel(card('Uncommon',50),1000)).toBe(1);
 expect(crowdLevel(card('Rare',90),1000)).toBe(2);expect(crowdLevel(card('Double Rare',250),1000)).toBe(2);
 expect(crowdLevel(card('Illustration Rare',600),1000)).toBe(3);expect(crowdLevel(card('Special Illustration Rare',2200),1000)).toBe(3);
 expect(crowdLevel(card('Special Illustration Rare',4500),1000)).toBe(4);
 expect(crowdLevel(card('Holo Rare V',50),1000,true)).toBe(3);
 const energy=crowdLevel({id:'energy',rarity:'Energy',value:0},1000);expect(energy).toBe(0);expect(crowdAnimationLevel(energy)).toBe(0);
 for(const level of [1,2,3,4] as const){expect(crowdMix(level).rise).toBeGreaterThan(.3);expect(crowdAnimationLevel(level)).toBeGreaterThan(0);}
});
it('uses small applause for regular pulls and increases power before switching to stadium cheers',()=>{
 expect(crowdMix(0).rise).toBe(0);expect(crowdMix(1).attack).toBe('crowdsmall');expect(crowdMix(2).bed).toBe('crowdapplause');expect(crowdMix(3).attack).toBe('crowdrise');expect(crowdMix(4).bed).toBe('crowdcheer');
 for(let i=1;i<=4;i++){expect(crowdMix(i as CrowdLevel).rise).toBeGreaterThan(crowdMix((i-1) as CrowdLevel).rise);expect(crowdMix(i as CrowdLevel).loop).toBeGreaterThan(crowdMix((i-1) as CrowdLevel).loop);}
});
