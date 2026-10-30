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

it('keeps the stadium layout through HUD updates while the pack travels',()=>{
 const stage={openingLayout:true,travelling:true,resize:vi.fn()};
 OpeningStage.prototype.setLayoutMode.call(stage as unknown as OpeningStage,false);
 expect(stage.openingLayout).toBe(true);expect(stage.resize).not.toHaveBeenCalled();
 stage.travelling=false;OpeningStage.prototype.setLayoutMode.call(stage as unknown as OpeningStage,false);
 expect(stage.openingLayout).toBe(false);expect(stage.resize).toHaveBeenCalledOnce();
});
it('holds late-loaded Pokémon presentation until a modal or hidden tab resumes',async()=>{
 vi.stubGlobal('document',{hidden:false});
 const stage={blocked:true,timeline:null} as any;let finished=false;
 const waiting=(OpeningStage.prototype as any).waitForPresentation.call(stage).then(()=>finished=true);
 await Promise.resolve();expect(finished).toBe(false);expect(stage.timeline.paused()).toBe(true);
 stage.blocked=false;stage.timeline.resume().progress(1);await waiting;expect(finished).toBe(true);stage.timeline.kill();vi.unstubAllGlobals();
});
