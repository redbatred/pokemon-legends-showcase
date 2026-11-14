import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {expect,it} from 'vitest';
import manifest from '../../public/assets/audio-showdown-v8/cues.json';

function samples(key:keyof typeof manifest){
 const cue=manifest[key];
 const file=readFileSync(new URL(`../../public${cue.files.wav}`,import.meta.url));
 expect(file.toString('ascii',0,4)).toBe('RIFF');expect(file.toString('ascii',8,12)).toBe('WAVE');
 expect(file.readUInt16LE(20)).toBe(1);expect(file.readUInt16LE(22)).toBe(2);
 expect(file.readUInt32LE(24)).toBe(48000);expect(file.readUInt16LE(34)).toBe(16);
 expect(createHash('sha256').update(file).digest('hex')).toBe(cue.sha256);
 return Array.from({length:(file.length-44)/2},(_,i)=>file.readInt16LE(44+i*2)/32768);
}

it('ships six original stereo PCM cues with measured lengths, headroom, and stereo detail',()=>{
 for(const key of Object.keys(manifest) as (keyof typeof manifest)[]){
  const cue=manifest[key],pcm=samples(key);expect(pcm.length/96000).toBe(cue.duration);
  let peak=0,difference=0;for(let i=0;i<pcm.length;i+=2){peak=Math.max(peak,Math.abs(pcm[i]),Math.abs(pcm[i+1]));difference+=Math.abs(pcm[i]-pcm[i+1]);}
  expect(20*Math.log10(peak)).toBeCloseTo(cue.peakDbfs,2);expect(peak).toBeLessThan(.67);
  expect(difference/pcm.length).toBeGreaterThan(.0005);expect(cue.gain).toBeLessThanOrEqual(.58);
  expect(pcm[0]).toBe(0);expect(pcm.at(-1)).toBe(0);
 }
 expect(manifest['vault-charge'].duration).toBe(1);
 expect(manifest['vault-hit'].duration).toBeLessThan(1);expect(manifest['vault-hit-heavy'].duration).toBeLessThan(1);
});

it('places a silent breath between inward suction and the precisely timed final fracture',()=>{
 const pcm=samples('vault-break');
 const energy=(start:number,end:number)=>pcm.slice(Math.round(start*96000),Math.round(end*96000)).reduce((sum,v)=>sum+v*v,0)/((end-start)*96000);
 expect(manifest['vault-break'].impactOffset).toBe(.2);
 expect(energy(.12,.17)).toBeGreaterThan(.001);expect(energy(.181,.199)).toBe(0);
 expect(energy(.2,.26)).toBeGreaterThan(energy(.12,.17)*2);
 expect(energy(.4,.8)).toBeGreaterThan(.0001);
});
