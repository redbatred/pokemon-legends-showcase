import type { Card } from './model';
export type PokemonArtwork=Record<string,{dexId:number;image:string}>;
export function specialPokemon(card:Card,packPrice:number,art:PokemonArtwork):string|null{
  if(card.id==='energy'||card.value<packPrice)return null;
  const name=card.name.replace(/^Radiant /,'').replace(/ (?:ex|EX|GX|V|VMAX|VSTAR)$/,'');
  return art[name]?.image??null;
}
