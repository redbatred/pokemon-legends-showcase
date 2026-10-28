import {expect,it,vi} from 'vitest';
import {CanvasScene} from './CanvasScene';
import {playCrowdReaction} from './audio';
vi.mock('./audio',()=>({playSound:vi.fn(),playCrowdReaction:vi.fn(),stopCrowdReaction:vi.fn()}));
it('animates small reveals with matching audible applause and keeps the reaction until dismissal',()=>{
 const scene={reactionLevel:1,audienceLevel:1,celebrationAge:-1,chargeLevel:0,exposure:{amount:1},impactState:{amount:0},paused:true} as unknown as CanvasScene;
 CanvasScene.prototype.impact.call(scene,false,false);
 expect((scene as unknown as {celebrationAge:number}).celebrationAge).toBe(0);
 expect(playCrowdReaction).toHaveBeenLastCalledWith(1);
 CanvasScene.prototype.endCelebration.call(scene);
 expect((scene as unknown as {celebrationAge:number}).celebrationAge).toBe(-1);
 const tweens=scene as unknown as {exposureTween:{kill():void};impactTween:{kill():void}};tweens.exposureTween.kill();tweens.impactTween.kill();
});
