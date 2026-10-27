import {expect,it} from 'vitest';
import {branchWind,cloudPosition,skyPixels,stadiumRim} from './backdropMotion';
it('pins tree roots while allowing independent branch tips to follow a shared gust',()=>{
 for(let t=0;t<30;t+=.37){expect(Math.abs(branchWind(t,.5,1,2,160).x)).toBe(0);expect(Math.abs(branchWind(t,.5,1,2,160).y)).toBe(0);const p=branchWind(t,.4,0,2,160);expect(Math.abs(p.x)).toBeLessThan(6);expect(Math.abs(p.y)).toBeLessThan(1);}
 expect(branchWind(2,.2,.1,2,160).x).not.toBe(branchWind(2,.8,.1,2,160).x);
});
it('moves clouds steadily and wraps fully outside the visible sky',()=>{
 expect(cloudPosition(10,100,3,1600,700)-cloudPosition(0,100,3,1600,700)).toBeCloseTo(30);
 for(let t=0;t<2000;t+=10){const x=cloudPosition(t,100,3,1600,700);expect(x).toBeGreaterThanOrEqual(-700);expect(x).toBeLessThan(2300);}
});
it('isolates connected sky without erasing foliage or disconnected blue stadium pixels',()=>{
 const w=5,h=10,p=new Uint8ClampedArray(w*h*4);for(let i=0;i<w*h;i++)p.set(i<w*3?[80,155,242,255]:i<w*4?[70,130,65,255]:[70,150,240,255],i*4);
 const mask=skyPixels(p,w,h);expect(mask.slice(0,15).every(v=>v===1)).toBe(true);expect(mask.slice(15).every(v=>v===0)).toBe(true);
 expect(stadiumRim(.5)).toBeCloseTo(.47);expect(stadiumRim(0)).toBeCloseTo(stadiumRim(1));
});
