import { expect,it } from 'vitest';
import { stageEmissionStrength } from './stageLighting';
it('selects cyan light strips but never white court paint, blue surfaces, or lower-body shadows',()=>{
  expect(stageEmissionStrength(60,210,232,.5,.274)).toBeGreaterThan(.5);
  expect(stageEmissionStrength(236,240,247,.5,.32)).toBe(0);
  expect(stageEmissionStrength(37,115,227,.5,.6)).toBe(0);
  expect(stageEmissionStrength(100,140,190,.5,.8)).toBe(0);
  expect(stageEmissionStrength(60,210,232,.5,.82)).toBe(0);
});
