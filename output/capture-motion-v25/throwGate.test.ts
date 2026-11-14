import {it,expect} from 'vitest';
import {ThrowGate,THROW_AT} from './throwGate';
it('waits indefinitely without advancing the outcome sequence, then resumes from the same frame',()=>{const g=new ThrowGate();expect(g.sample(THROW_AT-.1)).toBe(THROW_AT-.1);expect(g.sample(THROW_AT+2)).toBe(THROW_AT);expect(g.sample(THROW_AT+60)).toBe(THROW_AT);expect(g.waiting).toBe(true);expect(g.release(THROW_AT+60)).toBe(true);expect(g.sample(THROW_AT+60.1)).toBeCloseTo(THROW_AT+.1);expect(g.release(100)).toBe(false);});
it('resets for a replay',()=>{const g=new ThrowGate();g.sample(20);g.release(20);g.reset();expect(g.released).toBe(false);expect(g.sample(20)).toBe(THROW_AT);});
it('keeps the live creature phase continuous through waiting and releasing the throw',()=>{
 const g=new ThrowGate();
 g.sample(THROW_AT);expect(g.held).toBe(0);
 g.sample(THROW_AT+2);expect(g.held).toBeCloseTo(2);
 g.sample(THROW_AT+3);expect(g.held).toBeCloseTo(3);
 // Scene time + the accumulated hold is one continuous animation clock.
 const before=g.sample(THROW_AT+3.01)+g.held;
 g.release(THROW_AT+3.01);
 const after=g.sample(THROW_AT+3.02)+g.held;
 expect(after-before).toBeCloseTo(.01);
 g.reset();expect(g.held).toBe(0);
});
