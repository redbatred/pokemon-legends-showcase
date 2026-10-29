import { describe,it,expect } from 'vitest';
import { renderResolution, pageWindow, gameLayout, cardTrayLayout } from './rendering';
describe('bounded game rendering',()=>{
 it('caps render pixels on large high-density displays',()=>{
  const r=renderResolution(3840,2160,3,false);
  expect(3840*2160*r*r).toBeLessThanOrEqual(4_500_001);
 });
 it('keeps small high-density screens crisp without exceeding the density cap',()=>{
  expect(renderResolution(390,700,3,false)).toBe(2.5);
  expect(renderResolution(390,700,1,false)).toBe(1);
 });
 it('keeps narrow phones stacked and reserves a full caption above reveal controls',()=>{
  const narrow=gameLayout(360,540,true),landscape=gameLayout(568,320,true);
  expect(narrow.compact).toBe(false);
  expect(narrow.dockTop-narrow.actionTop).toBeGreaterThanOrEqual(72);
  expect(landscape.compact).toBe(true);
  for(const size of [[390,700],[360,540],[568,320],[844,390],[1280,720]]){
   const layout=gameLayout(size[0],size[1],true);
   expect(layout.worldY+217.5*layout.scale).toBeLessThan(layout.actionTop);
  }
 });
 it('lands flying cards exactly inside the visible strip on phone and desktop',()=>{
  for(const [w,h] of [[360,540],[390,700],[568,320],[1280,720]])for(let index=0;index<11;index++){
   const tray=cardTrayLayout(w,h,index),slot=tray.slot(index);
   expect(slot.x-tray.cardWidth/2).toBeGreaterThanOrEqual(tray.viewportX-.01);
   expect(slot.x+tray.cardWidth/2).toBeLessThanOrEqual(w-tray.viewportX+.01);
   expect(slot.y+tray.cardHeight/2).toBeLessThan(h);
  }
 });
 it('limits collection pages and clamps stale page indices after filtering',()=>{
  expect(pageWindow(25,12,4)).toEqual({page:2,pages:3,start:24,end:25});
  expect(pageWindow(0,12,4)).toEqual({page:0,pages:1,start:0,end:0});
  expect(pageWindow(250,12,1)).toEqual({page:1,pages:21,start:12,end:24});
 });
});

it('renders static detail panels at native retina density while bounding active scenes',()=>{expect(renderResolution(1920,1080,2,false,true)).toBe(2);expect(renderResolution(1920,1080,2,false)).toBeGreaterThan(1.4);expect(renderResolution(390,780,3,true,true)).toBe(1);});
