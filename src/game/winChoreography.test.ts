import {expect,it} from 'vitest';
import {winChoreography,winTierProfile,packAwardPose,winAttackBeats} from './winChoreography';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
it('keeps count-up performances active, with a charged finisher at the exact total',()=>{
 for(const tier of ['big','mega','epic','legendary'] as const){
  expect(winChoreography(3.45,tier).attackWeight).toBeGreaterThan(.8);
  expect(winChoreography(5.8,tier).charge).toBeGreaterThan(.6);
  expect(winChoreography(WIN_CINEMA_FINISH,tier).finisher).toBe(true);
  expect(winChoreography(8,tier).attackWeight).toBe(0);
 }
});
it('gives higher tiers more choreography and a stronger final impact',()=>{
 const p=['big','mega','epic','legendary'].map(t=>winTierProfile(t as 'big'));
 expect(p.map(x=>x.title)).toEqual(['BIG WIN','MEGA WIN','EPIC WIN','LEGENDARY WIN']);
 for(let i=1;i<p.length;i++){expect(p[i].strength).toBeGreaterThan(p[i-1].strength);expect(p[i].orbit).toBeGreaterThan(p[i-1].orbit);}
 expect(winChoreography(4.5,'big').attackWeight).toBe(0);
 expect(winChoreography(4.5,'mega').attackWeight).toBeGreaterThan(.9);
});
it('collects every card before the pack total lands and never counts past its target',()=>{
 let prior=0;for(let age=0;age<9;age+=.013){const p=packAwardPose(age,3);expect(p.count).toBeGreaterThanOrEqual(prior);expect(p.count).toBeLessThanOrEqual(1);prior=p.count;}
 expect(packAwardPose(0,3).count).toBe(0);
 expect(packAwardPose(WIN_CINEMA_FINISH,3)).toMatchObject({count:1,landed:true});
});

it('keeps native motion moving immediately after every strike',()=>{for(const tier of ['big','mega','epic','legendary'] as const)for(const beat of winAttackBeats(tier)){const at=winChoreography(beat.impact,tier);expect(winChoreography(beat.impact+.04,tier).clipPhase).toBeGreaterThan(at.clipPhase);}});
it('weights the pack count by the actual card contributions',()=>{const firstEnd=1.7+(WIN_CINEMA_FINISH-1.7)/2;expect(packAwardPose(firstEnd,[20,80]).count).toBeCloseTo(.2);expect(packAwardPose(WIN_CINEMA_FINISH,[20,80]).count).toBe(1);});
