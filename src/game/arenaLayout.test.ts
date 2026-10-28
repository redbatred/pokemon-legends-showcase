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
it('scales the platform, card and their vertical gap as one composition on every aspect ratio',()=>{
 const sizes=[[320,480],[360,540],[390,780],[430,932],[568,320],[844,390],[1024,600],[1280,720],[1440,600],[1920,1080],[2560,1080]];
 const reference=gameLayout(1280,720,true),ratio=reference.stageWidth/(312*reference.scale),gap=(reference.stageY-reference.worldY-217.5*reference.scale)/reference.scale;
 for(const [w,h] of sizes){const l=gameLayout(w,h,true);expect(l.stageWidth/(312*l.scale),`${w}×${h} platform/card proportion`).toBeCloseTo(ratio,6);expect((l.stageY-l.worldY-217.5*l.scale)/l.scale).toBeCloseTo(gap,6);expect(l.worldY-217.5*l.scale).toBeGreaterThanOrEqual(l.top-.01);}
});
