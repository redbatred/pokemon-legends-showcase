import {describe,it,expect} from 'vitest';
import {flowPoint} from './flowGeometry';
describe('body material transport',()=>{
 const chest={x:300,y:380},mouth={x:550,y:510};
 it('begins at every body point and ends at the same mouth',()=>{for(let y=100;y<=700;y+=30)for(let x=80;x<=600;x+=30){const p={x,y};const start=flowPoint(p,chest,mouth,0,1.55);expect(start.x).toBeCloseTo(p.x,7);expect(start.y).toBeCloseTo(p.y,7);const end=flowPoint(p,chest,mouth,1,1.55);expect(end.x).toBeCloseTo(mouth.x,7);expect(end.y).toBeCloseTo(mouth.y,7);}});
 it('has finite continuous trajectories on capture and reverse playback',()=>{for(const p of [{x:100,y:200},{x:450,y:350},{x:300,y:700},chest]){let last=flowPoint(p,chest,mouth,0,1.55);for(let i=1;i<=240;i++){const next=flowPoint(p,chest,mouth,i/240,1.55);expect(Number.isFinite(next.x+next.y)).toBe(true);expect(Math.hypot(next.x-last.x,next.y-last.y)).toBeLessThan(9);last=next;}}});
});
