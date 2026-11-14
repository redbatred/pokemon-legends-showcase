import {it,expect} from 'vitest';
import {cardMotion} from './cardMotion';
import {WIN_STAGES} from './winTimeline';
it('turns over once and settles independently of every amount milestone',()=>{for(const stage of WIN_STAGES){const before=cardMotion(stage.end-.001),after=cardMotion(stage.end+.001);expect(Math.abs(after.scale-before.scale)).toBeLessThan(.0001);expect(Math.abs(after.rotation-before.rotation)).toBeLessThan(.0001);expect(after.face).toBe(true);}expect(cardMotion(-.001).face).toBe(false);expect(cardMotion(.001).face).toBe(true);expect(cardMotion(6).scale).toBeCloseTo(1,8);});
it('can seek without history or replaying the reveal impulse',()=>{const end=cardMotion(7);cardMotion(-.5);cardMotion(.2);expect(cardMotion(7)).toEqual(end);});
