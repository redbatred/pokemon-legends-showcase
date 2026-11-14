import {readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {CHEAT_BONUSES,CHEAT_TOTALS,CHEAT_WINS,HERO_MULTIPLE,NO_CHEATS,cheatSummary,cheatsActive,createCheatOpening,totalMultiple,type Cheats} from './cheats';
import {DEFAULT_PACK,newSave,priceCard,settleOpening,validateSave,type Card,type Pack} from './model';
import {createPreviewOpening} from './previewOpening';
import {assignMockShowdownSymbols,qualifiesForShowdown,validShowdownSymbols} from './showdown/showdownSymbols';
import {isSpecialCard} from './specialCard';
import {specialPokemon,type PokemonArtwork} from './specialReward';
import {winTier} from './winTransfer';
import {PACK_TIERS,packTierIndex} from './packFinaleMotion';

// The shipped sets, priced the way the game prices them.
const asset=(url:string)=>JSON.parse(readFileSync('public'+url,'utf8'));
const packs:Pack[]=asset('/assets/packs.json'),art:PokemonArtwork=asset('/assets/pokemon/manifest.json');
const pools=new Map(packs.map(pack=>[pack.id,(asset(pack.catalogUrl) as Omit<Card,'value'|'weight'>[]).map(raw=>{const card=priceCard(raw);return {...card,value:Math.round(card.value*pack.price/DEFAULT_PACK.price)};})]));
const seeded=(seed:number)=>()=>(seed=(seed*16807)%2147483647)/2147483647;
const rich=()=>({...newSave(),balance:100_000_000});
const open=(pack:Pack,cheats:Partial<Cheats>,seed=7)=>createCheatOpening(rich(),pools.get(pack.id)!,pack,art,{...NO_CHEATS,...cheats},seeded(seed));

describe('cheat openings',()=>{
 it('deals the ordinary pack when no cheat is chosen',()=>{
  for(const pack of packs)for(const seed of [3,11,29]){
   const rng=seeded(seed),expected=createPreviewOpening(rich(),pools.get(pack.id)!,pack,art,rng),symbols=assignMockShowdownSymbols(pack.rewardCount,false,rng);
   const opened=open(pack,{},seed);
   expect(opened.active!.cards).toEqual(expected.active!.cards);expect(opened.active!.previewSpecial).toBe(expected.active!.previewSpecial);expect(opened.active!.showdownSymbols).toEqual(symbols);expect(opened.balance).toBe(expected.balance);
  }
 });
 it('never deals over a pack that is already open',()=>{
  const opened=open(packs[0],{win:'legendary'});
  expect(createCheatOpening(opened,pools.get(packs[0].id)!,packs[0],art,{...NO_CHEATS,win:'big'},seeded(5))).toBe(opened);
 });
 it('puts the chosen Pokémon win on the first card of every set, as a save the game accepts',()=>{
  for(const pack of packs)for(const win of ['special','big','mega','epic','legendary'] as const)for(const seed of [2,17]){
   const opened=open(pack,{win},seed),active=opened.active!,first=active.cards[0];
   expect(active.previewSpecial,`${pack.id} ${win}`).toBe(true);
   expect(winTier(first,pack.price,true),`${pack.id} ${win}`).toBe(win);
   expect(specialPokemon(first,0,art),`${pack.id} ${win} has a Pokémon to show`).toBeTruthy();
   expect(validateSave(opened)).toEqual(opened);
   expect(active.cards).toHaveLength(11);expect(new Set(active.cards.slice(0,pack.rewardCount).map(card=>card.id)).size).toBe(pack.rewardCount);
   expect(opened.balance).toBe(100_000_000-pack.price);
   if(win!=='special')expect(first.value).toBe(HERO_MULTIPLE[win]*pack.price);
  }
 });
 it('deals a pack with no special Pokémon when asked for a normal one',()=>{
  for(const pack of packs)for(const seed of [1,2,3,4,5,6,7,8]){
   const opened=open(pack,{win:'normal'},seed),active=opened.active!,real=active.cards.slice(0,pack.rewardCount);
   expect(active.previewSpecial).toBeUndefined();
   for(const [i,card] of real.entries()){expect(isSpecialCard(card)||card.value>=pack.price,`${pack.id} ${card.name}`).toBe(false);expect(winTier(card,pack.price,false)).toBeNull();expect(specialPokemon(card,i===0&&active.previewSpecial?0:pack.price,art)).toBeNull();}
   expect(real.map(card=>card.value)).toEqual([...real.map(card=>card.value)].sort((a,b)=>a-b));
   expect(new Set(real.map(card=>card.id)).size).toBe(pack.rewardCount);expect(validateSave(opened)).toEqual(opened);
  }
 });
 it('makes the pack pay into the chosen end-screen tier',()=>{
  for(const pack of packs)for(const total of ['big','mega','epic','legendary'] as const){
   const settled=settleOpening(open(pack,{total})).history[0],index=PACK_TIERS.findIndex(tier=>tier.tier===total);
   expect(packTierIndex(settled.total/pack.price),`${pack.id} ${total}`).toBe(index);
   // Asking for a normal first card and a big total cannot both hold: the total wins and a Pokémon carries it.
   expect(open(pack,{win:'normal',total}).active!.previewSpecial).toBe(true);
  }
  // A total is a floor: a bigger Pokémon win is not cut down to it.
  const pack=packs[0],both=open(pack,{win:'legendary',total:'big'}).active!.cards[0];
  expect(both.value).toBe(HERO_MULTIPLE.legendary*pack.price);
  expect(open(pack,{win:'big',total:'epic'}).active!.cards[0].value).toBe(totalMultiple('epic')*pack.price);
 });
 it('keeps each Pokémon win inside its own tier and the totals on the end-screen thresholds',()=>{
  expect(CHEAT_WINS).toEqual(['random','normal','special','big','mega','epic','legendary']);
  expect(CHEAT_TOTALS.slice(1)).toEqual(PACK_TIERS.map(tier=>tier.tier));
  expect(PACK_TIERS.map(tier=>totalMultiple(tier.tier as 'big'))).toEqual(PACK_TIERS.map(tier=>tier.at));
 });
 it('controls the bonus balls',()=>{
  for(const pack of packs){
   expect(open(pack,{bonus:'off'}).active!.showdownSymbols).toEqual([]);
   for(const bonus of ['capture','escape'] as const){const symbols=open(pack,{bonus}).active!.showdownSymbols;expect(qualifiesForShowdown(symbols,pack.rewardCount)).toBe(true);}
   for(const seed of [1,2,3,4])expect(validShowdownSymbols(open(pack,{},seed).active!.showdownSymbols,pack.rewardCount)).toBe(true);
   // The old test hook still arms the bonus on its own.
   expect(qualifiesForShowdown(createCheatOpening(rich(),pools.get(pack.id)!,pack,art,NO_CHEATS,seeded(3),true).active!.showdownSymbols,pack.rewardCount)).toBe(true);
  }
  expect(CHEAT_BONUSES).toEqual(['random','off','capture','escape']);
 });
 it('says in one line what is armed',()=>{
  expect(cheatsActive(NO_CHEATS)).toBe(false);expect(cheatSummary(NO_CHEATS)).toBe('Cheats off. Every pack is random.');
  expect(cheatsActive({...NO_CHEATS,legendary:'mewtwo'})).toBe(true);expect(cheatSummary({...NO_CHEATS,legendary:'mewtwo'})).toBe('Next pack: bonus legendary: Mewtwo.');
  expect(cheatSummary({win:'legendary',total:'epic',bonus:'capture',legendary:'lugia'})).toBe('Next pack: legendary on the first card · pays at least 100× the pack · bonus: Lugia is caught.');
  expect(cheatSummary({...NO_CHEATS,win:'normal',bonus:'off'})).toBe('Next pack: no special Pokémon · no bonus.');
  expect(cheatSummary({...NO_CHEATS,bonus:'escape',legendary:'mewtwo'})).toBe('Next pack: bonus: Mewtwo escapes.');
 });
});
