import {expect,it} from 'vitest';
import {captureFlight,captureKnock,captureSceneImpulse} from './captureKinetics';
it('connects the throw to the exact impact point with bounded perspective',()=>{
 const a={x:90,y:1050},b={x:550,y:400};expect(captureFlight(0,a,b,240)).toMatchObject({x:a.x,y:a.y,scale:2.3});expect(captureFlight(1,a,b,240)).toMatchObject({x:b.x,y:b.y,scale:1.05,rotation:0});
 let last=90;for(let i=0;i<=100;i++){const p=captureFlight(i/100,a,b,240);expect(p.x).toBeGreaterThanOrEqual(last);expect(p.scale).toBeGreaterThanOrEqual(1.05);last=p.x;}
});
it('returns to the floor between knocks, without outcome-specific anticipation',()=>{
 for(const t of [9.5,10.5,11.4,12.18])expect(captureKnock(t)).toEqual({x:0,y:0,rotation:0,impact:0});
 expect(captureKnock(9.93).rotation).not.toBe(0);expect(captureKnock(11.63).impact).toBeGreaterThan(captureKnock(9.93).impact);
 expect(captureSceneImpulse(5.86)).toBeGreaterThan(0);expect(captureSceneImpulse(5.1)).toBe(0);
});
it('uses one eased conversion clock in both directions with zero endpoint velocity',async()=>{
 const {conversionProgress}=await import('./captureKinetics');
 expect(conversionProgress(0)).toBe(0);expect(conversionProgress(1.25)).toBe(1);
 for(let i=0;i<=100;i++){const t=i/100*1.25;expect(conversionProgress(t)).toBeCloseTo(1-conversionProgress(1.25-t));}
 expect(conversionProgress(.001)).toBeLessThan(.00001);
});
