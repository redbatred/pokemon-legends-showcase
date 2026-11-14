import {expect,it,vi} from 'vitest';
import {CanvasScene} from './CanvasScene';
import {playCrowdReaction,stopCrowdReaction} from './audio';
import {ShowdownScene} from './showdown/ShowdownScene';
vi.mock('./audio',()=>({playSound:vi.fn(),playCrowdReaction:vi.fn(),stopCrowdReaction:vi.fn(),stopRevealAudio:vi.fn()}));
it('animates small reveals with matching audible applause and keeps the reaction until dismissal',()=>{
 const scene={reactionLevel:1,audienceLevel:1,celebrationAge:-1,chargeLevel:0,exposure:{amount:1},impactState:{amount:0},paused:true} as unknown as CanvasScene;
 CanvasScene.prototype.impact.call(scene,false,false);
 expect((scene as unknown as {celebrationAge:number}).celebrationAge).toBe(0);
 expect(playCrowdReaction).toHaveBeenLastCalledWith(1);
 CanvasScene.prototype.endCelebration.call(scene);
 expect((scene as unknown as {celebrationAge:number}).celebrationAge).toBe(-1);
 const tweens=scene as unknown as {exposureTween:{kill():void};impactTween:{kill():void}};tweens.exposureTween.kill();tweens.impactTween.kill();
});
it('replaying clears the old final-hit lighting and crowd without reloading or hiding the arena',()=>{
 const colorTween={kill:vi.fn()},exposureTween={kill:vi.fn()},impactTween={kill:vi.fn()},cinemaTween={kill:vi.fn()},travelTween={kill:vi.fn()};
 const background={},entrance={amount:1},arena={visible:true};
 const stadium=Object.assign(Object.create(CanvasScene.prototype),{active:true,background,entrance,arena,paused:true,reactionLevel:4,audienceLevel:3,celebrationAge:5,chargeLevel:.8,light:{r:255,g:223,b:162},exposure:{amount:1.2},impactState:{amount:.8},cinema:{amount:.6,travel:.4},colorTween,exposureTween,impactTween,cinemaTween,travelTween});
 const scene=Object.assign(Object.create(ShowdownScene.prototype),{stadium,lastTime:13,fired:new Set(['hit2']),playerMotion:{reset:vi.fn()},bossMotion:{reset:vi.fn()}}) as ShowdownScene;
 scene.reset('legendary');
 expect(stadium.active).toBe(true);expect(stadium.arena).toBe(arena);expect(arena.visible).toBe(true);expect(stadium.background).toBe(background);expect(stadium.entrance).toBe(entrance);expect(entrance.amount).toBe(1);
 expect(stadium.light).toEqual({r:140,g:221,b:255});expect(stadium.exposure.amount).toBe(1);expect(stadium.impactState.amount).toBe(0);expect(stadium.cinema).toEqual({amount:0,travel:0});expect(stadium.chargeLevel).toBe(-1);
 expect(stadium.celebrationAge).toBe(-1);expect(stadium.reactionLevel).toBe(0);expect(stadium.audienceLevel).toBe(0);expect(stopCrowdReaction).toHaveBeenCalled();
 for(const tween of [colorTween,exposureTween,impactTween,cinemaTween,travelTween])expect(tween.kill).toHaveBeenCalledOnce();
 stadium.impact(false,false);expect(playCrowdReaction).toHaveBeenLastCalledWith(0);expect(stadium.celebrationAge).toBe(-1);
 stadium.exposureTween.kill();stadium.impactTween.kill();
});
