import {expect,it,vi} from 'vitest';
const mocks=vi.hoisted(()=>({load:vi.fn(async()=>({})),create:vi.fn(async()=>({destroy:vi.fn()}))}));
vi.mock('pixi.js',async importOriginal=>({...await importOriginal<typeof import('pixi.js')>(),Assets:{load:mocks.load}}));
vi.mock('./SpineReveal',()=>({SpineReveal:{create:mocks.create}}));
import {OpeningStage} from './Stage';
import {energy} from './model';
it.each([{turbo:true,reduced:false},{turbo:false,reduced:true},{turbo:false,reduced:false}])('prepares the matching Pokémon even when presentation is shortened (%j)',async(options)=>{
 const stage={options:{...options,low:false},prepared:null,discardPrepared:vi.fn(),destroyed:false} as any;
 OpeningStage.prototype.prepareReveal.call(stage,{...energy,id:'rare',image:'/card.png'},'/pokemon.png');
 const result=await stage.prepared.promise;expect(result.special).not.toBeNull();
});
