import {describe,it,expect} from 'vitest';
import {assignMockShowdownSymbols,validShowdownSymbols,qualifiesForShowdown,revealedShowdownSymbols} from './showdownSymbols';
import {newSave,DEFAULT_PACK,createOpening,settleOpening,validateSave,type Card} from '../model';
describe('pack Showdown symbols',()=>{
 it('qualifies only with three distinct real reward positions in this pack',()=>{
  expect(qualifiesForShowdown([0,3,8],10)).toBe(true);
  for(const indices of [[],[2],[1,4],[1,1,4],[0,3,10],[-1,3,7],[0,2.5,7]])expect(qualifiesForShowdown(indices,10)).toBe(false);
 });
 it('fixes mock symbols before reveal and never marks energy fillers',()=>{
  const indices=assignMockShowdownSymbols(9,true,()=>.5);
  expect(indices).toHaveLength(3);expect(new Set(indices).size).toBe(3);expect(validShowdownSymbols(indices,9)).toBe(true);
  expect(assignMockShowdownSymbols(10,false,()=>.99)).toEqual([]);
 });
 it('counts each revealed symbol once, independently of order or repeated callbacks',()=>{
  expect(revealedShowdownSymbols([1,4,8],[8,4,4,2])).toEqual([4,8]);
  expect(revealedShowdownSymbols([], [1,4,8])).toEqual([]);
 });
 it('preserves symbols through settlement and reload; rejects corrupt saved positions',()=>{
  const card:Card={id:'c',name:'Card',number:'1',image:'/assets/c.webp',rarity:'Common',weight:1,value:25};
  const save=createOpening(newSave(),[card],()=>.9,DEFAULT_PACK);save.active!.showdownSymbols=[1,4,7];
  expect(validateSave(save)?.active?.showdownSymbols).toEqual([1,4,7]);
  expect(settleOpening(save).history[0].showdownSymbols).toEqual([1,4,7]);
  save.active!.showdownSymbols=[1,1,12];expect(validateSave(save)).toBeNull();
 });
});
