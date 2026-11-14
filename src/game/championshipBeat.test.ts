import {expect,it} from 'vitest';
import {championshipBeat} from './championshipBeat';
it('opens the impact across the screen then clears the central award',()=>{
 expect(championshipBeat(6.0,'big').burst).toBe(0);
 expect(championshipBeat(6.18,'big').burst).toBeGreaterThan(.8);
 expect(championshipBeat(6.65,'big').burst).toBe(0);
 expect(championshipBeat(7.5,'big').reveal).toBe(1);
});
it('reserves the new victory layout for contact and holds it until the return',()=>{
 expect(championshipBeat(6.11,'mega').reveal).toBe(0);
 expect(championshipBeat(9,'mega').reveal).toBe(1);
 expect(championshipBeat(9,'mega',1.04).reveal).toBe(0);
});
it('uses successively stronger stadium lighting without flickering during the hold',()=>{
 const big=championshipBeat(8,'big'),legend=championshipBeat(8,'legendary');
 expect(legend.light).toBeGreaterThan(big.light);
 expect(championshipBeat(80,'legendary')).toEqual(legend);
 expect(championshipBeat(6.18,'big',0,true).burst).toBe(0);
});
it('finishes the close-up before contact so the final camera cannot crop the award',async()=>{
 const {winAttackCloseup}=await import('./championshipBeat');
 expect(winAttackCloseup(5.5)).toBe(1);
 for(const t of [0,4,6,6.12,8])expect(winAttackCloseup(t)).toBe(0);
 expect(winAttackCloseup(5.5,true)).toBe(0);
});
it('closes the bars to a strip across the eyes only for the eye shot',async()=>{
 const {eyeBars,winAttackCloseup,EYE_BEAT}=await import('./championshipBeat');
 expect(eyeBars(5.1)).toBe(0);expect(eyeBars(EYE_BEAT.glint)).toBe(1);expect(eyeBars(5.75)).toBe(0);expect(eyeBars(EYE_BEAT.glint,true)).toBe(0);
 // The lens is on the eyes before the bars close and clears before the projectile leaves at 5.78.
 expect(winAttackCloseup(EYE_BEAT.bars+.08)).toBeGreaterThan(.99);expect(winAttackCloseup(5.76)).toBe(0);
});

