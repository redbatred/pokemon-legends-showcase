import {expect,it} from 'vitest';
import {Container} from 'pixi.js';
import {SpineReveal} from './SpineReveal';
it('drives the visible source action into release before reading its emitter, and returns it to idle',()=>{
 const actor=new Container();let poseTime=-1,starts=0,captured=-1,idle=0;
 Object.assign(actor,{attackTime:.25,chargeDuration:.6,attackDuration:1,recoveryDuration:.4,play:(cue:string)=>{if(cue==='charge')starts++;if(cue==='idle')idle++;},setAttackTime:(t:number)=>{poseTime=t;},capturePose:()=>{captured=poseTime;},powerEmitters:()=>[{x:captured,y:0}]});
 const actors=new Container(),reveal=Object.assign(Object.create(SpineReveal.prototype),{hero:actor,actors,cardShell:new Container(),face:{},intact:{},power:{profile:{}}}) as SpineReveal;
 reveal.winOrigins(.42);reveal.winOrigins(.8);const origins=reveal.winOrigins(1.08);
 expect(starts).toBe(0);expect(poseTime).toBeCloseTo(.6);expect(origins[0].x).toBeCloseTo(.6);
 reveal.winOrigins(1.4);expect(poseTime).toBeGreaterThan(.6);
 reveal.setWinOcclusion(1);reveal.setWinOcclusion(0);expect(idle).toBe(1);
 actor.destroy();actors.destroy();
});
