import {expect,it} from 'vitest';
import {cardHover} from './cardHover';
it('limits hover to a stable card-local area and resets outside or on touch',()=>{
 expect(cardHover(78,-100,312,435)).toMatchObject({x:.5});expect(cardHover(700,0,312,435)).toEqual({x:0,y:0});expect(cardHover(78,20,312,435,false)).toEqual({x:0,y:0});
 const edge=cardHover(156*1.1,0,312,435);expect(edge.x).toBeGreaterThan(0);expect(edge.x).toBeLessThan(1);
 expect(cardHover(156*1.279,0,312,435).x).toBeLessThan(.001);
});
