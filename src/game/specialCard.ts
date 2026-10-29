/** Card rarity controls presentation; payout multipliers only upgrade the win tier. */
export function isSpecialCard(card:{rarity:string;name?:string}){
  return /illustration|ultra|special|hyper|secret|double|shiny|radiant|\b(?:V|VMAX|VSTAR|GX|EX)\b/i.test(card.rarity)
    || /(?:[-\s](?:ex|GX|V|VMAX|VSTAR)$)|(?:^Radiant\s)/i.test(card.name??'');
}
