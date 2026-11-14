import {expect,it} from 'vitest';
import {nextPresentationStop} from './presentationSkip';
import {playbackTime} from './timing';
import {WIN_STAGES} from './winTimeline';
it('finishes one reward milestone at a time, then the card badge',()=>{
 const base=playbackTime(18.5);let t=base+1.16;
 for(const stage of WIN_STAGES){t=nextPresentationStop(t,'capture');expect(t).toBeCloseTo(base+stage.end);t+=.001;}
 expect(nextPresentationStop(t,'capture')).toBeCloseTo(base+6.05);
});
it('never skips past the interactive throw gate on entry',()=>{expect(nextPresentationStop(playbackTime(8.8),'capture')).toBe(playbackTime(9.45));});
it('terminates at the branch endpoint and never runs a win tally on escape',()=>{
 const last=playbackTime(23.05,'escape');expect(nextPresentationStop(last-.01,'escape')).toBe(last);expect(nextPresentationStop(last,'escape')).toBe(last);
 expect(nextPresentationStop(playbackTime(18.5,'escape'),'escape')).toBeLessThanOrEqual(last);
});
