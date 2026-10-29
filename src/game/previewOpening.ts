import { createOpening,type Card,type Pack,type Save } from './model';
import { specialPokemon,type PokemonArtwork } from './specialReward';
import { SHOWCASE_CAST,showcaseSpecies,showcaseEdition } from './showcaseCast';

// Temporary, user-requested animation preview. Turn off to restore normal draws.
export const GUARANTEED_FIRST_SPECIAL = true;
export function createPreviewOpening(save:Save,pool:Card[],pack:Pack,art:PokemonArtwork,rng=Math.random,enabled=GUARANTEED_FIRST_SPECIAL):Save{
  const opened=createOpening(save,pool,rng,pack);
  if(opened===save||!enabled||!opened.active)return opened;
  const supported=pool.filter(card=>specialPokemon(card,0,art)),best=(cards:Card[])=>cards.reduce<Card|undefined>((choice,card)=>!choice||card.value>choice.value||card.value===choice.value&&showcaseEdition(card)>showcaseEdition(choice)?card:choice,undefined);
  const cast=(SHOWCASE_CAST[pack.id]??[]).map(species=>best(supported.filter(card=>showcaseSpecies(card.name)===species))).filter((card):card is Card=>!!card);
  const choices=cast.length?cast:[...new Set(supported.map(card=>showcaseSpecies(card.name)))].map(species=>best(supported.filter(card=>showcaseSpecies(card.name)===species))!);
  // A pack change must not reset the cast to Charizard. Prefer a species that
  // isn't already in this opening, then the one seen least recently anywhere.
  const otherCards=opened.active.cards.slice(1);
  const unique=choices.filter(card=>!otherCards.some(other=>showcaseSpecies(other.name)===showcaseSpecies(card.name)));
  const candidates=unique.length?unique:choices;
  const recency=(card:Card)=>{
    const index=save.history.findIndex(opening=>opening.cards.some(other=>showcaseSpecies(other.name)===showcaseSpecies(card.name)));
    return index<0?save.history.length:index;
  };
  const oldest=Math.max(...candidates.map(recency));
  const available=candidates.filter(card=>recency(card)===oldest);
  const first=available[Math.floor(Math.min(.9999999,Math.max(0,rng()))*available.length)];
  if(!first)return opened;
  return {...opened,active:{...opened.active,previewSpecial:true,cards:[first,...opened.active.cards.slice(1)]}};
}
