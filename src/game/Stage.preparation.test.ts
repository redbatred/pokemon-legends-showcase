import {expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({prewarm:vi.fn(()=>({ready:Promise.resolve()})),load:vi.fn(async()=>({})),create:vi.fn(async()=>({destroy:vi.fn()}))}));
vi.mock('pixi.js',async importOriginal=>({...await importOriginal<typeof import('pixi.js')>(),Assets:{load:mocks.load}}));
vi.mock('./WinCinemaStage',()=>({prewarmWinStage:mocks.prewarm,clearPreparedWinStages:vi.fn()}));
vi.mock('./prepareWinEffects',()=>({spineTextures:()=>[],prepareWinEffects:vi.fn(async()=>{})}));
vi.mock('./SpineReveal',()=>({SpineReveal:{create:mocks.create}}));
import {OpeningStage} from './Stage';
import {energy} from './model';
it.each([{turbo:true,reduced:false},{turbo:false,reduced:true},{turbo:false,reduced:false}])('prepares the matching Pokémon even when presentation is shortened (%j)',async(options)=>{
 const stage={app:{renderer:{prepare:{upload:vi.fn(async()=>{})}},screen:{width:480,height:640}},options:{...options,low:false},prepared:new Map(),discardPrepared:vi.fn(),destroyed:false} as any;
 OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/card.png'},'/pokemon.png');
 const result=await stage.prepared.get('/card.png|/pokemon.png').takeSpecial();expect(result).not.toBeNull();
});
it('keeps a future special warm while preparing intervening ordinary cards',async()=>{
 const stage={app:{renderer:{prepare:{upload:vi.fn(async()=>{})}},screen:{width:480,height:640}},options:{reduced:false,turbo:false,low:false},prepared:new Map(),loadingReveal:null,destroyed:false} as any;
 const special=OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/future.png'},'/pokemon.png');
 const regular=OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'common',image:'/common.png'},null);
 expect(OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/future.png'},'/pokemon.png')).toBe(special);
 expect(stage.prepared.size).toBe(2);expect(await regular.takeSpecial()).toBeNull();expect(await special.takeSpecial()).not.toBeNull();
});

it('waits for the visible return before constructing the next actor',async()=>{
 let finish!:()=>void;const returning=new Promise<void>(r=>finish=r),prepareReveal=vi.fn();
 const stage={revealCompletion:{begin(){}},options:{},resetPointer(){},scene:{endCelebration(){}},revealToken:0,onBeforeCardTransfer:()=>returning,special:{prepareCardReturn(){}},applyRevealCamera(){},prepareReveal,destroyed:false} as any;
 const pending=OpeningStage.prototype.reveal.call(stage,energy);
 expect(prepareReveal).not.toHaveBeenCalled();stage.destroyed=true;finish();await pending;
 expect(prepareReveal).not.toHaveBeenCalled();
});

it('completes the correctly sized stadium before adopting a special reveal',async()=>{
 let ready!:()=>void;mocks.prewarm.mockReturnValueOnce({ready:new Promise<void>(resolve=>ready=resolve)});
 const stage={app:{renderer:{prepare:{upload:vi.fn(async()=>{})}},screen:{width:390,height:844}},options:{low:false},prepared:new Map(),destroyed:false} as any;
 const prepared=OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/new.png'},'/pokemon.png','mega');let adopted=false;
 const pending=prepared.ready.then(()=>adopted=true);await new Promise(resolve=>setTimeout(resolve,0));
 expect(mocks.prewarm).toHaveBeenLastCalledWith('/pokemon.png','mega',false,390,844);expect(adopted).toBe(false);
 ready();await pending;expect(adopted).toBe(true);
});
