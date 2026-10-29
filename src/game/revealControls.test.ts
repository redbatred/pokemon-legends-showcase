import {expect,it} from 'vitest';
import {gameLayout,revealControlsLayout} from './rendering';
it('centers a prominent right-hand Next on the card without covering it or leaving the viewport',()=>{
 for(const [w,h] of [[320,720],[320,800],[320,568],[360,540],[390,780],[430,932],[568,320],[667,375],[844,390],[1280,720],[1920,1080]]){
  const l=gameLayout(w,h,true),c=revealControlsLayout(w,h);expect(c.next.y).toBeCloseTo(l.worldY-8*l.scale);expect(c.next.size).toBeGreaterThanOrEqual(l.compact||w<360?80:96);expect(c.next.x).toBeGreaterThan(w/2);
  for(const button of [c.next,c.all]){expect(button.x-button.size/2).toBeGreaterThanOrEqual(2);expect(button.x+button.size/2).toBeLessThanOrEqual(w-2);expect(button.y+button.size/2+26).toBeLessThan(l.dockTop);}
  expect(c.next.x-c.next.size/2).toBeGreaterThanOrEqual(w/2+156*l.scale+3);
 }
});
