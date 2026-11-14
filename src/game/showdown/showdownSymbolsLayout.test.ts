import {describe,it,expect} from 'vitest';
import {gameLayout} from '../rendering';
import {cardTrayLayout,revealControlsLayout} from '../rendering';
import {packRevealLayout} from '../packRevealMotion';
import {rewardLayout} from '../modalLayout';
import {AWARD_REACH,showdownSocketsLayout,showdownReceiverLayout} from './showdownSymbolsLayout';

const SIZES:[number,number][]=[[540,720],[390,844],[800,571],[1280,720],[360,640],[720,960],[1440,900],[1024,600],[844,390],[667,375],[600,400],[932,430]];
describe('bonus ball seats',()=>{
 it.each(SIZES)('are three separate seats inside the %i × %i screen',(w,h)=>{
  const l=showdownSocketsLayout(w,h);expect(l.sockets).toHaveLength(3);
  for(const [i,s] of l.sockets.entries()){
   expect(s.x-l.radius).toBeGreaterThanOrEqual(4);expect(s.x+l.radius).toBeLessThanOrEqual(w-4);expect(s.y-l.radius).toBeGreaterThanOrEqual(0);expect(s.y+l.radius).toBeLessThanOrEqual(h);
   if(i)expect(Math.hypot(s.x-l.sockets[i-1].x,s.y-l.sockets[i-1].y)).toBeGreaterThanOrEqual(l.radius*2+1.5);
  }
  expect(l.radius).toBeGreaterThanOrEqual(8.5);expect(l.radius).toBeLessThanOrEqual(16);
 });
 it.each(SIZES.filter(([w,h])=>!gameLayout(w,h,true).compact))('sit on the pedestal lip at %i × %i: clear of the award, the caption, the tray and the Next control',(w,h)=>{
  const l=showdownSocketsLayout(w,h),game=gameLayout(w,h,true),award=rewardLayout(w,h),tray=cardTrayLayout(w,h,0),next=revealControlsLayout(w,h).next;
  expect(l.anchor).toBe('pedestal');
  for(const s of l.sockets){
   // Right of the widest "+$" award, on the pedestal (not past its tip), above the caption and well above the tray.
   expect(s.x-l.radius).toBeGreaterThanOrEqual(award.x+game.stageWidth*AWARD_REACH);
   expect(s.x+l.radius).toBeLessThanOrEqual(w/2+game.stageWidth*.475);
   expect(s.y+l.radius).toBeLessThanOrEqual(game.stageFront+1);expect(s.y+l.radius).toBeLessThan(tray.y-12);
   expect(s.y).toBeGreaterThan(game.stageY);
   // Never on the Next control or the label under it.
   if(s.x+l.radius>next.x-next.size*.62&&s.x-l.radius<next.x+next.size*.62)expect(s.y-l.radius).toBeGreaterThanOrEqual(Math.min(next.y+next.size/2+20+3,game.stageFront-l.radius*2)-.01);
  }
 });
 it.each([[540,720,22,26],[390,844,26,32]])('are about thumb-nail sized at %i × %i',(w,h,min,max)=>{
  const d=showdownSocketsLayout(w,h).radius*2;expect(d).toBeGreaterThanOrEqual(min);expect(d).toBeLessThanOrEqual(max);
 });
 it.each(SIZES.filter(([w,h])=>gameLayout(w,h,true).compact))('leave the caption alone in short landscape at %i × %i',(w,h)=>{
  const l=showdownSocketsLayout(w,h),game=gameLayout(w,h,true),tray=cardTrayLayout(w,h,0),next=revealControlsLayout(w,h).next,caption=Math.min(288,w-(w<650?181:224)-164);
  expect(['tray','caption']).toContain(l.anchor);
  for(const s of l.sockets){
   if(l.anchor==='tray'){expect(s.x-l.radius).toBeGreaterThan(tray.start+10*tray.stride+tray.cardWidth+6);expect(s.y).toBeGreaterThan(tray.y);}
   else{expect(s.x-l.radius).toBeGreaterThanOrEqual(Math.min(w/2+caption/2,next.x-next.size/2-6-l.radius*6-10)-.01);expect(s.x+l.radius).toBeLessThanOrEqual(next.x-next.size/2-5);expect(s.y+l.radius).toBeLessThan(tray.y);expect(Math.abs(s.y-(game.stageFront-11))).toBeLessThan(.01);}
  }
 });
 it.each(SIZES)('stamp the count beside the seats, inside the %i × %i screen and off the Next control',(w,h)=>{
  for(const group of [false,true]){
   const l=showdownSocketsLayout(w,h,group),next=group?packRevealLayout(w,h,11).controls.next:revealControlsLayout(w,h).next,left=l.stamp.align==='centre'?l.stamp.x-l.stamp.reach:l.stamp.align==='left'?l.stamp.x:l.stamp.x-l.stamp.reach*2,right=left+l.stamp.reach*2;
   expect(left).toBeGreaterThanOrEqual(0);expect(right).toBeLessThanOrEqual(w);expect(l.stamp.y-l.stamp.size).toBeGreaterThan(0);
   if(l.stamp.align==='centre')expect(l.stamp.y+l.stamp.size*.5).toBeLessThanOrEqual(Math.min(...l.sockets.map(s=>s.y))-l.radius+.01);
   else if(l.stamp.align==='left')expect(left).toBeGreaterThan(l.sockets[2].x+l.radius);else expect(right).toBeLessThan(l.sockets[0].x-l.radius);
   // The stamp never lands on a control or its label.
   for(const c of group?[next,packRevealLayout(w,h,11).controls.all]:[next]){const clear=right<=c.x-c.size*.62||left>=c.x+c.size*.62||l.stamp.y-l.stamp.size*.7>=c.y+c.size/2+20||l.stamp.y+l.stamp.size*.5<=c.y-c.size/2;expect(clear).toBe(true);}
  }
 });
});

describe('bonus ball seats while the rest of the pack is laid out',()=>{
 it.each(SIZES)('are on open floor at %i × %i: under the cards, off both controls, above or beside the tray',(w,h)=>{
  const l=showdownSocketsLayout(w,h,true),board=packRevealLayout(w,h,11),tray=cardTrayLayout(w,h,0),compact=gameLayout(w,h,true).compact;
  expect(['controls','tray']).toContain(l.anchor);
  for(const [i,s] of l.sockets.entries()){
   expect(s.x-l.radius).toBeGreaterThanOrEqual(4);expect(s.x+l.radius).toBeLessThanOrEqual(w-4);expect(s.y+l.radius).toBeLessThanOrEqual(h);
   if(i)expect(s.x-l.sockets[i-1].x).toBeGreaterThanOrEqual(l.radius*2+1.5);
   for(const control of [board.controls.all,board.controls.next]){const apart=Math.abs(s.x-control.x)>=control.size/2+l.radius+3||s.y-l.radius>=control.y+control.size/2+20;expect(apart).toBe(true);}
   if(l.anchor==='controls'&&!compact){expect(s.y-l.radius).toBeGreaterThan(board.bottom);expect(s.y+l.radius).toBeLessThan(tray.y);}
   if(l.anchor==='tray')expect(s.x-l.radius).toBeGreaterThan(tray.start+10*tray.stride+tray.cardWidth+6);
  }
 });
});

describe('receiver artwork registration',()=>{
 it.each([[390,844],[720,960],[1440,900],[844,390]])('keeps all three balls registered to the original receiver holes at %i × %i',(w,h)=>{
  const l=showdownReceiverLayout(w,h,2172,724);
  l.holes.forEach((hole,i)=>{
   expect((hole.x-l.x)/l.scale).toBeCloseTo([610.5,1086,1561.5][i]);
   expect((hole.y-l.y)/l.scale).toBeCloseTo(362);
  });
  expect(l.tokenScale*30/l.scale).toBeCloseTo(335);
  expect(l.subtitleY+8*l.typeScale).toBeLessThan(l.y);
  expect(l.titleY+16*l.typeScale).toBeLessThan(l.subtitleY-8*l.typeScale);
  expect(l.titleY-16*l.typeScale).toBeGreaterThan(0);
 });
});
