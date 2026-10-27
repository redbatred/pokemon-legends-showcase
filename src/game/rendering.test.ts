import { describe,it,expect } from 'vitest';
import { renderResolution, pageWindow, gameLayout } from './rendering';
describe('bounded game rendering',()=>{
 it('caps render pixels on large high-density displays',()=>{
  const r=renderResolution(3840,2160,3,false);
  expect(3840*2160*r*r).toBeLessThanOrEqual(1_700_001);
 });
 it('keeps small high-density screens crisp without exceeding the density cap',()=>{
  expect(renderResolution(390,700,3,false)).toBe(1.5);
  expect(renderResolution(390,700,1,false)).toBe(1);
 });
 it('keeps narrow phones stacked and reserves a full caption above reveal controls',()=>{
  const narrow=gameLayout(360,540,true),landscape=gameLayout(568,320,true);
  expect(narrow.compact).toBe(false);
  expect(narrow.dockTop-narrow.actionTop).toBe(132);
  expect(landscape.compact).toBe(true);
  for(const size of [[390,700],[360,540],[568,320],[844,390],[1280,720]]){
   const layout=gameLayout(size[0],size[1],true);
   expect(layout.worldY+217.5*layout.scale).toBeLessThan(layout.actionTop);
  }
 });
 it('limits collection pages and clamps stale page indices after filtering',()=>{
  expect(pageWindow(25,12,4)).toEqual({page:2,pages:3,start:24,end:25});
  expect(pageWindow(0,12,4)).toEqual({page:0,pages:1,start:0,end:0});
  expect(pageWindow(250,12,1)).toEqual({page:1,pages:21,start:12,end:24});
 });
});
