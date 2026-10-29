import { specialPokemon } from './specialReward';
import { expect,it } from 'vitest';
import { createPreviewOpening } from './previewOpening';
import { SHOWCASE_CAST,showcaseSpecies } from './showcaseCast';
import { DEFAULT_PACK,newSave,settleOpening,validateSave,priceCard,type Card,type Pack } from './model';
const common:Card={id:'c',number:'1',name:'Oddish',rarity:'Common',image:'/assets/cards/c.webp',value:25,weight:20};
const rare:Card={...common,id:'r',number:'223',name:'Charizard ex',rarity:'Special Illustration Rare',value:4500,weight:.6};
const trainer:Card={...rare,id:'t',name:'Serena',value:6000};
const art={Charizard:{dexId:6,image:'/assets/pokemon/charizard.png'}};
it('always starts new preview packs with the best supported special without extra cards or charges',()=>{
  const opened=createPreviewOpening(newSave(),[common,rare,trainer],DEFAULT_PACK,art,()=>0);
  expect(opened.active?.cards[0]).toEqual(rare);expect(opened.active?.cards).toHaveLength(11);
  expect(opened.active?.cards[10].id).toBe('energy');expect(opened.balance).toBe(9000);
  expect(validateSave(opened)).toEqual(opened);expect(settleOpening(opened).balance).toBe(13725);
  expect(createPreviewOpening(opened,[common,rare],DEFAULT_PACK,art)).toBe(opened);
});
it('can disable the temporary preview override and preserves nine-reward pack layouts',()=>{
  expect(createPreviewOpening(newSave(),[common,rare],DEFAULT_PACK,art,()=>0,false).active?.cards[0]).toEqual(common);
  const opened=createPreviewOpening(newSave(),[common,rare],{...DEFAULT_PACK,rewardCount:9},art,()=>0);
  expect(opened.active?.cards.filter(c=>c.id==='energy')).toHaveLength(2);
  expect(validateSave(opened)).toEqual(opened);
});

it('preview triggers supported artwork even when its real demo value is below pack cost',()=>{
  const card={...rare,value:950};const opened=createPreviewOpening(newSave(),[common,card],DEFAULT_PACK,art,()=>0);
  expect(opened.active?.cards[0]).toEqual(card);expect(opened.active?.previewSpecial).toBe(true);
  expect(validateSave(opened)?.active?.previewSpecial).toBe(true);
  expect(settleOpening(opened).history[0].total).toBe(1175);
});

it('every shipped set has a supported first-card animation in preview mode',()=>{
  const files=import.meta.glob('../../public/assets/**/*.json',{eager:true,import:'default'});
  const packs=files['../../public/assets/packs.json'] as Pack[];
  const artwork=files['../../public/assets/pokemon/manifest.json'] as typeof art;
  const models=files['../../public/assets/pokemon-3d/manifest.json'] as Record<string,{clips:{movingSkinnedJointCount:number}[]}>;
  for(const pack of packs){
    const pool=(files[`../../public${pack.catalogUrl}`] as Omit<Card,'value'|'weight'>[]).map(raw=>{const c=priceCard(raw);return {...c,value:Math.round(c.value*pack.price/DEFAULT_PACK.price)};});
    const opened=createPreviewOpening({...newSave(),balance:1000000},pool,pack,artwork,()=>0);
    expect(opened.active?.previewSpecial,pack.name).toBe(true);
    expect(specialPokemon(opened.active!.cards[0],0,artwork),pack.name).toBeTruthy();
    expect(opened.active?.cards).toHaveLength(11);
    for(const species of SHOWCASE_CAST[pack.id]){
      expect(pool.some(card=>showcaseSpecies(card.name)===species),`${pack.name}: ${species}`).toBe(true);
      expect(models[species.toLowerCase()]?.clips.some(clip=>clip.movingSkinnedJointCount>5),species).toBe(true);
    }
  }
});

it('rotates the curated showcase cast without changing the card pool, price, or saved results',()=>{
  const dragonite={...rare,id:'dragonite',name:'Dragonite ex',value:1500};
  const illustrated={...art,Dragonite:{dexId:149,image:'/assets/pokemon/dragonite.png'}};
  const pool=[common,dragonite,rare],first=createPreviewOpening(newSave(),pool,DEFAULT_PACK,illustrated,()=>0);
  const settled=settleOpening(first),second=createPreviewOpening(settled,pool,DEFAULT_PACK,illustrated,()=>0);
  expect(first.active?.cards[0].name).toBe('Charizard ex');
  expect(second.active?.cards[0]).toEqual(dragonite);
  expect(second.balance).toBe(settled.balance-DEFAULT_PACK.price);
  expect(second.history).toEqual(settled.history);
  expect(second.active?.cards.slice(1)).toEqual(first.active?.cards.slice(1));
  let save=settled;
  for(let i=0;i<33;i++)save=settleOpening(createPreviewOpening(save,pool,DEFAULT_PACK,illustrated,()=>0));
  expect(save.history).toHaveLength(30);
  const afterLimit=createPreviewOpening(save,pool,DEFAULT_PACK,illustrated,()=>0);
  expect(afterLimit.active?.cards[0].name).not.toBe(save.history[0].cards[0].name);
});

it('chooses the showcase art edition when two cards have the same demo value',()=>{
  const holo={...rare,id:'mewtwo-holo',name:'Mewtwo',rarity:'Holo Rare',number:'059',value:250};
  const fullArt={...holo,id:'mewtwo-vstar',name:'Mewtwo VSTAR',rarity:'Ultra Rare',number:'GG44'};
  const pack={...DEFAULT_PACK,id:'crown-zenith'};
  const opened=createPreviewOpening(newSave(),[holo,fullArt],pack,{Mewtwo:{dexId:150,image:'/assets/pokemon/mewtwo.png'}},()=>0);
  expect(opened.active?.cards[0]).toEqual(fullArt);
});
