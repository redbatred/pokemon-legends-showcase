import {describe,it,expect} from 'vitest';
import {outcomeFromByte,awardAt,camera} from './model';
describe('capture presentation contract',()=>{
 it('splits every possible byte exactly 128/128',()=>{
  const results=Array.from({length:256},(_,i)=>outcomeFromByte(i));
  expect(results.filter(r=>r==='capture')).toHaveLength(128);
  expect(results.filter(r=>r==='escape')).toHaveLength(128);
 });
 it('never awards an escape or awards before the captured card is revealed',()=>{
  for(let t=0;t<=19;t+=.025){expect(awardAt('escape',t)).toBeNull();if(t<14.15)expect(awardAt('capture',t)).toBeNull();}
  expect(awardAt('capture',14.15)).toEqual({multiplier:180,bet:10,total:1800});
 });
 it('keeps the settling ball above the dialogue and covers the canvas during camera travel',()=>{
  for(const [w,h] of [[1280,720],[720,960]])for(const branch of ['capture','escape'] as const)for(let t=9.05;t<12.2;t+=.02){
   const x=w*.76,y=h*.81+26,c=camera(w,h,x,y,t,branch);
   expect(y*c.z+c.y).toBeLessThan(h-(w<1000?112:103));
   expect(c.x).toBeLessThanOrEqual(0);expect(c.y).toBeLessThanOrEqual(0);
   expect(c.x+w*c.z).toBeGreaterThanOrEqual(w-.001);expect(c.y+h*c.z).toBeGreaterThanOrEqual(h-.001);
  }
 });
});
