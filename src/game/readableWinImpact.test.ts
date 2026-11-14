import {expect,it} from 'vitest';
import {readableWinImpact} from './readableWinImpact';
it('keeps the contact burst below the face and above the title across viewports',()=>{
 for(const [w,h] of [[390,844],[720,960],[1440,900]])for(const title of [.59,.65])for(const t of [0,.04,.12,.25,.5]){
  const p=readableWinImpact(w,h,t,true,h*title);
  expect(p.y-p.size/2).toBeGreaterThan(h*.40);
  expect(p.y+p.size/2).toBeLessThanOrEqual(h*(title-.045)+.000001);
  expect(p.size).toBeLessThanOrEqual(h*.11);
 }
});
it('disperses side flames continuously and clears the scene after recovery',()=>{
 const a=readableWinImpact(720,960,.1,true),b=readableWinImpact(720,960,.4,true);
 expect(b.sideX).toBeGreaterThan(a.sideX);expect(b.alpha).toBeLessThan(a.alpha);
 for(const t of [0,.08,.42,.78]){
  const a=readableWinImpact(720,960,t-.00001,true),b=readableWinImpact(720,960,t+.00001,true);
  expect(Math.abs(a.sideAlpha-b.sideAlpha)).toBeLessThan(.002);
 }
 expect(readableWinImpact(720,960,1,true)).toMatchObject({alpha:0,sideAlpha:0});
});
