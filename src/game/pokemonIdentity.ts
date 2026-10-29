import appearances from '../../public/assets/pokemon/card-forms.json';
import type {Card} from './model';

type Form='regular'|'dynamax'|'gigantamax'|'origin'|'tera'|'paldean'|'mega'|'mega-x'|'mega-y';
type Appearance={species:string;form:Form;shiny:boolean;teraType?:'dark'|'electric'|'dragon'|'grass'};
const forms=appearances as Record<string,Appearance>;
const gigantamax=new Set(['Charizard','Blastoise','Venusaur','Pikachu','Meowth','Machamp','Gengar','Kingler','Lapras','Eevee','Snorlax','Garbodor','Melmetal','Rillaboom','Cinderace','Inteleon','Corviknight','Orbeetle','Drednaw','Coalossal','Flapple','Appletun','Sandaconda','Toxtricity','Centiskorch','Hatterene','Grimmsnarl','Alcremie','Copperajah','Duraludon','Urshifu']);

/** Card mechanics (ex/GX/V) are not evolution stages. Never match by family or substring. */
export function pokemonSpecies(name:string){
  return name.replace(/^Radiant\s+/i,'').replace(/[-\s]+(?:VMAX|VSTAR|GX|EX|ex|V)$/,'').trim();
}

export function pokemonIdentity(card:Pick<Card,'id'|'name'|'rarity'>){
  const known=forms[card.id];
  let species=pokemonSpecies(card.name),form:Form=known?.form??'regular';
  const shiny=known?.shiny??(/^Radiant\s/i.test(card.name)||/shiny/i.test(card.rarity));
  if(!known&&/ VMAX$/.test(card.name))form=gigantamax.has(species)?'gigantamax':'dynamax';
  if(/^(?:Mega |M )/.test(species)){
    form=/ X$/.test(species)?'mega-x':/ Y$/.test(species)?'mega-y':'mega';
    species=species.replace(/^(?:Mega |M )/,'').replace(/ [XY]$/,'');
  }
  // Clodsire is a separate evolution, not the Paldean form of another species.
  if(species==='Paldean Clodsire')species='Clodsire';
  const displayForm=form==='tera'?`Tera ${known?.teraType??'unknown'} `:form==='gigantamax'?'Gigantamax ':form==='origin'?'Origin ':form==='mega'?'Mega ':form==='mega-x'?'Mega X ':form==='mega-y'?'Mega Y ':'';
  const artworkKey=`${shiny?'Shiny ':''}${displayForm}${species}`;
  return {species,form,shiny,teraType:known?.teraType,artworkKey};
}
