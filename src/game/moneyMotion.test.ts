import {expect,it} from 'vitest';
import {moneyState,moneyDuration} from './moneyMotion';
it('resumes from the displayed value when the canvas is rebuilt during a count',()=>{
 const state=moneyState(undefined,'pack',4500,false);state.value=1234;state.remaining=.32;
 expect(moneyState(state,'pack',4500,false)).toBe(state);
 expect(state.value).toBe(1234);expect(state.remaining).toBe(.32);
});
it('retargets a running pack total from its current display, never the prior target',()=>{
 const old=moneyState(undefined,'pack',4500,false);old.value=1234;
 const next=moneyState(old,'pack',9500,false);expect(next.value).toBe(1234);expect(next.target).toBe(9500);
 expect(next.remaining).toBe(moneyDuration(8266));
});
it('does not animate saved balances from zero and resets a new card award',()=>{
 expect(moneyState(undefined,'balance',123456,true).value).toBe(123456);
 expect(moneyState({identity:'old',value:4500,target:4500,remaining:0},'new',250,false).value).toBe(0);
});
