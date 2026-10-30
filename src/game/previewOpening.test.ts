import {expect,it} from 'vitest';
import {createPreviewOpening,GUARANTEED_FIRST_SPECIAL} from './previewOpening';
import {DEFAULT_PACK,newSave,settleOpening,validateSave,type Card} from './model';
import {isSpecialCard} from './specialCard';
const commons:Card[]=Array.from({length:12},(_,i)=>({id:'common-'+i,number:String(i),name:'Common '+i,rarity:'Common',image:'/assets/cards/c.webp',value:25,weight:20}));
const rare:Card={...commons[0],id:'r',name:'Charizard ex',rarity:'Special Illustration Rare',value:4500,weight:.6};
const art={Charizard:{dexId:6,image:'/assets/pokemon/charizard.png'}};
it('disables the old guaranteed first-special override for the live game',()=>{
 expect(GUARANTEED_FIRST_SPECIAL).toBe(false);
 const opened=createPreviewOpening(newSave(),[...commons,rare],DEFAULT_PACK,art,()=>.9);
 expect(opened.active?.previewSpecial).not.toBe(true);expect(opened.active?.cards.some(isSpecialCard)).toBe(false);
 expect(opened.balance).toBe(9000);expect(opened.active?.cards).toHaveLength(11);expect(validateSave(opened)).toEqual(opened);
 expect(settleOpening(opened).balance).toBe(9250);
});
it('uses the new single-special draw without forcing it into the first slot',()=>{
 const opened=createPreviewOpening(newSave(),[...commons,rare],DEFAULT_PACK,art,()=>0);
 expect(opened.active?.cards.filter(isSpecialCard)).toHaveLength(1);expect(opened.active?.cards[0].rarity).toBe('Common');
 expect(opened.active?.previewSpecial).not.toBe(true);expect(settleOpening(opened).history[0].total).toBe(4725);
});
it('never rerolls an already reserved pack',()=>{
 const opened=createPreviewOpening(newSave(),[...commons,rare],DEFAULT_PACK,art,()=>0);
 expect(createPreviewOpening(opened,[...commons,rare],DEFAULT_PACK,art,()=>.99)).toBe(opened);
});
it('keeps the guaranteed first card available only for explicitly requested diagnostic previews',()=>{
 const opened=createPreviewOpening(newSave(),commons.concat(rare),DEFAULT_PACK,art,()=>.9,true);
 expect(opened.active?.previewSpecial).toBe(true);expect(opened.active?.cards[0]).toEqual(rare);expect(opened.balance).toBe(9000);
});
it('keeps the nine-card legacy pack and two Energy slots intact',()=>{
 const opened=createPreviewOpening(newSave(),commons,{...DEFAULT_PACK,rewardCount:9},art,()=>.9);
 expect(opened.active?.cards.filter(c=>c.id==='energy')).toHaveLength(2);expect(validateSave(opened)).toEqual(opened);
});
it('retains occasional legacy Base Set showcases without making every pack special',()=>{
 const legacy={...rare,id:'base1-4',name:'Charizard',rarity:'Rare',value:90};
 const pack={...DEFAULT_PACK,id:'base-set',rewardCount:9 as const};
 const hit=createPreviewOpening(newSave(),commons.concat(legacy),pack,art,()=>0);
 expect(hit.active?.previewSpecial).toBe(true);expect(hit.active?.cards[0]).toEqual(legacy);expect(new Set(hit.active!.cards.slice(0,9).map(c=>c.id)).size).toBe(9);
 const miss=createPreviewOpening(newSave(),commons.concat(legacy),pack,art,()=>.9);
 expect(miss.active?.previewSpecial).not.toBe(true);
});
