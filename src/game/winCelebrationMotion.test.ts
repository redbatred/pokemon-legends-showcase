import {expect,it} from 'vitest';
import {celebrationPose,specialWinGeometry} from './winCelebrationMotion';
import {cardTrayLayout,gameLayout,revealControlsLayout} from './rendering';

it('keeps the award clear of the card tray and action buttons across game sizes',()=>{
 for(const [w,h] of [[320,400],[375,450],[320,480],[360,540],[390,780],[430,932],[568,320],[667,375],[844,390],[900,550],[1280,600],[1280,720],[1920,1080]]){
  const g=specialWinGeometry(w,h),l=gameLayout(w,h,true),tray=cardTrayLayout(w,h,0),controls=revealControlsLayout(w,h);
  expect(g.x-g.width/2).toBeGreaterThan(0);expect(g.x+g.width/2).toBeLessThan(w);
  expect(g.y-g.height/2).toBeGreaterThanOrEqual(g.safeTop-1);
  expect(g.y+g.height/2).toBeLessThan(tray.y-5);
  if(!l.sideControls)expect(g.y+g.height/2).toBeLessThan(controls.next.y-controls.next.size/2-5);
  for(const c of [controls.next,controls.all])expect(g.x-g.width/2>c.x+c.size/2+8||g.x+g.width/2<c.x-c.size/2-8||g.y+g.height/2<c.y-c.size/2-8||g.y-g.height/2>c.y+c.size/2+8).toBe(true);
  expect(g.amountY-g.titleY).toBeGreaterThan(g.titleSize);
 }
});
it('holds the fully counted banner indefinitely and fades only after advance',()=>{
 expect(celebrationPose(.2,0).count).toBe(0);
 for(const age of [2.4,3,30,600])expect(celebrationPose(age,0)).toMatchObject({alpha:1,count:1,amountAlpha:1});
 expect(celebrationPose(600,.09).alpha).toBeCloseTo(.5);
 expect(celebrationPose(600,.18)).toMatchObject({alpha:0,count:1,amountAlpha:1});
});

it('lets the big award count breathe before its final emphasis',()=>{expect(celebrationPose(.8).count).toBeLessThan(.5);expect(celebrationPose(1.6).count).toBeLessThan(1);expect(celebrationPose(2.1).count).toBe(1);});
