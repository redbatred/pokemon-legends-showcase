import {expect,it} from 'vitest';
import {playbackTime,storyTime} from './timing';
import {THROW_AT} from './throwGate';
it('holds the eye encounter for 2.45 seconds before a usable throw prompt',()=>{
 expect(playbackTime(7.5)-playbackTime(6.15)).toBeCloseTo(2.45);
 expect(storyTime(THROW_AT)).toBeCloseTo(9.45);
});
it('adds a shared suspense hold before either result, never a fake extra shake',()=>{
 for(const result of ['capture','escape'] as const){
  expect(playbackTime(16.65,result)-playbackTime(16.1,result)).toBeCloseTo(1);
  for(let t=0;t<34;t+=.04)expect(playbackTime(storyTime(t,result),result)).toBeCloseTo(t,8);
 }
});
