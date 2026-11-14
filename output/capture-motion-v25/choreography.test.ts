import {it,expect} from 'vitest';
import {entryShot,ENTRY_START,EYE_START,ARRIVAL_START,verdictAge,exitShot} from './choreography';
it('gives the wipe, eye and arrival exclusive ownership at every frame',()=>{
 expect(ENTRY_START).toBe(5.15);expect(EYE_START).toBe(6.4);expect(ARRIVAL_START).toBe(7.5);
 for(let t=ENTRY_START;t<9;t+=1/120){const s=entryShot(t);expect([s.wipe,s.eye,s.arrival].filter(Boolean)).toHaveLength(1);}
 expect(entryShot(EYE_START).wipe).toBe(false);expect(entryShot(EYE_START).eye).toBe(true);
 expect(entryShot(ARRIVAL_START).eye).toBe(false);expect(entryShot(ARRIVAL_START).arrival).toBe(true);
});
it('lets the physical result land before presenting the written verdict',()=>{
 expect(verdictAge(12.2,'capture')).toBeLessThan(0);expect(verdictAge(12.2,'escape')).toBeLessThan(0);
 expect(verdictAge(12.43,'capture')).toBeGreaterThan(0);expect(verdictAge(12.65,'escape')).toBeGreaterThan(0);
});
it('switches to the pack only while the exit ink fully covers the image',()=>{
 expect(exitShot(17.5).showPack).toBe(false);expect(exitShot(17.72).showPack).toBe(true);
 expect(exitShot(17.72).covered).toBe(true);expect(exitShot(18.6).visible).toBe(false);
});
