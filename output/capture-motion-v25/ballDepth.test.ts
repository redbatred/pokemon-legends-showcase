import {it,expect} from 'vitest';
import {usesBallInterior} from './ballDepth';
it('keeps flight, impact and the resisting wing behind the complete ball',()=>{for(const outcome of ['capture','escape'] as const)for(const t of [5.1,5.5,5.85,6.0,6.7,6.8499])expect(usesBallInterior(t,outcome)).toBe(false);});
it('opens the depth sandwich only for absorption and the reverse escape',()=>{expect(usesBallInterior(6.85,'capture')).toBe(true);expect(usesBallInterior(8.2,'capture')).toBe(false);expect(usesBallInterior(12.2,'capture')).toBe(false);expect(usesBallInterior(12.2,'escape')).toBe(true);expect(usesBallInterior(13.45,'escape')).toBe(false);});
