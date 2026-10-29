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
  const previous=save.history.find(opening=>(opening.pack?.id??'obsidian-flames')===pack.id)?.cards[0];
  const next=previous?cast.findIndex(card=>showcaseSpecies(card.name)===showcaseSpecies(previous.name))+1:0;
  const first=cast.length?cast[next%cast.length]:best(supported);
  if(!first)return opened;
  return {...opened,active:{...opened.active,previewSpecial:true,cards:[first,...opened.active.cards.slice(1)]}};
}
