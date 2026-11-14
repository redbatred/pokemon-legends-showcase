import artwork from '../../public/assets/pokemon/manifest.json';
import {pokemonIdentity,pokemonSpecies} from './pokemonIdentity';
import type {Card} from './model';
/** Exact card appearance, including regional, shiny, Tera, and ensemble forms. */
export function winPokemonImage(card:Pick<Card,'id'|'name'|'rarity'>){return (artwork as Record<string,{image:string}>)[pokemonIdentity(card).artworkKey]?.image;}
export function winModelKey(input:string){return input.includes('/')?input.split(/[?#]/)[0].split('/').pop()!.replace(/\.[^.]+$/,''):pokemonSpecies(input).toLowerCase().replace(/[^a-z0-9-]/g,'');}
export type WinOrigin={x:number;y:number};
export type WinSource=(age?:number)=>WinOrigin[];
