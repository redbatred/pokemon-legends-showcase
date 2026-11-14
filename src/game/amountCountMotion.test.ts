import {expect,it} from 'vitest';
import {AMOUNT_COUNT_ARRIVALS,amountCountPose,amountFireHeat,resultWinTitle,resultCountDuration} from './amountCountMotion';
it('counts monotonically to the exact endpoint with micro-holds after bursts',()=>{
 expect(amountCountPose(0)).toEqual({value:0,beat:0});
 expect(amountCountPose(1)).toEqual({value:1,beat:6});
 expect(amountCountPose(.20)).toEqual(amountCountPose(.23));
 expect(amountCountPose(.41)).toEqual(amountCountPose(.43));
 let previous=0;
 for(let i=0;i<=1000;i++){const pose=amountCountPose(i/1000);expect(pose.value).toBeGreaterThanOrEqual(previous);expect(pose.value).toBeLessThanOrEqual(1);previous=pose.value;}
 const earlyRate=amountCountPose(.05).value/.05;
 const lateRate=(amountCountPose(.94).value-amountCountPose(.89).value)/.05;
 expect(lateRate).toBeGreaterThan(earlyRate*3);
});
it('reserves glyph ignition for exceptional 100× to 300× wins',()=>{
 for(const ratio of [0,1,5,20,50,99.99])expect(amountFireHeat(ratio)).toBe(0);
 expect(amountFireHeat(100)).toBe(.16);expect(amountFireHeat(200)).toBeCloseTo(.58);
 expect(amountFireHeat(300)).toBe(1);expect(amountFireHeat(1000)).toBe(1);
});
it('uses ratio-aware readable result titles and a bounded result duration',()=>{
 expect([0,9.99,10,49.99,50,99.99,100].map(ratio=>resultWinTitle(ratio))).toEqual(['PACK WIN','PACK WIN','BIG WIN','BIG WIN','MEGA WIN','MEGA WIN','EPIC WIN']);
 expect(resultWinTitle(1,true)).toBe('SESSION WIN');
 expect(resultCountDuration(1)).toBe(1.8);expect(resultCountDuration(300)).toBe(2.5);
 expect(resultCountDuration(10000)).toBe(2.5);expect(resultCountDuration(20)).toBeGreaterThan(resultCountDuration(2));
});

it('lands each punch at the contribution arrival and holds it through the pause',()=>{
 AMOUNT_COUNT_ARRIVALS.forEach((arrival,index)=>{
  expect(amountCountPose(arrival-.001).beat).toBe(index);
  expect(amountCountPose(arrival+.001).beat).toBe(index+1);
  expect(amountCountPose(arrival+.005).value).toBe(amountCountPose(arrival+.001).value);
 });
});
