import {expect,it,vi} from 'vitest';
import {RevealPreparation} from './revealPreparation';
const deferred=<T>()=>{let resolve!:(value:T)=>void;const promise=new Promise<T>(r=>resolve=r);return {promise,resolve};};
it('makes the card texture available while its Pokémon is still loading',async()=>{
 const model=deferred<{destroy:()=>void}>(),texture={id:'card'},build=vi.fn(()=>model.promise),prepared=new RevealPreparation(Promise.resolve(texture),build);
 expect(await prepared.texture).toBe(texture);expect(build).toHaveBeenCalledWith(texture);
 const hero={destroy:vi.fn()};model.resolve(hero);expect(await prepared.takeSpecial()).toBe(hero);prepared.cancel();expect(hero.destroy).not.toHaveBeenCalled();
});
it('disposes a late Pokémon exactly once after cancellation',async()=>{
 const model=deferred<{destroy:()=>void}>(),prepared=new RevealPreparation(Promise.resolve({}),()=>model.promise);await prepared.texture;prepared.cancel();
 const hero={destroy:vi.fn()};model.resolve(hero);expect(await prepared.takeSpecial()).toBeNull();prepared.cancel();expect(hero.destroy).toHaveBeenCalledOnce();
});
it('releases a warmed model when the player opens all or exits before its reveal',async()=>{
 const hero={destroy:vi.fn()},prepared=new RevealPreparation(Promise.resolve({}),async()=>hero);await prepared.ready;prepared.cancel();expect(await prepared.takeSpecial()).toBeNull();expect(hero.destroy).toHaveBeenCalledOnce();
});
it('cannot adopt the same Pokémon twice',async()=>{
 const hero={destroy:vi.fn()},prepared=new RevealPreparation(Promise.resolve({}),async()=>hero);
 expect(await prepared.takeSpecial()).toBe(hero);expect(await prepared.takeSpecial()).toBeNull();
});
