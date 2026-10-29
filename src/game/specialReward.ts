import type { Card } from './model';
import {isSpecialCard} from './specialCard';
import {pokemonIdentity} from './pokemonIdentity';
export type PokemonArtwork=Record<string,{dexId:number;image:string;species?:string}>;
export function specialPokemon(card:Card,packPrice:number,art:PokemonArtwork):string|null{
  if(card.id==='energy'||(!isSpecialCard(card)&&card.value<packPrice))return null;
  const identity=pokemonIdentity(card);
  return art[identity.artworkKey]?.image??null;
}
