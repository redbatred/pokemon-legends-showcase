import {expect,it} from 'vitest';
import {AutoSpinSession,AUTO_SPIN_COUNTS,autoInterludeDelay} from './autoSpin';
import type {Result} from './model';
const result=(id:string,total=125):Result=>({id,at:'2026-10-30T12:00:00.000Z',cards:[],total});
it('offers one pack and the requested finite pack counts',()=>{
 expect(AUTO_SPIN_COUNTS).toEqual([1,5,10,15,20,30,50,75,100]);
 expect(()=>new AutoSpinSession(7,'all')).toThrow();
});
it('gives each run its own stable identity',()=>{
 const first=new AutoSpinSession(5,'all'),second=new AutoSpinSession(5,'all');
 expect(first.id).toBeTruthy();expect(first.id).not.toBe(second.id);
});
it('uses the opening machine one card at a time or all at once',()=>{
 const single=new AutoSpinSession(5,'individual'),all=new AutoSpinSession(5,'all');
 expect(single.next('browse')).toBe('open');expect(single.next('sealed')).toBe('tear');
 expect(single.next('awaiting')).toBe('next');expect(all.next('awaiting')).toBe('all');
 expect(single.next('revealed')).toBe('next');expect(all.next('revealed')).toBe('all');
 expect(all.next('awaiting')).toBe('all');expect(all.next('revealed')).toBe('all');
 expect(single.next('revealed')).toBe('next');
 for(const phase of ['reserving','tearing','revealing','collecting','settling'])expect(all.next(phase)).toBe(null);
});
it('retains all exact results and integer-cent winnings across 100 packs independently of bounded history',()=>{
 const session=new AutoSpinSession(100,'all'),results=Array.from({length:100},(_,i)=>result(`pack-${i}`,i+101));
 for(const [i,pack] of results.entries()){
  expect(session.record(pack)).toBe(true);expect(session.record({...pack,total:999999})).toBe(false);expect(session.completed).toBe(i+1);
 }
 expect(session.results).toEqual(results);expect(session.results[0]).toBe(results[0]);
 expect(session.totalWon).toBe(15050);expect(session.running).toBe(false);expect(session.next('complete')).toBe(null);
});
it('stops purchases immediately while allowing an explicitly requested in-flight finish',()=>{
 const session=new AutoSpinSession(5,'individual');session.stop();session.record(result('in-flight',425));
 for(const phase of ['browse','sealed','awaiting','revealed','complete'])expect(session.next(phase)).toBe(null);
 expect(session.next('sealed',true)).toBe('tear');expect(session.next('revealed',true)).toBe('next');
 expect(session.next('browse',true)).toBe(null);expect(session.next('complete',true)).toBe(null);
 expect(session.running).toBe(false);expect(session.completed).toBe(1);expect(session.totalWon).toBe(425);
});
it('holds each automatic pack total long enough for the selected presentation mode',()=>{
 expect(autoInterludeDelay(false,false)).toBe(1800);expect(autoInterludeDelay(true,false)).toBe(1200);
 expect(autoInterludeDelay(false,true)).toBe(400);expect(autoInterludeDelay(true,true)).toBe(400);
});
