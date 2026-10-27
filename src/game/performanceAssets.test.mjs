import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import manifest from '../../public/assets/pokemon-3d/manifest.json';
import cues from '../../public/assets/pokemon-3d/power-cues.json';
it('ships the genuine upright Charizard performance alongside its original clips and matching cue hash',()=>{
 const bytes=readFileSync(new URL('../../public/assets/pokemon-3d/charizard.glb',import.meta.url));
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString()),names=gltf.animations.map((a)=>a.name);
 expect(names).toEqual(expect.arrayContaining(['idle','attack','happy']));expect(manifest.charizard.attack).toBe('happy');expect(cues.charizard.attackClip).toBe('happy');
 expect(createHash('sha256').update(bytes).digest('hex')).toBe(cues.charizard.sourceGlbSha256);
 expect(gltf.animations.find((a)=>a.name==='happy').channels.length).toBeGreaterThan(300);
 expect(cues.charizard.recoveryEnd).toBeCloseTo(5.875);expect(cues.charizard.powerAt).toBeLessThan(cues.charizard.end);
});
