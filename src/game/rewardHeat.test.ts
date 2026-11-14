import {expect,it} from 'vitest';
import {rewardHeat} from './rewardHeat';
it('uses the same ratio for dollars or cents and keeps fire off below 2×',()=>{
 expect(rewardHeat(500,100)).toEqual(rewardHeat(50000,10000));
 for(const ratio of [0,.5,1,1.99])expect(rewardHeat(ratio*100,100).heat).toBe(0);
 expect(rewardHeat(100,100).color).toBe(0xfff2cf);
});
it('heats through gold, amber and white-hot cream with bounded intensity',()=>{
 expect(rewardHeat(200,100)).toEqual({ratio:2,heat:.08,color:0xffcf62});
 expect(rewardHeat(500,100)).toEqual({ratio:5,heat:.35,color:0xffd36f});
 expect(rewardHeat(2000,100)).toEqual({ratio:20,heat:.75,color:0xffefb8});
 let previous=0;
 for(const ratio of [2,3,5,10,20,40,100,10000]){
  const heat=rewardHeat(ratio*100,100);expect(heat.heat).toBeGreaterThanOrEqual(previous);expect(heat.heat).toBeLessThanOrEqual(1);previous=heat.heat;
  expect(Number.isInteger(heat.color)).toBe(true);
 }
});
it('never turns missing or invalid bet context into a hot wallet',()=>{
 for(const bet of [0,-100,NaN,Infinity])expect(rewardHeat(100000,bet)).toEqual({ratio:0,heat:0,color:0xfff2cf});
 expect(rewardHeat(-100,100)).toEqual({ratio:0,heat:0,color:0xfff2cf});
});
