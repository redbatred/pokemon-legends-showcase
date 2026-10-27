import { expect,it } from 'vitest';
import { modalLayout,rewardLayout } from './modalLayout';
import { gameLayout } from './rendering';

it('keeps centered panel frames and headers within phone, landscape and desktop bounds',()=>{
 for(const [w,h] of [[320,540],[390,780],[568,320],[844,390],[1280,720],[1920,1080]]){
  for(const kind of ['collection','history','about','inspect','complete']){
   const f=modalLayout(w,h,kind);
   expect(f.x).toBeGreaterThanOrEqual(0);expect(f.y).toBeGreaterThanOrEqual(0);
   expect(f.x+f.width).toBeLessThanOrEqual(w);expect(f.y+f.height).toBeLessThanOrEqual(h);
   expect(f.x+f.width/2).toBe(w/2);expect(f.y+f.height/2).toBe(h/2);
  }
 }
});
it('reserves the reward between the card and tray without covering mobile controls',()=>{
 for(const [w,h] of [[320,540],[390,780],[568,320],[844,390],[1280,720],[1920,1080]]){
  const l=gameLayout(w,h,true),r=rewardLayout(w,h,l.dockTop,l.sideControls,l.compact);
  expect(r.y).toBeGreaterThan(l.worldY+217.5*l.scale);
  expect(r.y+r.size+12).toBeLessThan(l.dockTop);
  expect(r.x-r.width/2).toBeGreaterThanOrEqual(l.sideControls?130:78);
 }
});
