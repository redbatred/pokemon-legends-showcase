import {SPECIAL_PACK_CHANCE} from './packDraw';
import {isSpecialCard} from './specialCard';
import { createOpening,type Card,type Pack,type Save } from './model';
import { specialPokemon,type PokemonArtwork } from './specialReward';
import { SHOWCASE_CAST,showcaseSpecies,showcaseEdition } from './showcaseCast';

// Explicit diagnostics can still force a first-card preview; the live game never guarantees one.
export const GUARANTEED_FIRST_SPECIAL = false;
export function createPreviewOpening(save:Save,pool:Card[],pack:Pack,art:PokemonArtwork,rng=Math.random,enabled=GUARANTEED_FIRST_SPECIAL):Save{
  const opened=createOpening(save,pool,rng,pack);
  if(opened===save||!opened.active)return opened;
  // Base Set predates ex/V rarity labels. Keep its curated classic reveal on the same optional cadence.
  if(!enabled&&(pack.id!=='base-set'||rng()>=SPECIAL_PACK_CHANCE))return opened;
  const supported=pool.filter(card=>specialPokemon(card,0,art)),best=(cards:Card[])=>cards.reduce<Card|undefined>((choice,card)=>!choice||card.value>choice.value||card.value===choice.value&&showcaseEdition(card)>showcaseEdition(choice)?card:choice,undefined);
  const cast=(SHOWCASE_CAST[pack.id]??[]).map(species=>best(supported.filter(card=>showcaseSpecies(card.name)===species))).filter((card):card is Card=>!!card);
  const choices=cast.length?cast:[...new Set(supported.map(card=>showcaseSpecies(card.name)))].map(species=>best(supported.filter(card=>showcaseSpecies(card.name)===species))!);
  const candidates=choices;
  const recency=(card:Card)=>{
    const index=save.history.findIndex(opening=>opening.cards.some((other,i)=>(i===0&&opening.previewSpecial||isSpecialCard(other)||other.value>=(opening.pack?.price??1000))&&showcaseSpecies(other.name)===showcaseSpecies(card.name)));
    return index<0?save.history.length:index;
  };
  const oldest=Math.max(...candidates.map(recency));
  const available=candidates.filter(card=>recency(card)===oldest);
  const first=available[Math.floor(Math.min(.9999999,Math.max(0,rng()))*available.length)];
  if(!first)return opened;
  const existing=opened.active.cards.findIndex(card=>card.id===first.id);
  const cards=existing>=0?[first,...opened.active.cards.filter((_,i)=>i!==existing)]:[first,...opened.active.cards.slice(1)];
  return {...opened,active:{...opened.active,previewSpecial:true,cards}};
}
