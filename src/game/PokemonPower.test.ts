import {expect,it,vi} from 'vitest';
import {PokemonPower} from './PokemonPower';
import {pokemonPower} from './powerProfiles';
it('freezes Articuno projectiles at launch while the other birds keep attached wing effects',()=>{
 const live=['moltres','zapdos','articuno'].map((species,i)=>({species,x:100+i,y:20,dx:1,dy:0}));
 const launched=live.map(e=>({...e,x:e.x-100}));
 const hero={powerEmitters:()=>live},power=new PokemonPower(hero as any,pokemonPower('/assets/pokemon/moltres.png'));
 const state=power as any;state.emitters=()=>live;state.draw=vi.fn();state.launch=launched;state.releasedAt=.5;state.blast=1;state.clock=1;
 power.update(0);
 expect(state.draw.mock.calls.map((call:any[])=>call[0].x)).toEqual([100,101,2]);
 power.back.destroy();power.front.destroy();
});
