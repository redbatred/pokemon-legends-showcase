import {expect,it} from 'vitest';
import {celebrationHold,celebrationPose,specialWinGeometry} from './winCelebrationMotion';
import {WIN_LAUNCH_TIME} from './winTransfer';
import {cardTrayLayout,gameLayout,revealControlsLayout} from './rendering';

it('keeps the award clear of the card tray and action buttons across game sizes',()=>{
 for(const [w,h] of [[320,400],[375,450],[320,480],[360,540],[390,780],[430,932],[568,320],[667,375],[844,390],[900,550],[1280,600],[1280,720],[1920,1080]]){
  const g=specialWinGeometry(w,h),l=gameLayout(w,h,true),tray=cardTrayLayout(w,h,0),controls=revealControlsLayout(w,h);
  expect(g.x-g.width/2).toBeGreaterThan(0);expect(g.x+g.width/2).toBeLessThan(w);
  expect(g.y-g.height/2).toBeGreaterThanOrEqual(g.safeTop-1);
  expect(g.y+g.height/2).toBeLessThan(tray.y-5);
  if(!l.sideControls)expect(g.y+g.height/2).toBeLessThan(controls.next.y-controls.next.size/2-5);
  for(const c of [controls.next,controls.all])expect(g.x+g.width/2<c.x-c.size/2-8||g.y+g.height/2<c.y-c.size/2-8||g.y-g.height/2>c.y+c.size/2+8).toBe(true);
  expect(g.amountY-g.titleY).toBeGreaterThan(g.titleSize);
 }
});
it('finishes the count before launch and clears the frame for the transferring amount',()=>{
 for(const tier of ['special','big','epic'] as const){
  const hold=celebrationHold(tier),launch=hold+WIN_LAUNCH_TIME;
  expect(celebrationPose(.2,hold).count).toBe(0);
  expect(celebrationPose(launch-.2,hold).count).toBe(1);
  expect(celebrationPose(launch,hold).alpha).toBeCloseTo(0);
  expect(celebrationPose(launch,hold).amountAlpha).toBe(1);
 }
 expect(celebrationHold('epic')).toBeGreaterThan(celebrationHold('big'));
});
