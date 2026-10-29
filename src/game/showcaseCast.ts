/** Real cards from each set, chosen for their complete skeletal performances.
 * Only the temporary showcase first-card override uses this cast. */
export const SHOWCASE_CAST:Record<string,readonly string[]>={
  'obsidian-flames':['Charizard','Tyranitar','Dragonite'],
  'pokemon-151':['Blastoise','Charizard','Venusaur','Mew'],
  'crown-zenith':['Mewtwo','Giratina','Kyogre','Arceus','Suicune','Raikou'],
  'paldean-fates':['Charizard','Gardevoir','Mew'],
  'lost-origin':['Giratina','Aerodactyl'],
  'fusion-strike':['Greninja','Gengar','Mew','Cinderace'],
  'silver-tempest':['Lugia','Rayquaza','Articuno'],
  'evolving-skies':['Rayquaza','Gyarados','Umbreon','Glaceon'],
  'hidden-fates':['Charizard','Mewtwo','Gyarados','Zapdos'],
  'base-set':['Charizard','Blastoise','Mewtwo','Venusaur','Zapdos'],
};
export const showcaseSpecies=(name:string)=>name.replace(/^Radiant /,'').replace(/ (?:ex|EX|GX|V|VMAX|VSTAR)$/,'');
export function showcaseEdition(card:{name:string;rarity:string}){
  const rarity=/Special|Secret|Hyper/i.test(card.rarity)?4:/Illustration|Ultra/i.test(card.rarity)?3:/Holo/i.test(card.rarity)?2:/Rare/i.test(card.rarity)?1:0;
  return rarity*10+(/ (VMAX|VSTAR)$/.test(card.name)?3:/ (ex|EX|GX)$/.test(card.name)?2:/ V$/.test(card.name)?1:0);
}
