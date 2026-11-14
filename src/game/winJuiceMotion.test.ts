import {describe,expect,it} from 'vitest';
import {WIN_CINEMA_FINISH,WIN_CINEMA_IMPACT} from './winCinemaMotion';
import {winAttackBeats,winTierProfile,type CinemaTier} from './winChoreography';
import {EYE_SLOW,strikeClock,heroLight,impactFrame,juiceBeats,juiceUp,ladderPose,lensBloom,scenePunch,scoreHeat,shakeOffset,tickRate,TIER_PALETTE,winLadder,winTrauma} from './winJuiceMotion';

const tiers:CinemaTier[]=['big','mega','epic','legendary'];
describe('win juice motion',()=>{
 it('climbs one tier per strike and leaves the awarded tier to the finisher',()=>{
  expect(winLadder('big')).toEqual([]);
  expect(winLadder('mega').map(r=>r.tier)).toEqual(['big']);
  expect(winLadder('epic').map(r=>r.tier)).toEqual(['big','mega']);
  expect(winLadder('legendary').map(r=>r.tier)).toEqual(['big','mega','epic']);
  for(const tier of tiers){
   const rungs=winLadder(tier),impacts=winAttackBeats(tier).map(b=>b.impact);
   expect(rungs.length).toBe(winTierProfile(tier).rank-1);
   expect(rungs.every(r=>r.tier!==tier&&r.time<WIN_CINEMA_FINISH)).toBe(true);
   expect(rungs.map(r=>r.time)).toEqual([...rungs.map(r=>r.time)].sort((a,b)=>a-b));
   // Every rung lands on the frame of a real attack impact.
   expect(rungs.every(r=>impacts.includes(r.time))).toBe(true);
  }
 });
 it('lands a rung with its strike, rings it out and clears it for the final title',()=>{
  const rung=winLadder('epic')[0];
  expect(ladderPose(rung.time-.2,'epic').index).toBe(-1);
  // The rung is already falling while the attack travels.
  expect(ladderPose(rung.time-.11,'epic')).toMatchObject({index:0,flash:0});
  expect(ladderPose(rung.time-.11,'epic').scale).toBeGreaterThan(2.5);
  expect(ladderPose(rung.time,'epic').flash).toBe(1);
  expect(ladderPose(rung.time,'epic').scale).toBeLessThan(1);
  expect(ladderPose(rung.time+.6,'epic')).toMatchObject({index:0,scale:1,alpha:1,flash:0});
  expect(ladderPose(winLadder('epic')[1].time-.05,'epic')).toMatchObject({index:1,previous:0});
  expect(ladderPose(WIN_CINEMA_FINISH+.2,'epic').alpha).toBe(0);
  expect(ladderPose(rung.time+.05,'epic',true)).toMatchObject({scale:1,rotation:0,flash:0});
  expect(ladderPose(rung.time-.05,'epic',true).alpha).toBe(0);
 });
 it('punches then settles exactly within 0.4 seconds',()=>{
  expect(juiceUp(0,.6).scale).toBeCloseTo(.64);
  expect(juiceUp(.4,.6)).toEqual({scale:1,rotation:0});
  expect(juiceUp(-.01,.6)).toEqual({scale:1,rotation:0});
  let peak=0;for(let t=0;t<.4;t+=.004)peak=Math.max(peak,juiceUp(t,.6).scale);
  expect(peak).toBeGreaterThan(1.1);
 });
 it('weights the finisher above every earlier strike and marks the lens strike',()=>{
  for(const tier of tiers){
   const beats=juiceBeats(tier),finisher=beats.at(-1)!;
   expect(beats[0]).toMatchObject({opening:true,impact:WIN_CINEMA_IMPACT});
   expect(finisher.finisher).toBe(true);
   expect(beats.slice(0,-1).every(b=>b.weight<finisher.weight)).toBe(true);
  }
  expect(juiceBeats('legendary').at(-1)!.weight).toBeGreaterThan(juiceBeats('big').at(-1)!.weight);
 });
 it('stacks trauma on contact, bounds it and lets it decay to rest',()=>{
  for(const tier of tiers){
   expect(winTrauma(WIN_CINEMA_IMPACT-.01,tier)).toBe(0);
   expect(winTrauma(WIN_CINEMA_FINISH+.01,tier)).toBeGreaterThan(.6);
   expect(winTrauma(WIN_CINEMA_FINISH+1.2,tier)).toBe(0);
   for(let age=0;age<9;age+=.05)expect(winTrauma(age,tier)).toBeLessThanOrEqual(1);
   expect(winTrauma(WIN_CINEMA_FINISH+.01,tier,true)).toBe(0);
  }
  expect(shakeOffset(3,0,20)).toEqual({x:0,y:0,roll:0});
  const shake=shakeOffset(3.21,1,20);expect(Math.hypot(shake.x,shake.y)).toBeLessThanOrEqual(20*1.6*Math.SQRT2);
 });
 it('punches the lens only after contact',()=>{
  expect(scenePunch(WIN_CINEMA_FINISH-.01,'mega')).toBeLessThan(.01);
  expect(scenePunch(WIN_CINEMA_FINISH+.06,'mega')).toBeGreaterThan(.04);
  expect(scenePunch(WIN_CINEMA_FINISH+.06,'mega',true)).toBe(0);
  expect(scenePunch(8.5,'mega')).toBe(0);
 });
 it('gives the finisher one hard white frame that clears within a third of a second',()=>{
  expect(impactFrame(WIN_CINEMA_FINISH-.01)).toEqual({white:0});
  expect(impactFrame(WIN_CINEMA_FINISH+.01).white).toBeGreaterThan(.8);
  expect(impactFrame(WIN_CINEMA_FINISH+.15).white).toBeLessThan(.3);
  expect(impactFrame(WIN_CINEMA_FINISH+.31)).toEqual({white:0});
  expect(impactFrame(WIN_CINEMA_FINISH+.05,true)).toEqual({white:0});
 });
 it('floods the lens from the Pokémon and clears onto the arena',()=>{
  expect(lensBloom(1).visible).toBe(false);
  expect(lensBloom(1.1)).toMatchObject({visible:true,veil:0});
  expect(lensBloom(1.4).grow).toBeGreaterThan(lensBloom(1.2).grow);
  expect(lensBloom(WIN_CINEMA_IMPACT-.001).veil).toBeGreaterThan(.99);
  expect(lensBloom(WIN_CINEMA_IMPACT+.02)).toMatchObject({veil:1,rush:0});
  expect(lensBloom(WIN_CINEMA_IMPACT+.3).veil).toBeLessThan(.6);
  expect(lensBloom(WIN_CINEMA_IMPACT+.7).visible).toBe(false);
  expect(lensBloom(1.5,true).visible).toBe(false);
  // The two full-frame lights are seconds apart, well inside the three-flashes-per-second limit.
  expect(WIN_CINEMA_FINISH-WIN_CINEMA_IMPACT).toBeGreaterThan(1);
 });
 it('burns hotter with the count and the tier, and goes out on exit',()=>{
  expect(scoreHeat(1.8,.1,'mega')).toBe(0);
  expect(scoreHeat(5,.7,'mega')).toBeGreaterThan(scoreHeat(5,.2,'mega'));
  expect(scoreHeat(7,1,'legendary')).toBeGreaterThan(scoreHeat(7,1,'big'));
  expect(scoreHeat(7,1,'legendary',.4)).toBe(0);
  expect(scoreHeat(7,1,'legendary',0,true)).toBe(0);
 });
 it('holds a fan of light behind the award and releases it on return',()=>{
  expect(heroLight(1,'epic')).toEqual({rays:0,core:0});
  expect(heroLight(8,'epic').rays).toBeGreaterThan(.8);
  expect(heroLight(8,'legendary').rays).toBeGreaterThan(heroLight(8,'big').rays);
  expect(heroLight(8,'epic',.5)).toEqual({rays:0,core:0});
  expect(heroLight(8,'epic',0,true)).toEqual({rays:0,core:0});
 });
 it('raises the tick pitch through the count and bounds it',()=>{
  expect(tickRate(.5,0)).toBeGreaterThan(tickRate(.1,0));
  expect(tickRate(.5,2)).toBeGreaterThan(tickRate(.5,0));
  expect(tickRate(9,9)).toBeLessThanOrEqual(2);
 });
 it('pays more coins for higher tiers',()=>{
  const coins=tiers.map(t=>TIER_PALETTE[t].coin);
  expect(coins).toEqual([...coins].sort((a,b)=>a-b));
 });
 it('freezes the performance on contact and rejoins the clock without a jump',()=>{
  for(const tier of tiers){
   expect(strikeClock(WIN_CINEMA_FINISH-.3,tier)).toBe(WIN_CINEMA_FINISH-.3);expect(strikeClock(5,tier)).toBe(5);
   expect(strikeClock(WIN_CINEMA_FINISH+.05,tier)).toBe(WIN_CINEMA_FINISH);
   expect(strikeClock(WIN_CINEMA_FINISH+1.2,tier)).toBeCloseTo(WIN_CINEMA_FINISH+1.2,6);
   let last=0;for(let age=5;age<9;age+=1/120){const clock=strikeClock(age,tier);expect(clock).toBeGreaterThanOrEqual(last);expect(clock).toBeLessThanOrEqual(age+1e-9);last=clock;}
   expect(strikeClock(WIN_CINEMA_FINISH+.05,tier,true)).toBe(WIN_CINEMA_FINISH+.05);
  }
  // Heavier tiers hold longer.
  expect(strikeClock(WIN_CINEMA_FINISH+.14,'legendary')).toBe(WIN_CINEMA_FINISH);expect(strikeClock(WIN_CINEMA_FINISH+.14,'big')).toBeGreaterThan(WIN_CINEMA_FINISH);
 });
 it('all but stops the body for the eye shot and snaps into the release on time',()=>{
  const {from,to,rate}=EYE_SLOW,release=5.78;
  for(const tier of tiers){
   const during=(strikeClock(to-.01,tier)-strikeClock(from+.01,tier))/(to-from-.02);
   expect(during).toBeCloseTo(rate,5);
   expect(strikeClock(release,tier)).toBeCloseTo(release,6);expect(strikeClock(release-.001,tier)).toBeLessThan(release);
   // The catch-up runs faster than real time: a snap, not a slow return.
   expect((strikeClock(release,tier)-strikeClock(release-.02,tier))/.02).toBeGreaterThan(3);
   expect(strikeClock(5.45,tier,true)).toBe(5.45);
  }
 });
});
