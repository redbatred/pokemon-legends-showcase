import {existsSync,readFileSync} from 'node:fs';
import {describe,expect,it} from 'vitest';
import {bonusFrameBox} from './bonusEncounter';

describe('bonus encounter frame',()=>{
 it('fills a screen of the shape the scene was loaded for',()=>{
  for(const [w,h] of [[390,844],[540,720],[1280,720],[1920,1080],[844,390]]){const box=bonusFrameBox(w,h,w/h);expect(box).toMatchObject({x:0,width:w,letterboxed:false});expect(Math.abs(box.height-h)).toBeLessThanOrEqual(1);expect(Math.abs(box.y)).toBeLessThanOrEqual(1);}
 });
 it('centres the largest box of the scene\'s shape when the screen has changed, and says so',()=>{
  const tall=bonusFrameBox(1280,720,.75);expect(tall).toEqual({x:370,y:0,width:540,height:720,letterboxed:true});
  const wide=bonusFrameBox(390,844,16/9);expect(wide.width).toBe(390);expect(wide.height).toBe(219);expect(wide.x).toBe(0);expect(wide.y).toBe(Math.round((844-219)/2));expect(wide.letterboxed).toBe(true);
 });
 it('never exceeds the screen',()=>{
  for(const aspect of [.46,.5625,.75,1,1.44,1.78,2.33])for(const [w,h] of [[360,640],[768,1024],[800,571],[1920,1080]]){const box=bonusFrameBox(w,h,aspect);expect(box.width).toBeLessThanOrEqual(w);expect(box.height).toBeLessThanOrEqual(h+1);expect(box.x).toBeGreaterThanOrEqual(0);}
 });
});

describe('bonus scene files shipped with the build',()=>{
 const folder='output/capture-motion-v25/',ship:string[]=JSON.parse(readFileSync(folder+'ship.json','utf8'));
 it('lists only files that exist, once each',()=>{
  expect(new Set(ship).size).toBe(ship.length);
  for(const file of ship)expect(existsSync(folder+file),file).toBe(true);
 });
 it('ships the image pages of every atlas and both legendaries\' own files',()=>{
  // Art ships as lossless WebP: every atlas names WebP pages, and each one is shipped.
  for(const atlas of ship.filter(file=>file.endsWith('.atlas'))){
   const pages=readFileSync(folder+atlas,'utf8').split('\n').map(l=>l.trim()).filter(l=>/\.(png|webp)$/.test(l));expect(pages.length,atlas).toBeGreaterThan(0);
   for(const page of pages){expect(page,`${atlas} page`).toMatch(/\.webp$/);expect(ship,`${atlas} page ${page}`).toContain('assets/'+page);}
  }
  expect(ship.filter(file=>file.endsWith('.png'))).toEqual([]);
  // Music ships as FLAC, with the WAV it was made from beside it for a browser that cannot decode FLAC.
  for(const name of ['music-loop','capture-score','escape-score','lugia-capture-score','lugia-escape-score'])for(const type of ['flac','wav'])expect(ship).toContain(`audio/${name}.${type}`);
  for(const file of ['assets/lugia-conversion.json','assets/mewtwo-conversion.json','assets/receiver.webp','assets/cave.webp','assets/smoke-sequence.webp'])expect(ship).toContain(file);
  // Every voice line in the bank can be drawn, so every one is shipped.
  for(const id of Object.keys(JSON.parse(readFileSync(folder+'audio/rocket/bank.json','utf8'))))expect(ship).toContain(`audio/rocket/${id}.ogg`);
 });
});
