import { expect,it } from 'vitest';
import { specialPokemon } from './specialReward';
import { energy,priceCard } from './model';

const art={Charizard:{dexId:6,image:'/assets/pokemon/charizard.png'}};
const rare=priceCard({id:'sv3-223',name:'Charizard ex',number:'223',rarity:'Special Illustration Rare',image:'/assets/cards/sv3-223.webp'});
it('reserves the emergence for supported Pokémon worth at least the selected pack',()=>{
  expect(specialPokemon(rare,1000,art)).toBe('/assets/pokemon/charizard.png');
  expect(specialPokemon({...rare,value:999},1000,art)).toBeNull();
  expect(specialPokemon({...rare,name:'Serena'},1000,art)).toBeNull();
  expect(specialPokemon(energy,1000,art)).toBeNull();
});
