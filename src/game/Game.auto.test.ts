import {beforeEach,afterEach,expect,it,vi} from 'vitest';
const boot=vi.hoisted(()=>({assets:vi.fn(async()=>{}),frame:vi.fn(async()=>{})}));
vi.mock('./Stage',()=>({OpeningStage:class{
 prepareFirstFrame=boot.frame;setAutomatic=vi.fn();setShowdownOpening=vi.fn();
 init=vi.fn(async()=>{});setPack=vi.fn(async()=>{});setSealed=vi.fn();waitForReveal=vi.fn();prepareReveal=vi.fn();skipReveal=vi.fn();
 tear=vi.fn(async()=>{});reveal=vi.fn(async()=>{});collectRemaining=vi.fn(async()=>{});showResult=vi.fn();reset=vi.fn();updateOptions=vi.fn();destroy=vi.fn();
}}));
vi.mock('./CanvasUI',()=>({CanvasUI:class{waitForWinRecovery=vi.fn(async()=>{});prepareAssets=boot.assets;beginAutoPackTransition=vi.fn();update=vi.fn();destroy=vi.fn();setFocus=vi.fn();}}));
vi.mock('./storage',()=>({loadSave:vi.fn(),transactSave:vi.fn(),resetSave:vi.fn()}));
vi.mock('./audio',()=>({setSound:vi.fn(),setBattleMusic:vi.fn(),playSound:vi.fn(),setAudioScenePaused:vi.fn(),destroyAudio:vi.fn(),preloadRevealAudio:vi.fn(async()=>{}),unlockAudio:vi.fn()}));
vi.mock('pixi.js',()=>({Assets:{load:vi.fn(async()=>{})}}));
import {PokemonGame} from './Game';
import {DEFAULT_PACK,newSave,type Save} from './model';
const games:PokemonGame[]=[];
beforeEach(()=>{
 boot.assets.mockReset().mockResolvedValue();boot.frame.mockReset().mockResolvedValue();
 vi.useFakeTimers();vi.spyOn(Math,'random').mockReturnValue(.99);
 vi.stubGlobal('matchMedia',()=>({matches:false}));vi.stubGlobal('localStorage',{getItem:()=>null,setItem:vi.fn()});
 vi.stubGlobal('document',{hidden:false,createElement:()=>({className:'',setAttribute:vi.fn(),remove:vi.fn()}),addEventListener:vi.fn(),removeEventListener:vi.fn(),fonts:{load:async()=>{}}});
 vi.stubGlobal('window',{setTimeout:globalThis.setTimeout});
 vi.stubGlobal('fetch',vi.fn(async(url:string)=>({ok:true,json:async()=>url.endsWith('packs.json')?[DEFAULT_PACK]:url.endsWith('manifest.json')?{}:[{id:'qa',name:'Test',number:'1',rarity:'Common',image:'/assets/cards/test.webp'}]})));
});
it('keeps startup pending until pack artwork and the first rendered scene are ready',async()=>{
 let assetsReady!:()=>void,frameReady!:()=>void,finished=false;
 boot.assets.mockImplementation(()=>new Promise<void>(resolve=>assetsReady=resolve));
 boot.frame.mockImplementation(()=>new Promise<void>(resolve=>frameReady=resolve));
 const game=new PokemonGame({append:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()} as unknown as HTMLElement,{loadSave:async()=>newSave(),transactSave:vi.fn(),resetSave:vi.fn()});games.push(game);
 const loading=game.init().then(()=>finished=true);await vi.advanceTimersByTimeAsync(1);
 expect(finished).toBe(false);assetsReady();await vi.advanceTimersByTimeAsync(1);expect(finished).toBe(false);
 frameReady();await loading;expect(finished).toBe(true);
});
afterEach(()=>{games.forEach(g=>g.destroy());games.length=0;vi.useRealTimers();vi.restoreAllMocks();vi.unstubAllGlobals();});
async function setup(balance=1000000){
 let save:Save={...newSave(),balance};
 const storage={loadSave:async()=>save,transactSave:vi.fn(async(update:(s:Save)=>Save)=>(save=update(save))),resetSave:async()=>(save=newSave())};
 const game=new PokemonGame({append:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()} as unknown as HTMLElement,storage);games.push(game);await game.init();
 return {game,storage,state:game as any,save:()=>save};
}
it('opens the Showdown buy preview without reserving a pack',async()=>{
 const {game,state,storage}=await setup();const open=vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 game.action('showdown' as any);expect(open).toHaveBeenCalledWith('buy');expect(storage.transactSave).not.toHaveBeenCalled();
});
it('qualifies from three stored symbols, never from the number of completed packs',async()=>{
 const {game,state,save}=await setup();const open=vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 for(let n=0;n<4;n++){
  if(n===3)state.showdownArmed=true;
  game.action('open');await vi.advanceTimersByTimeAsync(1);
  expect(save().active?.showdownSymbols?.length).toBe(n===3?3:0);
  game.action('tear');await vi.advanceTimersByTimeAsync(1);game.action('all');await vi.advanceTimersByTimeAsync(1);
  expect(state.phase).toBe('complete');expect(open).toHaveBeenCalledTimes(n===3?1:0);
  if(n<3)game.action('continue');
 }
 expect(open).toHaveBeenCalledWith('trigger');
});
it('defers a discovered Showdown until the covering panel closes',async()=>{
 const {game,state}=await setup();const open=vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 state.showdownArmed=true;
 game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 game.action('all');game.action('settings');await vi.advanceTimersByTimeAsync(1);
 expect(state.phase).toBe('complete');expect(open).not.toHaveBeenCalled();expect(state.showdownPending).toBe(true);expect(state.showdownArmed).toBe(false);
 game.action('close');expect(open).toHaveBeenCalledWith('trigger');
});
it('holds underlying game actions while the Showdown is loading or visible',async()=>{
 const {game,state,storage}=await setup();state.showdownLoading=true;game.action('open');game.action('settings');
 expect(storage.transactSave).not.toHaveBeenCalled();expect(state.panel).toBeNull();
 state.showdownLoading=false;state.showdown={destroy:vi.fn()};game.action('open');expect(storage.transactSave).not.toHaveBeenCalled();
});
it('ignores game actions while the boot cover keeps its host inert, including the exit fade',async()=>{
 const {game,state,storage}=await setup();state.host.inert=true;game.action('open');game.action('settings');await vi.advanceTimersByTimeAsync(10);
 expect(storage.transactSave).not.toHaveBeenCalled();expect(state.phase).toBe('browse');expect(state.panel).toBeNull();
 state.host.inert=false;game.action('open');await vi.advanceTimersByTimeAsync(1);expect(storage.transactSave).toHaveBeenCalledOnce();expect(state.phase).toBe('sealed');
});
it('selection and manual wrapper opening never reveal the first card automatically',async()=>{
 const {game,state}=await setup();state.select(DEFAULT_PACK);await vi.advanceTimersByTimeAsync(1);
 expect(state.phase).toBe('browse');game.action('open');await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('sealed');
 game.action('tear');await vi.advanceTimersByTimeAsync(10000);expect(state.phase).toBe('awaiting');expect(state.stage.reveal).not.toHaveBeenCalled();
 game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('revealed');expect(state.stage.reveal).toHaveBeenCalledOnce();
});
it.each([0,3])('uses the shared Open All animation after %i manual reveals and waits to settle',async revealed=>{
 const {game,state,storage}=await setup();game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 for(let i=0;i<revealed;i++){game.action('next');await vi.advanceTimersByTimeAsync(1);}
 let finish!:()=>void;state.stage.collectRemaining.mockImplementationOnce(()=>new Promise<void>(resolve=>finish=resolve));
 game.action('all');await vi.advanceTimersByTimeAsync(1);
 expect(state.phase).toBe('collecting');expect(state.autoRun).toBeNull();expect(storage.transactSave).toHaveBeenCalledOnce();
 expect(state.stage.collectRemaining.mock.lastCall.slice(1)).toEqual([Math.max(0,revealed-1),true,DEFAULT_PACK.price]);
 expect(state.view.update.mock.lastCall[0].groupRevealCount).toBe(11-revealed);
 finish();await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('complete');expect(storage.transactSave).toHaveBeenCalledTimes(2);
});
it('collects the last individually revealed card without starting another group reveal',async()=>{
 const {game,state}=await setup();game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 for(let i=0;i<12;i++){game.action('next');await vi.advanceTimersByTimeAsync(1);}
 expect(state.stage.collectRemaining.mock.lastCall[2]).toBe(false);expect(state.phase).toBe('complete');
});
it.each(['individual','all'] as const)('completes exactly five automatic packs in %s mode',async mode=>{
 const {game,state,save,storage}=await setup();state.configureAuto(5,mode);game.action('auto-start');
 // Repeated starts and manual input during auto do not buy extra packs.
 game.action('auto-start');game.action('open');game.action('next');
 await vi.advanceTimersByTimeAsync(120000);
 expect(save().history).toHaveLength(5);expect(state.autoRun.completed).toBe(5);expect(state.autoRun.running).toBe(false);
 expect(storage.transactSave).toHaveBeenCalledTimes(10);expect(state.phase).toBe('complete');
 expect(state.view.beginAutoPackTransition).toHaveBeenCalledTimes(4);expect(state.stage.reveal).toHaveBeenCalledTimes(mode==='individual'?55:0);expect(state.stage.collectRemaining).toHaveBeenCalledTimes(5);
});
it('waits for the full automatic reveal, then holds the visible price before the next card',async()=>{
 const {game,state}=await setup();let revealDone!:()=>void;
 state.stage.reveal.mockImplementationOnce(()=>new Promise<void>(resolve=>revealDone=resolve));
 state.configureAuto(1,'individual');game.action('auto-start');await vi.advanceTimersByTimeAsync(10000);
 expect(state.phase).toBe('revealing');expect(state.stage.reveal).toHaveBeenCalledOnce();expect(state.stage.skipReveal).not.toHaveBeenCalled();expect(state.stage.collectRemaining).not.toHaveBeenCalled();
 revealDone();await vi.advanceTimersByTimeAsync(0);expect(state.phase).toBe('revealed');
 await vi.advanceTimersByTimeAsync(779);expect(state.stage.reveal).toHaveBeenCalledOnce();
 await vi.advanceTimersByTimeAsync(1);expect(state.stage.reveal).toHaveBeenCalledTimes(2);
});
it('waits for every card in an automatic group reveal before showing the pack total',async()=>{
 const {game,state,storage}=await setup();let finish!:()=>void;
 state.stage.collectRemaining.mockImplementationOnce(()=>new Promise<void>(resolve=>finish=resolve));
 state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(10000);
 expect(state.phase).toBe('collecting');expect(state.autoRun.completed).toBe(0);expect(state.stage.reveal).not.toHaveBeenCalled();expect(storage.transactSave).toHaveBeenCalledOnce();
 expect(state.stage.collectRemaining.mock.lastCall[2]).toBe(true);
 finish();await vi.advanceTimersByTimeAsync(0);expect(state.phase).toBe('complete');expect(state.autoInterlude).toBe(true);expect(state.autoRun.completed).toBe(1);
});
it('keeps Turbo Open All on the instant collection route',async()=>{
 const {game,state}=await setup();game.action('turbo');state.configureAuto(1,'all');game.action('auto-start');
 await vi.advanceTimersByTimeAsync(540);expect(state.phase).toBe('complete');expect(state.autoRun.completed).toBe(1);
 expect(state.stage.reveal).not.toHaveBeenCalled();expect(state.stage.collectRemaining).toHaveBeenCalledOnce();
});
it('does not use the 30-result history cap as the auto counter',async()=>{
 const {game,state,save,storage}=await setup();state.configureAuto(100,'all');game.action('turbo');game.action('auto-start');
 await vi.advanceTimersByTimeAsync(180000);expect(state.autoRun.completed).toBe(100);expect(save().history).toHaveLength(30);expect(storage.transactSave).toHaveBeenCalledTimes(200);
 expect(state.autoRun.results).toHaveLength(100);expect(state.autoRun.totalWon).toBe(save().totalWon);
 expect(state.autoRun.results[0].id).not.toBe(save().history[0].id);expect(state.autoInterlude).toBe(false);
});
it('pauses before buying while a menu or hidden tab is active',async()=>{
 const {game,state,storage}=await setup();game.action('auto-start');game.action('settings');await vi.advanceTimersByTimeAsync(5000);expect(storage.transactSave).not.toHaveBeenCalled();
 game.action('close');(document as any).hidden=true;state.scheduleAuto();await vi.advanceTimersByTimeAsync(5000);expect(storage.transactSave).not.toHaveBeenCalled();
 (document as any).hidden=false;state.scheduleAuto();await vi.advanceTimersByTimeAsync(400);expect(storage.transactSave).toHaveBeenCalledOnce();game.action('auto-stop');
});
it('stops future purchases while finishing and retaining the pack already in flight',async()=>{
 const {game,state,storage}=await setup();const real=storage.transactSave.getMockImplementation()!;let release:()=>void=()=>{};
 storage.transactSave.mockImplementationOnce(async update=>{await new Promise<void>(resolve=>{release=resolve;});return real(update);});
 state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(400);expect(state.phase).toBe('reserving');game.action('auto-stop');release();await vi.advanceTimersByTimeAsync(10000);
 expect(state.phase).toBe('complete');expect(state.stage.tear).toHaveBeenCalledOnce();expect(storage.transactSave).toHaveBeenCalledTimes(2);
 expect(state.autoRun.results).toHaveLength(1);expect(state.autoRun.running).toBe(false);expect(state.autoFinishing).toBe(false);
});
it('stops on insufficient credits without topping up or buying a second pack',async()=>{
 const {game,state,storage,save}=await setup(1000);state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(30000);
 expect(save().history).toHaveLength(1);expect(state.autoRun.running).toBe(false);expect(storage.transactSave).toHaveBeenCalledTimes(2);expect(state.toast).toBe('');
 expect(state.phase).toBe('complete');expect(state.view.update.mock.lastCall[0].result).toBe(state.autoRun.results[0]);
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
 expect(state.stage.prepareReveal.mock.calls).toEqual([[common,null,null],[rare,'/assets/pokemon/pikachu.png','special']]);
});

it('shows the normal result immediately for a one-pack automatic opening',async()=>{
 const {game,state,storage}=await setup();state.configureAuto(1,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(1360);
 expect(state.phase).toBe('complete');expect(state.autoRun.running).toBe(false);expect(state.autoInterlude).toBe(false);
 const view=state.view.update.mock.lastCall[0];expect(view.autoRun.results).toHaveLength(1);expect(view.result).toBe(view.autoRun.results[0]);
 expect(view.autoRun.totalWon).toBe(view.result.total);await vi.advanceTimersByTimeAsync(10000);expect(storage.transactSave).toHaveBeenCalledTimes(2);
});
it.each([{turbo:false,reduced:false,first:1360,hold:1800},{turbo:true,reduced:false,first:540,hold:1200},{turbo:false,reduced:true,first:1360,hold:400}])('holds every pack total, including the final one, with $hold ms interludes',async({turbo,reduced,first,hold})=>{
 const {game,state,storage}=await setup();state.reduced=reduced;if(turbo)game.action('turbo');state.configureAuto(5,'all');game.action('auto-start');
 await vi.advanceTimersByTimeAsync(first);expect(state.phase).toBe('complete');expect(state.autoInterlude).toBe(true);expect(storage.transactSave).toHaveBeenCalledTimes(2);
 await vi.advanceTimersByTimeAsync(hold-1);expect(state.phase).toBe('complete');expect(storage.transactSave).toHaveBeenCalledTimes(2);
 await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('browse');expect(state.autoInterlude).toBe(false);
 await vi.advanceTimersByTimeAsync(first+3*(hold+first));expect(state.autoRun.completed).toBe(5);expect(state.autoRun.running).toBe(false);
 expect(state.phase).toBe('complete');expect(state.autoInterlude).toBe(true);
 await vi.advanceTimersByTimeAsync(hold-1);expect(state.autoInterlude).toBe(true);
 await vi.advanceTimersByTimeAsync(1);expect(state.autoInterlude).toBe(false);expect(state.phase).toBe('complete');
 expect(state.view.update.mock.lastCall[0].autoRun.results).toHaveLength(5);expect(storage.transactSave).toHaveBeenCalledTimes(10);
});
it.each(['hidden','panel','inspect'] as const)('pauses an interlude while %s and resumes without buying early',async pause=>{
 const {game,state,storage}=await setup();state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(1360);
 if(pause==='hidden')(document as any).hidden=true;else if(pause==='panel')game.action('settings');else state.inspected=state.autoRun.results[0].cards[0];
 state.scheduleAuto();await vi.advanceTimersByTimeAsync(10000);expect(state.autoInterlude).toBe(true);expect(storage.transactSave).toHaveBeenCalledTimes(2);
 if(pause==='hidden')(document as any).hidden=false;else game.action('close');
 state.scheduleAuto();await vi.advanceTimersByTimeAsync(1799);expect(state.phase).toBe('complete');
 await vi.advanceTimersByTimeAsync(381);expect(storage.transactSave).toHaveBeenCalledTimes(3);expect(state.phase).toBe('sealed');
});
it('stopping between packs preserves the completed pack view and cancels its scheduled purchase',async()=>{
 const {game,state,storage}=await setup();state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(3160);
 expect(state.phase).toBe('browse');game.action('auto-stop');await vi.advanceTimersByTimeAsync(10000);
 expect(storage.transactSave).toHaveBeenCalledTimes(2);expect(state.view.update.mock.lastCall[0].phase).toBe('complete');expect(state.autoRun.results).toHaveLength(1);
 game.action('continue');expect(state.autoRun).toBeNull();expect(state.view.update.mock.lastCall[0].phase).toBe('browse');
});
it('stopping during a total celebration finishes that celebration without another purchase',async()=>{
 const {game,state,storage}=await setup();state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(1360);
 game.action('auto-stop');expect(state.autoInterlude).toBe(true);await vi.advanceTimersByTimeAsync(10000);
 expect(state.autoInterlude).toBe(false);expect(state.phase).toBe('complete');expect(storage.transactSave).toHaveBeenCalledTimes(2);
});
it('keeps completed packs reviewable if the next purchase fails',async()=>{
 const {game,state,storage}=await setup();state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(1360);
 storage.transactSave.mockRejectedValueOnce(new Error('Storage unavailable'));await vi.advanceTimersByTimeAsync(10000);
 expect(state.autoRun.running).toBe(false);expect(state.autoRun.results).toHaveLength(1);expect(state.view.update.mock.lastCall[0].phase).toBe('complete');
 expect(state.view.update.mock.lastCall[0].result).toBe(state.autoRun.results[0]);expect(storage.transactSave).toHaveBeenCalledTimes(3);
});
it.each(['continue','close','open'] as const)('clears completed auto results on %s and never attaches later manual packs',async action=>{
 const {game,state}=await setup();state.configureAuto(1,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(1360);
 const session=state.autoRun;game.action(action);expect(state.autoRun).toBeNull();expect(state.autoInterlude).toBe(false);
 if(action==='open'){await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);game.action('all');await vi.advanceTimersByTimeAsync(1);expect(state.phase).toBe('complete');}
 expect(session.results).toHaveLength(1);
});
it('preserves the final session through its interlude while still allowing menus to close',async()=>{
 const {game,state}=await setup();state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(14000);
 const session=state.autoRun;expect(session.running).toBe(false);expect(session.results).toHaveLength(5);expect(state.autoInterlude).toBe(true);
 game.action('continue');game.action('close');expect(state.autoRun).toBe(session);expect(state.autoInterlude).toBe(true);expect(state.phase).toBe('complete');
 game.action('settings');expect(state.panel).toBe('settings');game.action('close');expect(state.panel).toBeNull();expect(state.autoRun).toBe(session);
 await vi.advanceTimersByTimeAsync(1800);expect(state.autoInterlude).toBe(false);expect(state.autoRun).toBe(session);
 game.action('continue');expect(state.autoRun).toBeNull();expect(state.phase).toBe('browse');
});
it('reset discards a covered qualifying pack and its armed fixture',async()=>{
 const {game,state}=await setup();const open=vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 state.showdownArmed=true;
 game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 game.action('all');game.action('settings');await vi.advanceTimersByTimeAsync(1);
 expect(state.showdownPending).toBe(true);state.showdownArmed=true;
 game.action('reset');await vi.advanceTimersByTimeAsync(1);game.action('settings');game.action('close');
 expect(state.showdownPending).toBe(false);expect(state.showdownArmed).toBe(false);expect(open).not.toHaveBeenCalled();
});
it('stops automatic purchases at a qualifying pack and opens its bonus once',async()=>{
 const {game,state,storage,save}=await setup();const open=vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 state.showdownArmed=true;state.configureAuto(5,'all');game.action('auto-start');await vi.advanceTimersByTimeAsync(30000);
 expect(save().history).toHaveLength(1);expect(state.autoRun.running).toBe(false);expect(state.autoRun.completed).toBe(1);
 expect(storage.transactSave).toHaveBeenCalledTimes(2);expect(open).toHaveBeenCalledExactlyOnceWith('trigger');
});
it('holds the pack while the third bonus ball is landing, however fast Next is pressed',async()=>{
 const {game,state,save}=await setup();const open=vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 state.showdownArmed=true;game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 const last=Math.max(...save().active!.showdownSymbols!);
 // The encounter page is loaded for a qualifying pack; the mocked document cannot build it, so stand one in.
 state.bonusFrame={style:{},remove(){}};
 for(let i=0;i<=last;i++){game.action('next');await vi.advanceTimersByTimeAsync(1);}
 expect(state.phase).toBe('revealed');expect(state.index).toBe(last);
 for(let i=0;i<12;i++){game.action('next');game.action('all');await vi.advanceTimersByTimeAsync(40);}
 expect(state.index).toBe(last);expect(state.phase).toBe('revealed');
 // The ball lands: the encounter opens over this card.
 state.bonusReady();expect(open).toHaveBeenCalledWith('trigger');
 // Once it has played, the same card can be advanced, after a short quiet beat.
 state.bonusPlayed=save().active!.id;state.bonusQuiet=performance.now()+450;game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.index).toBe(last);
 await vi.advanceTimersByTimeAsync(500);game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.index).toBe(last+1);
});
it('never holds the pack for good if the third ball does not land',async()=>{
 const {game,state,save}=await setup();vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 state.showdownArmed=true;game.action('open');await vi.advanceTimersByTimeAsync(1);game.action('tear');await vi.advanceTimersByTimeAsync(1);
 const last=Math.max(...save().active!.showdownSymbols!);state.bonusFrame={style:{},remove(){}};
 for(let i=0;i<=last;i++){game.action('next');await vi.advanceTimersByTimeAsync(1);}
 game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.index).toBe(last);
 await vi.advanceTimersByTimeAsync(8100);game.action('next');await vi.advanceTimersByTimeAsync(1);expect(state.index).toBe(last+1);
});
it('deals the next pack under the chosen cheats, straight from the cheats panel',async()=>{
 const {game,state,save}=await setup();vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 const ui=()=>state.view.update.mock.calls.at(-1)[0];
 game.action('settings');game.action('cheats');expect(state.panel).toBe('cheats');expect(ui().cheats).toEqual({win:'random',total:'random',bonus:'random',legendary:'lugia'});
 ui().setCheats({bonus:'capture',legendary:'mewtwo'});expect(ui().cheats).toMatchObject({bonus:'capture',legendary:'mewtwo',win:'random'});
 game.action('cheats-open');await vi.advanceTimersByTimeAsync(1);
 expect(state.panel).toBeNull();expect(save().active?.showdownSymbols).toEqual([1,4,7]);expect(save().balance).toBe(1000000-DEFAULT_PACK.price);
 // The choices stay for the packs that follow, until they are reset.
 expect(ui().cheats.bonus).toBe('capture');game.action('cheats-reset');expect(ui().cheats).toEqual({win:'random',total:'random',bonus:'random',legendary:'lugia'});
});
it('keeps bonus balls out of the pack when the bonus cheat is off, and leaves an open pack alone',async()=>{
 const {game,state,save}=await setup();vi.spyOn(state,'openShowdown').mockResolvedValue(undefined);
 state.setCheats({bonus:'off'});state.showdownArmed=true;game.action('open');await vi.advanceTimersByTimeAsync(1);
 expect(save().active?.showdownSymbols).toEqual([]);const id=save().active!.id;
 // Opening from the panel while a pack is open only closes the panel.
 game.action('cheats');game.action('cheats-open');await vi.advanceTimersByTimeAsync(1);expect(state.panel).toBeNull();expect(save().active!.id).toBe(id);
});
