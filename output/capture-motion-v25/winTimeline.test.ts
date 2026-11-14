import {describe,it,expect} from 'vitest';
import {winState,WIN_STAGES} from './winTimeline';
import {playbackTime,storyTime} from './timing';
describe('legendary award sequence',()=>{
 it('uses the configured reward for different Pokémon without changing the animation',()=>{expect(winState(9,42).value).toBe(42);expect(winState(9,500).value).toBe(500);expect(winState(-1,42).value).toBe(0);});
 it('counts monotonically without exceeding the fixed mock award',()=>{let previous=0;for(let t=-1;t<12;t+=.007){const s=winState(t);expect(s.value).toBeGreaterThanOrEqual(previous);expect(s.value).toBeLessThanOrEqual(180);previous=s.value;}expect(previous).toBe(180);});
 it('lands exactly on each milestone and holds while both impacts play',()=>{for(const s of WIN_STAGES){expect(winState(s.end).value).toBe(s.value);expect(winState(s.end+.25).value).toBe(s.value);expect(winState(s.end+.12).impact).toBeGreaterThan(0);}});
 it('is deterministic when inspected in reverse and returns the final award',()=>{const forward=Array.from({length:100},(_,i)=>winState(i*.09));for(let i=99;i>=0;i--)expect(winState(i*.09)).toEqual(forward[i]);expect(winState(9).value).toBe(180);});
 it('keeps the audio and picture clocks invertible for both outcomes',()=>{for(const result of ['capture','escape'] as const)for(let t=0;t<24;t+=.03)expect(storyTime(playbackTime(t,result),result)).toBeCloseTo(t,7);expect(playbackTime(23.05,'capture')-playbackTime(23.05,'escape')).toBeCloseTo(7.5);});
});
