import {expect,it} from 'vitest';
import {advanceShowdownTransition,showdownTransitionFrame,reverseShowdownTransition} from './showdownTransitionModel';
it.each([false,true])('holds a fully covered scene until assets are ready (reduced=%s)',reduced=>{
 let time=0;for(let i=0;i<200;i++)time=advanceShowdownTransition(time,.05,false,reduced);
 const held=showdownTransitionFrame(time,reduced);expect(held.cover).toBe(1);expect(held.done).toBe(false);
 time=advanceShowdownTransition(time,2,true,reduced);expect(showdownTransitionFrame(time,reduced).done).toBe(true);expect(showdownTransitionFrame(time,reduced).cover).toBe(0);
});
it('only switches scenes beneath a fully closed shutter',()=>{
 expect(showdownTransitionFrame(0,false)).toMatchObject({cover:0,swap:false});
 expect(showdownTransitionFrame(.87,false)).toMatchObject({cover:1,swap:false});
 expect(showdownTransitionFrame(.88,false)).toMatchObject({cover:1,swap:true});
 expect(showdownTransitionFrame(1.62,false)).toMatchObject({cover:0,swap:true,done:true});
});

it.each([0,.14,.37,.6,.88,1.05,1.5])('preserves shutter coverage when cancelling entry at %ss',time=>{
 const before=showdownTransitionFrame(time,false),reverse=reverseShowdownTransition(time,false);
 expect(showdownTransitionFrame(reverse.time,false).cover).toBeCloseTo(before.cover,6);
 expect(reverse.retainOrigin).toBe(!before.swap);
});
