import { createOpening,type Card,type Pack,type Save } from './model';
import { specialPokemon,type PokemonArtwork } from './specialReward';

// Temporary, user-requested animation preview. Turn off to restore normal draws.
export const GUARANTEED_FIRST_SPECIAL = true;
export function createPreviewOpening(save:Save,pool:Card[],pack:Pack,art:PokemonArtwork,rng=Math.random,enabled=GUARANTEED_FIRST_SPECIAL):Save{
  const opened=createOpening(save,pool,rng,pack);
  if(opened===save||!enabled||!opened.active)return opened;
  const first=pool.filter(card=>specialPokemon(card,0,art)).reduce<Card|undefined>((best,card)=>!best||card.value>best.value?card:best,undefined);
  if(!first)return opened;
  return {...opened,active:{...opened.active,previewSpecial:true,cards:[first,...opened.active.cards.slice(1)]}};
}
