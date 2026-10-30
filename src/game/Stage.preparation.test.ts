import {expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({load:vi.fn(async()=>({})),create:vi.fn(async()=>({destroy:vi.fn()}))}));
vi.mock('pixi.js',async importOriginal=>({...await importOriginal<typeof import('pixi.js')>(),Assets:{load:mocks.load}}));
vi.mock('./SpineReveal',()=>({SpineReveal:{create:mocks.create}}));
import {OpeningStage} from './Stage';
import {energy} from './model';
it.each([{turbo:true,reduced:false},{turbo:false,reduced:true},{turbo:false,reduced:false}])('prepares the matching Pokémon even when presentation is shortened (%j)',async(options)=>{
 const stage={options:{...options,low:false},prepared:new Map(),discardPrepared:vi.fn(),destroyed:false} as any;
 OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/card.png'},'/pokemon.png');
 const result=await stage.prepared.get('/card.png|/pokemon.png').takeSpecial();expect(result).not.toBeNull();
});
it('keeps a future special warm while preparing intervening ordinary cards',async()=>{
 const stage={options:{reduced:false,turbo:false,low:false},prepared:new Map(),loadingReveal:null,destroyed:false} as any;
 const special=OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/future.png'},'/pokemon.png');
 const regular=OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'common',image:'/common.png'},null);
 expect(OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/future.png'},'/pokemon.png')).toBe(special);
 expect(stage.prepared.size).toBe(2);expect(await regular.takeSpecial()).toBeNull();expect(await special.takeSpecial()).not.toBeNull();
});
