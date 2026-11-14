import {it,expect} from 'vitest';
import {VERDICT_CUES} from './verdictAudio';
import {verdictAge} from './choreography';
it('places the correct musical verdict after the physical event and on its visible label',()=>{
 for(const outcome of ['capture','escape'] as const){const [physical,musical]=VERDICT_CUES[outcome];expect(physical.at).toBe(12.2);expect(musical.at).toBeGreaterThan(physical.at);expect(verdictAge(musical.at,outcome)).toBe(0);}
 expect(VERDICT_CUES.capture[1].file).toContain('gotcha');expect(VERDICT_CUES.escape[1].file).toContain('flee');
});
