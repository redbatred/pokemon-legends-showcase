import {expect,it} from 'vitest';
import {arenaPressureMotion} from './arenaPressureMotion';
it('gathers before contact and releases a bounded pressure wave on each actual hit',()=>{
 expect(arenaPressureMotion(5.5,'big')).toMatchObject({visible:true,animation:'gather'});
 expect(arenaPressureMotion(6.12,'big')).toMatchObject({visible:true,animation:'burst',time:0});
 expect(arenaPressureMotion(6.5,'big').lift).toBeGreaterThan(20);
 expect(arenaPressureMotion(7.2,'big').visible).toBe(false);
 expect(arenaPressureMotion(6.3,'big',true).visible).toBe(false);
});
