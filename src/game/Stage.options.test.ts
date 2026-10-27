import { expect,it,vi } from 'vitest';
import gsap from 'gsap';
import { OpeningStage } from './Stage';
vi.mock('./audio',()=>({stopRevealAudio:vi.fn()}));

it('restores the arena when reduced motion skips a pending suspense callback',()=>{
 const scene={setCinematic:vi.fn(),setCharge:vi.fn()},timeline=gsap.timeline({paused:true});
 timeline.call(()=>scene.setCinematic(true,false),[],.6).to({}, {duration:1.3},.6);
 const stage={options:{reduced:false,low:false},revealEffects:{clear:vi.fn()},scene,timeline,special:null,charging:true,app:{renderer:null}};
 OpeningStage.prototype.updateOptions.call(stage as unknown as OpeningStage,{reduced:true,low:false,onTear:()=>{},onNext:()=>{}});
 expect(scene.setCinematic).toHaveBeenLastCalledWith(false,true);
 expect(scene.setCharge).toHaveBeenLastCalledWith(null);
 expect(stage.charging).toBe(false);timeline.kill();
});
