import {expect,it} from 'vitest';
import {attackTransition,finalWinImpact,WIN_ATTACK_RELEASE} from './winCinemaImpact';
import {WIN_CINEMA_FINISH,WIN_CINEMA_IMPACT} from './winCinemaMotion';
it('keeps the arena concealed until the attack reaches the lens',()=>{expect(attackTransition(WIN_ATTACK_RELEASE)).toMatchObject({travel:0,arena:0,visible:true});expect(attackTransition(1.5).arena).toBe(0);expect(attackTransition(WIN_CINEMA_IMPACT+.3).arena).toBe(1);expect(attackTransition(2.5).visible).toBe(false);});
it('hits only at the exact final total and decays without repeated flashes',()=>{expect(finalWinImpact(WIN_CINEMA_FINISH-.001).energy).toBe(0);expect(finalWinImpact(WIN_CINEMA_FINISH).hold).toBe(.06);expect(finalWinImpact(WIN_CINEMA_FINISH+.1).hold).toBe(1);expect(finalWinImpact(WIN_CINEMA_FINISH+.1).flash).toBe(0);expect(finalWinImpact(WIN_CINEMA_FINISH+2).energy).toBeLessThan(.001);expect(finalWinImpact(WIN_CINEMA_FINISH,true)).toMatchObject({energy:0,flash:0,zoom:0,hold:1});});
