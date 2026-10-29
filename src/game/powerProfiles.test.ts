import { expect,it } from 'vitest';
import artwork from '../../public/assets/pokemon/manifest.json';
import { pokemonPower } from './powerProfiles';
it('assigns a cry and an elemental performance to all supported Pokemon',()=>{
 for(const {image,dexId} of Object.values(artwork)){const p=pokemonPower(image);expect(p.dexId).toBe(dexId);expect(p.cue).toBeTruthy();expect(p.color).toBeGreaterThan(0);}
 expect(pokemonPower('/assets/pokemon/charizard.png').kind).toBe('fire');
 expect(pokemonPower('/assets/pokemon/pikachu.png').kind).toBe('electric');
 expect(pokemonPower('/assets/pokemon/blastoise.png').kind).toBe('water');
 expect(pokemonPower('/assets/pokemon/mewtwo.png').kind).toBe('psychic');
});
it('does not invent a Pokemon cry for unknown artwork',()=>expect(pokemonPower('/missing.png').dexId).toBeNull());
it('uses Paldean Wooper’s form-specific cry while keeping its national species identity',()=>{
 expect(pokemonPower('/assets/pokemon/wooper-paldean.png')).toMatchObject({species:'wooper',dexId:194,cryId:10253,cue:'ground',kind:'ground'});
});
it('routes the expanded species to their distinct attack forms and sampled cues',()=>{
 const cases=[['mewtwo','wave','psystrike'],['alakazam','wave','psychic'],['lugia','beam','aeroblast'],['dragonite','beam','hyperbeam'],['gengar','orb','shadowball'],['mew','sphere','psychic'],['venusaur','petals','petals'],['eevee','stars','swift'],['vaporeon','pulse','waterpulse'],['gyarados','stream','hydropump']];
 for(const [name,move,cue] of cases){const p=pokemonPower(`/assets/pokemon/${name}.png`);expect(p.move).toBe(move);expect(p.cue).toBe(cue);}
});

it('gives every eligible species an explicit recorded move and a deliberate entrance',async()=>{
 const sounds=(await import('../../public/assets/audio-v6/cues.json')).default;
 const routes=(await import('../../public/assets/audio-v6/species-cues.json')).default;
 const {performanceProfile}=await import('./performanceProfiles');
 const species=new Set(Object.values(artwork).map(entry=>pokemonPower(entry.image).species));
 expect(Object.keys(routes).sort()).toEqual([...species].sort());
 for(const entry of Object.values(artwork)){const p=pokemonPower(entry.image);expect(routes).toHaveProperty(p.species,p.cue);expect(sounds).toHaveProperty(p.cue);const scene=performanceProfile(p.species);expect(Number.isFinite(scene.lift)).toBe(true);expect(scene.cameraYaw).toBeGreaterThan(-60);expect(scene.cameraYaw).toBeLessThan(60);}
 expect(pokemonPower('/assets/pokemon/greninja.png').cue).toBe('watershuriken');
 expect(pokemonPower('/assets/pokemon/scizor.png').move).toBe('punch');
 expect(pokemonPower('/assets/pokemon/ninetales.png').move).toBe('firestar');
 expect(pokemonPower('/assets/pokemon/tyranitar.png').move).toBe('quake');
});

it('routes named prize cards to the matching elemental win',async()=>{const {cardPowerKind}=await import('./powerProfiles');expect(cardPowerKind('Charizard ex')).toBe('fire');expect(cardPowerKind('Blastoise VMAX')).toBe('water');expect(cardPowerKind('Pikachu V')).toBe('electric');expect(cardPowerKind('Radiant Alakazam')).toBe('psychic');});

it('preserves the species attack for shiny forms and uses the card’s Tera element for the win',async()=>{
 const {pokemonPower,cardPowerKind}=await import('./powerProfiles');
 expect(pokemonPower('/assets/pokemon/charizard-shiny.png').species).toBe('charizard');
 expect(pokemonPower('/assets/pokemon/charizard-shiny.png').kind).toBe('fire');
 expect(cardPowerKind('Charizard-GX')).toBe('fire');
 expect(cardPowerKind({id:'sv03-223',name:'Charizard ex',rarity:'Special illustration rare'})).toBe('dark');
 expect(cardPowerKind({id:'sv03-066',name:'Tyranitar ex',rarity:'Double rare'})).toBe('electric');
});
