import {expect,it} from 'vitest';
import {battleCameraZoom,impactPresentationTime} from './battleFraming';
import {SHOWDOWNS} from './showdownModel';
it('holds a closer combat camera then restores the reward framing',()=>{expect(battleCameraZoom(-1,true,false)).toBe(1);expect(battleCameraZoom(2,true,false)).toBeCloseTo(1.12);expect(battleCameraZoom(2,false,false)).toBeCloseTo(1.04);expect(battleCameraZoom(10,true,false)).toBe(1);});
it('freezes only visual contact briefly and catches up monotonically before the next beat',()=>{const s=SHOWDOWNS[1].strikes;expect(impactPresentationTime(8.68,s,false)).toBeCloseTo(8.635);expect(impactPresentationTime(8.95,s,false)).toBe(8.95);let last=0;for(let t=0;t<13;t+=.005){const p=impactPresentationTime(t,s,false);expect(p).toBeGreaterThanOrEqual(last-1e-8);expect(p).toBeLessThanOrEqual(t);last=p;}expect(impactPresentationTime(8.68,s,true)).toBe(8.68);});

it('keeps reduced-motion camera framing static throughout the reward handoff',()=>{for(let t=-1;t<14;t+=.1)expect(battleCameraZoom(t,true,true)).toBe(1);});
