import {expect,it} from 'vitest';
import {WinLedger,winFlightPose,WIN_LAUNCH_TIME,WIN_FLIGHT_TIME,winTier} from './winTransfer';
import {gameLayout,revealControlsLayout} from './rendering';
import {utilityLayout,compactToolbar} from './utilityLayout';
import {totalWinLayout} from './modalLayout';
it('credits each card only on arrival, including repeated redraws and reveal-all callbacks',()=>{
 const l=new WinLedger();l.reset('a',[100,250]);expect(l.total).toBe(350);expect(l.offer(2,4500)).toBe(true);expect(l.total).toBe(350);expect(l.offer(2,4500)).toBe(false);expect(l.settle(2)).toBe(true);expect(l.total).toBe(4850);expect(l.settle(2)).toBe(false);expect(l.offer(1,250)).toBe(false);
 l.offer(3,75);l.offer(4,0);l.settle(4);l.settle(3);expect(l.total).toBe(4925);l.reset('b');expect(l.total).toBe(0);expect(l.offer(0,25)).toBe(true);
});
it('holds on the stone, flies continuously and lands exactly on the total',()=>{
 const a={x:300,y:400},b={x:900,y:180},start=WIN_LAUNCH_TIME,end=start+WIN_FLIGHT_TIME;
 expect(winFlightPose(start,a,b)).toMatchObject({...a,progress:0});expect(winFlightPose(end,a,b)).toMatchObject({...b,done:true});
 for(const at of [start,end]){const before=winFlightPose(at-.00001,a,b),after=winFlightPose(at+.00001,a,b);expect(Math.hypot(after.x-before.x,after.y-before.y)).toBeLessThan(.001);}
});
it('keeps the total readable and clear of the centered reveal controls',()=>{
 for(const [w,h] of [[320,480],[360,540],[390,780],[430,932],[568,320],[844,390],[900,550],[1280,600],[1280,720],[1920,1080]]){
  const l=gameLayout(w,h,true),c=revealControlsLayout(w,h),v=totalWinLayout(w,h);
  expect(v.x-v.width/2).toBeGreaterThan(0);expect(v.x+v.width/2).toBeLessThan(w);expect(v.labelY).toBeGreaterThan(10);expect(v.y+v.size/2).toBeLessThan(l.dockTop-4);
  if(!l.compact&&!l.short)expect(v.y+v.size*.6).toBeLessThan(l.top-3);
  for(const button of [c.next,c.all])expect(v.y+v.size/2+4<button.y-button.size/2||v.labelY>button.y+button.size/2+26||v.x+v.width/2<button.x-button.size/2-4||v.x-v.width/2>button.x+button.size/2+4,JSON.stringify({w,h,v,button})).toBe(true);
 }
});

it('reserves big-win wording for a genuinely larger payout and marks lower specials distinctly',()=>{
 expect(winTier({id:'c',rarity:'Special Illustration Rare',value:500},1000)).toBe('special');expect(winTier({id:'c',rarity:'Rare',value:2500},1000)).toBe('big');expect(winTier({id:'c',rarity:'Rare',value:10000},1000)).toBe('epic');expect(winTier({id:'energy',rarity:'Energy',value:0},1000,true)).toBe(null);
});

it('separates total captions from toolbar labels and compact branding',()=>{
 for(const [w,h] of [[390,780],[430,932],[568,320],[844,390]]){const l=gameLayout(w,h,true),v=totalWinLayout(w,h),u=utilityLayout(w,h,true);if(l.compact)expect(v.labelY).toBeGreaterThan(compactToolbar(w).logoWidth*.38+26.4);else expect(v.labelY).toBeGreaterThan(u.auto.y+u.auto.height+6);}
});
