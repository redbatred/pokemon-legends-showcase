import { describe,it,expect } from 'vitest';
import { railElastic,railPosition,railSnap } from './carousel';
describe('pack rail gestures',()=>{
 it('snaps a drag and carries a flick in its direction',()=>{
  expect(railSnap(120,0,210,1400)).toBe(210);
  expect(railSnap(120,1.2,210,1400)).toBe(420);
  expect(railSnap(600,-1.2,210,1400)).toBe(420);
 });
 it('keeps every snap within the first and last pack',()=>{
  expect(railSnap(0,-4,210,1400)).toBe(0);
  expect(railSnap(1380,4,210,1400)).toBe(1400);
  expect(railPosition(1000,0)).toBe(0);
 });
 it('resists dragging beyond the ends without jumping the content',()=>{
  expect(railElastic(-100,1400)).toBe(-22);
  expect(railElastic(1500,1400)).toBe(1422);
  expect(railElastic(400,1400)).toBe(400);
 });
});
