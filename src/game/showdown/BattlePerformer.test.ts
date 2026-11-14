import {it,expect} from 'vitest';
import {BattlePerformer} from './BattlePerformer';

function actor(){return {
  entranceDuration:1,chargeDuration:.5,attackDuration:1,recoveryDuration:.25,
  mode:'idle',pose:0,
  play(cue:string){this.mode=cue;this.pose=0;},
  setEntranceTime(t:number){if(this.mode==='emerge')this.pose=t;},
  setAttackTime(t:number){if(this.mode==='charge')this.pose=t;},
  update(_dt:number){},capturePose(){},
};}
it('advances native entrance, charge, attack and recovery poses before returning to idle',()=>{
  const a=actor(),p=new BattlePerformer(a);
  p.update(.4,.016,false,0,3);expect(a.mode).toBe('emerge');expect(a.pose).toBe(.4);
  p.update(1.2,.016,false,0,3);expect(a.mode).toBe('idle');
  p.update(2.8,.016,false,0,3);expect(a.mode).toBe('charge');expect(a.pose).toBeCloseTo(.3);
  p.update(3.6,.016,false,0,3);expect(a.pose).toBeCloseTo(1.1);
  p.update(5,.016,false,0,3);expect(a.mode).toBe('idle');
});
it('keeps reduced-motion heroes in a rendered idle pose',()=>{
  const a=actor(),p=new BattlePerformer(a);p.update(2.8,.016,true,0,3);expect(a.mode).toBe('idle');expect(a.pose).toBe(0);
});
it('makes an elemental voice audible and stops it on reset',()=>{
  const p=new BattlePerformer(actor());let gain=0,stopped=false;
  p.setVoice({update:v=>{gain=v;},stop:()=>{stopped=true;}},3);
  p.update(3.2,.016,false,0,3);expect(gain).toBeGreaterThan(0);
  p.reset();expect(stopped).toBe(true);
});
it('stops audio after its envelope rather than retaining a stale voice',()=>{
  const p=new BattlePerformer(actor());let stopped=false;
  p.setVoice({update:()=>{},stop:()=>{stopped=true;}},3);p.update(6,.016,false,0,3);expect(stopped).toBe(true);
});
it('restarts a consecutive attack even when the prior native recovery is still active',()=>{
 const a=actor(),p=new BattlePerformer(a);let starts=0;
 const play=a.play.bind(a);a.play=(cue:string)=>{if(cue==='charge')starts++;play(cue);};
 p.update(3.6,.016,false,0,3);expect(starts).toBe(1);
 p.update(4.1,.016,false,0,4.5);expect(starts).toBe(2);expect(a.pose).toBeCloseTo(.1);
});
