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
  const l=gameLayout(w,h,true),r=rewardLayout(w,h);
  expect(r.y).toBeGreaterThan(l.worldY+217.5*l.scale);
  expect(r.y+r.size/2+8).toBeLessThan(l.dockTop);
  expect(r.x).toBe(w/2);expect(r.y).toBeCloseTo(l.stageY+l.stageWidth*.5*l.stageFlatten*.317);expect(r.width).toBeLessThan(l.stageWidth*.25);
 }
});

it('keeps Auto Spin count, mode and start hit areas separate in landscape and portrait',async()=>{
 const {autoSpinLayout}=await import('./modalLayout');
 for(const [w,h] of [[568,320],[560,390],[390,570],[320,568],[560,570]]){
  const l=autoSpinLayout(w,h),targets=[...Array.from({length:8},(_,i)=>l.count(i)),l.individual,l.all,l.start];
  for(const a of targets){expect(a.x).toBeGreaterThanOrEqual(0);expect(a.x+a.width).toBeLessThanOrEqual(w);expect(a.y+a.height).toBeLessThanOrEqual(h);}
  for(let i=0;i<targets.length;i++)for(let j=i+1;j<targets.length;j++){const a=targets[i],b=targets[j];expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);}
  expect(l.infoY+16).toBeLessThan(l.start.y);
 }
});

it('keeps the short landscape guide clear of its footer',()=>{const f=modalLayout(720,320,'about');expect(f.height).toBe(320);expect(240).toBeLessThan(f.height-73);});
