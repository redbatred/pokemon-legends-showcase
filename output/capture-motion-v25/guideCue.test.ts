import {describe,it,expect} from 'vitest';
import {guideCue,guideLayout,ARRIVE_HOLD} from './guideCue';
describe('Team Rocket choreography',()=>{
 it('keeps the capture and counting clear until the post-reward reaction',()=>{
  for(let t=0;t<=19;t+=.1){
   if(t>=9.05&&t<11.65||t>=16.75&&t<17)continue;
   expect(guideCue(t,8,true,false,0)).toBeNull();
   if(t>=5.25)expect(guideCue(t,8,true,false,2)).toBeNull();
  }
  expect(guideCue(15.2,0,false,false,2)).toBeNull();
 });
 it('briefly taunts at the input hold and retracts before contact',()=>{
  // The rivals announce themselves first, then dare the throw; neither line outlives the press.
  expect(guideCue(5,0,true,true,1)?.id).toBe('arrive');
  expect(guideCue(5,0,true,true,ARRIVE_HOLD+1)?.id).toBe('throw');
  expect(guideCue(5,0,true,true,ARRIVE_HOLD-.01)?.opacity).toBeLessThan(.01);
  expect(guideCue(5.12,0,true,false,1)?.opacity).toBeCloseTo(.5);
  expect(guideCue(5.12,0,true,false,ARRIVE_HOLD+1)?.opacity).toBeCloseTo(.5);
  expect(guideCue(5.3,0,true,false,1)).toBeNull();
  expect(guideCue(5,0,true,true,ARRIVE_HOLD+4)).toBeNull();
  expect(guideCue(5.1,0,true,false,ARRIVE_HOLD+4)).toBeNull();
 });
 it('taunts while the closed ball is shaking, then clears before the verdict',()=>{
  for(const caught of [true,false]){expect(guideCue(9.8,0,caught,false,2)?.id).toBe('knock');expect(guideCue(11.7,0,caught,false,2)).toBeNull();expect(guideCue(12.2,0,caught,false,2)).toBeNull();}
 });
 it('lets James react only after the escape smoke clears',()=>{
  expect(guideCue(15.9,0,false,false,2)?.id).toBe('escape');
  for(const caught of [true,false])expect(guideCue(17,8,caught,false,2)).toBeNull();
 });
 it('keeps Jessie in the upper margin, clear of the subject and Throw',()=>{
  for(const [w,h] of [[720,960],[1280,720]]){
   const a=guideLayout(w,h,'throw'),b=guideLayout(w,h,'escape');
   expect(a.bubbleY).toBeGreaterThan(h*.09);
   expect(a.bubbleY+a.bubbleH).toBeLessThan(h*.32);
   expect(a.portraitX+a.size*.4).toBeLessThan(w*.3);
   expect(a.right).toBe(false);expect(b.right).toBe(true);
   for(const v of [a,b]){expect(v.bubbleX).toBeGreaterThanOrEqual(0);expect(v.bubbleX+v.bubbleW).toBeLessThan(w);expect(v.bubbleY+v.bubbleH).toBeLessThan(h-132);}
  }
 });
});

it('adds a frustrated reaction only after the settled reward and clears before exit',()=>{
 expect(guideCue(16.6,6.8,true,false,2)).toBeNull();
 expect(guideCue(16.84,8,true,false,2)?.id).toBe('caught');
 expect(guideCue(16.84,5.8,true,false,2)).toBeNull();
 expect(guideCue(17.02,10,true,false,2)).toBeNull();
});
