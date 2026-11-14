import {expect,it,vi} from 'vitest';
import {Group,Scene} from 'three';
vi.mock('./preparationFrames',()=>({prepareOnFrame:async(fn:()=>unknown)=>fn()}));
import {WinCinemaStage} from './WinCinemaStage';
it('includes the transient court effect in shader preparation before the first visible attack',async()=>{
 const scene=new Scene(),effect=new Group();effect.visible=false;scene.add(effect);let compiledVisible=false,victoryReady=false;const warmAges:number[]=[];
 const stage=Object.assign(Object.create(WinCinemaStage.prototype),{scene,camera:{},hasVolumeAttack:true,resize:vi.fn(),elementalVolume:{prepare:vi.fn()},tier:'big',arena:{update:(age:number)=>{victoryReady=age>=8;}},atmosphere:{update:()=>effect.visible=true},renderer:{render:vi.fn(),compileAsync:async()=>{compiledVisible=effect.visible&&victoryReady;}},render:(age:number)=>{warmAges.push(age);}}) as WinCinemaStage;
 await stage.prepare(390,844);
 expect(compiledVisible).toBe(true);expect((stage as any).elementalVolume.prepare).toHaveBeenCalledOnce();expect((stage as any).renderer.render).toHaveBeenCalledOnce();expect(warmAges).toEqual([6.18,8,1.9]);expect(warmAges.at(-1)).toBeGreaterThan(1.72);expect(warmAges.at(-1)).toBeLessThan(2.4);
});
