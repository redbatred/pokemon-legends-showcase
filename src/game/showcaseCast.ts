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
