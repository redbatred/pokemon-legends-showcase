import {expect,it} from 'vitest';
import {drawPackCards,SPECIAL_PACK_CHANCE} from './packDraw';
import {DEFAULT_PACK,type Card,type Result} from './model';
import {isSpecialCard} from './specialCard';
const ordinary=Array.from({length:12},(_,i)=>({id:'common-'+i,number:String(i),name:'Common '+i,rarity:'Common',image:'/assets/common.png',value:25,weight:20}));
const specials=['Charizard','Mew','Gengar','Dragonite','Lugia'].map((name,i)=>({...ordinary[0],id:'special-'+i,name:name+' ex',rarity:'Double rare',value:250,weight:8}));
const pool=[...ordinary,...specials];
const result=(cards:Card[]):Result=>({id:'past',at:'',cards,pack:DEFAULT_PACK,total:0});
it('allows a pack with no special instead of guaranteeing one',()=>{
 const cards=drawPackCards(pool,10,1000,[],()=>.9);
 expect(cards.filter(isSpecialCard)).toHaveLength(0);expect(new Set(cards.map(c=>c.id)).size).toBe(10);
});
it('limits a successful special roll to one and does not duplicate cards',()=>{
 const cards=drawPackCards(pool,10,1000,[],()=>0);
 expect(cards.filter(isSpecialCard)).toHaveLength(1);expect(new Set(cards.map(c=>c.id)).size).toBe(10);
});
it('keeps the configured rate stable across every repeated slot draw',()=>{
 let hits=0;for(let i=0;i<1000;i++){let first=true;const cards=drawPackCards(pool,10,1000,[],()=>{if(first){first=false;return (i+.5)/1000;}return .5;});hits+=cards.filter(isSpecialCard).length;}
 expect(hits).toBe(SPECIAL_PACK_CHANCE*1000);
});
it('avoids the last three special species, including different card editions',()=>{
 const history=[result([specials[0]]),result([specials[1]]),result([specials[2]])];
 const alternate={...specials[0],id:'charizard-vmax',name:'Charizard VMAX'};
 expect(drawPackCards([...pool,alternate],10,1000,history,()=>0).filter(isSpecialCard).map(c=>c.name)).toEqual(['Dragonite ex']);
});
it('rotates to the least recent species when every choice is in the cooldown',()=>{
 const history=[result([specials[0]]),result([specials[1]])];
 expect(drawPackCards([...ordinary,...specials.slice(0,2)],10,1000,history,()=>0).filter(isSpecialCard)[0]).toEqual(specials[1]);
});
it('treats a high-value ordinary card as a special reveal for the one-per-pack limit',()=>{
 const valuable={...ordinary[0],id:'expensive',value:2000};const cards=drawPackCards([...pool,valuable],10,1000,[],()=>0);
 expect(cards.filter(c=>isSpecialCard(c)||c.value>=1000)).toHaveLength(1);
});
it('preserves count in tiny test catalogs and never inserts cards outside the supplied pool',()=>{
 const cards=drawPackCards([ordinary[0]],10,1000,[],()=>0);expect(cards).toHaveLength(10);expect(cards.every(c=>c===ordinary[0])).toBe(true);
});
it('does not mutate the pool or past results',()=>{
 const before=JSON.stringify(pool),history=[result([specials[0]])],saved=JSON.stringify(history);drawPackCards(pool,10,1000,history,()=>0);expect(JSON.stringify(pool)).toBe(before);expect(JSON.stringify(history)).toBe(saved);
});
