import {describe,it,expect} from 'vitest';
import {TAUNTS,pickTaunt,TAUNT_PHASES} from './voiceBank';
import {ARRIVE_HOLD} from './guideCue';
describe('contextual original taunts',()=>{
 it('keeps all selection inside the current beat without immediate repeats',()=>{
  for(const phase of TAUNT_PHASES){let previous='';for(let i=0;i<60;i++){const cue=pickTaunt(phase,previous,()=>i/60);expect(cue.phase).toBe(phase);expect(cue.id).not.toBe(previous);previous=cue.id;}}
 });
 it('has enough time for the complete line before the next action',()=>{
  for(const line of TAUNTS){expect(line.duration).toBeGreaterThan(.5);if(line.phase==='knock')expect(line.duration+.16).toBeLessThan(2.55);if(line.phase==='arrive')expect(line.duration+.16).toBeLessThan(ARRIVE_HOLD-.25);if(line.phase==='escape')expect(line.duration+.16).toBeLessThan(1.48);}
 });
 it('uses only outcome-neutral challenges during suspense',()=>{
  const pool=TAUNTS.filter(t=>t.phase==='knock');
  expect(pool.length).toBeGreaterThanOrEqual(3);
  for(const line of pool)expect(line.text).not.toMatch(/not bad|not too shabby|done yet|caught|escape|won|win|good|got away/i);
 });
 it('never has the rivals cheer the player on',()=>{
  // Entrance lines announce Team Rocket; the dare at the throw is aimed at the player.
  for(const line of TAUNTS.filter(t=>t.phase==='arrive'))expect(line.text).toMatch(/Team Rocket|plan|get ready/i);
  for(const line of TAUNTS.filter(t=>t.phase==='throw'))expect(line.text).toMatch(/guts|better be ready|surrender/i);
  for(const phase of TAUNT_PHASES)expect(TAUNTS.filter(t=>t.phase===phase).length).toBeGreaterThanOrEqual(3);
 });
 it('reserves frustrated clips for after the reward',()=>{expect(TAUNTS.filter(t=>t.phase==='caught').length).toBeGreaterThanOrEqual(3);});
});
