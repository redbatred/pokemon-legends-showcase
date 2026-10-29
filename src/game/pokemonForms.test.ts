import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import artwork from '../../public/assets/pokemon/manifest.json';
import models from '../../public/assets/pokemon-3d/manifest.json';
import {specialPokemon} from './specialReward';
import {moveRigs} from './moveRig';
import {pokemonIdentity} from './pokemonIdentity';
import {pokemonPower} from './powerProfiles';

it.each([
 ['sma-SV49','Charizard-GX','Shiny rare','charizard'],
 ['swsh12.5-020','Radiant Charizard','Radiant Rare','charizard'],
 ['sma-SV59','Mewtwo-GX','Shiny rare','mewtwo'],
 ['sv04.5-233','Gardevoir ex','Special illustration rare','gardevoir'],
 ['sv04.5-092','Oddish','Shiny rare','oddish'],
 ['sv04.5-093','Gloom','Shiny rare','gloom'],
])('uses the exact shipped shiny skin and its own playable skeletal rig for %s',(id,name,rarity,species)=>{
 const image=specialPokemon({id,name,rarity,value:10000,weight:1,number:'1',image:'/card.webp'},100,artwork);
 expect(image).toBe(`/assets/pokemon/${species}-shiny.png`);
 const key=`${species}-shiny`,model=(models as any)[key],bytes=readFileSync(new URL('../../public'+model.path,import.meta.url));
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(model.optimization.sha256);
 const jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 const animations=gltf.animations.map((a:any)=>a.name),nodes=gltf.nodes.map((n:any)=>n.name.toLowerCase().replace(/ /g,'_'));
 for(const clip of [model.idle,model.attack,model.enter])expect(animations).toContain(clip);
 expect(gltf.skins.length).toBeGreaterThan(0);
 for(const emitter of moveRigs[key].emitters)expect(nodes).toContain(emitter.bone);
});
it('keeps ordinary ex and Dynamax species separate from actual body-changing forms',()=>{
 expect(pokemonIdentity({id:'sv03.5-199',name:'Charizard ex',rarity:'Special illustration rare'}).artworkKey).toBe('Charizard');
 expect(pokemonIdentity({id:'swsh7-218',name:'Rayquaza VMAX',rarity:'Rare'})).toMatchObject({species:'Rayquaza',form:'dynamax',artworkKey:'Rayquaza'});
 expect(pokemonIdentity({id:'swsh8-271',name:'Gengar VMAX',rarity:'Rare'}).artworkKey).toBe('Gigantamax Gengar');
 expect(pokemonIdentity({id:'sv04.5-059',name:'Paldean Clodsire ex',rarity:'Double rare'}).artworkKey).toBe('Clodsire');
});
it.each([
 ['sv03-223','Charizard ex','Special illustration rare','charizard-tera-dark'],
 ['sv04.5-234','Charizard ex','Special illustration rare','charizard-shiny-tera-dark'],
 ['sv03-066','Tyranitar ex','Double rare','tyranitar-tera-electric'],
 ['sv03-159','Dragonite ex','Double rare','dragonite-tera-dragon'],
 ['sv04.5-002','Forretress ex','Double rare','forretress-tera-grass'],
 ['swsh8-271','Gengar VMAX','Rare','gengar-gigantamax'],
 ['swsh7-123','Duraludon VMAX','Rare','duraludon-gigantamax'],
 ['swsh11tg-TG17','Pikachu VMAX','Rare','pikachu-gigantamax'],
 ['swsh11-186','Giratina V','Rare','giratina-origin'],
 ['sv04.5-232','Mew ex','Special illustration rare','mew-shiny'],
 ['sma-SV69','Umbreon-GX','Shiny rare','umbreon-shiny'],
 ['swsh12-059','Radiant Alakazam','Radiant Rare','alakazam-shiny'],
 ['sv04.5-058','Paldean Wooper','Common','wooper-paldean'],
])('provides a complete animated exact-form reveal instead of card-only for %s',(id,name,rarity,slug)=>{
 const image=specialPokemon({id,name,rarity,value:10000,weight:1,number:'1',image:'/card.webp'},0,artwork);
 expect(image).toBe(`/assets/pokemon/${slug}.png`);
 expect(pokemonPower(image!).species).toBe(slug.split('-')[0]);
 const model=(models as any)[slug];expect(model).toBeDefined();
 const bytes=readFileSync(new URL('../../public'+model.path,import.meta.url)),jsonLength=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(model.optimization.sha256);
 expect(gltf.skins.length).toBeGreaterThan(0);expect(gltf.images.length).toBeGreaterThan(0);
 for(const clip of [model.idle,model.attack,model.enter])expect(gltf.animations.map((a:any)=>a.name)).toContain(clip);
 for(const emitter of moveRigs[slug].emitters)expect(gltf.nodes.map((n:any)=>n.name?.toLowerCase().replace(/ /g,'_'))).toContain(emitter.bone);
 if(slug.includes('-tera-')){expect(model.tera).toBeDefined();const crown=readFileSync(new URL('../../public'+model.tera.path,import.meta.url));expect(createHash('sha256').update(crown).digest('hex')).toBe(model.tera.sha256);}
});
