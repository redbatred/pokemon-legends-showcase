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
