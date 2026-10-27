import {expect,it} from 'vitest';
import {gameLayout} from './rendering';
it('reserves the complete platform and controls before the card tray',()=>{
 for(const [w,h] of [[360,540],[390,780],[568,320],[844,430],[1280,720],[1920,1080]]){
  const l=gameLayout(w,h,true);
  expect(l.stageFront).toBeLessThan(l.sideControls?l.dockTop:l.actionTop);
  expect(l.worldY+217.5*l.scale).toBeLessThanOrEqual(l.stageY+1);
  expect(l.scale).toBeGreaterThan(.15);
  expect(l.stageWidth).toBeLessThanOrEqual(w*1.04);
 }
});
