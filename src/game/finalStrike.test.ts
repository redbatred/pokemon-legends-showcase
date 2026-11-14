import {expect,it} from 'vitest';
import {finalStrike,finalStrikeTravel} from './finalStrike';
import {WIN_CINEMA_FINISH as hit,winCinemaPose} from './winCinemaMotion';
it('coordinates exact total, expansion and camera impulse on the final strike',()=>{
 expect(winCinemaPose(hit-.001).count).toBeLessThan(1);expect(winCinemaPose(hit).count).toBe(1);
 const contact=finalStrike(hit+.065);expect(contact.hit).toBe(1);expect(contact.amountY).toBeGreaterThan(1.3);expect(contact.zoom).toBeGreaterThan(.1);
 expect(finalStrikeTravel(hit)).toBe(1);expect(finalStrikeTravel(hit-.05)).toBeLessThan(.7);
});
it('has continuous body motion at contact and settles without repeated hits',()=>{
 for(const t of [hit-.3,hit,hit+.065,hit+.95]){
  const a=finalStrike(t-.00001),b=finalStrike(t+.00001);
  for(const key of Object.keys(a) as (keyof typeof a)[])expect(Math.abs(a[key]-b[key])).toBeLessThan(.002);
 }
 let previous=2;for(let t=.065;t<1;t+=.01){const p=finalStrike(hit+t);expect(p.hit).toBeLessThanOrEqual(previous);previous=p.hit;}
 expect(finalStrike(hit+2)).toEqual(finalStrike(hit+3));
 expect(finalStrike(hit+.07,true)).toMatchObject({hit:0,amountX:1,amountY:1,zoom:0,lift:0});
});

it('gives the final projectile a readable flight before exact contact',()=>{expect(finalStrikeTravel(5.78)).toBe(0);expect(finalStrikeTravel(5.90)).toBeGreaterThan(.04);expect(finalStrikeTravel(hit)).toBe(1);});
