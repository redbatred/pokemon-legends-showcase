import {expect,it} from 'vitest';
import {AutoSpinSession,AUTO_SPIN_COUNTS} from './autoSpin';
it('offers only the requested finite pack counts',()=>{
 expect(AUTO_SPIN_COUNTS).toEqual([5,10,15,20,30,50,75,100]);
 expect(()=>new AutoSpinSession(7,'all')).toThrow();
});
it('uses the opening machine one card at a time or all at once',()=>{
 const single=new AutoSpinSession(5,'individual'),all=new AutoSpinSession(5,'all');
 expect(single.next('browse')).toBe('open');expect(single.next('sealed')).toBe('tear');
 expect(single.next('awaiting')).toBe('next');expect(all.next('awaiting')).toBe('all');
 expect(single.next('revealed')).toBe('next');expect(all.next('revealed')).toBe('all');
 for(const phase of ['reserving','tearing','revealing','collecting','settling'])expect(all.next(phase)).toBe(null);
});
it('counts unique settlements including 100 packs, independently of the 30-row history',()=>{
 const session=new AutoSpinSession(100,'all');
 for(let i=0;i<100;i++){session.record(`pack-${i}`);session.record(`pack-${i}`);expect(session.completed).toBe(i+1);}
 expect(session.running).toBe(false);expect(session.next('complete')).toBe(null);
});
it('stops future actions immediately and never restarts on later settlements',()=>{
 const session=new AutoSpinSession(5,'individual');session.stop();session.record('in-flight');
 for(const phase of ['browse','sealed','awaiting','revealed','complete'])expect(session.next(phase)).toBe(null);
 expect(session.running).toBe(false);
});
