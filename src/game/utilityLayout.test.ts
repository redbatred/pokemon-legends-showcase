import {expect,it} from 'vitest';
import {utilityLayout} from './utilityLayout';
import {gameLayout,revealControlsLayout} from './rendering';
import {packGridLayout,packTileLayout} from './packGrid';
const sizes=[[320,568],[390,780],[430,932],[568,320],[844,390],[768,1024],[1280,720],[1920,1080]];
it('gives both utilities separate reachable bounds outside the stage on every layout',()=>{
 for(const [w,h] of sizes)for(const opening of [false,true]){
  const l=gameLayout(w,h,opening),u=utilityLayout(w,h,opening);
  for(const r of [u.turbo,u.auto]){expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(w);expect(r.y+r.height).toBeLessThanOrEqual(l.dockTop);if(l.sideControls)expect(r.x+r.width).toBeLessThanOrEqual((w-l.stageWidth)/2-4);else expect(r.y+r.height).toBeLessThan(l.top);}
  const a=u.turbo,b=u.auto;expect(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y).toBe(true);
 }
});
it('reserves separate artwork, two-line names and centered price bands',()=>{
 for(const [w,h] of sizes){const s=packGridLayout(w,h).slot(0),p=packTileLayout(s.width,s.height);expect(p.artHeight).toBeGreaterThan(24);expect(p.nameY).toBeGreaterThanOrEqual(p.artHeight+5);expect(p.priceY).toBeGreaterThanOrEqual(p.nameY+p.nameHeight+3);expect(p.priceY+p.priceHeight).toBeLessThanOrEqual(s.height);}
});

it('groups utilities near the header and puts Next left of the stage',()=>{
 for(const [w,h] of sizes){const l=gameLayout(w,h,true),u=utilityLayout(w,h,true),c=revealControlsLayout(w,h);
  expect(u.turbo.y+u.turbo.height).toBeLessThanOrEqual(l.compact?140:190);expect(u.auto.y).toBe(u.turbo.y);
  expect(c.next.x).toBeLessThan(w/2);expect(c.all.x).toBeGreaterThan(w/2);expect(c.next.size).toBeLessThanOrEqual(80);
  if(l.sideControls){expect(c.next.x+c.next.size/2+8).toBeLessThanOrEqual((w-l.stageWidth)/2);expect(u.auto.y+u.auto.height+8).toBeLessThan(c.next.y-c.next.size/2);}
 }
});
