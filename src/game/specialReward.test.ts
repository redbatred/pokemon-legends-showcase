import { expect,it } from 'vitest';
import { specialPokemon } from './specialReward';
import { energy,priceCard } from './model';

const art={Charizard:{dexId:6,image:'/assets/pokemon/charizard.png'}};
const rare=priceCard({id:'sv03-223',name:'Charizard ex',number:'223',rarity:'Special Illustration Rare',image:'/assets/cards/223.webp'});
it('reveals supported special cards below the pack price without promoting ordinary cards',()=>{
  expect(specialPokemon({...rare,id:'sv03.5-199'},1000,art)).toBe('/assets/pokemon/charizard.png');
  expect(specialPokemon({...rare,id:'sv03.5-199',value:999},1000,art)).toBe('/assets/pokemon/charizard.png');
  expect(specialPokemon({...rare,id:'base1-4',name:'Charizard',rarity:'Holo Rare',value:999},1000,art)).toBeNull();
  expect(specialPokemon({...rare,name:'Serena'},1000,art)).toBeNull();
  expect(specialPokemon(energy,1000,art)).toBeNull();
});

it('matches shiny card appearances without borrowing the normal model',()=>{
  const variants={...art,'Shiny Charizard':{dexId:6,image:'/assets/pokemon/charizard-shiny.png'}};
  expect(specialPokemon({...rare,id:'sma-SV49',name:'Charizard-GX',rarity:'Shiny rare'},0,variants)).toBe('/assets/pokemon/charizard-shiny.png');
  expect(specialPokemon({...rare,id:'swsh12.5-020',name:'Radiant Charizard'},0,variants)).toBe('/assets/pokemon/charizard-shiny.png');
  expect(specialPokemon({...rare,id:'sma-SV49',name:'Charizard-GX',rarity:'Shiny rare'},0,art)).toBeNull();
});

it('keeps an unsupported Tera card on its card reveal instead of showing regular Charizard',()=>{
  expect(specialPokemon(rare,0,art)).toBeNull();
  expect(specialPokemon({...rare,id:'sv04.5-234'},0,{...art,'Shiny Charizard':{dexId:6,image:'/assets/pokemon/charizard-shiny.png'}})).toBeNull();
});

it('uses Origin and Gigantamax identities only when that exact form exists',()=>{
  const models={Giratina:{dexId:487,image:'/giratina.png'},'Origin Giratina':{dexId:487,image:'/giratina-origin.png'},Gengar:{dexId:94,image:'/gengar.png'},'Gigantamax Gengar':{dexId:94,image:'/gengar-gmax.png'}};
  expect(specialPokemon({...rare,id:'swsh11-186',name:'Giratina VSTAR'},0,models)).toBe('/giratina-origin.png');
  expect(specialPokemon({...rare,id:'swsh8-271',name:'Gengar VMAX'},0,models)).toBe('/gengar-gmax.png');
  expect(specialPokemon({...rare,id:'swsh8-271',name:'Gengar VMAX'},0,{Gengar:models.Gengar})).toBeNull();
});

it('keeps evolution stages distinct and does not replace a missing evolution with its final form',()=>{
  const models={...art,Charmander:{dexId:4,image:'/charmander.png'},Charmeleon:{dexId:5,image:'/charmeleon.png'}};
  expect(specialPokemon({...rare,id:'sv03-026',name:'Charmander'},0,models)).toBe('/charmander.png');
  expect(specialPokemon({...rare,id:'sv03-027',name:'Charmeleon'},0,models)).toBe('/charmeleon.png');
  expect(specialPokemon({...rare,id:'sv03-026',name:'Charmander'},0,art)).toBeNull();
});

 it.each(['Double rare','Holo Rare V','Holo Rare VMAX','Holo Rare VSTAR','Radiant Rare','Shiny rare','Illustration rare','Secret Rare'])('recognizes %s independently of the pack price',(rarity)=>{
  expect(specialPokemon({...rare,id:'test',name:'Charizard',rarity,value:25},10000,{'Charizard':art.Charizard,'Shiny Charizard':art.Charizard})).toBe(art.Charizard.image);
 });
