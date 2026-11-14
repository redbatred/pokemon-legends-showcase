import {expect,it} from 'vitest';
import {stadiumResponse} from './stadiumResponse';
import {winAttackBeats} from './winChoreography';
it('keeps scene response continuous at release, impact and recovery boundaries',()=>{
 for(const tier of ['big','mega','epic','legendary'] as const)for(const beat of winAttackBeats(tier))for(const time of [beat.start,beat.release,beat.impact,beat.impact+1.7]){
  const a=stadiumResponse(time-.0001,tier),b=stadiumResponse(time+.0001,tier);
  for(const key of Object.keys(a) as (keyof typeof a)[])expect(Math.abs(a[key]-b[key]),`${tier} ${time} ${key}`).toBeLessThan(.01);
 }
});
it('delays the crowd reaction behind contact and gives the finisher more force',()=>{
 const initial=stadiumResponse(1.72,'big'),hit=stadiumResponse(1.82,'big'),final=stadiumResponse(6.22,'big');
 expect(initial.crowd).toBe(0);expect(stadiumResponse(2.1,'big').crowd).toBeGreaterThan(0);
 expect(hit.light).toBeGreaterThan(0);expect(final.light).toBeGreaterThan(hit.light*1.5);
 expect(Math.abs(final.recoil)).toBeGreaterThan(Math.abs(hit.recoil));
});
it('fully settles after the award and suppresses motion in reduced mode',()=>{
 for(const tier of ['big','mega','epic','legendary'] as const){
  expect(Object.values(stadiumResponse(9,tier)).every(x=>x===0)).toBe(true);
  expect(Object.values(stadiumResponse(6.25,tier,true)).every(x=>x===0)).toBe(true);
 }
});
