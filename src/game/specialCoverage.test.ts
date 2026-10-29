import {expect,it} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import packs from '../../public/assets/packs.json';
import artwork from '../../public/assets/pokemon/manifest.json';
import models from '../../public/assets/pokemon-3d/manifest.json';
import {isSpecialCard} from './specialCard';
import {specialPokemon} from './specialReward';
import {priceCard,DEFAULT_PACK,type Card} from './model';
import {winTier} from './winTransfer';
// Serena is the only special Trainer card in the shipped catalogs.
const trainerIds=new Set(['swsh12-193']);
const entries=packs.flatMap(pack=>(JSON.parse(readFileSync(new URL('../../public'+pack.catalogUrl,import.meta.url),'utf8')) as Card[]).filter(c=>isSpecialCard(c)&&!trainerIds.has(c.id)).map(raw=>({pack,raw})));
it('audits the complete shipped special Pokémon catalog, not only showcase first cards',()=>{expect(entries).toHaveLength(89);});
it.each(entries)('$raw.id $raw.name has an exact animated reveal at its actual pack price',({pack,raw})=>{
 const priced=priceCard(raw),card={...priced,value:Math.round(priced.value*pack.price/DEFAULT_PACK.price)};
 const image=specialPokemon(card,pack.price,artwork);expect(image).not.toBeNull();
 const slug=image!.split('/').pop()!.replace(/\.png$/,'');const model=(models as Record<string,{path:string;idle?:string;attack?:string;enter?:string;runtime?:{idle:string;attack:string}}>)[slug];
 expect(model).toBeDefined();expect(existsSync(new URL('../../public'+image,import.meta.url))).toBe(true);
 const bytes=readFileSync(new URL('../../public'+model.path,import.meta.url)),gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 expect(gltf.skins.length).toBeGreaterThan(0);for(const name of [model.idle??model.runtime?.idle,model.attack??model.runtime?.attack,model.enter].filter(Boolean))expect(gltf.animations.map((a:{name:string})=>a.name)).toContain(name);
 expect(winTier(card,pack.price)).not.toBeNull();
});
it('never invents a Pokémon for the special Trainer or energy',()=>{
 const trainer=priceCard({id:'swsh12-193',name:'Serena',rarity:'Ultra Rare',number:'193',image:'/trainer.png'});
 expect(specialPokemon(trainer,0,artwork)).toBeNull();
});
