import {expect,it} from 'vitest';
import {gameLayout,revealControlsLayout} from './rendering';
it('keeps enlarged next/reveal controls outside the stage and above the card tray',()=>{
 for(const [w,h] of [[320,620],[360,540],[390,780],[430,932],[568,320],[667,375],[844,390],[1280,720],[1920,1080]]){
  const l=gameLayout(w,h,true),c=revealControlsLayout(w,h);
  for(const button of [c.next,c.all]){expect(button.size).toBeGreaterThanOrEqual(58);expect(button.x-button.size/2-4).toBeGreaterThanOrEqual(0);expect(button.x+button.size/2+4).toBeLessThanOrEqual(w);expect(button.y+button.size/2+26).toBeLessThanOrEqual(l.dockTop+3);if(l.sideControls)expect(button.x-button.size/2-4).toBeGreaterThan(w/2+l.stageWidth/2);else expect(button.y-button.size/2-4).toBeGreaterThan(l.stageFront);}
 }
});
