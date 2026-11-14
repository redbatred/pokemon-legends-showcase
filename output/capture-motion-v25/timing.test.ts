import {expect,it} from 'vitest';
import {storyTime,playbackTime} from './timing';
it('gives body conversion 1.9 seconds and retains every story beat in order',()=>{
 expect(playbackTime(12.55)-playbackTime(11.3)).toBeCloseTo(1.9);
 expect(playbackTime(21.45)-playbackTime(18.5)).toBeCloseTo(10.45);
 let previous=-1;for(let t=0;t<27;t+=.007){const s=storyTime(t);expect(s).toBeGreaterThan(previous);expect(playbackTime(s)).toBeCloseTo(t,8);previous=s;}
});
