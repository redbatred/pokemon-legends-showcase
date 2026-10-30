import {expect,it} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import packs from '../../public/assets/packs.json';
import artwork from '../../public/assets/pokemon/manifest.json';
import {createPreviewOpening} from './previewOpening';
import {newSave,priceCard,settleOpening,DEFAULT_PACK,type Card,type Pack} from './model';
import {isSpecialCard} from './specialCard';
import {pokemonSpecies} from './pokemonIdentity';
const stats:unknown[]=[];
it.each(packs)('$id limits special frequency and avoids repeated cards across 1,000 openings',(rawPack)=>{
 const pack=rawPack as Pack,pool=(JSON.parse(readFileSync(new URL('../../public'+pack.catalogUrl,import.meta.url),'utf8')) as Card[]).map(raw=>{const card=priceCard(raw);return {...card,value:Math.round(card.value*pack.price/DEFAULT_PACK.price)};});
 let seed=137,save=newSave(),specialPacks=0;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const special=(card:Card)=>isSpecialCard(card)||card.value>=pack.price;
 const candidates=new Set((pack.id==='base-set'?pool.filter(c=>['Charizard','Blastoise','Mewtwo','Venusaur','Zapdos'].includes(c.name)):pool.filter(special)).map(c=>pokemonSpecies(c.name)));
 for(let i=0;i<1000;i++){
  const recent:string[]=[];for(const opening of save.history){for(const card of opening.cards.filter((c,i)=>special(c)||i===0&&opening.previewSpecial)){const name=pokemonSpecies(card.name);if(!recent.includes(name))recent.push(name);if(recent.length===3)break;}if(recent.length===3)break;}
  const opened=createPreviewOpening({...save,balance:100000000},pool,pack,artwork,rng),cards=opened.active!.cards.slice(0,pack.rewardCount),hits=cards.filter((c,i)=>special(c)||i===0&&opened.active!.previewSpecial);
  expect(cards).toHaveLength(pack.rewardCount);expect(new Set(cards.map(c=>c.id)).size).toBe(pack.rewardCount);expect(hits.length).toBeLessThanOrEqual(1);if(pack.id!=='base-set')expect(opened.active!.previewSpecial).not.toBe(true);
  if(hits.length){specialPacks++;if([...candidates].some(name=>!recent.includes(name)))expect(recent).not.toContain(pokemonSpecies(hits[0].name));}
  save=settleOpening(opened);
 }
 if(candidates.size)expect(specialPacks/1000).toBeGreaterThan(.30);expect(specialPacks/1000).toBeLessThan(.40);
 stats.push({pack:pack.id,openings:1000,specialPacks,duplicateCards:0,recentSpecialRepeatsWhenAlternativesExist:0});
 if(process.env.PACING_REPORT&&stats.length===packs.length)writeFileSync('output/pack-pacing-simulation.json',JSON.stringify(stats,null,2)+'\n');
});
