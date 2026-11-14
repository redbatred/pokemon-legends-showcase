import {expect,it} from 'vitest';
import {winFinalePresentation,winTitleLetter} from './winFinalePresentation';
import {WIN_CINEMA_FINISH} from './winCinemaMotion';
it('reserves the victory lighting and oversized composition for the final contact',()=>{
 expect(winFinalePresentation(WIN_CINEMA_FINISH-.001,'mega').victory).toBe(0);
 expect(winFinalePresentation(8,'mega').victory).toBe(1);
 expect(winFinalePresentation(20,'mega')).toEqual(winFinalePresentation(8,'mega'));
});
it('escalates tiers without making smaller wins use an identical camera and title',()=>{
 const poses=(['big','mega','epic','legendary'] as const).map(t=>winFinalePresentation(8,t));
 for(let i=1;i<poses.length;i++)expect(poses[i].heroZoom).toBeGreaterThan(poses[i-1].heroZoom);
});
it('releases the victory shot continuously during the return and suppresses motion when reduced',()=>{
 for(const age of [6.12,6.2,6.9,7.3]){
  const a=winFinalePresentation(age-.00001,'legendary'),b=winFinalePresentation(age+.00001,'legendary');
  expect(Math.abs(a.heroZoom-b.heroZoom)).toBeLessThan(.001);
 }
 expect(winFinalePresentation(9,'mega',1.04).heroZoom).toBe(0);
 expect(winFinalePresentation(6.2,'mega',0,true).heroZoom).toBe(0);
});
it('lands all lettering within the impact, with no animated jitter after settling',()=>{
 expect(winTitleLetter(-.01,0,8)).toMatchObject({alpha:0});
 for(let i=0;i<8;i++)expect(winTitleLetter(1.2,i,8)).toEqual({alpha:1,scale:1,y:0,rotation:-.035});
});
