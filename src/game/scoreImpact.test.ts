import {expect,it} from 'vitest';
import {scoreImpact} from './scoreImpact';
import {finalCrowdPose} from './finalCrowdPose';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
it('lands on the exact amount baseline and clears opaque fire before the award settles',()=>{
 for(const [w,h,y] of [[390,844,844*.765],[720,960,960*.82],[1440,900,900*.79]]){
  expect(scoreImpact(w,h,0,true,y).y).toBe(y);
  expect(scoreImpact(w,h,0,true,y).size).toBeLessThanOrEqual(h*.1);
  expect(scoreImpact(w,h,.16,true,y).alpha).toBe(0);
  expect(scoreImpact(w,h,.3,true,y).sideX).toBeGreaterThan(w*.5);
  expect(scoreImpact(w,h,1.2,true,y)).toMatchObject({alpha:0,sideAlpha:0});
 }
});
it('reserves a strong coordinated cheer for after the final result',()=>{
 for(let section=0;section<8;section++){
  expect(finalCrowdPose(WIN_CINEMA_FINISH-.01,section).celebration).toBe(0);
  const cheer=finalCrowdPose(WIN_CINEMA_FINISH+.38,section);
  expect(cheer.celebration).toBe(1);expect(cheer.from).toBe(1);
  expect(finalCrowdPose(WIN_CINEMA_FINISH+.38,section,true).celebration).toBe(0);
 }
});
