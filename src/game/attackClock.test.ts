import {expect,it} from 'vitest';
import {AnimationMixer,AnimationClip,NumberKeyframeTrack,Object3D,LoopOnce} from 'three';
import {sampleAttack} from './attackClock';
it('advances crossfade weights and the source pose together after a stalled frame',()=>{
 const root=new Object3D(),mixer=new AnimationMixer(root);
 const idle=mixer.clipAction(new AnimationClip('idle',2,[new NumberKeyframeTrack('.position[x]',[0,2],[0,0])])).play();
 const attack=mixer.clipAction(new AnimationClip('attack',2,[new NumberKeyframeTrack('.position[x]',[0,2],[0,10])])).setLoop(LoopOnce,1).play();
 attack.timeScale=1.4;attack.crossFadeFrom(idle,.18,false);
 let clock=sampleAttack(mixer,attack,.1,0,.2,1.4);clock=sampleAttack(mixer,attack,.7,clock,.2,1.4);
 expect(attack.getEffectiveWeight()).toBeCloseTo(1);expect(attack.time).toBeCloseTo(1.18);expect(root.position.x).toBeCloseTo(5.9);
 sampleAttack(mixer,attack,.7,clock,.2,1.4);expect(attack.time).toBeCloseTo(1.18);
});
