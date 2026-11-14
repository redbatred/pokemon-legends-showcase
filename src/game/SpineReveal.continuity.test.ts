import {expect,it,vi} from 'vitest';
import {SpineReveal} from './SpineReveal';
it('takes over the current charge without restarting or seeking the visible body backwards',()=>{
 const times:number[]=[];const hero={attackTime:.4,chargeDuration:.65,attackDuration:.8,play:vi.fn(),setAttackTime:(t:number)=>times.push(t),capturePose:vi.fn(),powerEmitters:()=>[],toGlobal:(p:unknown)=>p};
 const reveal=Object.assign(Object.create(SpineReveal.prototype),{hero,power:{profile:{}},winAttackActive:false});
 for(const age of [0,.1,.42,.8,1.08,1.4,1.7])reveal.winOrigins(age);
 expect(hero.play).not.toHaveBeenCalled();expect(times[0]).toBeCloseTo(.4);expect(times[4]).toBeCloseTo(.65);
 expect(times.every((t,i)=>i===0||t>=times[i-1])).toBe(true);
});

it('restores the intact card behind the clearing curtain before revealing it',()=>{
 const intact={},punctured={},cardShell={alpha:1},face={texture:punctured};
 const reveal=Object.assign(Object.create(SpineReveal.prototype),{cardShell,face,intact,actors:{alpha:0},hero:{play:vi.fn()},winAttackActive:true});
 reveal.setWinOcclusion(1,.5);expect(cardShell.alpha).toBe(0);expect(face.texture).toBe(punctured);
 reveal.setWinOcclusion(1,.1);expect(face.texture).toBe(intact);expect(cardShell.alpha).toBeGreaterThan(0);expect(cardShell.alpha).toBeLessThan(1);
 reveal.setWinOcclusion(1,0);expect(cardShell.alpha).toBe(1);expect(reveal.actors.alpha).toBe(0);
});
