import {expect,it} from 'vitest';
import {arenaImpact,releaseImpactTiming} from './arenaImpact';
import {winAttackBeats} from './winChoreography';
it('produces finite ground responses only after actual strikes',()=>{
 for(const tier of ['big','mega','epic','legendary'] as const){
  expect(arenaImpact(.8,tier).visible).toBe(false);
  for(const beat of winAttackBeats(tier)){const p=arenaImpact(beat.impact+.12,tier);expect(p.visible).toBe(true);expect(p.radius).toBeLessThan(6);expect(p.light).toBeGreaterThan(0);}
  for(const t of [8,9,15,60])expect(arenaImpact(t,tier)).toMatchObject({visible:false,light:0,flag:0});
 }
});
it('times normal-stage dust to foot contact and omits landing dust for flying Pokémon',()=>{
 expect(releaseImpactTiming(.20+.92-.01,.92,true).landing).toBeLessThan(0);
 expect(releaseImpactTiming(.20+.92+.1,.92,true).landing).toBeCloseTo(.1);
 expect(releaseImpactTiming(2,.92,false).landing).toBe(-1);
});
