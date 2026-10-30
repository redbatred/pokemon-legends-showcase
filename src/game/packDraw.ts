import type {Card,Result} from './model';
import {isSpecialCard} from './specialCard';
import {pokemonSpecies} from './pokemonIdentity';

// Frontend showcase pacing, not official Pokémon TCG pull rates.
export const SPECIAL_PACK_CHANCE=.35;
const special=(card:Card,price:number)=>isSpecialCard(card)||card.value>=price;
const unit=(rng:()=>number)=>Math.min(.9999999,Math.max(0,rng()));
function weighted<T>(items:readonly T[],weight:(item:T)=>number,rng:()=>number):T{
 let pick=unit(rng)*items.reduce((sum,item)=>sum+weight(item),0);
 return items.find(item=>(pick-=weight(item))<0)??items[items.length-1];
}
/** One optional special slot; ordinary cards draw without replacement where the pool permits. */
export function drawPackCards(pool:Card[],count:number,price:number,history:Result[],rng:()=>number):Card[]{
 const specials=pool.filter(card=>special(card,price)),ordinary=pool.filter(card=>!special(card,price));
 const cards:Card[]=[],usedIds=new Set<string>(),usedSpecies=new Set<string>();
 const add=(card:Card)=>{cards.push(card);usedIds.add(card.id);usedSpecies.add(pokemonSpecies(card.name));};
 if(specials.length&&ordinary.length&&unit(rng)<SPECIAL_PACK_CHANCE){
  const recent:string[]=[];
  for(const opening of history){
   for(const card of opening.cards.filter((card,i)=>special(card,opening.pack?.price??1000)||i===0&&opening.previewSpecial).reverse()){
    const species=pokemonSpecies(card.name);if(!recent.includes(species))recent.push(species);if(recent.length===3)break;
   }
   if(recent.length===3)break;
  }
  const groups=new Map<string,Card[]>();for(const card of specials){const species=pokemonSpecies(card.name);groups.set(species,[...(groups.get(species)??[]),card]);}
  let choices=[...groups.keys()].filter(species=>!recent.includes(species));
  if(!choices.length){const oldest=Math.max(...[...groups.keys()].map(species=>recent.indexOf(species)));choices=[...groups.keys()].filter(species=>recent.indexOf(species)===oldest);}
  // Multiple printings of one Pokémon must not multiply its chance of being selected.
  const species=weighted(choices,name=>Math.max(...groups.get(name)!.map(card=>card.weight)),rng);
  add(weighted(groups.get(species)!,card=>card.weight,rng));
 }
 const filler=ordinary.length?ordinary:pool;
 while(cards.length<count){
  const unseen=filler.filter(card=>!usedIds.has(card.id)),different=unseen.filter(card=>!usedSpecies.has(pokemonSpecies(card.name)));
  const available=different.length?different:unseen.length?unseen:filler;
  add(weighted(available,card=>card.weight,rng));
 }
 return cards;
}
