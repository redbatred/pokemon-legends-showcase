import {afterEach,describe,expect,it,vi} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {readdirSync} from 'node:fs';
import {BonusPrefetch,bonusFiles,bonusName,pageFiles,sharedFiles} from './bonusPrefetch';

describe('files fetched ahead for the legendary encounter',()=>{
 const folder='output/capture-motion-v25/',ship:string[]=JSON.parse(readFileSync(folder+'ship.json','utf8'));
 it('takes the chosen legendary\'s music and conversion art and leaves the other\'s',()=>{
  const lugia=bonusFiles(ship,'lugia'),mewtwo=bonusFiles(ship,'mewtwo');
  for(const file of ['audio/lugia-capture-score.flac','audio/lugia-escape-score.flac','assets/lugia-conversion.atlas','assets/lugia-conversion.json','assets/lugia-conversion.webp']){expect(lugia).toContain(file);expect(mewtwo).not.toContain(file);}
  for(const file of ['audio/capture-score.flac','audio/escape-score.flac','assets/mewtwo-conversion.atlas','assets/mewtwo-conversion.json','assets/mewtwo-conversion.webp']){expect(mewtwo).toContain(file);expect(lugia).not.toContain(file);}
 });
 it('takes everything both encounters share, and never the WAV fallback',()=>{
  for(const species of ['lugia','mewtwo'] as const){
   const files=bonusFiles(ship,species);
   // The humanoid rig supplies the eye cut-in for both; the loop, the voice lines and the verdict sounds are shared too.
   for(const file of ['audio/music-loop.flac','assets/mewtwo.atlas','assets/mewtwo.webp','assets/lugia-eye-v27.atlas','assets/cave.webp','assets/receiver.webp','audio/rocket/bank.json','audio/verdict/se_go_ball_gotcha.wav'])expect(files,species).toContain(file);
   expect(files.filter(file=>/^audio\/[^/]+\.wav$/.test(file))).toEqual([]);
   for(const file of files)expect(existsSync(folder+file),file).toBe(true);
   // Fetching one legendary skips about a tenth of the art and two scores.
   expect(files.length).toBeLessThan(ship.length-8);
  }
 });
 it('also takes the game assets the encounter loads',()=>{
  const lugia=sharedFiles('lugia'),mewtwo=sharedFiles('mewtwo');
  expect(lugia).toContain('/assets/pokemon-3d/lugia.glb');expect(lugia).not.toContain('/assets/pokemon-3d/mewtwo.glb');expect(mewtwo).toContain('/assets/sets/crown-zenith/cards/GG44.webp');
  for(const file of [...lugia,...mewtwo])expect(existsSync('public'+file),file).toBe(true);
  // Every game asset the scene's own code names outright is on the list (the legendaries' models and cards come from their profiles).
  const named=new Set<string>();for(const file of readdirSync(folder).filter(name=>name.endsWith('.ts')&&!name.endsWith('.test.ts')))for(const match of readFileSync(folder+file,'utf8').matchAll(/'(\/assets\/[^']+\.(?:png|webp|json|atlas|glb))'/g))named.add(match[1]);
  expect(named.size).toBeGreaterThan(5);
  for(const file of named)expect([...lugia,...mewtwo],file).toContain(file);
 });
 it('names the legendary for the loader',()=>{expect(bonusName('lugia')).toBe('Lugia');expect(bonusName('mewtwo')).toBe('Mewtwo');});
 it('finds the scripts and styles of a built page once each',()=>{
  const html='<link rel="modulepreload" crossorigin href="/assets/pixi-AbC1.js"><script type="module" crossorigin src="/assets/bonus-Xy9.js"></script><link rel="stylesheet" href="/assets/bonus-Q1.css"><link rel="modulepreload" href="/assets/pixi-AbC1.js"><img src="/assets/a.png">';
  expect(pageFiles(html)).toEqual(['/assets/pixi-AbC1.js','/assets/bonus-Xy9.js','/assets/bonus-Q1.css']);
 });
});

describe('fetching the encounter ahead of time',()=>{
 const ship:string[]=JSON.parse(readFileSync('output/capture-motion-v25/ship.json','utf8')),scene='/output/capture-motion-v25/';
 afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
 function browser(connection?:{saveData?:boolean;effectiveType?:string}){
  const asked:string[]=[];let open=0,most=0;vi.useFakeTimers();vi.stubGlobal('navigator',{connection});
  vi.stubGlobal('fetch',vi.fn(async(url:string)=>{asked.push(url);open++;most=Math.max(most,open);await new Promise(resolve=>setTimeout(resolve,20));open--;
   return {ok:true,json:async()=>ship,text:async()=>'<script type="module" src="/assets/bonus-Ab12.js"></script>',arrayBuffer:async()=>new ArrayBuffer(0)};}));
  return {asked,most:()=>most};
 }
 it('fetches the page\'s script, the legendary\'s files and the shared game assets once each, a few at a time',async()=>{
  const net=browser({effectiveType:'4g'}),prefetch=new BonusPrefetch(()=>false);
  void prefetch.warm('lugia',0);await vi.advanceTimersByTimeAsync(5000);
  for(const url of ['/assets/bonus-Ab12.js',scene+'audio/lugia-capture-score.flac',scene+'assets/cave.webp','/assets/pokemon-3d/lugia.glb','/assets/capture-seals-v23/card-seal.png'])expect(net.asked.filter(asked=>asked===url),url).toHaveLength(1);
  expect(net.asked).not.toContain(scene+'audio/capture-score.flac');expect(net.asked.some(url=>url.endsWith('-score.wav'))).toBe(false);
  expect(net.asked).toHaveLength(2+1+bonusFiles(ship,'lugia').length+sharedFiles('lugia').length);expect(net.most()).toBeLessThanOrEqual(3);
  // Choosing the other legendary later fetches only what is new for it.
  const before=net.asked.length;void prefetch.warm('mewtwo',0);await vi.advanceTimersByTimeAsync(5000);const added=net.asked.slice(before);
  expect(added).toContain(scene+'audio/capture-score.flac');expect(added).toContain('/assets/pokemon-3d/mewtwo.glb');expect(added).not.toContain(scene+'assets/cave.webp');expect(added).not.toContain('/assets/bonus-Ab12.js');
 });
 it('starts nothing new once the encounter itself is loading',async()=>{
  let loading=false;const net=browser(),prefetch=new BonusPrefetch(()=>loading);
  void prefetch.warm('lugia',0);await vi.advanceTimersByTimeAsync(330);const started=net.asked.length;expect(started).toBeGreaterThan(2);
  loading=true;await vi.advanceTimersByTimeAsync(5000);expect(net.asked.length).toBeLessThanOrEqual(started+3);
 });
 it('fetches nothing ahead on a data-saver or 2G connection',async()=>{
  for(const connection of [{saveData:true},{effectiveType:'2g'},{effectiveType:'slow-2g'}]){
   const net=browser(connection);void new BonusPrefetch(()=>false).warm('lugia',0);await vi.advanceTimersByTimeAsync(5000);expect(net.asked,JSON.stringify(connection)).toEqual([]);vi.unstubAllGlobals();vi.useRealTimers();
  }
 });
});
