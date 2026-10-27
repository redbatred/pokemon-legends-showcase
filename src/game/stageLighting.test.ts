import { expect,it } from 'vitest';
import { stageEmissionStrength,centerEmissionStrength,stageLightColor,stageLightLevel } from './stageLighting';
it('selects cyan light strips but never white court paint, blue surfaces, or lower-body shadows',()=>{
  expect(stageEmissionStrength(60,210,232,.5,.274)).toBeGreaterThan(.5);
  expect(stageEmissionStrength(236,240,247,.5,.32)).toBe(0);
  expect(stageEmissionStrength(37,115,227,.5,.6)).toBe(0);
  expect(stageEmissionStrength(100,140,190,.5,.8)).toBe(0);
  expect(stageEmissionStrength(60,210,232,.5,.82)).toBe(0);
});
it('lights the complete white emblem while excluding blue floor and chassis',()=>{
 expect(centerEmissionStrength(235,245,250,.568,.454)).toBeGreaterThan(.7);
 expect(centerEmissionStrength(235,245,250,.498,.454)).toBeGreaterThan(.7);
 expect(centerEmissionStrength(235,245,250,.78,.47)).toBeGreaterThan(.7);
 expect(centerEmissionStrength(235,245,250,.9,.47)).toBe(0);
 expect(centerEmissionStrength(235,245,250,.5,.8)).toBe(0);
 expect(centerEmissionStrength(38,110,232,.568,.454)).toBe(0);
});
it('preserves elemental chroma and caps the under-card hotspot',()=>{
 const red=stageLightColor(0xff301e,'centerCore'),blue=stageLightColor(0x1e60ff,'rimCore');
 expect(red[0]-red[2]).toBeGreaterThan(.6);expect(blue[2]-blue[0]).toBeGreaterThan(.6);
 expect(stageLightLevel('source',0,-1)).toBeLessThan(.2);
 expect(stageLightLevel('pool',0,-1)).toBeLessThan(.2);
 expect(stageLightLevel('centerCore',0,0)).toBeLessThan(stageLightLevel('centerCore',0,1));
});
