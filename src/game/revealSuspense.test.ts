import {expect,it} from 'vitest';
import {revealSuspense} from './revealSuspense';
it('occasionally teases normal cards without changing outcomes or repeating back to back',()=>{expect(revealSuspense(false,false,false,.1)).toBe(.62);expect(revealSuspense(false,false,false,.9)).toBe(0);expect(revealSuspense(false,false,true,.1)).toBe(0);expect(revealSuspense(true,false,false,.1)).toBe(1.3);expect(revealSuspense(true,true,false,.1)).toBe(0);expect(revealSuspense(false,true,false,.1)).toBe(0);});
