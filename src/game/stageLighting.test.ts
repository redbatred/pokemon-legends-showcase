import { expect,it } from 'vitest';
import { stageEmissionStrength,centerEmissionStrength } from './stageLighting';
it('selects cyan light strips but never white court paint, blue surfaces, or lower-body shadows',()=>{
  expect(stageEmissionStrength(60,210,232,.5,.274)).toBeGreaterThan(.5);
  expect(stageEmissionStrength(236,240,247,.5,.32)).toBe(0);
  expect(stageEmissionStrength(37,115,227,.5,.6)).toBe(0);
  expect(stageEmissionStrength(100,140,190,.5,.8)).toBe(0);
  expect(stageEmissionStrength(60,210,232,.5,.82)).toBe(0);
});
it('lights the central ring without coloring the platform center, outer paint, or chassis',()=>{
 expect(centerEmissionStrength(235,245,250,.568,.454)).toBeGreaterThan(.9);
 expect(centerEmissionStrength(235,245,250,.498,.454)).toBe(0);
 expect(centerEmissionStrength(235,245,250,.8,.454)).toBe(0);
 expect(centerEmissionStrength(235,245,250,.5,.8)).toBe(0);
 expect(centerEmissionStrength(38,110,232,.568,.454)).toBe(0);
});
