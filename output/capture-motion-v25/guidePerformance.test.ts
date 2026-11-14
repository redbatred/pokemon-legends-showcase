import {it,expect} from 'vitest';
import {guidePerformance} from './guidePerformance';
import {TAUNTS} from './voiceBank';
it('uses anticipation, delivery, emphasis and recovery in chronological order',()=>{for(const line of TAUNTS){const sequence=[0,.18,.5,.95].map(p=>guidePerformance(line,.16+line.duration*p,.7).frame);expect(new Set(sequence).size).toBe(4);expect(sequence).toEqual([...sequence].sort((a,b)=>a-b));}});
it('keeps reduced-motion poses stable and all articulation bounded',()=>{for(const line of TAUNTS)for(let a=0;a<4;a+=.07){const p=guidePerformance(line,a,.9);expect(Math.abs(p.head)).toBeLessThan(6);expect(Math.abs(p.gesture)).toBeLessThanOrEqual(7);expect(guidePerformance(line,a,.9,true)).toMatchObject({rotation:0,head:0,hair:0,gesture:0,offset:0});}});
