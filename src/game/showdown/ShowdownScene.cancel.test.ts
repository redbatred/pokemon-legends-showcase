import {afterEach,expect,it,vi} from 'vitest';
import {Assets} from 'pixi.js';
vi.mock('../audio',()=>({stopRevealAudio:vi.fn(),playSound:vi.fn(),playPokemonCry:vi.fn(),playPokemonMove:vi.fn(),preloadRevealAudio:vi.fn(),preloadVaultAudio:vi.fn()}));
import {ShowdownScene} from './ShowdownScene';
afterEach(()=>vi.restoreAllMocks());
it('does not reactivate the stadium after cancelling while its assets are still loading',async()=>{
 let ready!:()=>void;const active=vi.fn();
 const scene=Object.assign(Object.create(ShowdownScene.prototype),{dead:false,closing:false,fired:new Set(),stadium:{init:()=>new Promise<void>(resolve=>{ready=resolve;}),setActive:active,setBoard:vi.fn()},loadActor:async()=>{},resize:vi.fn()}) as ShowdownScene;
 vi.spyOn(Assets,'load').mockRejectedValue(new Error('art unavailable'));
 Object.defineProperty(scene,'effects',{value:[]});
 const loading=scene.load();const failed=expect(loading).rejects.toThrow('Required vault');
 scene.cancelPresentation();ready();await failed;expect(active).not.toHaveBeenCalled();
});
it('suppresses future sound and impact cues during the outgoing transition',()=>{
 const scene=Object.assign(Object.create(ShowdownScene.prototype),{dead:false,closing:false,fired:new Set()}) as ShowdownScene;
 scene.cancelPresentation();const sound=vi.fn();
 (scene as unknown as {cue:(key:string,at:number,time:number,silent:boolean,run:()=>void)=>void}).cue('late-reveal',1,1,false,sound);
 expect(sound).not.toHaveBeenCalled();
});
// The guard now uses native Spine attachments. Its local collision plane and
// finite bounds are covered by ShowdownCeremonyFx.test.ts.

import {playSound} from '../audio';
import {showdownLayout} from './showdownModel';
function prizeFixture(){
 const node=()=>({visible:true,alpha:1,position:{set:vi.fn()},scale:{set:vi.fn()}}),uniforms={uTime:88,uTilt:.9,uTiltY:.4};
 const scene=Object.assign(Object.create(ShowdownScene.prototype),{dead:false,closing:false,id:'legendary',baseBet:1000,layout:showdownLayout(390,844),fired:new Set(),foil:{resources:{foil:{uniforms}}},card:null,coronation:{sample:vi.fn(),rig:node()},containment:{sampleContainment:vi.fn(),rig:node()},prizeRoot:node(),payout:node(),payoutCaption:node(),vaultCaption:node(),trails:{circle:()=>({fill:vi.fn()})},stadium:{setCardColor:vi.fn()}});
 return {scene,uniforms};
}
it('silent reward seeks never start delayed flip, reward, or win sounds',()=>{
 vi.mocked(playSound).mockClear();const {scene}=prizeFixture();
 for(const time of [10.58,10.65,12.1])scene.updatePrize(time,0,false,180,true);
 expect(playSound).not.toHaveBeenCalled();
});
it('restores held-card foil after a revealed frame, including reduced motion',()=>{
 const {scene,uniforms}=prizeFixture();scene.updatePrize(11.4,0,false,180,true);expect(uniforms.uTime).toBe(11.4);
 scene.updatePrize(-1,0,false,0,true);expect(uniforms).toEqual({uTime:0,uTilt:0,uTiltY:0});
 scene.updatePrize(11.4,0,true,180,true);expect(uniforms).toEqual({uTime:0,uTilt:0,uTiltY:0});
});
