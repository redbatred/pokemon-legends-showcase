import {expect,it} from 'vitest';
import {rewardMotion} from './rewardMotion';
import {WIN_STAGES,winState} from './winTimeline';
it('reserves the biggest impact for the final award, with readable holds',()=>{
 const first=rewardMotion(WIN_STAGES[0].end),last=rewardMotion(WIN_STAGES.at(-1)!.end);
 expect(last.punch).toBeGreaterThan(first.punch*1.6);
 expect(last.final).toBe(true);expect(rewardMotion(5.29).final).toBe(false);
 for(const stage of WIN_STAGES)expect(winState(stage.end+.25,420).value).toBeCloseTo(stage.value/180*420);
});
it('keeps anticipation separate from the final hit and settles completely',()=>{
 expect(rewardMotion(4.6).anticipation).toBeGreaterThan(.4);
 expect(rewardMotion(4.6).final).toBe(false);
 expect(rewardMotion(8).punch).toBeLessThan(.001);
 expect(rewardMotion(8).anticipation).toBe(0);
});
it('has identical motion for any creature and deterministic backward scrubbing',()=>{
 const samples=[-1,1.5,2.3,3.2,4.1,5.3,5.46,8].map(t=>rewardMotion(t));
 for(let i=samples.length-1;i>=0;i--)expect(rewardMotion([-1,1.5,2.3,3.2,4.1,5.3,5.46,8][i])).toEqual(samples[i]);
});
