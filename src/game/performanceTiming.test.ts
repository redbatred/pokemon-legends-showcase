import {expect,it} from 'vitest';
import {performanceTiming} from './performanceTiming';
it('continues the native recovery after effects stop, without jumping to idle',()=>{
 const p=performanceTiming('blastoise',5.458,{seek:.55,speed:1.4,powerAt:1.65,end:3.05,emitters:[]});
 expect(p.sourceAt(p.charge)).toBeCloseTo(1.65);expect(p.sourceAt(p.charge+p.attack)).toBeCloseTo(3.05);
 expect(p.sourceAt(p.charge+p.attack+p.recovery/2)).toBeCloseTo(3.675);
 expect(p.sourceAt(p.charge+p.attack+p.recovery)).toBeCloseTo(4.3);
});
it('bounds recovery to the actual supplied clip and honors an authored performance endpoint',()=>{
 const p=performanceTiming('custom',4,{seek:1,speed:1,powerAt:2,end:3,recoveryEnd:4.5,emitters:[]});
 expect(p.recoveryEnd).toBe(4);expect(p.sourceAt(50)).toBe(4);expect(p.recovery).toBeLessThanOrEqual(1.35);
});
