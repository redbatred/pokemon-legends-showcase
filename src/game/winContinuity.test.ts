import {expect,it} from 'vitest';
import {winCameraBeat,winScoreHit,winEffectAge,winAmountBody,winReturnPose} from './winContinuity';
import {winAttackBeats} from './winChoreography';
it('lets an impact finish while the next action starts',()=>{
 const beats=winAttackBeats('mega');
 expect(winEffectAge(4.10,beats[1])).toMatchObject({visible:true});
 expect(winEffectAge(4.50,beats[1])).toMatchObject({visible:false});
});
it('never invents a scoring hit during BIG WIN idle time',()=>{
 expect(winScoreHit(4.6,'big').age).toBeCloseTo(1.05);
 expect(winScoreHit(4.6,'mega').age).toBeCloseTo(.05);
});
it('keeps the camera continuous through release, impact and action boundaries',()=>{
 for(const tier of ['big','mega','epic','legendary'] as const){
  for(const beat of winAttackBeats(tier))for(const t of [beat.start,beat.release,beat.impact,beat.end]){
   const a=winCameraBeat(t-.00001,tier),b=winCameraBeat(t+.00001,tier);
   expect(Math.abs(a.focus-b.focus)).toBeLessThan(.001);
   expect(Math.abs(a.dolly-b.dolly)).toBeLessThan(.001);
  }
  expect(winCameraBeat(10,tier)).toEqual({focus:0,dolly:0,bank:0});
  expect(winCameraBeat(5.8,tier,true)).toEqual({focus:0,dolly:0,bank:0});
 }
});

it('lands the whole final amount on contact and settles without secondary hits',()=>{
 expect(winAmountBody(6.119).y).toBeLessThan(1);
 expect(winAmountBody(6.185).y).toBeGreaterThan(1.3);
 expect(winAmountBody(8)).toEqual({x:1,y:1,lift:0});
 expect(winAmountBody(6.12,true)).toEqual({x:1,y:1,lift:0});
});
it('covers the scene handoff and preserves the amount until its return flight',()=>{
 expect(winReturnPose(0)).toMatchObject({scene:1,alpha:1,transfer:0});
 expect(winReturnPose(.34).curtain).toBeGreaterThan(.6);
 expect(winReturnPose(.62).scene).toBe(0);
 expect(winReturnPose(1.04)).toMatchObject({scene:0,alpha:0});
 expect(winReturnPose(.1).transfer).toBe(0);
});
