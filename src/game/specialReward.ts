import type { Card } from './model';
import {pokemonIdentity} from './pokemonIdentity';
export type PokemonArtwork=Record<string,{dexId:number;image:string;species?:string}>;
export function specialPokemon(card:Card,packPrice:number,art:PokemonArtwork):string|null{
  if(card.id==='energy'||card.value<packPrice)return null;
  const identity=pokemonIdentity(card);
  return art[identity.artworkKey]?.image??null;
}
