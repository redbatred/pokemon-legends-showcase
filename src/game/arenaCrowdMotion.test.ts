import {expect,it} from 'vitest';
import {arenaCrowdMotion} from './arenaCrowdMotion';
it('keeps seats calm before the result and distributes celebration across rows',()=>{
 for(let g=0;g<48;g++){expect(arenaCrowdMotion(6.1,g).cheer).toBe(0);expect(arenaCrowdMotion(6.7,g).cheer).toBe(1);expect(arenaCrowdMotion(8,g,true)).toMatchObject({from:0,to:0,mix:0,cheer:0});}
 expect(arenaCrowdMotion(6.3,7).cheer).toBeGreaterThan(arenaCrowdMotion(6.3,32).cheer);
});
it('varies group gestures while holding complete poses between blends',()=>{
 const poses=Array.from({length:48},(_,g)=>arenaCrowdMotion(8,g));
 expect(new Set(poses.map(p=>p.from)).size).toBeGreaterThan(2);
 expect(poses.filter(p=>p.mix===0).length).toBeGreaterThan(12);
});

it('keeps exactly one weighted body through anticipation and the final cheer handoff',()=>{
 for(let g=0;g<48;g++)for(let t=5.9;t<9;t+=.017){const a=arenaCrowdMotion(t,g).weights,b=arenaCrowdMotion(t+.00001,g).weights;expect(a.reduce((x,y)=>x+y,0)).toBeCloseTo(1);for(let i=0;i<4;i++){expect(a[i]).toBeGreaterThanOrEqual(0);expect(Math.abs(a[i]-b[i])).toBeLessThan(.001);}}
});

it('does not dissolve seated bodies between different illustrations during anticipation',()=>{
 for(let g=0;g<48;g++)for(let t=0;t<6.1;t+=.13)expect(arenaCrowdMotion(t,g).weights).toEqual([1,0,0,0]);
});
