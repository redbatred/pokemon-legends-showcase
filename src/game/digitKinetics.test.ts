import {expect,it} from 'vitest';
import {digitKinetics} from './digitKinetics';
it('settles completely after a scoring beat and respects reduced motion',()=>{
 expect(digitKinetics(2,2,1,0,false)).toEqual({y:0,scaleX:1,scaleY:1,rotation:0,light:0});
 expect(digitKinetics(.03,.05,2,0,true)).toEqual({y:0,scaleX:1,scaleY:1,rotation:0,light:0});
});
it('keeps a readable glyph during changing totals and staggers impacts without runaway stretch',()=>{
 expect(digitKinetics(.02,.08,1,0,false).light).toBeGreaterThan(0);
 expect(digitKinetics(2,.08,1,0,false).y).not.toBe(digitKinetics(2,.08,1,5,false).y);
 for(let i=0;i<100;i++){const p=digitKinetics(i/100,i/100,2,3,false);expect(p.scaleX).toBeGreaterThan(.85);expect(p.scaleY).toBeLessThan(1.35);expect(Math.abs(p.y)).toBeLessThan(.2);}
});
