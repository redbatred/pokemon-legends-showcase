import {beforeEach,afterEach,expect,it,vi} from 'vitest';
vi.mock('./Stage',()=>({OpeningStage:class{
 init=vi.fn(async()=>{});setPack=vi.fn(async()=>{});setSealed=vi.fn();waitForReveal=vi.fn();prepareReveal=vi.fn();skipReveal=vi.fn();
 tear=vi.fn(async()=>{});reveal=vi.fn(async()=>{});collectRemaining=vi.fn(async()=>{});showResult=vi.fn();reset=vi.fn();updateOptions=vi.fn();destroy=vi.fn();
}}));
vi.mock('./CanvasUI',()=>({CanvasUI:class{update=vi.fn();destroy=vi.fn();setFocus=vi.fn();}}));
vi.mock('./storage',()=>({loadSave:vi.fn(),transactSave:vi.fn(),resetSave:vi.fn()}));
vi.mock('./audio',()=>({setSound:vi.fn(),setBattleMusic:vi.fn(),playSound:vi.fn(),setAudioScenePaused:vi.fn(),destroyAudio:vi.fn(),preloadRevealAudio:vi.fn(async()=>{}),unlockAudio:vi.fn()}));
vi.mock('pixi.js',()=>({Assets:{load:vi.fn(async()=>{})}}));
import {PokemonGame} from './Game';
import {DEFAULT_PACK,newSave,type Save} from './model';
const games:PokemonGame[]=[];
beforeEach(()=>{
 vi.useFakeTimers();
 vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('localStorage',{getItem:()=>null,setItem:vi.fn()});
 vi.stubGlobal('document',{hidden:false,createElement:()=>({className:'',setAttribute:vi.fn(),remove:vi.fn()}),addEventListener:vi.fn(),removeEventListener:vi.fn(),fonts:{load:async()=>{}}});
 vi.stubGlobal('window',{setTimeout:globalThis.setTimeout});
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:true,json:async()=>url.endsWith('packs.json')?[DEFAULT_PACK]:url.endsWith('manifest.json')?{}:[{id:'qa',name:'Test',number:'1',rarity:'Common',image:'/assets/cards/test.webp'}]})));
});
afterEach(()=>{games.forEach(g=>g.destroy());games.length=0;vi.useRealTimers();vi.unstubAllGlobals();});
async function setup(balance=1000000){
 let save:Save={...newSave(),balance};
 const storage={loadSave:async()=>save,transactSave:vi.fn(async(update:(s:Save)=>Save)=>(save=update(save))),resetSave:async()=>(save=newSave())};
 const game=new PokemonGame({append:vi.fn()} as unknown as HTMLElement,storage);games.push(game);await game.init();
 return {game,storage,state:game as any,save:()=>save};
}
it('selection and manual wrapper opening never reveal the first card automatically',async()=>{
 const {game,state}=await setup();state.select(DEFAULT_PACK);await vi.advanceTimersByTimeAsync(1);
 expect(state.phase).toBe('browse');game.action('open');await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('sealed');
 game.action('tear');await vi.advanceTimersByTimeAsync(10000);expect(state.phase).toBe('awaiting');expect(state.stage.reveal).not.toHaveBeenCalled();
 game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('revealed');expect(state.stage.reveal).toHaveBeenCalledOnce();
});
it.each(['individual','all'] as const)('completes exactly five automatic packs in %s mode',async mode=>{
 const {game,state,save,storage}=await setup();state.configureAuto(5,mode);game.action('auto-start');
 // Repeated starts and manual input during auto do not buy extra packs.
 game.action('auto-start');game.action('open');game.action('next');
 await vi.advanceTimersByTimeAsync(120000);
 expect(save().history).toHaveLength(5);expect(state.autoRun.completed).toBe(5);expect(state.autoRun.running).toBe(false);
 expect(storage.transactSave).toHaveBeenCalledTimes(10);expect(state.phase).toBe('complete');
 expect(state.stage.reveal).toHaveBeenCalledTimes(mode==='individual'?55:0);expect(state.stage.collectRemaining).toHaveBeenCalledTimes(5);
});
it('does not use the 30-result history cap as the auto counter',async()=>{
 const {game,state,save,storage}=await setup();state.configureAuto(100,'all');game.action('turbo');game.action('auto-start');
 await vi.advanceTimersByTimeAsync(120000);expect(state.autoRun.completed).toBe(100);expect(save().history).toHaveLength(30);expect(storage.transactSave).toHaveBeenCalledTimes(200);
});
it('pauses before buying while a menu or hidden tab is active',async()=>{
 const {game,state,storage}=await setup();game.action('auto-start');game.action('settings');await vi.advanceTimersByTimeAsync(5000);expect(storage.transactSave).not.toHaveBeenCalled();
 game.action('close');(document as any).hidden=true;state.scheduleAuto();await vi.advanceTimersByTimeAsync(5000);expect(storage.transactSave).not.toHaveBeenCalled();
 (document as any).hidden=false;state.scheduleAuto();await vi.advanceTimersByTimeAsync(400);expect(storage.transactSave).toHaveBeenCalledOnce();game.action('auto-stop');
});
it('stops while a purchase is in flight, leaving that pack sealed for manual use',async()=>{
 const {game,state,storage}=await setup();const real=storage.transactSave.getMockImplementation()!;let release:()=>void=()=>{};
 storage.transactSave.mockImplementationOnce(async update=>{await new Promise<void>(resolve=>{release=resolve;});return real(update);});
 game.action('auto-start');await vi.advanceTimersByTimeAsync(400);expect(state.phase).toBe('reserving');game.action('auto-stop');release();await vi.advanceTimersByTimeAsync(10000);
 expect(state.phase).toBe('sealed');expect(state.stage.tear).not.toHaveBeenCalled();expect(storage.transactSave).toHaveBeenCalledOnce();
});
it('stops on insufficient credits without topping up or buying a second pack',async()=>{
 const {game,state,storage,save}=await setup(1000);state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(30000);
 expect(save().history).toHaveLength(1);expect(state.autoRun.running).toBe(false);expect(storage.transactSave).toHaveBeenCalledTimes(2);expect(state.toast).toBe('');
});
it('stops on storage failure without an automatic retry loop',async()=>{
 const {game,state,storage}=await setup();storage.transactSave.mockRejectedValueOnce(new Error('Storage unavailable'));game.action('auto-start');await vi.advanceTimersByTimeAsync(10000);
 expect(storage.transactSave).toHaveBeenCalledOnce();expect(state.autoRun.running).toBe(false);expect(state.error).toBe('Storage unavailable');
});
it('does not take over an opening purchased in a different tab',async()=>{
 const {game,state,storage}=await setup();const real=storage.transactSave.getMockImplementation()!;
 storage.transactSave.mockImplementationOnce(update=>real(s=>update({...s,active:{id:'other-tab',at:new Date().toISOString(),pack:DEFAULT_PACK,cards:[]}})));
 game.action('auto-start');await vi.advanceTimersByTimeAsync(10000);
 expect(state.autoRun.running).toBe(false);expect(state.stage.tear).not.toHaveBeenCalled();expect(state.error).toContain('another tab');
});

it('Next finishes the current reveal before a later click advances the index',async()=>{
 const {game,state}=await setup();game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 let complete!:()=>void;state.stage.reveal.mockImplementationOnce(()=>new Promise<void>(resolve=>{complete=resolve;}));
 state.stage.skipReveal.mockImplementation(()=>{complete();return true;});
 game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('revealing');expect(state.index).toBe(0);
 game.action('next');expect(state.stage.skipReveal).toHaveBeenCalledOnce();await vi.advanceTimersByTimeAsync(1);
 expect(state.phase).toBe('revealed');expect(state.index).toBe(0);
 game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.index).toBe(1);expect(state.stage.reveal).toHaveBeenCalledTimes(2);
});
it('warms the next special at pack reservation rather than waiting until the previous card',async()=>{
 const {state}=await setup(),common={id:'c',name:'Common',number:'1',rarity:'Common',image:'/assets/c.png',weight:20,value:25},rare={...common,id:'rare',name:'Pikachu V',rarity:'Holo Rare V',image:'/assets/rare.png'};
 state.pokemonArt={Pikachu:{dexId:25,image:'/assets/pokemon/pikachu.png'}};
 state.save.active={id:'test',at:'',pack:DEFAULT_PACK,cards:[common,common,common,rare,common,{...rare,id:'later',image:'/assets/later.png'}]};
 state.stage.prepareReveal.mockClear();state.preloadOpening();
 expect(state.stage.prepareReveal.mock.calls).toEqual([[common,null],[rare,'/assets/pokemon/pikachu.png']]);
});
