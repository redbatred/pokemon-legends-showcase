import {expect,it} from 'vitest';
import {vaultWard} from './vaultPresentation';
import {showdownBeam,guardContact} from './showdownBeam';
import {showdownLayout,FLIGHT_TIME} from './showdownModel';
it.each([[1280,720],[390,844]])('lands on the stationary shield surface before the recoiling body at %sx%s',(w,h)=>{
 const l=showdownLayout(w,h),mouth={x:l.player.x+65,y:l.player.y-170},contact=guardContact(l);
 expect(contact.x).toBeLessThan(l.boss.x);expect(contact.y).toBeCloseTo(vaultWard(l).y);
 const start=showdownBeam(mouth,contact,0),hit=showdownBeam(mouth,contact,FLIGHT_TIME);
 expect(start.end).toEqual(mouth);expect(hit.end).toEqual(contact);
 const after=showdownBeam(mouth,contact,FLIGHT_TIME+.15);
 expect(after.end).toEqual(contact);expect(after.start.x).toBeGreaterThan(mouth.x);expect(after.alpha).toBeLessThan(1);
 expect(showdownBeam(mouth,contact,FLIGHT_TIME+.36).visible).toBe(false);
});
it('keeps flight on the mouth-to-shield axis instead of pitching the whole beam upwards',()=>{
 const a={x:0,y:10},b={x:400,y:110};const f=showdownBeam(a,b,FLIGHT_TIME/2);
 expect((f.end.y-a.y)/(f.end.x-a.x)).toBeCloseTo(.25);
});
