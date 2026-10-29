import {expect,it} from 'vitest';
import {emergencePose,emergenceTiming,ballAperture} from './emergenceMotion';
it('forms at the aperture and lands with a continuous foot anchor rather than scaling through the shell',()=>{
 const source={x:-42,y:161},target={x:0,y:65};
 let previous=emergencePose(0,source,target,true);
 expect(previous.x).toBe(source.x);expect(previous.y+154*previous.scale).toBeCloseTo(source.y);expect(previous.alpha).toBe(0);expect(previous.shell).toBe(1);
 for(let i=1;i<=100;i++){const p=emergencePose(i/100,source,target,true);expect(Math.abs(p.y-previous.y)).toBeLessThan(5);expect(p.scale).toBeGreaterThanOrEqual(previous.scale);expect(p.y+154*p.scale).toBeLessThanOrEqual(219.001);previous=p;}
 expect(previous).toMatchObject({x:0,y:65,scale:1,alpha:1,white:0,shell:0});
});
it('starts the award while the Pokémon forms and before its attack sequence',()=>{
 const t=emergenceTiming(2.4,1.1,.8,1.2,.4);
 expect(t.form).toBeGreaterThan(2.55);expect(t.win-t.form).toBeLessThan(.5);expect(t.win).toBeLessThan(t.charge);expect(t.attack).toBeGreaterThan(t.charge);expect(t.recoverEnd).toBeGreaterThan(t.attackEnd);
});

it('moves monotonically from the real aperture to the centered body',()=>{let last=-40;for(let i=0;i<=100;i++){const pose=emergencePose(i/100,{x:-40,y:160},{x:0,y:65},true);expect(pose.x).toBeGreaterThanOrEqual(last);expect(pose.x).toBeLessThanOrEqual(0);last=pose.x;}expect(ballAperture({x:30,y:200,scale:.72,rotation:.2})).toEqual({x:30,y:200});expect(ballAperture({x:30,y:200,scale:.5,rotation:Math.PI/2},{x:10,y:0}).y).toBeCloseTo(205);});
