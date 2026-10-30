import { expect,it,vi } from 'vitest';
import gsap from 'gsap';
import { OpeningStage } from './Stage';
vi.mock('./audio',()=>({stopRevealAudio:vi.fn()}));

it('accelerates automatic animations without skipping special reveals and restores manual speed',()=>{
 const stage=Object.create(OpeningStage.prototype),timeline={timeScale:vi.fn(),progress:vi.fn()},special={finish:vi.fn(),update:vi.fn()};
 Object.assign(stage,{automatic:false,options:{turbo:false,low:false,reduced:false},timeline,special});
 stage.setAutomatic(true);expect(timeline.timeScale).toHaveBeenLastCalledWith(1.65);expect(stage.options.turbo).toBe(false);
 stage.updateOptions({...stage.options,turbo:true});expect(timeline.timeScale).toHaveBeenLastCalledWith(4);
 stage.updateOptions({...stage.options,turbo:false});expect(timeline.timeScale).toHaveBeenLastCalledWith(1.65);
 stage.setAutomatic(false);expect(timeline.timeScale).toHaveBeenLastCalledWith(1);
 expect(timeline.progress).not.toHaveBeenCalled();expect(special.finish).not.toHaveBeenCalled();expect(special.update).not.toHaveBeenCalled();
});

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
